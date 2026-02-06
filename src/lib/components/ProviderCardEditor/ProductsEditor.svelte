<script lang="ts">
	import { Plus, Pencil, Trash2, ImagePlus, X, ArrowRight, Crown, Loader2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { FREE_SERVICES_LIMIT } from '$lib/domain/types';
	import type { ProviderService } from '$lib/domain/types';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { uploadPhoto, deletePhoto } from '$lib/utils/upload';
	import { toast } from '$lib/stores/toast';

	let {
		supabase,
		providerId,
		userId,
		premium = false,
		initialProducts = [],
		serviceCount = 0
	}: {
		supabase: SupabaseClient;
		providerId: string;
		userId: string;
		premium: boolean;
		initialProducts: ProviderService[];
		serviceCount: number;
	} = $props();

	let products = $state<ProviderService[]>([...initialProducts]);
	let editingId = $state<string | null>(null);
	let adding = $state(false);
	let saving = $state(false);
	let uploading = $state(false);

	// Combined count of services + products for free tier limit
	let totalItems = $derived(serviceCount + products.length);
	let atLimit = $derived(!premium && totalItems >= FREE_SERVICES_LIMIT);

	// New product form
	let newName = $state('');
	let newDescription = $state('');
	let newPrice = $state('');
	let newPriceLabel = $state('');
	let newImageUrl = $state<string | null>(null);

	// Edit form
	let editName = $state('');
	let editDescription = $state('');
	let editPrice = $state('');
	let editPriceLabel = $state('');
	let editImageUrl = $state<string | null>(null);

	function resetNewForm() {
		newName = '';
		newDescription = '';
		newPrice = '';
		newPriceLabel = '';
		newImageUrl = null;
		adding = false;
	}

	async function handleImageUpload(event: Event, target: 'new' | 'edit') {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploading = true;
		const result = await uploadPhoto(userId, file, 'gallery');
		uploading = false;

		if (result.error) {
			toast.error(result.error);
			return;
		}

		if (target === 'new') {
			newImageUrl = result.url;
		} else {
			editImageUrl = result.url;
		}
		// Reset file input
		input.value = '';
	}

	async function removeImage(target: 'new' | 'edit') {
		const url = target === 'new' ? newImageUrl : editImageUrl;
		if (url) {
			await deletePhoto(url);
		}
		if (target === 'new') {
			newImageUrl = null;
		} else {
			editImageUrl = null;
		}
	}

	async function addProduct() {
		if (!newName.trim() || saving) return;
		saving = true;
		const price = newPrice ? parseFloat(newPrice) : null;
		const { data, error } = await supabase
			.from('mb_provider_services')
			.insert({
				provider_id: providerId,
				type: 'product',
				name: newName.trim(),
				description: newDescription.trim() || null,
				price,
				price_label: newPriceLabel.trim() || null,
				image_url: newImageUrl,
				display_order: products.length
			})
			.select()
			.single();
		if (!error && data) {
			products = [...products, data];
			resetNewForm();
			toast.success('Producto agregado');
		} else {
			toast.error('Error al agregar producto');
		}
		saving = false;
	}

	function startEdit(product: ProviderService) {
		editingId = product.id;
		editName = product.name;
		editDescription = product.description || '';
		editPrice = product.price != null ? String(product.price) : '';
		editPriceLabel = product.price_label || '';
		editImageUrl = product.image_url || null;
	}

	async function saveEdit() {
		if (!editingId || !editName.trim() || saving) return;
		saving = true;
		const price = editPrice ? parseFloat(editPrice) : null;
		const { error } = await supabase
			.from('mb_provider_services')
			.update({
				name: editName.trim(),
				description: editDescription.trim() || null,
				price,
				price_label: editPriceLabel.trim() || null,
				image_url: editImageUrl
			})
			.eq('id', editingId);
		if (!error) {
			products = products.map((p) =>
				p.id === editingId
					? {
							...p,
							name: editName.trim(),
							description: editDescription.trim() || null,
							price,
							price_label: editPriceLabel.trim() || null,
							image_url: editImageUrl
						}
					: p
			);
			editingId = null;
			toast.success('Producto actualizado');
		}
		saving = false;
	}

	async function deleteProduct(product: ProviderService) {
		// Delete associated image if exists
		if (product.image_url) {
			await deletePhoto(product.image_url);
		}
		const { error } = await supabase.from('mb_provider_services').delete().eq('id', product.id);
		if (!error) {
			products = products.filter((p) => p.id !== product.id);
			toast.success('Producto eliminado');
		}
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Catálogo de productos</h3>
		{#if !premium}
			<span class="text-xs text-gray-500 dark:text-gray-400">{totalItems}/{FREE_SERVICES_LIMIT} (servicios + productos)</span>
		{/if}
	</div>

	<!-- Product grid -->
	{#if products.length > 0}
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
			{#each products as product (product.id)}
				{#if editingId === product.id}
					<!-- Edit form -->
					<div class="col-span-2 sm:col-span-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
						<input type="text" bind:value={editName} placeholder="Nombre *" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
						<textarea bind:value={editDescription} placeholder="Descripción (opcional)" rows="2" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none"></textarea>
						<div class="flex gap-2">
							<input type="number" bind:value={editPrice} placeholder="Precio" class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
							<input type="text" bind:value={editPriceLabel} placeholder="ej: c/u" class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
						</div>
						<!-- Image -->
						{#if editImageUrl}
							<div class="relative w-32 h-32">
								<img src={editImageUrl} alt="" class="w-full h-full object-cover rounded-lg" />
								<button onclick={() => removeImage('edit')} class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
									<X class="h-3 w-3" />
								</button>
							</div>
						{:else}
							<label class="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-400 text-sm text-gray-500">
								{#if uploading}
									<Loader2 class="h-4 w-4 animate-spin" />
									Subiendo...
								{:else}
									<ImagePlus class="h-4 w-4" />
									Agregar imagen
								{/if}
								<input type="file" accept="image/*" onchange={(e) => handleImageUpload(e, 'edit')} class="hidden" disabled={uploading} />
							</label>
						{/if}
						<div class="flex gap-2 justify-end">
							<Button variant="ghost" size="sm" onclick={() => (editingId = null)}>Cancelar</Button>
							<Button size="sm" onclick={saveEdit} disabled={saving}>Guardar</Button>
						</div>
					</div>
				{:else}
					<!-- Product card -->
					<div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden group relative">
						{#if product.image_url}
							<img src={product.image_url} alt={product.name} class="w-full aspect-square object-cover" />
						{:else}
							<div class="w-full aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
								<ImagePlus class="h-8 w-8 text-gray-400" />
							</div>
						{/if}
						<div class="p-3">
							<p class="font-medium text-sm text-gray-900 dark:text-white truncate">{product.name}</p>
							{#if product.price != null}
								<p class="text-sm font-semibold text-primary-600 dark:text-primary-400">
									${product.price}{product.price_label ? ` ${product.price_label}` : ''}
								</p>
							{:else}
								<p class="text-xs text-gray-400">A consultar</p>
							{/if}
						</div>
						<!-- Edit/Delete overlay -->
						<div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button onclick={() => startEdit(product)} class="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow text-gray-500 hover:text-primary-600">
								<Pencil class="h-3 w-3" />
							</button>
							<button onclick={() => deleteProduct(product)} class="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow text-gray-500 hover:text-red-500">
								<Trash2 class="h-3 w-3" />
							</button>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	<!-- Add form -->
	{#if adding}
		<div class="p-3 bg-primary-50 dark:bg-primary-900/10 rounded-lg space-y-2 border border-primary-200 dark:border-primary-800">
			<input type="text" bind:value={newName} placeholder="Nombre del producto *" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
			<textarea bind:value={newDescription} placeholder="Descripción (opcional)" rows="2" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none"></textarea>
			<div class="flex gap-2">
				<input type="number" bind:value={newPrice} placeholder="Precio (opcional)" class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
				<input type="text" bind:value={newPriceLabel} placeholder="ej: c/u" class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
			</div>
			<!-- Image upload -->
			{#if newImageUrl}
				<div class="relative w-32 h-32">
					<img src={newImageUrl} alt="" class="w-full h-full object-cover rounded-lg" />
					<button onclick={() => removeImage('new')} class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
						<X class="h-3 w-3" />
					</button>
				</div>
			{:else}
				<label class="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-400 text-sm text-gray-500">
					{#if uploading}
						<Loader2 class="h-4 w-4 animate-spin" />
						Subiendo...
					{:else}
						<ImagePlus class="h-4 w-4" />
						Agregar imagen del producto
					{/if}
					<input type="file" accept="image/*" onchange={(e) => handleImageUpload(e, 'new')} class="hidden" disabled={uploading} />
				</label>
			{/if}
			<div class="flex gap-2 justify-end">
				<Button variant="ghost" size="sm" onclick={resetNewForm}>Cancelar</Button>
				<Button size="sm" onclick={addProduct} disabled={saving || !newName.trim()}>Agregar</Button>
			</div>
		</div>
	{:else if atLimit}
		<!-- Upgrade prompt -->
		<div class="border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-lg p-4 bg-amber-50/50 dark:bg-amber-900/10">
			<div class="flex items-center gap-3">
				<Crown class="h-5 w-5 text-amber-600 flex-shrink-0" />
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-900 dark:text-white">¿Querés agregar más productos?</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">Con Premium podés agregar productos ilimitados</p>
				</div>
				<Button href="/planes" variant="outline" size="sm">
					Premium
					<ArrowRight class="h-3 w-3 ml-1" />
				</Button>
			</div>
		</div>
	{:else}
		<Button variant="outline" size="sm" onclick={() => (adding = true)} class="w-full">
			<Plus class="h-4 w-4 mr-1" /> Agregar producto
		</Button>
	{/if}
</div>
