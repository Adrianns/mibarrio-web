<script lang="ts">
	import { Phone, MessageCircle, Mail, Globe, Instagram, Facebook, ChevronRight } from 'lucide-svelte';

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

	// Track which field is being edited
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
		// Try to extract from URL
		const match = value.match(/instagram\.com\/([^\/\?]+)/i);
		if (match) return match[1];
		// If it looks like a URL but not instagram, don't display it
		if (value.startsWith('http')) return '';
		// Return raw value without @ prefix
		return value.replace(/^@/, '');
	}

	// Extract page name from Facebook URL or handle raw page name
	function getFacebookDisplay(value: string): string {
		if (!value) return '';
		// Try to extract from URL
		const match = value.match(/facebook\.com\/([^\/\?]+)/i);
		if (match) return match[1];
		// If it looks like a URL but not facebook, don't display it
		if (value.startsWith('http')) return '';
		// Return raw value without / prefix
		return value.replace(/^\//, '');
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
	<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contacto</h2>

	<div class="space-y-1 lg:space-y-3">
		<!-- Phone -->
		<div>
			{#if readOnly}
				<div class="flex items-center gap-3 py-3 lg:py-0">
					<Phone class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-gray-600 dark:text-gray-400">{phone || '-'}</span>
				</div>
			{:else if editingField === 'phone'}
				<div class="flex items-center gap-3 py-3 lg:py-0 bg-gray-50 dark:bg-gray-700/50 -mx-6 px-6 lg:mx-0 lg:px-0 lg:bg-transparent">
					<Phone class="h-5 w-5 text-primary-500 flex-shrink-0" />
					<input
						id="contact-phone"
						type="tel"
						bind:value={phone}
						placeholder="099 123 456"
						onblur={stopEditing}
						onkeydown={handleKeydown}
						class="flex-1 bg-transparent outline-none text-gray-900 dark:text-white lg:border-b-2 lg:border-primary-500"
					/>
				</div>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('phone')}
					class="w-full flex items-center gap-3 py-3 lg:py-1 -mx-6 px-6 lg:mx-0 lg:px-1 lg:-ml-1 active:bg-gray-100 dark:active:bg-gray-700/50 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-700/50 lg:rounded transition-colors {phoneError ? 'bg-red-50 dark:bg-red-900/20' : ''}"
				>
					<Phone class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-left {phone ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">
						{phone || 'Agregar teléfono'}
					</span>
					<ChevronRight class="h-5 w-5 text-gray-300 dark:text-gray-600 lg:hidden" />
				</button>
			{/if}
			{#if phoneError && !readOnly}
				<p class="text-red-500 text-sm mt-1 ml-8">{phoneError}</p>
			{/if}
		</div>

		<!-- WhatsApp -->
		<div>
			{#if readOnly}
				<div class="flex items-center gap-3 py-3 lg:py-0">
					<MessageCircle class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-gray-600 dark:text-gray-400">{whatsapp || '-'}</span>
				</div>
			{:else if editingField === 'whatsapp'}
				<div class="flex items-center gap-3 py-3 lg:py-0 bg-gray-50 dark:bg-gray-700/50 -mx-6 px-6 lg:mx-0 lg:px-0 lg:bg-transparent">
					<MessageCircle class="h-5 w-5 text-primary-500 flex-shrink-0" />
					<input
						id="contact-whatsapp"
						type="tel"
						bind:value={whatsapp}
						placeholder="598 99 123 456"
						onblur={stopEditing}
						onkeydown={handleKeydown}
						class="flex-1 bg-transparent outline-none text-gray-900 dark:text-white lg:border-b-2 lg:border-primary-500"
					/>
				</div>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('whatsapp')}
					class="w-full flex items-center gap-3 py-3 lg:py-1 -mx-6 px-6 lg:mx-0 lg:px-1 lg:-ml-1 active:bg-gray-100 dark:active:bg-gray-700/50 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-700/50 lg:rounded transition-colors"
				>
					<MessageCircle class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-left {whatsapp ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">
						{whatsapp || 'Agregar WhatsApp'}
					</span>
					<ChevronRight class="h-5 w-5 text-gray-300 dark:text-gray-600 lg:hidden" />
				</button>
			{/if}
		</div>

		<!-- Email -->
		<div>
			{#if readOnly}
				<div class="flex items-center gap-3 py-3 lg:py-0">
					<Mail class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-gray-600 dark:text-gray-400">{email || '-'}</span>
				</div>
			{:else if editingField === 'email'}
				<div class="flex items-center gap-3 py-3 lg:py-0 bg-gray-50 dark:bg-gray-700/50 -mx-6 px-6 lg:mx-0 lg:px-0 lg:bg-transparent">
					<Mail class="h-5 w-5 text-primary-500 flex-shrink-0" />
					<input
						id="contact-email"
						type="email"
						bind:value={email}
						placeholder="correo@ejemplo.com"
						onblur={stopEditing}
						onkeydown={handleKeydown}
						class="flex-1 bg-transparent outline-none text-gray-900 dark:text-white lg:border-b-2 lg:border-primary-500"
					/>
				</div>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('email')}
					class="w-full flex items-center gap-3 py-3 lg:py-1 -mx-6 px-6 lg:mx-0 lg:px-1 lg:-ml-1 active:bg-gray-100 dark:active:bg-gray-700/50 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-700/50 lg:rounded transition-colors"
				>
					<Mail class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-left {email ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">
						{email || 'Agregar email'}
					</span>
					<ChevronRight class="h-5 w-5 text-gray-300 dark:text-gray-600 lg:hidden" />
				</button>
			{/if}
		</div>

		<hr class="my-2 lg:my-3 dark:border-gray-700" />

		<!-- Website -->
		<div>
			{#if readOnly}
				<div class="flex items-center gap-3 py-3 lg:py-0">
					<Globe class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-gray-600 dark:text-gray-400 truncate">{website || '-'}</span>
				</div>
			{:else if editingField === 'website'}
				<div class="flex items-center gap-3 py-3 lg:py-0 bg-gray-50 dark:bg-gray-700/50 -mx-6 px-6 lg:mx-0 lg:px-0 lg:bg-transparent">
					<Globe class="h-5 w-5 text-primary-500 flex-shrink-0" />
					<input
						id="contact-website"
						type="url"
						bind:value={website}
						placeholder="https://..."
						onblur={stopEditing}
						onkeydown={handleKeydown}
						class="flex-1 bg-transparent outline-none text-gray-900 dark:text-white lg:border-b-2 lg:border-primary-500"
					/>
				</div>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('website')}
					class="w-full flex items-center gap-3 py-3 lg:py-1 -mx-6 px-6 lg:mx-0 lg:px-1 lg:-ml-1 active:bg-gray-100 dark:active:bg-gray-700/50 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-700/50 lg:rounded transition-colors"
				>
					<Globe class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-left truncate {website ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">
						{website || 'Agregar sitio web'}
					</span>
					<ChevronRight class="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0 lg:hidden" />
				</button>
			{/if}
		</div>

		<!-- Instagram -->
		<div>
			{#if readOnly}
				<div class="flex items-center gap-3 py-3 lg:py-0">
					<Instagram class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-gray-600 dark:text-gray-400">
						{#if instagram && getInstagramDisplay(instagram)}@{getInstagramDisplay(instagram)}{:else}-{/if}
					</span>
				</div>
			{:else if editingField === 'instagram'}
				<div class="flex items-center gap-3 py-3 lg:py-0 bg-gray-50 dark:bg-gray-700/50 -mx-6 px-6 lg:mx-0 lg:px-0 lg:bg-transparent">
					<Instagram class="h-5 w-5 text-primary-500 flex-shrink-0" />
					<input
						id="contact-instagram"
						type="text"
						bind:value={instagram}
						placeholder="usuario"
						onblur={stopEditing}
						onkeydown={handleKeydown}
						class="flex-1 bg-transparent outline-none text-gray-900 dark:text-white lg:border-b-2 lg:border-primary-500"
					/>
				</div>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('instagram')}
					class="w-full flex items-center gap-3 py-3 lg:py-1 -mx-6 px-6 lg:mx-0 lg:px-1 lg:-ml-1 active:bg-gray-100 dark:active:bg-gray-700/50 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-700/50 lg:rounded transition-colors"
				>
					<Instagram class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-left {instagram && getInstagramDisplay(instagram) ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">
						{#if instagram && getInstagramDisplay(instagram)}@{getInstagramDisplay(instagram)}{:else}Agregar Instagram{/if}
					</span>
					<ChevronRight class="h-5 w-5 text-gray-300 dark:text-gray-600 lg:hidden" />
				</button>
			{/if}
		</div>

		<!-- Facebook -->
		<div>
			{#if readOnly}
				<div class="flex items-center gap-3 py-3 lg:py-0">
					<Facebook class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-gray-600 dark:text-gray-400">
						{#if facebook && getFacebookDisplay(facebook)}{getFacebookDisplay(facebook)}{:else}-{/if}
					</span>
				</div>
			{:else if editingField === 'facebook'}
				<div class="flex items-center gap-3 py-3 lg:py-0 bg-gray-50 dark:bg-gray-700/50 -mx-6 px-6 lg:mx-0 lg:px-0 lg:bg-transparent">
					<Facebook class="h-5 w-5 text-primary-500 flex-shrink-0" />
					<input
						id="contact-facebook"
						type="text"
						bind:value={facebook}
						placeholder="pagina"
						onblur={stopEditing}
						onkeydown={handleKeydown}
						class="flex-1 bg-transparent outline-none text-gray-900 dark:text-white lg:border-b-2 lg:border-primary-500"
					/>
				</div>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('facebook')}
					class="w-full flex items-center gap-3 py-3 lg:py-1 -mx-6 px-6 lg:mx-0 lg:px-1 lg:-ml-1 active:bg-gray-100 dark:active:bg-gray-700/50 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-700/50 lg:rounded transition-colors"
				>
					<Facebook class="h-5 w-5 text-gray-400 flex-shrink-0" />
					<span class="flex-1 text-left {facebook && getFacebookDisplay(facebook) ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}">
						{#if facebook && getFacebookDisplay(facebook)}{getFacebookDisplay(facebook)}{:else}Agregar Facebook{/if}
					</span>
					<ChevronRight class="h-5 w-5 text-gray-300 dark:text-gray-600 lg:hidden" />
				</button>
			{/if}
		</div>
	</div>
</div>
