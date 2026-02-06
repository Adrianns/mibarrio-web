<script lang="ts">
	import { ShoppingBag, ImagePlus } from 'lucide-svelte';
	import type { ProviderService } from '$lib/domain/types';

	let { products = [] }: { products: ProviderService[] } = $props();
</script>

{#if products.length > 0}
	<div>
		<h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
			<ShoppingBag class="h-5 w-5 text-primary-600" />
			Productos
		</h3>
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
			{#each products as product (product.id)}
				<div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden">
					{#if product.image_url}
						<img src={product.image_url} alt={product.name} loading="lazy" class="w-full aspect-square object-cover" />
					{:else}
						<div class="w-full aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
							<ImagePlus class="h-8 w-8 text-gray-400" />
						</div>
					{/if}
					<div class="p-3">
						<p class="font-medium text-sm text-gray-900 dark:text-white">{product.name}</p>
						{#if product.description}
							<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{product.description}</p>
						{/if}
						{#if product.price != null}
							<p class="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">
								${product.price}{product.price_label ? ` ${product.price_label}` : ''}
							</p>
						{:else}
							<p class="text-xs text-gray-400 mt-1">A consultar</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
