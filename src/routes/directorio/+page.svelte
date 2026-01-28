<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		Search,
		MapPin,
		Loader2
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import {
		DEFAULT_CATEGORIES,
		DEPARTMENTS,
		MONTEVIDEO_NEIGHBORHOODS,
		type Department
	} from '$lib/domain/types';
	import { APP_NAME } from '$lib/config';
	import { supabase } from '$lib/supabase';
	import { getThumbUrl } from '$lib/utils/upload';

	// Types
	interface Provider {
		id: string;
		business_name: string;
		description: string | null;
		department: string;
		neighborhood: string | null;
		logo_url: string | null;
		photos: string[];
		is_verified: boolean;
		is_featured: boolean;
		is_active: boolean;
		categories: string[];
	}

	// Get query params
	let searchQuery = $state($page.url.searchParams.get('q') || '');
	let selectedDepartment = $state<Department | ''>(
		($page.url.searchParams.get('departamento') as Department) || ''
	);
	let selectedNeighborhood = $state($page.url.searchParams.get('barrio') || '');
	let selectedCategory = $state($page.url.searchParams.get('categoria') || '');
	let selectedType = $state<'service' | 'business' | ''>(
		($page.url.searchParams.get('tipo') as 'service' | 'business') || ''
	);

	let loading = $state(true);
	let providers = $state<Provider[]>([]);

	const APPYUDA_URL = 'https://appyuda.com.uy';

	const categories = DEFAULT_CATEGORIES.filter((c) => c.is_active);
	const serviceCategories = categories.filter(
		(c) => c.category_type === 'service' || c.category_type === 'both'
	);
	const businessCategories = categories.filter(
		(c) => c.category_type === 'business' || c.category_type === 'both'
	);

	// Derived categories based on selected type
	let filteredCategories = $derived(
		selectedType === 'service' ? serviceCategories :
		selectedType === 'business' ? businessCategories :
		categories
	);

	async function fetchProviders() {
		loading = true;

		// Build query
		let query = supabase
			.from('mb_providers')
			.select(
				`
				id,
				business_name,
				description,
				department,
				neighborhood,
				logo_url,
				photos,
				is_verified,
				is_featured,
				is_active
			`
			)
			.eq('is_active', true)
			.order('is_featured', { ascending: false })
			.order('created_at', { ascending: false });

		// Apply filters
		if (selectedDepartment) {
			query = query.eq('department', selectedDepartment);
		}

		if (selectedNeighborhood) {
			query = query.eq('neighborhood', selectedNeighborhood);
		}

		if (searchQuery) {
			query = query.or(
				`business_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
			);
		}

		const { data, error } = await query.limit(50);

		if (error) {
			console.error('Error fetching providers:', error);
			providers = [];
		} else {
			// Fetch categories for each provider
			const providerIds = data?.map((p) => p.id) || [];

			if (providerIds.length > 0) {
				const { data: categoriesData } = await supabase
					.from('mb_provider_categories')
					.select('provider_id, category_name')
					.in('provider_id', providerIds);

				const categoryMap = new Map<string, string[]>();
				categoriesData?.forEach((c) => {
					const existing = categoryMap.get(c.provider_id) || [];
					existing.push(c.category_name);
					categoryMap.set(c.provider_id, existing);
				});

				providers = (data || []).map((p) => ({
					...p,
					categories: categoryMap.get(p.id) || []
				}));

				// Filter by category if selected
				if (selectedCategory) {
					providers = providers.filter((p) => p.categories.includes(selectedCategory));
				}
			} else {
				providers = [];
			}
		}

		loading = false;
	}

	function updateUrl() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (selectedDepartment) params.set('departamento', selectedDepartment);
		if (selectedNeighborhood) params.set('barrio', selectedNeighborhood);
		if (selectedCategory) params.set('categoria', selectedCategory);
		if (selectedType) params.set('tipo', selectedType);

		const url = params.toString() ? `?${params.toString()}` : '';
		window.history.replaceState({}, '', `/directorio${url}`);
	}

	function clearFilters() {
		searchQuery = '';
		selectedDepartment = '';
		selectedNeighborhood = '';
		selectedCategory = '';
		selectedType = '';
		updateUrl();
		fetchProviders();
	}

	function getCategoryInfo(categoryName: string) {
		const cat = DEFAULT_CATEGORIES.find((c) => c.name === categoryName);
		return cat || { label: categoryName, color: 'bg-gray-500' };
	}

	// Debounce search
	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			updateUrl();
			fetchProviders();
		}, 300);
	}

	$effect(() => {
		// Re-fetch when filters change (except search which has debounce)
		if (selectedDepartment !== undefined || selectedNeighborhood !== undefined || selectedCategory !== undefined) {
			updateUrl();
			fetchProviders();
		}
	});

	onMount(() => {
		fetchProviders();
	});
</script>

<svelte:head>
	<title>Directorio - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
	<Header items={[{ label: 'Registrar negocio', href: '/registrar-negocio' }]} />

	<div class="container py-8">
		<!-- Search and Filters -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1 relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<input
						type="text"
						placeholder="Buscar servicios o negocios..."
						bind:value={searchQuery}
						oninput={handleSearch}
						class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
					/>
				</div>
				<div class="md:w-48 relative">
					<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<select
						bind:value={selectedDepartment}
						class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none appearance-none bg-white dark:bg-gray-700 dark:text-white"
					>
						<option value="">Departamento</option>
						{#each DEPARTMENTS as dept}
							<option value={dept}>{dept}</option>
						{/each}
					</select>
				</div>
				{#if selectedDepartment === 'Montevideo'}
					<div class="md:w-48">
						<select
							bind:value={selectedNeighborhood}
							class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none appearance-none bg-white dark:bg-gray-700 dark:text-white"
						>
							<option value="">Barrio</option>
							{#each MONTEVIDEO_NEIGHBORHOODS as barrio}
								<option value={barrio}>{barrio}</option>
							{/each}
						</select>
					</div>
				{/if}
				</div>

			<!-- Type chips -->
			<div class="flex gap-2 mt-4">
				<button
					onclick={() => { selectedType = ''; selectedCategory = ''; }}
					class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors {selectedType === '' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400'}"
				>
					Todos
				</button>
				<button
					onclick={() => { selectedType = 'service'; selectedCategory = ''; }}
					class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors {selectedType === 'service' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400'}"
				>
					Profesionales
				</button>
				<button
					onclick={() => { selectedType = 'business'; selectedCategory = ''; }}
					class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors {selectedType === 'business' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400'}"
				>
					Comercios
				</button>
			</div>

			<!-- Category chips -->
			<div class="flex gap-2 mt-3 overflow-x-auto pb-2" style="scrollbar-width: none;">
				<button
					onclick={() => { selectedCategory = ''; }}
					class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors {selectedCategory === '' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400'}"
				>
					Todas
				</button>
				{#each filteredCategories as cat}
					<button
						onclick={() => { selectedCategory = cat.name; }}
						class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors {selectedCategory === cat.name ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400'}"
					>
						{cat.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Appyuda Banner -->
		<div class="mb-6 p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<p class="font-semibold text-lg">¿Querés captar más clientes y cerrar negocios de forma segura?</p>
					<p class="text-green-100 text-sm">Ofrecé tus servicios en nuestra plataforma de confianza</p>
				</div>
				<a
					href={APPYUDA_URL}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center px-6 py-2 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
				>
					Probá Appyuda
				</a>
			</div>
		</div>

		<!-- Loading state -->
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
				<span class="ml-2 text-gray-600">Cargando...</span>
			</div>
		{:else if providers.length === 0}
			<!-- Empty state -->
			<div class="text-center py-12">
				<div class="text-gray-400 mb-4">
					<Search class="h-16 w-16 mx-auto" />
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No se encontraron negocios</h3>
				<p class="text-gray-500 mb-4">
					{#if searchQuery || selectedDepartment || selectedCategory}
						Probá ajustando los filtros de búsqueda
					{:else}
						Aún no hay negocios registrados. ¡Sé el primero!
					{/if}
				</p>
				{#if searchQuery || selectedDepartment || selectedCategory}
					<Button variant="outline" onclick={clearFilters}>Limpiar filtros</Button>
				{:else}
					<a
						href="/registrar-negocio"
						class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
					>
						Registrar mi negocio
					</a>
				{/if}
			</div>
		{:else}
			<!-- Results -->
			<div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
				{providers.length} {providers.length === 1 ? 'negocio encontrado' : 'negocios encontrados'}
			</div>

			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each providers as provider}
					<a
						href="/directorio/{provider.id}"
						class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
					>
						<div class="p-4">
							<div class="flex items-start gap-3 mb-3">
								<!-- Profile photo -->
								{#if provider.logo_url}
									<img
										src={getThumbUrl(provider.logo_url)}
										alt={provider.business_name}
										loading="lazy"
										class="w-12 h-12 rounded-full object-cover flex-shrink-0"
									/>
								{:else if provider.photos && provider.photos.length > 0}
									<img
										src={getThumbUrl(provider.photos[0])}
										alt={provider.business_name}
										loading="lazy"
										class="w-12 h-12 rounded-full object-cover flex-shrink-0"
									/>
								{:else}
									<div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center flex-shrink-0">
										<span class="text-lg font-bold text-primary-400">
											{provider.business_name.charAt(0)}
										</span>
									</div>
								{/if}
								<div class="flex-1 min-w-0">
									<div class="flex items-start justify-between">
										<h3 class="font-semibold text-gray-900 dark:text-white truncate">{provider.business_name}</h3>
										{#if provider.is_featured}
											<span class="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
												>Destacado</span
											>
										{/if}
									</div>
								</div>
							</div>

							{#if provider.description}
								<p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{provider.description}</p>
							{/if}

							<!-- Gallery thumbnails -->
							{#if provider.photos && provider.photos.length > 0}
								<div class="flex gap-2 mb-3 overflow-hidden">
									{#each provider.photos.slice(0, 4) as photo}
										<img
											src={getThumbUrl(photo)}
											alt="Foto"
											loading="lazy"
											class="w-16 h-16 rounded-lg object-cover flex-shrink-0"
										/>
									{/each}
									{#if provider.photos.length > 4}
										<div class="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
											<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">+{provider.photos.length - 4}</span>
										</div>
									{/if}
								</div>
							{/if}

							<div class="flex flex-wrap gap-2 mb-3">
								{#each provider.categories.slice(0, 3) as categoryName}
									{@const catInfo = getCategoryInfo(categoryName)}
									<span class="text-xs {catInfo.color} text-white px-2 py-0.5 rounded-full">
										{catInfo.label}
									</span>
								{/each}
							</div>

							<div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
								<MapPin class="h-4 w-4 mr-1" />
								{#if provider.neighborhood}
									{provider.neighborhood},
								{/if}
								{provider.department}
							</div>

							{#if provider.is_verified}
								<div class="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
									<svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clip-rule="evenodd"
										/>
									</svg>
									Verificado
								</div>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
