import { MercadoPagoConfig } from 'mercadopago';
import { env } from '$env/dynamic/private';

let client: MercadoPagoConfig | null = null;

export function getMercadoPagoClient() {
	if (!client) {
		if (!env.MERCADOPAGO_ACCESS_TOKEN) {
			throw new Error('Missing MERCADOPAGO_ACCESS_TOKEN');
		}
		client = new MercadoPagoConfig({ accessToken: env.MERCADOPAGO_ACCESS_TOKEN });
	}
	return client;
}
