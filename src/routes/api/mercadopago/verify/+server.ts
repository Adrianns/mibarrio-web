import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Payment } from 'mercadopago';
import { getMercadoPagoClient } from '$lib/server/mercadopago';
import { getUserSupabase } from '$lib/server/supabase';

export const POST: RequestHandler = async ({ request }) => {
	// Get auth token from request
	const authHeader = request.headers.get('authorization');
	if (!authHeader) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	const token = authHeader.replace('Bearer ', '');
	const supabase = getUserSupabase(token);

	// Verify user
	const {
		data: { user },
		error: authError
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	const body = await request.json();
	const { subscription_id } = body;

	if (!subscription_id) {
		return json({ error: 'Datos inválidos' }, { status: 400 });
	}

	// Verify user owns this subscription (RLS enforces ownership)
	const { data: subscriptionData, error: subError } = await supabase
		.from('mb_subscriptions')
		.select('id, provider_id, status, billing_cycle')
		.eq('id', subscription_id)
		.single();

	if (subError || !subscriptionData) {
		return json({ error: 'Suscripción no encontrada' }, { status: 404 });
	}

	const sub = subscriptionData as Record<string, string>;

	// If already active, return current status
	if (sub.status === 'active') {
		return json({ status: 'active' });
	}

	// Search for approved payments in MercadoPago
	const client = getMercadoPagoClient();
	const paymentApi = new Payment(client);
	const billingCycle = (sub.billing_cycle || 'monthly') as 'monthly' | 'annual';

	try {
		const searchResult = await paymentApi.search({
			options: {
				criteria: 'desc',
				sort: 'date_created'
			}
		});

		// Filter by external reference manually
		const externalRef = `sub:${subscription_id}:${billingCycle}`;
		const approvedPayment = searchResult.results?.find(
			(p) => p.status === 'approved' && p.external_reference === externalRef
		);

		if (approvedPayment) {
			const now = new Date();
			const endsAt = new Date(now);
			if (billingCycle === 'monthly') {
				endsAt.setMonth(endsAt.getMonth() + 1);
			} else {
				endsAt.setFullYear(endsAt.getFullYear() + 1);
			}

			// Activate subscription
			await supabase
				.from('mb_subscriptions')
				.update({
					status: 'active',
					starts_at: now.toISOString(),
					ends_at: endsAt.toISOString(),
					amount: approvedPayment.transaction_amount,
					mp_payment_id: String(approvedPayment.id),
					updated_at: now.toISOString()
				})
				.eq('id', subscription_id);

			// Mark provider as premium for search priority
			await supabase
				.from('mb_providers')
				.update({ is_premium: true })
				.eq('id', sub.provider_id);

			// Update payment record
			await supabase
				.from('mb_subscription_payments')
				.update({
					status: 'approved',
					mp_payment_id: String(approvedPayment.id),
					paid_at: now.toISOString(),
					period_start: now.toISOString(),
					period_end: endsAt.toISOString()
				})
				.eq('subscription_id', subscription_id)
				.eq('status', 'pending')
				.order('created_at', { ascending: false })
				.limit(1);

			return json({ status: 'active' });
		}

		return json({ status: 'pending' });
	} catch (error) {
		console.error('Verify error:', error);
		return json({ status: 'pending' });
	}
};
