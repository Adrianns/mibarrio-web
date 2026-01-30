<script lang="ts">
	import { goto } from '$app/navigation';
	import { ChevronDown, Store, LogOut, User } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { APP_NAME } from '$lib/config';
	import { auth, isAuthenticated, user, hasMibarrioProvider, provider } from '$lib/stores/auth';

	// Compute the "Mi negocio" link based on whether the user has a provider
	const miNegocioHref = $derived(
		$hasMibarrioProvider && $provider ? '/mi-negocio' : '/registrar-negocio'
	);

	interface NavItem {
		label: string;
		href: string;
		highlight?: boolean;
	}

	let {
		items = [] as NavItem[],
		showAuthLinks = true,
		variant = 'default' as 'default' | 'transparent'
	} = $props();

	let dropdownOpen = $state(false);

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function closeDropdown() {
		dropdownOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && dropdownOpen) {
			closeDropdown();
		}
	}

	async function handleLogout() {
		try {
			await auth.logout();
			closeDropdown();
			goto('/');
		} catch (err) {
			console.error('Logout error:', err);
		}
	}

	const headerClass = $derived(
		variant === 'transparent'
			? 'bg-transparent'
			: 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'
	);
</script>

<svelte:window onkeydown={handleKeydown} />

<header class="{headerClass} relative z-50">
	<div class="container py-4">
		<nav class="flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 text-2xl font-bold text-primary-600">
				<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<!-- Sun -->
					<circle cx="5" cy="6.5" r="3" fill="#FACC15"/>
					<!-- Stripes -->
					<rect x="11" y="2" width="15" height="3" rx="1.5" fill="currentColor"/>
					<rect x="11" y="8" width="15" height="3" rx="1.5" fill="currentColor"/>
					<rect x="0" y="14" width="26" height="3" rx="1.5" fill="currentColor"/>
				</svg>
				{APP_NAME}
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center gap-4">
				{#each items as item}
					{#if item.highlight}
						<Button href={item.href}>{item.label}</Button>
					{:else}
						<a href={item.href} class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">{item.label}</a>
					{/if}
				{/each}

				{#if showAuthLinks}
					{#if $isAuthenticated}
						<!-- User Dropdown -->
						<div class="relative">
							<button
								onclick={toggleDropdown}
								class="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
							>
								<div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
									<span class="text-sm font-medium text-primary-600 dark:text-primary-400">
										{$user?.full_name?.charAt(0).toUpperCase()}
									</span>
								</div>
								<span class="font-medium">{$user?.full_name?.split(' ')[0]}</span>
								<ChevronDown class="h-4 w-4 transition-transform {dropdownOpen ? 'rotate-180' : ''}" />
							</button>

							{#if dropdownOpen}
								<!-- Dropdown Backdrop -->
								<button
									class="fixed inset-0 z-40"
									onclick={closeDropdown}
									aria-label="Cerrar menu"
								></button>

								<!-- Dropdown Menu -->
								<div class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
									<div class="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
										<p class="text-sm text-gray-500 dark:text-gray-400">Conectado como</p>
										<p class="font-medium text-gray-900 dark:text-white truncate">{$user?.email}</p>
									</div>

									<div class="py-1">
										<a
											href="/perfil"
											onclick={closeDropdown}
											class="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
										>
											<User class="h-4 w-4" />
											Mi perfil
										</a>
										<a
											href={miNegocioHref}
											onclick={closeDropdown}
											class="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
										>
											<Store class="h-4 w-4" />
											Mi negocio
										</a>
									</div>

									<div class="border-t border-gray-100 dark:border-gray-700 py-1">
										<button
											type="button"
											onclick={handleLogout}
											class="flex items-center gap-3 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
										>
											<LogOut class="h-4 w-4" />
											Cerrar sesión
										</button>
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<a href="/auth/login" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Ingresar</a>
						<Button href="/auth/login?redirect=/registrar-negocio">Ofrecer Servicios</Button>
					{/if}
				{/if}
			</div>
		</nav>
	</div>
</header>
