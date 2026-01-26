import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category, Result } from '$lib/domain/types';

export class SupabaseCategoryRepository {
	constructor(private supabase: SupabaseClient) {}

	async getAll(): Promise<Result<Category[]>> {
		try {
			const { data, error } = await this.supabase
				.from('categories')
				.select('*')
				.eq('is_active', true)
				.order('display_order', { ascending: true });

			if (error) {
				return { data: null, error: new Error(error.message) };
			}

			return { data: data as Category[], error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}

	async getByName(name: string): Promise<Result<Category>> {
		try {
			const { data, error } = await this.supabase
				.from('categories')
				.select('*')
				.eq('name', name)
				.eq('is_active', true)
				.single();

			if (error) {
				return { data: null, error: new Error(error.message) };
			}

			return { data: data as Category, error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}

	async getByType(type: 'service' | 'business' | 'both'): Promise<Result<Category[]>> {
		try {
			const { data, error } = await this.supabase
				.from('categories')
				.select('*')
				.eq('is_active', true)
				.or(`category_type.eq.${type},category_type.eq.both`)
				.order('display_order', { ascending: true });

			if (error) {
				return { data: null, error: new Error(error.message) };
			}

			return { data: data as Category[], error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}
}
