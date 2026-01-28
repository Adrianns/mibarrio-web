<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
	import { supabase } from '$lib/supabase';
	import { toast } from '$lib/stores/toast';
	import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let success = $state(false);
	let hasSession = $state(false);
	let checkingSession = $state(true);

	onMount(async () => {
		// Check if user has a valid session from the reset link
		const { data: { session } } = await supabase.auth.getSession();
		hasSession = !!session;
		checkingSession = false;
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!password.trim()) {
			toast.error('Ingresá tu nueva contraseña');
			return;
		}

		if (password.length < 6) {
			toast.error('La contraseña debe tener al menos 6 caracteres');
			return;
		}

		if (password !== confirmPassword) {
			toast.error('Las contraseñas no coinciden');
			return;
		}

		loading = true;

		const { error } = await supabase.auth.updateUser({
			password: password
		});

		loading = false;

		if (error) {
			toast.error('Error al cambiar la contraseña. El link puede haber expirado.');
			return;
		}

		success = true;
	}
</script>

<svelte:head>
	<title>Restablecer contraseña - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
	<Header showAuthLinks={false} />

	<div class="flex-1 flex items-center justify-center px-4 py-12">
		<div class="w-full max-w-md">
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
				{#if checkingSession}
					<div class="text-center py-8">
						<div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
						<p class="mt-4 text-gray-600 dark:text-gray-400">Verificando...</p>
					</div>
				{:else if !hasSession}
					<div class="text-center">
						<div class="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
							<Lock class="h-8 w-8 text-red-600 dark:text-red-400" />
						</div>
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Link inválido o expirado</h1>
						<p class="text-gray-600 dark:text-gray-400 mb-6">
							El link para restablecer tu contraseña no es válido o ya expiró.
						</p>
						<Button onclick={() => goto('/auth/forgot-password')} class="w-full">
							Solicitar nuevo link
						</Button>
					</div>
				{:else if success}
					<div class="text-center">
						<div class="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
							<CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
						</div>
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contraseña actualizada</h1>
						<p class="text-gray-600 dark:text-gray-400 mb-6">
							Tu contraseña fue cambiada exitosamente.
						</p>
						<Button onclick={() => goto('/auth/login')} class="w-full">
							Ir al login
						</Button>
					</div>
				{:else}
					<div class="text-center mb-8">
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nueva contraseña</h1>
						<p class="text-gray-600 dark:text-gray-400">Ingresá tu nueva contraseña</p>
					</div>

					<form onsubmit={handleSubmit} class="space-y-4">
						<div>
							<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Nueva contraseña
							</label>
							<div class="relative">
								<Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									bind:value={password}
									required
									minlength="6"
									placeholder="Mínimo 6 caracteres"
									class="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
								/>
								<button
									type="button"
									onclick={() => (showPassword = !showPassword)}
									class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{#if showPassword}
										<EyeOff class="h-5 w-5" />
									{:else}
										<Eye class="h-5 w-5" />
									{/if}
								</button>
							</div>
						</div>

						<div>
							<label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Confirmar contraseña
							</label>
							<div class="relative">
								<Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<input
									id="confirmPassword"
									type={showPassword ? 'text' : 'password'}
									bind:value={confirmPassword}
									required
									placeholder="Repetí tu contraseña"
									class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
								/>
							</div>
						</div>

						<Button type="submit" size="lg" class="w-full" disabled={loading}>
							{loading ? 'Guardando...' : 'Guardar nueva contraseña'}
						</Button>
					</form>
				{/if}
			</div>
		</div>
	</div>
</div>
