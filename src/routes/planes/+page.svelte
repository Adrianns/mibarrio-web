<script lang="ts">
	import { Check, ExternalLink } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME, formatPrice } from '$lib/config';

	const APPYUDA_URL = 'https://appyuda.com.uy';

	const plan = {
		name: 'mensual',
		label: 'Plan Mensual',
		description: 'Todo lo que necesitás para que te encuentren',
		price: 390,
		trialDays: 30,
		features: [
			'Primer mes GRATIS para probar',
			'Perfil completo en el directorio',
			'Hasta 3 categorías de servicios',
			'Fotos de tu negocio',
			'Contacto directo (teléfono, WhatsApp, email)',
			'Redes sociales y sitio web',
			'Estadísticas de visitas y contactos',
			'Sin contratos - cancelá cuando quieras'
		]
	};
</script>

<svelte:head>
	<title>Planes - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
	<Header items={[{ label: 'Directorio', href: '/directorio' }]} />

	<div class="container py-16">
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Un solo plan, todo incluido</h1>
			<p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
				Probá Mi Barrio gratis por 1 mes. Sin compromiso, sin tarjeta de crédito para empezar.
			</p>
		</div>

		<!-- Single Plan Card -->
		<div class="max-w-lg mx-auto">
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-primary-500 p-8 relative">
				<div class="absolute -top-4 left-1/2 -translate-x-1/2">
					<span class="bg-green-500 text-white text-sm font-bold px-4 py-1 rounded-full">
						1 mes GRATIS
					</span>
				</div>

				<div class="text-center mb-8">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.label}</h2>
					<p class="text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
					<div class="flex items-baseline justify-center gap-1">
						<span class="text-5xl font-bold text-gray-900 dark:text-white">{formatPrice(plan.price)}</span>
						<span class="text-gray-500 dark:text-gray-400 text-lg">/mes</span>
					</div>
					<p class="text-green-600 dark:text-green-400 font-medium mt-2">Después del primer mes gratis</p>
				</div>

				<ul class="space-y-4 mb-8">
					{#each plan.features as feature}
						<li class="flex items-start gap-3">
							<Check class="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
							<span class="text-gray-600 dark:text-gray-300">{feature}</span>
						</li>
					{/each}
				</ul>

				<Button href="/registrar-negocio" size="lg" class="w-full text-lg">
					Empezar gratis
				</Button>

				<p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
					No se requiere tarjeta de crédito para el período de prueba
				</p>
			</div>
		</div>

		<!-- FAQ -->
		<div class="mt-16 max-w-2xl mx-auto">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Preguntas frecuentes</h2>

			<div class="space-y-6">
				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">¿Cómo funciona el mes gratis?</h3>
					<p class="text-gray-600 dark:text-gray-300">
						Te registrás, completás tu perfil y tu negocio aparece inmediatamente en el directorio.
						Tenés 30 días para probarlo sin costo. Si te gusta, el pago se activa automáticamente.
					</p>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">¿Puedo cancelar en cualquier momento?</h3>
					<p class="text-gray-600 dark:text-gray-300">
						Sí, no hay contratos ni permanencia mínima. Podés cancelar cuando quieras desde tu panel
						y tu negocio dejará de aparecer en el directorio.
					</p>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">¿Cómo se paga?</h3>
					<p class="text-gray-600 dark:text-gray-300">
						El pago es mensual a través de MercadoPago. Podés pagar con tarjeta de crédito, débito o
						efectivo en puntos de pago.
					</p>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
					<h3 class="font-semibold text-gray-900 dark:text-white mb-2">¿Qué categorías puedo elegir?</h3>
					<p class="text-gray-600 dark:text-gray-300">
						Podés elegir hasta 3 categorías de una amplia lista: electricistas, plomeros, restaurantes,
						farmacias, peluquerías, y muchas más.
					</p>
				</div>
			</div>
		</div>

		<!-- Appyuda Banner -->
		<div class="mt-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-white">
			<div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
				<div class="flex-1 text-center md:text-left">
					<h2 class="text-2xl md:text-3xl font-bold mb-3">
						¿Querés captar más clientes y cerrar negocios de forma segura?
					</h2>
					<p class="text-green-100 text-lg">
						Además de Mi Barrio, ofrecé tus servicios en{' '}
						<a
							href={APPYUDA_URL}
							target="_blank"
							rel="noopener noreferrer"
							class="font-bold underline hover:text-white"
						>
							Appyuda
						</a>, nuestra plataforma de servicios profesionales con pagos garantizados.
					</p>
				</div>
				<div class="flex-shrink-0">
					<a
						href={APPYUDA_URL}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-xl hover:bg-green-50 transition-colors shadow-lg"
					>
						Conocer Appyuda
						<ExternalLink class="h-5 w-5" />
					</a>
				</div>
			</div>
		</div>

		<div class="mt-16 text-center">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">¿Tenés más preguntas?</h2>
			<p class="text-gray-600 dark:text-gray-300 mb-4">
				Contactanos y te ayudamos con lo que necesites.
			</p>
			<Button variant="outline" href="mailto:contacto@mibarrio.uy">
				Contactar
			</Button>
		</div>
	</div>
</div>
