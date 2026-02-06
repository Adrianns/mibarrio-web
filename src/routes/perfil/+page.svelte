<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
	import { toast } from '$lib/stores/toast';
	import { auth, user, isAuthenticated } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import {
		Loader2,
		User,
		Lock,
		Eye,
		EyeOff,
		Camera,
		Shield,
		Check,
		ArrowLeft,
		LogOut
	} from 'lucide-svelte';

	let loading = $state(true);
	let saving = $state(false);
	let changingPassword = $state(false);

	// Form state
	let fullName = $state('');
	let email = $state('');

	// Password form
	let newPassword = $state('');
	let confirmPassword = $state('');
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	// Password errors and success
	let passwordError = $state('');
	let passwordSuccess = $state(false);

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
			const { error: updateError } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (updateError) {
				passwordError = 'Error al cambiar la contraseña: ' + updateError.message;
				changingPassword = false;
				return;
			}

			passwordSuccess = true;
			newPassword = '';
			confirmPassword = '';
			toast.success('Contraseña actualizada correctamente');
		} catch (err) {
			console.error('Password change error:', err);
			passwordError = 'Error al cambiar la contraseña';
		}

		changingPassword = false;
	}

	async function handleLogout() {
		try {
			await auth.logout();
			goto('/');
		} catch (err) {
			console.error('Logout error:', err);
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

<div class="min-h-screen bg-[#0F172A]">
	<!-- Desktop Header -->
	<div class="hidden md:block">
		<Header items={[{ label: 'Directorio', href: '/directorio/mapa' }]} />
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Loader2 class="h-8 w-8 animate-spin text-blue-500" />
			<span class="ml-3 text-slate-400">Cargando...</span>
		</div>
	{:else}
		<!-- ==================== MOBILE ==================== -->
		<div class="md:hidden flex flex-col min-h-screen">
			<div class="flex-1 overflow-y-auto pb-24">
				<!-- Mobile Header -->
				<div class="flex items-center justify-between px-6 py-4">
					<div class="flex items-center gap-3">
						<button
							onclick={() => history.back()}
							class="w-10 h-10 rounded-full border border-[#334155] flex items-center justify-center"
						>
							<ArrowLeft class="h-5 w-5 text-white" />
						</button>
						<h1 class="text-xl font-semibold text-white">Mi Perfil</h1>
					</div>
				</div>

				<div class="px-6 space-y-8">
					<!-- Avatar Section -->
					<div class="flex flex-col items-center gap-4">
						<div
							class="w-[120px] h-[120px] rounded-full bg-[#1E293B] flex items-center justify-center"
						>
							<User class="h-12 w-12 text-blue-500" />
						</div>
						<button
							class="flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-[#334155] text-blue-500 text-sm font-medium hover:bg-[#1E293B] transition-colors"
						>
							<Camera class="h-4 w-4" />
							Cambiar foto
						</button>
					</div>

					<!-- Info Section -->
					<div class="space-y-4">
						<p class="text-xs font-semibold text-slate-500 tracking-[1px]">
							INFORMACIÓN DE LA CUENTA
						</p>

						<!-- Name card -->
						<div class="bg-[#1E293B] rounded-2xl p-4 border border-[#334155] space-y-2">
							<label for="m-fullName" class="text-[13px] text-slate-400"
								>Nombre completo</label
							>
							<input
								id="m-fullName"
								type="text"
								bind:value={fullName}
								placeholder="Tu nombre"
								class="w-full bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-slate-600"
							/>
						</div>

						<!-- Email card -->
						<div class="bg-[#1E293B] rounded-2xl p-4 border border-[#334155] space-y-2">
							<p class="text-[13px] text-slate-400">Correo electrónico</p>
							<p class="text-[15px] font-medium text-white">{email}</p>
						</div>

						<!-- Save profile button -->
						<button
							onclick={handleSaveProfile}
							disabled={saving}
							class="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[15px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
						>
							{#if saving}
								<Loader2 class="h-[18px] w-[18px] animate-spin" />
								Guardando...
							{:else}
								<Check class="h-[18px] w-[18px]" />
								Guardar cambios
							{/if}
						</button>
					</div>

					<!-- Security Section -->
					<div class="space-y-4">
						<p class="text-xs font-semibold text-slate-500 tracking-[1px]">SEGURIDAD</p>

						<div class="bg-[#1E293B] rounded-2xl p-4 border border-[#334155] space-y-4">
							<!-- Title -->
							<div class="flex items-center justify-between">
								<p class="text-[15px] font-medium text-white">Cambiar contraseña</p>
								<Lock class="h-[18px] w-[18px] text-slate-500" />
							</div>

							{#if passwordSuccess}
								<div
									class="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
								>
									<p class="text-green-400 text-sm font-medium">
										Contraseña actualizada correctamente
									</p>
								</div>
							{/if}

							<!-- Password inputs -->
							<div class="space-y-3">
								<!-- New password -->
								<div class="space-y-1.5">
									<label
										for="m-newPass"
										class="text-[13px] font-medium text-white"
										>Nueva contraseña</label
									>
									<div class="relative">
										<input
											id="m-newPass"
											type={showNewPassword ? 'text' : 'password'}
											bind:value={newPassword}
											placeholder="Ingresa tu nueva contraseña"
											class="w-full h-11 px-3.5 pr-11 rounded-[10px] bg-[#0F172A] border border-[#334155] text-white text-sm outline-none placeholder:text-slate-500 focus:border-blue-500 transition-colors"
										/>
										<button
											type="button"
											onclick={() => (showNewPassword = !showNewPassword)}
											class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
										>
											{#if showNewPassword}
												<EyeOff class="h-4 w-4" />
											{:else}
												<Eye class="h-4 w-4" />
											{/if}
										</button>
									</div>
								</div>

								<!-- Confirm password -->
								<div class="space-y-1.5">
									<label
										for="m-confirmPass"
										class="text-[13px] font-medium text-white"
										>Confirmar contraseña</label
									>
									<div class="relative">
										<input
											id="m-confirmPass"
											type={showConfirmPassword ? 'text' : 'password'}
											bind:value={confirmPassword}
											placeholder="Confirma tu nueva contraseña"
											class="w-full h-11 px-3.5 pr-11 rounded-[10px] bg-[#0F172A] border border-[#334155] text-white text-sm outline-none placeholder:text-slate-500 focus:border-blue-500 transition-colors"
										/>
										<button
											type="button"
											onclick={() =>
												(showConfirmPassword = !showConfirmPassword)}
											class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
										>
											{#if showConfirmPassword}
												<EyeOff class="h-4 w-4" />
											{:else}
												<Eye class="h-4 w-4" />
											{/if}
										</button>
									</div>
								</div>
							</div>

							{#if passwordError}
								<p class="text-sm text-red-400">{passwordError}</p>
							{/if}

							<!-- Save password button -->
							<button
								onclick={handleChangePassword}
								disabled={changingPassword}
								class="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[15px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
							>
								{#if changingPassword}
									<Loader2 class="h-[18px] w-[18px] animate-spin" />
									Cambiando...
								{:else}
									<Check class="h-[18px] w-[18px]" />
									Guardar cambios
								{/if}
							</button>
						</div>
					</div>

					<!-- Provider link -->
					{#if $user?.is_mibarrio_provider}
						<div class="text-center">
							<a
								href="/mi-negocio"
								class="text-blue-500 hover:text-blue-400 text-sm font-medium"
							>
								Ir a Mi negocio →
							</a>
						</div>
					{/if}

					<!-- Logout -->
					<button
						onclick={handleLogout}
						class="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
					>
						<LogOut class="h-4 w-4" />
						Cerrar sesión
					</button>
				</div>
			</div>
		</div>

		<!-- ==================== DESKTOP ==================== -->
		<div class="hidden md:block">
			<div class="max-w-6xl mx-auto px-12 py-12">
				<!-- Page Header -->
				<div class="mb-10">
					<h1 class="text-[28px] font-semibold text-white tracking-[-0.5px]">
						Mi Perfil
					</h1>
					<p class="text-[15px] text-slate-400 mt-2">
						Administra tu información personal y seguridad
					</p>
				</div>

				<!-- Two Column Layout -->
				<div class="flex gap-6">
					<!-- Left: Profile Card -->
					<div
						class="flex-1 bg-[#1E293B] rounded-2xl p-6 border border-[#334155] space-y-6"
					>
						<!-- Profile header with avatar -->
						<div class="flex items-center gap-5">
							<div
								class="w-[100px] h-[100px] rounded-full bg-[#0F172A] flex items-center justify-center shrink-0"
							>
								<User class="h-10 w-10 text-blue-500" />
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-xl font-semibold text-white truncate">
									{fullName || 'Usuario'}
								</p>
								<p class="text-[15px] text-slate-400 truncate">{email}</p>
							</div>
							<button
								class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-[1.5px] border-[#334155] text-blue-500 text-sm font-medium hover:bg-[#0F172A] transition-colors shrink-0"
							>
								<Camera class="h-4 w-4" />
								Cambiar foto
							</button>
						</div>

						<!-- Divider -->
						<div class="h-px bg-[#334155]"></div>

						<!-- Name field -->
						<div class="space-y-2">
							<label for="d-fullName" class="text-[13px] font-medium text-slate-400"
								>Nombre completo</label
							>
							<input
								id="d-fullName"
								type="text"
								bind:value={fullName}
								placeholder="Tu nombre"
								class="w-full h-11 px-3.5 rounded-[10px] bg-[#0F172A] border border-[#334155] text-[15px] font-medium text-white outline-none placeholder:text-slate-500 focus:border-blue-500 transition-colors"
							/>
						</div>

						<!-- Email display -->
						<div class="space-y-2">
							<p class="text-[13px] font-medium text-slate-400">
								Correo electrónico
							</p>
							<p class="text-[15px] font-medium text-white">{email}</p>
						</div>

						<!-- Save profile -->
						<button
							onclick={handleSaveProfile}
							disabled={saving}
							class="w-full h-11 rounded-[10px] bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
						>
							{#if saving}
								<Loader2 class="h-[18px] w-[18px] animate-spin" />
								Guardando...
							{:else}
								<Check class="h-[18px] w-[18px]" />
								Guardar cambios
							{/if}
						</button>
					</div>

					<!-- Right: Security Card -->
					<div
						class="w-[400px] bg-[#1E293B] rounded-2xl p-6 border border-[#334155] space-y-5 shrink-0"
					>
						<!-- Security header -->
						<div class="flex items-center justify-between">
							<p class="text-lg font-semibold text-white">Cambiar contraseña</p>
							<Shield class="h-5 w-5 text-slate-500" />
						</div>

						{#if passwordSuccess}
							<div
								class="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
							>
								<p class="text-green-400 text-sm font-medium">
									Contraseña actualizada correctamente
								</p>
							</div>
						{/if}

						<!-- Password inputs -->
						<div class="space-y-4">
							<!-- New password -->
							<div class="space-y-1.5">
								<label
									for="d-newPass"
									class="text-[13px] font-medium text-white"
									>Nueva contraseña</label
								>
								<div class="relative">
									<input
										id="d-newPass"
										type={showNewPassword ? 'text' : 'password'}
										bind:value={newPassword}
										placeholder="Ingresa tu nueva contraseña"
										class="w-full h-11 px-3.5 pr-11 rounded-[10px] bg-[#0F172A] border border-[#334155] text-white text-sm outline-none placeholder:text-slate-500 focus:border-blue-500 transition-colors"
									/>
									<button
										type="button"
										onclick={() => (showNewPassword = !showNewPassword)}
										class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
									>
										{#if showNewPassword}
											<EyeOff class="h-4 w-4" />
										{:else}
											<Eye class="h-4 w-4" />
										{/if}
									</button>
								</div>
							</div>

							<!-- Confirm password -->
							<div class="space-y-1.5">
								<label
									for="d-confirmPass"
									class="text-[13px] font-medium text-white"
									>Confirmar contraseña</label
								>
								<div class="relative">
									<input
										id="d-confirmPass"
										type={showConfirmPassword ? 'text' : 'password'}
										bind:value={confirmPassword}
										placeholder="Confirma tu nueva contraseña"
										class="w-full h-11 px-3.5 pr-11 rounded-[10px] bg-[#0F172A] border border-[#334155] text-white text-sm outline-none placeholder:text-slate-500 focus:border-blue-500 transition-colors"
									/>
									<button
										type="button"
										onclick={() =>
											(showConfirmPassword = !showConfirmPassword)}
										class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
									>
										{#if showConfirmPassword}
											<EyeOff class="h-4 w-4" />
										{:else}
											<Eye class="h-4 w-4" />
										{/if}
									</button>
								</div>
							</div>
						</div>

						{#if passwordError}
							<p class="text-sm text-red-400">{passwordError}</p>
						{/if}

						<!-- Save password -->
						<button
							onclick={handleChangePassword}
							disabled={changingPassword}
							class="w-full h-11 rounded-[10px] bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
						>
							{#if changingPassword}
								<Loader2 class="h-[18px] w-[18px] animate-spin" />
								Cambiando...
							{:else}
								<Check class="h-[18px] w-[18px]" />
								Guardar cambios
							{/if}
						</button>
					</div>
				</div>

				<!-- Footer actions -->
				<div class="mt-8 flex items-center justify-between">
					{#if $user?.is_mibarrio_provider}
						<a
							href="/mi-negocio"
							class="text-blue-500 hover:text-blue-400 text-sm font-medium"
						>
							Ir a Mi negocio →
						</a>
					{:else}
						<div></div>
					{/if}
					<button
						onclick={handleLogout}
						class="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
					>
						<LogOut class="h-4 w-4" />
						Cerrar sesión
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
