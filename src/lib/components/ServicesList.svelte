<script lang="ts">
	import { Briefcase } from 'lucide-svelte';
	import type { ProviderService } from '$lib/domain/types';

	let { services = [] }: { services: ProviderService[] } = $props();
</script>

{#if services.length > 0}
	<div>
		<h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
			<Briefcase class="h-5 w-5 text-primary-600" />
			Servicios
		</h3>
		<div class="space-y-3">
			{#each services as service (service.id)}
				<div class="flex items-start justify-between gap-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
					<div class="flex-1 min-w-0">
						<p class="font-medium text-gray-900 dark:text-white">{service.name}</p>
						{#if service.description}
							<p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{service.description}</p>
						{/if}
					</div>
					<div class="flex-shrink-0 text-right">
						{#if service.price != null}
							<span class="font-semibold text-gray-900 dark:text-white">${service.price}</span>
							{#if service.price_label}
								<span class="text-xs text-gray-500 dark:text-gray-400 block">{service.price_label}</span>
							{/if}
						{:else}
							<span class="text-sm text-gray-400">A consultar</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
