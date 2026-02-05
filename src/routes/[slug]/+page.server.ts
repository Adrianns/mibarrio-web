import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getServiceSupabase } from '$lib/server/supabase';
import { parseLocationSlug } from '$lib/seo/category-slugs';
import {
	getOptimizedTitle,
	getOptimizedDescription,
	getOptimizedFAQs,
	getCategorySEOData
} from '$lib/seo/category-seo-data';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	const parsed = parseLocationSlug(slug);

	if (!parsed.category) {
		throw error(404, 'Página no encontrada');
	}

	const supabase = getServiceSupabase();

	// Build query for providers
	let query = supabase
		.from('mb_providers')
		.select(
			`
			id,
			slug,
			business_name,
			description,
			department,
			neighborhood,
			contact_phone,
			contact_whatsapp,
			logo_url,
			is_verified,
			view_count,
			mb_provider_categories!inner(category_name)
		`
		)
		.eq('is_active', true)
		.eq('mb_provider_categories.category_name', parsed.category)
		.order('is_verified', { ascending: false })
		.order('view_count', { ascending: false })
		.limit(50);

	// Filter by department if specified
	if (parsed.department) {
		query = query.eq('department', parsed.department);
	}

	const { data: providers, error: dbError } = await query;

	if (dbError) {
		console.error('Error fetching providers:', dbError);
		throw error(500, 'Error al cargar los datos');
	}

	// Get total count for this category
	let countQuery = supabase
		.from('mb_provider_categories')
		.select('provider_id', { count: 'exact', head: true })
		.eq('category_name', parsed.category);

	const { count: totalInCategory } = await countQuery;

	// Get count by department for internal linking
	const { data: departmentCounts } = await supabase.rpc('get_category_department_counts', {
		category_name: parsed.category
	});

	// SEO metadata - optimized for Google search patterns
	const title = getOptimizedTitle(parsed.category, parsed.categoryLabel!, parsed.department);
	const description = getOptimizedDescription(parsed.category, parsed.categoryLabel!, parsed.department);
	const faqs = getOptimizedFAQs(parsed.category, parsed.categoryLabel!, parsed.department);
	const seoData = getCategorySEOData(parsed.category);

	// Canonical URL
	const canonicalPath = `/${slug}`;

	return {
		providers: providers || [],
		category: parsed.category,
		categorySlug: parsed.categorySlug,
		categoryLabel: parsed.categoryLabel,
		department: parsed.department,
		departmentSlug: parsed.departmentSlug,
		totalInCategory: totalInCategory || 0,
		departmentCounts: departmentCounts || [],
		seo: {
			title,
			description,
			canonicalPath,
			faqs,
			keywords: seoData?.keywords || [],
			relatedServices: seoData?.relatedServices || [],
			commonNeeds: seoData?.commonNeeds || []
		}
	};
};
