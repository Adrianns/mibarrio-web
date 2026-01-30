<script lang="ts">
	import { Phone, MessageCircle, Mail, Globe, Instagram, Facebook, Pencil } from 'lucide-svelte';

	let {
		phone = $bindable(''),
		whatsapp = $bindable(''),
		email = $bindable(''),
		website = $bindable(''),
		instagram = $bindable(''),
		facebook = $bindable(''),
		phoneError = '',
		readOnly = false
	} = $props();

	// Desktop: Track which field is being edited (inline editing)
	let editingField = $state<string | null>(null);

	function startEditing(field: string) {
		if (readOnly) return;
		editingField = field;
		queueMicrotask(() => {
			const input = document.getElementById(`contact-${field}`) as HTMLInputElement;
			input?.focus();
		});
	}

	function stopEditing() {
		editingField = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === 'Escape') {
			stopEditing();
		}
	}

	// Extract username from Instagram URL or handle raw username
	function getInstagramDisplay(value: string): string {
		if (!value) return '';
		const match = value.match(/instagram\.com\/([^\/\?]+)/i);
		if (match) return match[1];
		if (value.startsWith('http')) return '';
		return value.replace(/^@/, '');
	}

	// Extract page name from Facebook URL or handle raw page name
	function getFacebookDisplay(value: string): string {
		if (!value) return '';
		const match = value.match(/facebook\.com\/([^\/\?]+)/i);
		if (match) return match[1];
		if (value.startsWith('http')) return '';
		return value.replace(/^\//, '');
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
	<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contacto</h2>

	{#if readOnly}
		<!-- Read-only display -->
		<div class="space-y-3">
			<div class="flex items-center gap-3">
				<Phone class="h-5 w-5 text-gray-400 flex-shrink-0" />
				<span class="text-gray-600 dark:text-gray-400">{phone || '-'}</span>
			</div>
			<div class="flex items-center gap-3">
				<MessageCircle class="h-5 w-5 text-gray-400 flex-shrink-0" />
				<span class="text-gray-600 dark:text-gray-400">{whatsapp || '-'}</span>
			</div>
			<div class="flex items-center gap-3">
				<Mail class="h-5 w-5 text-gray-400 flex-shrink-0" />
				<span class="text-gray-600 dark:text-gray-400">{email || '-'}</span>
			</div>
			<hr class="my-3 dark:border-gray-700" />
			<div class="flex items-center gap-3">
				<Globe class="h-5 w-5 text-gray-400 flex-shrink-0" />
				<span class="text-gray-600 dark:text-gray-400 truncate">{website || '-'}</span>
			</div>
			<div class="flex items-center gap-3">
				<Instagram class="h-5 w-5 text-gray-400 flex-shrink-0" />
				<span class="text-gray-600 dark:text-gray-400">
					{#if instagram && getInstagramDisplay(instagram)}@{getInstagramDisplay(instagram)}{:else}-{/if}
				</span>
			</div>
			<div class="flex items-center gap-3">
				<Facebook class="h-5 w-5 text-gray-400 flex-shrink-0" />
				<span class="text-gray-600 dark:text-gray-400">
					{#if facebook && getFacebookDisplay(facebook)}{getFacebookDisplay(facebook)}{:else}-{/if}
				</span>
			</div>
		</div>
	{:else}
		<!-- Mobile: Classic form with labels and inputs -->
		<div class="lg:hidden space-y-4">
			<div>
				<label for="mobile-phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					Teléfono
				</label>
				<div class="relative">
					<Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<input
						id="mobile-phone"
						type="tel"
						bind:value={phone}
						placeholder="099 123 456"
						class="w-full pl-10 pr-4 py-3 rounded-lg border {phoneError ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
					/>
				</div>
				{#if phoneError}
					<p class="text-red-500 text-sm mt-1">{phoneError}</p>
				{/if}
			</div>

			<div>
				<label for="mobile-whatsapp" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					WhatsApp
				</label>
				<div class="relative">
					<MessageCircle class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<input
						id="mobile-whatsapp"
						type="tel"
						bind:value={whatsapp}
						placeholder="598 99 123 456"
						class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
					/>
				</div>
			</div>

			<div>
				<label for="mobile-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					Email
				</label>
				<div class="relative">
					<Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<input
						id="mobile-email"
						type="email"
						bind:value={email}
						placeholder="correo@ejemplo.com"
						class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
					/>
				</div>
			</div>

			<hr class="my-4 dark:border-gray-700" />

			<div>
				<label for="mobile-website" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					Sitio web
				</label>
				<div class="relative">
					<Globe class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<input
						id="mobile-website"
						type="url"
						bind:value={website}
						placeholder="https://..."
						class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
					/>
				</div>
			</div>

			<div>
				<label for="mobile-instagram" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					Instagram
				</label>
				<div class="relative">
					<Instagram class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<input
						id="mobile-instagram"
						type="text"
						bind:value={instagram}
						placeholder="usuario"
						class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
					/>
				</div>
			</div>

			<div>
				<label for="mobile-facebook" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					Facebook
				</label>
				<div class="relative">
					<Facebook class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<input
						id="mobile-facebook"
						type="text"
						bind:value={facebook}
						placeholder="pagina"
						class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
					/>
				</div>
			</div>
		</div>

		<!-- Desktop: Inline editing -->
		<div class="hidden lg:block space-y-3">
			<!-- Phone -->
			<div class="group">
				{#if editingField === 'phone'}
					<div class="flex items-center gap-3">
						<Phone class="h-5 w-5 text-primary-500 flex-shrink-0" />
						<input
							id="contact-phone"
							type="tel"
							bind:value={phone}
							placeholder="099 123 456"
							onblur={stopEditing}
							onkeydown={handleKeydown}
							class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-900 dark:text-white"
						/>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => startEditing('phone')}
						class="w-full flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 py-1 transition-colors {phoneError ? 'ring-2 ring-red-500 ring-offset-2' : ''}"
					>
						<Phone class="h-5 w-5 text-gray-400 flex-shrink-0" />
						<span class="{phone ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">{phone || 'Agregar teléfono'}</span>
						<Pencil class="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50" />
					</button>
				{/if}
				{#if phoneError}
					<p class="text-red-500 text-sm mt-1 ml-8">{phoneError}</p>
				{/if}
			</div>

			<!-- WhatsApp -->
			<div class="group">
				{#if editingField === 'whatsapp'}
					<div class="flex items-center gap-3">
						<MessageCircle class="h-5 w-5 text-primary-500 flex-shrink-0" />
						<input
							id="contact-whatsapp"
							type="tel"
							bind:value={whatsapp}
							placeholder="598 99 123 456"
							onblur={stopEditing}
							onkeydown={handleKeydown}
							class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-900 dark:text-white"
						/>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => startEditing('whatsapp')}
						class="w-full flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 py-1 transition-colors"
					>
						<MessageCircle class="h-5 w-5 text-gray-400 flex-shrink-0" />
						<span class="{whatsapp ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">{whatsapp || 'Agregar WhatsApp'}</span>
						<Pencil class="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50" />
					</button>
				{/if}
			</div>

			<!-- Email -->
			<div class="group">
				{#if editingField === 'email'}
					<div class="flex items-center gap-3">
						<Mail class="h-5 w-5 text-primary-500 flex-shrink-0" />
						<input
							id="contact-email"
							type="email"
							bind:value={email}
							placeholder="correo@ejemplo.com"
							onblur={stopEditing}
							onkeydown={handleKeydown}
							class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-900 dark:text-white"
						/>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => startEditing('email')}
						class="w-full flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 py-1 transition-colors"
					>
						<Mail class="h-5 w-5 text-gray-400 flex-shrink-0" />
						<span class="{email ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">{email || 'Agregar email'}</span>
						<Pencil class="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50" />
					</button>
				{/if}
			</div>

			<hr class="my-3 dark:border-gray-700" />

			<!-- Website -->
			<div class="group">
				{#if editingField === 'website'}
					<div class="flex items-center gap-3">
						<Globe class="h-5 w-5 text-primary-500 flex-shrink-0" />
						<input
							id="contact-website"
							type="url"
							bind:value={website}
							placeholder="https://..."
							onblur={stopEditing}
							onkeydown={handleKeydown}
							class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-900 dark:text-white"
						/>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => startEditing('website')}
						class="w-full flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 py-1 transition-colors"
					>
						<Globe class="h-5 w-5 text-gray-400 flex-shrink-0" />
						<span class="truncate {website ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">{website || 'Agregar sitio web'}</span>
						<Pencil class="h-3 w-3 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-50" />
					</button>
				{/if}
			</div>

			<!-- Instagram -->
			<div class="group">
				{#if editingField === 'instagram'}
					<div class="flex items-center gap-3">
						<Instagram class="h-5 w-5 text-primary-500 flex-shrink-0" />
						<input
							id="contact-instagram"
							type="text"
							bind:value={instagram}
							placeholder="usuario"
							onblur={stopEditing}
							onkeydown={handleKeydown}
							class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-900 dark:text-white"
						/>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => startEditing('instagram')}
						class="w-full flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 py-1 transition-colors"
					>
						<Instagram class="h-5 w-5 text-gray-400 flex-shrink-0" />
						<span class="{instagram && getInstagramDisplay(instagram) ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">
							{#if instagram && getInstagramDisplay(instagram)}@{getInstagramDisplay(instagram)}{:else}Agregar Instagram{/if}
						</span>
						<Pencil class="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50" />
					</button>
				{/if}
			</div>

			<!-- Facebook -->
			<div class="group">
				{#if editingField === 'facebook'}
					<div class="flex items-center gap-3">
						<Facebook class="h-5 w-5 text-primary-500 flex-shrink-0" />
						<input
							id="contact-facebook"
							type="text"
							bind:value={facebook}
							placeholder="pagina"
							onblur={stopEditing}
							onkeydown={handleKeydown}
							class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-900 dark:text-white"
						/>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => startEditing('facebook')}
						class="w-full flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 py-1 transition-colors"
					>
						<Facebook class="h-5 w-5 text-gray-400 flex-shrink-0" />
						<span class="{facebook && getFacebookDisplay(facebook) ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">
							{#if facebook && getFacebookDisplay(facebook)}{getFacebookDisplay(facebook)}{:else}Agregar Facebook{/if}
						</span>
						<Pencil class="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50" />
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
