<script lang="ts">
	import { HelpCircle, Sparkles, X } from 'lucide-svelte';

	let {
		value = $bindable('')
	} = $props();

	// Show guided helper form
	let showHelper = $state(false);

	// Guided mode state
	let services = $state('');
	let experience = $state('');
	let domicilio = $state('');
	let presupuesto = $state('');
	let extra = $state('');

	// Experience options
	const experienceOptions = [
		{ value: '', label: 'Seleccionar...' },
		{ value: 'recien', label: 'Recién empiezo' },
		{ value: '1-5', label: '1-5 años' },
		{ value: '5+', label: 'Más de 5 años' },
		{ value: '10+', label: 'Más de 10 años' }
	];

	// Domicilio options
	const domicilioOptions = [
		{ value: '', label: 'Seleccionar...' },
		{ value: 'si', label: 'Sí' },
		{ value: 'no', label: 'No' },
		{ value: 'aveces', label: 'A veces' }
	];

	// Generate description from answers
	function generateDescription(): string {
		const parts: string[] = [];

		if (services.trim()) {
			parts.push(services.trim());
		}

		if (experience) {
			const expText: Record<string, string> = {
				recien: 'Recién empiezo en el rubro',
				'1-5': '1 a 5 años de experiencia',
				'5+': 'Más de 5 años de experiencia',
				'10+': 'Más de 10 años de experiencia'
			};
			if (expText[experience]) {
				parts.push(expText[experience]);
			}
		}

		if (domicilio) {
			const domText: Record<string, string> = {
				si: 'Voy a domicilio',
				no: 'Atiendo en mi local',
				aveces: 'A veces voy a domicilio'
			};
			if (domText[domicilio]) {
				parts.push(domText[domicilio]);
			}
		}

		if (presupuesto === 'si') {
			parts.push('Presupuesto sin cargo');
		}

		if (extra.trim()) {
			parts.push(extra.trim());
		}

		return parts.join('. ') + (parts.length > 0 ? '.' : '');
	}

	function handleGenerate() {
		const generated = generateDescription();
		if (generated) {
			value = generated;
		}
		showHelper = false;
	}

	function handleCancel() {
		showHelper = false;
	}
</script>

<div class="space-y-3">
	<!-- Main textarea -->
	<textarea
		bind:value
		rows={4}
		placeholder="Contá sobre tu negocio, servicios, horarios..."
		class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500 resize-none"
	></textarea>

	<!-- Helper toggle -->
	{#if !showHelper}
		<button
			type="button"
			onclick={() => showHelper = true}
			class="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
		>
			<HelpCircle class="h-4 w-4" />
			¿Necesitás ayuda para escribir tu descripción?
		</button>
	{/if}

	<!-- Guided helper form -->
	{#if showHelper}
		<div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
					<Sparkles class="h-4 w-4 text-primary-600" />
					Generador de descripción
				</h3>
				<button
					type="button"
					onclick={handleCancel}
					class="p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded"
				>
					<X class="h-4 w-4 text-gray-500" />
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<label for="services" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						¿Qué servicios ofrecés?
					</label>
					<input
						id="services"
						type="text"
						bind:value={services}
						placeholder="Ej: Instalaciones eléctricas, reparaciones..."
						class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500"
					/>
				</div>

				<div>
					<label for="experience" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						¿Cuánto tiempo de experiencia tenés?
					</label>
					<select
						id="experience"
						bind:value={experience}
						class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500"
					>
						{#each experienceOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="domicilio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						¿Vas a domicilio?
					</label>
					<select
						id="domicilio"
						bind:value={domicilio}
						class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500"
					>
						{#each domicilioOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="presupuesto" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						¿Hacés presupuestos sin cargo?
					</label>
					<div class="flex gap-4">
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="radio" bind:group={presupuesto} value="si" class="text-primary-600" />
							<span class="text-gray-700 dark:text-gray-300">Sí</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="radio" bind:group={presupuesto} value="no" class="text-primary-600" />
							<span class="text-gray-700 dark:text-gray-300">No</span>
						</label>
					</div>
				</div>

				<div>
					<label for="extra" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						¿Algo más que quieras agregar?
					</label>
					<input
						id="extra"
						type="text"
						bind:value={extra}
						placeholder="Ej: Atiendo emergencias, acepto Mercado Pago..."
						class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500"
					/>
				</div>

				<button
					type="button"
					onclick={handleGenerate}
					class="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
				>
					<Sparkles class="h-4 w-4" />
					Generar descripción
				</button>
			</div>
		</div>
	{/if}
</div>
