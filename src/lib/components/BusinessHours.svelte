<script lang="ts">
	import { Clock } from 'lucide-svelte';
	import { DAY_NAMES } from '$lib/domain/types';
	import type { ProviderHours } from '$lib/domain/types';

	let { hours = [] }: { hours: ProviderHours[] } = $props();

	// Get today's day index (JS: 0=Sunday, we need 0=Monday)
	const jsDay = new Date().getDay();
	const todayIndex = jsDay === 0 ? 6 : jsDay - 1;

	// Build sorted list by day_of_week
	let sortedHours = $derived(
		DAY_NAMES.map((name, i) => {
			const h = hours.find((h) => h.day_of_week === i);
			return {
				name,
				dayIndex: i,
				open_time: h?.open_time?.slice(0, 5) || null,
				close_time: h?.close_time?.slice(0, 5) || null,
				is_closed: h?.is_closed ?? true
			};
		})
	);
</script>

{#if hours.length > 0}
	<div>
		<h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
			<Clock class="h-5 w-5 text-primary-600" />
			Horarios
		</h3>
		<div class="space-y-1">
			{#each sortedHours as day}
				<div
					class="flex items-center justify-between px-3 py-2 rounded-lg text-sm {day.dayIndex === todayIndex
						? 'bg-primary-50 dark:bg-primary-900/20 font-semibold'
						: ''}"
				>
					<span class="text-gray-700 dark:text-gray-300 {day.dayIndex === todayIndex ? 'text-primary-700 dark:text-primary-400' : ''}">
						{day.name}
					</span>
					{#if day.is_closed}
						<span class="text-gray-400">Cerrado</span>
					{:else}
						<span class="text-gray-900 dark:text-white">{day.open_time} - {day.close_time}</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}
