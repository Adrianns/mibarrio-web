## ADDED Requirements

### Requirement: Sitemap endpoint returns valid XML
The system SHALL expose a /sitemap.xml endpoint that returns valid XML sitemap format.

#### Scenario: Request sitemap
- **WHEN** GET request is made to /sitemap.xml
- **THEN** response has Content-Type "application/xml" and status 200

#### Scenario: Valid XML structure
- **WHEN** sitemap is requested
- **THEN** response contains valid XML with urlset root element and xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"

### Requirement: Sitemap includes static pages
The system SHALL include all public static pages in the sitemap.

#### Scenario: Static pages listed
- **WHEN** sitemap is generated
- **THEN** sitemap contains URLs for: /, /directorio, /planes, /privacy, /terms

### Requirement: Sitemap includes provider detail pages
The system SHALL include all active provider detail pages in the sitemap.

#### Scenario: Provider pages listed
- **WHEN** sitemap is generated and there are 3 active providers with IDs 1, 2, 3
- **THEN** sitemap contains URLs for /directorio/1, /directorio/2, /directorio/3

#### Scenario: Inactive providers excluded
- **WHEN** sitemap is generated and provider with ID 4 has status "inactive"
- **THEN** sitemap does NOT contain URL for /directorio/4

### Requirement: Sitemap URLs have priority and changefreq
The system SHALL include priority and changefreq hints for search engines.

#### Scenario: Homepage priority
- **WHEN** sitemap is generated
- **THEN** homepage URL has priority="1.0" and changefreq="daily"

#### Scenario: Provider page priority
- **WHEN** sitemap is generated
- **THEN** provider detail URLs have priority="0.8" and changefreq="weekly"

#### Scenario: Static page priority
- **WHEN** sitemap is generated
- **THEN** static pages (privacy, terms) have priority="0.3" and changefreq="monthly"

### Requirement: Sitemap includes lastmod dates
The system SHALL include lastmod date for provider pages based on their updated_at timestamp.

#### Scenario: Provider with recent update
- **WHEN** provider was updated on 2024-01-15
- **THEN** provider URL in sitemap has lastmod="2024-01-15"
