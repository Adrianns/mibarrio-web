<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { auth, user } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import { Loader2, Pencil } from 'lucide-svelte';
	import { get } from 'svelte/store';
	import { ProviderCardEditor, ProfileCompleteness } from '$lib/components/ProviderCardEditor';
	import type { Department } from '$lib/domain/types';

	let loading = $state(true);
	let saving = $state(false);
	let providerId = $state('');
	let isEditing = $state(false);

	interface ProviderData {
		id?: string;
		businessName: string;
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

	let initialData = $state<ProviderData | null>(null);

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
			businessName: data.business_name || '',
			description: data.description || '',
			department: data.department || '',
			neighborhood: data.neighborhood || '',
			address: data.address || '',
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

	onMount(async () => {
		let unsub: (() => void) | undefined;
		unsub = auth.subscribe((state) => {
			if (state.initialized) {
				if (!state.user) {
					goto('/auth/login');
				} else if (!state.provider) {
					goto('/registrar-negocio');
				} else {
					loadProvider();
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
	{:else if initialData}
		<div class="container py-8">
			<div class="flex items-center justify-between mb-6">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mi negocio</h1>
				{#if isEditing}
					<button
						type="button"
						onclick={() => isEditing = false}
						class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
					>
						Cancelar edición
					</button>
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
			/>

			<ProfileCompleteness data={initialData} />
		</div>
	{/if}
</div>
