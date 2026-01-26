<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { APP_NAME, formatPrice } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { DEFAULT_CATEGORIES, DEPARTMENTS, MONTEVIDEO_NEIGHBORHOODS, type Department, type ProviderType } from '$lib/domain/types';
	import { User, Building2, MapPin, Phone, Mail, Globe, Instagram, Facebook, ArrowRight, ArrowLeft, Check } from 'lucide-svelte';

	// Get plan from URL if provided
	const preselectedPlan = $page.url.searchParams.get('plan') || '';

	let step = $state(1);
	let loading = $state(false);

	// Step 1: Basic info
	let providerType = $state<ProviderType>('individual');
	let displayName = $state('');
	let businessName = $state('');
	let businessRut = $state('');
	let shortDescription = $state('');
	let description = $state('');

	// Step 2: Categories
	let selectedCategories = $state<string[]>([]);

	// Step 3: Location
	let department = $state<Department | ''>('');
	let neighborhood = $state('');
	let address = $state('');

	// Step 4: Contact
	let contactPhone = $state('');
	let contactWhatsapp = $state('');
	let contactEmail = $state('');
	let websiteUrl = $state('');
	let instagramUrl = $state('');
	let facebookUrl = $state('');

	// Step 5: Plan
	let selectedPlan = $state(preselectedPlan || 'basico');

	const plans = [
		{ name: 'basico', label: 'Básico', price: 390 },
		{ name: 'profesional', label: 'Profesional', price: 690 },
		{ name: 'premium', label: 'Premium', price: 990 }
	];

	const categories = DEFAULT_CATEGORIES.filter(c => c.is_active);

	function toggleCategory(name: string) {
		if (selectedCategories.includes(name)) {
			selectedCategories = selectedCategories.filter(c => c !== name);
		} else if (selectedCategories.length < 3) {
			selectedCategories = [...selectedCategories, name];
		} else {
			toast.warning('Podés seleccionar hasta 3 categorías');
		}
	}

	function nextStep() {
		// Validate current step
		if (step === 1) {
			if (!displayName.trim()) {
				toast.error('Ingresá el nombre de tu negocio');
				return;
			}
			if (!shortDescription.trim()) {
				toast.error('Ingresá una descripción corta');
				return;
			}
		} else if (step === 2) {
			if (selectedCategories.length === 0) {
				toast.error('Seleccioná al menos una categoría');
				return;
			}
		} else if (step === 3) {
			if (!department) {
				toast.error('Seleccioná un departamento');
				return;
			}
		} else if (step === 4) {
			if (!contactPhone && !contactWhatsapp && !contactEmail) {
				toast.error('Ingresá al menos un método de contacto');
				return;
			}
		}

		step++;
	}

	function prevStep() {
		step--;
	}

	async function handleSubmit() {
		loading = true;

		// TODO: Save to Supabase and redirect to MercadoPago
		setTimeout(() => {
			toast.info('Registro en desarrollo - próximamente integración con MercadoPago');
			loading = false;
		}, 1500);
	}
</script>

<svelte:head>
	<title>Registrar negocio - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white border-b border-gray-200">
		<div class="container py-4">
			<nav class="flex items-center justify-between">
				<a href="/" class="text-2xl font-bold text-primary-600">{APP_NAME}</a>
				<a href="/planes" class="text-gray-600 hover:text-gray-900">Ver planes</a>
			</nav>
		</div>
	</header>

	<div class="container py-8 max-w-2xl">
		<!-- Progress -->
		<div class="mb-8">
			<div class="flex items-center justify-between mb-2">
				{#each [1, 2, 3, 4, 5] as s}
					<div
						class="w-10 h-10 rounded-full flex items-center justify-center font-medium {s <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}"
					>
						{#if s < step}
							<Check class="h-5 w-5" />
						{:else}
							{s}
						{/if}
					</div>
					{#if s < 5}
						<div class="flex-1 h-1 mx-2 {s < step ? 'bg-primary-600' : 'bg-gray-200'}"></div>
					{/if}
				{/each}
			</div>
			<div class="flex justify-between text-xs text-gray-500">
				<span>Datos</span>
				<span>Categorías</span>
				<span>Ubicación</span>
				<span>Contacto</span>
				<span>Plan</span>
			</div>
		</div>

		<div class="bg-white rounded-2xl shadow-sm p-8">
			<!-- Step 1: Basic Info -->
			{#if step === 1}
				<h2 class="text-xl font-bold text-gray-900 mb-6">Información básica</h2>

				<div class="mb-6">
					<label class="block text-sm font-medium text-gray-700 mb-3">Tipo de cuenta</label>
					<div class="grid grid-cols-2 gap-4">
						<button
							type="button"
							onclick={() => providerType = 'individual'}
							class="p-4 rounded-xl border-2 text-left {providerType === 'individual' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}"
						>
							<User class="h-6 w-6 mb-2 {providerType === 'individual' ? 'text-primary-600' : 'text-gray-400'}" />
							<div class="font-medium">Particular</div>
							<div class="text-sm text-gray-500">Ofrezco mis servicios</div>
						</button>
						<button
							type="button"
							onclick={() => providerType = 'business'}
							class="p-4 rounded-xl border-2 text-left {providerType === 'business' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}"
						>
							<Building2 class="h-6 w-6 mb-2 {providerType === 'business' ? 'text-primary-600' : 'text-gray-400'}" />
							<div class="font-medium">Empresa</div>
							<div class="text-sm text-gray-500">Tengo un negocio</div>
						</button>
					</div>
				</div>

				<div class="space-y-4">
					<div>
						<label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">
							{providerType === 'business' ? 'Nombre comercial' : 'Nombre para mostrar'}
						</label>
						<input
							id="displayName"
							type="text"
							bind:value={displayName}
							placeholder={providerType === 'business' ? 'Ej: Ferretería El Clavo' : 'Ej: Juan Pérez - Electricista'}
							class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
						/>
					</div>

					{#if providerType === 'business'}
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="businessName" class="block text-sm font-medium text-gray-700 mb-1">
									Razón social
								</label>
								<input
									id="businessName"
									type="text"
									bind:value={businessName}
									placeholder="Opcional"
									class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
								/>
							</div>
							<div>
								<label for="businessRut" class="block text-sm font-medium text-gray-700 mb-1">
									RUT
								</label>
								<input
									id="businessRut"
									type="text"
									bind:value={businessRut}
									placeholder="Opcional"
									class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
								/>
							</div>
						</div>
					{/if}

					<div>
						<label for="shortDescription" class="block text-sm font-medium text-gray-700 mb-1">
							Descripción corta
						</label>
						<input
							id="shortDescription"
							type="text"
							bind:value={shortDescription}
							maxlength="150"
							placeholder="Máximo 150 caracteres"
							class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
						/>
						<p class="text-xs text-gray-500 mt-1">{shortDescription.length}/150</p>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
							Descripción completa
						</label>
						<textarea
							id="description"
							bind:value={description}
							rows="4"
							placeholder="Contá sobre tus servicios, experiencia, horarios..."
							class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
						></textarea>
					</div>
				</div>
			{/if}

			<!-- Step 2: Categories -->
			{#if step === 2}
				<h2 class="text-xl font-bold text-gray-900 mb-2">Categorías</h2>
				<p class="text-gray-600 mb-6">Seleccioná hasta 3 categorías que representen tu negocio</p>

				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{#each categories as cat}
						<button
							type="button"
							onclick={() => toggleCategory(cat.name)}
							class="p-3 rounded-lg border-2 text-left text-sm {selectedCategories.includes(cat.name) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}"
						>
							<span class="inline-block w-3 h-3 rounded-full {cat.color} mr-2"></span>
							{cat.label}
						</button>
					{/each}
				</div>

				<p class="text-sm text-gray-500 mt-4">
					Seleccionadas: {selectedCategories.length}/3
				</p>
			{/if}

			<!-- Step 3: Location -->
			{#if step === 3}
				<h2 class="text-xl font-bold text-gray-900 mb-6">Ubicación</h2>

				<div class="space-y-4">
					<div>
						<label for="department" class="block text-sm font-medium text-gray-700 mb-1">
							Departamento
						</label>
						<div class="relative">
							<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
							<select
								id="department"
								bind:value={department}
								class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none appearance-none bg-white"
							>
								<option value="">Seleccioná un departamento</option>
								{#each DEPARTMENTS as dept}
									<option value={dept}>{dept}</option>
								{/each}
							</select>
						</div>
					</div>

					{#if department === 'Montevideo'}
						<div>
							<label for="neighborhood" class="block text-sm font-medium text-gray-700 mb-1">
								Barrio
							</label>
							<select
								id="neighborhood"
								bind:value={neighborhood}
								class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none appearance-none bg-white"
							>
								<option value="">Seleccioná un barrio</option>
								{#each MONTEVIDEO_NEIGHBORHOODS as barrio}
									<option value={barrio}>{barrio}</option>
								{/each}
							</select>
						</div>
					{/if}

					<div>
						<label for="address" class="block text-sm font-medium text-gray-700 mb-1">
							Dirección (opcional)
						</label>
						<input
							id="address"
							type="text"
							bind:value={address}
							placeholder="Ej: Av. Brasil 2500"
							class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
						/>
					</div>
				</div>
			{/if}

			<!-- Step 4: Contact -->
			{#if step === 4}
				<h2 class="text-xl font-bold text-gray-900 mb-2">Contacto</h2>
				<p class="text-gray-600 mb-6">Ingresá al menos un método de contacto</p>

				<div class="space-y-4">
					<div>
						<label for="contactPhone" class="block text-sm font-medium text-gray-700 mb-1">
							Teléfono
						</label>
						<div class="relative">
							<Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								id="contactPhone"
								type="tel"
								bind:value={contactPhone}
								placeholder="099 123 456"
								class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
							/>
						</div>
					</div>

					<div>
						<label for="contactWhatsapp" class="block text-sm font-medium text-gray-700 mb-1">
							WhatsApp
						</label>
						<input
							id="contactWhatsapp"
							type="tel"
							bind:value={contactWhatsapp}
							placeholder="598 99 123 456"
							class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
						/>
					</div>

					<div>
						<label for="contactEmail" class="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<div class="relative">
							<Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								id="contactEmail"
								type="email"
								bind:value={contactEmail}
								placeholder="tu@email.com"
								class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
							/>
						</div>
					</div>

					<hr class="my-4" />

					<div>
						<label for="websiteUrl" class="block text-sm font-medium text-gray-700 mb-1">
							Sitio web (opcional)
						</label>
						<div class="relative">
							<Globe class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								id="websiteUrl"
								type="url"
								bind:value={websiteUrl}
								placeholder="https://..."
								class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
							/>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="instagramUrl" class="block text-sm font-medium text-gray-700 mb-1">
								Instagram
							</label>
							<div class="relative">
								<Instagram class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<input
									id="instagramUrl"
									type="url"
									bind:value={instagramUrl}
									placeholder="@usuario"
									class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
								/>
							</div>
						</div>
						<div>
							<label for="facebookUrl" class="block text-sm font-medium text-gray-700 mb-1">
								Facebook
							</label>
							<div class="relative">
								<Facebook class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<input
									id="facebookUrl"
									type="url"
									bind:value={facebookUrl}
									placeholder="/pagina"
									class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
								/>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Step 5: Plan -->
			{#if step === 5}
				<h2 class="text-xl font-bold text-gray-900 mb-2">Elegí tu plan</h2>
				<p class="text-gray-600 mb-6">Seleccioná el plan que mejor se adapte a tus necesidades</p>

				<div class="space-y-4">
					{#each plans as plan}
						<button
							type="button"
							onclick={() => selectedPlan = plan.name}
							class="w-full p-4 rounded-xl border-2 text-left {selectedPlan === plan.name ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}"
						>
							<div class="flex items-center justify-between">
								<div>
									<div class="font-semibold text-gray-900">{plan.label}</div>
									<div class="text-sm text-gray-500">{formatPrice(plan.price)}/mes</div>
								</div>
								<div class="w-5 h-5 rounded-full border-2 {selectedPlan === plan.name ? 'border-primary-500 bg-primary-500' : 'border-gray-300'} flex items-center justify-center">
									{#if selectedPlan === plan.name}
										<Check class="h-3 w-3 text-white" />
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>

				<div class="mt-6 p-4 bg-gray-50 rounded-lg">
					<p class="text-sm text-gray-600">
						Al continuar, serás redirigido a MercadoPago para completar el pago de tu suscripción mensual.
					</p>
				</div>
			{/if}

			<!-- Navigation -->
			<div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
				{#if step > 1}
					<Button variant="outline" onclick={prevStep}>
						<ArrowLeft class="h-4 w-4 mr-2" />
						Anterior
					</Button>
				{:else}
					<div></div>
				{/if}

				{#if step < 5}
					<Button onclick={nextStep}>
						Siguiente
						<ArrowRight class="h-4 w-4 ml-2" />
					</Button>
				{:else}
					<Button onclick={handleSubmit} disabled={loading}>
						{loading ? 'Procesando...' : 'Pagar y publicar'}
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>
