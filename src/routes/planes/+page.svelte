<script lang="ts">
	import { Check } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { APP_NAME, formatPrice } from '$lib/config';

	const plans = [
		{
			name: 'basico',
			label: 'Básico',
			description: 'Ideal para empezar',
			price: 390,
			features: [
				'Aparecé en el directorio',
				'Hasta 3 fotos',
				'Contacto por teléfono y WhatsApp',
				'Estadísticas básicas'
			],
			highlighted: false
		},
		{
			name: 'profesional',
			label: 'Profesional',
			description: 'Para negocios en crecimiento',
			price: 690,
			features: [
				'Todo del plan Básico',
				'Hasta 8 fotos',
				'Destacado en búsquedas',
				'Estadísticas detalladas',
				'Badge "Profesional"'
			],
			highlighted: true
		},
		{
			name: 'premium',
			label: 'Premium',
			description: 'Máxima visibilidad',
			price: 990,
			features: [
				'Todo del plan Profesional',
				'Fotos ilimitadas',
				'Aparecés primero en tu zona',
				'Badge "Premium"',
				'Soporte prioritario'
			],
			highlighted: false
		}
	];
</script>

<svelte:head>
	<title>Planes - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white border-b border-gray-200">
		<div class="container py-4">
			<nav class="flex items-center justify-between">
				<a href="/" class="text-2xl font-bold text-primary-600">{APP_NAME}</a>
				<div class="flex items-center gap-4">
					<a href="/directorio" class="text-gray-600 hover:text-gray-900">Directorio</a>
					<a href="/auth/login" class="text-gray-600 hover:text-gray-900">Ingresar</a>
					<Button href="/registrar-negocio">Registrar negocio</Button>
				</div>
			</nav>
		</div>
	</header>

	<div class="container py-16">
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">Planes y precios</h1>
			<p class="text-xl text-gray-600 max-w-2xl mx-auto">
				Elegí el plan que mejor se adapte a tu negocio. Todos los planes incluyen aparecer en el directorio.
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
			{#each plans as plan}
				<div
					class="bg-white rounded-2xl shadow-sm border-2 {plan.highlighted ? 'border-primary-500 relative' : 'border-gray-100'} p-8"
				>
					{#if plan.highlighted}
						<div class="absolute -top-4 left-1/2 -translate-x-1/2">
							<span class="bg-primary-500 text-white text-sm font-medium px-4 py-1 rounded-full">
								Más popular
							</span>
						</div>
					{/if}

					<div class="text-center mb-8">
						<h2 class="text-xl font-bold text-gray-900 mb-2">{plan.label}</h2>
						<p class="text-gray-500 mb-4">{plan.description}</p>
						<div class="flex items-baseline justify-center gap-1">
							<span class="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
							<span class="text-gray-500">/mes</span>
						</div>
					</div>

					<ul class="space-y-4 mb-8">
						{#each plan.features as feature}
							<li class="flex items-start gap-3">
								<Check class="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
								<span class="text-gray-600">{feature}</span>
							</li>
						{/each}
					</ul>

					<Button
						href="/registrar-negocio?plan={plan.name}"
						variant={plan.highlighted ? 'default' : 'outline'}
						size="lg"
						class="w-full"
					>
						Elegir {plan.label}
					</Button>
				</div>
			{/each}
		</div>

		<div class="mt-16 text-center">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">¿Tenés preguntas?</h2>
			<p class="text-gray-600 mb-4">
				Contactanos y te ayudamos a elegir el plan ideal para tu negocio.
			</p>
			<Button variant="outline" href="mailto:contacto@mibarrio.uy">
				Contactar
			</Button>
		</div>
	</div>
</div>
