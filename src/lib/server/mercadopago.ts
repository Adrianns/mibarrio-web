import { MercadoPagoConfig } from 'mercadopago';
import { MERCADOPAGO_ACCESS_TOKEN } from '$env/static/private';

let client: MercadoPagoConfig | null = null;

export function getMercadoPagoClient() {
	if (!client) {
		client = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });
	}
	return client;
}
