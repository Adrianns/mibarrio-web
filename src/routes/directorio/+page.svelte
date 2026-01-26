<script lang="ts">
	import { page } from '$app/stores';
	import { Search, MapPin, Filter, X, Phone, MessageCircle, Mail, Globe, ExternalLink } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { DEFAULT_CATEGORIES, DEPARTMENTS, MONTEVIDEO_NEIGHBORHOODS, type Department, type Category } from '$lib/domain/types';
	import { APP_NAME } from '$lib/config';

	// Get query params
	let searchQuery = $state($page.url.searchParams.get('q') || '');
	let selectedDepartment = $state<Department | ''>($page.url.searchParams.get('departamento') as Department || '');
	let selectedNeighborhood = $state($page.url.searchParams.get('barrio') || '');
	let selectedCategory = $state($page.url.searchParams.get('categoria') || '');
	let selectedType = $state<'service' | 'business' | ''>($page.url.searchParams.get('tipo') as 'service' | 'business' | '');

	let showFilters = $state(false);

	// Mock data for demo - in production this comes from Supabase
	const mockProviders = [
		{
			id: '1',
			display_name: 'Juan Pérez Electricidad',
			short_description: 'Electricista matriculado con 15 años de experiencia',
			department: 'Montevideo',
			neighborhood: 'Pocitos',
			contact_phone: '099123456',
			contact_whatsapp: '59899123456',
			is_verified: true,
			is_featured: true,
			categories: [{ name: 'electricista', label: 'Electricistas', color: 'bg-yellow-500' }],
			photos: []
		},
		{
			id: '2',
			display_name: 'María García - Plomería',
			short_description: 'Servicio de plomería 24 horas, emergencias',
			department: 'Montevideo',
			neighborhood: 'Centro',
			contact_phone: '099234567',
			contact_whatsapp: '59899234567',
			is_verified: false,
			is_featured: false,
			categories: [{ name: 'plomero', label: 'Plomeros', color: 'bg-blue-500' }],
			photos: []
		},
		{
			id: '3',
			display_name: 'Restaurante La Esquina',
			short_description: 'Comida casera uruguaya, almuerzos ejecutivos',
			department: 'Montevideo',
			neighborhood: 'Cordón',
			contact_phone: '24001234',
			contact_whatsapp: '59899345678',
			is_verified: true,
			is_featured: true,
			categories: [{ name: 'restaurante', label: 'Restaurantes', color: 'bg-orange-500' }],
			photos: []
		}
	];

	const categories = DEFAULT_CATEGORIES.filter(c => c.is_active);
	const serviceCategories = categories.filter(c => c.category_type === 'service' || c.category_type === 'both');
	const businessCategories = categories.filter(c => c.category_type === 'business' || c.category_type === 'both');

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
	}

	$effect(() => {
		updateUrl();
	});
</script>

<svelte:head>
	<title>Directorio - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white border-b border-gray-200">
		<div class="container py-4">
			<nav class="flex items-center justify-between">
				<a href="/" class="text-2xl font-bold text-primary-600">{APP_NAME}</a>
				<div class="flex items-center gap-4">
					<a href="/planes" class="text-gray-600 hover:text-gray-900">Planes</a>
					<a href="/auth/login" class="text-gray-600 hover:text-gray-900">Ingresar</a>
					<Button href="/registrar-negocio">Registrar negocio</Button>
				</div>
			</nav>
		</div>
	</header>

	<div class="container py-8">
		<!-- Search and Filters -->
		<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1 relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<input
						type="text"
						placeholder="Buscar servicios o negocios..."
						bind:value={searchQuery}
						class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
					/>
				</div>
				<div class="md:w-48 relative">
					<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<select
						bind:value={selectedDepartment}
						class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none appearance-none bg-white"
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
							class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none appearance-none bg-white"
						>
							<option value="">Barrio</option>
							{#each MONTEVIDEO_NEIGHBORHOODS as barrio}
								<option value={barrio}>{barrio}</option>
							{/each}
						</select>
					</div>
				{/if}
				<Button variant="outline" onclick={() => showFilters = !showFilters} class="md:w-auto">
					<Filter class="h-4 w-4 mr-2" />
					Filtros
				</Button>
			</div>

			<!-- Extended Filters -->
			{#if showFilters}
				<div class="mt-4 pt-4 border-t border-gray-100">
					<div class="flex flex-wrap gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
							<select
								bind:value={selectedType}
								class="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
							>
								<option value="">Todos</option>
								<option value="service">Profesionales</option>
								<option value="business">Comercios</option>
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
							<select
								bind:value={selectedCategory}
								class="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
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

		<!-- Results -->
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each mockProviders as provider}
				<a
					href="/directorio/{provider.id}"
					class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
				>
					<!-- Image placeholder -->
					<div class="h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
						{#if provider.photos.length > 0}
							<img src={provider.photos[0]} alt={provider.display_name} class="w-full h-full object-cover" />
						{:else}
							<span class="text-4xl font-bold text-primary-400">
								{provider.display_name.charAt(0)}
							</span>
						{/if}
					</div>

					<div class="p-4">
						<div class="flex items-start justify-between mb-2">
							<h3 class="font-semibold text-gray-900">{provider.display_name}</h3>
							{#if provider.is_featured}
								<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Destacado</span>
							{/if}
						</div>

						<p class="text-sm text-gray-600 mb-3 line-clamp-2">{provider.short_description}</p>

						<div class="flex flex-wrap gap-2 mb-3">
							{#each provider.categories as cat}
								<span class="text-xs {cat.color} text-white px-2 py-0.5 rounded-full">
									{cat.label}
								</span>
							{/each}
						</div>

						<div class="flex items-center text-sm text-gray-500">
							<MapPin class="h-4 w-4 mr-1" />
							{provider.neighborhood}, {provider.department}
						</div>

						{#if provider.is_verified}
							<div class="mt-2 flex items-center text-sm text-green-600">
								<svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
								Verificado
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>

		{#if mockProviders.length === 0}
			<div class="text-center py-12">
				<p class="text-gray-500">No se encontraron resultados</p>
				<Button variant="link" onclick={clearFilters}>Limpiar filtros</Button>
			</div>
		{/if}
	</div>
</div>
