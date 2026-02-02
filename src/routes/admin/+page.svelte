<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { ClipboardList, Users, Store, AlertCircle, Eye, MousePointer, TrendingUp, MapPin } from 'lucide-svelte';

	interface Stats {
		pendingClaims: number;
		totalProviders: number;
		unclaimedProviders: number;
		totalUsers: number;
		totalViews: number;
		totalClicks: number;
	}

	interface TopProvider {
		id: string;
		business_name: string;
		department: string;
		view_count: number;
		contact_click_count: number;
	}

	interface DepartmentStat {
		department: string;
		count: number;
	}

	let stats = $state<Stats | null>(null);
	let topByViews = $state<TopProvider[]>([]);
	let topByClicks = $state<TopProvider[]>([]);
	let departmentStats = $state<DepartmentStat[]>([]);
	let loading = $state(true);

	async function fetchStats() {
		loading = true;

		const [claimsRes, providersRes, unclaimedRes, usersRes] = await Promise.all([
			supabase.from('mb_claim_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
			supabase.from('mb_providers').select('id', { count: 'exact', head: true }).eq('is_active', true),
			supabase.from('mb_providers').select('id', { count: 'exact', head: true }).eq('is_claimed', false),
			supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true)
		]);

		// Get view and click totals
		const { data: totalsData } = await supabase
			.from('mb_providers')
			.select('view_count, contact_click_count')
			.eq('is_active', true);

		const totalViews = totalsData?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
		const totalClicks = totalsData?.reduce((sum, p) => sum + (p.contact_click_count || 0), 0) || 0;

		stats = {
			pendingClaims: claimsRes.count || 0,
			totalProviders: providersRes.count || 0,
			unclaimedProviders: unclaimedRes.count || 0,
			totalUsers: usersRes.count || 0,
			totalViews,
			totalClicks
		};

		loading = false;
	}

	async function fetchTopProviders() {
		const [viewsRes, clicksRes] = await Promise.all([
			supabase
				.from('mb_providers')
				.select('id, business_name, department, view_count, contact_click_count')
				.eq('is_active', true)
				.order('view_count', { ascending: false })
				.limit(5),
			supabase
				.from('mb_providers')
				.select('id, business_name, department, view_count, contact_click_count')
				.eq('is_active', true)
				.order('contact_click_count', { ascending: false })
				.limit(5)
		]);

		topByViews = viewsRes.data || [];
		topByClicks = clicksRes.data || [];
	}

	async function fetchDepartmentStats() {
		const { data } = await supabase
			.from('mb_providers')
			.select('department')
			.eq('is_active', true);

		if (data) {
			const counts: Record<string, number> = {};
			data.forEach(p => {
				counts[p.department] = (counts[p.department] || 0) + 1;
			});

			departmentStats = Object.entries(counts)
				.map(([department, count]) => ({ department, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 8);
		}
	}

	onMount(() => {
		fetchStats();
		fetchTopProviders();
		fetchDepartmentStats();
	});

	const maxDepartmentCount = $derived(Math.max(...departmentStats.map(d => d.count), 1));
</script>

<div class="space-y-8">
	<!-- Main Stats -->
	<div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
		<!-- Pending Claims -->
		<a
			href="/admin/reclamos"
			class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
		>
			<div class="flex items-center gap-3">
				<div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
					<ClipboardList class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
				</div>
				<div>
					<p class="text-xs text-gray-500 dark:text-gray-400">Reclamos pendientes</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">
						{loading ? '...' : stats?.pendingClaims}
					</p>
				</div>
			</div>
			{#if stats && stats.pendingClaims > 0}
				<div class="mt-2 flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs">
					<AlertCircle class="h-3 w-3" />
					Requiere atencion
				</div>
			{/if}
		</a>

		<!-- Total Providers -->
		<a
			href="/admin/proveedores"
			class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
		>
			<div class="flex items-center gap-3">
				<div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
					<Store class="h-5 w-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<p class="text-xs text-gray-500 dark:text-gray-400">Total negocios</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">
						{loading ? '...' : stats?.totalProviders}
					</p>
				</div>
			</div>
		</a>

		<!-- Unclaimed Providers -->
		<a
			href="/admin/proveedores?filter=unclaimed"
			class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
		>
			<div class="flex items-center gap-3">
				<div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
					<Store class="h-5 w-5 text-gray-600 dark:text-gray-400" />
				</div>
				<div>
					<p class="text-xs text-gray-500 dark:text-gray-400">Sin reclamar</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">
						{loading ? '...' : stats?.unclaimedProviders}
					</p>
				</div>
			</div>
		</a>

		<!-- Total Users -->
		<a
			href="/admin/usuarios"
			class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
		>
			<div class="flex items-center gap-3">
				<div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
					<Users class="h-5 w-5 text-green-600 dark:text-green-400" />
				</div>
				<div>
					<p class="text-xs text-gray-500 dark:text-gray-400">Usuarios</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">
						{loading ? '...' : stats?.totalUsers}
					</p>
				</div>
			</div>
		</a>

		<!-- Total Views -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
			<div class="flex items-center gap-3">
				<div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
					<Eye class="h-5 w-5 text-purple-600 dark:text-purple-400" />
				</div>
				<div>
					<p class="text-xs text-gray-500 dark:text-gray-400">Total vistas</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">
						{loading ? '...' : stats?.totalViews.toLocaleString()}
					</p>
				</div>
			</div>
		</div>

		<!-- Total Clicks -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
			<div class="flex items-center gap-3">
				<div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
					<MousePointer class="h-5 w-5 text-orange-600 dark:text-orange-400" />
				</div>
				<div>
					<p class="text-xs text-gray-500 dark:text-gray-400">Total clicks</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">
						{loading ? '...' : stats?.totalClicks.toLocaleString()}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Top Providers -->
	<div class="grid lg:grid-cols-2 gap-6">
		<!-- Top by Views -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
			<div class="flex items-center gap-2 mb-4">
				<Eye class="h-5 w-5 text-purple-600 dark:text-purple-400" />
				<h3 class="font-semibold text-gray-900 dark:text-white">Top 5 - Mas vistos</h3>
			</div>
			{#if topByViews.length === 0}
				<p class="text-sm text-gray-500 dark:text-gray-400">No hay datos</p>
			{:else}
				<div class="space-y-3">
					{#each topByViews as provider, i (provider.id)}
						<a
							href="/directorio/{provider.id}"
							class="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30"
						>
							<span class="w-6 h-6 flex items-center justify-center text-sm font-medium text-gray-400">
								{i + 1}
							</span>
							<div class="flex-1 min-w-0">
								<p class="font-medium text-gray-900 dark:text-white truncate">
									{provider.business_name}
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">{provider.department}</p>
							</div>
							<div class="text-right">
								<p class="font-semibold text-purple-600 dark:text-purple-400">
									{provider.view_count.toLocaleString()}
								</p>
								<p class="text-xs text-gray-400">vistas</p>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Top by Clicks -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
			<div class="flex items-center gap-2 mb-4">
				<MousePointer class="h-5 w-5 text-orange-600 dark:text-orange-400" />
				<h3 class="font-semibold text-gray-900 dark:text-white">Top 5 - Mas contactados</h3>
			</div>
			{#if topByClicks.length === 0}
				<p class="text-sm text-gray-500 dark:text-gray-400">No hay datos</p>
			{:else}
				<div class="space-y-3">
					{#each topByClicks as provider, i (provider.id)}
						<a
							href="/directorio/{provider.id}"
							class="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30"
						>
							<span class="w-6 h-6 flex items-center justify-center text-sm font-medium text-gray-400">
								{i + 1}
							</span>
							<div class="flex-1 min-w-0">
								<p class="font-medium text-gray-900 dark:text-white truncate">
									{provider.business_name}
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">{provider.department}</p>
							</div>
							<div class="text-right">
								<p class="font-semibold text-orange-600 dark:text-orange-400">
									{provider.contact_click_count.toLocaleString()}
								</p>
								<p class="text-xs text-gray-400">clicks</p>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Department Distribution -->
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
		<div class="flex items-center gap-2 mb-4">
			<MapPin class="h-5 w-5 text-blue-600 dark:text-blue-400" />
			<h3 class="font-semibold text-gray-900 dark:text-white">Distribucion por departamento</h3>
		</div>
		{#if departmentStats.length === 0}
			<p class="text-sm text-gray-500 dark:text-gray-400">No hay datos</p>
		{:else}
			<div class="space-y-3">
				{#each departmentStats as dept (dept.department)}
					<div class="flex items-center gap-4">
						<span class="w-28 text-sm text-gray-600 dark:text-gray-400 truncate">
							{dept.department}
						</span>
						<div class="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
							<div
								class="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-500"
								style="width: {(dept.count / maxDepartmentCount) * 100}%"
							></div>
						</div>
						<span class="w-12 text-right text-sm font-medium text-gray-900 dark:text-white">
							{dept.count}
						</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Quick Actions -->
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
		<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones rapidas</h2>
		<div class="flex flex-wrap gap-4">
			<a
				href="/admin/reclamos"
				class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
			>
				Revisar reclamos
			</a>
			<a
				href="/admin/proveedores"
				class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
			>
				Ver proveedores
			</a>
			<a
				href="/admin/usuarios"
				class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
			>
				Gestionar usuarios
			</a>
			<a
				href="/directorio"
				class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
			>
				Ver directorio
			</a>
		</div>
	</div>
</div>
