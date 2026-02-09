## ADDED Requirements

### Requirement: Permanent redirect for directorio
The `/directorio` route SHALL use a 301 (permanent) redirect instead of the current 302 (temporary) redirect when redirecting to `/directorio/mapa`.

#### Scenario: Directorio redirects with 301
- **WHEN** a request is made to `/directorio`
- **THEN** the server responds with HTTP status 301
- **AND** the `Location` header points to `/directorio/mapa`

#### Scenario: Directorio with query params redirects with 301
- **WHEN** a request is made to `/directorio?departamento=Montevideo`
- **THEN** the server responds with HTTP status 301
- **AND** the `Location` header points to `/directorio/mapa?departamento=Montevideo`

### Requirement: Trailing slash normalization
The SvelteKit configuration SHALL explicitly set `trailingSlash: 'never'` to ensure all URLs resolve without a trailing slash. Requests to URLs with trailing slashes SHALL be redirected to their non-trailing-slash equivalents.

#### Scenario: URL without trailing slash resolves normally
- **WHEN** a request is made to `/electricistas`
- **THEN** the page renders successfully with HTTP 200

#### Scenario: URL with trailing slash redirects
- **WHEN** a request is made to `/electricistas/`
- **THEN** the server redirects to `/electricistas` with a 308 status

### Requirement: Dynamic OG images for provider pages
The provider detail page (`/directorio/[id]`) SHALL pass the provider's image as the `image` prop to the SEO component. The image selection priority SHALL be:
1. Provider `logo_url` if available
2. First provider photo URL if available
3. Default site OG image as fallback

#### Scenario: Provider with logo gets dynamic OG image
- **WHEN** a provider page loads for a provider with a `logo_url`
- **THEN** the `<meta property="og:image">` tag contains the provider's logo URL
- **AND** the `<meta name="twitter:image">` tag contains the provider's logo URL

#### Scenario: Provider without logo uses photo
- **WHEN** a provider page loads for a provider without `logo_url` but with photos
- **THEN** the `<meta property="og:image">` tag contains the first photo URL

#### Scenario: Provider without any images uses default
- **WHEN** a provider page loads for a provider with no `logo_url` and no photos
- **THEN** the `<meta property="og:image">` tag contains the default site OG image (`/og-image.png`)
