<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';
	import Header from '$lib/components/Header.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Loader2, MapPin, List, X, Phone, Mail, ExternalLink,
		Navigation, SlidersHorizontal, Instagram
	} from 'lucide-svelte';
	import {
		DEFAULT_CATEGORIES,
		DEPARTMENTS,
		type Department
	} from '$lib/domain/types';

	interface MapProvider {
		id: string;
		business_name: string;
		department: string;
		neighborhood: string | null;
		address: string | null;
		location_lat: number;
		location_lng: number;
		contact_phone: string | null;
		contact_email: string | null;
		social_instagram: string | null;
		logo_url: string | null;
		description: string | null;
		categories: string[];
	}

	// Map state
	let mapContainer: HTMLDivElement;
	let map: L.Map | null = null;
	let markerLayer: L.LayerGroup | null = null;
	let L: typeof import('leaflet') | null = null;
	let mapReady = $state(false);
	let loading = $state(true);
	let loadingProviders = $state(false);

	// Provider state - keyed by ID for dedup
	let providersMap = $state<Map<string, MapProvider>>(new Map());
	let providers = $derived(Array.from(providersMap.values()));
	let markerMap = new Map<string, L.Marker>();

	// Geolocation state
	let userLocation = $state<{ lat: number; lng: number } | null>(null);
	let locationDenied = $state(false);
	let locationRequested = $state(false);

	// Filters
	let selectedDepartment = $state<Department | ''>('');
	let selectedCategory = $state('');
	let selectedType = $state<'service' | 'business' | ''>('');
	let showFilters = $state(false);

	// Selected provider for popup
	let selectedProvider = $state<MapProvider | null>(null);

	// Debounce timer
	let moveEndTimeout: ReturnType<typeof setTimeout>;

	// Constants
	const uruguayCenter: [number, number] = [-32.5, -56.0];
	const defaultZoom = 7;
	const geolocatedZoom = 14;

	// Tailwind color class to hex mapping
	const colorMap: Record<string, string> = {
		'bg-yellow-500': '#eab308', 'bg-blue-500': '#3b82f6', 'bg-orange-500': '#f97316',
		'bg-purple-500': '#a855f7', 'bg-amber-600': '#d97706', 'bg-green-500': '#22c55e',
		'bg-zinc-600': '#52525b', 'bg-slate-600': '#475569', 'bg-gray-600': '#4b5563',
		'bg-sky-500': '#0ea5e9', 'bg-cyan-500': '#06b6d4', 'bg-red-400': '#f87171',
		'bg-emerald-500': '#10b981', 'bg-gray-700': '#374151', 'bg-cyan-600': '#0891b2',
		'bg-amber-700': '#b45309', 'bg-yellow-600': '#ca8a04', 'bg-red-600': '#dc2626',
		'bg-green-600': '#16a34a', 'bg-emerald-600': '#059669', 'bg-stone-600': '#57534e',
		'bg-pink-500': '#ec4899', 'bg-lime-500': '#84cc16', 'bg-orange-400': '#fb923c',
		'bg-blue-400': '#60a5fa', 'bg-violet-500': '#8b5cf6', 'bg-teal-500': '#14b8a6',
		'bg-zinc-500': '#71717a', 'bg-indigo-500': '#6366f1', 'bg-rose-500': '#f43f5e',
		'bg-amber-500': '#f59e0b', 'bg-sky-600': '#0284c7', 'bg-indigo-600': '#4f46e5',
		'bg-stone-500': '#78716c', 'bg-neutral-600': '#525252', 'bg-zinc-700': '#3f3f46',
		'bg-blue-600': '#2563eb', 'bg-gray-500': '#6b7280'
	};

	function getCategoryInfo(categoryName: string): { color: string; icon: string } {
		const cat = DEFAULT_CATEGORIES.find(c => c.name === categoryName);
		if (!cat) return { color: '#3b82f6', icon: 'map-pin' };
		const hex = colorMap[cat.color] || '#3b82f6';
		// Convert PascalCase icon name to kebab-case for lucide-static
		const kebab = cat.icon.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/(\D)(\d)/g, '$1-$2').toLowerCase();
		return { color: hex, icon: kebab };
	}

	function createMarkerIcon(color: string, iconName: string): L.DivIcon {
		if (!L) return null as unknown as L.DivIcon;
		return L.divIcon({
			className: '',
			iconSize: [32, 32],
			iconAnchor: [16, 16],
			popupAnchor: [0, -18],
			html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);">
				<img src="https://unpkg.com/lucide-static@latest/icons/${iconName}.svg" width="16" height="16" style="filter:brightness(0) invert(1);" alt="" />
			</div>`
		});
	}

	// Category helpers
	const categories = DEFAULT_CATEGORIES.filter((c) => c.is_active);
	const serviceCategories = categories.filter(
		(c) => c.category_type === 'service' || c.category_type === 'both'
	);
	const businessCategories = categories.filter(
		(c) => c.category_type === 'business' || c.category_type === 'both'
	);

	let filteredCategories = $derived(
		selectedType === 'service' ? serviceCategories :
		selectedType === 'business' ? businessCategories :
		categories
	);

	let activeFilterCount = $derived(
		[selectedDepartment, selectedCategory, selectedType].filter(Boolean).length
	);

	// Build list URL with current filters
	let listUrl = $derived.by(() => {
		const params = new URLSearchParams();
		if (selectedDepartment) params.set('departamento', selectedDepartment);
		if (selectedCategory) params.set('categoria', selectedCategory);
		if (selectedType) params.set('tipo', selectedType);
		const qs = params.toString();
		return qs ? `/directorio/lista?${qs}` : '/directorio/lista';
	});

	// Geolocation
	function requestGeolocation(): Promise<GeolocationPosition | null> {
		return new Promise((resolve) => {
			if (!navigator.geolocation) {
				locationDenied = true;
				resolve(null);
				return;
			}
			locationRequested = true;
			navigator.geolocation.getCurrentPosition(
				(position) => {
					userLocation = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					resolve(position);
				},
				() => {
					locationDenied = true;
					resolve(null);
				},
				{ timeout: 8000, maximumAge: 300000 }
			);
		});
	}

	// Fetch providers within visible bounds
	async function fetchProvidersInBounds(bounds?: L.LatLngBounds) {
		if (!bounds && !map) return;

		const b = bounds || map!.getBounds();
		const south = b.getSouth();
		const north = b.getNorth();
		const west = b.getWest();
		const east = b.getEast();

		loadingProviders = true;

		// Category filter logic
		let categoryNames: string[] | null = null;
		if (selectedCategory) {
			categoryNames = [selectedCategory];
		} else if (selectedType) {
			categoryNames = (selectedType === 'service' ? serviceCategories : businessCategories)
				.map(c => c.name);
		}

		const selectQuery = categoryNames
			? `id, business_name, department, neighborhood, address, location_lat, location_lng, contact_phone, contact_email, social_instagram, logo_url, description, mb_provider_categories!inner(category_name)`
			: `id, business_name, department, neighborhood, address, location_lat, location_lng, contact_phone, contact_email, social_instagram, logo_url, description, mb_provider_categories(category_name)`;

		let query = supabase
			.from('mb_providers')
			.select(selectQuery)
			.eq('is_active', true)
			.not('location_lat', 'is', null)
			.not('location_lng', 'is', null)
			.gte('location_lat', south)
			.lte('location_lat', north)
			.gte('location_lng', west)
			.lte('location_lng', east);

		if (selectedDepartment) {
			query = query.eq('department', selectedDepartment);
		}

		if (categoryNames) {
			query = query.in('mb_provider_categories.category_name', categoryNames);
		}

		query = query.limit(500);

		const { data, error } = await query;

		if (error) {
			console.error('Error fetching providers:', error);
		} else if (data) {
			for (const p of data) {
				const id = p.id as string;
				if (!providersMap.has(id)) {
					const provider: MapProvider = {
						id,
						business_name: p.business_name as string,
						department: p.department as string,
						neighborhood: p.neighborhood as string | null,
						address: p.address as string | null,
						location_lat: p.location_lat as number,
						location_lng: p.location_lng as number,
						contact_phone: p.contact_phone as string | null,
						contact_email: p.contact_email as string | null,
						social_instagram: p.social_instagram as string | null,
						logo_url: p.logo_url as string | null,
						description: p.description as string | null,
						categories: ((p as Record<string, unknown>).mb_provider_categories as Array<{ category_name: string }> || [])
							.map(c => c.category_name)
					};
					providersMap.set(id, provider);
					addMarker(provider);
				}
			}
			// Trigger reactivity
			providersMap = new Map(providersMap);
		}

		loadingProviders = false;
	}

	// Marker management
	function addMarker(provider: MapProvider) {
		if (!map || !L || !markerLayer) return;
		if (markerMap.has(provider.id)) return;

		const catInfo = getCategoryInfo(provider.categories[0] || '');
		const icon = createMarkerIcon(catInfo.color, catInfo.icon);
		const marker = L.marker([provider.location_lat, provider.location_lng], { icon });
		marker.on('click', () => {
			selectedProvider = provider;
		});
		markerLayer.addLayer(marker);
		markerMap.set(provider.id, marker);
	}

	function clearAllMarkers() {
		if (markerLayer) {
			markerLayer.clearLayers();
		}
		markerMap.clear();
		providersMap = new Map();
		selectedProvider = null;
	}

	// Filter handlers
	function handleFilterChange() {
		clearAllMarkers();
		if (map) {
			fetchProvidersInBounds();
		}
	}

	function clearFilters() {
		selectedDepartment = '';
		selectedCategory = '';
		selectedType = '';
		handleFilterChange();
	}

	// Map move handler (debounced)
	function onMapMoveEnd() {
		clearTimeout(moveEndTimeout);
		moveEndTimeout = setTimeout(() => {
			fetchProvidersInBounds();
		}, 300);
	}

	function centerOnUser() {
		if (userLocation && map) {
			map.setView([userLocation.lat, userLocation.lng], geolocatedZoom);
		}
	}

	function closePopup() {
		selectedProvider = null;
	}

	// Read initial filters from URL params
	function readUrlFilters() {
		const params = $page.url.searchParams;
		const dept = params.get('departamento');
		const cat = params.get('categoria');
		const tipo = params.get('tipo');
		if (dept) selectedDepartment = dept as Department;
		if (cat) selectedCategory = cat;
		if (tipo === 'service' || tipo === 'business') selectedType = tipo;
	}

	// Map initialization
	async function initMap() {
		if (!browser || !mapContainer) return;

		readUrlFilters();

		L = await import('leaflet');

		map = L.map(mapContainer).setView(uruguayCenter, defaultZoom);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		// Marker layer group
		markerLayer = L.layerGroup().addTo(map);

		// Close popup on map click
		map.on('click', () => {
			selectedProvider = null;
		});

		// Progressive loading on pan/zoom
		map.on('moveend', onMapMoveEnd);

		mapReady = true;

		// Try geolocation
		const position = await requestGeolocation();

		if (position) {
			const { latitude, longitude } = position.coords;
			map.setView([latitude, longitude], geolocatedZoom);

			// User location blue dot
			L.circleMarker([latitude, longitude], {
				radius: 8,
				fillColor: '#2563eb',
				fillOpacity: 1,
				color: '#ffffff',
				weight: 2
			}).addTo(map);

		}

		loading = false;
		await fetchProvidersInBounds();
	}

	onMount(() => {
		initMap();

		return () => {
			clearTimeout(moveEndTimeout);
			if (map) {
				map.off('moveend', onMapMoveEnd);
				map.remove();
			}
		};
	});
</script>

<svelte:head>
	<title>Mapa del Directorio | Mi Barrio</title>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<Header items={[{ label: 'Directorio', href: '/directorio' }, { label: 'Mapa', href: '/directorio/mapa' }]} />

	<div class="relative h-[calc(100vh-64px-64px)] md:h-[calc(100vh-64px)]">
		<!-- Loading overlay -->
		{#if loading}
			<div class="absolute inset-0 z-[1001] bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
				<div class="text-center">
					<Loader2 class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
					<p class="text-gray-600 dark:text-gray-400">
						{#if locationRequested && !userLocation && !locationDenied}
							Obteniendo tu ubicación...
						{:else}
							Cargando mapa...
						{/if}
					</p>
				</div>
			</div>
		{/if}

		<!-- Map container -->
		<div bind:this={mapContainer} class="w-full h-full"></div>

		<!-- Top Right Controls (Lista + Filtros) -->
		<div class="absolute top-3 right-3 z-[1200] flex gap-2 pointer-events-auto">
			<a
				href={listUrl}
				class="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
			>
				<List class="h-4 w-4" />
				<span>Lista</span>
			</a>

			<button
				onclick={() => showFilters = !showFilters}
				class="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
			>
				<SlidersHorizontal class="h-4 w-4" />
				<span>Filtros</span>
				{#if activeFilterCount > 0}
					<span class="bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
						{activeFilterCount}
					</span>
				{/if}
			</button>
		</div>

		<!-- Bottom Controls (count + locate me) -->
		<div class="absolute bottom-3 right-3 z-[1200] flex gap-2 pointer-events-auto">
			<div class="px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
				<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
					{#if loadingProviders}
						<Loader2 class="h-4 w-4 animate-spin text-primary-600" />
					{:else}
						<MapPin class="h-4 w-4 text-primary-600" />
					{/if}
					<span>{providers.length}</span>
				</div>
			</div>

			{#if userLocation}
				<button
					onclick={centerOnUser}
					class="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors text-sm"
				>
					<Navigation class="h-4 w-4" />
				</button>
			{/if}
		</div>

		<!-- Filter Dialog (Bottom Sheet on mobile, centered on desktop) -->
		{#if showFilters}
			<button
				type="button"
				class="fixed inset-0 bg-black/50 z-[1300] cursor-default"
				onclick={() => showFilters = false}
				aria-label="Cerrar filtros"
			></button>

			<div class="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[1301] bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl shadow-xl max-h-[70vh] flex flex-col pb-[env(safe-area-inset-bottom)]">
				<!-- Drag handle (mobile) -->
				<div class="md:hidden flex justify-center pt-3 pb-1">
					<div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
				</div>

				<!-- Header -->
				<div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
					<button
						type="button"
						onclick={() => showFilters = false}
						class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
					>
						<X class="h-5 w-5" />
					</button>
				</div>

				<!-- Content -->
				<div class="flex-1 overflow-y-auto p-4 space-y-5">
					<!-- Type -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
						<div class="flex flex-wrap gap-2">
							<button
								type="button"
								onclick={() => { selectedType = ''; selectedCategory = ''; }}
								class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedType === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}"
							>
								Todos
							</button>
							<button
								type="button"
								onclick={() => { selectedType = 'service'; selectedCategory = ''; }}
								class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedType === 'service' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}"
							>
								Profesionales
							</button>
							<button
								type="button"
								onclick={() => { selectedType = 'business'; selectedCategory = ''; }}
								class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedType === 'business' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}"
							>
								Comercios
							</button>
						</div>
					</div>

					<!-- Category -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
						<div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
							<button
								type="button"
								onclick={() => { selectedCategory = ''; }}
								class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {selectedCategory === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}"
							>
								Todas
							</button>
							{#each filteredCategories as cat (cat.name)}
								<button
									type="button"
									onclick={() => { selectedCategory = cat.name; }}
									class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {selectedCategory === cat.name ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}"
								>
									{cat.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Department -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Departamento</label>
						<select
							bind:value={selectedDepartment}
							class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500"
						>
							<option value="">Todo Uruguay</option>
							{#each DEPARTMENTS as dept (dept)}
								<option value={dept}>{dept}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Footer -->
				<div class="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
					<Button variant="outline" class="flex-1" onclick={clearFilters}>
						Limpiar
					</Button>
					<Button class="flex-1" onclick={() => { showFilters = false; handleFilterChange(); }}>
						Aplicar filtros
					</Button>
				</div>
			</div>
		{/if}

		<!-- Selected provider popup -->
		{#if selectedProvider}
			<div class="absolute bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-[1200] bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
				<div class="p-4">
					<div class="flex items-start gap-3">
						{#if selectedProvider.logo_url}
							<img
								src={selectedProvider.logo_url}
								alt={selectedProvider.business_name}
								class="w-14 h-14 rounded-lg object-cover flex-shrink-0"
							/>
						{:else}
							<div class="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
								<MapPin class="h-5 w-5 text-gray-400" />
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							<h3 class="font-semibold text-gray-900 dark:text-white truncate">
								{selectedProvider.business_name}
							</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								{selectedProvider.neighborhood ? `${selectedProvider.neighborhood}, ` : ''}{selectedProvider.department}
							</p>
							{#if selectedProvider.address}
								<p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
									{selectedProvider.address}
								</p>
							{/if}
						</div>
						<button
							onclick={closePopup}
							class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
						>
							<X class="h-5 w-5" />
						</button>
					</div>

					{#if selectedProvider.description}
						<p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
							{selectedProvider.description}
						</p>
					{/if}

					<div class="mt-3 flex flex-wrap gap-2">
						{#if selectedProvider.contact_phone}
							<a
								href="tel:{selectedProvider.contact_phone}"
								class="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
							>
								<Phone class="h-4 w-4" />
								Llamar
							</a>
						{/if}
						{#if selectedProvider.contact_email}
							<a
								href="mailto:{selectedProvider.contact_email}"
								class="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
							>
								<Mail class="h-4 w-4" />
								Email
							</a>
						{/if}
						{#if selectedProvider.social_instagram}
							<a
								href={selectedProvider.social_instagram}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-1 px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-lg text-sm hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
							>
								<Instagram class="h-4 w-4" />
								Instagram
							</a>
						{/if}
						<a
							href="/directorio/{selectedProvider.id}"
							class="flex items-center gap-1 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
						>
							<ExternalLink class="h-4 w-4" />
							Ver perfil
						</a>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
