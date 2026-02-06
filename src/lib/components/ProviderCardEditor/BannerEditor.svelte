<script lang="ts">
	import { ImagePlus, Trash2, Loader2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { compressImage } from '$lib/utils/upload';
	import type { SupabaseClient } from '@supabase/supabase-js';

	let {
		supabase,
		providerId,
		userId,
		bannerUrl = null
	}: {
		supabase: SupabaseClient;
		providerId: string;
		userId: string;
		bannerUrl: string | null;
	} = $props();

	let currentBanner = $state(bannerUrl);
	let uploading = $state(false);
	let fileInput: HTMLInputElement;

	async function uploadBanner(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploading = true;
		try {
			// Compress to WebP
			const compressed = await compressImage(file, 1920, 0.9);
			const fileName = `${userId}/banner/${Date.now()}.webp`;

			// Delete old banner if exists
			if (currentBanner) {
				const oldPath = currentBanner.split('/provider-photos/')[1];
				if (oldPath) {
					await supabase.storage.from('provider-photos').remove([oldPath]);
				}
			}

			// Upload new banner
			const { error: uploadError } = await supabase.storage
				.from('provider-photos')
				.upload(fileName, compressed, {
					contentType: 'image/webp',
					cacheControl: '31536000'
				});

			if (uploadError) throw uploadError;

			// Get public URL
			const { data: urlData } = supabase.storage.from('provider-photos').getPublicUrl(fileName);

			// Update provider
			const { error: updateError } = await supabase
				.from('mb_providers')
				.update({ banner_url: urlData.publicUrl })
				.eq('id', providerId);

			if (!updateError) {
				currentBanner = urlData.publicUrl;
			}
		} catch (err) {
			console.error('Banner upload failed:', err);
		}
		uploading = false;
		input.value = '';
	}

	async function deleteBanner() {
		if (!currentBanner) return;
		const oldPath = currentBanner.split('/provider-photos/')[1];
		if (oldPath) {
			await supabase.storage.from('provider-photos').remove([oldPath]);
		}
		await supabase.from('mb_providers').update({ banner_url: null }).eq('id', providerId);
		currentBanner = null;
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
	<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Imagen de portada</h3>

	{#if currentBanner}
		<div class="relative rounded-lg overflow-hidden mb-3">
			<img src={currentBanner} alt="Banner" class="w-full h-40 object-cover" />
			<button
				onclick={deleteBanner}
				class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
			>
				<Trash2 class="h-4 w-4" />
			</button>
		</div>
	{/if}

	<input bind:this={fileInput} type="file" accept="image/*" onchange={uploadBanner} class="hidden" />

	<Button
		variant="outline"
		size="sm"
		onclick={() => fileInput.click()}
		disabled={uploading}
		class="w-full"
	>
		{#if uploading}
			<Loader2 class="h-4 w-4 mr-1 animate-spin" /> Subiendo...
		{:else}
			<ImagePlus class="h-4 w-4 mr-1" />
			{currentBanner ? 'Cambiar portada' : 'Subir imagen de portada'}
		{/if}
	</Button>
	<p class="text-xs text-gray-400 mt-2">Recomendado: 1920x400px o similar (16:5)</p>
</div>
