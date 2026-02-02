<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		Search,
		MapPin,
		Loader2,
		SlidersHorizontal,
		X,
		Map as MapIcon,
		Eye
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import {
		DEFAULT_CATEGORIES,
		DEPARTMENTS,
		MONTEVIDEO_NEIGHBORHOODS,
		type Department
	} from '$lib/domain/types';
	import { APP_NAME } from '$lib/config';
	import { supabase } from '$lib/supabase';
	import { getThumbUrl } from '$lib/utils/upload';
	import { buildItemListSchema } from '$lib/seo/schemas';
	import {
		addRecentSearch,
		subscribeToActivity,
		clearRecentlyViewed,
		type RecentlyViewedProvider
	} from '$lib/stores/activity';

	// Types
	interface Provider {
		id: string;
		slug: string | null;
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

	// Pagination constants
	const PAGE_SIZE = 20;

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
	let loadingMore = $state(false);
	let providers = $state<Provider[]>([]);
	let hasMore = $state(true);
	let currentOffset = $state(0);
	let filterDialogOpen = $state(false);
	let loadMoreTrigger = $state<HTMLDivElement | null>(null);
	let showRecentlyViewed = $state(false);
	let recentlyViewed = $state<RecentlyViewedProvider[]>([]);

	// Check if any filter is active
	let hasActiveFilters = $derived(
		selectedDepartment !== '' || selectedNeighborhood !== '' || selectedCategory !== '' || selectedType !== ''
	);

	// Get active filter count
	let activeFilterCount = $derived(
		[selectedDepartment, selectedNeighborhood, selectedCategory, selectedType].filter(Boolean).length
	);

	function openFilterDialog() {
		filterDialogOpen = true;
	}

	function closeFilterDialog() {
		filterDialogOpen = false;
	}

	function applyFilters() {
		closeFilterDialog();
		updateUrl();
		fetchProviders();
	}

	function removeFilter(filter: 'department' | 'neighborhood' | 'category' | 'type') {
		if (filter === 'department') {
			selectedDepartment = '';
			selectedNeighborhood = '';
		} else if (filter === 'neighborhood') {
			selectedNeighborhood = '';
		} else if (filter === 'category') {
			selectedCategory = '';
		} else if (filter === 'type') {
			selectedType = '';
			selectedCategory = '';
		}
		updateUrl();
		fetchProviders();
	}

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

	async function fetchProviders(loadMore = false) {
		if (loadMore) {
			loadingMore = true;
		} else {
			loading = true;
			providers = [];
			currentOffset = 0;
			hasMore = true;
		}

		// Determine category names for filtering
		let categoryNames: string[] | null = null;
		if (selectedCategory) {
			categoryNames = [selectedCategory];
		} else if (selectedType) {
			categoryNames = (selectedType === 'service' ? serviceCategories : businessCategories)
				.map(c => c.name);
		}

		// Build optimized query with embedded categories (single query instead of N+1)
		// Use !inner join when filtering by category to ensure only matching providers are returned
		const selectQuery = categoryNames
			? `id, slug, business_name, description, department, neighborhood, logo_url, photos, is_verified, is_featured, is_active, mb_provider_categories!inner(category_name)`
			: `id, slug, business_name, description, department, neighborhood, logo_url, photos, is_verified, is_featured, is_active, mb_provider_categories(category_name)`;

		let query = supabase
			.from('mb_providers')
			.select(selectQuery)
			.eq('is_active', true)
			.order('is_featured', { ascending: false })
			.order('created_at', { ascending: false });

		// Filter by category/type using the joined table
		if (categoryNames) {
			query = query.in('mb_provider_categories.category_name', categoryNames);
		}

		// Apply location filters
		if (selectedDepartment) {
			query = query.eq('department', selectedDepartment);
		}

		if (selectedNeighborhood) {
			query = query.eq('neighborhood', selectedNeighborhood);
		}

		// Apply search filter
		if (searchQuery) {
			query = query.or(
				`business_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
			);
		}

		// Apply pagination
		const { data, error } = await query.range(currentOffset, currentOffset + PAGE_SIZE - 1);

		if (error) {
			console.error('Error fetching providers:', error);
			if (!loadMore) providers = [];
		} else if (data && data.length > 0) {
			// Transform embedded categories to flat array
			const newProviders = data.map((p: Record<string, unknown>) => ({
				id: p.id as string,
				slug: p.slug as string | null,
				business_name: p.business_name as string,
				description: p.description as string | null,
				department: p.department as string,
				neighborhood: p.neighborhood as string | null,
				logo_url: p.logo_url as string | null,
				photos: p.photos as string[],
				is_verified: p.is_verified as boolean,
				is_featured: p.is_featured as boolean,
				is_active: p.is_active as boolean,
				categories: (p.mb_provider_categories as Array<{category_name: string}> || [])
					.map(c => c.category_name)
			}));

			if (loadMore) {
				providers = [...providers, ...newProviders];
			} else {
				providers = newProviders;

				// Track this search (only on initial load, not pagination)
				addRecentSearch({
					query: searchQuery,
					filters: {
						departamento: selectedDepartment || undefined,
						barrio: selectedNeighborhood || undefined,
						categoria: selectedCategory || undefined,
						tipo: selectedType || undefined
					},
					resultCount: newProviders.length
				});
			}

			// Check if there are more results
			hasMore = data.length === PAGE_SIZE;
			currentOffset += data.length;
		} else {
			if (!loadMore) providers = [];
			hasMore = false;
		}

		loading = false;
		loadingMore = false;
	}

	function loadMoreProviders() {
		if (!loadingMore && hasMore) {
			fetchProviders(true);
		}
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

	// Filters are now applied manually via dialog

	// Build ItemList schema from providers
	const itemListSchema = $derived(
		providers.length > 0
			? buildItemListSchema(providers.map((p) => ({ id: p.id, name: p.business_name })))
			: null
	);

	let observer: IntersectionObserver | null = null;

	function toggleRecentlyViewed() {
		showRecentlyViewed = !showRecentlyViewed;
	}

	function exitRecentlyViewed() {
		showRecentlyViewed = false;
	}

	onMount(() => {
		fetchProviders();

		// Subscribe to activity store for recently viewed
		const unsubscribe = subscribeToActivity((data) => {
			recentlyViewed = data.recentlyViewed;
		});

		// Set up intersection observer for infinite scroll
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
					loadMoreProviders();
				}
			},
			{ rootMargin: '200px' }
		);

		return () => {
			observer?.disconnect();
			unsubscribe();
		};
	});

	// Watch for loadMoreTrigger element
	$effect(() => {
		if (loadMoreTrigger && observer) {
			observer.observe(loadMoreTrigger);
		}
	});
</script>

<SEO
	title="Directorio"
	description="Encuentra servicios y negocios locales en Uruguay. Electricistas, plomeros, restaurantes, farmacias y más profesionales cerca tuyo."
	url="/directorio"
	jsonLd={itemListSchema}
/>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
	<Header />

	<div class="container py-8">
		<!-- Search and Filter Button -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
			<div class="flex gap-3">
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
				<button
					type="button"
					onclick={openFilterDialog}
					class="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
				>
					<SlidersHorizontal class="h-5 w-5" />
					<span class="hidden sm:inline">Filtros</span>
					{#if activeFilterCount > 0}
						<span class="bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
							{activeFilterCount}
						</span>
					{/if}
				</button>
				<a
					href="/directorio/mapa"
					class="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
				>
					<MapIcon class="h-5 w-5" />
					<span class="hidden sm:inline">Mapa</span>
				</a>
				{#if recentlyViewed.length > 0}
					<button
						type="button"
						onclick={toggleRecentlyViewed}
						class="flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors {showRecentlyViewed
							? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
							: 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'}"
					>
						<Eye class="h-5 w-5" />
						<span class="hidden sm:inline">Recientes</span>
						<span class="bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
							{recentlyViewed.length}
						</span>
					</button>
				{/if}
			</div>
		</div>

		<!-- Active Filter Chips -->
		{#if hasActiveFilters}
			<div class="flex flex-wrap items-center gap-2 mb-4">
				{#if selectedType}
					<span class="inline-flex items-center gap-1 pl-3 pr-1 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-sm">
						{selectedType === 'service' ? 'Profesionales' : 'Comercios'}
						<button type="button" onclick={() => removeFilter('type')} class="p-1.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full" aria-label="Quitar filtro">
							<X class="h-4 w-4" />
						</button>
					</span>
				{/if}
				{#if selectedCategory}
					{@const catInfo = getCategoryInfo(selectedCategory)}
					<span class="inline-flex items-center gap-1 pl-3 pr-1 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-sm">
						{catInfo.label}
						<button type="button" onclick={() => removeFilter('category')} class="p-1.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full" aria-label="Quitar filtro">
							<X class="h-4 w-4" />
						</button>
					</span>
				{/if}
				{#if selectedDepartment}
					<span class="inline-flex items-center gap-1 pl-3 pr-1 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-sm">
						{selectedDepartment}
						<button type="button" onclick={() => removeFilter('department')} class="p-1.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full" aria-label="Quitar filtro">
							<X class="h-4 w-4" />
						</button>
					</span>
				{/if}
				{#if selectedNeighborhood}
					<span class="inline-flex items-center gap-1 pl-3 pr-1 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-sm">
						{selectedNeighborhood}
						<button type="button" onclick={() => removeFilter('neighborhood')} class="p-1.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full" aria-label="Quitar filtro">
							<X class="h-4 w-4" />
						</button>
					</span>
				{/if}
				<button
					type="button"
					onclick={clearFilters}
					class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
				>
					Limpiar filtros
				</button>
			</div>
		{/if}

		<!-- Recently Viewed Section -->
		{#if showRecentlyViewed}
			<div class="mb-4">
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-2">
						<Eye class="h-5 w-5 text-primary-600" />
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Visitados recientemente</h2>
						<span class="text-sm text-gray-500">({recentlyViewed.length})</span>
					</div>
					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={() => { clearRecentlyViewed(); showRecentlyViewed = false; }}
							class="text-sm text-gray-500 hover:text-red-600"
						>
							Limpiar historial
						</button>
						<button
							type="button"
							onclick={exitRecentlyViewed}
							class="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
						>
							<X class="h-4 w-4" />
							Cerrar
						</button>
					</div>
				</div>

				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each recentlyViewed as item (item.id)}
						{@const catInfo = getCategoryInfo(item.category)}
						<a
							href="/directorio/{item.id}"
							class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
						>
							<div class="p-4">
								<div class="flex items-start gap-3 mb-3">
									{#if item.logoUrl}
										<img
											src={item.logoUrl}
											alt={item.name}
											loading="lazy"
											class="w-12 h-12 rounded-full object-cover flex-shrink-0"
										/>
									{:else}
										<div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center flex-shrink-0">
											<span class="text-lg font-bold text-primary-400">
												{item.name.charAt(0)}
											</span>
										</div>
									{/if}
									<div class="flex-1 min-w-0">
										<h3 class="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
										<div class="flex items-center gap-2 mt-1">
											<span class="text-xs {catInfo.color} text-white px-2 py-0.5 rounded-full">
												{catInfo.label}
											</span>
										</div>
									</div>
								</div>
								<div class="flex items-center text-gray-500 dark:text-gray-400 text-sm">
									<MapPin class="h-4 w-4 mr-1" />
									{item.department}
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{:else if loading}
			<!-- Loading state -->
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
						href="/auth/login?redirect=/registrar-negocio"
						class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
					>
						Ofrecer servicios
					</a>
				{/if}
			</div>
		{:else}
			<!-- Results -->
			<div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
				{providers.length} {providers.length === 1 ? 'negocio encontrado' : 'negocios encontrados'}
			</div>

			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each providers as provider (provider.id)}
					<a
						href="/directorio/{provider.slug ? `@${provider.slug}` : provider.id}"
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

			<!-- Load more trigger and indicator -->
			{#if hasMore}
				<div
					bind:this={loadMoreTrigger}
					class="flex items-center justify-center py-8"
				>
					{#if loadingMore}
						<Loader2 class="h-6 w-6 animate-spin text-primary-600" />
						<span class="ml-2 text-gray-600 dark:text-gray-400">Cargando más...</span>
					{/if}
				</div>
			{:else if providers.length > PAGE_SIZE}
				<div class="text-center py-8 text-gray-500 dark:text-gray-400">
					No hay más resultados
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Filter Dialog -->
{#if filterDialogOpen}
	<!-- Backdrop -->
	<button type="button" class="fixed inset-0 bg-black/50 z-40 cursor-default" onclick={closeFilterDialog} aria-label="Cerrar filtros"></button>

	<!-- Dialog -->
	<div class="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-50 max-h-[85vh] flex flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
			<button type="button" onclick={closeFilterDialog} class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
				<X class="h-5 w-5" />
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-4 space-y-6">
			<!-- Type -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						onclick={() => { selectedType = ''; }}
						class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedType === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
					>
						Todos
					</button>
					<button
						type="button"
						onclick={() => { selectedType = 'service'; selectedCategory = ''; }}
						class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedType === 'service' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
					>
						Profesionales
					</button>
					<button
						type="button"
						onclick={() => { selectedType = 'business'; selectedCategory = ''; }}
						class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedType === 'business' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
					>
						Comercios
					</button>
				</div>
			</div>

			<!-- Category -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
				<div class="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
					<button
						type="button"
						onclick={() => { selectedCategory = ''; }}
						class="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors {selectedCategory === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
					>
						Todas
					</button>
					{#each filteredCategories as cat (cat.name)}
						<button
							type="button"
							onclick={() => { selectedCategory = cat.name; }}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors {selectedCategory === cat.name ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
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
					class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none bg-white dark:bg-gray-700 dark:text-white"
				>
					<option value="">Todo Uruguay</option>
					{#each DEPARTMENTS as dept (dept)}
						<option value={dept}>{dept}</option>
					{/each}
				</select>
			</div>

			<!-- Neighborhood (only for Montevideo) -->
			{#if selectedDepartment === 'Montevideo'}
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Barrio</label>
					<select
						bind:value={selectedNeighborhood}
						class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none bg-white dark:bg-gray-700 dark:text-white"
					>
						<option value="">Todos los barrios</option>
						{#each MONTEVIDEO_NEIGHBORHOODS as barrio (barrio)}
							<option value={barrio}>{barrio}</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
			<Button variant="outline" class="flex-1" onclick={clearFilters}>
				Limpiar
			</Button>
			<Button class="flex-1" onclick={applyFilters}>
				Aplicar filtros
			</Button>
		</div>
	</div>
{/if}
