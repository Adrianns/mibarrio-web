<script lang="ts">
	import { cn } from '$lib/utils';
	import { buttonVariants, type Props } from './index';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	let {
		class: className,
		variant,
		size,
		href,
		children,
		...restProps
	}: Props & (HTMLButtonAttributes | HTMLAnchorAttributes) & { children?: Snippet; href?: string } = $props();
</script>

{#if href}
	<a href={href} class={cn(buttonVariants({ variant, size, class: className }))} {...restProps}>
		{#if children}
			{@render children()}
		{/if}
	</a>
{:else}
	<button class={cn(buttonVariants({ variant, size, class: className }))} {...restProps}>
		{#if children}
			{@render children()}
		{/if}
	</button>
{/if}
