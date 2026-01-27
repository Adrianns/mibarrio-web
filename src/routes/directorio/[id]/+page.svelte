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
		Loader2
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { supabase } from '$lib/supabase';
	import { DEFAULT_CATEGORIES } from '$lib/domain/types';

	const providerId = $page.params.id;
	const APPYUDA_URL = 'https://appyuda.com.uy';

	// Types
	interface ProviderDetail {
		id: string;
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
		view_count: number;
		categories: string[];
	}

	let loading = $state(true);
	let provider = $state<ProviderDetail | null>(null);
	let error = $state<string | null>(null);

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

		// Fetch provider
		const { data, error: fetchError } = await supabase
			.from('mb_providers')
			.select(
				`
				id,
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
				is_active,
				view_count
			`
			)
			.eq('id', providerId)
			.eq('is_active', true)
			.single();

		if (fetchError || !data) {
			error = 'No se encontró el negocio';
			loading = false;
			return;
		}

		// Fetch categories
		const { data: categoriesData } = await supabase
			.from('mb_provider_categories')
			.select('category_name')
			.eq('provider_id', providerId);

		provider = {
			...data,
			categories: categoriesData?.map((c) => c.category_name) || []
		};

		// Increment view count
		await supabase.rpc('mb_increment_view_count', { provider_id: providerId });

		loading = false;
	}

	async function handleContactClick(type: 'phone' | 'whatsapp' | 'email' | 'website' | 'social') {
		if (!provider) return;

		// Log contact click
		await supabase.from('mb_contact_clicks').insert({
			provider_id: providerId,
			contact_type: type
		});

		if (type === 'phone' && provider.contact_phone) {
			window.location.href = `tel:${provider.contact_phone}`;
		} else if (type === 'whatsapp' && provider.contact_whatsapp) {
			const whatsappNumber = provider.contact_whatsapp.replace(/\D/g, '');
			window.open(
				`https://wa.me/${whatsappNumber}?text=Hola, te contacto desde Mi Barrio`,
				'_blank'
			);
		} else if (type === 'email' && provider.contact_email) {
			window.location.href = `mailto:${provider.contact_email}`;
		}
	}

	function handleShare() {
		if (!provider) return;

		if (navigator.share) {
			navigator.share({
				title: provider.business_name,
				text: provider.description || '',
				url: window.location.href
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success('Enlace copiado al portapapeles');
		}
	}

	onMount(() => {
		fetchProvider();
	});
</script>

<svelte:head>
	{#if provider}
		<title>{provider.business_name} - {APP_NAME}</title>
		<meta name="description" content={provider.description || ''} />
	{:else}
		<title>Cargando... - {APP_NAME}</title>
	{/if}
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<Header items={[{ label: 'Directorio', href: '/directorio' }]} />

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
						<!-- Header image -->
						<div
							class="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"
						>
							{#if provider.logo_url}
								<img
									src={provider.logo_url}
									alt={provider.business_name}
									loading="lazy"
									class="w-full h-full object-cover"
								/>
							{:else if provider.photos && provider.photos.length > 0}
								<img
									src={provider.photos[0]}
									alt={provider.business_name}
									loading="lazy"
									class="w-full h-full object-cover"
								/>
							{:else}
								<span class="text-6xl font-bold text-primary-400">
									{provider.business_name.charAt(0)}
								</span>
							{/if}
						</div>

						<div class="p-6">
							<div class="flex items-start justify-between mb-4">
								<div>
									<div class="flex items-center gap-2 mb-2">
										<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{provider.business_name}</h1>
										{#if provider.is_verified}
											<CheckCircle class="h-6 w-6 text-green-500" />
										{/if}
									</div>
									<div class="flex flex-wrap gap-2">
										{#each provider.categories as categoryName}
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

							{#if provider.description}
								<div class="prose max-w-none">
									<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Descripción</h2>
									<p class="text-gray-600 dark:text-gray-300 whitespace-pre-line">{provider.description}</p>
								</div>
							{/if}

							{#if provider.photos && provider.photos.length > 1}
								<div class="mt-8">
									<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Fotos</h2>
									<div class="grid grid-cols-3 gap-4">
										{#each provider.photos.slice(1) as photo}
											<img src={photo} alt="Foto" loading="lazy" class="rounded-lg object-cover aspect-square" />
										{/each}
									</div>
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
							{/if}
						</div>

						{#if provider.website || provider.social_instagram || provider.social_facebook}
							<hr class="my-6 dark:border-gray-700" />
							<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Redes y web</h3>
							<div class="space-y-2">
								{#if provider.website}
									<a
										href={ensureProtocol(provider.website)}
										target="_blank"
										rel="noopener noreferrer"
										onclick={() => handleContactClick('website')}
										class="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600"
									>
										<Globe class="h-5 w-5 mr-2" />
										Sitio web
									</a>
								{/if}
								{#if provider.social_instagram}
									<a
										href={ensureProtocol(provider.social_instagram)}
										target="_blank"
										rel="noopener noreferrer"
										onclick={() => handleContactClick('social')}
										class="flex items-center text-gray-600 dark:text-gray-400 hover:text-pink-600"
									>
										<Instagram class="h-5 w-5 mr-2" />
										Instagram
									</a>
								{/if}
								{#if provider.social_facebook}
									<a
										href={ensureProtocol(provider.social_facebook)}
										target="_blank"
										rel="noopener noreferrer"
										onclick={() => handleContactClick('social')}
										class="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600"
									>
										<Facebook class="h-5 w-5 mr-2" />
										Facebook
									</a>
								{/if}
							</div>
						{/if}

						<hr class="my-6 dark:border-gray-700" />
						<p class="text-xs text-gray-400 dark:text-gray-500 text-center">
							{provider.view_count} visitas
						</p>

						<!-- Appyuda Mini Banner -->
						<div class="mt-6 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-lg">
							<p class="text-xs text-green-800 dark:text-green-300 text-center">
								¿Querés más clientes?
								<a
									href={APPYUDA_URL}
									target="_blank"
									rel="noopener noreferrer"
									class="font-bold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline"
								>
									Probá Appyuda
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Appyuda Full Banner -->
			<div class="mt-8 p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white">
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
		{/if}
	</div>
</div>
