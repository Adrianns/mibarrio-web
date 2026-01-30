<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { user } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';
	import { Button } from '$lib/components/ui/button';
	import {
		Loader2,
		CheckCircle,
		XCircle,
		ExternalLink,
		User,
		Store,
		Calendar,
		MessageSquare,
		RefreshCw
	} from 'lucide-svelte';

	interface ClaimRequest {
		id: string;
		provider_id: string;
		user_id: string;
		status: 'pending' | 'approved' | 'rejected';
		message: string | null;
		created_at: string;
		provider: {
			id: string;
			business_name: string;
			department: string;
			neighborhood: string | null;
			source: string;
		};
		requester: {
			id: string;
			email: string;
			full_name: string;
		};
	}

	let claims = $state<ClaimRequest[]>([]);
	let loading = $state(true);
	let filter = $state<'pending' | 'all'>('pending');
	let processing = $state<string | null>(null);

	async function fetchClaims() {
		loading = true;

		let query = supabase
			.from('mb_claim_requests')
			.select(`
				id,
				provider_id,
				user_id,
				status,
				message,
				created_at,
				provider:mb_providers!provider_id (
					id,
					business_name,
					department,
					neighborhood,
					source
				),
				requester:profiles!user_id (
					id,
					email,
					full_name
				)
			`)
			.order('created_at', { ascending: false });

		if (filter === 'pending') {
			query = query.eq('status', 'pending');
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error fetching claims:', error);
			toast.error('Error al cargar reclamos');
		} else {
			claims = (data as unknown as ClaimRequest[]) || [];
		}

		loading = false;
	}

	async function approveClaim(claimId: string) {
		if (!$user) return;

		processing = claimId;

		const { error } = await supabase.rpc('approve_claim_request', {
			p_claim_id: claimId,
			p_admin_id: $user.id
		});

		processing = null;

		if (error) {
			console.error('Error approving claim:', error);
			toast.error('Error al aprobar el reclamo');
			return;
		}

		toast.success('Reclamo aprobado');
		fetchClaims();
	}

	async function rejectClaim(claimId: string, notes?: string) {
		if (!$user) return;

		processing = claimId;

		const { error } = await supabase.rpc('reject_claim_request', {
			p_claim_id: claimId,
			p_admin_id: $user.id,
			p_notes: notes || null
		});

		processing = null;

		if (error) {
			console.error('Error rejecting claim:', error);
			toast.error('Error al rechazar el reclamo');
			return;
		}

		toast.success('Reclamo rechazado');
		fetchClaims();
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('es-UY', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getSourceLabel(source: string): string {
		const labels: Record<string, string> = {
			'1122': '1122.com.uy',
			guiacomercial: 'Guía Comercial',
			google_places: 'Google Places',
			manual: 'Manual'
		};
		return labels[source] || source;
	}

	onMount(() => {
		fetchClaims();
	});
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Solicitudes de Reclamo</h2>

		<div class="flex items-center gap-4">
			<!-- Filter -->
			<select
				bind:value={filter}
				onchange={() => fetchClaims()}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
			>
				<option value="pending">Pendientes</option>
				<option value="all">Todos</option>
			</select>

			<!-- Refresh -->
			<Button variant="outline" onclick={() => fetchClaims()}>
				<RefreshCw class="h-4 w-4 mr-2" />
				Actualizar
			</Button>
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-primary-600" />
		</div>
	{:else if claims.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
			<CheckCircle class="h-12 w-12 text-green-500 mx-auto mb-4" />
			<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
				{filter === 'pending' ? 'No hay reclamos pendientes' : 'No hay reclamos'}
			</h3>
			<p class="text-gray-500 dark:text-gray-400">
				{filter === 'pending'
					? 'Todas las solicitudes han sido procesadas.'
					: 'Aún no se han recibido solicitudes de reclamo.'}
			</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each claims as claim (claim.id)}
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
					<div class="p-6">
						<div class="flex flex-wrap items-start justify-between gap-4">
							<!-- Provider info -->
							<div class="flex items-start gap-4">
								<div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
									<Store class="h-6 w-6 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<div class="flex items-center gap-2">
										<h3 class="font-semibold text-gray-900 dark:text-white">
											{claim.provider?.business_name || 'Negocio no encontrado'}
										</h3>
										<a
											href="/directorio/{claim.provider_id}"
											target="_blank"
											class="text-gray-400 hover:text-primary-600"
										>
											<ExternalLink class="h-4 w-4" />
										</a>
									</div>
									<p class="text-sm text-gray-500 dark:text-gray-400">
										{claim.provider?.neighborhood
											? `${claim.provider.neighborhood}, `
											: ''}{claim.provider?.department || ''}
									</p>
									<span class="inline-block mt-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
										Fuente: {getSourceLabel(claim.provider?.source || 'unknown')}
									</span>
								</div>
							</div>

							<!-- Status badge -->
							<div>
								{#if claim.status === 'pending'}
									<span class="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-medium">
										Pendiente
									</span>
								{:else if claim.status === 'approved'}
									<span class="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
										Aprobado
									</span>
								{:else}
									<span class="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-medium">
										Rechazado
									</span>
								{/if}
							</div>
						</div>

						<!-- Requester info -->
						<div class="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
							<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
								<User class="h-4 w-4" />
								<span class="font-medium">Solicitante:</span>
								{claim.requester?.full_name || 'Usuario desconocido'}
								<span class="text-gray-400">({claim.requester?.email})</span>
							</div>

							<div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
								<Calendar class="h-4 w-4" />
								{formatDate(claim.created_at)}
							</div>

							{#if claim.message}
								<div class="mt-3 flex items-start gap-2 text-sm">
									<MessageSquare class="h-4 w-4 text-gray-400 mt-0.5" />
									<p class="text-gray-600 dark:text-gray-400 italic">"{claim.message}"</p>
								</div>
							{/if}
						</div>

						<!-- Actions for pending claims -->
						{#if claim.status === 'pending'}
							<div class="mt-4 flex gap-3">
								<Button
									variant="default"
									onclick={() => approveClaim(claim.id)}
									disabled={processing === claim.id}
								>
									{#if processing === claim.id}
										<Loader2 class="h-4 w-4 mr-2 animate-spin" />
									{:else}
										<CheckCircle class="h-4 w-4 mr-2" />
									{/if}
									Aprobar
								</Button>
								<Button
									variant="outline"
									onclick={() => rejectClaim(claim.id)}
									disabled={processing === claim.id}
								>
									<XCircle class="h-4 w-4 mr-2" />
									Rechazar
								</Button>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
