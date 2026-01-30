<script lang="ts">
	import { Pencil, X } from 'lucide-svelte';
	import { DEFAULT_CATEGORIES } from '$lib/domain/types';
	import { toast } from '$lib/stores/toast';

	let {
		selected = $bindable<string[]>([]),
		maxCategories = 3,
		error = '',
		readOnly = false
	} = $props();

	let open = $state(false);

	const categories = DEFAULT_CATEGORIES.filter((c) => c.is_active);

	function getCategoryInfo(name: string) {
		return categories.find((c) => c.name === name) || { label: name, color: 'bg-gray-500' };
	}

	function toggleCategory(name: string) {
		if (selected.includes(name)) {
			selected = selected.filter((c) => c !== name);
		} else if (selected.length < maxCategories) {
			selected = [...selected, name];
		} else {
			toast.warning(`Máximo ${maxCategories} categorías`);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative">
	<!-- Display selected categories -->
	{#if readOnly}
		<div class="flex flex-wrap gap-2 items-center min-h-[40px]">
			{#if selected.length > 0}
				{#each selected as categoryName (categoryName)}
					{@const catInfo = getCategoryInfo(categoryName)}
					<span class="text-sm {catInfo.color} text-white px-3 py-1 rounded-full">
						{catInfo.label}
					</span>
				{/each}
			{:else}
				<span class="text-gray-400 italic">-</span>
			{/if}
		</div>
	{:else}
		<button
			type="button"
			onclick={() => (open = !open)}
			class="group flex flex-wrap gap-2 items-center cursor-pointer active:bg-gray-100 dark:active:bg-gray-700/50 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-700/50 rounded-lg p-2 -m-2 transition-colors min-h-[40px] w-full {error ? 'ring-2 ring-red-500 ring-offset-2' : ''}"
		>
			{#if selected.length > 0}
				{#each selected as categoryName (categoryName)}
					{@const catInfo = getCategoryInfo(categoryName)}
					<span class="text-sm {catInfo.color} text-white px-3 py-1 rounded-full">
						{catInfo.label}
					</span>
				{/each}
			{:else}
				<span class="text-gray-400 italic">Seleccionar categorías</span>
			{/if}
			<Pencil class="h-3 w-3 ml-2 opacity-30 lg:opacity-0 lg:group-hover:opacity-50 transition-opacity" />
		</button>
	{/if}

	<!-- Dropdown picker -->
	{#if open}
		<button
			type="button"
			class="fixed inset-0 z-40"
			onclick={() => (open = false)}
			aria-label="Cerrar"
		></button>

		<div class="absolute z-50 mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-h-80 overflow-y-auto">
			<div class="flex justify-between items-center mb-3">
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
					Categorías ({selected.length}/{maxCategories})
				</span>
				<button
					type="button"
					onclick={() => (open = false)}
					class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<div class="grid grid-cols-2 gap-2">
				{#each categories as cat (cat.name)}
					<button
						type="button"
						onclick={() => toggleCategory(cat.name)}
						class="p-2 rounded-lg border-2 text-left text-sm {selected.includes(cat.name)
							? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
							: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
					>
						<span class="inline-block w-2 h-2 rounded-full {cat.color} mr-2"></span>
						{cat.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
	{#if error}
		<p class="text-red-500 text-sm mt-1">{error}</p>
	{/if}
</div>
