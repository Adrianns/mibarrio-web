<script lang="ts">
	import { page } from '$app/stores';
	import { Phone, MessageCircle, Mail, Globe, Instagram, Facebook, MapPin, ArrowLeft, Share2, CheckCircle } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { APP_NAME } from '$lib/config';
	import { toast } from '$lib/stores/toast';

	const providerId = $page.params.id;

	// Mock data - in production this comes from Supabase
	const provider = {
		id: providerId,
		display_name: 'Juan Pérez Electricidad',
		description: `Electricista matriculado con más de 15 años de experiencia en instalaciones eléctricas residenciales y comerciales.

Servicios que ofrezco:
- Instalaciones eléctricas nuevas
- Reparaciones y mantenimiento
- Tableros eléctricos
- Iluminación LED
- Detección de fallas
- Emergencias 24 horas

Trabajo con garantía y materiales de primera calidad. Presupuestos sin cargo.`,
		short_description: 'Electricista matriculado con 15 años de experiencia',
		department: 'Montevideo',
		neighborhood: 'Pocitos',
		address: 'Av. Brasil 2500',
		contact_phone: '099123456',
		contact_whatsapp: '59899123456',
		contact_email: 'juan@electricidad.com',
		website_url: 'https://juanelectricidad.com',
		instagram_url: 'https://instagram.com/juanelectricidad',
		facebook_url: 'https://facebook.com/juanelectricidad',
		is_verified: true,
		is_featured: true,
		provider_type: 'individual',
		categories: [
			{ name: 'electricista', label: 'Electricistas', color: 'bg-yellow-500' }
		],
		photos: [],
		view_count: 245,
		created_at: '2024-01-15'
	};

	function handleContactClick(type: string) {
		// In production, this would call the API to log the click
		console.log('Contact click:', type, providerId);

		if (type === 'phone') {
			window.location.href = `tel:${provider.contact_phone}`;
		} else if (type === 'whatsapp') {
			window.open(`https://wa.me/${provider.contact_whatsapp}?text=Hola, te contacto desde Mi Barrio`, '_blank');
		} else if (type === 'email') {
			window.location.href = `mailto:${provider.contact_email}`;
		}
	}

	function handleShare() {
		if (navigator.share) {
			navigator.share({
				title: provider.display_name,
				text: provider.short_description,
				url: window.location.href
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success('Enlace copiado al portapapeles');
		}
	}
</script>

<svelte:head>
	<title>{provider.display_name} - {APP_NAME}</title>
	<meta name="description" content={provider.short_description} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white border-b border-gray-200">
		<div class="container py-4">
			<nav class="flex items-center justify-between">
				<a href="/" class="text-2xl font-bold text-primary-600">{APP_NAME}</a>
				<div class="flex items-center gap-4">
					<a href="/directorio" class="text-gray-600 hover:text-gray-900">Directorio</a>
					<Button href="/registrar-negocio">Registrar negocio</Button>
				</div>
			</nav>
		</div>
	</header>

	<div class="container py-8">
		<!-- Back button -->
		<a href="/directorio" class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Volver al directorio
		</a>

		<div class="grid lg:grid-cols-3 gap-8">
			<!-- Main content -->
			<div class="lg:col-span-2">
				<div class="bg-white rounded-xl shadow-sm overflow-hidden">
					<!-- Header image -->
					<div class="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
						{#if provider.photos.length > 0}
							<img src={provider.photos[0]} alt={provider.display_name} class="w-full h-full object-cover" />
						{:else}
							<span class="text-6xl font-bold text-primary-400">
								{provider.display_name.charAt(0)}
							</span>
						{/if}
					</div>

					<div class="p-6">
						<div class="flex items-start justify-between mb-4">
							<div>
								<div class="flex items-center gap-2 mb-2">
									<h1 class="text-2xl font-bold text-gray-900">{provider.display_name}</h1>
									{#if provider.is_verified}
										<CheckCircle class="h-6 w-6 text-green-500" />
									{/if}
								</div>
								<div class="flex flex-wrap gap-2">
									{#each provider.categories as cat}
										<span class="text-sm {cat.color} text-white px-3 py-1 rounded-full">
											{cat.label}
										</span>
									{/each}
									{#if provider.is_featured}
										<span class="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
											Destacado
										</span>
									{/if}
								</div>
							</div>
							<button onclick={handleShare} class="p-2 text-gray-400 hover:text-gray-600">
								<Share2 class="h-5 w-5" />
							</button>
						</div>

						<div class="flex items-center text-gray-500 mb-6">
							<MapPin class="h-5 w-5 mr-2" />
							{provider.address ? `${provider.address}, ` : ''}{provider.neighborhood}, {provider.department}
						</div>

						<div class="prose max-w-none">
							<h2 class="text-lg font-semibold text-gray-900 mb-3">Descripción</h2>
							<p class="text-gray-600 whitespace-pre-line">{provider.description}</p>
						</div>

						{#if provider.photos.length > 1}
							<div class="mt-8">
								<h2 class="text-lg font-semibold text-gray-900 mb-3">Fotos</h2>
								<div class="grid grid-cols-3 gap-4">
									{#each provider.photos.slice(1) as photo}
										<img src={photo} alt="Foto" class="rounded-lg object-cover aspect-square" />
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Contact sidebar -->
			<div class="lg:col-span-1">
				<div class="bg-white rounded-xl shadow-sm p-6 sticky top-8">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Contactar</h2>

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

					{#if provider.website_url || provider.instagram_url || provider.facebook_url}
						<hr class="my-6" />
						<h3 class="text-sm font-medium text-gray-700 mb-3">Redes y web</h3>
						<div class="space-y-2">
							{#if provider.website_url}
								<a
									href={provider.website_url}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center text-gray-600 hover:text-primary-600"
								>
									<Globe class="h-5 w-5 mr-2" />
									Sitio web
								</a>
							{/if}
							{#if provider.instagram_url}
								<a
									href={provider.instagram_url}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center text-gray-600 hover:text-pink-600"
								>
									<Instagram class="h-5 w-5 mr-2" />
									Instagram
								</a>
							{/if}
							{#if provider.facebook_url}
								<a
									href={provider.facebook_url}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center text-gray-600 hover:text-blue-600"
								>
									<Facebook class="h-5 w-5 mr-2" />
									Facebook
								</a>
							{/if}
						</div>
					{/if}

					<hr class="my-6" />
					<p class="text-xs text-gray-400 text-center">
						{provider.view_count} visitas
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
