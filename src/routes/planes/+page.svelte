<script lang="ts">
	import { Check, X, Crown, Globe, ImagePlus, Tag, ShoppingBag } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { EMAIL_SUPPORT } from '$lib/config';

	const PRICES = {
		monthly: 390,
		annual: 3900
	};

	const monthlySavings = Math.round((1 - PRICES.annual / 12 / PRICES.monthly) * 100);

	let selectedCycle = $state<'monthly' | 'annual'>('monthly');

	const freeFeatures = [
		{ text: 'Perfil completo en el directorio', included: true },
		{ text: 'Hasta 3 categorías de servicios', included: true },
		{ text: 'Fotos de tu negocio', included: true },
		{ text: 'Contacto directo (teléfono, WhatsApp, email)', included: true },
		{ text: 'Redes sociales y sitio web', included: true },
		{ text: 'Hasta 5 servicios', included: true },
		{ text: 'Horarios de atención', included: true },
		{ text: 'Servicios y productos ilimitados', included: false },
		{ text: 'Catálogo de productos con imágenes', included: false },
		{ text: 'Imagen de portada profesional', included: false },
		{ text: 'Promociones y ofertas especiales', included: false },
		{ text: 'URL personalizada de tu negocio', included: false },
		{ text: 'Prioridad en resultados de búsqueda', included: false },
		{ text: 'Insignia Premium en tu perfil', included: false }
	];

	const premiumFeatures = [
		{ text: 'Todo lo del plan gratuito', included: true, highlight: true },
		{ text: 'Servicios y productos ilimitados', included: true },
		{ text: 'Catálogo de productos con imágenes', included: true },
		{ text: 'Imagen de portada profesional', included: true },
		{ text: 'Promociones y ofertas especiales', included: true },
		{ text: 'URL personalizada de tu negocio', included: true },
		{ text: 'Prioridad en resultados de búsqueda', included: true },
		{ text: 'Insignia Premium en tu perfil', included: true }
	];

	const advantages = [
		{
			icon: ShoppingBag,
			title: 'Catálogo completo',
			description: 'Mostrá todos tus productos con fotos, precios y descripciones. Sin límites.'
		},
		{
			icon: ImagePlus,
			title: 'Portada profesional',
			description: 'Destacá tu negocio con una imagen de portada llamativa en tu perfil.'
		},
		{
			icon: Tag,
			title: 'Promociones',
			description: 'Publicá ofertas y descuentos para atraer más clientes a tu negocio.'
		},
		{
			icon: Globe,
			title: 'Tu propia URL',
			description: 'mibarrio.uy/tu-negocio — Compartí un link directo y profesional.'
		}
	];
</script>

<SEO
	title="Planes"
	description="Registrá tu negocio gratis o potencialo con Plan Web. Catálogo de productos, promociones, portada profesional y más."
	url="/planes"
/>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
	<Header items={[{ label: 'Directorio', href: '/directorio/mapa' }]} />

	<div class="container py-16">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
				Elegí el plan ideal para tu negocio
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
				Empezá gratis y potenciá tu perfil cuando quieras
			</p>
		</div>

		<!-- Billing toggle -->
		<div class="flex justify-center mb-10">
			<div class="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 shadow-inner">
				<button
					onclick={() => (selectedCycle = 'monthly')}
					class="px-5 py-2.5 text-sm font-medium rounded-lg transition-all {selectedCycle === 'monthly'
						? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}"
				>
					Mensual
				</button>
				<button
					onclick={() => (selectedCycle = 'annual')}
					class="px-5 py-2.5 text-sm font-medium rounded-lg transition-all {selectedCycle === 'annual'
						? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}"
				>
					Anual
					<span class="ml-1 text-xs text-green-600 dark:text-green-400 font-bold">-{monthlySavings}%</span>
				</button>
			</div>
		</div>

		<!-- Plans grid -->
		<div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
			<!-- Free Plan -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col">
				<div class="mb-6">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Plan Gratuito</h2>
					<p class="text-gray-500 dark:text-gray-400">Todo lo esencial para que te encuentren</p>
				</div>

				<div class="mb-8">
					<div class="flex items-baseline gap-1">
						<span class="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
						<span class="text-gray-500 dark:text-gray-400 text-lg">/siempre</span>
					</div>
				</div>

				<ul class="space-y-3 mb-8 flex-1">
					{#each freeFeatures as feature}
						<li class="flex items-start gap-3">
							{#if feature.included}
								<Check class="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
								<span class="text-gray-700 dark:text-gray-300">{feature.text}</span>
							{:else}
								<X class="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
								<span class="text-gray-400 dark:text-gray-500">{feature.text}</span>
							{/if}
						</li>
					{/each}
				</ul>

				<Button href="/auth/login?redirect=/registrar-negocio" variant="outline" size="lg" class="w-full">
					Registrar mi negocio
				</Button>
			</div>

			<!-- Premium Plan -->
			<div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-amber-400 dark:border-amber-500 p-8 flex flex-col overflow-hidden">
				<!-- Popular badge -->
				<div class="absolute -top-0 left-0 right-0">
					<div class="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-center text-xs font-bold py-1.5 tracking-wider uppercase">
						Recomendado
					</div>
				</div>

				<div class="mb-6 mt-4">
					<div class="flex items-center gap-2 mb-2">
						<Crown class="h-6 w-6 text-amber-500" />
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Plan Web</h2>
					</div>
					<p class="text-gray-500 dark:text-gray-400">Tu negocio con perfil profesional completo</p>
				</div>

				<div class="mb-8">
					<div class="flex items-baseline gap-1">
						<span class="text-5xl font-bold text-gray-900 dark:text-white">
							${selectedCycle === 'monthly' ? PRICES.monthly : PRICES.annual}
						</span>
						<span class="text-gray-500 dark:text-gray-400 text-lg">
							UYU / {selectedCycle === 'monthly' ? 'mes' : 'año'}
						</span>
					</div>
					{#if selectedCycle === 'annual'}
						<p class="text-sm text-green-600 dark:text-green-400 mt-1">
							${Math.round(PRICES.annual / 12)}/mes — ahorrás ${PRICES.monthly * 12 - PRICES.annual} al año
						</p>
					{/if}
				</div>

				<ul class="space-y-3 mb-8 flex-1">
					{#each premiumFeatures as feature}
						<li class="flex items-start gap-3">
							<Check class="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
							{#if feature.highlight}
								<span class="text-gray-700 dark:text-gray-300 font-medium">{feature.text}</span>
							{:else}
								<span class="text-gray-700 dark:text-gray-300">{feature.text}</span>
							{/if}
						</li>
					{/each}
				</ul>

				<button
					onclick={() => window.location.href = '/auth/login?redirect=/mi-negocio'}
					class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold rounded-lg shadow-sm transition-all hover:shadow-md text-lg"
				>
					<Crown class="h-5 w-5" />
					Empezar con Plan Web
				</button>

				<p class="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
					Pago seguro con MercadoPago. Cancelá cuando quieras.
				</p>
			</div>
		</div>

		<!-- Advantages section -->
		<div class="mt-20 max-w-4xl mx-auto">
			<div class="text-center mb-10">
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
					¿Por qué elegir Plan Web?
				</h2>
				<p class="text-gray-600 dark:text-gray-300">
					Convertí tu perfil en una mini-web profesional para tu negocio
				</p>
			</div>

			<div class="grid sm:grid-cols-2 gap-6">
				{#each advantages as advantage}
					<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
						<div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center mb-4">
							<advantage.icon class="h-5 w-5 text-white" />
						</div>
						<h3 class="font-semibold text-gray-900 dark:text-white mb-2">{advantage.title}</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">{advantage.description}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- FAQ -->
		<div class="mt-20 max-w-2xl mx-auto">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Preguntas frecuentes</h2>

			<div class="space-y-6">
				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">¿El plan gratuito tiene algún costo oculto?</h3>
					<p class="text-gray-600 dark:text-gray-300">
						No. El plan gratuito es completamente gratis para siempre. No necesitás tarjeta de crédito.
						Incluye tu perfil, fotos, contacto, horarios y hasta 5 servicios.
					</p>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">¿Qué pasa si cancelo el Plan Web?</h3>
					<p class="text-gray-600 dark:text-gray-300">
						Tu perfil vuelve al plan gratuito. Mantenés toda tu información pero las funciones premium
						(catálogo ilimitado, portada, promociones) quedan desactivadas hasta que renueves.
					</p>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
					<p class="text-gray-600 dark:text-gray-300">
						Sí. Podés pasar al Plan Web cuando quieras desde tu panel en "Mi negocio".
						El cambio es inmediato y podés cancelar en cualquier momento.
					</p>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">¿Cómo es el pago?</h3>
					<p class="text-gray-600 dark:text-gray-300">
						El pago se procesa de forma segura a través de MercadoPago. Podés pagar con tarjeta,
						transferencia bancaria o cualquier medio disponible en MercadoPago.
					</p>
				</div>
			</div>
		</div>

		<div class="mt-16 text-center">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">¿Tenés más preguntas?</h2>
			<p class="text-gray-600 dark:text-gray-300 mb-4">
				Contactanos y te ayudamos con lo que necesites.
			</p>
			<Button variant="outline" href={`mailto:${EMAIL_SUPPORT}`}>
				Contactar
			</Button>
		</div>
	</div>
</div>
