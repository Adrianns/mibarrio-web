<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { supabase } from '$lib/supabase';
	import Header from '$lib/components/Header.svelte';
	import { Loader2, MapPin, List, Filter, X, Phone, Mail, ExternalLink, ChevronUp, ChevronDown } from 'lucide-svelte';

	interface Provider {
		id: string;
		business_name: string;
		department: string;
		neighborhood: string | null;
		address: string | null;
		location_lat: number;
		location_lng: number;
		contact_phone: string | null;
		contact_email: string | null;
		logo_url: string | null;
		description: string | null;
	}

	let providers = $state<Provider[]>([]);
	let loading = $state(true);
	let mapReady = $state(false);
	let mapContainer: HTMLDivElement;
	let map: L.Map | null = null;
	let markers: L.Marker[] = [];
	let L: typeof import('leaflet') | null = null;

	// Filters
	let selectedDepartment = $state<string>('all');
	let showFilters = $state(false);

	// Selected provider for popup
	let selectedProvider = $state<Provider | null>(null);

	const departments = [
		'Montevideo', 'Canelones', 'Maldonado', 'Colonia', 'San Jose',
		'Rocha', 'Paysandu', 'Salto', 'Rivera', 'Tacuarembo',
		'Cerro Largo', 'Treinta y Tres', 'Lavalleja', 'Florida', 'Durazno',
		'Rio Negro', 'Soriano', 'Flores', 'Artigas'
	];

	// Uruguay center coordinates
	const uruguayCenter: [number, number] = [-32.5, -56.0];
	const defaultZoom = 7;

	async function fetchProviders() {
		let query = supabase
			.from('mb_providers')
			.select(`
				id,
				business_name,
				department,
				neighborhood,
				address,
				location_lat,
				location_lng,
				contact_phone,
				contact_email,
				logo_url,
				description
			`)
			.eq('is_active', true)
			.not('location_lat', 'is', null)
			.not('location_lng', 'is', null);

		if (selectedDepartment !== 'all') {
			query = query.eq('department', selectedDepartment);
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error fetching providers:', error);
		} else {
			providers = data || [];
		}

		updateMarkers();
	}

	function updateMarkers() {
		if (!map || !L) return;

		// Clear existing markers
		markers.forEach(marker => marker.remove());
		markers = [];

		// Add new markers
		providers.forEach(provider => {
			if (provider.location_lat && provider.location_lng) {
				const marker = L!.marker([provider.location_lat, provider.location_lng])
					.addTo(map!);

				marker.on('click', () => {
					selectedProvider = provider;
				});

				markers.push(marker);
			}
		});

		// Fit bounds if we have markers
		if (markers.length > 0) {
			const group = L!.featureGroup(markers);
			map!.fitBounds(group.getBounds().pad(0.1));
		}
	}

	async function initMap() {
		if (!browser || !mapContainer) return;

		// Dynamic import of Leaflet
		L = await import('leaflet');

		// Create map
		map = L.map(mapContainer).setView(uruguayCenter, defaultZoom);

		// Add tile layer (OpenStreetMap)
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		// Custom marker icon
		const defaultIcon = L.icon({
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});
		L.Marker.prototype.options.icon = defaultIcon;

		// Close popup when clicking on map
		map.on('click', () => {
			selectedProvider = null;
		});

		mapReady = true;
		loading = false;
		updateMarkers();
	}

	function handleFilterChange() {
		fetchProviders();
	}

	function closePopup() {
		selectedProvider = null;
	}

	onMount(() => {
		fetchProviders().then(() => {
			initMap();
		});

		return () => {
			if (map) {
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

	<div class="relative h-[calc(100vh-64px)]">
		<!-- Loading overlay -->
		{#if loading}
			<div class="absolute inset-0 z-[1001] bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
				<div class="text-center">
					<Loader2 class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
					<p class="text-gray-600 dark:text-gray-400">Cargando mapa...</p>
				</div>
			</div>
		{/if}

		<!-- Map container -->
		<div bind:this={mapContainer} class="w-full h-full"></div>

		<!-- Bottom Controls Bar -->
		<div class="absolute bottom-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
			<div class="flex items-end justify-between gap-4 pointer-events-auto">
				<!-- Left controls -->
				<div class="flex gap-2">
					<a
						href="/directorio"
						class="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
					>
						<List class="h-4 w-4" />
						<span>Lista</span>
					</a>

					<button
						onclick={() => showFilters = !showFilters}
						class="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
					>
						<Filter class="h-4 w-4" />
						<span>Filtrar</span>
						{#if showFilters}
							<ChevronDown class="h-4 w-4" />
						{:else}
							<ChevronUp class="h-4 w-4" />
						{/if}
					</button>
				</div>

				<!-- Right: count -->
				<div class="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
					<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						<MapPin class="h-4 w-4 text-primary-600" />
						<span>{providers.length} en el mapa</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Filters Panel (above bottom bar) -->
		{#if showFilters}
			<div class="absolute bottom-20 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-72">
				<div class="flex items-center justify-between mb-3">
					<h3 class="font-medium text-gray-900 dark:text-white">Filtros</h3>
					<button onclick={() => showFilters = false} class="text-gray-400 hover:text-gray-600">
						<X class="h-4 w-4" />
					</button>
				</div>
				<div>
					<label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Departamento</label>
					<select
						bind:value={selectedDepartment}
						onchange={handleFilterChange}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
					>
						<option value="all">Todos los departamentos</option>
						{#each departments as dept}
							<option value={dept}>{dept}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}

		<!-- Selected provider popup -->
		{#if selectedProvider}
			<div class="absolute bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[1000] bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
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
