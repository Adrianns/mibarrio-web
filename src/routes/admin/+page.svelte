<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { ClipboardList, Users, Store, AlertCircle } from 'lucide-svelte';

	interface Stats {
		pendingClaims: number;
		totalProviders: number;
		unclaimedProviders: number;
		totalUsers: number;
	}

	let stats = $state<Stats | null>(null);
	let loading = $state(true);

	async function fetchStats() {
		loading = true;

		const [claimsRes, providersRes, unclaimedRes, usersRes] = await Promise.all([
			supabase.from('mb_claim_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
			supabase.from('mb_providers').select('id', { count: 'exact', head: true }).eq('is_active', true),
			supabase.from('mb_providers').select('id', { count: 'exact', head: true }).eq('is_claimed', false),
			supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true)
		]);

		stats = {
			pendingClaims: claimsRes.count || 0,
			totalProviders: providersRes.count || 0,
			unclaimedProviders: unclaimedRes.count || 0,
			totalUsers: usersRes.count || 0
		};

		loading = false;
	}

	onMount(() => {
		fetchStats();
	});
</script>

<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
	<!-- Pending Claims -->
	<a
		href="/admin/reclamos"
		class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
	>
		<div class="flex items-center gap-4">
			<div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
				<ClipboardList class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
			</div>
			<div>
				<p class="text-sm text-gray-500 dark:text-gray-400">Reclamos pendientes</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">
					{loading ? '...' : stats?.pendingClaims}
				</p>
			</div>
		</div>
		{#if stats && stats.pendingClaims > 0}
			<div class="mt-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
				<AlertCircle class="h-4 w-4" />
				Requiere atención
			</div>
		{/if}
	</a>

	<!-- Total Providers -->
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
		<div class="flex items-center gap-4">
			<div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
				<Store class="h-6 w-6 text-blue-600 dark:text-blue-400" />
			</div>
			<div>
				<p class="text-sm text-gray-500 dark:text-gray-400">Total negocios</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">
					{loading ? '...' : stats?.totalProviders}
				</p>
			</div>
		</div>
	</div>

	<!-- Unclaimed Providers -->
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
		<div class="flex items-center gap-4">
			<div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
				<Store class="h-6 w-6 text-gray-600 dark:text-gray-400" />
			</div>
			<div>
				<p class="text-sm text-gray-500 dark:text-gray-400">Sin reclamar</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">
					{loading ? '...' : stats?.unclaimedProviders}
				</p>
			</div>
		</div>
	</div>

	<!-- Total Users -->
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
		<div class="flex items-center gap-4">
			<div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
				<Users class="h-6 w-6 text-green-600 dark:text-green-400" />
			</div>
			<div>
				<p class="text-sm text-gray-500 dark:text-gray-400">Usuarios</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">
					{loading ? '...' : stats?.totalUsers}
				</p>
			</div>
		</div>
	</div>
</div>

<div class="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
	<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones rápidas</h2>
	<div class="flex flex-wrap gap-4">
		<a
			href="/admin/reclamos"
			class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
		>
			Revisar reclamos
		</a>
		<a
			href="/directorio"
			class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
		>
			Ver directorio
		</a>
	</div>
</div>
