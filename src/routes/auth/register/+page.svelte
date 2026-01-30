<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/Header.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { APP_NAME } from '$lib/config';
	import { auth } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';
	import { Mail, Lock, User, Eye, EyeOff } from 'lucide-svelte';
	import { get } from 'svelte/store';

	const redirectTo = get(page).url.searchParams.get('redirect');
	const tipo = get(page).url.searchParams.get('tipo');

	let fullName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let acceptTerms = $state(true);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!fullName.trim() || !email.trim() || !password.trim()) {
			toast.error('Completá todos los campos');
			return;
		}

		if (password !== confirmPassword) {
			toast.error('Las contraseñas no coinciden');
			return;
		}

		if (password.length < 6) {
			toast.error('La contraseña debe tener al menos 6 caracteres');
			return;
		}

		if (!acceptTerms) {
			toast.error('Debés aceptar los términos y condiciones');
			return;
		}

		loading = true;

		const result = await auth.register(email, password, fullName);

		if (result.error) {
			toast.error(result.error);
			loading = false;
			return;
		}

		if (result.emailConfirmationRequired) {
			toast.success('¡Cuenta creada! Revisá tu email para confirmar tu cuenta.');
			goto('/auth/login');
			return;
		}

		toast.success('¡Cuenta creada exitosamente!');
		goto(redirectTo || '/');
	}
</script>

<SEO title="Registrarse" url="/auth/register" noindex />

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
	<Header showAuthLinks={false} />

	<div class="flex-1 flex items-center justify-center px-4 py-12">
		<div class="w-full max-w-md">
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
				<div class="text-center mb-8">
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Crear cuenta</h1>
					<p class="text-gray-600 dark:text-gray-400">Registrate para publicar tu negocio o servicio</p>
				</div>

				<form onsubmit={handleSubmit} class="space-y-4">
					<div>
						<label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Nombre completo
						</label>
						<div class="relative">
							<User class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								id="fullName"
								type="text"
								bind:value={fullName}
								required
								placeholder="Tu nombre"
								class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
							/>
						</div>
					</div>

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

					<label class="flex items-start gap-2">
						<input
							type="checkbox"
							bind:checked={acceptTerms}
							class="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
						/>
						<span class="text-sm text-gray-600 dark:text-gray-400">
							Acepto los <a href="/terms" class="text-primary-600 hover:underline"
								>términos de uso</a
							>
							y la
							<a href="/privacy" class="text-primary-600 hover:underline">política de privacidad</a>
						</span>
					</label>

					<Button type="submit" size="lg" class="w-full" disabled={loading}>
						{loading ? 'Registrando...' : 'Crear cuenta'}
					</Button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-gray-600 dark:text-gray-400">
						¿Ya tenés cuenta?
						<a href="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
							Ingresá
						</a>
					</p>
				</div>

			</div>
		</div>
	</div>
</div>
