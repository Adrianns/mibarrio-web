<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { APP_NAME } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { Mail, Lock, User, Eye, EyeOff } from 'lucide-svelte';

	let fullName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let acceptTerms = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error('Las contraseñas no coinciden');
			return;
		}

		if (!acceptTerms) {
			toast.error('Debés aceptar los términos y condiciones');
			return;
		}

		loading = true;

		// TODO: Implement actual registration with Supabase
		setTimeout(() => {
			toast.info('Registro en desarrollo');
			loading = false;
		}, 1000);
	}
</script>

<svelte:head>
	<title>Registrarse - {APP_NAME}</title>
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
					<h1 class="text-2xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
					<p class="text-gray-600">Registrate para publicar tu negocio o servicio</p>
				</div>

				<form onsubmit={handleSubmit} class="space-y-4">
					<div>
						<label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">
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
								class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
							/>
						</div>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
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
								minlength="8"
								placeholder="Mínimo 8 caracteres"
								class="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
							/>
							<button
								type="button"
								onclick={() => showPassword = !showPassword}
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
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
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
								class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
							/>
						</div>
					</div>

					<label class="flex items-start gap-2">
						<input
							type="checkbox"
							bind:checked={acceptTerms}
							class="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
						/>
						<span class="text-sm text-gray-600">
							Acepto los <a href="/terms" class="text-primary-600 hover:underline">términos de uso</a>
							y la <a href="/privacy" class="text-primary-600 hover:underline">política de privacidad</a>
						</span>
					</label>

					<Button type="submit" size="lg" class="w-full" disabled={loading}>
						{loading ? 'Registrando...' : 'Crear cuenta'}
					</Button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-gray-600">
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
