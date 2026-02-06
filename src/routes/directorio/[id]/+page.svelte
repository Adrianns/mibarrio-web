<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		Phone,
		MessageCircle,
		Mail,
		Globe,
		Instagram,
		Facebook,
		MapPin,
		ArrowLeft,
		Share2,
		CheckCircle,
		Loader2,
		X,
		ChevronLeft,
		ChevronRight,
		Camera,
		FileText,
		Plus,
		Flag
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import ClaimProfileButton from '$lib/components/ClaimProfileButton.svelte';
	import { APP_NAME } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { supabase } from '$lib/supabase';
	import { DEFAULT_CATEGORIES } from '$lib/domain/types';
	import type { ProviderService, ProviderHours, ProviderPromotion } from '$lib/domain/types';
	import { isPremium as checkPremium } from '$lib/utils/subscription';
	import ServicesList from '$lib/components/ServicesList.svelte';
	import ProductsList from '$lib/components/ProductsList.svelte';
	import BusinessHours from '$lib/components/BusinessHours.svelte';
	import PromotionsList from '$lib/components/PromotionsList.svelte';
	import { buildLocalBusinessSchema, buildBreadcrumbSchema } from '$lib/seo/schemas';
	import { SITE_DESCRIPTION } from '$lib/seo/constants';
	import { addRecentlyViewed } from '$lib/stores/activity';

	const routeParam = $page.params.id;

	// Detect if the route param is a UUID or slug
	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routeParam);
	const slugParam = routeParam.startsWith('@') ? routeParam.slice(1) : routeParam;

	// Types
	interface ProviderDetail {
		id: string;
		slug: string | null;
		business_name: string;
		business_type: string;
		description: string | null;
		department: string;
		neighborhood: string | null;
		address: string | null;
		contact_phone: string | null;
		contact_whatsapp: string | null;
		contact_email: string | null;
		website: string | null;
		social_instagram: string | null;
		social_facebook: string | null;
		logo_url: string | null;
		photos: string[];
		is_verified: boolean;
		is_featured: boolean;
		is_claimed: boolean;
		view_count: number;
		categories: string[];
		banner_url: string | null;
	}

	let loading = $state(true);
	let provider = $state<ProviderDetail | null>(null);
	let error = $state<string | null>(null);
	let services = $state<ProviderService[]>([]);
	let products = $state<ProviderService[]>([]);
	let hours = $state<ProviderHours[]>([]);
	let promotions = $state<ProviderPromotion[]>([]);
	let hasPremium = $state(false);

	// Lightbox state
	let lightboxOpen = $state(false);
	let lightboxIndex = $state(0);

	function openLightbox(index: number) {
		lightboxIndex = index;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	function nextImage() {
		if (provider?.photos) {
			lightboxIndex = (lightboxIndex + 1) % provider.photos.length;
		}
	}

	function prevImage() {
		if (provider?.photos) {
			lightboxIndex = (lightboxIndex - 1 + provider.photos.length) % provider.photos.length;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowRight') nextImage();
		if (e.key === 'ArrowLeft') prevImage();
	}

	function ensureProtocol(url: string): string {
		if (!/^https?:\/\//i.test(url)) return `https://${url}`;
		return url;
	}

	function getCategoryInfo(categoryName: string) {
		const cat = DEFAULT_CATEGORIES.find((c) => c.name === categoryName);
		return cat || { label: categoryName, color: 'bg-gray-500' };
	}

	async function fetchProvider() {
		loading = true;
		error = null;

		// Build query based on identifier type (UUID or slug)
		let query = supabase
			.from('mb_providers')
			.select(
				`
				id,
				slug,
				business_name,
				business_type,
				description,
				department,
				neighborhood,
				address,
				contact_phone,
				contact_whatsapp,
				contact_email,
				website,
				social_instagram,
				social_facebook,
				logo_url,
				photos,
				is_verified,
				is_featured,
				is_claimed,
				is_active,
				view_count,
				banner_url
			`
			)
			.eq('is_active', true);

		// Filter by UUID or slug
		if (isUUID) {
			query = query.eq('id', routeParam);
		} else {
			query = query.eq('slug', slugParam.toLowerCase());
		}

		const { data, error: fetchError } = await query.single();

		if (fetchError || !data) {
			error = 'No se encontró el negocio';
			loading = false;
			return;
		}

		// Fetch categories using the actual provider ID
		const { data: categoriesData } = await supabase
			.from('mb_provider_categories')
			.select('category_name')
			.eq('provider_id', data.id);

		provider = {
			...data,
			categories: categoriesData?.map((c) => c.category_name) || []
		};

		// Load additional data in parallel
		const [servicesRes, hoursRes, promosRes, subRes] = await Promise.all([
			supabase.from('mb_provider_services').select('*').eq('provider_id', data.id).eq('is_active', true).order('display_order'),
			supabase.from('mb_provider_hours').select('*').eq('provider_id', data.id).order('day_of_week'),
			supabase.from('mb_provider_promotions').select('*').eq('provider_id', data.id).eq('is_active', true).order('created_at', { ascending: false }),
			supabase.from('mb_subscriptions').select('*').eq('provider_id', data.id).maybeSingle()
		]);

		const allServices = servicesRes.data || [];
		services = allServices.filter((s: ProviderService) => s.type !== 'product');
		products = allServices.filter((s: ProviderService) => s.type === 'product');
		hours = hoursRes.data || [];
		hasPremium = checkPremium(subRes.data);
		promotions = hasPremium ? (promosRes.data || []) : [];

		loading = false;

		// Track this view in user activity
		addRecentlyViewed({
			id: provider.id,
			name: provider.business_name,
			category: provider.categories[0] || 'otro',
			department: provider.department,
			logoUrl: provider.logo_url || provider.photos?.[0]
		});

		// Increment view count (fire and forget - don't block page load)
		supabase.rpc('mb_increment_provider_view', { provider_uuid: provider.id });
	}

	async function handleContactClick(type: 'phone' | 'whatsapp' | 'email' | 'website' | 'instagram' | 'facebook') {
		if (!provider) return;

		// Log contact click and increment counter
		await supabase.rpc('mb_log_contact_click', {
			p_provider_id: provider.id,
			p_contact_type: type
		});

		if (type === 'phone' && provider.contact_phone) {
			window.location.href = `tel:${provider.contact_phone}`;
		} else if (type === 'whatsapp' && provider.contact_whatsapp) {
			const whatsappNumber = provider.contact_whatsapp.replace(/\D/g, '');
			window.open(
				`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola! Encontré tu perfil en mibarrio.com.uy y te escribo porque: ')}`,
				'_blank'
			);
		} else if (type === 'email' && provider.contact_email) {
			window.location.href = `mailto:${provider.contact_email}`;
		}
	}

	let reportSent = $state(false);
	let reportLoading = $state(false);

	async function handleReport() {
		if (!provider || reportSent || reportLoading) return;
		reportLoading = true;
		const { error } = await supabase.from('mb_provider_reports').insert({
			provider_id: provider.id,
			reason: 'non_existent'
		});
		reportLoading = false;
		if (error) {
			toast.error('Error al enviar el reporte');
		} else {
			reportSent = true;
			toast.success('Reporte enviado, gracias');
		}
	}

	function handleShare() {
		if (!provider) return;

		// Prefer slug URL for sharing
		const shareUrl = provider.slug
			? `${window.location.origin}/directorio/@${provider.slug}`
			: window.location.href;
		const shareText = `Mirá el perfil de ${provider.business_name} en mibarrio.com.uy`;

		if (navigator.share) {
			navigator.share({
				title: provider.business_name,
				text: shareText,
				url: shareUrl
			});
		} else {
			navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
			toast.success('Enlace copiado al portapapeles');
		}
	}

	// Build SEO schemas
	const localBusinessSchema = $derived(
		provider
			? buildLocalBusinessSchema({
					id: provider.id,
					name: provider.business_name,
					description: provider.description || '',
					phone: provider.contact_phone || undefined,
					city: provider.neighborhood || undefined,
					department: provider.department,
					logo_url: provider.logo_url || undefined,
					category: provider.categories[0] || undefined
				})
			: null
	);

	const breadcrumbSchema = $derived(
		provider
			? buildBreadcrumbSchema([
					{ name: 'Inicio', url: '/' },
					{ name: 'Directorio', url: '/directorio' },
					{ name: provider.business_name, url: `/directorio/${provider.id}` }
				])
			: null
	);

	const jsonLdSchemas = $derived(
		localBusinessSchema && breadcrumbSchema ? [localBusinessSchema, breadcrumbSchema] : null
	);

	onMount(() => {
		fetchProvider();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if provider}
	<SEO
		title={provider.business_name}
		description={provider.description || `${provider.business_name} en Mi Barrio - Servicios locales en ${provider.department}`}
		url="/directorio/{provider.id}"
		image={provider.logo_url || provider.photos?.[0]}
		jsonLd={jsonLdSchemas}
	/>
{:else}
	<SEO title="Cargando..." description={SITE_DESCRIPTION} noindex />
{/if}

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<Header items={[{ label: 'Directorio', href: '/directorio/mapa' }]} />

	<div class="container py-8">
		<!-- Back button -->
		<a href="/directorio" class="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Volver al directorio
		</a>

		{#if loading}
			<div class="flex items-center justify-center py-12">
				<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
				<span class="ml-2 text-gray-600 dark:text-gray-400">Cargando...</span>
			</div>
		{:else if error || !provider}
			<div class="text-center py-12">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No encontrado</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-4">{error || 'El negocio que buscás no existe o fue desactivado.'}</p>
				<a
					href="/directorio"
					class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
				>
					Volver al directorio
				</a>
			</div>
		{:else}
			<div class="grid lg:grid-cols-3 gap-8">
				<!-- Main content -->
				<div class="lg:col-span-2">
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
						{#if provider.banner_url}
							<div class="w-full h-48 sm:h-64 overflow-hidden">
								<img
									src={provider.banner_url}
									alt="Portada de {provider.business_name}"
									loading="lazy"
									class="w-full h-full object-cover"
								/>
							</div>
						{/if}
						<div class="p-6">
							<div class="flex items-start justify-between mb-4">
								<div class="flex items-start gap-4">
									<!-- Profile photo -->
									{#if provider.logo_url}
										<img
											src={provider.logo_url}
											alt={provider.business_name}
											loading="lazy"
											class="w-20 h-20 rounded-full object-cover flex-shrink-0"
										/>
									{:else if provider.photos && provider.photos.length > 0}
										<img
											src={provider.photos[0]}
											alt={provider.business_name}
											loading="lazy"
											class="w-20 h-20 rounded-full object-cover flex-shrink-0"
										/>
									{:else}
										<div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center flex-shrink-0">
											<span class="text-3xl font-bold text-primary-400">
												{provider.business_name.charAt(0)}
											</span>
										</div>
									{/if}
									<div>
										<div class="flex items-center gap-2 mb-2">
											<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{provider.business_name}</h1>
											{#if provider.is_verified}
												<CheckCircle class="h-6 w-6 text-green-500" />
											{/if}
										</div>
									<div class="flex flex-wrap gap-2">
										{#each provider.categories as categoryName (categoryName)}
											{@const catInfo = getCategoryInfo(categoryName)}
											<span class="text-sm {catInfo.color} text-white px-3 py-1 rounded-full">
												{catInfo.label}
											</span>
										{/each}
										{#if provider.is_featured}
											<span class="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
												Destacado
											</span>
										{/if}
										{#if !provider.is_claimed}
											<span class="text-sm bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
												Perfil no reclamado
											</span>
										{/if}
									</div>
								</div>
								</div>
								<button onclick={handleShare} class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
									<Share2 class="h-5 w-5" />
								</button>
							</div>

							<div class="flex items-center text-gray-500 dark:text-gray-400 mb-6">
								<MapPin class="h-5 w-5 mr-2" />
								{provider.address ? `${provider.address}, ` : ''}{provider.neighborhood
									? `${provider.neighborhood}, `
									: ''}{provider.department}
							</div>

							<!-- Description section -->
							<div class="prose max-w-none">
								<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Descripción</h2>
								{#if provider.description}
									<p class="text-gray-600 dark:text-gray-300 whitespace-pre-line">{provider.description}</p>
								{:else}
									<div class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
										<FileText class="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
										<p class="text-gray-400 dark:text-gray-500 text-sm">
											Este negocio aún no tiene descripción
										</p>
									</div>
								{/if}
							</div>

							<!-- Photos section -->
							<div class="mt-8">
								<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Fotos</h2>
								{#if provider.photos && provider.photos.length > 0}
									<div class="grid grid-cols-3 gap-4">
										{#each provider.photos as photo, i (photo)}
											<button
												type="button"
												onclick={() => openLightbox(i)}
												class="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg overflow-hidden"
											>
												<img src={photo} alt="Foto" loading="lazy" class="rounded-lg object-cover aspect-square w-full h-full hover:scale-105 transition-transform" />
											</button>
										{/each}
									</div>
								{:else}
									<div class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
										<Camera class="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
										<p class="text-gray-400 dark:text-gray-500 text-sm">
											Este negocio aún no tiene fotos
										</p>
									</div>
								{/if}
							</div>

							<!-- Services section -->
							{#if services.length > 0}
								<div class="mt-8">
									<ServicesList {services} />
								</div>
							{/if}

							<!-- Products catalog section -->
							{#if products.length > 0}
								<div class="mt-8">
									<ProductsList {products} />
								</div>
							{/if}

							<!-- Business hours section -->
							{#if hours.length > 0}
								<div class="mt-8">
									<BusinessHours {hours} />
								</div>
							{/if}

							<!-- Promotions section (premium only) -->
							{#if promotions.length > 0}
								<div class="mt-8">
									<PromotionsList {promotions} />
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Contact sidebar -->
				<div class="lg:col-span-1">
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-8">
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contactar</h2>

						<div class="space-y-3">
							{#if provider.contact_phone}
								<Button
									variant="default"
									size="lg"
									class="w-full justify-start"
									onclick={() => handleContactClick('phone')}
								>
									<Phone class="h-5 w-5 mr-3" />
									Llamar: {provider.contact_phone}
								</Button>
							{:else}
								<div class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 dark:text-gray-500">
									<Phone class="h-5 w-5" />
									<span class="text-sm">Sin teléfono</span>
								</div>
							{/if}

							{#if provider.contact_whatsapp}
								<Button
									variant="secondary"
									size="lg"
									class="w-full justify-start"
									onclick={() => handleContactClick('whatsapp')}
								>
									<MessageCircle class="h-5 w-5 mr-3" />
									WhatsApp
								</Button>
							{:else}
								<div class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 dark:text-gray-500">
									<MessageCircle class="h-5 w-5" />
									<span class="text-sm">Sin WhatsApp</span>
								</div>
							{/if}

							{#if provider.contact_email}
								<Button
									variant="outline"
									size="lg"
									class="w-full justify-start"
									onclick={() => handleContactClick('email')}
								>
									<Mail class="h-5 w-5 mr-3" />
									Email
								</Button>
							{:else}
								<div class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 dark:text-gray-500">
									<Mail class="h-5 w-5" />
									<span class="text-sm">Sin email</span>
								</div>
							{/if}
						</div>

						<hr class="my-6 dark:border-gray-700" />
						<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Redes y web</h3>
						<div class="space-y-1">
							{#if provider.website}
								<a
									href={ensureProtocol(provider.website)}
									target="_blank"
									rel="noopener noreferrer"
									onclick={() => handleContactClick('website')}
									class="flex items-center gap-3 py-3 px-2 -mx-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
								>
									<Globe class="h-5 w-5 flex-shrink-0" />
									<span class="truncate">Sitio web</span>
								</a>
							{:else}
								<div class="flex items-center gap-3 py-3 px-2 text-gray-300 dark:text-gray-600">
									<Globe class="h-5 w-5 flex-shrink-0" />
									<span class="text-sm">Sin sitio web</span>
								</div>
							{/if}
							{#if provider.social_instagram}
								<a
									href={ensureProtocol(provider.social_instagram)}
									target="_blank"
									rel="noopener noreferrer"
									onclick={() => handleContactClick('instagram')}
									class="flex items-center gap-3 py-3 px-2 -mx-2 text-gray-600 dark:text-gray-400 hover:text-pink-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
								>
									<Instagram class="h-5 w-5 flex-shrink-0" />
									<span class="truncate">Instagram</span>
								</a>
							{:else}
								<div class="flex items-center gap-3 py-3 px-2 text-gray-300 dark:text-gray-600">
									<Instagram class="h-5 w-5 flex-shrink-0" />
									<span class="text-sm">Sin Instagram</span>
								</div>
							{/if}
							{#if provider.social_facebook}
								<a
									href={ensureProtocol(provider.social_facebook)}
									target="_blank"
									rel="noopener noreferrer"
									onclick={() => handleContactClick('facebook')}
									class="flex items-center gap-3 py-3 px-2 -mx-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
								>
									<Facebook class="h-5 w-5 flex-shrink-0" />
									<span class="truncate">Facebook</span>
								</a>
							{:else}
								<div class="flex items-center gap-3 py-3 px-2 text-gray-300 dark:text-gray-600">
									<Facebook class="h-5 w-5 flex-shrink-0" />
									<span class="text-sm">Sin Facebook</span>
								</div>
							{/if}
						</div>

						{#if !provider.is_claimed}
							<hr class="my-6 dark:border-gray-700" />
							<ClaimProfileButton
								providerId={provider.id}
								providerName={provider.business_name}
							/>
							<button
								onclick={handleReport}
								disabled={reportSent || reportLoading}
								class="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Flag class="h-3 w-3" />
								{#if reportSent}
									Reportado
								{:else if reportLoading}
									Enviando...
								{:else}
									Reportar como negocio inexistente
								{/if}
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Lightbox Modal -->
{#if lightboxOpen && provider?.photos}
	<div class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
		<!-- Close button -->
		<button
			type="button"
			onclick={closeLightbox}
			class="absolute top-4 right-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
			aria-label="Cerrar"
		>
			<X class="h-8 w-8" />
		</button>

		<!-- Previous button -->
		{#if provider.photos.length > 1}
			<button
				type="button"
				onclick={prevImage}
				class="absolute left-2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
				aria-label="Anterior"
			>
				<ChevronLeft class="h-10 w-10" />
			</button>
		{/if}

		<!-- Image -->
		<div class="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
			<img
				src={provider.photos[lightboxIndex]}
				alt="Foto {lightboxIndex + 1}"
				class="max-w-full max-h-[90vh] object-contain"
			/>
		</div>

		<!-- Next button -->
		{#if provider.photos.length > 1}
			<button
				type="button"
				onclick={nextImage}
				class="absolute right-2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
				aria-label="Siguiente"
			>
				<ChevronRight class="h-10 w-10" />
			</button>
		{/if}

		<!-- Counter -->
		{#if provider.photos.length > 1}
			<div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
				{lightboxIndex + 1} / {provider.photos.length}
			</div>
		{/if}

		<!-- Backdrop click to close -->
		<button
			type="button"
			onclick={closeLightbox}
			class="absolute inset-0 -z-10"
			aria-label="Cerrar"
		></button>
	</div>
{/if}
