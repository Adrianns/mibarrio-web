<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { auth, isAuthenticated, user } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import { Loader2, User, Building2 } from 'lucide-svelte';
	import { get } from 'svelte/store';
	import { ProviderCardEditor } from '$lib/components/ProviderCardEditor';
	import type { Department } from '$lib/domain/types';

	let authChecked = $state(false);
	let existingProvider = $state(false);
	let saving = $state(false);
	let businessType = $state<'individual' | 'business' | null>(null);

	interface ProviderData {
		id?: string;
		businessName: string;
		businessType?: 'individual' | 'business';
		rut?: string;
		description: string;
		department: Department | '';
		neighborhood: string;
		address: string;
		phone: string;
		whatsapp: string;
		email: string;
		website: string;
		instagram: string;
		facebook: string;
		logoUrl: string | null;
		photos: string[];
		categories: string[];
		isVerified?: boolean;
	}

	// Empty initial data for create mode
	const emptyData: ProviderData = {
		businessName: '',
		description: '',
		department: '',
		neighborhood: '',
		address: '',
		phone: '',
		whatsapp: '',
		email: '',
		website: '',
		instagram: '',
		facebook: '',
		logoUrl: null,
		photos: [],
		categories: []
	};

	// Format social URLs
	function formatInstagram(username: string): string | null {
		if (!username) return null;
		const clean = username.replace(/^@/, '').trim();
		if (!clean) return null;
		return `https://instagram.com/${clean}`;
	}

	function formatFacebook(page: string): string | null {
		if (!page) return null;
		const clean = page.replace(/^\//, '').trim();
		if (!clean) return null;
		return `https://facebook.com/${clean}`;
	}

	async function handleSave(data: ProviderData) {
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

		// Validation
		if (!data.businessName.trim()) {
			toast.error('Ingresá el nombre de tu negocio');
			return;
		}

		if (data.categories.length === 0) {
			toast.error('Seleccioná al menos una categoría');
			return;
		}

		if (!data.department) {
			toast.error('Seleccioná un departamento');
			return;
		}

		if (!data.phone && !data.whatsapp && !data.email) {
			toast.error('Ingresá al menos un método de contacto');
			return;
		}

		saving = true;

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

			// Create provider
			const { data: newProvider, error: providerError } = await supabase
				.from('mb_providers')
				.insert({
					user_id: currentUser.id,
					business_name: data.businessName.trim(),
					business_type: businessType || 'individual',
					business_rut: data.rut?.trim() || null,
					description: data.description.trim() || null,
					department: data.department,
					neighborhood: data.neighborhood || null,
					address: data.address.trim() || null,
					contact_phone: data.phone.trim() || null,
					contact_whatsapp: data.whatsapp.trim() || null,
					contact_email: data.email.trim() || currentUser.email,
					website: data.website.trim() || null,
					social_instagram: formatInstagram(data.instagram),
					social_facebook: formatFacebook(data.facebook),
					logo_url: data.logoUrl,
					photos: data.photos,
					is_active: true,
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
			if (data.categories.length > 0) {
				const categoryInserts = data.categories.map((categoryName) => ({
					provider_id: newProvider.id,
					category_name: categoryName
				}));

				const { error: categoriesError } = await supabase
					.from('mb_provider_categories')
					.insert(categoryInserts);

				if (categoriesError) {
					console.error('Categories error:', categoriesError);
				}
			}

			// Update user profile
			await supabase
				.from('profiles')
				.update({ is_mibarrio_provider: true })
				.eq('id', currentUser.id);

			// Refresh auth store
			await auth.refreshProvider();

			toast.success('¡Tu negocio fue registrado exitosamente!');
			goto('/mi-negocio');
		} catch (err) {
			console.error('Registration error:', err);
			toast.error(err instanceof Error ? err.message : 'Error al registrar el negocio');
		} finally {
			saving = false;
		}
	}

	onMount(async () => {
		let unsub: (() => void) | undefined;
		unsub = auth.subscribe((state) => {
			if (state.initialized) {
				authChecked = true;

				// If user already has a provider, redirect
				if (state.provider) {
					existingProvider = true;
					toast.info('Ya tenés un negocio registrado');
					goto('/mi-negocio');
				}

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
		<div class="container py-8">
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

			{#if !businessType}
				<!-- Type selection step -->
				<div class="max-w-2xl mx-auto">
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">¿Cómo querés registrarte?</h1>
					<p class="text-gray-600 dark:text-gray-400 mb-8 text-center">
						Elegí el tipo de perfil que mejor te representa
					</p>

					<div class="grid md:grid-cols-2 gap-4">
						<button
							type="button"
							onclick={() => businessType = 'individual'}
							class="p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-left group"
						>
							<div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
								<User class="h-6 w-6 text-primary-600" />
							</div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Particular</h3>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								Ofrecés tus servicios de forma independiente. Ideal para electricistas, plomeros, profesionales, etc.
							</p>
						</button>

						<button
							type="button"
							onclick={() => businessType = 'business'}
							class="p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-left group"
						>
							<div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
								<Building2 class="h-6 w-6 text-primary-600" />
							</div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Empresa</h3>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								Tenés un local o empresa con nombre comercial. Ideal para comercios, talleres, estudios, etc.
							</p>
						</button>
					</div>
				</div>
			{:else}
				<!-- Registration form -->
				<div class="flex items-center gap-2 mb-6">
					<button
						type="button"
						onclick={() => businessType = null}
						class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					>
						← Cambiar tipo
					</button>
					<span class="text-sm text-gray-400">|</span>
					<span class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
						{#if businessType === 'individual'}
							<User class="h-4 w-4" /> Particular
						{:else}
							<Building2 class="h-4 w-4" /> Empresa
						{/if}
					</span>
				</div>

				<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					{businessType === 'individual' ? 'Registrá tus servicios' : 'Registrá tu empresa'}
				</h1>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					Completá tu perfil para que te encuentren en tu barrio.
				</p>

				<ProviderCardEditor
					mode="create"
					editorMode="full"
					businessType={businessType ?? 'individual'}
					userId={$user?.id ?? ''}
					userName={$user?.full_name ?? ''}
					initialData={emptyData}
					{saving}
					onSave={handleSave}
				/>
			{/if}
		</div>
	{/if}
</div>
