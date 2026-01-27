import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { env } from '$env/dynamic/public';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serviceClient: SupabaseClient<any, 'public', any> | null = null;

// Service role client bypasses RLS - use only in server-side API routes
// Returns untyped client since we don't have generated DB types
export function getServiceSupabase() {
	if (!serviceClient) {
		const url = env.PUBLIC_SUPABASE_URL;
		if (!url || !SUPABASE_SERVICE_ROLE_KEY) {
			throw new Error('Missing Supabase service role environment variables');
		}
		serviceClient = createClient(url, SUPABASE_SERVICE_ROLE_KEY);
	}
	return serviceClient;
}

// Create a Supabase client authenticated with a user's JWT token
// This respects RLS policies and is used when service role key is not available
export function getUserSupabase(token: string) {
	const url = env.PUBLIC_SUPABASE_URL;
	const anonKey = env.PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !anonKey) {
		throw new Error('Missing Supabase environment variables');
	}
	return createClient(url, anonKey, {
		global: {
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	});
}
