## 1. Setup

- [x] 1.1 Create `/src/lib/seo/` directory structure
- [x] 1.2 Create constants file with site defaults (name, description, default OG image URL)
- [x] 1.3 Add default OG image to `/static/og-image.png` (1200x630px placeholder)

## 2. SEO Component

- [x] 2.1 Create `SEO.svelte` component with props: title, description, url, image, type
- [x] 2.2 Implement OpenGraph meta tags (og:title, og:description, og:image, og:url, og:type)
- [x] 2.3 Implement Twitter Card meta tags (twitter:card, twitter:title, twitter:description, twitter:image)
- [x] 2.4 Implement canonical URL tag with fallback to current URL
- [x] 2.5 Implement page title with "{title} - {siteName}" format
- [x] 2.6 Implement meta description with fallback to site default

## 3. Structured Data

- [x] 3.1 Create JSON-LD schema builder utilities in `/src/lib/seo/schemas.ts`
- [x] 3.2 Implement Organization schema builder for homepage
- [x] 3.3 Implement LocalBusiness schema builder for provider detail pages
- [x] 3.4 Implement BreadcrumbList schema builder
- [x] 3.5 Implement ItemList schema builder for directory page
- [x] 3.6 Add JSON-LD rendering to SEO component

## 4. Sitemap

- [x] 4.1 Create `/src/routes/sitemap.xml/+server.ts` endpoint
- [x] 4.2 Implement static pages listing with priorities
- [x] 4.3 Query active providers from Supabase
- [x] 4.4 Generate XML with proper urlset structure
- [x] 4.5 Add lastmod dates from provider updated_at
- [x] 4.6 Set appropriate cache headers

## 5. Integration

- [x] 5.1 Replace svelte:head in homepage with SEO component + Organization schema
- [x] 5.2 Update provider detail page with SEO component + LocalBusiness + Breadcrumb schemas
- [x] 5.3 Update directory page with SEO component + ItemList schema
- [x] 5.4 Update remaining pages (planes, privacy, terms, auth) with SEO component
- [x] 5.5 Remove old redundant meta tag code from layout

## 6. Validation

- [x] 6.1 Test sitemap.xml returns valid XML
- [x] 6.2 Verify OpenGraph tags with social media debuggers
- [x] 6.3 Test JSON-LD with Google Rich Results Test
- [x] 6.4 Verify canonical URLs are correct on all pages
