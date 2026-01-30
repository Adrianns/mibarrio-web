<script lang="ts">
	import { page } from '$app/stores';
	import {
		SITE_NAME,
		SITE_DESCRIPTION,
		SITE_URL,
		DEFAULT_OG_IMAGE,
		TWITTER_HANDLE
	} from '$lib/seo/constants';

	interface Props {
		title?: string;
		description?: string;
		url?: string;
		image?: string;
		type?: 'website' | 'article' | 'profile';
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
		noindex?: boolean;
	}

	let {
		title,
		description = SITE_DESCRIPTION,
		url,
		image,
		type = 'website',
		jsonLd,
		noindex = false
	}: Props = $props();

	// Build full title
	const fullTitle = $derived(title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - ${SITE_DESCRIPTION}`);

	// Build canonical URL
	const canonicalUrl = $derived(url ? `${SITE_URL}${url}` : `${SITE_URL}${$page.url.pathname}`);

	// Build OG image URL
	const ogImage = $derived(image || `${SITE_URL}${DEFAULT_OG_IMAGE}`);

	// Serialize JSON-LD
	const jsonLdString = $derived(jsonLd ? JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : null);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={title || SITE_NAME} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="es_UY" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={canonicalUrl} />
	<meta name="twitter:title" content={title || SITE_NAME} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:site" content={TWITTER_HANDLE} />

	<!-- JSON-LD Structured Data -->
	{#if jsonLdString}
		{@html `<script type="application/ld+json">${jsonLdString}</script>`}
	{/if}
</svelte:head>
