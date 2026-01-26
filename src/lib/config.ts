// App configuration
export const APP_NAME = 'Mi Barrio';
export const APP_TAGLINE = 'Descubrí los servicios de tu barrio';

// Domain - dynamic for dev/prod
export const APP_DOMAIN =
	typeof window !== 'undefined'
		? window.location.origin
		: (import.meta.env.PUBLIC_APP_URL || 'http://localhost:5173');
export const APP_DESCRIPTION =
	'Encontrá servicios y negocios locales en tu barrio. Electricistas, plomeros, restaurantes, farmacias y más.';

// Formatting helpers
export function formatPrice(price: number): string {
	return new Intl.NumberFormat('es-UY', {
		style: 'currency',
		currency: 'UYU',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(price);
}

export function formatDate(date: string | Date): string {
	return new Intl.DateTimeFormat('es-UY', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
	return new Intl.DateTimeFormat('es-UY', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(date));
}
