<script lang="ts">
	import { Loader2, Check, X, Link, AtSign } from 'lucide-svelte';
	import { supabase } from '$lib/supabase';
	import { toast } from '$lib/stores/toast';

	interface Props {
		providerId: string;
		currentSlug?: string | null;
		onSave?: (slug: string | null) => void;
	}

	let { providerId, currentSlug = null, onSave }: Props = $props();

	let slug = $state('');
	let checking = $state(false);

	// Sync slug when currentSlug prop changes
	$effect(() => {
		slug = currentSlug || '';
	});
	let available = $state<boolean | null>(null);
	let unavailableReason = $state<string | null>(null);
	let saving = $state(false);
	let debounceTimeout: ReturnType<typeof setTimeout>;

	const MIN_LENGTH = 3;
	const MAX_LENGTH = 30;

	function normalizeSlug(value: string): string {
		return value
			.toLowerCase()
			.replace(/[^a-z0-9-]/g, '')
			.replace(/--+/g, '-')
			.slice(0, MAX_LENGTH);
	}

	function validateFormat(value: string): string | null {
		if (!value) return null;
		if (value.length < MIN_LENGTH) return `Mínimo ${MIN_LENGTH} caracteres`;
		if (value.length > MAX_LENGTH) return `Máximo ${MAX_LENGTH} caracteres`;
		if (value.startsWith('-')) return 'No puede empezar con guión';
		if (value.endsWith('-')) return 'No puede terminar con guión';
		if (value.includes('--')) return 'No puede tener guiones consecutivos';
		if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) && value.length >= 2) {
			return 'Solo letras, números y guiones';
		}
		return null;
	}

	async function checkAvailability(value: string) {
		if (!value || validateFormat(value)) {
			available = null;
			return;
		}

		checking = true;
		const { data, error } = await supabase.rpc('mb_check_slug_availability', {
			p_slug: value,
			p_exclude_provider_id: providerId
		});

		checking = false;
		if (error) {
			available = null;
			return;
		}

		available = data.available;
		unavailableReason = data.reason;
	}

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		slug = normalizeSlug(input.value);
		available = null;

		clearTimeout(debounceTimeout);
		if (slug && !validateFormat(slug)) {
			debounceTimeout = setTimeout(() => checkAvailability(slug), 500);
		}
	}

	async function handleSave() {
		if (!available && slug) return;

		saving = true;

		const { error } = await supabase
			.from('mb_providers')
			.update({ slug: slug || null })
			.eq('id', providerId);

		if (error) {
			toast.error('Error al guardar');
			saving = false;
			return;
		}

		toast.success('URL personalizada guardada');
		onSave?.(slug || null);
		saving = false;
	}

	async function handleClear() {
		saving = true;

		const { error } = await supabase
			.from('mb_providers')
			.update({ slug: null })
			.eq('id', providerId);

		if (error) {
			toast.error('Error al eliminar');
			saving = false;
			return;
		}

		slug = '';
		available = null;
		toast.success('URL personalizada eliminada');
		onSave?.(null);
		saving = false;
	}

	const formatError = $derived(validateFormat(slug));
	const canSave = $derived(
		(available === true && slug !== currentSlug) || (!slug && currentSlug)
	);
	const previewUrl = $derived(slug ? `mibarrio.com.uy/@${slug}` : null);

	function getReasonText(reason: string | null): string {
		switch (reason) {
			case 'reserved':
				return 'Este nombre está reservado';
			case 'taken':
				return 'Este nombre ya está en uso';
			case 'too_short':
				return `Mínimo ${MIN_LENGTH} caracteres`;
			case 'too_long':
				return `Máximo ${MAX_LENGTH} caracteres`;
			default:
				return 'No disponible';
		}
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
	<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">URL personalizada</h3>
	<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
		Creá una URL fácil de recordar y compartir para tu negocio.
	</p>

	<div class="space-y-4">
		<!-- Input -->
		<div>
			<label
				for="slug-input"
				class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
			>
				Tu @usuario
			</label>
			<div class="relative">
				<AtSign
					class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
				/>
				<input
					id="slug-input"
					type="text"
					value={slug}
					oninput={handleInput}
					placeholder="tu-negocio"
					maxlength={MAX_LENGTH}
					class="w-full pl-10 pr-10 py-3 rounded-lg border {formatError ||
					available === false
						? 'border-red-500 focus:ring-red-500'
						: available === true
							? 'border-green-500 focus:ring-green-500'
							: 'border-gray-200 dark:border-gray-600 focus:ring-primary-500'} bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 transition-colors"
				/>
				<div class="absolute right-3 top-1/2 -translate-y-1/2">
					{#if checking}
						<Loader2 class="h-5 w-5 animate-spin text-gray-400" />
					{:else if available === true}
						<Check class="h-5 w-5 text-green-500" />
					{:else if available === false}
						<X class="h-5 w-5 text-red-500" />
					{/if}
				</div>
			</div>

			<!-- Validation message -->
			{#if formatError}
				<p class="text-red-500 text-sm mt-1">{formatError}</p>
			{:else if available === false}
				<p class="text-red-500 text-sm mt-1">{getReasonText(unavailableReason)}</p>
			{:else if available === true}
				<p class="text-green-600 dark:text-green-400 text-sm mt-1">Disponible</p>
			{/if}
		</div>

		<!-- URL Preview -->
		{#if previewUrl}
			<div class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
				<Link class="h-4 w-4 text-gray-400 shrink-0" />
				<span class="text-sm text-gray-600 dark:text-gray-300 font-mono truncate">
					{previewUrl}
				</span>
			</div>
		{/if}

		<!-- Action buttons -->
		<div class="flex gap-2">
			{#if currentSlug && slug === currentSlug}
				<button
					type="button"
					onclick={handleClear}
					disabled={saving}
					class="flex-1 py-2 px-4 border border-red-300 text-red-600 dark:border-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
				>
					Eliminar URL
				</button>
			{:else}
				<button
					type="button"
					onclick={handleSave}
					disabled={!canSave || saving}
					class="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
				>
					{#if saving}
						<Loader2 class="h-4 w-4 animate-spin inline mr-2" />
						Guardando...
					{:else}
						Guardar URL
					{/if}
				</button>
			{/if}
		</div>

		<!-- Current slug info -->
		{#if currentSlug}
			<p class="text-xs text-gray-500 dark:text-gray-400">
				URL actual: <span class="font-mono">mibarrio.com.uy/@{currentSlug}</span>
			</p>
		{/if}
	</div>
</div>
