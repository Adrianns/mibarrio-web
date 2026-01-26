<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { APP_NAME } from '$lib/config';
	import { auth, hasMibarrioProvider } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';
	import { Mail, Lock, Eye, EyeOff } from 'lucide-svelte';
	import { get } from 'svelte/store';

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

		// Check if user has a mibarrio provider
		const hasProvider = get(hasMibarrioProvider);

		if (hasProvider) {
			goto('/dashboard');
		} else {
			// Redirect to register business flow
			goto('/registrar-negocio');
		}
	}
</script>

<svelte:head>
	<title>Ingresar - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col">
	<!-- Header -->
	<header class="bg-white border-b border-gray-200">
		<div class="container py-4">
			<a href="/" class="text-2xl font-bold text-primary-600">{APP_NAME}</a>
		</div>
	</header>

	<div class="flex-1 flex items-center justify-center px-4 py-12">
		<div class="w-full max-w-md">
			<div class="bg-white rounded-2xl shadow-sm p-8">
				<div class="text-center mb-8">
					<h1 class="text-2xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h1>
					<p class="text-gray-600">Ingresá a tu cuenta para gestionar tu negocio</p>
				</div>

				<form onsubmit={handleSubmit} class="space-y-4">
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1"> Email </label>
						<div class="relative">
							<Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								id="email"
								type="email"
								bind:value={email}
								required
								placeholder="tu@email.com"
								class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
							/>
						</div>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
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
								class="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
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
							<span class="ml-2 text-sm text-gray-600">Recordarme</span>
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
					<p class="text-gray-600">
						¿No tenés cuenta?
						<a href="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
							Registrate
						</a>
					</p>
				</div>

				<!-- Info about shared account -->
				<div class="mt-6 p-4 bg-blue-50 rounded-lg">
					<p class="text-sm text-blue-700">
						Si ya tenés cuenta en <strong>Appyuda</strong>, podés usar las mismas credenciales para
						ingresar.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
