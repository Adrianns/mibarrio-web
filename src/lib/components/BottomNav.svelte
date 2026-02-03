<script lang="ts">
	import { page } from '$app/stores';
	import { Home, Search, Store, User } from 'lucide-svelte';
	import { isAuthenticated } from '$lib/stores/auth';

	const navItems = [
		{ label: 'Inicio', href: '/', icon: Home, matchPaths: ['/'] },
		{ label: 'Directorio', href: '/directorio', icon: Search, matchPaths: ['/directorio'] },
		{ label: 'Mi Negocio', href: '/auth/login', authHref: '/mi-negocio', icon: Store, matchPaths: ['/mi-negocio', '/auth/login'] },
		{ label: 'Mi Perfil', href: '/perfil', icon: User, matchPaths: ['/perfil'] }
	];

	function isActive(matchPaths: string[], currentPath: string): boolean {
		return matchPaths.some(path =>
			path === '/' ? currentPath === '/' : currentPath.startsWith(path)
		);
	}
</script>

<nav class="fixed bottom-0 left-0 right-0 z-[1100] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden pb-[env(safe-area-inset-bottom)]">
	<div class="flex items-center justify-around h-16">
		{#each navItems as item (item.href)}
			{@const href = item.authHref && $isAuthenticated ? item.authHref : item.href}
			{@const active = isActive(item.matchPaths, $page.url.pathname)}
			<a
				{href}
				class="flex flex-col items-center justify-center flex-1 h-full transition-colors {active
					? 'text-primary-600 dark:text-primary-400'
					: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
			>
				<item.icon class="h-6 w-6" />
				<span class="text-sm mt-0.5 font-medium">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
