<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { toast } from '$lib/stores/toast';
	import { Button } from '$lib/components/ui/button';
	import {
		Loader2,
		Search,
		RefreshCw,
		ExternalLink,
		Eye,
		MousePointer,
		CheckCircle,
		XCircle,
		Shield,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';

	interface Provider {
		id: string;
		business_name: string;
		department: string;
		neighborhood: string | null;
		is_active: boolean;
		is_verified: boolean;
		is_claimed: boolean;
		view_count: number;
		contact_click_count: number;
		created_at: string;
	}

	let providers = $state<Provider[]>([]);
	let loading = $state(true);
	let totalCount = $state(0);
	let processing = $state<string | null>(null);

	// Filters
	let searchQuery = $state('');
	let filterActive = $state<'all' | 'active' | 'inactive'>('all');
	let filterVerified = $state<'all' | 'verified' | 'unverified'>('all');
	let filterClaimed = $state<'all' | 'claimed' | 'unclaimed'>('all');

	// Pagination
	let page = $state(0);
	let pageSize = 20;

	async function fetchProviders() {
		loading = true;

		let query = supabase
			.from('mb_providers')
			.select(`
				id,
				business_name,
				department,
				neighborhood,
				is_active,
				is_verified,
				is_claimed,
				view_count,
				contact_click_count,
				created_at
			`, { count: 'exact' })
			.order('created_at', { ascending: false })
			.range(page * pageSize, (page + 1) * pageSize - 1);

		// Apply filters
		if (searchQuery.trim()) {
			query = query.ilike('business_name', `%${searchQuery.trim()}%`);
		}

		if (filterActive === 'active') {
			query = query.eq('is_active', true);
		} else if (filterActive === 'inactive') {
			query = query.eq('is_active', false);
		}

		if (filterVerified === 'verified') {
			query = query.eq('is_verified', true);
		} else if (filterVerified === 'unverified') {
			query = query.eq('is_verified', false);
		}

		if (filterClaimed === 'claimed') {
			query = query.eq('is_claimed', true);
		} else if (filterClaimed === 'unclaimed') {
			query = query.eq('is_claimed', false);
		}

		const { data, error, count } = await query;

		if (error) {
			console.error('Error fetching providers:', error);
			toast.error('Error al cargar proveedores');
		} else {
			providers = data || [];
			totalCount = count || 0;
		}

		loading = false;
	}

	async function toggleActive(provider: Provider) {
		processing = provider.id;

		const { error } = await supabase
			.from('mb_providers')
			.update({ is_active: !provider.is_active })
			.eq('id', provider.id);

		processing = null;

		if (error) {
			console.error('Error updating provider:', error);
			toast.error('Error al actualizar');
			return;
		}

		toast.success(provider.is_active ? 'Proveedor desactivado' : 'Proveedor activado');
		fetchProviders();
	}

	async function toggleVerified(provider: Provider) {
		processing = provider.id;

		const { error } = await supabase
			.from('mb_providers')
			.update({ is_verified: !provider.is_verified })
			.eq('id', provider.id);

		processing = null;

		if (error) {
			console.error('Error updating provider:', error);
			toast.error('Error al actualizar');
			return;
		}

		toast.success(provider.is_verified ? 'Verificacion removida' : 'Proveedor verificado');
		fetchProviders();
	}

	function handleSearch() {
		page = 0;
		fetchProviders();
	}

	function handleFilterChange() {
		page = 0;
		fetchProviders();
	}

	onMount(() => {
		fetchProviders();
	});

	const totalPages = $derived(Math.ceil(totalCount / pageSize));
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Proveedores</h2>
		<Button variant="outline" onclick={() => fetchProviders()}>
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
						placeholder="Buscar por nombre..."
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
				<option value="all">Todos</option>
				<option value="active">Activos</option>
				<option value="inactive">Inactivos</option>
			</select>

			<!-- Filter: Verified -->
			<select
				bind:value={filterVerified}
				onchange={handleFilterChange}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
			>
				<option value="all">Verificacion</option>
				<option value="verified">Verificados</option>
				<option value="unverified">No verificados</option>
			</select>

			<!-- Filter: Claimed -->
			<select
				bind:value={filterClaimed}
				onchange={handleFilterChange}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
			>
				<option value="all">Reclamo</option>
				<option value="claimed">Reclamados</option>
				<option value="unclaimed">Sin reclamar</option>
			</select>

			<Button onclick={handleSearch}>
				<Search class="h-4 w-4 mr-2" />
				Buscar
			</Button>
		</div>
	</div>

	<!-- Results count -->
	<p class="text-sm text-gray-500 dark:text-gray-400">
		{totalCount} proveedores encontrados
	</p>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
		</div>
	{:else if providers.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
			<p class="text-gray-500 dark:text-gray-400">No se encontraron proveedores</p>
		</div>
	{:else}
		<!-- Table -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 dark:bg-gray-900/50">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Nombre
							</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Ubicacion
							</th>
							<th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								<Eye class="h-4 w-4 inline" />
							</th>
							<th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								<MousePointer class="h-4 w-4 inline" />
							</th>
							<th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Estado
							</th>
							<th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each providers as provider (provider.id)}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-900/30">
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<span class="font-medium text-gray-900 dark:text-white">
											{provider.business_name}
										</span>
										<a
											href="/directorio/{provider.id}"
											target="_blank"
											class="text-gray-400 hover:text-primary-600"
										>
											<ExternalLink class="h-3 w-3" />
										</a>
									</div>
								</td>
								<td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
									{provider.neighborhood ? `${provider.neighborhood}, ` : ''}{provider.department}
								</td>
								<td class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
									{provider.view_count}
								</td>
								<td class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
									{provider.contact_click_count}
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center justify-center gap-1">
										{#if provider.is_active}
											<span class="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs">
												Activo
											</span>
										{:else}
											<span class="px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-xs">
												Inactivo
											</span>
										{/if}
										{#if provider.is_verified}
											<span class="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
												<Shield class="h-3 w-3 inline" />
											</span>
										{/if}
										{#if provider.is_claimed}
											<span class="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
												Reclamado
											</span>
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center justify-end gap-2">
										<button
											onclick={() => toggleVerified(provider)}
											disabled={processing === provider.id}
											class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 disabled:opacity-50"
											title={provider.is_verified ? 'Quitar verificacion' : 'Verificar'}
										>
											{#if processing === provider.id}
												<Loader2 class="h-4 w-4 animate-spin" />
											{:else}
												<Shield class="h-4 w-4" />
											{/if}
										</button>
										<button
											onclick={() => toggleActive(provider)}
											disabled={processing === provider.id}
											class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
											class:text-green-600={!provider.is_active}
											class:hover:text-green-700={!provider.is_active}
											class:text-red-500={provider.is_active}
											class:hover:text-red-600={provider.is_active}
											title={provider.is_active ? 'Desactivar' : 'Activar'}
										>
											{#if processing === provider.id}
												<Loader2 class="h-4 w-4 animate-spin" />
											{:else if provider.is_active}
												<XCircle class="h-4 w-4" />
											{:else}
												<CheckCircle class="h-4 w-4" />
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
						onclick={() => { page--; fetchProviders(); }}
						disabled={page === 0}
					>
						<ChevronLeft class="h-4 w-4" />
						Anterior
					</Button>
					<Button
						variant="outline"
						onclick={() => { page++; fetchProviders(); }}
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
