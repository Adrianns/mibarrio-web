<script lang="ts">
	import { Search, MapPin, Building2, User, ArrowRight } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { DEFAULT_CATEGORIES, DEPARTMENTS, type Department } from '$lib/domain/types';
	import { APP_NAME, APP_TAGLINE } from '$lib/config';

	let searchQuery = $state('');
	let selectedDepartment = $state<Department | ''>('');

	const featuredCategories = DEFAULT_CATEGORIES.filter((c) => c.is_active).slice(0, 8);

	function handleSearch() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (selectedDepartment) params.set('departamento', selectedDepartment);
		window.location.href = `/directorio?${params.toString()}`;
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
	<!-- Header -->
	<header class="container py-4">
		<nav class="flex items-center justify-between">
			<a href="/" class="text-2xl font-bold text-primary-600">{APP_NAME}</a>
			<div class="flex items-center gap-4">
				<a href="/directorio" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Directorio</a>
				<a href="/planes" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Planes</a>
				<a href="/auth/login" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Ingresar</a>
				<ThemeToggle />
				<Button href="/registrar-negocio">Registrar negocio</Button>
			</div>
		</nav>
	</header>

	<!-- Hero -->
	<section class="container py-16 md:py-24">
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
							<option value="">Departamento</option>
							{#each DEPARTMENTS as dept}
								<option value={dept}>{dept}</option>
							{/each}
						</select>
					</div>
					<Button type="submit" size="lg" class="md:w-auto">
						Buscar
					</Button>
				</form>
			</div>
		</div>
	</section>

	<!-- Categories -->
	<section class="container py-16">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Categorías populares</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			{#each featuredCategories as category}
				<a
					href="/directorio?categoria={category.name}"
					class="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
				>
					<div class="w-12 h-12 rounded-full {category.color} flex items-center justify-center mb-3">
						<span class="text-white text-xl">
							{category.label.charAt(0)}
						</span>
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

	<!-- CTA for Providers -->
	<section class="container py-16">
		<div class="bg-primary-600 rounded-2xl p-8 md:p-12 text-center text-white">
			<h2 class="text-3xl font-bold mb-4">¿Tenés un negocio o servicio?</h2>
			<p class="text-primary-100 mb-8 max-w-2xl mx-auto">
				Registrate en Mi Barrio y que miles de personas te encuentren.
				Planes desde $390/mes.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<Button href="/registrar-negocio" variant="secondary" size="lg" class="inline-flex items-center gap-2">
					<User class="h-5 w-5" />
					Soy particular
				</Button>
				<Button href="/registrar-negocio" variant="outline" size="lg" class="inline-flex items-center gap-2 !text-white !border-white hover:!bg-white/10">
					<Building2 class="h-5 w-5" />
					Tengo empresa
				</Button>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-gray-900 text-gray-400 py-12">
		<div class="container">
			<div class="grid md:grid-cols-4 gap-8">
				<div>
					<h3 class="text-white font-bold text-lg mb-4">{APP_NAME}</h3>
					<p class="text-sm">El directorio de servicios locales de Uruguay.</p>
				</div>
				<div>
					<h4 class="text-white font-medium mb-4">Directorio</h4>
					<ul class="space-y-2 text-sm">
						<li><a href="/directorio" class="hover:text-white">Buscar servicios</a></li>
						<li><a href="/directorio?tipo=service" class="hover:text-white">Profesionales</a></li>
						<li><a href="/directorio?tipo=business" class="hover:text-white">Comercios</a></li>
					</ul>
				</div>
				<div>
					<h4 class="text-white font-medium mb-4">Para negocios</h4>
					<ul class="space-y-2 text-sm">
						<li><a href="/registrar-negocio" class="hover:text-white">Registrar negocio</a></li>
						<li><a href="/planes" class="hover:text-white">Ver planes</a></li>
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
			<div class="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
				© {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
			</div>
		</div>
	</footer>
</div>
