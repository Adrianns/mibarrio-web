<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		Search,
		MapPin,
		Filter,
		X,
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

	let showFilters = $state(false);
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
	<Header items={[{ label: 'Planes', href: '/planes' }]} />

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
				<Button variant="outline" onclick={() => (showFilters = !showFilters)} class="md:w-auto">
					<Filter class="h-4 w-4 mr-2" />
					Filtros
				</Button>
			</div>

			<!-- Extended Filters -->
			{#if showFilters}
				<div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
					<div class="flex flex-wrap gap-4">
						<div>
							<label for="filter-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>Tipo</label
							>
							<select
								id="filter-type"
								bind:value={selectedType}
								class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 outline-none"
							>
								<option value="">Todos</option>
								<option value="service">Profesionales</option>
								<option value="business">Comercios</option>
							</select>
						</div>
						<div>
							<label for="filter-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>Categoría</label
							>
							<select
								id="filter-category"
								bind:value={selectedCategory}
								class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 outline-none"
							>
								<option value="">Todas</option>
								{#if !selectedType || selectedType === 'service'}
									<optgroup label="Profesionales">
										{#each serviceCategories as cat}
											<option value={cat.name}>{cat.label}</option>
										{/each}
									</optgroup>
								{/if}
								{#if !selectedType || selectedType === 'business'}
									<optgroup label="Comercios">
										{#each businessCategories as cat}
											<option value={cat.name}>{cat.label}</option>
										{/each}
									</optgroup>
								{/if}
							</select>
						</div>
						<div class="flex items-end">
							<Button variant="ghost" onclick={clearFilters}>
								<X class="h-4 w-4 mr-1" />
								Limpiar
							</Button>
						</div>
					</div>
				</div>
			{/if}
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
						<!-- Image -->
						<div
							class="h-40 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center"
						>
							{#if provider.logo_url}
								<img
									src={provider.logo_url}
									alt={provider.business_name}
									class="w-full h-full object-cover"
								/>
							{:else if provider.photos && provider.photos.length > 0}
								<img
									src={provider.photos[0]}
									alt={provider.business_name}
									class="w-full h-full object-cover"
								/>
							{:else}
								<span class="text-4xl font-bold text-primary-400">
									{provider.business_name.charAt(0)}
								</span>
							{/if}
						</div>

						<div class="p-4">
							<div class="flex items-start justify-between mb-2">
								<h3 class="font-semibold text-gray-900 dark:text-white">{provider.business_name}</h3>
								{#if provider.is_featured}
									<span class="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full"
										>Destacado</span
									>
								{/if}
							</div>

							{#if provider.description}
								<p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{provider.description}</p>
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
