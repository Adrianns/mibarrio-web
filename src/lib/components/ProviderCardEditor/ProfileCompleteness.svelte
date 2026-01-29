<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';

	interface ProviderData {
		businessName: string;
		description: string;
		department: string;
		phone: string;
		whatsapp: string;
		email: string;
		logoUrl: string | null;
		photos: string[];
		categories: string[];
	}

	let {
		data,
		onSuggestionClick
	}: {
		data: ProviderData;
		onSuggestionClick?: (field: string) => void;
	} = $props();

	// Calculate completeness percentage
	const completeness = $derived(() => {
		let score = 0;
		const maxScore = 100;

		// Required fields (40% base)
		if (data.businessName) score += 10;
		if (data.categories.length > 0) score += 10;
		if (data.department) score += 10;
		if (data.phone || data.whatsapp || data.email) score += 10;

		// Optional fields
		if (data.logoUrl || data.photos.length > 0) score += 20; // Photo
		if (data.description) score += 20; // Description
		if (data.whatsapp) score += 10; // WhatsApp specifically
		if (data.categories.length > 1) score += 10; // Additional categories

		return Math.min(score, maxScore);
	});

	// Generate suggestions
	const suggestions = $derived(() => {
		const items: { label: string; field: string; bonus: number }[] = [];

		if (!data.logoUrl && data.photos.length === 0) {
			items.push({ label: 'Agregá una foto', field: 'photos', bonus: 20 });
		}

		if (!data.description) {
			items.push({ label: 'Contá qué hacés', field: 'description', bonus: 20 });
		}

		if (!data.whatsapp && (data.phone || data.email)) {
			items.push({ label: 'Agregá WhatsApp', field: 'whatsapp', bonus: 10 });
		}

		if (data.categories.length === 1) {
			items.push({ label: 'Agregá más categorías', field: 'categories', bonus: 10 });
		}

		return items;
	});

	function handleSuggestionClick(field: string) {
		onSuggestionClick?.(field);
	}
</script>

{#if completeness() < 100}
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6">
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Tu perfil está al {completeness()}%
			</span>
		</div>

		<!-- Progress bar -->
		<div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
			<div
				class="h-full bg-primary-500 transition-all duration-500 ease-out rounded-full"
				style="width: {completeness()}%"
			></div>
		</div>

		<!-- Suggestions -->
		{#if suggestions().length > 0}
			<p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
				Completá para aparecer más arriba:
			</p>
			<div class="space-y-2">
				{#each suggestions() as suggestion (suggestion.field)}
					<button
						type="button"
						onclick={() => handleSuggestionClick(suggestion.field)}
						class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
					>
						<span class="text-sm text-gray-700 dark:text-gray-300">
							○ {suggestion.label}
						</span>
						<span class="text-xs text-primary-600 font-medium flex items-center gap-1">
							+{suggestion.bonus}%
							<ChevronRight class="h-3 w-3" />
						</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}
