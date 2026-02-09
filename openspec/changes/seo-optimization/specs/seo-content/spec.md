## ADDED Requirements

### Requirement: Homepage content enrichment
The homepage SHALL include additional crawlable text content below the existing hero and categories sections. The content SHALL include:
1. A "How it works" section with 3 steps describing the user flow (search, compare, contact)
2. A "Location coverage" section listing the departments of Uruguay with links to category+department pages

The content SHALL be semantic HTML (proper heading hierarchy: h2 for section titles, h3 for sub-items) and SHALL appear below the fold to not disrupt the primary search UX.

#### Scenario: Homepage has descriptive content sections
- **WHEN** Google crawls the homepage
- **THEN** the page contains at least 150 words of descriptive text content beyond the search UI
- **AND** the content includes an `<h2>` heading for "How it works" (or equivalent in Spanish)
- **AND** the content includes an `<h2>` heading for location/department coverage

#### Scenario: Department links are present on homepage
- **WHEN** a user views the homepage
- **THEN** department names are displayed as links pointing to category landing pages (e.g., `/electricistas-montevideo`)

### Requirement: Expanded footer internal linking
The footer component SHALL be expanded to include:
1. All active service categories as links (not just the current top 5)
2. Top departments as links to department-level category pages
3. A "Popular searches" section with high-intent keyword phrases linking to relevant category+location pages

#### Scenario: Footer shows all active categories
- **WHEN** any page renders
- **THEN** the footer contains links to all active categories (electricistas, plomeros, cerrajeros, albañiles, pintores, mecánicos, técnico PC, restaurantes, farmacias, etc.)

#### Scenario: Footer shows department links
- **WHEN** any page renders
- **THEN** the footer contains links to at least Montevideo, Canelones, and Maldonado category pages

#### Scenario: Footer shows popular search links
- **WHEN** any page renders
- **THEN** the footer contains at least 5 high-intent search phrase links (e.g., "Electricistas en Montevideo", "Plomeros 24 horas")

### Requirement: Image dimension attributes
All `<img>` elements in the application SHALL include explicit `width` and `height` attributes to prevent Cumulative Layout Shift (CLS). Above-the-fold images (provider logos on listing pages, hero images) SHALL include `fetchpriority="high"`.

#### Scenario: Provider logo has explicit dimensions
- **WHEN** a provider card renders with a logo image
- **THEN** the `<img>` tag includes `width` and `height` attributes

#### Scenario: Above-the-fold images have high fetch priority
- **WHEN** a provider detail page loads with a provider logo
- **THEN** the logo `<img>` tag includes `fetchpriority="high"`

#### Scenario: No CLS from image loading
- **WHEN** images load on any page
- **THEN** the page layout does not shift (CLS contribution from images is 0)
