<script lang="ts">
	import { Clock, Save, Loader2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { DAY_NAMES } from '$lib/domain/types';
	import type { ProviderHours } from '$lib/domain/types';
	import type { SupabaseClient } from '@supabase/supabase-js';

	let {
		supabase,
		providerId,
		initialHours = []
	}: {
		supabase: SupabaseClient;
		providerId: string;
		initialHours: ProviderHours[];
	} = $props();

	// Initialize 7 days with existing data or defaults
	let days = $state(
		DAY_NAMES.map((_, i) => {
			const existing = initialHours.find((h) => h.day_of_week === i);
			return {
				day_of_week: i,
				open_time: existing?.open_time?.slice(0, 5) || '09:00',
				close_time: existing?.close_time?.slice(0, 5) || '18:00',
				is_closed: existing?.is_closed ?? (i >= 5), // Sat/Sun closed by default
				id: existing?.id || null
			};
		})
	);

	let saving = $state(false);
	let saved = $state(false);

	async function saveHours() {
		saving = true;
		saved = false;

		for (const day of days) {
			const payload = {
				provider_id: providerId,
				day_of_week: day.day_of_week,
				open_time: day.is_closed ? null : day.open_time,
				close_time: day.is_closed ? null : day.close_time,
				is_closed: day.is_closed
			};

			if (day.id) {
				await supabase.from('mb_provider_hours').update(payload).eq('id', day.id);
			} else {
				const { data } = await supabase
					.from('mb_provider_hours')
					.upsert(payload, { onConflict: 'provider_id,day_of_week' })
					.select()
					.single();
				if (data) day.id = data.id;
			}
		}

		saving = false;
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
	<div class="flex items-center gap-2 mb-4">
		<Clock class="h-5 w-5 text-primary-600" />
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Horarios de atención</h3>
	</div>

	<div class="space-y-2">
		{#each days as day, i}
			<div class="flex items-center gap-3 p-2 rounded-lg {day.is_closed ? 'bg-gray-50 dark:bg-gray-700/30' : ''}">
				<span class="w-20 text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">{DAY_NAMES[i]}</span>
				<label class="flex items-center gap-2 flex-shrink-0">
					<input type="checkbox" bind:checked={day.is_closed} class="rounded border-gray-300 dark:border-gray-600" />
					<span class="text-xs text-gray-500">Cerrado</span>
				</label>
				{#if !day.is_closed}
					<input type="time" bind:value={day.open_time} class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm" />
					<span class="text-gray-400 text-sm">a</span>
					<input type="time" bind:value={day.close_time} class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm" />
				{/if}
			</div>
		{/each}
	</div>

	<div class="mt-4 flex items-center gap-2">
		<Button size="sm" onclick={saveHours} disabled={saving}>
			{#if saving}
				<Loader2 class="h-4 w-4 mr-1 animate-spin" /> Guardando...
			{:else}
				<Save class="h-4 w-4 mr-1" /> Guardar horarios
			{/if}
		</Button>
		{#if saved}
			<span class="text-sm text-green-600">Guardado</span>
		{/if}
	</div>
</div>
