<script lang="ts">
	import { Plus, Pencil, Trash2, GripVertical, ArrowRight, Crown } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { FREE_SERVICES_LIMIT } from '$lib/domain/types';
	import type { ProviderService } from '$lib/domain/types';
	import type { SupabaseClient } from '@supabase/supabase-js';

	let {
		supabase,
		providerId,
		premium = false,
		initialServices = []
	}: {
		supabase: SupabaseClient;
		providerId: string;
		premium: boolean;
		initialServices: ProviderService[];
	} = $props();

	let services = $state<ProviderService[]>([...initialServices]);
	let editingId = $state<string | null>(null);
	let adding = $state(false);
	let saving = $state(false);

	// New service form
	let newName = $state('');
	let newDescription = $state('');
	let newPrice = $state('');
	let newPriceLabel = $state('');

	// Edit form
	let editName = $state('');
	let editDescription = $state('');
	let editPrice = $state('');
	let editPriceLabel = $state('');

	let atLimit = $derived(!premium && services.length >= FREE_SERVICES_LIMIT);

	function resetNewForm() {
		newName = '';
		newDescription = '';
		newPrice = '';
		newPriceLabel = '';
		adding = false;
	}

	async function addService() {
		if (!newName.trim() || saving) return;
		saving = true;
		const price = newPrice ? parseFloat(newPrice) : null;
		const { data, error } = await supabase
			.from('mb_provider_services')
			.insert({
				provider_id: providerId,
				name: newName.trim(),
				description: newDescription.trim() || null,
				price,
				price_label: newPriceLabel.trim() || null,
				display_order: services.length
			})
			.select()
			.single();
		if (!error && data) {
			services = [...services, data];
			resetNewForm();
		}
		saving = false;
	}

	function startEdit(service: ProviderService) {
		editingId = service.id;
		editName = service.name;
		editDescription = service.description || '';
		editPrice = service.price != null ? String(service.price) : '';
		editPriceLabel = service.price_label || '';
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
				price_label: editPriceLabel.trim() || null
			})
			.eq('id', editingId);
		if (!error) {
			services = services.map((s) =>
				s.id === editingId
					? {
							...s,
							name: editName.trim(),
							description: editDescription.trim() || null,
							price,
							price_label: editPriceLabel.trim() || null
						}
					: s
			);
			editingId = null;
		}
		saving = false;
	}

	async function deleteService(id: string) {
		const { error } = await supabase.from('mb_provider_services').delete().eq('id', id);
		if (!error) {
			services = services.filter((s) => s.id !== id);
		}
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Servicios / Productos</h3>
		{#if !premium}
			<span class="text-xs text-gray-500 dark:text-gray-400">{services.length}/{FREE_SERVICES_LIMIT}</span>
		{/if}
	</div>

	<!-- Service list -->
	{#if services.length > 0}
		<div class="space-y-3 mb-4">
			{#each services as service (service.id)}
				{#if editingId === service.id}
					<!-- Edit form -->
					<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
						<input type="text" bind:value={editName} placeholder="Nombre *" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
						<textarea bind:value={editDescription} placeholder="Descripción (opcional)" rows="2" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none"></textarea>
						<div class="flex gap-2">
							<input type="number" bind:value={editPrice} placeholder="Precio" class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
							<input type="text" bind:value={editPriceLabel} placeholder="ej: por hora" class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
						</div>
						<div class="flex gap-2 justify-end">
							<Button variant="ghost" size="sm" onclick={() => (editingId = null)}>Cancelar</Button>
							<Button size="sm" onclick={saveEdit} disabled={saving}>Guardar</Button>
						</div>
					</div>
				{:else}
					<!-- Display row -->
					<div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg group">
						<GripVertical class="h-4 w-4 text-gray-400 flex-shrink-0" />
						<div class="flex-1 min-w-0">
							<p class="font-medium text-sm text-gray-900 dark:text-white truncate">{service.name}</p>
							{#if service.description}
								<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{service.description}</p>
							{/if}
						</div>
						{#if service.price != null}
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
								${service.price}{service.price_label ? ` ${service.price_label}` : ''}
							</span>
						{:else}
							<span class="text-xs text-gray-400 flex-shrink-0">A consultar</span>
						{/if}
						<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button onclick={() => startEdit(service)} class="p-1 text-gray-400 hover:text-primary-600">
								<Pencil class="h-4 w-4" />
							</button>
							<button onclick={() => deleteService(service.id)} class="p-1 text-gray-400 hover:text-red-500">
								<Trash2 class="h-4 w-4" />
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
			<input type="text" bind:value={newName} placeholder="Nombre del servicio *" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
			<textarea bind:value={newDescription} placeholder="Descripción (opcional)" rows="2" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none"></textarea>
			<div class="flex gap-2">
				<input type="number" bind:value={newPrice} placeholder="Precio (opcional)" class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
				<input type="text" bind:value={newPriceLabel} placeholder="ej: por hora" class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />
			</div>
			<div class="flex gap-2 justify-end">
				<Button variant="ghost" size="sm" onclick={resetNewForm}>Cancelar</Button>
				<Button size="sm" onclick={addService} disabled={saving || !newName.trim()}>Agregar</Button>
			</div>
		</div>
	{:else if atLimit}
		<!-- Upgrade prompt -->
		<div class="border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/15 dark:to-yellow-900/10">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
					<Crown class="h-4 w-4 text-white" />
				</div>
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-900 dark:text-white">¿Querés agregar más servicios?</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">Con Premium podés agregar servicios ilimitados</p>
				</div>
				<a href="/planes" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-xs font-medium rounded-lg shadow-sm transition-all">
					<Crown class="h-3 w-3" />
					Premium
				</a>
			</div>
		</div>
	{:else}
		<Button variant="outline" size="sm" onclick={() => (adding = true)} class="w-full">
			<Plus class="h-4 w-4 mr-1" /> Agregar servicio
		</Button>
	{/if}
</div>
