import type { RequestHandler } from './$types';
import { getServiceSupabase } from '$lib/server/supabase';
import { SITE_URL } from '$lib/seo/constants';
import { generateAllCategorySlugs } from '$lib/seo/category-slugs';

interface SitemapUrl {
	loc: string;
	lastmod?: string;
	changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority: string;
}

const staticPages: SitemapUrl[] = [
	{ loc: '/', changefreq: 'daily', priority: '1.0' },
	{ loc: '/directorio', changefreq: 'daily', priority: '0.9' },
	{ loc: '/planes', changefreq: 'monthly', priority: '0.5' },
	{ loc: '/privacy', changefreq: 'monthly', priority: '0.3' },
	{ loc: '/terms', changefreq: 'monthly', priority: '0.3' }
];

// SEO category landing pages (high priority for Google indexing)
const categorySlugs = generateAllCategorySlugs();
const categoryPages: SitemapUrl[] = categorySlugs.map(({ slug, priority }) => ({
	loc: `/${slug}`,
	changefreq: 'daily' as const,
	priority: priority.toString()
}));

function formatDate(date: string | Date): string {
	const d = new Date(date);
	return d.toISOString().split('T')[0];
}

function buildUrlEntry(url: SitemapUrl): string {
	let entry = `  <url>\n    <loc>${SITE_URL}${url.loc}</loc>\n`;
	if (url.lastmod) {
		entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
	}
	entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
	entry += `    <priority>${url.priority}</priority>\n`;
	entry += `  </url>`;
	return entry;
}

export const GET: RequestHandler = async () => {
	const urls: SitemapUrl[] = [...staticPages, ...categoryPages];

	try {
		const supabase = getServiceSupabase();
		const { data: providers, error } = await supabase
			.from('mb_providers')
			.select('id, slug, updated_at')
			.eq('is_active', true)
			.order('updated_at', { ascending: false });

		if (!error && providers) {
			for (const provider of providers) {
				// Prefer slug URL when available
				const urlPath = provider.slug ? `@${provider.slug}` : provider.id;
				urls.push({
					loc: `/directorio/${urlPath}`,
					lastmod: formatDate(provider.updated_at),
					changefreq: 'weekly',
					priority: '0.8'
				});
			}
		}
	} catch (err) {
		// If we can't fetch providers, continue with static pages only
		console.error('Error fetching providers for sitemap:', err);
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(buildUrlEntry).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
