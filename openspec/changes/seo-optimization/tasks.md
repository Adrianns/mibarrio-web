## 1. Font Loading Optimization

- [x] 1.1 Install `@fontsource/inter` package
- [x] 1.2 Import Inter weights (400, 500, 600, 700) in `src/app.css`
- [x] 1.3 Remove Google Fonts `<link>` and `<link rel="preconnect">` tags from `src/routes/+layout.svelte`

## 2. Server Hooks (Cache + Security Headers)

- [x] 2.1 Add `handle` function to `src/hooks.server.ts` with route-based `Cache-Control` headers
- [x] 2.2 Add security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security`) to all responses in the `handle` hook
- [x] 2.3 Ensure auth/api/admin routes are excluded from public cache headers

## 3. Prerender Static Pages

- [x] 3.1 Create `src/routes/terms/+page.ts` with `export const prerender = true`
- [x] 3.2 Create `src/routes/privacy/+page.ts` with `export const prerender = true`
- [x] 3.3 Create `src/routes/planes/+page.ts` with `export const prerender = true`

## 4. Technical SEO Fixes

- [x] 4.1 Change redirect from 302 to 301 in `src/routes/directorio/+page.server.ts`
- [x] 4.2 Add `trailingSlash: 'never'` to `svelte.config.js` kit options

## 5. Resource Hints

- [x] 5.1 Replace Google Fonts preconnect with Supabase storage preconnect in `src/app.html`

## 6. Dynamic OG Images for Providers

- [x] 6.1 Pass provider `logo_url` or first photo as `image` prop to SEO component in `src/routes/directorio/[id]/+page.svelte`

## 7. Image Optimization

- [x] 7.1 Add explicit `width` and `height` attributes to provider logo `<img>` tags in listing components
- [x] 7.2 Add explicit `width` and `height` to images in `src/routes/directorio/[id]/+page.svelte`
- [x] 7.3 Add `fetchpriority="high"` to above-the-fold provider logo/photo images

## 8. Homepage Content Enrichment

- [x] 8.1 Add "Cómo funciona" section with 3-step description (search, compare, contact) to `src/routes/+page.svelte`
- [x] 8.2 Add department coverage section with links to category+department pages on homepage

## 9. Footer Internal Linking Expansion

- [x] 9.1 Expand footer to show all active categories as links
- [x] 9.2 Add top department links (Montevideo, Canelones, Maldonado, etc.) to footer
- [x] 9.3 Add "Búsquedas populares" section with high-intent keyword links in footer

## 10. Verification

- [x] 10.1 Build the app and verify prerendered pages are generated
- [x] 10.2 Test the app locally and verify all pages render correctly
- [x] 10.3 Verify no external font requests in browser DevTools Network tab
- [x] 10.4 Verify cache and security headers in response via DevTools
