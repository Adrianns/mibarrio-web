<script lang="ts">
	import { goto } from '$app/navigation';
	import { Menu, X, ChevronDown, Store, LogOut } from 'lucide-svelte';
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

	let mobileMenuOpen = $state(false);
	let dropdownOpen = $state(false);

	function toggleMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMenu() {
		mobileMenuOpen = false;
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function closeDropdown() {
		dropdownOpen = false;
	}

	async function handleLogout() {
		await auth.logout();
		closeDropdown();
		closeMenu();
		goto('/');
	}

	const headerClass = $derived(
		variant === 'transparent'
			? 'bg-transparent'
			: 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'
	);
</script>

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
											onclick={() => handleLogout()}
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

			<!-- Mobile: Hamburger -->
			<div class="flex items-center md:hidden">
				<button
					onclick={toggleMenu}
					class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg"
					aria-label="Abrir menu"
				>
					{#if mobileMenuOpen}
						<X class="h-6 w-6" />
					{:else}
						<Menu class="h-6 w-6" />
					{/if}
				</button>
			</div>
		</nav>
	</div>

	<!-- Mobile Menu Overlay -->
	{#if mobileMenuOpen}
		<button
			class="fixed inset-0 bg-black/50 z-40 md:hidden"
			onclick={closeMenu}
			aria-label="Cerrar menu"
		></button>
	{/if}

	<!-- Mobile Menu Drawer -->
	<div
		class="fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden {mobileMenuOpen
			? 'translate-x-0'
			: 'translate-x-full'}"
	>
		<div class="flex flex-col h-full">
			<!-- Drawer Header -->
			<div class="flex items-center justify-between p-4">
				<span class="flex items-center gap-2 text-lg font-bold text-primary-600">
					<svg width="22" height="16" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<!-- Sun -->
						<circle cx="5" cy="6.5" r="3" fill="#FACC15"/>
						<!-- Stripes -->
						<rect x="11" y="2" width="15" height="3" rx="1.5" fill="currentColor"/>
						<rect x="11" y="8" width="15" height="3" rx="1.5" fill="currentColor"/>
						<rect x="0" y="14" width="26" height="3" rx="1.5" fill="currentColor"/>
					</svg>
					{APP_NAME}
				</span>
				<button
					onclick={closeMenu}
					class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
					aria-label="Cerrar menu"
				>
					<X class="h-6 w-6" />
				</button>
			</div>

			<!-- Drawer Content -->
			<div class="flex-1 overflow-y-auto py-4">
				{#if showAuthLinks && $isAuthenticated}
					<div class="px-4 py-3 mb-2 bg-primary-50 dark:bg-primary-900/30">
						<p class="text-sm text-gray-600 dark:text-gray-400">Hola,</p>
						<p class="font-semibold text-gray-900 dark:text-white">{$user?.full_name}</p>
					</div>
				{/if}

				<nav class="space-y-1 px-2">
					{#each items as item}
						<a
							href={item.href}
							onclick={closeMenu}
							class="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg {item.highlight
								? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
								: ''}"
						>
							{item.label}
						</a>
					{/each}

					{#if showAuthLinks}
						{#if $isAuthenticated}
							<a
								href={miNegocioHref}
								onclick={closeMenu}
								class="flex items-center gap-3 px-4 py-3 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg"
							>
								<Store class="h-5 w-5" />
								Mi negocio
							</a>
							<button
								type="button"
								onclick={() => handleLogout()}
								class="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
							>
								<LogOut class="h-5 w-5" />
								Cerrar sesión
							</button>
						{:else}
							<a
								href="/auth/login?redirect=/registrar-negocio"
								onclick={closeMenu}
								class="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
							>
								Ingresar
							</a>
							<a
								href="/auth/login?redirect=/registrar-negocio"
								onclick={closeMenu}
								class="flex items-center px-4 py-3 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg"
							>
								Ofrecer servicios
							</a>
						{/if}
					{/if}
				</nav>
			</div>
		</div>
	</div>
</header>
