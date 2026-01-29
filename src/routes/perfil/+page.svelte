<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { auth, user, isAuthenticated } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import { Loader2, User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	let loading = $state(true);
	let saving = $state(false);
	let changingPassword = $state(false);
	let showPasswordForm = $state(false);

	// Form state
	let fullName = $state('');
	let email = $state('');

	// Password form
	let newPassword = $state('');
	let confirmPassword = $state('');
	let showNewPassword = $state(false);

	// Password errors
	let passwordError = $state('');

	async function handleSaveProfile() {
		if (!fullName.trim()) {
			toast.error('El nombre es obligatorio');
			return;
		}

		saving = true;

		const { error } = await supabase
			.from('profiles')
			.update({ full_name: fullName.trim() })
			.eq('id', $user?.id);

		if (error) {
			toast.error('Error al guardar los cambios');
			saving = false;
			return;
		}

		toast.success('Perfil actualizado');
		saving = false;
	}

	async function handleChangePassword() {
		passwordError = '';

		if (!newPassword) {
			passwordError = 'Ingresá la nueva contraseña';
			return;
		}

		if (newPassword.length < 6) {
			passwordError = 'La nueva contraseña debe tener al menos 6 caracteres';
			return;
		}

		if (newPassword !== confirmPassword) {
			passwordError = 'Las contraseñas no coinciden';
			return;
		}

		changingPassword = true;

		try {
			// Update password directly - user is already authenticated
			const { error: updateError } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (updateError) {
				passwordError = 'Error al cambiar la contraseña: ' + updateError.message;
				return;
			}

			toast.success('Contraseña actualizada');
			showPasswordForm = false;
			newPassword = '';
			confirmPassword = '';
		} catch (err) {
			console.error('Password change error:', err);
			passwordError = 'Error al cambiar la contraseña';
		} finally {
			changingPassword = false;
		}
	}

	onMount(async () => {
		let unsub: (() => void) | undefined;
		unsub = auth.subscribe((state) => {
			if (state.initialized) {
				if (!state.user) {
					goto('/auth/login');
				} else {
					fullName = state.user.full_name || '';
					email = state.user.email || '';
					loading = false;
				}
				queueMicrotask(() => unsub?.());
			}
		});
	});
</script>

<svelte:head>
	<title>Mi perfil - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<Header items={[{ label: 'Directorio', href: '/directorio' }]} />

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
			<span class="ml-2 text-gray-600 dark:text-gray-400">Cargando...</span>
		</div>
	{:else}
		<div class="container py-8 max-w-xl">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mi perfil</h1>

			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
				<!-- Full name -->
				<div>
					<label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						<User class="h-4 w-4 inline mr-1" />
						Nombre completo
					</label>
					<input
						id="fullName"
						type="text"
						bind:value={fullName}
						placeholder="Tu nombre"
						class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
					/>
				</div>

				<!-- Email (read-only) -->
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						<Mail class="h-4 w-4 inline mr-1" />
						Email
					</label>
					<input
						id="email"
						type="email"
						value={email}
						disabled
						class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
					/>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
						El email no se puede cambiar
					</p>
				</div>

				<!-- Save button -->
				<Button onclick={handleSaveProfile} disabled={saving} class="w-full">
					{#if saving}
						<Loader2 class="h-4 w-4 mr-2 animate-spin" />
						Guardando...
					{:else}
						<Save class="h-4 w-4 mr-2" />
						Guardar cambios
					{/if}
				</Button>
			</div>

			<!-- Password section -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<Lock class="h-5 w-5" />
					Contraseña
				</h2>

				{#if !showPasswordForm}
					<button
						type="button"
						onclick={() => showPasswordForm = true}
						class="text-primary-600 hover:text-primary-700 text-sm font-medium"
					>
						Cambiar contraseña
					</button>
				{:else}
					<div class="space-y-4">
						<!-- New password -->
						<div>
							<label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Nueva contraseña
							</label>
							<div class="relative">
								<input
									id="newPassword"
									type={showNewPassword ? 'text' : 'password'}
									bind:value={newPassword}
									placeholder="••••••••"
									class="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
								/>
								<button
									type="button"
									onclick={() => showNewPassword = !showNewPassword}
									class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{#if showNewPassword}
										<EyeOff class="h-5 w-5" />
									{:else}
										<Eye class="h-5 w-5" />
									{/if}
								</button>
							</div>
							<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
								Mínimo 6 caracteres
							</p>
						</div>

						<!-- Confirm password -->
						<div>
							<label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Confirmar nueva contraseña
							</label>
							<input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								placeholder="••••••••"
								class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none"
							/>
						</div>

						<!-- Error message -->
						{#if passwordError}
							<p class="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
						{/if}

						<!-- Buttons -->
						<div class="flex gap-3">
							<button
								type="button"
								onclick={() => { showPasswordForm = false; passwordError = ''; newPassword = ''; confirmPassword = ''; }}
								class="flex-1 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
							>
								Cancelar
							</button>
							<Button onclick={handleChangePassword} disabled={changingPassword} class="flex-1">
								{#if changingPassword}
									<Loader2 class="h-4 w-4 mr-2 animate-spin" />
									Cambiando...
								{:else}
									Cambiar contraseña
								{/if}
							</Button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Link to mi-negocio if provider -->
			{#if $user?.is_mibarrio_provider}
				<div class="mt-6 text-center">
					<a href="/mi-negocio" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
						Ir a Mi negocio →
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>
