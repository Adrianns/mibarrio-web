<script lang="ts">
	import { Pencil } from 'lucide-svelte';

	let {
		value = $bindable(''),
		placeholder = '',
		rows = 4,
		readOnly = false,
		class: className = '',
		textareaClass = '',
		displayClass = ''
	} = $props();

	let editing = $state(false);
	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	function startEditing() {
		if (readOnly) return;
		editing = true;
		queueMicrotask(() => textareaEl?.focus());
	}

	function stopEditing() {
		editing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			stopEditing();
		}
		// Allow Enter for new lines in textarea
	}
</script>

<div class="group relative {className}">
	{#if editing && !readOnly}
		<textarea
			bind:this={textareaEl}
			bind:value
			{rows}
			{placeholder}
			onblur={stopEditing}
			onkeydown={handleKeydown}
			class="w-full bg-transparent border-2 border-primary-500 rounded-lg p-2 outline-none resize-none {textareaClass}"
		></textarea>
	{:else}
		{#if readOnly}
			<div class="{displayClass}">
				{#if value}
					<span class="whitespace-pre-line">{value}</span>
				{:else}
					<span class="text-gray-400 italic">-</span>
				{/if}
			</div>
		{:else}
			<button
				type="button"
				onclick={startEditing}
				class="w-full text-left cursor-text active:bg-gray-100 dark:active:bg-gray-700/50 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-700/50 rounded-lg p-2 -m-2 transition-colors min-h-[60px] {displayClass}"
			>
				{#if value}
					<span class="whitespace-pre-line">{value}</span>
				{:else}
					<span class="text-gray-400 italic">{placeholder}</span>
				{/if}
				<Pencil class="inline-block h-3 w-3 ml-2 opacity-30 lg:opacity-0 lg:group-hover:opacity-50 transition-opacity" />
			</button>
		{/if}
	{/if}
</div>
