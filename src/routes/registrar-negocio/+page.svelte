<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { auth, isAuthenticated, user, hasMibarrioProvider, provider as providerStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import {
		DEFAULT_CATEGORIES,
		DEPARTMENTS,
		MONTEVIDEO_NEIGHBORHOODS,
		type Department,
		type ProviderType
	} from '$lib/domain/types';
	import {
		User,
		Building2,
		MapPin,
		Phone,
		Mail,
		Globe,
		Instagram,
		Facebook,
		ArrowRight,
		ArrowLeft,
		Check,
		Loader2
	} from 'lucide-svelte';
	import { get } from 'svelte/store';

	// Plan selection disabled: app is now 100% free
	// const preselectedPlan = $page.url.searchParams.get('plan') || '';

	let step = $state(1);
	let loading = $state(false);
	let authChecked = $state(false);
	let existingProvider = $state(false);

	// Step 1: Basic info
	let providerType = $state<ProviderType>('individual');
	let displayName = $state('');
	let businessRut = $state('');
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

	// Step 5 (Plan) disabled: app is now 100% free
	// let selectedPlan = $state(preselectedPlan || 'basico');

	// Plan info disabled: app is now 100% free
	// const plan = { ... };

	const categories = DEFAULT_CATEGORIES.filter((c) => c.is_active);

	function toggleCategory(name: string) {
		const maxCategories = 3;

		if (selectedCategories.includes(name)) {
			selectedCategories = selectedCategories.filter((c) => c !== name);
		} else if (selectedCategories.length < maxCategories) {
			selectedCategories = [...selectedCategories, name];
		} else {
			toast.warning(`Podés seleccionar hasta ${maxCategories} categorías`);
		}
	}

	function nextStep() {
		// Validate current step
		if (step === 1) {
			if (!displayName.trim()) {
				toast.error('Ingresá el nombre de tu negocio');
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
		// Check authentication
		const isAuth = get(isAuthenticated);
		if (!isAuth) {
			toast.error('Debés iniciar sesión para registrar tu negocio');
			goto('/auth/login');
			return;
		}

		const currentUser = get(user);
		if (!currentUser) {
			toast.error('Error al obtener datos del usuario');
			return;
		}

		loading = true;

		try {
			// Guard: check if provider already exists
			const { data: existingData } = await supabase
				.from('mb_providers')
				.select('id')
				.eq('user_id', currentUser.id)
				.maybeSingle();

			if (existingData) {
				await auth.refreshProvider();
				toast.info('Ya tenés un negocio registrado');
				goto('/mi-negocio');
				return;
			}

			// Subscription plan lookup disabled: app is now 100% free
			// const { data: planData, error: planError } = await supabase
			// 	.from('mb_subscription_plans')
			// 	.select('id')
			// 	.eq('name', 'basico')
			// 	.single();
			//
			// if (planError || !planData) {
			// 	throw new Error('No se pudo obtener el plan');
			// }

			// Format social URLs
			const formatInstagram = (url: string) => {
				if (!url) return null;
				if (url.startsWith('http')) return url;
				if (url.startsWith('@')) return `https://instagram.com/${url.substring(1)}`;
				return `https://instagram.com/${url}`;
			};

			const formatFacebook = (url: string) => {
				if (!url) return null;
				if (url.startsWith('http')) return url;
				if (url.startsWith('/')) return `https://facebook.com${url}`;
				return `https://facebook.com/${url}`;
			};

			// Create provider
			const { data: newProvider, error: providerError } = await supabase
				.from('mb_providers')
				.insert({
					user_id: currentUser.id,
					business_name: displayName.trim(),
					business_type: providerType,
					description: description.trim() || null,
					business_rut: businessRut.trim() || null,
					department: department,
					neighborhood: neighborhood || null,
					address: address.trim() || null,
					contact_phone: contactPhone.trim() || null,
					contact_whatsapp: contactWhatsapp.trim() || null,
					contact_email: contactEmail.trim() || currentUser.email,
					website: websiteUrl.trim() || null,
					social_instagram: formatInstagram(instagramUrl),
					social_facebook: formatFacebook(facebookUrl),
					is_active: true, // Active immediately - app is 100% free
					is_verified: false,
					is_featured: false
				})
				.select('id')
				.single();

			if (providerError || !newProvider) {
				console.error('Provider creation error:', providerError);
				throw new Error('Error al crear el perfil del negocio');
			}

			// Create provider categories
			if (selectedCategories.length > 0) {
				const categoryInserts = selectedCategories.map((categoryName) => ({
					provider_id: newProvider.id,
					category_name: categoryName
				}));

				const { error: categoriesError } = await supabase
					.from('mb_provider_categories')
					.insert(categoryInserts);

				if (categoriesError) {
					console.error('Categories error:', categoriesError);
					// Don't throw, categories are not critical
				}
			}

			// Subscription creation disabled: app is now 100% free
			// const { error: subscriptionError } = await supabase.from('mb_subscriptions').insert({
			// 	provider_id: newProvider.id,
			// 	plan_id: planData.id,
			// 	status: 'pending'
			// });
			//
			// if (subscriptionError) {
			// 	console.error('Subscription error:', subscriptionError);
			// }

			// Update user profile to indicate they have a mibarrio provider
			await supabase
				.from('profiles')
				.update({ is_mibarrio_provider: true })
				.eq('id', currentUser.id);

			// Refresh auth store to get the new provider
			await auth.refreshProvider();

			toast.success('¡Tu negocio fue registrado exitosamente!');

			goto('/mi-negocio');
		} catch (err) {
			console.error('Registration error:', err);
			toast.error(err instanceof Error ? err.message : 'Error al registrar el negocio');
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		// Wait for auth to initialize
		let unsub: (() => void) | undefined;
		unsub = auth.subscribe((state) => {
			if (state.initialized) {
				authChecked = true;

				// If user already has a provider, redirect to their profile
				if (state.provider) {
					existingProvider = true;
					toast.info('Ya tenés un negocio registrado');
					goto('/mi-negocio');
				}

				// Defer unsubscribe in case callback is called synchronously
				queueMicrotask(() => unsub?.());
			}
		});
	});
</script>

<svelte:head>
	<title>Ofrecer Servicios - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
	<Header items={[{ label: 'Directorio', href: '/directorio' }]} />

	{#if !authChecked}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
			<span class="ml-2 text-gray-600 dark:text-gray-400">Cargando...</span>
		</div>
	{:else if existingProvider}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
			<span class="ml-2 text-gray-600 dark:text-gray-400">Redirigiendo...</span>
		</div>
	{:else}
		<div class="container py-8 max-w-2xl">
			<!-- Auth notice -->
			{#if !$isAuthenticated}
				<div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
					<p class="text-sm text-blue-700 dark:text-blue-300">
						Para registrar tu negocio necesitás una cuenta.
						<a href="/auth/register" class="font-medium underline">Registrate</a> o
						<a href="/auth/login" class="font-medium underline">ingresá</a> si ya tenés cuenta.
					</p>
				</div>
			{/if}

			<!-- Progress -->
			<div class="mb-8">
				<div class="flex items-center justify-between mb-2">
					{#each [1, 2, 3, 4] as s}
						<div
							class="w-10 h-10 rounded-full flex items-center justify-center font-medium {s <= step
								? 'bg-primary-600 text-white'
								: 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}"
						>
							{#if s < step}
								<Check class="h-5 w-5" />
							{:else}
								{s}
							{/if}
						</div>
						{#if s < 4}
							<div class="flex-1 h-1 mx-2 {s < step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}"></div>
						{/if}
					{/each}
				</div>
				<div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
					<span>Datos</span>
					<span>Categorías</span>
					<span>Ubicación</span>
					<span>Contacto</span>
				</div>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
				<!-- Step 1: Basic Info -->
				{#if step === 1}
					<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Información básica</h2>

					<div class="mb-6">
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tipo de cuenta</label>
						<div class="grid grid-cols-2 gap-4">
							<button
								type="button"
								onclick={() => (providerType = 'individual')}
								class="p-4 rounded-xl border-2 text-left {providerType === 'individual'
									? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
									: 'border-gray-200 dark:border-gray-600'}"
							>
								<User
									class="h-6 w-6 mb-2 {providerType === 'individual'
										? 'text-primary-600'
										: 'text-gray-400'}"
								/>
								<div class="font-medium dark:text-white">Particular</div>
								<div class="text-sm text-gray-500 dark:text-gray-400">Ofrezco mis servicios</div>
							</button>
							<button
								type="button"
								onclick={() => (providerType = 'business')}
								class="p-4 rounded-xl border-2 text-left {providerType === 'business'
									? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
									: 'border-gray-200 dark:border-gray-600'}"
							>
								<Building2
									class="h-6 w-6 mb-2 {providerType === 'business'
										? 'text-primary-600'
										: 'text-gray-400'}"
								/>
								<div class="font-medium dark:text-white">Empresa</div>
								<div class="text-sm text-gray-500 dark:text-gray-400">Tengo un negocio</div>
							</button>
						</div>
					</div>

					<div class="space-y-4">
						<div>
							<label for="displayName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								{providerType === 'business' ? 'Nombre comercial' : 'Nombre para mostrar'}
							</label>
							<input
								id="displayName"
								type="text"
								bind:value={displayName}
								placeholder={providerType === 'business'
									? 'Ej: Ferretería El Clavo'
									: 'Ej: Juan Pérez - Electricista'}
								class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
							/>
						</div>

						{#if providerType === 'business'}
							<div>
								<label for="businessRut" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									RUT (opcional)
								</label>
								<input
									id="businessRut"
									type="text"
									bind:value={businessRut}
									placeholder="Opcional"
									class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
								/>
							</div>
						{/if}

						<div>
							<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Descripción
							</label>
							<textarea
								id="description"
								bind:value={description}
								rows="4"
								placeholder="Contá sobre tus servicios, experiencia, horarios..."
								class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none resize-none"
							></textarea>
						</div>
					</div>
				{/if}

				<!-- Step 2: Categories -->
				{#if step === 2}
					<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Categorías</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-6">
						Seleccioná hasta 3 categorías que representen tu negocio
					</p>

					<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{#each categories as cat}
							<button
								type="button"
								onclick={() => toggleCategory(cat.name)}
								class="p-3 rounded-lg border-2 text-left text-sm dark:text-gray-300 {selectedCategories.includes(
									cat.name
								)
									? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
							>
								<span class="inline-block w-3 h-3 rounded-full {cat.color} mr-2"></span>
								{cat.label}
							</button>
						{/each}
					</div>

					<p class="text-sm text-gray-500 dark:text-gray-400 mt-4">
						Seleccionadas: {selectedCategories.length}/3
					</p>
				{/if}

				<!-- Step 3: Location -->
				{#if step === 3}
					<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Ubicación</h2>

					<div class="space-y-4">
						<div>
							<label for="department" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Departamento
							</label>
							<div class="relative">
								<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<select
									id="department"
									bind:value={department}
									class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none appearance-none bg-white dark:bg-gray-700 dark:text-white"
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
								<label for="neighborhood" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Barrio
								</label>
								<select
									id="neighborhood"
									bind:value={neighborhood}
									class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none appearance-none bg-white dark:bg-gray-700 dark:text-white"
								>
									<option value="">Seleccioná un barrio</option>
									{#each MONTEVIDEO_NEIGHBORHOODS as barrio}
										<option value={barrio}>{barrio}</option>
									{/each}
								</select>
							</div>
						{/if}

						<div>
							<label for="address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Dirección (opcional)
							</label>
							<input
								id="address"
								type="text"
								bind:value={address}
								placeholder="Ej: Av. Brasil 2500"
								class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
							/>
						</div>
					</div>
				{/if}

				<!-- Step 4: Contact -->
				{#if step === 4}
					<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Contacto</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-6">Ingresá al menos un método de contacto</p>

					<div class="space-y-4">
						<div>
							<label for="contactPhone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Teléfono
							</label>
							<div class="relative">
								<Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<input
									id="contactPhone"
									type="tel"
									bind:value={contactPhone}
									placeholder="099 123 456"
									class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
								/>
							</div>
						</div>

						<div>
							<label for="contactWhatsapp" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								WhatsApp
							</label>
							<input
								id="contactWhatsapp"
								type="tel"
								bind:value={contactWhatsapp}
								placeholder="598 99 123 456"
								class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
							/>
						</div>

						<div>
							<label for="contactEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Email
							</label>
							<div class="relative">
								<Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<input
									id="contactEmail"
									type="email"
									bind:value={contactEmail}
									placeholder={$user?.email || 'tu@email.com'}
									class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
								/>
							</div>
						</div>

						<hr class="my-4 border-gray-200 dark:border-gray-700" />

						<div>
							<label for="websiteUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Sitio web (opcional)
							</label>
							<div class="relative">
								<Globe class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<input
									id="websiteUrl"
									type="url"
									bind:value={websiteUrl}
									placeholder="https://..."
									class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
								/>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="instagramUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Instagram (usuario)
								</label>
								<div class="relative">
									<Instagram
										class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
									/>
									<input
										id="instagramUrl"
										type="text"
										bind:value={instagramUrl}
										placeholder="tu_usuario"
										class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
									/>
								</div>
								<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Solo el nombre de usuario</p>
							</div>
							<div>
								<label for="facebookUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Facebook (página)
								</label>
								<div class="relative">
									<Facebook
										class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
									/>
									<input
										id="facebookUrl"
										type="text"
										bind:value={facebookUrl}
										placeholder="tu_pagina"
										class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
									/>
								</div>
								<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Solo el nombre de la página</p>
							</div>
						</div>
					</div>
				{/if}

				<!-- Step 5 (Plan) removed: app is now 100% free -->

				<!-- Navigation -->
				<div class="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
					{#if step > 1}
						<Button variant="outline" onclick={prevStep} disabled={loading}>
							<ArrowLeft class="h-4 w-4 mr-2" />
							Anterior
						</Button>
					{:else}
						<div></div>
					{/if}

					{#if step < 4}
						<Button onclick={nextStep}>
							Siguiente
							<ArrowRight class="h-4 w-4 ml-2" />
						</Button>
					{:else if !$isAuthenticated}
						<Button onclick={() => goto('/auth/register')}>
							Crear cuenta para continuar
							<ArrowRight class="h-4 w-4 ml-2" />
						</Button>
					{:else}
						<Button onclick={handleSubmit} disabled={loading}>
							{#if loading}
								<Loader2 class="h-4 w-4 mr-2 animate-spin" />
								Guardando...
							{:else}
								Publicar mi negocio
							{/if}
						</Button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
