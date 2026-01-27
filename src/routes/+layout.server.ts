import { env } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return {
		env: {
			PUBLIC_SUPABASE_URL: env.PUBLIC_SUPABASE_URL || '',
			PUBLIC_SUPABASE_ANON_KEY: env.PUBLIC_SUPABASE_ANON_KEY || ''
		}
	};
};
