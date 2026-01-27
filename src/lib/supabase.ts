import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

let supabaseInstance: SupabaseClient | null = null;

function getEnvVar(name: string): string {
	if (browser) {
		// Client-side: read from window (injected by layout)
		return (window as unknown as Record<string, string>)[name] || '';
	}
	// Server-side: fallback to process.env (populated in production Node.js)
	return process.env[name] || '';
}

export function getSupabase(): SupabaseClient {
	if (!supabaseInstance) {
		const url = getEnvVar('PUBLIC_SUPABASE_URL');
		const key = getEnvVar('PUBLIC_SUPABASE_ANON_KEY');

		if (!url || !key) {
			throw new Error('Missing Supabase environment variables');
		}
		supabaseInstance = createClient(url, key);
	}
	return supabaseInstance;
}

// For backwards compatibility - lazy initialized
export const supabase = new Proxy({} as SupabaseClient, {
	get(_, prop) {
		return Reflect.get(getSupabase(), prop);
	}
});
