<script lang="ts">
	import { MapPin, Pencil, X } from 'lucide-svelte';
	import { DEPARTMENTS, MONTEVIDEO_NEIGHBORHOODS, type Department } from '$lib/domain/types';

	let {
		department = $bindable<Department | ''>(''),
		neighborhood = $bindable(''),
		address = $bindable(''),
		error = '',
		readOnly = false
	} = $props();

	let open = $state(false);

	// Reset neighborhood when department changes away from Montevideo
	$effect(() => {
		if (department !== 'Montevideo') {
			neighborhood = '';
		}
	});

	function getDisplayText() {
		const parts = [];
		if (address) parts.push(address);
		if (neighborhood) parts.push(neighborhood);
		if (department) parts.push(department);
		return parts.join(', ') || '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative">
	<!-- Display location -->
	{#if readOnly}
		<div class="flex items-center gap-2">
			<MapPin class="h-5 w-5 text-gray-400 flex-shrink-0" />
			{#if getDisplayText()}
				<span class="text-gray-600 dark:text-gray-400">{getDisplayText()}</span>
			{:else}
				<span class="text-gray-400 italic">-</span>
			{/if}
		</div>
	{:else}
		<button
			type="button"
			onclick={() => (open = !open)}
			class="group flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg p-2 -m-2 transition-colors w-full text-left {error ? 'ring-2 ring-red-500 ring-offset-2' : ''}"
		>
			<MapPin class="h-5 w-5 text-gray-400 flex-shrink-0" />
			{#if getDisplayText()}
				<span class="text-gray-600 dark:text-gray-400">{getDisplayText()}</span>
			{:else}
				<span class="text-gray-400 italic">Agregar ubicación</span>
			{/if}
			<Pencil class="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
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

		<div class="absolute z-50 mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
			<div class="flex justify-between items-center mb-4">
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación</span>
				<button
					type="button"
					onclick={() => (open = false)}
					class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<label for="loc-department" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Departamento
					</label>
					<select
						id="loc-department"
						bind:value={department}
						class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500"
					>
						<option value="">Seleccionar</option>
						{#each DEPARTMENTS as dept}
							<option value={dept}>{dept}</option>
						{/each}
					</select>
				</div>

				{#if department === 'Montevideo'}
					<div>
						<label for="loc-neighborhood" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Barrio
						</label>
						<select
							id="loc-neighborhood"
							bind:value={neighborhood}
							class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500"
						>
							<option value="">Seleccionar</option>
							{#each MONTEVIDEO_NEIGHBORHOODS as barrio}
								<option value={barrio}>{barrio}</option>
							{/each}
						</select>
					</div>
				{/if}

				<div>
					<label for="loc-address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Dirección (opcional)
					</label>
					<input
						id="loc-address"
						type="text"
						bind:value={address}
						placeholder="Ej: Av. Brasil 2500"
						class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500"
					/>
				</div>

				<button
					type="button"
					onclick={() => (open = false)}
					class="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
				>
					Listo
				</button>
			</div>
		</div>
	{/if}
	{#if error}
		<p class="text-red-500 text-sm mt-1">{error}</p>
	{/if}
</div>
