<script lang="ts">
	import { Search, MapPin, ArrowRight, Briefcase, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import CategoryIcon from '$lib/components/CategoryIcon.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { DEFAULT_CATEGORIES, DEPARTMENTS, MONTEVIDEO_NEIGHBORHOODS, type Department } from '$lib/domain/types';
	import { APP_NAME, APP_TAGLINE } from '$lib/config';
	import { isAuthenticated, hasMibarrioProvider, isInitialized } from '$lib/stores/auth';
	import { buildOrganizationSchema, buildWebSiteSchema } from '$lib/seo/schemas';
	import { SITE_DESCRIPTION } from '$lib/seo/constants';
	import { CATEGORY_SLUGS } from '$lib/seo/category-slugs';

	const organizationSchema = buildOrganizationSchema(SITE_DESCRIPTION);
	const webSiteSchema = buildWebSiteSchema(SITE_DESCRIPTION);
	const jsonLdSchemas = [organizationSchema, webSiteSchema];

	let searchQuery = $state('');
	let selectedDepartment = $state<Department | ''>('');
	let selectedNeighborhood = $state('');
	let bannerDismissed = $state(false);

	// Reset neighborhood when department changes
	$effect(() => {
		if (selectedDepartment !== 'Montevideo') {
			selectedNeighborhood = '';
		}
	});

	const featuredCategories = DEFAULT_CATEGORIES.filter((c) => c.is_active).slice(0, 8);

	const navItems: { label: string; href: string }[] = [];

	function handleSearch() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (selectedDepartment) params.set('departamento', selectedDepartment);
		if (selectedNeighborhood) params.set('barrio', selectedNeighborhood);
		window.location.href = `/directorio?${params.toString()}`;
	}
</script>

<SEO url="/" jsonLd={jsonLdSchemas} />

<div class="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
	<Header items={navItems} variant="transparent" />

	<!-- Banner for logged-in users without a business -->
	{#if $isInitialized && $isAuthenticated && !$hasMibarrioProvider && !bannerDismissed}
		<div class="bg-primary-600 text-white">
			<div class="container py-3 flex items-center justify-between gap-4">
				<div class="flex items-center gap-3 flex-1 min-w-0">
					<Briefcase class="h-5 w-5 flex-shrink-0" />
					<p class="text-sm md:text-base truncate">
						<span class="font-medium">¡Ya tenés cuenta!</span>
						<span class="hidden sm:inline"> Ahora ofrecé tus servicios.</span>
						<span> Registrá tu negocio y llegá a más clientes.</span>
					</p>
				</div>
				<div class="flex items-center gap-2 flex-shrink-0">
					<a
						href="/registrar-negocio"
						class="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
					>
						Registrar
						<ArrowRight class="h-4 w-4" />
					</a>
					<button
						onclick={() => bannerDismissed = true}
						class="p-1.5 hover:bg-primary-700 rounded-lg transition-colors"
						aria-label="Cerrar banner"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Hero -->
	<section class="relative">
		<div class="container py-16 md:py-24">
		<div class="max-w-3xl mx-auto text-center">
			<h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
				{APP_TAGLINE}
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
				Encontrá electricistas, plomeros, restaurantes, farmacias y más servicios cerca tuyo.
			</p>

			<!-- Search Box -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6">
				<form onsubmit={(e) => { e.preventDefault(); handleSearch(); }} class="flex flex-col md:flex-row gap-4">
					<div class="flex-1 relative">
						<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
						<input
							type="text"
							placeholder="¿Qué servicio buscás?"
							bind:value={searchQuery}
							class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
						/>
					</div>
					<div class="md:w-48 relative">
						<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
						<select
							bind:value={selectedDepartment}
							class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none appearance-none"
						>
							<option value="">Todo Uruguay</option>
							{#each DEPARTMENTS as dept}
								<option value={dept}>{dept}</option>
							{/each}
						</select>
					</div>
					{#if selectedDepartment === 'Montevideo'}
						<div class="md:w-48">
							<select
								bind:value={selectedNeighborhood}
								class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none appearance-none"
							>
								<option value="">Todos los barrios</option>
								{#each MONTEVIDEO_NEIGHBORHOODS as barrio}
									<option value={barrio}>{barrio}</option>
								{/each}
							</select>
						</div>
					{/if}
					<Button type="submit" size="lg" class="md:w-auto">
						Buscar
					</Button>
				</form>
			</div>
		</div>
		</div>
	</section>

	<!-- CTA for Providers -->
	<section class="container py-16">
		<div class="bg-primary-600 rounded-2xl p-8 md:p-12 text-center text-white">
			<h2 class="text-3xl font-bold mb-4">¿Tenés un negocio o servicio?</h2>
			<p class="text-primary-100 mb-8 max-w-2xl mx-auto">
				Registrate en Mi Barrio y que miles de personas te encuentren.
				100% gratuito, sin compromisos.
			</p>
			<a href="/auth/login?redirect=/registrar-negocio" class="inline-flex items-center justify-center gap-2 h-12 px-8 text-base rounded-lg bg-white text-primary-600 hover:bg-primary-50 font-medium transition-colors">
				<ArrowRight class="h-5 w-5" />
				Ofrecer servicios
			</a>
		</div>
	</section>

	<!-- Categories -->
	<section class="container py-16">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Categorías populares</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			{#each featuredCategories as category}
				{@const categorySlug = CATEGORY_SLUGS[category.name] || category.name}
				<a
					href="/{categorySlug}"
					class="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
				>
					<div class="w-12 h-12 rounded-full {category.color} flex items-center justify-center mb-3">
						<CategoryIcon name={category.icon} class="w-6 h-6 text-white" />
					</div>
					<span class="text-gray-900 dark:text-white font-medium">{category.label}</span>
				</a>
			{/each}
		</div>
		<div class="text-center mt-8">
			<a href="/directorio" class="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-2">
				Ver todas las categorías
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-gray-900 text-gray-400 py-12 pb-24 md:pb-12">
		<div class="container">
			<div class="grid md:grid-cols-4 gap-8">
				<div>
					<h3 class="flex items-center gap-2 text-white font-bold text-lg mb-4">
						<svg width="24" height="17" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="5" cy="6.5" r="3" fill="#FACC15"/>
							<rect x="11" y="2" width="15" height="3" rx="1.5" fill="currentColor"/>
							<rect x="11" y="8" width="15" height="3" rx="1.5" fill="currentColor"/>
							<rect x="0" y="14" width="26" height="3" rx="1.5" fill="currentColor"/>
						</svg>
						{APP_NAME}
					</h3>
					<p class="text-sm">El directorio de servicios locales de Uruguay.</p>
				</div>
				<div>
					<h4 class="text-white font-medium mb-4">Directorio</h4>
					<ul class="space-y-2 text-sm">
						<li><a href="/directorio" class="hover:text-white">Buscar servicios</a></li>
						<li><a href="/electricistas" class="hover:text-white">Electricistas</a></li>
						<li><a href="/plomeros" class="hover:text-white">Plomeros</a></li>
						<li><a href="/restaurantes" class="hover:text-white">Restaurantes</a></li>
						<li><a href="/farmacias" class="hover:text-white">Farmacias</a></li>
					</ul>
				</div>
				<div>
					<h4 class="text-white font-medium mb-4">Para proveedores</h4>
					<ul class="space-y-2 text-sm">
						<li><a href="/auth/login?redirect=/registrar-negocio" class="hover:text-white">Ofrecer servicios</a></li>
						<li><a href="/auth/login" class="hover:text-white">Ingresar</a></li>
					</ul>
				</div>
				<div>
					<h4 class="text-white font-medium mb-4">Legal</h4>
					<ul class="space-y-2 text-sm">
						<li><a href="/terms" class="hover:text-white">Términos de uso</a></li>
						<li><a href="/privacy" class="hover:text-white">Privacidad</a></li>
					</ul>
				</div>
			</div>
			<div class="border-t border-gray-800 mt-8 pt-8 text-sm text-center space-y-2">
				<p>
					<a href="mailto:contacto@mibarrio.com.uy" class="hover:text-white">contacto@mibarrio.com.uy</a>
				</p>
				<p>© {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.</p>
			</div>
		</div>
	</footer>
</div>
