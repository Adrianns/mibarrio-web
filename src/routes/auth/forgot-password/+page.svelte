<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME, APP_DOMAIN } from '$lib/config';
	import { supabase } from '$lib/supabase';
	import { toast } from '$lib/stores/toast';
	import { Mail, ArrowLeft, CheckCircle } from 'lucide-svelte';

	let email = $state('');
	let loading = $state(false);
	let emailSent = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!email.trim()) {
			toast.error('Ingresá tu email');
			return;
		}

		loading = true;

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${APP_DOMAIN}/auth/reset-password`
		});

		loading = false;

		if (error) {
			toast.error('Error al enviar el email. Intentá de nuevo.');
			return;
		}

		emailSent = true;
	}
</script>

<svelte:head>
	<title>Recuperar contraseña - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
	<Header showAuthLinks={false} />

	<div class="flex-1 flex items-center justify-center px-4 py-12">
		<div class="w-full max-w-md">
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
				{#if emailSent}
					<div class="text-center">
						<div class="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
							<CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
						</div>
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Revisá tu email</h1>
						<p class="text-gray-600 dark:text-gray-400 mb-6">
							Te enviamos un link a <strong class="text-gray-900 dark:text-white">{email}</strong> para restablecer tu contraseña.
						</p>
						<p class="text-sm text-gray-500 dark:text-gray-500 mb-6">
							Si no ves el email, revisá tu carpeta de spam.
						</p>
						<Button variant="outline" onclick={() => goto('/auth/login')} class="w-full">
							<ArrowLeft class="h-4 w-4 mr-2" />
							Volver al login
						</Button>
					</div>
				{:else}
					<div class="text-center mb-8">
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">¿Olvidaste tu contraseña?</h1>
						<p class="text-gray-600 dark:text-gray-400">Ingresá tu email y te enviaremos un link para restablecerla</p>
					</div>

					<form onsubmit={handleSubmit} class="space-y-4">
						<div>
							<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Email
							</label>
							<div class="relative">
								<Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<input
									id="email"
									type="email"
									bind:value={email}
									required
									placeholder="tu@email.com"
									class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
								/>
							</div>
						</div>

						<Button type="submit" size="lg" class="w-full" disabled={loading}>
							{loading ? 'Enviando...' : 'Enviar link de recuperación'}
						</Button>
					</form>

					<div class="mt-6 text-center">
						<a href="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
							<ArrowLeft class="h-4 w-4" />
							Volver al login
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
