<script lang="ts">
	import { Tag } from 'lucide-svelte';
	import type { ProviderPromotion } from '$lib/domain/types';

	let { promotions = [] }: { promotions: ProviderPromotion[] } = $props();

	// Filter out expired promotions
	let activePromotions = $derived(
		promotions.filter((p) => {
			if (!p.valid_until) return true;
			return new Date(p.valid_until) >= new Date();
		})
	);
</script>

{#if activePromotions.length > 0}
	<div>
		<h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
			<Tag class="h-5 w-5 text-primary-600" />
			Promociones
		</h3>
		<div class="space-y-3">
			{#each activePromotions as promo (promo.id)}
				<div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
					<div class="flex items-start justify-between gap-3">
						<div class="flex-1">
							<p class="font-semibold text-gray-900 dark:text-white">{promo.title}</p>
							{#if promo.description}
								<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{promo.description}</p>
							{/if}
							{#if promo.valid_until}
								<p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
									Válido hasta {new Date(promo.valid_until).toLocaleDateString('es-UY')}
								</p>
							{/if}
						</div>
						{#if promo.discount_text}
							<span class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold flex-shrink-0">
								{promo.discount_text}
							</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
