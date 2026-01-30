<script lang="ts">
	import { Pencil } from 'lucide-svelte';

	let {
		value = $bindable(''),
		placeholder = '',
		error = '',
		readOnly = false,
		class: className = '',
		inputClass = '',
		displayClass = ''
	} = $props();

	let editing = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);

	function startEditing() {
		if (readOnly) return;
		editing = true;
		// Focus input after it renders
		queueMicrotask(() => inputEl?.focus());
	}

	function stopEditing() {
		editing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			stopEditing();
		} else if (e.key === 'Escape') {
			stopEditing();
		}
	}
</script>

<div class="group relative {className}">
	{#if editing && !readOnly}
		<input
			bind:this={inputEl}
			bind:value
			type="text"
			{placeholder}
			onblur={stopEditing}
			onkeydown={handleKeydown}
			class="w-full bg-transparent border-b-2 outline-none {error ? 'border-red-500' : 'border-primary-500'} {inputClass}"
		/>
	{:else}
		{#if readOnly}
			<span class="{displayClass}">
				{#if value}
					{value}
				{:else}
					<span class="text-gray-400 italic">-</span>
				{/if}
			</span>
		{:else}
			<button
				type="button"
				onclick={startEditing}
				class="w-full text-left cursor-text active:bg-gray-100 dark:active:bg-gray-700/50 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-700/50 rounded px-1 -mx-1 transition-colors {error ? 'ring-2 ring-red-500 ring-offset-2' : ''} {displayClass}"
			>
				{#if value}
					{value}
				{:else}
					<span class="text-gray-400 italic">{placeholder}</span>
				{/if}
				<Pencil class="inline-block h-3 w-3 ml-2 opacity-30 lg:opacity-0 lg:group-hover:opacity-50 transition-opacity" />
			</button>
		{/if}
	{/if}
	{#if error && !readOnly}
		<p class="text-red-500 text-sm mt-1">{error}</p>
	{/if}
</div>
