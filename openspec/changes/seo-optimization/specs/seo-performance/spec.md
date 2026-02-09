## ADDED Requirements

### Requirement: Self-hosted font loading
The system SHALL serve the Inter font family from the application bundle instead of loading it from Google Fonts CDN. The font SHALL include weights 400, 500, 600, and 700. The render-blocking Google Fonts `<link>` tags SHALL be removed from the layout.

#### Scenario: Font loads without external requests
- **WHEN** a page loads in the browser
- **THEN** no network requests are made to `fonts.googleapis.com` or `fonts.gstatic.com`
- **AND** the Inter font renders correctly at all 4 weights (400, 500, 600, 700)

#### Scenario: No render-blocking font resources
- **WHEN** Google Lighthouse audits the page
- **THEN** no render-blocking resources from external font CDNs appear in the report

### Requirement: HTTP cache headers on page responses
The system SHALL set `Cache-Control` response headers on all public pages via a centralized `handle` hook. Cache policies SHALL vary by route pattern:

- `/terms`, `/privacy`: `public, max-age=86400, s-maxage=86400`
- `/planes`: `public, max-age=3600, s-maxage=3600`
- `/` (homepage): `public, max-age=300, s-maxage=600`
- `/[slug]` (category pages): `public, max-age=300, s-maxage=600, stale-while-revalidate=300`
- `/directorio/[id]` (provider pages): `public, max-age=60, s-maxage=300, stale-while-revalidate=60`

Auth pages (`/auth/*`), API routes (`/api/*`), and admin pages (`/admin/*`) SHALL NOT receive public cache headers.

#### Scenario: Category page returns cache headers
- **WHEN** a request is made to `/electricistas`
- **THEN** the response includes header `Cache-Control: public, max-age=300, s-maxage=600, stale-while-revalidate=300`

#### Scenario: Static legal page returns long cache
- **WHEN** a request is made to `/terms`
- **THEN** the response includes header `Cache-Control: public, max-age=86400, s-maxage=86400`

#### Scenario: Auth pages are not cached publicly
- **WHEN** a request is made to `/auth/login`
- **THEN** the response does NOT include a `public` cache-control directive

### Requirement: Prerender static pages
The pages `/terms`, `/privacy`, and `/planes` SHALL be prerendered at build time as static HTML. Each route SHALL export `prerender = true`.

#### Scenario: Static pages served as prerendered HTML
- **WHEN** the application is built
- **THEN** static HTML files are generated for `/terms`, `/privacy`, and `/planes`
- **AND** these pages load with zero server-side computation at request time

### Requirement: Security response headers
The system SHALL set the following headers on all responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production only)

#### Scenario: Security headers present on all pages
- **WHEN** a request is made to any page
- **THEN** the response includes `X-Content-Type-Options: nosniff`
- **AND** the response includes `X-Frame-Options: SAMEORIGIN`
- **AND** the response includes `Referrer-Policy: strict-origin-when-cross-origin`

#### Scenario: HSTS header in production
- **WHEN** the application runs in production environment
- **THEN** responses include `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Requirement: Resource hints for external origins
The application SHALL include `<link rel="preconnect">` tags in `app.html` for the Supabase storage origin where provider images are served from.

#### Scenario: Preconnect tag present in HTML
- **WHEN** any page is loaded
- **THEN** the HTML `<head>` contains a `<link rel="preconnect">` pointing to the Supabase storage domain
