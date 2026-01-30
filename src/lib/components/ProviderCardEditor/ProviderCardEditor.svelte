<script lang="ts">
	import { CheckCircle, Loader2, Save, Camera, ImagePlus, Trash2, X, MapPin, Building2, Pencil } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import EditableText from './EditableText.svelte';
	import EditableTextarea from './EditableTextarea.svelte';
	import CategoryPicker from './CategoryPicker.svelte';
	import LocationPicker from './LocationPicker.svelte';
	import ContactEditor from './ContactEditor.svelte';
	import GuidedDescription from './GuidedDescription.svelte';
	import { toast } from '$lib/stores/toast';
	import { uploadPhoto, deletePhoto } from '$lib/utils/upload';
	import { DEPARTMENTS, MONTEVIDEO_NEIGHBORHOODS, DEFAULT_CATEGORIES, type Department } from '$lib/domain/types';

	interface ProviderData {
		id?: string;
		businessName: string;
		businessType?: 'individual' | 'business';
		rut?: string;
		description: string;
		department: Department | '';
		neighborhood: string;
		address: string;
		phone: string;
		whatsapp: string;
		email: string;
		website: string;
		instagram: string;
		facebook: string;
		logoUrl: string | null;
		photos: string[];
		categories: string[];
		isVerified?: boolean;
	}

	let {
		mode = 'create' as 'create' | 'edit',
		editorMode = 'full' as 'quick' | 'full',
		readOnly = false,
		businessType = 'individual' as 'individual' | 'business',
		userId,
		userName = '',
		initialData = null as ProviderData | null,
		saving = false,
		onSave
	}: {
		mode?: 'create' | 'edit';
		editorMode?: 'quick' | 'full';
		readOnly?: boolean;
		businessType?: 'individual' | 'business';
		userId: string;
		userName?: string;
		initialData?: ProviderData | null;
		saving?: boolean;
		onSave: (data: ProviderData) => void;
	} = $props();

	// Track current editor mode (can be expanded from quick to full)
	let currentEditorMode = $state(editorMode);

	// Form state - Pre-fill name from userName if no initialData
	let businessName = $state(initialData?.businessName ?? userName ?? '');
	let rut = $state(initialData?.rut ?? '');
	let description = $state(initialData?.description ?? '');
	let department = $state<Department | ''>(initialData?.department ?? '');
	let neighborhood = $state(initialData?.neighborhood ?? '');
	let address = $state(initialData?.address ?? '');
	let phone = $state(initialData?.phone ?? '');
	let whatsapp = $state(initialData?.whatsapp ?? '');
	let email = $state(initialData?.email ?? '');
	let website = $state(initialData?.website ?? '');
	let instagram = $state(initialData?.instagram ?? '');
	let facebook = $state(initialData?.facebook ?? '');
	let logoUrl = $state<string | null>(initialData?.logoUrl ?? null);
	let photos = $state<string[]>(initialData?.photos ?? []);
	let categories = $state<string[]>(initialData?.categories ?? []);

	// Mobile: Category picker modal
	let showCategoryPicker = $state(false);

	// Upload states
	let uploadingLogo = $state(false);
	let uploadingGallery = $state(false);
	let logoInput = $state<HTMLInputElement | null>(null);
	let galleryInput = $state<HTMLInputElement | null>(null);

	// Validation errors
	let errors = $state<{
		businessName?: string;
		categories?: string;
		department?: string;
		phone?: string;
	}>({});

	// Categories list
	const categoryOptions = DEFAULT_CATEGORIES.filter((c) => c.is_active);

	function getCategoryInfo(name: string) {
		return categoryOptions.find((c) => c.name === name) || { label: name, color: 'bg-gray-500' };
	}

	function toggleCategory(name: string) {
		if (categories.includes(name)) {
			categories = categories.filter((c) => c !== name);
		} else if (categories.length < 3) {
			categories = [...categories, name];
		} else {
			toast.warning('Máximo 3 categorías');
		}
	}

	function validate(): boolean {
		const newErrors: typeof errors = {};

		if (!businessName.trim()) {
			newErrors.businessName = 'Ingresá el nombre de tu negocio';
		}

		if (categories.length === 0) {
			newErrors.categories = 'Elegí al menos una categoría';
		}

		if (!department) {
			newErrors.department = 'Elegí dónde trabajás';
		}

		if (!phone.trim() && !whatsapp.trim() && !email.trim()) {
			newErrors.phone = 'Ingresá al menos un contacto (teléfono, WhatsApp o email)';
		}

		errors = newErrors;

		// Scroll to first error
		if (Object.keys(newErrors).length > 0) {
			const firstErrorField = Object.keys(newErrors)[0];
			queueMicrotask(() => {
				const element = document.getElementById(`field-${firstErrorField}`);
				element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			});
		}

		return Object.keys(newErrors).length === 0;
	}

	function handleSave() {
		if (!validate()) {
			toast.error('Revisá los campos marcados en rojo');
			return;
		}

		const data: ProviderData = {
			id: initialData?.id,
			businessName,
			businessType,
			rut: businessType === 'business' ? rut : undefined,
			description,
			department,
			neighborhood,
			address,
			phone,
			whatsapp,
			email,
			website,
			instagram,
			facebook,
			logoUrl,
			photos,
			categories,
			isVerified: initialData?.isVerified
		};
		onSave(data);
	}

	async function handleLogoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !userId) return;

		uploadingLogo = true;

		if (logoUrl) {
			await deletePhoto(logoUrl);
		}

		const result = await uploadPhoto(userId, file, 'logo');

		if (result.error) {
			toast.error(result.error);
			uploadingLogo = false;
			return;
		}

		logoUrl = result.url;
		toast.success('Foto de perfil actualizada');
		uploadingLogo = false;
		input.value = '';
	}

	async function removeLogo() {
		if (!logoUrl) return;
		await deletePhoto(logoUrl);
		logoUrl = null;
		toast.success('Foto de perfil eliminada');
	}

	async function handleGalleryUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0 || !userId) return;

		uploadingGallery = true;

		for (const file of Array.from(files)) {
			if (photos.length >= 10) {
				toast.warning('Máximo 10 fotos en la galería');
				break;
			}

			const result = await uploadPhoto(userId, file, 'gallery');

			if (result.error) {
				toast.error(`${file.name}: ${result.error}`);
				continue;
			}

			if (result.url) {
				photos = [...photos, result.url];
			}
		}

		toast.success('Fotos agregadas');
		uploadingGallery = false;
		input.value = '';
	}

	async function removeGalleryPhoto(index: number) {
		const url = photos[index];
		await deletePhoto(url);
		photos = photos.filter((_, i) => i !== index);
		toast.success('Foto eliminada');
	}
</script>

<div class="grid lg:grid-cols-3 gap-8">
	<!-- Main content -->
	<div class="lg:col-span-2">
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
			<div class="p-6">
				{#if readOnly}
					<!-- Read-only display (same for mobile and desktop) -->
					<div class="flex items-start gap-4 mb-6">
						<div class="relative flex-shrink-0">
							{#if logoUrl}
								<img src={logoUrl} alt="Logo" class="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
							{:else}
								<div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
									<Camera class="h-8 w-8 text-gray-400" />
								</div>
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-2">
								<h2 class="text-2xl font-bold text-gray-900 dark:text-white">{businessName || '-'}</h2>
								{#if initialData?.isVerified}
									<CheckCircle class="h-6 w-6 text-green-500 flex-shrink-0" />
								{/if}
							</div>
							<div class="flex flex-wrap gap-2 mb-2">
								{#each categories as categoryName (categoryName)}
									{@const catInfo = getCategoryInfo(categoryName)}
									<span class="text-sm {catInfo.color} text-white px-3 py-1 rounded-full">{catInfo.label}</span>
								{/each}
							</div>
							<div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
								<MapPin class="h-5 w-5" />
								{address ? `${address}, ` : ''}{neighborhood ? `${neighborhood}, ` : ''}{department || '-'}
							</div>
						</div>
					</div>

					{#if currentEditorMode === 'full'}
						<div class="mb-6">
							<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Descripción</h2>
							<p class="text-gray-600 dark:text-gray-300 whitespace-pre-line">{description || '-'}</p>
						</div>
						<div>
							<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Fotos</h2>
							{#if photos.length > 0}
								<div class="grid grid-cols-3 gap-3">
									{#each photos as photo, i (photo)}
										<img src={photo} alt="Foto {i + 1}" loading="lazy" class="w-full aspect-square object-cover rounded-lg" />
									{/each}
								</div>
							{:else}
								<p class="text-gray-400 italic text-sm">Sin fotos</p>
							{/if}
						</div>
					{/if}

				{:else}
					<!-- MOBILE: Classic form layout -->
					<div class="lg:hidden space-y-6">
						<!-- Logo upload -->
						<div class="flex justify-center">
							<div class="relative">
								{#if logoUrl}
									<img src={logoUrl} alt="Logo" class="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
									<button type="button" onclick={removeLogo} class="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center">
										<X class="h-4 w-4" />
									</button>
								{:else}
									<button type="button" onclick={() => logoInput?.click()} disabled={uploadingLogo} class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
										{#if uploadingLogo}
											<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
										{:else}
											<Camera class="h-8 w-8 text-gray-400" />
										{/if}
									</button>
								{/if}
								{#if logoUrl}
									<button type="button" onclick={() => logoInput?.click()} disabled={uploadingLogo} class="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center">
										<Camera class="h-4 w-4" />
									</button>
								{/if}
							</div>
						</div>
						<p class="text-center text-sm text-gray-500 dark:text-gray-400 -mt-2">Foto de perfil</p>

						<!-- Business name -->
						<div id="field-businessName">
							<label for="mobile-businessName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Nombre del negocio *
							</label>
							<div class="relative">
								<Building2 class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<input
									id="mobile-businessName"
									type="text"
									bind:value={businessName}
									placeholder="Ej: Juan Electricista"
									class="w-full pl-10 pr-4 py-3 rounded-lg border {errors.businessName ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
								/>
							</div>
							{#if errors.businessName}
								<p class="text-red-500 text-sm mt-1">{errors.businessName}</p>
							{/if}
						</div>

						<!-- RUT (only for business type) -->
						{#if businessType === 'business'}
							<div id="field-rut">
								<label for="mobile-rut" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									RUT de la empresa
								</label>
								<input
									id="mobile-rut"
									type="text"
									bind:value={rut}
									placeholder="Ej: 123456789012"
									class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
								/>
							</div>
						{/if}

						<!-- Categories -->
						<div id="field-categories">
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Categorías * <span class="font-normal text-gray-500">({categories.length}/3)</span>
							</label>
							<button
								type="button"
								onclick={() => showCategoryPicker = true}
								class="w-full px-4 py-3 rounded-lg border {errors.categories ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-gray-700 text-left flex items-center justify-between"
							>
								{#if categories.length > 0}
									<div class="flex flex-wrap gap-2">
										{#each categories as categoryName (categoryName)}
											{@const catInfo = getCategoryInfo(categoryName)}
											<span class="text-sm {catInfo.color} text-white px-2 py-0.5 rounded-full">{catInfo.label}</span>
										{/each}
									</div>
								{:else}
									<span class="text-gray-400">Seleccionar categorías</span>
								{/if}
								<Pencil class="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
							</button>
							{#if errors.categories}
								<p class="text-red-500 text-sm mt-1">{errors.categories}</p>
							{/if}
						</div>

						<!-- Department -->
						<div id="field-department">
							<label for="mobile-department" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Departamento *
							</label>
							<div class="relative">
								<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<select
									id="mobile-department"
									bind:value={department}
									class="w-full pl-10 pr-4 py-3 rounded-lg border {errors.department ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none appearance-none"
								>
									<option value="">Seleccionar</option>
									{#each DEPARTMENTS as dept}
										<option value={dept}>{dept}</option>
									{/each}
								</select>
							</div>
							{#if errors.department}
								<p class="text-red-500 text-sm mt-1">{errors.department}</p>
							{/if}
						</div>

						<!-- Neighborhood (only for Montevideo) -->
						{#if department === 'Montevideo'}
							<div>
								<label for="mobile-neighborhood" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Barrio
								</label>
								<select
									id="mobile-neighborhood"
									bind:value={neighborhood}
									class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none appearance-none"
								>
									<option value="">Seleccionar</option>
									{#each MONTEVIDEO_NEIGHBORHOODS as barrio}
										<option value={barrio}>{barrio}</option>
									{/each}
								</select>
							</div>
						{/if}

						<!-- Address -->
						<div>
							<label for="mobile-address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Dirección (opcional)
							</label>
							<input
								id="mobile-address"
								type="text"
								bind:value={address}
								placeholder="Ej: Av. Brasil 2500"
								class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
							/>
						</div>

						{#if currentEditorMode === 'full'}
							<!-- Description -->
							<div>
								<label for="mobile-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Descripción
								</label>
								{#if mode === 'create'}
									<GuidedDescription bind:value={description} />
								{:else}
									<textarea
										id="mobile-description"
										bind:value={description}
										rows="4"
										placeholder="Contá sobre tu negocio, servicios, horarios..."
										class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none resize-none"
									></textarea>
								{/if}
							</div>

							<!-- Gallery -->
							<div>
								<div class="flex items-center justify-between mb-2">
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
										Fotos <span class="font-normal text-gray-500">({photos.length}/10)</span>
									</label>
									{#if photos.length < 10}
										<button type="button" onclick={() => galleryInput?.click()} disabled={uploadingGallery} class="text-sm text-primary-600 flex items-center gap-1">
											{#if uploadingGallery}
												<Loader2 class="h-4 w-4 animate-spin" />
											{:else}
												<ImagePlus class="h-4 w-4" />
											{/if}
											Agregar
										</button>
									{/if}
								</div>
								{#if photos.length > 0}
									<div class="grid grid-cols-3 gap-2">
										{#each photos as photo, i (photo)}
											<div class="relative aspect-square">
												<img src={photo} alt="Foto {i + 1}" loading="lazy" class="w-full h-full object-cover rounded-lg" />
												<button type="button" onclick={() => removeGalleryPhoto(i)} class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
													<Trash2 class="h-3 w-3" />
												</button>
											</div>
										{/each}
									</div>
								{:else}
									<button type="button" onclick={() => galleryInput?.click()} disabled={uploadingGallery} class="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
										{#if uploadingGallery}
											<Loader2 class="h-8 w-8 animate-spin text-primary-600 mx-auto" />
										{:else}
											<div class="grid grid-cols-2 gap-2 mb-3">
												<div class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center p-2">
													<span class="text-xl mb-1">👤</span>
													<span class="text-xs text-gray-500">Tu foto</span>
												</div>
												<div class="aspect-square bg-primary-50 dark:bg-primary-900/30 rounded-lg flex flex-col items-center justify-center p-2 ring-2 ring-primary-500">
													<span class="text-xl mb-1">🔧</span>
													<span class="text-xs text-gray-500">Tu trabajo</span>
												</div>
											</div>
											<p class="text-gray-500 text-sm text-center">Tocar para agregar fotos</p>
										{/if}
									</button>
								{/if}
							</div>
						{:else}
							<button type="button" onclick={() => (currentEditorMode = 'full')} class="w-full py-3 text-primary-600 text-sm font-medium border-t border-gray-200 dark:border-gray-700">
								+ Completar más datos
							</button>
						{/if}
					</div>

					<!-- DESKTOP: Card preview with inline editing -->
					<div class="hidden lg:block">
						<div class="flex items-start gap-4 mb-6">
							<!-- Logo -->
							<div class="relative flex-shrink-0">
								{#if logoUrl}
									<img src={logoUrl} alt="Logo" class="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
									<button type="button" onclick={removeLogo} class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
										<X class="h-3 w-3" />
									</button>
								{:else}
									<button type="button" onclick={() => logoInput?.click()} disabled={uploadingLogo} class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 transition-colors cursor-pointer">
										{#if uploadingLogo}
											<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
										{:else}
											<Camera class="h-8 w-8 text-gray-400" />
										{/if}
									</button>
								{/if}
								{#if logoUrl}
									<button type="button" onclick={() => logoInput?.click()} disabled={uploadingLogo} class="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700">
										<Camera class="h-3 w-3" />
									</button>
								{/if}
							</div>

							<!-- Name and info -->
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-2" id="field-businessName">
									<EditableText
										bind:value={businessName}
										placeholder="Nombre del negocio"
										error={errors.businessName ?? ''}
										{readOnly}
										displayClass="text-2xl font-bold text-gray-900 dark:text-white"
										inputClass="text-2xl font-bold text-gray-900 dark:text-white"
									/>
									{#if initialData?.isVerified}
										<CheckCircle class="h-6 w-6 text-green-500 flex-shrink-0" />
									{/if}
								</div>

								{#if businessType === 'business'}
									<div class="mb-2" id="field-rut">
										<EditableText
											bind:value={rut}
											placeholder="RUT de la empresa"
											{readOnly}
											displayClass="text-sm text-gray-600 dark:text-gray-400"
											inputClass="text-sm text-gray-600 dark:text-gray-400"
										/>
									</div>
								{/if}

								<div class="mb-2" id="field-categories">
									<CategoryPicker bind:selected={categories} error={errors.categories ?? ''} {readOnly} />
								</div>

								<div id="field-department">
									<LocationPicker bind:department bind:neighborhood bind:address error={errors.department ?? ''} {readOnly} />
								</div>
							</div>
						</div>

						{#if currentEditorMode === 'full'}
							<div class="mb-6">
								<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Descripción</h2>
								{#if mode === 'create'}
									<GuidedDescription bind:value={description} />
								{:else}
									<EditableTextarea
										bind:value={description}
										placeholder="Contá sobre tu negocio, servicios, horarios..."
										displayClass="text-gray-600 dark:text-gray-300"
										textareaClass="text-gray-600 dark:text-gray-300 dark:bg-gray-700"
									/>
								{/if}
							</div>

							<div>
								<div class="flex items-center justify-between mb-3">
									<h2 class="text-lg font-semibold text-gray-900 dark:text-white">
										Fotos <span class="text-sm font-normal text-gray-500">({photos.length}/10)</span>
									</h2>
									{#if photos.length < 10}
										<button type="button" onclick={() => galleryInput?.click()} disabled={uploadingGallery} class="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
											{#if uploadingGallery}
												<Loader2 class="h-4 w-4 animate-spin" />
												Subiendo...
											{:else}
												<ImagePlus class="h-4 w-4" />
												Agregar
											{/if}
										</button>
									{/if}
								</div>

								{#if photos.length > 0}
									<div class="grid grid-cols-3 gap-3">
										{#each photos as photo, i (photo)}
											<div class="relative group aspect-square">
												<img src={photo} alt="Foto {i + 1}" loading="lazy" class="w-full h-full object-cover rounded-lg" />
												<button type="button" onclick={() => removeGalleryPhoto(i)} class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
													<Trash2 class="h-3 w-3" />
												</button>
											</div>
										{/each}
									</div>
								{:else}
									<button type="button" onclick={() => galleryInput?.click()} disabled={uploadingGallery} class="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-primary-400 transition-colors cursor-pointer">
										{#if uploadingGallery}
											<Loader2 class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
											<p class="text-gray-500 text-sm text-center">Subiendo...</p>
										{:else}
											<div class="grid grid-cols-4 gap-3 mb-4">
												<div class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center p-2">
													<span class="text-2xl mb-1">👤</span>
													<span class="text-xs text-gray-500 dark:text-gray-400 text-center">Tu foto</span>
												</div>
												<div class="aspect-square bg-primary-50 dark:bg-primary-900/30 rounded-lg flex flex-col items-center justify-center p-2 ring-2 ring-primary-500">
													<span class="text-2xl mb-1">🔧</span>
													<span class="text-xs text-gray-500 dark:text-gray-400 text-center">Tu trabajo</span>
													<span class="text-[10px] text-primary-600 font-medium">LA MÁS IMPORTANTE</span>
												</div>
												<div class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center p-2">
													<span class="text-2xl mb-1">⭐</span>
													<span class="text-xs text-gray-500 dark:text-gray-400 text-center">Trabajo terminado</span>
												</div>
												<div class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center p-2">
													<span class="text-2xl mb-1">📍</span>
													<span class="text-xs text-gray-500 dark:text-gray-400 text-center">Tu local</span>
												</div>
											</div>
											<p class="text-gray-500 dark:text-gray-400 text-sm text-center">Click para elegir fotos</p>
											<p class="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">💡 Tip: Fotos claras y con buena luz</p>
										{/if}
									</button>
								{/if}
							</div>
						{:else}
							<button type="button" onclick={() => (currentEditorMode = 'full')} class="w-full py-3 text-primary-600 hover:text-primary-700 text-sm font-medium border-t border-gray-200 dark:border-gray-700 mt-4">
								+ Completar más datos (descripción, fotos...)
							</button>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Hidden file inputs -->
		{#if !readOnly}
			<input bind:this={logoInput} type="file" accept="image/jpeg,image/png,image/webp" class="hidden" onchange={handleLogoUpload} />
			<input bind:this={galleryInput} type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden" onchange={handleGalleryUpload} />

			<!-- Save button -->
			<div class="flex justify-end mt-6">
				<Button onclick={handleSave} disabled={saving}>
					{#if saving}
						<Loader2 class="h-4 w-4 mr-2 animate-spin" />
						Guardando...
					{:else}
						<Save class="h-4 w-4 mr-2" />
						{mode === 'create' ? 'Publicar mi negocio' : 'Guardar cambios'}
					{/if}
				</Button>
			</div>
		{/if}
	</div>

	<!-- Contact sidebar -->
	<div class="lg:col-span-1" id="field-phone">
		<ContactEditor bind:phone bind:whatsapp bind:email bind:website bind:instagram bind:facebook phoneError={errors.phone ?? ''} {readOnly} />

		{#if mode === 'edit' && initialData?.id}
			<div class="mt-4 text-center">
				<a href="/directorio/{initialData.id}" class="text-sm text-primary-600 hover:text-primary-700">
					Ver perfil público →
				</a>
			</div>
		{/if}
	</div>
</div>

<!-- Mobile Category Picker Modal -->
{#if showCategoryPicker}
	<div class="fixed inset-0 z-50 lg:hidden">
		<button type="button" class="absolute inset-0 bg-black/50" onclick={() => showCategoryPicker = false} aria-label="Cerrar"></button>
		<div class="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Categorías ({categories.length}/3)</h3>
				<button type="button" onclick={() => showCategoryPicker = false} class="p-2">
					<X class="h-5 w-5" />
				</button>
			</div>
			<div class="grid grid-cols-2 gap-2 mb-4">
				{#each categoryOptions as cat (cat.name)}
					<button
						type="button"
						onclick={() => toggleCategory(cat.name)}
						class="p-3 rounded-lg border-2 text-left text-sm {categories.includes(cat.name) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-gray-600'}"
					>
						<span class="inline-block w-2 h-2 rounded-full {cat.color} mr-2"></span>
						{cat.label}
					</button>
				{/each}
			</div>
			<Button onclick={() => showCategoryPicker = false} class="w-full">Listo</Button>
		</div>
	</div>
{/if}
