<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { auth, user } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import { Loader2, Pencil, Save } from 'lucide-svelte';
	import { get } from 'svelte/store';
	import { ProviderCardEditor, ProfileCompleteness } from '$lib/components/ProviderCardEditor';
	import SlugEditor from '$lib/components/SlugEditor.svelte';
	import ServicesEditor from '$lib/components/ProviderCardEditor/ServicesEditor.svelte';
	import ProductsEditor from '$lib/components/ProviderCardEditor/ProductsEditor.svelte';
	import HoursEditor from '$lib/components/ProviderCardEditor/HoursEditor.svelte';
	import BannerEditor from '$lib/components/ProviderCardEditor/BannerEditor.svelte';
	import PromotionsEditor from '$lib/components/ProviderCardEditor/PromotionsEditor.svelte';
	import PremiumGate from '$lib/components/PremiumGate.svelte';
	import SubscriptionCard from '$lib/components/SubscriptionCard.svelte';
	import { isPremium as checkPremium } from '$lib/utils/subscription';
	import type { Department, ProviderService, ProviderHours, ProviderPromotion, Subscription } from '$lib/domain/types';
	import { ImagePlus, Tag, Link, ShoppingBag } from 'lucide-svelte';

	let loading = $state(true);
	let saving = $state(false);
	let providerId = $state('');
	let isEditing = $state(false);
	let editorSave = $state<(() => void) | null>(null);

	interface ProviderData {
		id?: string;
		slug?: string | null;
		businessName: string;
		description: string;
		department: Department | '';
		neighborhood: string;
		address: string;
		locationLat: number | null;
		locationLng: number | null;
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

	let initialData = $state<ProviderData | null>(null);
	let services = $state<ProviderService[]>([]);
	let products = $state<ProviderService[]>([]);
	let hours = $state<ProviderHours[]>([]);
	let promotions = $state<ProviderPromotion[]>([]);
	let subscription = $state<Subscription | null>(null);
	let bannerUrl = $state<string | null>(null);
	let hasPremium = $derived(checkPremium(subscription));

	// Extract username from Instagram URL
	function extractInstagramUsername(url: string | null): string {
		if (!url) return '';
		const match = url.match(/(?:instagram\.com\/|^@?)([^\/\?]+)/i);
		return match ? match[1].replace(/^@/, '') : url;
	}

	// Extract page name from Facebook URL
	function extractFacebookPage(url: string | null): string {
		if (!url) return '';
		const match = url.match(/(?:facebook\.com\/|^\/?)([^\/\?]+)/i);
		return match ? match[1].replace(/^\//, '') : url;
	}

	// Format Instagram username to URL
	function formatInstagram(username: string): string | null {
		if (!username) return null;
		const clean = username.replace(/^@/, '').trim();
		if (!clean) return null;
		return `https://instagram.com/${clean}`;
	}

	// Format Facebook page to URL
	function formatFacebook(page: string): string | null {
		if (!page) return null;
		const clean = page.replace(/^\//, '').trim();
		if (!clean) return null;
		return `https://facebook.com/${clean}`;
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

		// Load categories
		const { data: cats } = await supabase
			.from('mb_provider_categories')
			.select('category_name')
			.eq('provider_id', data.id);

		initialData = {
			id: data.id,
			slug: data.slug || null,
			businessName: data.business_name || '',
			description: data.description || '',
			department: data.department || '',
			neighborhood: data.neighborhood || '',
			address: data.address || '',
			locationLat: data.location_lat ?? null,
			locationLng: data.location_lng ?? null,
			phone: data.contact_phone || '',
			whatsapp: data.contact_whatsapp || '',
			email: data.contact_email || '',
			website: data.website || '',
			instagram: extractInstagramUsername(data.social_instagram),
			facebook: extractFacebookPage(data.social_facebook),
			logoUrl: data.logo_url,
			photos: data.photos || [],
			categories: cats?.map((c) => c.category_name) || [],
			isVerified: data.is_verified
		};

		bannerUrl = data.banner_url || null;

		// Load additional data in parallel
		const [servicesRes, hoursRes, promosRes, subRes] = await Promise.all([
			supabase.from('mb_provider_services').select('*').eq('provider_id', data.id).order('display_order'),
			supabase.from('mb_provider_hours').select('*').eq('provider_id', data.id).order('day_of_week'),
			supabase.from('mb_provider_promotions').select('*').eq('provider_id', data.id).order('created_at', { ascending: false }),
			supabase.from('mb_subscriptions').select('*, plan:mb_subscription_plans(*)').eq('provider_id', data.id).maybeSingle()
		]);

		const allServices = servicesRes.data || [];
		services = allServices.filter((s: ProviderService) => s.type !== 'product');
		products = allServices.filter((s: ProviderService) => s.type === 'product');
		hours = hoursRes.data || [];
		promotions = promosRes.data || [];
		subscription = subRes.data;

		loading = false;
	}

	async function handleSave(data: ProviderData) {
		if (!data.businessName.trim()) {
			toast.error('El nombre del negocio es obligatorio');
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

		const { error } = await supabase
			.from('mb_providers')
			.update({
				business_name: data.businessName.trim(),
				description: data.description.trim() || null,
				department: data.department,
				neighborhood: data.neighborhood || null,
				address: data.address.trim() || null,
				location_lat: data.locationLat,
				location_lng: data.locationLng,
				contact_phone: data.phone.trim() || null,
				contact_whatsapp: data.whatsapp.trim() || null,
				contact_email: data.email.trim() || null,
				website: data.website.trim() || null,
				social_instagram: formatInstagram(data.instagram),
				social_facebook: formatFacebook(data.facebook),
				logo_url: data.logoUrl,
				photos: data.photos
			})
			.eq('id', providerId);

		if (error) {
			toast.error('Error al guardar los cambios');
			saving = false;
			return;
		}

		// Update categories
		await supabase.from('mb_provider_categories').delete().eq('provider_id', providerId);

		if (data.categories.length > 0) {
			await supabase.from('mb_provider_categories').insert(
				data.categories.map((name) => ({
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

	async function checkPaymentReturn() {
		const params = new URLSearchParams(window.location.search);
		const paymentStatus = params.get('payment');
		if (!paymentStatus || !subscription) return;

		// Clean up URL
		const cleanUrl = window.location.pathname;
		window.history.replaceState({}, '', cleanUrl);

		if (paymentStatus === 'success') {
			toast.success('Pago recibido. Verificando...');
			// Poll verify endpoint
			const { data: { session } } = await supabase.auth.getSession();
			if (!session) return;

			for (let i = 0; i < 5; i++) {
				await new Promise((r) => setTimeout(r, 2000));
				const res = await fetch('/api/mercadopago/verify', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${session.access_token}`
					},
					body: JSON.stringify({ subscription_id: subscription.id })
				});
				const data = await res.json();
				if (data.status === 'active') {
					toast.success('Premium activado');
					await loadProvider();
					return;
				}
			}
			toast.info('El pago está pendiente de confirmación. Puede demorar unos minutos.');
		} else if (paymentStatus === 'failure') {
			toast.error('El pago no se completó');
		} else if (paymentStatus === 'pending') {
			toast.info('El pago está pendiente de confirmación');
		}
	}

	onMount(async () => {
		let unsub: (() => void) | undefined;
		unsub = auth.subscribe((state) => {
			if (state.initialized) {
				if (!state.user) {
					goto('/auth/login');
				} else if (!state.provider) {
					goto('/registrar-negocio');
				} else {
					loadProvider().then(() => checkPaymentReturn());
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
	<Header items={[{ label: 'Directorio', href: '/directorio/mapa' }]} />

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
			<span class="ml-2 text-gray-600 dark:text-gray-400">Cargando...</span>
		</div>
	{:else if initialData}
		<div class="container py-8">
			<div class="flex items-center justify-between mb-6">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mi negocio</h1>
				{#if isEditing}
					<div class="flex items-center gap-4">
						<button
							type="button"
							onclick={() => isEditing = false}
							class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
						>
							Cancelar
						</button>
						<button
							type="button"
							onclick={() => editorSave?.()}
							disabled={saving}
							class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
						>
							{#if saving}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else}
								<Save class="h-4 w-4" />
							{/if}
							<span>Guardar</span>
						</button>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => isEditing = true}
						class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
					>
						<Pencil class="h-4 w-4" />
						<span>Editar</span>
					</button>
				{/if}
			</div>

			<ProviderCardEditor
				mode="edit"
				editorMode="full"
				readOnly={!isEditing}
				userId={$user?.id ?? ''}
				{initialData}
				{saving}
				onSave={(data) => { handleSave(data); isEditing = false; }}
				onReady={(fns) => { editorSave = fns.save; }}
			/>

			<ProfileCompleteness data={initialData} />

			<!-- Slug Editor Section (Premium) -->
			<div class="mt-8">
				<PremiumGate
					premium={hasPremium}
					title="URL personalizada"
					description="Creá una URL única y profesional para compartir tu negocio fácilmente"
					icon={Link}
				>
					<SlugEditor
						providerId={providerId}
						currentSlug={initialData.slug}
						onSave={(newSlug) => {
							if (initialData) {
								initialData.slug = newSlug;
							}
						}}
					/>
				</PremiumGate>
			</div>

			<!-- Services Section -->
			<div class="mt-8">
				<ServicesEditor
					{supabase}
					{providerId}
					premium={hasPremium}
					initialServices={services}
				/>
			</div>

			<!-- Products Catalog Section (Premium) -->
			<div class="mt-8">
				<PremiumGate
					premium={hasPremium}
					title="Catálogo de productos"
					description="Mostrá tus productos con fotos, precios y descripciones para atraer más clientes"
					icon={ShoppingBag}
				>
					<ProductsEditor
						{supabase}
						{providerId}
						userId={$user?.id ?? ''}
						premium={hasPremium}
						initialProducts={products}
						serviceCount={services.length}
					/>
				</PremiumGate>
			</div>

			<!-- Business Hours Section (free for all) -->
			<div class="mt-8">
				<HoursEditor
					{supabase}
					{providerId}
					initialHours={hours}
				/>
			</div>

			<!-- Banner Section (Premium) -->
			<div class="mt-8">
				<PremiumGate
					premium={hasPremium}
					title="Imagen de portada"
					description="Destaca tu negocio con una imagen de portada profesional en tu perfil"
					icon={ImagePlus}
				>
					<BannerEditor
						{supabase}
						{providerId}
						userId={$user?.id ?? ''}
						{bannerUrl}
					/>
				</PremiumGate>
			</div>

			<!-- Promotions Section (Premium) -->
			<div class="mt-8">
				<PremiumGate
					premium={hasPremium}
					title="Promociones"
					description="Publica ofertas y descuentos para atraer más clientes a tu negocio"
					icon={Tag}
				>
					<PromotionsEditor
						{supabase}
						{providerId}
						initialPromotions={promotions}
					/>
				</PremiumGate>
			</div>

			<!-- Subscription Section -->
			<div class="mt-8">
				<SubscriptionCard
					{providerId}
					{subscription}
					onSubscriptionChange={(sub) => { subscription = sub; }}
				/>
			</div>
		</div>
	{/if}
</div>
