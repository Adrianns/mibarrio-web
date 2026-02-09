## Why

Mi Barrio already has a solid SEO foundation (structured data, sitemap, category landing pages, canonical URLs), but several technical and content optimizations are missing that prevent it from ranking higher on Google. Key gaps include: no HTTP cache headers on page responses (hurting TTFB/Core Web Vitals), render-blocking Google Fonts (hurting LCP), no prerendering for static pages, missing image dimensions (CLS issues), a 302 redirect that should be 301, and thin content on high-value pages. Fixing these will directly improve Core Web Vitals scores and search engine ranking signals.

## What Changes

- **HTTP cache headers**: Add `Cache-Control` and `s-maxage` headers to category pages, provider pages, and static pages for CDN/browser caching
- **Prerender static pages**: Prerender `/terms`, `/privacy`, `/planes` for instant TTFB
- **Font loading optimization**: Replace render-blocking Google Fonts `<link>` with self-hosted fonts or `font-display: swap` preload strategy
- **Image optimization**: Add explicit `width`/`height` attributes to prevent CLS; add `fetchpriority="high"` to above-the-fold images
- **Fix 302 → 301 redirect**: Change `/directorio` redirect from 302 (temporary) to 301 (permanent) so Google consolidates link equity
- **Homepage content enrichment**: Add crawlable text content (service descriptions, location coverage, value props) to improve topical relevance
- **Provider page OG images**: Use provider logo/photos as dynamic `og:image` for richer social sharing and Google Discover
- **Security/performance headers**: Add `X-Content-Type-Options`, `Strict-Transport-Security` headers in hooks
- **Trailing slash consistency**: Ensure consistent URL format to avoid duplicate content
- **Footer internal linking expansion**: Add more category and location links to footer for deeper crawl coverage
- **Preconnect/DNS-prefetch hints**: Add resource hints for Supabase API, image CDN origins

## Capabilities

### New Capabilities
- `seo-performance`: HTTP cache headers, prerendering static pages, font loading optimization, resource hints, and security headers
- `seo-content`: Homepage content enrichment, footer internal linking expansion, image optimization attributes
- `seo-technical`: Fix 302→301 redirect, trailing slash normalization, dynamic OG images for providers

### Modified Capabilities
_(none - no existing spec requirements are changing)_

## Impact

- **Affected code**: `src/routes/+layout.svelte` (fonts), `src/routes/+layout.server.ts` (headers), `src/routes/directorio/+page.server.ts` (redirect), `src/routes/+page.svelte` (homepage content), `src/routes/directorio/[id]/+page.svelte` (OG images), `src/routes/terms/`, `src/routes/privacy/`, `src/routes/planes/` (prerender), `src/hooks.server.ts` (response headers), footer component
- **No breaking changes**: All improvements are additive/backward-compatible
- **Dependencies**: None new required (font files would be added to `static/`)
- **Performance**: Expect improved LCP, CLS, and TTFB metrics; better Core Web Vitals = higher Google ranking
