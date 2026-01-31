<script lang="ts">
	import { UserCheck, Loader2, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { supabase } from '$lib/supabase';
	import { isAuthenticated, user } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	interface Props {
		providerId: string;
		providerName: string;
		onClaimed?: () => void;
	}

	let { providerId, providerName, onClaimed }: Props = $props();

	let showModal = $state(false);
	let message = $state('');
	let phone = $state('');
	let email = $state('');
	let submitting = $state(false);
	let existingClaim = $state<{ status: string } | null>(null);
	let checkingClaim = $state(true);

	// Check if user already has a pending claim
	async function checkExistingClaim(userId: string) {
		const { data } = await supabase
			.from('mb_claim_requests')
			.select('status')
			.eq('provider_id', providerId)
			.eq('user_id', userId)
			.maybeSingle();

		existingClaim = data;
		checkingClaim = false;
	}

	onMount(() => {
		// Subscribe to user changes
		const unsubscribe = user.subscribe((currentUser) => {
			if (currentUser) {
				checkExistingClaim(currentUser.id);
			} else {
				checkingClaim = false;
			}
		});

		return unsubscribe;
	});

	function openModal() {
		if (!$isAuthenticated) {
			// Redirect to login with return URL
			goto(`/auth/login?redirect=/directorio/${providerId}`);
			return;
		}
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		message = '';
		phone = '';
		email = '';
	}

	async function submitClaim() {
		if (!$user) return;

		// Validate required fields
		if (!phone.trim()) {
			toast.error('Por favor ingresá tu teléfono');
			return;
		}
		if (!email.trim()) {
			toast.error('Por favor ingresá tu email');
			return;
		}

		submitting = true;

		const { error } = await supabase.from('mb_claim_requests').insert({
			provider_id: providerId,
			user_id: $user.id,
			message: message.trim() || null,
			contact_phone: phone.trim(),
			contact_email: email.trim()
		});

		submitting = false;

		if (error) {
			if (error.code === '23505') {
				toast.error('Ya tenés una solicitud pendiente para este perfil');
			} else {
				toast.error('Error al enviar la solicitud');
				console.error('Claim error:', error);
			}
			return;
		}

		toast.success('Solicitud enviada. Te notificaremos cuando sea revisada.');
		closeModal();
		existingClaim = { status: 'pending' };
		onClaimed?.();
	}
</script>

{#if checkingClaim}
	<!-- Loading state -->
{:else if existingClaim}
	<!-- Already has a claim -->
	<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
		<div class="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
			<UserCheck class="h-5 w-5" />
			<span class="font-medium">
				{#if existingClaim.status === 'pending'}
					Solicitud de reclamo pendiente
				{:else if existingClaim.status === 'approved'}
					Reclamo aprobado
				{:else}
					Solicitud rechazada
				{/if}
			</span>
		</div>
		{#if existingClaim.status === 'pending'}
			<p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
				Estamos revisando tu solicitud. Te notificaremos pronto.
			</p>
		{/if}
	</div>
{:else}
	<!-- Claim button -->
	<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
		<p class="text-sm text-blue-700 dark:text-blue-300 mb-3">
			¿Sos el dueño de este negocio? Reclamá tu perfil para actualizarlo.
		</p>
		<Button variant="default" onclick={openModal}>
			<UserCheck class="h-4 w-4 mr-2" />
			Reclamar este perfil
		</Button>
	</div>
{/if}

<!-- Modal -->
{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<!-- Backdrop -->
		<button
			type="button"
			class="absolute inset-0 bg-black/50"
			onclick={closeModal}
			aria-label="Cerrar"
		></button>

		<!-- Modal content -->
		<div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
			<button
				type="button"
				class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
				onclick={closeModal}
			>
				<X class="h-5 w-5" />
			</button>

			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
				Reclamar perfil
			</h2>
			<p class="text-gray-600 dark:text-gray-400 mb-4">
				Estás solicitando el control de <strong>{providerName}</strong>.
				Un administrador revisará tu solicitud.
			</p>

			<div class="mb-4">
				<label for="claim-phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					Teléfono de contacto *
				</label>
				<input
					id="claim-phone"
					type="tel"
					bind:value={phone}
					placeholder="099 123 456"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<div class="mb-4">
				<label for="claim-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					Email de contacto *
				</label>
				<input
					id="claim-email"
					type="email"
					bind:value={email}
					placeholder="tu@email.com"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<div class="mb-4">
				<label for="claim-message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					Mensaje (opcional)
				</label>
				<textarea
					id="claim-message"
					bind:value={message}
					placeholder="Explica por qué este perfil te pertenece..."
					rows="3"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
				></textarea>
			</div>

			<div class="flex gap-3">
				<Button variant="outline" onclick={closeModal} class="flex-1">
					Cancelar
				</Button>
				<Button variant="default" onclick={submitClaim} disabled={submitting} class="flex-1">
					{#if submitting}
						<Loader2 class="h-4 w-4 mr-2 animate-spin" />
						Enviando...
					{:else}
						Enviar solicitud
					{/if}
				</Button>
			</div>
		</div>
	</div>
{/if}
