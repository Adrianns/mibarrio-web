<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
	import { auth, hasMibarrioProvider } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';
	import { Mail, Lock, Eye, EyeOff } from 'lucide-svelte';
	import { get } from 'svelte/store';

	const redirectTo = get(page).url.searchParams.get('redirect');
	const tipo = get(page).url.searchParams.get('tipo');

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!email.trim() || !password.trim()) {
			toast.error('Completá todos los campos');
			return;
		}

		loading = true;

		const result = await auth.login(email, password);

		if (result.error) {
			toast.error(result.error);
			loading = false;
			return;
		}

		toast.success('¡Bienvenido!');

		if (redirectTo) {
			const params = tipo ? `?tipo=${tipo}` : '';
			goto(`${redirectTo}${params}`);
		} else {
			// Check if user has a mibarrio provider
			const hasProvider = get(hasMibarrioProvider);
			if (hasProvider) {
				goto('/mi-negocio');
			} else {
				goto('/registrar-negocio');
			}
		}
	}
</script>

<svelte:head>
	<title>Ingresar - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
	<Header showAuthLinks={false} />

	<div class="flex-1 flex items-center justify-center px-4 py-12">
		<div class="w-full max-w-md">
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
				<div class="text-center mb-8">
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenido de nuevo</h1>
					<p class="text-gray-600 dark:text-gray-400">Ingresá a tu cuenta para gestionar tu negocio</p>
				</div>

				<form onsubmit={handleSubmit} class="space-y-4">
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Email </label>
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

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Contraseña
						</label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								required
								placeholder="••••••••"
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

					<div class="flex items-center justify-between">
						<label class="flex items-center">
							<input
								type="checkbox"
								class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
							/>
							<span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Recordarme</span>
						</label>
						<a href="/auth/forgot-password" class="text-sm text-primary-600 hover:text-primary-700">
							¿Olvidaste tu contraseña?
						</a>
					</div>

					<Button type="submit" size="lg" class="w-full" disabled={loading}>
						{loading ? 'Ingresando...' : 'Ingresar'}
					</Button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-gray-600 dark:text-gray-400">
						¿No tenés cuenta?
						<a href="/auth/register{redirectTo ? `?redirect=${redirectTo}` : ''}{tipo ? `${redirectTo ? '&' : '?'}tipo=${tipo}` : ''}" class="text-primary-600 hover:text-primary-700 font-medium">
							Registrate
						</a>
					</p>
				</div>

				<!-- Info about shared account -->
				<div class="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-lg">
					<p class="text-sm text-green-800 dark:text-green-300">
						Si ya tenés cuenta en{' '}
						<a
							href="https://appyuda.com.uy"
							target="_blank"
							rel="noopener noreferrer"
							class="font-bold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline"
						>
							Appyuda
						</a>, podés usar las mismas credenciales para ingresar.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
