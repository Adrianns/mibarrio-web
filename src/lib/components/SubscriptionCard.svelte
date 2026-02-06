<script lang="ts">
	import { Crown, Check, Loader2, ExternalLink, Calendar, Zap } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { supabase } from '$lib/supabase';
	import { toast } from '$lib/stores/toast';
	import { isPremium, getSubscriptionDaysLeft } from '$lib/utils/subscription';
	import type { Subscription } from '$lib/domain/types';

	let {
		providerId,
		subscription = null,
		onSubscriptionChange
	}: {
		providerId: string;
		subscription: Subscription | null;
		onSubscriptionChange?: (sub: Subscription) => void;
	} = $props();

	let loading = $state(false);
	let selectedCycle = $state<'monthly' | 'annual'>('monthly');

	let isActive = $derived(isPremium(subscription));
	let daysLeft = $derived(getSubscriptionDaysLeft(subscription));

	const PRICES = {
		monthly: 390,
		annual: 3900
	};

	const monthlySavings = Math.round((1 - PRICES.annual / 12 / PRICES.monthly) * 100);

	async function handleSubscribe() {
		loading = true;

		try {
			let subId = subscription?.id;

			// Create subscription row if none exists
			if (!subId) {
				// Get the premium plan
				const { data: plan } = await supabase
					.from('mb_subscription_plans')
					.select('id')
					.eq('is_active', true)
					.single();

				if (!plan) {
					toast.error('Plan no encontrado');
					loading = false;
					return;
				}

				const { data: newSub, error: insertError } = await supabase
					.from('mb_subscriptions')
					.insert({
						provider_id: providerId,
						plan_id: plan.id,
						status: 'pending',
						billing_cycle: selectedCycle,
						amount: PRICES[selectedCycle]
					})
					.select()
					.single();

				if (insertError || !newSub) {
					console.error('Insert subscription error:', insertError);
					toast.error('Error al crear la suscripción');
					loading = false;
					return;
				}

				subId = newSub.id;
				onSubscriptionChange?.(newSub);
			}

			// Get auth token
			const { data: { session } } = await supabase.auth.getSession();
			if (!session) {
				toast.error('Sesión expirada, recargá la página');
				loading = false;
				return;
			}

			// Create MercadoPago preference
			const res = await fetch('/api/mercadopago/create-preference', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${session.access_token}`
				},
				body: JSON.stringify({
					subscription_id: subId,
					billing_cycle: selectedCycle
				})
			});

			const data = await res.json();

			if (!res.ok || !data.init_point) {
				toast.error(data.error || 'Error al crear el pago');
				loading = false;
				return;
			}

			// Redirect to MercadoPago checkout
			window.location.href = data.init_point;
		} catch (err) {
			console.error('Subscribe error:', err);
			toast.error('Error al procesar el pago');
			loading = false;
		}
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
	{#if isActive}
		<!-- Active subscription -->
		<div class="bg-gradient-to-r from-amber-500 to-yellow-500 p-4">
			<div class="flex items-center gap-3 text-white">
				<Crown class="h-6 w-6" />
				<div>
					<h3 class="font-bold text-lg">Plan Premium activo</h3>
					<p class="text-sm text-white/80">
						{#if daysLeft !== null}
							{daysLeft} días restantes
						{:else}
							Suscripción activa
						{/if}
					</p>
				</div>
			</div>
		</div>
		<div class="p-6">
			<div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
				<div class="flex items-center gap-2">
					<Check class="h-4 w-4 text-green-500" />
					Servicios y productos ilimitados
				</div>
				<div class="flex items-center gap-2">
					<Check class="h-4 w-4 text-green-500" />
					Imagen de portada
				</div>
				<div class="flex items-center gap-2">
					<Check class="h-4 w-4 text-green-500" />
					Promociones y ofertas
				</div>
			</div>
			{#if daysLeft !== null && daysLeft < 15}
				<div class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
					<p class="text-sm text-amber-700 dark:text-amber-400">
						Tu suscripción vence pronto. Renová para no perder tus beneficios.
					</p>
					<Button
						onclick={handleSubscribe}
						disabled={loading}
						class="mt-2 w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
					>
						{#if loading}
							<Loader2 class="h-4 w-4 animate-spin mr-2" />
						{/if}
						Renovar Premium
					</Button>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Upgrade prompt -->
		<div class="bg-gradient-to-r from-amber-500 to-yellow-500 p-4">
			<div class="flex items-center gap-3 text-white">
				<Crown class="h-6 w-6" />
				<div>
					<h3 class="font-bold text-lg">Pasá a Premium</h3>
					<p class="text-sm text-white/80">Potenciá tu perfil con más herramientas</p>
				</div>
			</div>
		</div>
		<div class="p-6">
			<!-- Features -->
			<div class="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
				<div class="flex items-center gap-2">
					<Zap class="h-4 w-4 text-amber-500" />
					Servicios y productos ilimitados
				</div>
				<div class="flex items-center gap-2">
					<Zap class="h-4 w-4 text-amber-500" />
					Imagen de portada profesional
				</div>
				<div class="flex items-center gap-2">
					<Zap class="h-4 w-4 text-amber-500" />
					Promociones y ofertas especiales
				</div>
				<div class="flex items-center gap-2">
					<Zap class="h-4 w-4 text-amber-500" />
					Catálogo de productos con imágenes
				</div>
			</div>

			<!-- Billing cycle toggle -->
			<div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4">
				<button
					onclick={() => (selectedCycle = 'monthly')}
					class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all {selectedCycle === 'monthly'
						? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-500 dark:text-gray-400'}"
				>
					Mensual
				</button>
				<button
					onclick={() => (selectedCycle = 'annual')}
					class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all {selectedCycle === 'annual'
						? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-500 dark:text-gray-400'}"
				>
					Anual
					<span class="ml-1 text-[10px] text-green-600 dark:text-green-400 font-bold">-{monthlySavings}%</span>
				</button>
			</div>

			<!-- Price -->
			<div class="text-center mb-4">
				<div class="flex items-baseline justify-center gap-1">
					<span class="text-3xl font-bold text-gray-900 dark:text-white">
						${selectedCycle === 'monthly' ? PRICES.monthly : PRICES.annual}
					</span>
					<span class="text-gray-500 dark:text-gray-400 text-sm">
						UYU / {selectedCycle === 'monthly' ? 'mes' : 'año'}
					</span>
				</div>
				{#if selectedCycle === 'annual'}
					<p class="text-xs text-green-600 dark:text-green-400 mt-1">
						${Math.round(PRICES.annual / 12)} por mes - ahorrás ${PRICES.monthly * 12 - PRICES.annual} al año
					</p>
				{/if}
			</div>

			<!-- Subscribe button -->
			<button
				onclick={handleSubscribe}
				disabled={loading}
				class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium rounded-lg shadow-sm transition-all hover:shadow-md disabled:opacity-50"
			>
				{#if loading}
					<Loader2 class="h-5 w-5 animate-spin" />
					Procesando...
				{:else}
					<Crown class="h-5 w-5" />
					Suscribirme a Premium
					<ExternalLink class="h-4 w-4" />
				{/if}
			</button>

			<p class="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
				Pago seguro con MercadoPago. Cancelá cuando quieras.
			</p>
		</div>
	{/if}
</div>
