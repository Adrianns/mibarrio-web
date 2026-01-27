import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return {
		env: {
			PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL || '',
			PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY || ''
		}
	};
};
