import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Payment } from 'mercadopago';
import { getMercadoPagoClient } from '$lib/server/mercadopago';
import { getServiceSupabase } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import { createHmac } from 'crypto';

function verifyWebhookSignature(
	xSignature: string | null,
	xRequestId: string | null,
	dataId: string
): boolean {
	if (!env.MERCADOPAGO_WEBHOOK_SECRET || !xSignature) return true; // Skip if no secret configured

	const parts = xSignature.split(',');
	let ts = '';
	let hash = '';

	for (const part of parts) {
		const [key, value] = part.split('=').map((s) => s.trim());
		if (key === 'ts') ts = value;
		if (key === 'v1') hash = value;
	}

	if (!ts || !hash) return false;

	const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
	const computedHash = createHmac('sha256', env.MERCADOPAGO_WEBHOOK_SECRET)
		.update(manifest)
		.digest('hex');

	return computedHash === hash;
}

// GET endpoint for MercadoPago verification
export const GET: RequestHandler = async () => {
	return json({ status: 'ok' });
};

// POST endpoint for IPN notifications
export const POST: RequestHandler = async ({ request, url }) => {
	const supabase = getServiceSupabase();

	try {
		const body = await request.json();
		const { type, data } = body;

		// Only process payment notifications
		if (type !== 'payment' || !data?.id) {
			return json({ received: true });
		}

		// Verify webhook signature
		const xSignature = request.headers.get('x-signature');
		const xRequestId = request.headers.get('x-request-id');
		const dataId = url.searchParams.get('data.id') || String(data.id);

		if (!verifyWebhookSignature(xSignature, xRequestId, dataId)) {
			console.error('Webhook signature verification failed');
			return json({ error: 'Invalid signature' }, { status: 401 });
		}

		// Fetch payment details from MercadoPago
		const client = getMercadoPagoClient();
		const paymentApi = new Payment(client);
		const payment = await paymentApi.get({ id: Number(data.id) });

		if (!payment || !payment.external_reference) {
			return json({ received: true });
		}

		// Parse external_reference: sub:{subscription_id}:{billing_cycle}
		const parts = payment.external_reference.split(':');
		if (parts.length !== 3 || parts[0] !== 'sub') {
			return json({ received: true });
		}

		const subscriptionId = parts[1];
		const billingCycle = parts[2] as 'monthly' | 'annual';

		if (payment.status === 'approved') {
			// Calculate subscription period
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
					billing_cycle: billingCycle,
					amount: payment.transaction_amount,
					mp_payment_id: String(payment.id),
					updated_at: now.toISOString()
				})
				.eq('id', subscriptionId);

			// Update payment record
			await supabase
				.from('mb_subscription_payments')
				.update({
					status: 'approved',
					mp_payment_id: String(payment.id),
					paid_at: now.toISOString(),
					period_start: now.toISOString(),
					period_end: endsAt.toISOString()
				})
				.eq('subscription_id', subscriptionId)
				.eq('status', 'pending')
				.order('created_at', { ascending: false })
				.limit(1);
		} else if (payment.status === 'rejected') {
			// Update payment record as rejected
			await supabase
				.from('mb_subscription_payments')
				.update({
					status: 'rejected',
					mp_payment_id: String(payment.id)
				})
				.eq('subscription_id', subscriptionId)
				.eq('status', 'pending')
				.order('created_at', { ascending: false })
				.limit(1);
		}

		return json({ received: true });
	} catch (error) {
		console.error('Webhook error:', error);
		// Always return 200 to prevent retries
		return json({ received: true });
	}
};
