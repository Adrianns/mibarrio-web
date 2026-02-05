<script lang="ts">
	import { MapPin, Phone, MessageCircle, ChevronRight } from 'lucide-svelte';
	import Header from '$lib/components/Header.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { getThumbUrl } from '$lib/utils/upload';
	import { DEPARTMENT_SLUGS, CATEGORY_SLUGS, NEIGHBORHOOD_SLUGS } from '$lib/seo/category-slugs';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Build location string for display
	const locationDisplay = $derived(
		data.neighborhood
			? `${data.neighborhood}, Montevideo`
			: data.department
				? data.department
				: 'Uruguay'
	);

	// Build FAQPage schema for SEO
	const faqSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: data.seo.faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer
			}
		}))
	});

	// Build ItemList schema for providers
	const itemListSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: data.seo.title,
		description: data.seo.description,
		numberOfItems: data.providers.length,
		itemListElement: data.providers.map((provider, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			item: {
				'@type': 'LocalBusiness',
				'@id': `https://mibarrio.com.uy/directorio/${provider.slug ? `@${provider.slug}` : provider.id}`,
				name: provider.business_name,
				description: provider.description || undefined,
				address: {
					'@type': 'PostalAddress',
					addressLocality: provider.neighborhood || provider.department,
					addressRegion: provider.department,
					addressCountry: 'UY'
				},
				telephone: provider.contact_phone || undefined
			}
		}))
	});

	// Combine schemas
	const jsonLd = $derived([faqSchema, itemListSchema]);

	// Build breadcrumb schema (supports up to 4 levels: Home > Category > Montevideo > Neighborhood)
	const breadcrumbSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Inicio',
				item: 'https://mibarrio.com.uy'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: data.categoryLabel,
				item: `https://mibarrio.com.uy/${data.categorySlug}`
			},
			...(data.department
				? [
						{
							'@type': 'ListItem',
							position: 3,
							name: data.department,
							item: `https://mibarrio.com.uy/${data.categorySlug}-${data.departmentSlug}`
						}
					]
				: []),
			...(data.neighborhood
				? [
						{
							'@type': 'ListItem',
							position: 4,
							name: data.neighborhood,
							item: `https://mibarrio.com.uy/${data.categorySlug}-montevideo-${data.neighborhoodSlug}`
						}
					]
				: [])
		]
	});

	// Get other departments for internal linking
	const otherDepartments = $derived(
		data.departmentCounts
			.filter((d: { department: string }) => d.department !== data.department)
			.slice(0, 8)
	);

	// Get other neighborhoods for internal linking (when viewing Montevideo)
	const otherNeighborhoods = $derived(
		data.neighborhoodCounts
			?.filter((n: { neighborhood: string }) => n.neighborhood !== data.neighborhood)
			.slice(0, 12) || []
	);
</script>

<SEO
	title={data.seo.title}
	description={data.seo.description}
	url={data.seo.canonicalPath}
	jsonLd={[...jsonLd, breadcrumbSchema]}
/>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<Header />

	<main class="container py-8">
		<!-- Breadcrumbs -->
		<nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 flex-wrap" aria-label="Breadcrumb">
			<a href="/" class="hover:text-primary-600">Inicio</a>
			<ChevronRight class="h-4 w-4 flex-shrink-0" />
			<a href="/directorio" class="hover:text-primary-600">Directorio</a>
			<ChevronRight class="h-4 w-4 flex-shrink-0" />
			{#if data.neighborhood}
				<!-- 4-level breadcrumb: Category > Montevideo > Neighborhood -->
				<a href="/{data.categorySlug}" class="hover:text-primary-600">{data.categoryLabel}</a>
				<ChevronRight class="h-4 w-4 flex-shrink-0" />
				<a href="/{data.categorySlug}-montevideo" class="hover:text-primary-600">Montevideo</a>
				<ChevronRight class="h-4 w-4 flex-shrink-0" />
				<span class="text-gray-900 dark:text-white font-medium">{data.neighborhood}</span>
			{:else if data.department}
				<!-- 3-level breadcrumb: Category > Department -->
				<a href="/{data.categorySlug}" class="hover:text-primary-600">{data.categoryLabel}</a>
				<ChevronRight class="h-4 w-4 flex-shrink-0" />
				<span class="text-gray-900 dark:text-white font-medium">{data.department}</span>
			{:else}
				<!-- 2-level breadcrumb: Category only -->
				<span class="text-gray-900 dark:text-white font-medium">{data.categoryLabel}</span>
			{/if}
		</nav>

		<!-- Page Header -->
		<header class="mb-8">
			<h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
				{data.categoryLabel} en {locationDisplay}
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
				{data.seo.description}
			</p>
			<p class="mt-2 text-sm text-gray-500 dark:text-gray-500">
				{data.totalInCategory} {data.totalInCategory === 1 ? 'negocio registrado' : 'negocios registrados'}
			</p>
		</header>

		<!-- Provider Grid -->
		{#if data.providers.length > 0}
			<section id="proveedores" class="mb-12">
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.providers as provider (provider.id)}
						<a
							href="/directorio/{provider.slug ? `@${provider.slug}` : provider.id}"
							class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
						>
							<article class="p-4">
								<div class="flex items-start gap-3 mb-3">
									{#if provider.logo_url}
										<img
											src={getThumbUrl(provider.logo_url)}
											alt={provider.business_name}
											loading="lazy"
											class="w-14 h-14 rounded-full object-cover flex-shrink-0"
										/>
									{:else}
										<div class="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center flex-shrink-0">
											<span class="text-xl font-bold text-primary-600 dark:text-primary-400">
												{provider.business_name.charAt(0)}
											</span>
										</div>
									{/if}
									<div class="flex-1 min-w-0">
										<h2 class="font-semibold text-gray-900 dark:text-white truncate">
											{provider.business_name}
										</h2>
										<div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
											<MapPin class="h-4 w-4 mr-1 flex-shrink-0" />
											{provider.neighborhood ? `${provider.neighborhood}, ` : ''}{provider.department}
										</div>
									</div>
									{#if provider.is_verified}
										<span class="flex-shrink-0 text-green-600 dark:text-green-400" title="Verificado">
											<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
											</svg>
										</span>
									{/if}
								</div>

								{#if provider.description}
									<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
										{provider.description}
									</p>
								{/if}

								<!-- Contact buttons -->
								<div class="flex gap-2">
									{#if provider.contact_phone}
										<span class="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
											<Phone class="h-3 w-3" />
											Teléfono
										</span>
									{/if}
									{#if provider.contact_whatsapp}
										<span class="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
											<MessageCircle class="h-3 w-3" />
											WhatsApp
										</span>
									{/if}
								</div>
							</article>
						</a>
					{/each}
				</div>

				{#if data.providers.length >= 50}
					<div class="mt-8 text-center">
						<a
							href="/directorio?categoria={data.category}{data.department ? `&departamento=${data.department}` : ''}{data.neighborhood ? `&barrio=${data.neighborhood}` : ''}"
							class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
						>
							Ver todos los resultados
							<ChevronRight class="h-4 w-4" />
						</a>
					</div>
				{/if}
			</section>
		{:else}
			<section class="bg-white dark:bg-gray-800 rounded-xl p-8 text-center mb-12">
				<p class="text-gray-600 dark:text-gray-400 mb-4">
					No hay {data.categoryLabel?.toLowerCase()} registrados en {locationDisplay} todavía.
				</p>
				<a
					href="/auth/register?redirect=/registrar-negocio"
					class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
				>
					Registrar negocio
				</a>
			</section>
		{/if}

		<!-- Internal Links: Other Neighborhoods in Montevideo -->
		{#if otherNeighborhoods.length > 0}
			<section class="mb-12">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					{data.categoryLabel} en otros barrios de Montevideo
				</h2>
				<div class="flex flex-wrap gap-2">
					{#each otherNeighborhoods as nb}
						{@const nbSlug = NEIGHBORHOOD_SLUGS[nb.neighborhood as keyof typeof NEIGHBORHOOD_SLUGS]}
						{#if nbSlug}
							<a
								href="/{data.categorySlug}-montevideo-{nbSlug}"
								class="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm"
							>
								{nb.neighborhood}
								<span class="text-gray-400 dark:text-gray-500 text-sm ml-1">({nb.count})</span>
							</a>
						{/if}
					{/each}
				</div>
			</section>
		{/if}

		<!-- Internal Links: Other Departments -->
		{#if otherDepartments.length > 0 && !data.neighborhood}
			<section class="mb-12">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					{data.categoryLabel} en otros departamentos
				</h2>
				<div class="flex flex-wrap gap-2">
					{#each otherDepartments as dept}
						{@const deptSlug = DEPARTMENT_SLUGS[dept.department as keyof typeof DEPARTMENT_SLUGS]}
						<a
							href="/{data.categorySlug}-{deptSlug}"
							class="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm"
						>
							{dept.department}
							<span class="text-gray-400 dark:text-gray-500 text-sm ml-1">({dept.count})</span>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<!-- SEO Content: Services and Keywords -->
		{#if data.seo.relatedServices && data.seo.relatedServices.length > 0}
			<section class="mb-12">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					Servicios de {data.categoryLabel?.toLowerCase()} en {locationDisplay}
				</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-4">
					Los {data.categoryLabel?.toLowerCase()} en {locationDisplay} ofrecen diversos servicios como:
				</p>
				<div class="flex flex-wrap gap-2">
					{#each data.seo.relatedServices as service}
						<span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
							{service}
						</span>
					{/each}
				</div>
			</section>
		{/if}

		<!-- SEO Content: Common Needs -->
		{#if data.seo.commonNeeds && data.seo.commonNeeds.length > 0}
			<section class="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 mb-12">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
					¿Necesitás {data.categoryLabel?.toLowerCase()} en {locationDisplay}?
				</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-4">
					Ya sea por {data.seo.commonNeeds.slice(0, -1).join(', ')} o {data.seo.commonNeeds[data.seo.commonNeeds.length - 1]},
					en Mi Barrio encontrás {data.categoryLabel?.toLowerCase()} profesionales listos para ayudarte.
					Contactá directo por WhatsApp o teléfono, sin intermediarios.
				</p>
				<a
					href="#proveedores"
					class="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
				>
					Ver {data.categoryLabel?.toLowerCase()} disponibles
					<ChevronRight class="h-4 w-4" />
				</a>
			</section>
		{/if}

		<!-- FAQ Section -->
		{#if data.seo.faqs.length > 0}
			<section class="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 mb-12">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
					Preguntas frecuentes sobre {data.categoryLabel?.toLowerCase()} en {locationDisplay}
				</h2>
				<div class="space-y-6">
					{#each data.seo.faqs as faq, i}
						<div class="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
							<h3 class="font-medium text-gray-900 dark:text-white mb-2">
								{faq.question}
							</h3>
							<p class="text-gray-600 dark:text-gray-400">
								{faq.answer}
							</p>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Related Categories - Internal Links for SEO -->
		<section>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
				Otras categorías en {locationDisplay}
			</h2>
			<div class="flex flex-wrap gap-2">
				{#each Object.entries(CATEGORY_SLUGS).slice(0, 12) as [catName, catSlug]}
					{#if catSlug !== data.categorySlug && catSlug !== 'otros'}
						{@const href = data.neighborhoodSlug
							? `/${catSlug}-montevideo-${data.neighborhoodSlug}`
							: data.departmentSlug
								? `/${catSlug}-${data.departmentSlug}`
								: `/${catSlug}`}
						<a
							{href}
							class="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm capitalize"
						>
							{catSlug.replace(/-/g, ' ')}
						</a>
					{/if}
				{/each}
			</div>
		</section>
	</main>
</div>
