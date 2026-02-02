<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { user as currentUser } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';
	import { Button } from '$lib/components/ui/button';
	import {
		Loader2,
		Search,
		RefreshCw,
		Shield,
		ShieldOff,
		UserCheck,
		UserX,
		Store,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';

	interface User {
		id: string;
		email: string;
		full_name: string | null;
		role: string | null;
		is_active: boolean;
		is_admin: boolean;
		is_mibarrio_provider: boolean;
		created_at: string;
	}

	let users = $state<User[]>([]);
	let loading = $state(true);
	let totalCount = $state(0);
	let processing = $state<string | null>(null);

	// Filters
	let searchQuery = $state('');
	let filterActive = $state<'all' | 'active' | 'inactive'>('all');
	let filterAdmin = $state<'all' | 'admin' | 'nonadmin'>('all');
	let filterProvider = $state<'all' | 'provider' | 'nonprovider'>('all');

	// Pagination
	let page = $state(0);
	let pageSize = 20;

	async function fetchUsers() {
		loading = true;

		let query = supabase
			.from('profiles')
			.select('*', { count: 'exact' })
			.order('created_at', { ascending: false })
			.range(page * pageSize, (page + 1) * pageSize - 1);

		// Apply filters
		if (searchQuery.trim()) {
			query = query.or(`email.ilike.%${searchQuery.trim()}%,full_name.ilike.%${searchQuery.trim()}%`);
		}

		if (filterActive === 'active') {
			query = query.eq('is_active', true);
		} else if (filterActive === 'inactive') {
			query = query.eq('is_active', false);
		}

		if (filterAdmin === 'admin') {
			query = query.eq('is_admin', true);
		} else if (filterAdmin === 'nonadmin') {
			query = query.eq('is_admin', false);
		}

		if (filterProvider === 'provider') {
			query = query.eq('is_mibarrio_provider', true);
		} else if (filterProvider === 'nonprovider') {
			query = query.eq('is_mibarrio_provider', false);
		}

		const { data, error, count } = await query;

		if (error) {
			console.error('Error fetching users:', error);
			toast.error('Error al cargar usuarios');
		} else {
			users = data || [];
			totalCount = count || 0;
		}

		loading = false;
	}

	async function toggleAdmin(user: User) {
		// Prevent removing own admin
		if (user.id === $currentUser?.id && user.is_admin) {
			toast.error('No puedes quitarte tus propios permisos de admin');
			return;
		}

		processing = user.id;

		const { error } = await supabase
			.from('profiles')
			.update({ is_admin: !user.is_admin })
			.eq('id', user.id);

		processing = null;

		if (error) {
			console.error('Error updating user:', error);
			toast.error('Error al actualizar');
			return;
		}

		toast.success(user.is_admin ? 'Permisos de admin removidos' : 'Usuario promovido a admin');
		fetchUsers();
	}

	async function toggleActive(user: User) {
		// Prevent deactivating self
		if (user.id === $currentUser?.id) {
			toast.error('No puedes desactivar tu propia cuenta');
			return;
		}

		processing = user.id;

		const { error } = await supabase
			.from('profiles')
			.update({ is_active: !user.is_active })
			.eq('id', user.id);

		processing = null;

		if (error) {
			console.error('Error updating user:', error);
			toast.error('Error al actualizar');
			return;
		}

		toast.success(user.is_active ? 'Usuario desactivado' : 'Usuario activado');
		fetchUsers();
	}

	function handleSearch() {
		page = 0;
		fetchUsers();
	}

	function handleFilterChange() {
		page = 0;
		fetchUsers();
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('es-UY', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	onMount(() => {
		fetchUsers();
	});

	const totalPages = $derived(Math.ceil(totalCount / pageSize));
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Usuarios</h2>
		<Button variant="outline" onclick={() => fetchUsers()}>
			<RefreshCw class="h-4 w-4 mr-2" />
			Actualizar
		</Button>
	</div>

	<!-- Filters -->
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
		<div class="flex flex-wrap gap-4">
			<!-- Search -->
			<div class="flex-1 min-w-64">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
					<input
						type="text"
						bind:value={searchQuery}
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						placeholder="Buscar por email o nombre..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
					/>
				</div>
			</div>

			<!-- Filter: Active -->
			<select
				bind:value={filterActive}
				onchange={handleFilterChange}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
			>
				<option value="all">Estado</option>
				<option value="active">Activos</option>
				<option value="inactive">Inactivos</option>
			</select>

			<!-- Filter: Admin -->
			<select
				bind:value={filterAdmin}
				onchange={handleFilterChange}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
			>
				<option value="all">Rol</option>
				<option value="admin">Admins</option>
				<option value="nonadmin">No admins</option>
			</select>

			<!-- Filter: Provider -->
			<select
				bind:value={filterProvider}
				onchange={handleFilterChange}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
			>
				<option value="all">Tipo</option>
				<option value="provider">Proveedores</option>
				<option value="nonprovider">No proveedores</option>
			</select>

			<Button onclick={handleSearch}>
				<Search class="h-4 w-4 mr-2" />
				Buscar
			</Button>
		</div>
	</div>

	<!-- Results count -->
	<p class="text-sm text-gray-500 dark:text-gray-400">
		{totalCount} usuarios encontrados
	</p>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
		</div>
	{:else if users.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
			<p class="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
		</div>
	{:else}
		<!-- Table -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 dark:bg-gray-900/50">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Usuario
							</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Rol
							</th>
							<th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Estado
							</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Creado
							</th>
							<th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each users as user (user.id)}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-900/30">
								<td class="px-4 py-3">
									<div>
										<p class="font-medium text-gray-900 dark:text-white">
											{user.full_name || 'Sin nombre'}
										</p>
										<p class="text-sm text-gray-500 dark:text-gray-400">
											{user.email}
										</p>
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-1">
										{#if user.is_admin}
											<span class="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs flex items-center gap-1">
												<Shield class="h-3 w-3" />
												Admin
											</span>
										{/if}
										{#if user.is_mibarrio_provider}
											<span class="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs flex items-center gap-1">
												<Store class="h-3 w-3" />
												Proveedor
											</span>
										{/if}
										{#if !user.is_admin && !user.is_mibarrio_provider}
											<span class="text-gray-400 text-sm">Usuario</span>
										{/if}
									</div>
								</td>
								<td class="px-4 py-3 text-center">
									{#if user.is_active}
										<span class="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs">
											Activo
										</span>
									{:else}
										<span class="px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-xs">
											Inactivo
										</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
									{formatDate(user.created_at)}
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center justify-end gap-2">
										<button
											onclick={() => toggleAdmin(user)}
											disabled={processing === user.id || user.id === $currentUser?.id}
											class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
											class:text-purple-600={!user.is_admin}
											class:hover:text-purple-700={!user.is_admin}
											class:text-gray-500={user.is_admin}
											class:hover:text-gray-600={user.is_admin}
											title={user.is_admin ? 'Quitar admin' : 'Hacer admin'}
										>
											{#if processing === user.id}
												<Loader2 class="h-4 w-4 animate-spin" />
											{:else if user.is_admin}
												<ShieldOff class="h-4 w-4" />
											{:else}
												<Shield class="h-4 w-4" />
											{/if}
										</button>
										<button
											onclick={() => toggleActive(user)}
											disabled={processing === user.id || user.id === $currentUser?.id}
											class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
											class:text-green-600={!user.is_active}
											class:hover:text-green-700={!user.is_active}
											class:text-red-500={user.is_active}
											class:hover:text-red-600={user.is_active}
											title={user.is_active ? 'Desactivar' : 'Activar'}
										>
											{#if processing === user.id}
												<Loader2 class="h-4 w-4 animate-spin" />
											{:else if user.is_active}
												<UserX class="h-4 w-4" />
											{:else}
												<UserCheck class="h-4 w-4" />
											{/if}
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-between">
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Pagina {page + 1} de {totalPages}
				</p>
				<div class="flex gap-2">
					<Button
						variant="outline"
						onclick={() => { page--; fetchUsers(); }}
						disabled={page === 0}
					>
						<ChevronLeft class="h-4 w-4" />
						Anterior
					</Button>
					<Button
						variant="outline"
						onclick={() => { page++; fetchUsers(); }}
						disabled={page >= totalPages - 1}
					>
						Siguiente
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>
