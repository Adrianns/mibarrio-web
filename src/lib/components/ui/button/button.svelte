<script lang="ts">
	import { cn } from '$lib/utils';
	import { buttonVariants, type Props } from './index';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		class: className,
		variant,
		size,
		children,
		...restProps
	}: Props & HTMLButtonAttributes & { children?: Snippet } = $props();
</script>

<button class={cn(buttonVariants({ variant, size, class: className }))} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</button>
