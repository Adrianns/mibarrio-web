## ADDED Requirements

### Requirement: SEO component renders OpenGraph meta tags
The system SHALL render OpenGraph meta tags (og:title, og:description, og:image, og:url, og:type) in the document head when the SEO component is used.

#### Scenario: Page with custom title and description
- **WHEN** SEO component is rendered with title="Mi Negocio" and description="Servicios de plomería"
- **THEN** the document head contains `<meta property="og:title" content="Mi Negocio">` and `<meta property="og:description" content="Servicios de plomería">`

#### Scenario: Page without custom image
- **WHEN** SEO component is rendered without an image prop
- **THEN** the document head contains `<meta property="og:image">` with the default OG image URL

### Requirement: SEO component renders Twitter Card meta tags
The system SHALL render Twitter Card meta tags (twitter:card, twitter:title, twitter:description, twitter:image) in the document head.

#### Scenario: Twitter card with summary large image
- **WHEN** SEO component is rendered with title and description
- **THEN** the document head contains `<meta name="twitter:card" content="summary_large_image">`

### Requirement: SEO component renders canonical URL
The system SHALL render a canonical link tag to prevent duplicate content issues.

#### Scenario: Page with explicit URL
- **WHEN** SEO component is rendered with url="/directorio/123"
- **THEN** the document head contains `<link rel="canonical" href="https://mibarrio.app/directorio/123">`

#### Scenario: Page without explicit URL
- **WHEN** SEO component is rendered without url prop
- **THEN** the document head contains canonical link with current page URL

### Requirement: SEO component sets page title
The system SHALL set the document title with consistent format "{title} - {siteName}".

#### Scenario: Custom page title
- **WHEN** SEO component is rendered with title="Directorio"
- **THEN** the document title is "Directorio - Mi Barrio"

#### Scenario: Homepage title
- **WHEN** SEO component is rendered on homepage without title override
- **THEN** the document title is "Mi Barrio - Encontrá servicios locales en tu barrio"

### Requirement: SEO component renders meta description
The system SHALL render a meta description tag with provided or default content.

#### Scenario: Custom description
- **WHEN** SEO component is rendered with description="Encuentra electricistas cerca"
- **THEN** the document head contains `<meta name="description" content="Encuentra electricistas cerca">`

#### Scenario: Missing description with fallback
- **WHEN** SEO component is rendered without description prop
- **THEN** the document head contains meta description with site default description
