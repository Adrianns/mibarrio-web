import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/public';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

Sentry.init({
	dsn: env.PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0
});

const securityAndCacheHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	const { pathname } = event.url;

	// Security headers on all responses
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	if (env.PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
		// Production environment — enable HSTS
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	// Skip public cache headers for auth/api/admin routes
	if (pathname.startsWith('/auth') || pathname.startsWith('/api') || pathname.startsWith('/admin')) {
		return response;
	}

	// Route-based cache headers
	if (pathname === '/terms' || pathname === '/privacy') {
		response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
	} else if (pathname === '/planes') {
		response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
	} else if (pathname === '/') {
		response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	} else if (pathname.startsWith('/directorio/') && pathname !== '/directorio/mapa' && pathname !== '/directorio/lista') {
		// Provider detail pages: /directorio/[id]
		response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60');
	} else if (pathname.match(/^\/[a-z]/) && !pathname.startsWith('/directorio') && !pathname.startsWith('/registrar') && !pathname.startsWith('/mi-negocio') && !pathname.startsWith('/perfil')) {
		// Category landing pages: /electricistas, /electricistas-montevideo, etc.
		response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=300');
	}

	return response;
};

export const handle = sequence(Sentry.sentryHandle(), securityAndCacheHeaders);

export const handleError = Sentry.handleErrorWithSentry();
