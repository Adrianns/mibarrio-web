<script lang="ts">
	import { Crown, ArrowRight } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';
	import type { ComponentType } from 'svelte';

	let {
		premium = false,
		title,
		description,
		icon: IconComponent = Crown,
		children
	}: {
		premium: boolean;
		title: string;
		description: string;
		icon?: ComponentType;
		children?: Snippet;
	} = $props();
</script>

{#if premium}
	{#if children}
		{@render children()}
	{/if}
{:else}
	<div
		class="border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-xl p-6 bg-amber-50/50 dark:bg-amber-900/10"
	>
		<div class="flex items-start gap-4">
			<div
				class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0"
			>
				<IconComponent class="h-5 w-5 text-amber-600" />
			</div>
			<div class="flex-1">
				<h3 class="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
				<Button href="/planes" variant="outline" size="sm">
					Conocer Premium
					<ArrowRight class="h-4 w-4 ml-1" />
				</Button>
			</div>
		</div>
	</div>
{/if}
