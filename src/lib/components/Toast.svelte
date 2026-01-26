<script lang="ts">
	import { toast, type Toast as ToastType } from '$lib/stores/toast';
	import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	const icons = {
		success: CheckCircle,
		error: AlertCircle,
		info: Info,
		warning: AlertTriangle
	} as const;

	const styles = {
		success: 'bg-green-500 text-white',
		error: 'bg-red-500 text-white',
		info: 'bg-primary-600 text-white',
		warning: 'bg-yellow-500 text-white'
	} as const;

	let toasts = $state<ToastType[]>([]);

	onMount(() => {
		const unsubscribe = toast.subscribe((value) => {
			toasts = value;
		});
		return unsubscribe;
	});
</script>

<div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
	{#each toasts as t (t.id)}
		{@const Icon = icons[t.type]}
		<div
			class="flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg {styles[t.type]}"
			transition:fly={{ x: 100, duration: 300 }}
		>
			<Icon class="h-5 w-5 flex-shrink-0 mt-0.5" />
			<p class="flex-1 text-sm font-medium">{t.message}</p>
			<button
				onclick={() => toast.remove(t.id)}
				class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>
