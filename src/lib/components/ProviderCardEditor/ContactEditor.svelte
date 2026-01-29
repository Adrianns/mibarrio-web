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

	<div class="space-y-3">
		<!-- Phone -->
		<div class="group">
			<div class="flex items-center gap-3">
				<Phone class="h-5 w-5 text-gray-400 flex-shrink-0" />
				{#if readOnly}
					<span class="flex-1 text-gray-600 dark:text-gray-400">
						{phone || '-'}
					</span>
				{:else if editingField === 'phone'}
					<input
						id="contact-phone"
						type="tel"
						bind:value={phone}
						placeholder="099 123 456"
						onblur={stopEditing}
						onkeydown={handleKeydown}
						class="flex-1 bg-transparent border-b-2 outline-none text-gray-600 dark:text-gray-300 {phoneError ? 'border-red-500' : 'border-primary-500'}"
					/>
				{:else}
					<button
						type="button"
						onclick={() => startEditing('phone')}
						class="flex-1 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 transition-colors {phoneError ? 'ring-2 ring-red-500 ring-offset-2' : ''}"
					>
						{phone || 'Agregar teléfono'}
						<Pencil class="inline-block h-3 w-3 ml-2 opacity-0 group-hover:opacity-50" />
					</button>
				{/if}
			</div>
			{#if phoneError && !readOnly}
				<p class="text-red-500 text-sm mt-1 ml-8">{phoneError}</p>
			{/if}
		</div>

		<!-- WhatsApp -->
		<div class="group flex items-center gap-3">
			<MessageCircle class="h-5 w-5 text-gray-400 flex-shrink-0" />
			{#if readOnly}
				<span class="flex-1 text-gray-600 dark:text-gray-400">
					{whatsapp || '-'}
				</span>
			{:else if editingField === 'whatsapp'}
				<input
					id="contact-whatsapp"
					type="tel"
					bind:value={whatsapp}
					placeholder="598 99 123 456"
					onblur={stopEditing}
					onkeydown={handleKeydown}
					class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-600 dark:text-gray-300"
				/>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('whatsapp')}
					class="flex-1 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 transition-colors"
				>
					{whatsapp || 'Agregar WhatsApp'}
					<Pencil class="inline-block h-3 w-3 ml-2 opacity-0 group-hover:opacity-50" />
				</button>
			{/if}
		</div>

		<!-- Email -->
		<div class="group flex items-center gap-3">
			<Mail class="h-5 w-5 text-gray-400 flex-shrink-0" />
			{#if readOnly}
				<span class="flex-1 text-gray-600 dark:text-gray-400">
					{email || '-'}
				</span>
			{:else if editingField === 'email'}
				<input
					id="contact-email"
					type="email"
					bind:value={email}
					placeholder="correo@ejemplo.com"
					onblur={stopEditing}
					onkeydown={handleKeydown}
					class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-600 dark:text-gray-300"
				/>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('email')}
					class="flex-1 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 transition-colors"
				>
					{email || 'Agregar email'}
					<Pencil class="inline-block h-3 w-3 ml-2 opacity-0 group-hover:opacity-50" />
				</button>
			{/if}
		</div>

		<hr class="my-3 dark:border-gray-700" />

		<!-- Website -->
		<div class="group flex items-center gap-3">
			<Globe class="h-5 w-5 text-gray-400 flex-shrink-0" />
			{#if readOnly}
				<span class="flex-1 text-gray-600 dark:text-gray-400 truncate">
					{website || '-'}
				</span>
			{:else if editingField === 'website'}
				<input
					id="contact-website"
					type="url"
					bind:value={website}
					placeholder="https://..."
					onblur={stopEditing}
					onkeydown={handleKeydown}
					class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-600 dark:text-gray-300"
				/>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('website')}
					class="flex-1 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 transition-colors truncate"
				>
					{website || 'Agregar sitio web'}
					<Pencil class="inline-block h-3 w-3 ml-2 opacity-0 group-hover:opacity-50" />
				</button>
			{/if}
		</div>

		<!-- Instagram -->
		<div class="group flex items-center gap-3">
			<Instagram class="h-5 w-5 text-gray-400 flex-shrink-0" />
			{#if readOnly}
				<span class="flex-1 text-gray-600 dark:text-gray-400">
					{#if instagram && getInstagramDisplay(instagram)}
						@{getInstagramDisplay(instagram)}
					{:else}
						-
					{/if}
				</span>
			{:else if editingField === 'instagram'}
				<input
					id="contact-instagram"
					type="text"
					bind:value={instagram}
					placeholder="usuario"
					onblur={stopEditing}
					onkeydown={handleKeydown}
					class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-600 dark:text-gray-300"
				/>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('instagram')}
					class="flex-1 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 transition-colors"
				>
					{#if instagram && getInstagramDisplay(instagram)}
						@{getInstagramDisplay(instagram)}
					{:else}
						Agregar Instagram
					{/if}
					<Pencil class="inline-block h-3 w-3 ml-2 opacity-0 group-hover:opacity-50" />
				</button>
			{/if}
		</div>

		<!-- Facebook -->
		<div class="group flex items-center gap-3">
			<Facebook class="h-5 w-5 text-gray-400 flex-shrink-0" />
			{#if readOnly}
				<span class="flex-1 text-gray-600 dark:text-gray-400">
					{#if facebook && getFacebookDisplay(facebook)}
						{getFacebookDisplay(facebook)}
					{:else}
						-
					{/if}
				</span>
			{:else if editingField === 'facebook'}
				<input
					id="contact-facebook"
					type="text"
					bind:value={facebook}
					placeholder="pagina"
					onblur={stopEditing}
					onkeydown={handleKeydown}
					class="flex-1 bg-transparent border-b-2 border-primary-500 outline-none text-gray-600 dark:text-gray-300"
				/>
			{:else}
				<button
					type="button"
					onclick={() => startEditing('facebook')}
					class="flex-1 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -mx-1 transition-colors"
				>
					{#if facebook && getFacebookDisplay(facebook)}
						{getFacebookDisplay(facebook)}
					{:else}
						Agregar Facebook
					{/if}
					<Pencil class="inline-block h-3 w-3 ml-2 opacity-0 group-hover:opacity-50" />
				</button>
			{/if}
		</div>
	</div>
</div>
