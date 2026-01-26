import type { SupabaseClient } from '@supabase/supabase-js';
import type { Provider, Category, Result, Department, ContactType } from '$lib/domain/types';

export interface ProviderSearchParams {
	query?: string;
	department?: Department;
	neighborhood?: string;
	categoryName?: string;
	categoryType?: 'service' | 'business';
	limit?: number;
	offset?: number;
}

export interface ProviderWithCategories extends Provider {
	categories: Category[];
}

export class SupabaseProviderRepository {
	constructor(private supabase: SupabaseClient) {}

	async search(params: ProviderSearchParams): Promise<Result<ProviderWithCategories[]>> {
		try {
			let query = this.supabase
				.from('providers')
				.select(`
					*,
					provider_categories (
						category:categories (*)
					)
				`)
				.eq('is_active', true)
				.order('is_featured', { ascending: false })
				.order('view_count', { ascending: false });

			if (params.department) {
				query = query.eq('department', params.department);
			}

			if (params.neighborhood) {
				query = query.eq('neighborhood', params.neighborhood);
			}

			if (params.query) {
				query = query.or(
					`display_name.ilike.%${params.query}%,description.ilike.%${params.query}%,short_description.ilike.%${params.query}%`
				);
			}

			if (params.limit) {
				query = query.limit(params.limit);
			}

			if (params.offset) {
				query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
			}

			const { data, error } = await query;

			if (error) {
				return { data: null, error: new Error(error.message) };
			}

			// Transform data to include categories array
			const providers = (data || []).map((p) => ({
				...p,
				categories: p.provider_categories?.map((pc: { category: Category }) => pc.category) || []
			}));

			// Filter by category if specified
			let filteredProviders = providers;
			if (params.categoryName) {
				filteredProviders = providers.filter((p) =>
					p.categories.some((c: Category) => c.name === params.categoryName)
				);
			}

			if (params.categoryType) {
				filteredProviders = filteredProviders.filter((p) =>
					p.categories.some(
						(c: Category) => c.category_type === params.categoryType || c.category_type === 'both'
					)
				);
			}

			return { data: filteredProviders as ProviderWithCategories[], error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}

	async getById(id: string): Promise<Result<ProviderWithCategories>> {
		try {
			const { data, error } = await this.supabase
				.from('providers')
				.select(`
					*,
					provider_categories (
						category:categories (*)
					),
					user:profiles (full_name, avatar_url)
				`)
				.eq('id', id)
				.single();

			if (error) {
				return { data: null, error: new Error(error.message) };
			}

			const provider = {
				...data,
				categories: data.provider_categories?.map((pc: { category: Category }) => pc.category) || []
			};

			return { data: provider as ProviderWithCategories, error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}

	async getByUserId(userId: string): Promise<Result<ProviderWithCategories>> {
		try {
			const { data, error } = await this.supabase
				.from('providers')
				.select(`
					*,
					provider_categories (
						category:categories (*)
					),
					subscriptions (
						*,
						plan:subscription_plans (*)
					)
				`)
				.eq('user_id', userId)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					// No provider found
					return { data: null, error: null };
				}
				return { data: null, error: new Error(error.message) };
			}

			const provider = {
				...data,
				categories: data.provider_categories?.map((pc: { category: Category }) => pc.category) || [],
				subscription: data.subscriptions?.[0] || null
			};

			return { data: provider as ProviderWithCategories, error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}

	async incrementViewCount(providerId: string): Promise<Result<void>> {
		try {
			const { error } = await this.supabase.rpc('increment_provider_view', {
				p_provider_id: providerId
			});

			if (error) {
				return { data: null, error: new Error(error.message) };
			}

			return { data: undefined, error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}

	async logContactClick(
		providerId: string,
		contactType: ContactType,
		visitorIp?: string
	): Promise<Result<void>> {
		try {
			const { error } = await this.supabase.rpc('log_contact_click', {
				p_provider_id: providerId,
				p_contact_type: contactType,
				p_visitor_ip: visitorIp
			});

			if (error) {
				return { data: null, error: new Error(error.message) };
			}

			return { data: undefined, error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}

	async create(
		provider: Omit<Provider, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'contact_click_count'>
	): Promise<Result<Provider>> {
		try {
			const { data, error } = await this.supabase
				.from('providers')
				.insert(provider)
				.select()
				.single();

			if (error) {
				return { data: null, error: new Error(error.message) };
			}

			return { data: data as Provider, error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}

	async update(id: string, updates: Partial<Provider>): Promise<Result<Provider>> {
		try {
			const { data, error } = await this.supabase
				.from('providers')
				.update(updates)
				.eq('id', id)
				.select()
				.single();

			if (error) {
				return { data: null, error: new Error(error.message) };
			}

			return { data: data as Provider, error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}

	async setCategories(providerId: string, categoryIds: string[]): Promise<Result<void>> {
		try {
			// Delete existing categories
			await this.supabase.from('provider_categories').delete().eq('provider_id', providerId);

			// Insert new categories
			if (categoryIds.length > 0) {
				const { error } = await this.supabase.from('provider_categories').insert(
					categoryIds.map((categoryId) => ({
						provider_id: providerId,
						category_id: categoryId
					}))
				);

				if (error) {
					return { data: null, error: new Error(error.message) };
				}
			}

			return { data: undefined, error: null };
		} catch (err) {
			return { data: null, error: err as Error };
		}
	}
}
