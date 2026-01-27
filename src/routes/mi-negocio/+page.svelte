<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME, formatPrice, formatDate } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { auth, isAuthenticated, user, provider as providerStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import { uploadPhoto, deletePhoto } from '$lib/utils/upload';
	import {
		DEFAULT_CATEGORIES,
		DEPARTMENTS,
		MONTEVIDEO_NEIGHBORHOODS,
		type Department,
		type Subscription,
		type SubscriptionPayment,
		type BillingCycle
	} from '$lib/domain/types';
	import {
		Camera,
		ImagePlus,
		X,
		Loader2,
		Save,
		Eye,
		Trash2,
		CreditCard,
		CheckCircle,
		AlertTriangle,
		XCircle,
		Clock,
		RefreshCw
	} from 'lucide-svelte';
	import { get } from 'svelte/store';

	let loading = $state(true);
	let saving = $state(false);
	let uploadingLogo = $state(false);
	let uploadingGallery = $state(false);
	let providerId = $state('');

	// Editable fields
	let businessName = $state('');
	let description = $state('');
	let department = $state<Department | ''>('');
	let neighborhood = $state('');
	let address = $state('');
	let contactPhone = $state('');
	let contactWhatsapp = $state('');
	let contactEmail = $state('');
	let website = $state('');
	let socialInstagram = $state('');
	let socialFacebook = $state('');
	let logoUrl = $state<string | null>(null);
	let photos = $state<string[]>([]);
	let selectedCategories = $state<string[]>([]);

	// Subscription state
	let subscription = $state<Subscription | null>(null);
	let payments = $state<SubscriptionPayment[]>([]);
	let loadingPayment = $state(false);
	let verifyingPayment = $state(false);
	let selectedCycle = $state<BillingCycle>('monthly');

	// File inputs
	let logoInput: HTMLInputElement;
	let galleryInput: HTMLInputElement;

	const categories = DEFAULT_CATEGORIES.filter((c) => c.is_active);

	function getCategoryInfo(name: string) {
		const cat = DEFAULT_CATEGORIES.find((c) => c.name === name);
		return cat || { label: name, color: 'bg-gray-500' };
	}

	async function loadProvider() {
		const currentUser = get(user);
		if (!currentUser) {
			goto('/auth/login');
			return;
		}

		const { data, error } = await supabase
			.from('mb_providers')
			.select('*')
			.eq('user_id', currentUser.id)
			.maybeSingle();

		if (error || !data) {
			toast.error('No se encontró tu negocio');
			goto('/registrar-negocio');
			return;
		}

		providerId = data.id;
		businessName = data.business_name || '';
		description = data.description || '';
		department = data.department || '';
		neighborhood = data.neighborhood || '';
		address = data.address || '';
		contactPhone = data.contact_phone || '';
		contactWhatsapp = data.contact_whatsapp || '';
		contactEmail = data.contact_email || '';
		website = data.website || '';
		socialInstagram = data.social_instagram || '';
		socialFacebook = data.social_facebook || '';
		logoUrl = data.logo_url;
		photos = data.photos || [];

		// Load categories
		const { data: cats } = await supabase
			.from('mb_provider_categories')
			.select('category_name')
			.eq('provider_id', data.id);

		selectedCategories = cats?.map((c) => c.category_name) || [];

		// Load subscription with plan
		const { data: subData } = await supabase
			.from('mb_subscriptions')
			.select('*, plan:mb_subscription_plans(*)')
			.eq('provider_id', data.id)
			.maybeSingle();

		if (subData) {
			subscription = subData as unknown as Subscription;
			if (subData.billing_cycle) {
				selectedCycle = subData.billing_cycle as BillingCycle;
			}

			// Load payment history
			const { data: paymentData } = await supabase
				.from('mb_subscription_payments')
				.select('*')
				.eq('subscription_id', subData.id)
				.order('created_at', { ascending: false });

			payments = (paymentData || []) as unknown as SubscriptionPayment[];
		}

		loading = false;
	}

	async function handleLogoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const currentUser = get(user);
		if (!currentUser) return;

		uploadingLogo = true;

		// Delete old logo if exists
		if (logoUrl) {
			await deletePhoto(logoUrl);
		}

		const result = await uploadPhoto(currentUser.id, file, 'logo');

		if (result.error) {
			toast.error(result.error);
			uploadingLogo = false;
			return;
		}

		logoUrl = result.url;

		// Save to database
		await supabase.from('mb_providers').update({ logo_url: logoUrl }).eq('id', providerId);

		toast.success('Foto de perfil actualizada');
		uploadingLogo = false;
		input.value = '';
	}

	async function handleGalleryUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		const currentUser = get(user);
		if (!currentUser) return;

		uploadingGallery = true;

		for (const file of Array.from(files)) {
			if (photos.length >= 10) {
				toast.warning('Máximo 10 fotos en la galería');
				break;
			}

			const result = await uploadPhoto(currentUser.id, file, 'gallery');

			if (result.error) {
				toast.error(`${file.name}: ${result.error}`);
				continue;
			}

			if (result.url) {
				photos = [...photos, result.url];
			}
		}

		// Save to database
		await supabase.from('mb_providers').update({ photos }).eq('id', providerId);

		toast.success('Fotos agregadas');
		uploadingGallery = false;
		input.value = '';
	}

	async function removeGalleryPhoto(index: number) {
		const url = photos[index];

		await deletePhoto(url);

		photos = photos.filter((_, i) => i !== index);

		await supabase.from('mb_providers').update({ photos }).eq('id', providerId);

		toast.success('Foto eliminada');
	}

	async function removeLogo() {
		if (!logoUrl) return;

		await deletePhoto(logoUrl);
		logoUrl = null;

		await supabase.from('mb_providers').update({ logo_url: null }).eq('id', providerId);

		toast.success('Foto de perfil eliminada');
	}

	async function handleSave() {
		if (!businessName.trim()) {
			toast.error('El nombre del negocio es obligatorio');
			return;
		}

		if (!department) {
			toast.error('Seleccioná un departamento');
			return;
		}

		saving = true;

		const { error } = await supabase
			.from('mb_providers')
			.update({
				business_name: businessName.trim(),
				description: description.trim() || null,
				department,
				neighborhood: neighborhood || null,
				address: address.trim() || null,
				contact_phone: contactPhone.trim() || null,
				contact_whatsapp: contactWhatsapp.trim() || null,
				contact_email: contactEmail.trim() || null,
				website: website.trim() || null,
				social_instagram: socialInstagram.trim() || null,
				social_facebook: socialFacebook.trim() || null
			})
			.eq('id', providerId);

		if (error) {
			toast.error('Error al guardar los cambios');
			saving = false;
			return;
		}

		// Update categories
		await supabase.from('mb_provider_categories').delete().eq('provider_id', providerId);

		if (selectedCategories.length > 0) {
			await supabase.from('mb_provider_categories').insert(
				selectedCategories.map((name) => ({
					provider_id: providerId,
					category_name: name
				}))
			);
		}

		// Refresh auth store
		await auth.refreshProvider();

		toast.success('Cambios guardados');
		saving = false;
	}

	async function handlePayment() {
		if (!subscription) return;

		loadingPayment = true;

		try {
			const session = await supabase.auth.getSession();
			const token = session.data.session?.access_token;
			if (!token) {
				toast.error('Sesión expirada. Volvé a iniciar sesión.');
				loadingPayment = false;
				return;
			}

			const res = await fetch('/api/mercadopago/create-preference', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					subscription_id: subscription.id,
					billing_cycle: selectedCycle
				})
			});

			const data = await res.json();

			if (!res.ok) {
				toast.error(data.error || 'Error al crear el pago');
				loadingPayment = false;
				return;
			}

			// Redirect to MercadoPago checkout
			window.location.href = data.init_point;
		} catch {
			toast.error('Error al procesar el pago');
			loadingPayment = false;
		}
	}

	async function handleVerify() {
		if (!subscription) return;

		verifyingPayment = true;

		try {
			const session = await supabase.auth.getSession();
			const token = session.data.session?.access_token;
			if (!token) {
				toast.error('Sesión expirada');
				verifyingPayment = false;
				return;
			}

			const res = await fetch('/api/mercadopago/verify', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ subscription_id: subscription.id })
			});

			const data = await res.json();

			if (data.status === 'active') {
				toast.success('Pago confirmado. Tu suscripción está activa.');
				await loadProvider();
			} else {
				toast.info('Tu pago aún no fue confirmado. Intentá de nuevo en unos minutos.');
			}
		} catch {
			toast.error('Error al verificar el pago');
		}

		verifyingPayment = false;
	}

	function isExpiringSoon(): boolean {
		if (!subscription?.ends_at) return false;
		const endsAt = new Date(subscription.ends_at);
		const daysLeft = (endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
		return daysLeft <= 7;
	}

	function toggleCategory(name: string) {
		if (selectedCategories.includes(name)) {
			selectedCategories = selectedCategories.filter((c) => c !== name);
		} else {
			selectedCategories = [...selectedCategories, name];
		}
	}

	onMount(async () => {
		// Handle payment return query params
		const currentPage = get(page);
		const paymentStatus = currentPage.url.searchParams.get('payment');
		if (paymentStatus === 'success') {
			toast.success('Pago realizado. Verificando tu suscripción...');
		} else if (paymentStatus === 'failure') {
			toast.error('El pago no se pudo completar. Intentá de nuevo.');
		} else if (paymentStatus === 'pending') {
			toast.info('Tu pago está pendiente de confirmación.');
		}

		// Clean URL params
		if (paymentStatus) {
			const url = new URL(window.location.href);
			url.searchParams.delete('payment');
			history.replaceState({}, '', url.pathname);
		}

		let unsub: (() => void) | undefined;
		unsub = auth.subscribe((state) => {
			if (state.initialized) {
				if (!state.user) {
					goto('/auth/login');
				} else if (!state.provider) {
					goto('/registrar-negocio');
				} else {
					loadProvider().then(() => {
						// Auto-verify if returning from payment success
						if (paymentStatus === 'success' && subscription && subscription.status !== 'active') {
							handleVerify();
						}
					});
				}
				queueMicrotask(() => unsub?.());
			}
		});
	});
</script>

<svelte:head>
	<title>Mi negocio - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<Header items={[{ label: 'Directorio', href: '/directorio' }]} />

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
			<span class="ml-2 text-gray-600 dark:text-gray-400">Cargando...</span>
		</div>
	{:else}
		<div class="container py-8 max-w-3xl">
			<div class="flex items-center justify-between mb-6">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mi negocio</h1>
				<a
					href="/directorio/{providerId}"
					class="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
				>
					<Eye class="h-4 w-4" />
					Ver perfil público
				</a>
			</div>

			<!-- Profile Photo -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Foto de perfil</h2>

				<div class="flex items-center gap-6">
					<div class="relative">
						{#if logoUrl}
							<img
								src={logoUrl}
								alt="Logo"
								loading="lazy"
								class="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
							/>
							<button
								onclick={removeLogo}
								class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
							>
								<X class="h-3 w-3" />
							</button>
						{:else}
							<div
								class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600"
							>
								{#if uploadingLogo}
									<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
								{:else}
									<Camera class="h-8 w-8 text-gray-400" />
								{/if}
							</div>
						{/if}
					</div>

					<div>
						<Button
							variant="outline"
							size="sm"
							onclick={() => logoInput.click()}
							disabled={uploadingLogo}
						>
							{#if uploadingLogo}
								<Loader2 class="h-4 w-4 mr-2 animate-spin" />
								Subiendo...
							{:else}
								<Camera class="h-4 w-4 mr-2" />
								{logoUrl ? 'Cambiar foto' : 'Subir foto'}
							{/if}
						</Button>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG o WebP. Máx 5MB.</p>
					</div>
				</div>

				<input
					bind:this={logoInput}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					class="hidden"
					onchange={handleLogoUpload}
				/>
			</div>

			<!-- Gallery -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">
						Galería <span class="text-sm font-normal text-gray-500 dark:text-gray-400">({photos.length}/10)</span>
					</h2>
					<Button
						variant="outline"
						size="sm"
						onclick={() => galleryInput.click()}
						disabled={uploadingGallery || photos.length >= 10}
					>
						{#if uploadingGallery}
							<Loader2 class="h-4 w-4 mr-2 animate-spin" />
							Subiendo...
						{:else}
							<ImagePlus class="h-4 w-4 mr-2" />
							Agregar fotos
						{/if}
					</Button>
				</div>

				{#if photos.length > 0}
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
						{#each photos as photo, i}
							<div class="relative group aspect-square">
								<img
									src={photo}
									alt="Foto {i + 1}"
									loading="lazy"
									class="w-full h-full object-cover rounded-lg"
								/>
								<button
									onclick={() => removeGalleryPhoto(i)}
									class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
								>
									<Trash2 class="h-4 w-4" />
								</button>
							</div>
						{/each}
					</div>
				{:else}
					<div
						class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
						role="button"
						tabindex="0"
						onclick={() => galleryInput.click()}
						onkeydown={(e) => { if (e.key === 'Enter') galleryInput.click(); }}
					>
						<ImagePlus class="h-10 w-10 text-gray-400 mx-auto mb-2" />
						<p class="text-gray-500 dark:text-gray-400 text-sm">
							Arrastrá fotos o hacé click para agregar
						</p>
						<p class="text-gray-400 dark:text-gray-500 text-xs mt-1">
							JPG, PNG o WebP. Máx 5MB cada una.
						</p>
					</div>
				{/if}

				<input
					bind:this={galleryInput}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					multiple
					class="hidden"
					onchange={handleGalleryUpload}
				/>
			</div>

			<!-- Subscription -->
			{#if subscription}
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Suscripción</h2>

					<!-- Status Banner -->
					{#if subscription.status === 'active'}
						<div class="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-4">
							<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
							<div>
								<p class="font-medium text-green-800 dark:text-green-300">Suscripción activa</p>
								{#if subscription.ends_at}
									<p class="text-sm text-green-700 dark:text-green-400">
										Válida hasta {formatDate(subscription.ends_at)}
										{#if subscription.billing_cycle === 'annual'}
											<span class="ml-1 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Anual</span>
										{:else}
											<span class="ml-1 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Mensual</span>
										{/if}
									</p>
								{/if}
							</div>
						</div>

						{#if isExpiringSoon()}
							<div class="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-4">
								<AlertTriangle class="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
								<div>
									<p class="font-medium text-yellow-800 dark:text-yellow-300">Tu suscripción está por vencer</p>
									<p class="text-sm text-yellow-700 dark:text-yellow-400">Renová para no perder tu perfil activo en el directorio.</p>
								</div>
							</div>

							<!-- Renew -->
							<div class="space-y-3 mb-4">
								<div class="flex gap-3">
									<button
										type="button"
										onclick={() => selectedCycle = 'monthly'}
										class="flex-1 p-3 rounded-lg border-2 text-center text-sm transition-colors {selectedCycle === 'monthly'
											? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:text-white'
											: 'border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:border-gray-300'}"
									>
										<span class="font-medium">Mensual</span>
										<br />
										<span class="text-gray-500 dark:text-gray-400">{formatPrice(390)}/mes</span>
									</button>
									<button
										type="button"
										onclick={() => selectedCycle = 'annual'}
										class="flex-1 p-3 rounded-lg border-2 text-center text-sm transition-colors relative {selectedCycle === 'annual'
											? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:text-white'
											: 'border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:border-gray-300'}"
									>
										<span class="absolute -top-2.5 right-2 text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">2 meses gratis</span>
										<span class="font-medium">Anual</span>
										<br />
										<span class="text-gray-500 dark:text-gray-400">{formatPrice(3900)}/año</span>
									</button>
								</div>

								<Button onclick={handlePayment} disabled={loadingPayment} class="w-full">
									{#if loadingPayment}
										<Loader2 class="h-4 w-4 mr-2 animate-spin" />
										Procesando...
									{:else}
										<CreditCard class="h-4 w-4 mr-2" />
										Renovar suscripción
									{/if}
								</Button>
							</div>
						{/if}

					{:else if subscription.status === 'pending'}
						<div class="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-4">
							<Clock class="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
							<div>
								<p class="font-medium text-yellow-800 dark:text-yellow-300">Periodo de prueba</p>
								<p class="text-sm text-yellow-700 dark:text-yellow-400">Activá tu suscripción para aparecer en el directorio.</p>
							</div>
						</div>

						<!-- Billing cycle selector -->
						<div class="space-y-3 mb-4">
							<div class="flex gap-3">
								<button
									type="button"
									onclick={() => selectedCycle = 'monthly'}
									class="flex-1 p-3 rounded-lg border-2 text-center text-sm transition-colors {selectedCycle === 'monthly'
										? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:text-white'
										: 'border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:border-gray-300'}"
								>
									<span class="font-medium">Mensual</span>
									<br />
									<span class="text-gray-500 dark:text-gray-400">{formatPrice(390)}/mes</span>
								</button>
								<button
									type="button"
									onclick={() => selectedCycle = 'annual'}
									class="flex-1 p-3 rounded-lg border-2 text-center text-sm transition-colors relative {selectedCycle === 'annual'
										? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:text-white'
										: 'border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:border-gray-300'}"
								>
									<span class="absolute -top-2.5 right-2 text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">2 meses gratis</span>
									<span class="font-medium">Anual</span>
									<br />
									<span class="text-gray-500 dark:text-gray-400">{formatPrice(3900)}/año</span>
								</button>
							</div>

							<Button onclick={handlePayment} disabled={loadingPayment} class="w-full">
								{#if loadingPayment}
									<Loader2 class="h-4 w-4 mr-2 animate-spin" />
									Procesando...
								{:else}
									<CreditCard class="h-4 w-4 mr-2" />
									Pagar con MercadoPago
								{/if}
							</Button>

							<button
								type="button"
								onclick={handleVerify}
								disabled={verifyingPayment}
								class="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-center gap-1"
							>
								{#if verifyingPayment}
									<Loader2 class="h-3 w-3 animate-spin" />
								{:else}
									<RefreshCw class="h-3 w-3" />
								{/if}
								Ya pagué, verificar pago
							</button>
						</div>

					{:else if subscription.status === 'expired'}
						<div class="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
							<XCircle class="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
							<div>
								<p class="font-medium text-red-800 dark:text-red-300">Suscripción expirada</p>
								<p class="text-sm text-red-700 dark:text-red-400">Tu perfil no está visible en el directorio. Reactivá tu suscripción.</p>
							</div>
						</div>

						<!-- Reactivate -->
						<div class="space-y-3 mb-4">
							<div class="flex gap-3">
								<button
									type="button"
									onclick={() => selectedCycle = 'monthly'}
									class="flex-1 p-3 rounded-lg border-2 text-center text-sm transition-colors {selectedCycle === 'monthly'
										? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:text-white'
										: 'border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:border-gray-300'}"
								>
									<span class="font-medium">Mensual</span>
									<br />
									<span class="text-gray-500 dark:text-gray-400">{formatPrice(390)}/mes</span>
								</button>
								<button
									type="button"
									onclick={() => selectedCycle = 'annual'}
									class="flex-1 p-3 rounded-lg border-2 text-center text-sm transition-colors relative {selectedCycle === 'annual'
										? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:text-white'
										: 'border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:border-gray-300'}"
								>
									<span class="absolute -top-2.5 right-2 text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">2 meses gratis</span>
									<span class="font-medium">Anual</span>
									<br />
									<span class="text-gray-500 dark:text-gray-400">{formatPrice(3900)}/año</span>
								</button>
							</div>

							<Button onclick={handlePayment} disabled={loadingPayment} class="w-full">
								{#if loadingPayment}
									<Loader2 class="h-4 w-4 mr-2 animate-spin" />
									Procesando...
								{:else}
									<CreditCard class="h-4 w-4 mr-2" />
									Reactivar suscripción
								{/if}
							</Button>
						</div>
					{/if}

					<!-- Payment History -->
					{#if payments.length > 0}
						<div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
							<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Historial de pagos</h3>
							<div class="space-y-2">
								{#each payments as payment}
									<div class="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
										<div class="flex items-center gap-2">
											{#if payment.status === 'approved'}
												<CheckCircle class="h-4 w-4 text-green-500" />
											{:else if payment.status === 'pending'}
												<Clock class="h-4 w-4 text-yellow-500" />
											{:else if payment.status === 'rejected'}
												<XCircle class="h-4 w-4 text-red-500" />
											{:else}
												<AlertTriangle class="h-4 w-4 text-gray-400" />
											{/if}
											<span class="text-gray-700 dark:text-gray-300">{formatPrice(payment.amount)}</span>
											{#if payment.billing_cycle}
												<span class="text-xs text-gray-500 dark:text-gray-400">
													({payment.billing_cycle === 'monthly' ? 'Mensual' : 'Anual'})
												</span>
											{/if}
										</div>
										<span class="text-gray-500 dark:text-gray-400">
											{payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
										</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Business Info -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información del negocio</h2>

				<div class="space-y-4">
					<div>
						<label for="businessName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Nombre del negocio
						</label>
						<input
							id="businessName"
							type="text"
							bind:value={businessName}
							class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
						/>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Descripción
						</label>
						<textarea
							id="description"
							bind:value={description}
							rows="4"
							class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none resize-none"
						></textarea>
					</div>
				</div>
			</div>

			<!-- Categories -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Categorías</h2>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Seleccioná las categorías que representen tu negocio ({selectedCategories.length} seleccionadas)</p>

				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{#each categories as cat}
						<button
							type="button"
							onclick={() => toggleCategory(cat.name)}
							class="p-3 rounded-lg border-2 text-left text-sm dark:text-gray-300 {selectedCategories.includes(cat.name)
								? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
								: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
						>
							<span class="inline-block w-3 h-3 rounded-full {cat.color} mr-2"></span>
							{cat.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Location -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ubicación</h2>

				<div class="space-y-4">
					<div>
						<label for="department" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Departamento
						</label>
						<select
							id="department"
							bind:value={department}
							class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none appearance-none bg-white dark:bg-gray-700 dark:text-white"
						>
							<option value="">Seleccioná un departamento</option>
							{#each DEPARTMENTS as dept}
								<option value={dept}>{dept}</option>
							{/each}
						</select>
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
			</div>

			<!-- Contact -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contacto</h2>

				<div class="space-y-4">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="contactPhone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Teléfono
							</label>
							<input
								id="contactPhone"
								type="tel"
								bind:value={contactPhone}
								placeholder="099 123 456"
								class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
							/>
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
					</div>

					<div>
						<label for="contactEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Email
						</label>
						<input
							id="contactEmail"
							type="email"
							bind:value={contactEmail}
							class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
						/>
					</div>

					<div>
						<label for="website" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Sitio web (opcional)
						</label>
						<input
							id="website"
							type="text"
							bind:value={website}
							placeholder="https://..."
							class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
						/>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="socialInstagram" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Instagram
							</label>
							<input
								id="socialInstagram"
								type="text"
								bind:value={socialInstagram}
								placeholder="@usuario"
								class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
							/>
						</div>
						<div>
							<label for="socialFacebook" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Facebook
							</label>
							<input
								id="socialFacebook"
								type="text"
								bind:value={socialFacebook}
								placeholder="/pagina"
								class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Save button -->
			<div class="flex justify-end gap-3">
				<a href="/directorio/{providerId}">
					<Button variant="outline">
						<Eye class="h-4 w-4 mr-2" />
						Ver perfil
					</Button>
				</a>
				<Button onclick={handleSave} disabled={saving}>
					{#if saving}
						<Loader2 class="h-4 w-4 mr-2 animate-spin" />
						Guardando...
					{:else}
						<Save class="h-4 w-4 mr-2" />
						Guardar cambios
					{/if}
				</Button>
			</div>
		</div>
	{/if}
</div>
