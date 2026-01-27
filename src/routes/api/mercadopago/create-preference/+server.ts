import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Preference } from 'mercadopago';
import { getMercadoPagoClient } from '$lib/server/mercadopago';
import { getUserSupabase } from '$lib/server/supabase';
import { env } from '$env/dynamic/public';

const PRICES = {
	monthly: 390,
	annual: 3900
} as const;

export const POST: RequestHandler = async ({ request }) => {
	try {
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
		const { subscription_id, billing_cycle } = body;

		if (!subscription_id || !billing_cycle || !['monthly', 'annual'].includes(billing_cycle)) {
			return json({ error: 'Datos inválidos' }, { status: 400 });
		}

		// Verify user owns this subscription (RLS enforces ownership)
		const { data: subscription, error: subError } = await supabase
			.from('mb_subscriptions')
			.select('id, provider_id, status')
			.eq('id', subscription_id)
			.single();

		if (subError || !subscription) {
			console.error('Subscription query error:', subError);
			return json({ error: 'Suscripción no encontrada' }, { status: 404 });
		}

		const sub = subscription as Record<string, string>;

		const amount = PRICES[billing_cycle as keyof typeof PRICES];
		const appUrl = env.PUBLIC_APP_URL || 'http://localhost:5173';

		// Create MercadoPago preference
		const client = getMercadoPagoClient();
		const preference = new Preference(client);

		const cycleLabel = billing_cycle === 'monthly' ? 'Mensual' : 'Anual';

		const isLocalhost = appUrl.includes('localhost');

		const result = await preference.create({
			body: {
				items: [
					{
						id: `sub-${billing_cycle}`,
						title: `Mi Barrio - Plan Básico ${cycleLabel}`,
						quantity: 1,
						unit_price: amount,
						currency_id: 'UYU'
					}
				],
				external_reference: `sub:${subscription_id}:${billing_cycle}`,
				back_urls: {
					success: `${appUrl}/mi-negocio?payment=success`,
					failure: `${appUrl}/mi-negocio?payment=failure`,
					pending: `${appUrl}/mi-negocio?payment=pending`
				},
				...(isLocalhost ? {} : { auto_return: 'approved' as const }),
				...(!isLocalhost && { notification_url: `${appUrl}/api/mercadopago/webhook` }),
				statement_descriptor: 'MI BARRIO'
			}
		});

		// Save preference id to subscription
		await supabase
			.from('mb_subscriptions')
			.update({
				mp_preference_id: result.id,
				billing_cycle,
				amount,
				updated_at: new Date().toISOString()
			})
			.eq('id', subscription_id);

		// Create pending payment record
		const now = new Date();
		const periodEnd = new Date(now);
		if (billing_cycle === 'monthly') {
			periodEnd.setMonth(periodEnd.getMonth() + 1);
		} else {
			periodEnd.setFullYear(periodEnd.getFullYear() + 1);
		}

		await supabase.from('mb_subscription_payments').insert({
			subscription_id,
			amount,
			status: 'pending',
			mp_preference_id: result.id,
			billing_cycle,
			period_start: now.toISOString(),
			period_end: periodEnd.toISOString()
		});

		return json({ init_point: result.init_point });
	} catch (error: unknown) {
		const errMsg =
			error instanceof Error
				? error.message
				: typeof error === 'object' && error !== null
					? JSON.stringify(error)
					: String(error);
		console.error('Create preference error:', errMsg, error);
		return json({ error: errMsg }, { status: 500 });
	}
};
