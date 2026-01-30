<script lang="ts">
	import { auth, user, isLoading, isInitialized } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Loader2, Shield, LayoutDashboard, ClipboardList } from 'lucide-svelte';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();

	let checking = $state(true);

	onMount(() => {
		auth.initialize();

		const unsubscribe = auth.subscribe((state) => {
			if (state.initialized && !state.loading) {
				if (!state.user) {
					goto('/auth/login?redirect=/admin');
				} else if (!state.user.is_admin) {
					goto('/');
				} else {
					checking = false;
				}
			}
		});

		return unsubscribe;
	});

	const navItems = [
		{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
		{ label: 'Reclamos', href: '/admin/reclamos', icon: ClipboardList }
	];
</script>

{#if checking}
	<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
		<div class="text-center">
			<Loader2 class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
			<p class="text-gray-600 dark:text-gray-400">Verificando acceso...</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
		<Header items={[{ label: 'Admin', href: '/admin' }]} />

		<div class="container py-8">
			<div class="flex items-center gap-2 mb-6">
				<Shield class="h-6 w-6 text-primary-600" />
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
			</div>

			<!-- Admin navigation -->
			<nav class="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					>
						<item.icon class="h-4 w-4" />
						{item.label}
					</a>
				{/each}
			</nav>

			{@render children()}
		</div>
	</div>
{/if}
