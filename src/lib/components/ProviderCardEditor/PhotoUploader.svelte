<script lang="ts">
	import { Camera, ImagePlus, Loader2, Trash2, X } from 'lucide-svelte';
	import { toast } from '$lib/stores/toast';
	import { uploadPhoto, deletePhoto } from '$lib/utils/upload';

	let {
		userId,
		logoUrl = $bindable<string | null>(null),
		photos = $bindable<string[]>([]),
		maxPhotos = 10,
		onLogoChange = (url: string | null) => {},
		onPhotosChange = (urls: string[]) => {}
	} = $props();

	let uploadingLogo = $state(false);
	let uploadingGallery = $state(false);
	let deletingLogo = $state(false);
	let deletingPhotoIndex = $state<number | null>(null);
	let logoInput: HTMLInputElement;
	let galleryInput: HTMLInputElement;

	async function handleLogoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !userId) return;

		uploadingLogo = true;

		// Delete old logo if exists
		if (logoUrl) {
			await deletePhoto(logoUrl);
		}

		const result = await uploadPhoto(userId, file, 'logo');

		if (result.error) {
			toast.error(result.error);
			uploadingLogo = false;
			return;
		}

		logoUrl = result.url;
		onLogoChange(logoUrl);
		toast.success('Foto de perfil actualizada');
		uploadingLogo = false;
		input.value = '';
	}

	async function removeLogo() {
		if (!logoUrl || deletingLogo) return;
		deletingLogo = true;
		const result = await deletePhoto(logoUrl);
		if (result.error) {
			toast.error(result.error);
			deletingLogo = false;
			return;
		}
		logoUrl = null;
		onLogoChange(null);
		deletingLogo = false;
		toast.success('Foto de perfil eliminada');
	}

	async function handleGalleryUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0 || !userId) return;

		uploadingGallery = true;

		for (const file of Array.from(files)) {
			if (photos.length >= maxPhotos) {
				toast.warning(`Máximo ${maxPhotos} fotos en la galería`);
				break;
			}

			const result = await uploadPhoto(userId, file, 'gallery');

			if (result.error) {
				toast.error(`${file.name}: ${result.error}`);
				continue;
			}

			if (result.url) {
				photos = [...photos, result.url];
			}
		}

		onPhotosChange(photos);
		toast.success('Fotos agregadas');
		uploadingGallery = false;
		input.value = '';
	}

	async function removeGalleryPhoto(index: number) {
		if (deletingPhotoIndex !== null) return;
		const url = photos[index];
		deletingPhotoIndex = index;
		const result = await deletePhoto(url);
		if (result.error) {
			toast.error(result.error);
			deletingPhotoIndex = null;
			return;
		}
		photos = photos.filter((_, i) => i !== index);
		onPhotosChange(photos);
		deletingPhotoIndex = null;
		toast.success('Foto eliminada');
	}
</script>

<div class="space-y-6">
	<!-- Logo Section -->
	<div class="flex items-center gap-4">
		<div class="relative">
			{#if logoUrl}
				<img
					src={logoUrl}
					alt="Logo"
					loading="lazy"
					class="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
				/>
				<button
					type="button"
					onclick={removeLogo}
					disabled={deletingLogo}
					class="absolute -top-1 -right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
				>
					{#if deletingLogo}
						<Loader2 class="h-4 w-4 animate-spin" />
					{:else}
						<X class="h-4 w-4" />
					{/if}
				</button>
			{:else}
				<button
					type="button"
					onclick={() => logoInput.click()}
					disabled={uploadingLogo}
					class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 transition-colors cursor-pointer"
				>
					{#if uploadingLogo}
						<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
					{:else}
						<Camera class="h-8 w-8 text-gray-400" />
					{/if}
				</button>
			{/if}
		</div>

		{#if logoUrl}
			<button
				type="button"
				onclick={() => logoInput.click()}
				disabled={uploadingLogo}
				class="text-sm text-primary-600 hover:text-primary-700"
			>
				{#if uploadingLogo}
					Subiendo...
				{:else}
					Cambiar foto
				{/if}
			</button>
		{:else}
			<span class="text-sm text-gray-500 dark:text-gray-400">
				Click para agregar foto de perfil
			</span>
		{/if}

		<input
			bind:this={logoInput}
			type="file"
			accept="image/jpeg,image/png,image/webp"
			class="hidden"
			onchange={handleLogoUpload}
		/>
	</div>

	<!-- Gallery Section -->
	<div>
		<div class="flex items-center justify-between mb-3">
			<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Fotos ({photos.length}/{maxPhotos})
			</h3>
			{#if photos.length < maxPhotos}
				<button
					type="button"
					onclick={() => galleryInput.click()}
					disabled={uploadingGallery}
					class="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
				>
					{#if uploadingGallery}
						<Loader2 class="h-4 w-4 animate-spin" />
						Subiendo...
					{:else}
						<ImagePlus class="h-4 w-4" />
						Agregar
					{/if}
				</button>
			{/if}
		</div>

		{#if photos.length > 0}
			<div class="grid grid-cols-3 gap-3">
				{#each photos as photo, i (photo)}
					<div class="relative group aspect-square">
						<img
							src={photo}
							alt="Foto {i + 1}"
							loading="lazy"
							class="w-full h-full object-cover rounded-lg"
						/>
						<button
							type="button"
							onclick={() => removeGalleryPhoto(i)}
							disabled={deletingPhotoIndex !== null}
							class="absolute top-1 right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
						>
							{#if deletingPhotoIndex === i}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else}
								<Trash2 class="h-4 w-4" />
							{/if}
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<button
				type="button"
				onclick={() => galleryInput.click()}
				disabled={uploadingGallery}
				class="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
			>
				{#if uploadingGallery}
					<Loader2 class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
					<p class="text-gray-500 text-sm">Subiendo...</p>
				{:else}
					<ImagePlus class="h-8 w-8 text-gray-400 mx-auto mb-2" />
					<p class="text-gray-500 dark:text-gray-400 text-sm">
						Click para agregar fotos
					</p>
				{/if}
			</button>
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
</div>
