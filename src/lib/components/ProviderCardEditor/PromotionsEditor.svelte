<script lang="ts">
	import { Plus, Pencil, Trash2, Tag } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import type { ProviderPromotion } from '$lib/domain/types';
	import type { SupabaseClient } from '@supabase/supabase-js';

	let {
		supabase,
		providerId,
		initialPromotions = []
	}: {
		supabase: SupabaseClient;
		providerId: string;
		initialPromotions: ProviderPromotion[];
	} = $props();

	let promotions = $state<ProviderPromotion[]>([...initialPromotions]);
	let editingId = $state<string | null>(null);
	let adding = $state(false);
	let saving = $state(false);

	// New promo form
	let newTitle = $state('');
	let newDescription = $state('');
	let newDiscountText = $state('');
	let newValidUntil = $state('');

	// Edit form
	let editTitle = $state('');
	let editDescription = $state('');
	let editDiscountText = $state('');
	let editValidUntil = $state('');

	function resetNewForm() {
		newTitle = '';
		newDescription = '';
		newDiscountText = '';
		newValidUntil = '';
		adding = false;
	}

	async function addPromotion() {
		if (!newTitle.trim() || saving) return;
		saving = true;
		const { data, error } = await supabase
			.from('mb_provider_promotions')
			.insert({
				provider_id: providerId,
				title: newTitle.trim(),
				description: newDescription.trim() || null,
				discount_text: newDiscountText.trim() || null,
				valid_until: newValidUntil || null
			})
			.select()
			.single();
		if (!error && data) {
			promotions = [...promotions, data];
			resetNewForm();
		}
		saving = false;
	}

	function startEdit(promo: ProviderPromotion) {
		editingId = promo.id;
		editTitle = promo.title;
		editDescription = promo.description || '';
		editDiscountText = promo.discount_text || '';
		editValidUntil = promo.valid_until ? promo.valid_until.slice(0, 10) : '';
	}

	async function saveEdit() {
		if (!editingId || !editTitle.trim() || saving) return;
		saving = true;
		const { error } = await supabase
			.from('mb_provider_promotions')
			.update({
				title: editTitle.trim(),
				description: editDescription.trim() || null,
				discount_text: editDiscountText.trim() || null,
				valid_until: editValidUntil || null
			})
			.eq('id', editingId);
		if (!error) {
			promotions = promotions.map((p) =>
				p.id === editingId
					? {
							...p,
							title: editTitle.trim(),
							description: editDescription.trim() || null,
							discount_text: editDiscountText.trim() || null,
							valid_until: editValidUntil || null
						}
					: p
			);
			editingId = null;
		}
		saving = false;
	}

	async function deletePromotion(id: string) {
		const { error } = await supabase.from('mb_provider_promotions').delete().eq('id', id);
		if (!error) {
			promotions = promotions.filter((p) => p.id !== id);
		}
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
	<div class="flex items-center gap-2 mb-4">
		<Tag class="h-5 w-5 text-primary-600" />
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Promociones</h3>
	</div>

	{#if promotions.length > 0}
		<div class="space-y-3 mb-4">
			{#each promotions as promo (promo.id)}
				{#if editingId === promo.id}
					<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
						<input type="text" bind:value={editTitle} placeholder="Título *" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
						<textarea bind:value={editDescription} placeholder="Descripción" rows="2" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none"></textarea>
						<div class="flex gap-2">
							<input type="text" bind:value={editDiscountText} placeholder="ej: 20% OFF" class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
							<input type="date" bind:value={editValidUntil} class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
						</div>
						<div class="flex gap-2 justify-end">
							<Button variant="ghost" size="sm" onclick={() => (editingId = null)}>Cancelar</Button>
							<Button size="sm" onclick={saveEdit} disabled={saving}>Guardar</Button>
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg group">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<p class="font-medium text-sm text-gray-900 dark:text-white">{promo.title}</p>
								{#if promo.discount_text}
									<span class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-bold">{promo.discount_text}</span>
								{/if}
							</div>
							{#if promo.description}
								<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{promo.description}</p>
							{/if}
							{#if promo.valid_until}
								<p class="text-xs text-gray-400">Hasta {new Date(promo.valid_until).toLocaleDateString('es-UY')}</p>
							{/if}
						</div>
						<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button onclick={() => startEdit(promo)} class="p-1 text-gray-400 hover:text-primary-600">
								<Pencil class="h-4 w-4" />
							</button>
							<button onclick={() => deletePromotion(promo.id)} class="p-1 text-gray-400 hover:text-red-500">
								<Trash2 class="h-4 w-4" />
							</button>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	{#if adding}
		<div class="p-3 bg-primary-50 dark:bg-primary-900/10 rounded-lg space-y-2 border border-primary-200 dark:border-primary-800">
			<input type="text" bind:value={newTitle} placeholder="Título de la promoción *" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
			<textarea bind:value={newDescription} placeholder="Descripción (opcional)" rows="2" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none"></textarea>
			<div class="flex gap-2">
				<input type="text" bind:value={newDiscountText} placeholder="ej: 2x1, 20% OFF" class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
				<input type="date" bind:value={newValidUntil} class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
			</div>
			<div class="flex gap-2 justify-end">
				<Button variant="ghost" size="sm" onclick={resetNewForm}>Cancelar</Button>
				<Button size="sm" onclick={addPromotion} disabled={saving || !newTitle.trim()}>Agregar</Button>
			</div>
		</div>
	{:else}
		<Button variant="outline" size="sm" onclick={() => (adding = true)} class="w-full">
			<Plus class="h-4 w-4 mr-1" /> Agregar promoción
		</Button>
	{/if}
</div>
