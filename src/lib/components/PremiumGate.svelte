<script lang="ts">
	import { Crown, ArrowRight } from 'lucide-svelte';
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
		class="relative border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/15 dark:to-yellow-900/10 overflow-hidden"
	>
		<!-- Gold shimmer accent -->
		<div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-200/30 to-transparent dark:from-amber-600/10 rounded-bl-full"></div>

		<div class="flex items-start gap-4 relative">
			<div
				class="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 dark:from-amber-600 dark:to-yellow-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
			>
				<IconComponent class="h-5 w-5 text-white" />
			</div>
			<div class="flex-1">
				<h3 class="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
					{title}
					<span class="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">Premium</span>
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
				<a
					href="/planes"
					class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-sm font-medium rounded-lg shadow-sm transition-all hover:shadow-md"
				>
					<Crown class="h-4 w-4" />
					Conocer Premium
					<ArrowRight class="h-3.5 w-3.5" />
				</a>
			</div>
		</div>
	</div>
{/if}
