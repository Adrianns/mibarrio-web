## Context

Mi Barrio is a SvelteKit 2 app (adapter-node, SSR, Svelte 5) serving as a local service directory for Uruguay. The SEO foundation is solid: structured data (7 schema types), dynamic sitemap, category landing pages with optimized titles/descriptions/FAQs, canonical URLs with hreflang, and OG/Twitter cards. However, Core Web Vitals and technical SEO signals have room for improvement — no HTTP cache headers on pages, render-blocking Google Fonts, no prerendering for static content, missing image dimensions, and a 302 redirect leaking link equity.

Current architecture:
- `hooks.server.ts`: Only Sentry init — no `handle` hook for response headers
- `+layout.server.ts`: Passes env vars, no caching logic
- `+layout.svelte`: Loads Google Fonts via render-blocking `<link>` tag
- `svelte.config.js`: adapter-node with precompress, no prerender config
- Provider detail pages: Client-side fetched (no SSR load), SEO component uses default OG image
- Static pages (`/terms`, `/privacy`, `/planes`): No prerender export

## Goals / Non-Goals

**Goals:**
- Improve Core Web Vitals (LCP, CLS, TTFB) to pass Google's "good" thresholds
- Maximize crawl efficiency and link equity consolidation
- Enrich indexable content on high-value pages (homepage, footer)
- Ensure provider pages have rich social previews with dynamic images

**Non-Goals:**
- Migrating to a different adapter (static/Cloudflare) — staying on adapter-node
- Adding AMP pages
- Implementing ISR (Incremental Static Regeneration) — not supported by adapter-node
- Changing URL structure or route hierarchy (already well-designed)
- Adding new pages or routes (only enriching existing ones)

## Decisions

### 1. Font loading: Self-host Inter via `@fontsource` over Google Fonts CDN

**Chosen**: Install `@fontsource/inter` and import in `app.css`. Remove Google Fonts `<link>` from layout.

**Why over alternatives**:
- Google Fonts `<link>` is render-blocking — eliminates a critical request chain
- `@fontsource` bundles only needed weights (400, 500, 600, 700), served from same origin
- No DNS lookup / TLS handshake to `fonts.googleapis.com` + `fonts.gstatic.com`
- Alternative (preload + font-display:swap) still requires external requests; self-hosting is strictly better for LCP

### 2. Cache headers: SvelteKit `handle` hook with route-based cache policies

**Chosen**: Add a `handle` function in `hooks.server.ts` that sets `Cache-Control` headers based on route patterns.

Cache strategy:
| Route pattern | Cache-Control | Rationale |
|---|---|---|
| `/terms`, `/privacy` | `public, max-age=86400, s-maxage=86400` | Static legal pages, rarely change |
| `/planes` | `public, max-age=3600, s-maxage=3600` | Pricing may change occasionally |
| `/[slug]` (category pages) | `public, max-age=300, s-maxage=600, stale-while-revalidate=300` | Dynamic but not real-time; 5min browser + 10min CDN |
| `/directorio/[id]` | `public, max-age=60, s-maxage=300, stale-while-revalidate=60` | Provider data changes; short cache with SWR |
| `/` (homepage) | `public, max-age=300, s-maxage=600` | Semi-static content |

**Why in hooks vs per-route**: Single place to manage all cache policies. Per-route `+server.ts` setHeaders would scatter logic across 10+ files.

### 3. Prerender static pages via SvelteKit `export const prerender = true`

**Chosen**: Add `export const prerender = true` in `+page.ts` for `/terms`, `/privacy`, `/planes`.

**Why**: These pages have no dynamic data dependencies. Prerendering generates static HTML at build time — zero TTFB, no server cost. SvelteKit adapter-node supports selective prerendering.

### 4. Fix redirect: 301 (permanent) instead of 302 (temporary)

**Chosen**: Change `redirect(302, target)` to `redirect(301, target)` in `src/routes/directorio/+page.server.ts`.

**Why**: `/directorio` always redirects to `/directorio/mapa`. A 302 tells Google the redirect is temporary and to keep indexing the original URL. A 301 tells Google to transfer all link equity to the target URL permanently.

### 5. Security headers: Add in `handle` hook alongside cache headers

**Chosen**: Set these headers on all responses via the `handle` hook:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (only if in production)

**Why**: These are free SEO trust signals. Google considers HTTPS and security posture. No performance cost, just response headers.

### 6. Dynamic OG images for provider pages

**Chosen**: Pass provider's `logo_url` or first photo URL as `image` prop to the SEO component on the provider detail page. Fall back to default OG image if none available.

**Why over generating OG images server-side**: Provider photos already exist in Supabase storage. No need for image generation — just reference the existing URL. Simpler, no new dependencies.

### 7. Homepage content enrichment approach

**Chosen**: Add two new semantic sections to `+page.svelte`:
1. **"How it works"** section (3-step process) with descriptive text
2. **Location coverage** section listing departments with category links

**Why**: Google needs crawlable text to understand page topical relevance. Current homepage has minimal text — mostly UI elements (search box, category icons). Adding 150-200 words of structured content gives Google more signals without cluttering the UX (sections below the fold).

### 8. Footer internal linking strategy

**Chosen**: Expand footer to include:
- All active categories (not just 5)
- Top departments as links to category+department pages
- "Popular searches" section with high-intent keyword links

**Why**: Footer links appear on every page. More internal links = deeper crawl coverage. Google uses internal link structure to understand site hierarchy and page importance.

### 9. Image optimization: Explicit dimensions + fetchpriority

**Chosen**: Add `width` and `height` attributes to all `<img>` tags. Add `fetchpriority="high"` to above-the-fold images (hero, provider logo on detail page).

**Why**: Missing dimensions cause CLS (Cumulative Layout Shift) as images load. `fetchpriority="high"` tells the browser to prioritize LCP-candidate images. Both are zero-cost HTML attributes.

### 10. Resource hints for external origins

**Chosen**: Add `<link rel="preconnect">` for Supabase storage URL (where images are served from) in `app.html`.

**Why**: Provider images load from Supabase storage. Preconnect eliminates DNS+TLS handshake latency for the first image request. Already done for Google Fonts (which we're removing), so we repurpose the pattern.

### 11. Trailing slash normalization

**Chosen**: Add `trailingSlash: 'never'` to `svelte.config.js` kit options.

**Why**: SvelteKit default is `'never'` but being explicit prevents future drift. Ensures `/electricistas` and `/electricistas/` resolve consistently, avoiding duplicate content signals.

## Risks / Trade-offs

- **Cache headers on dynamic content**: Stale data visible for up to 5-10 minutes on category/provider pages → Acceptable trade-off for SEO; data doesn't change in real-time, and `stale-while-revalidate` ensures fresh content is fetched in background
- **Self-hosting fonts increases bundle size**: ~100KB for 4 weights of Inter → Already precompressed (gzip/brotli), and eliminates 2 external requests; net positive for performance
- **Prerendering requires rebuild to update**: `/terms`, `/privacy`, `/planes` won't reflect changes until next deploy → These pages change extremely rarely; acceptable
- **301 redirect is permanent**: If we ever want `/directorio` to not redirect, browsers may cache the 301 → Unlikely scenario; `/directorio` has always been a redirect and will remain so
- **Homepage content changes affect design**: Adding text sections changes visual layout → Keep sections minimal and below-the-fold; doesn't affect the primary search UX
