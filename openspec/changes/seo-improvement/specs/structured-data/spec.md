## ADDED Requirements

### Requirement: Homepage includes Organization schema
The system SHALL include JSON-LD Organization schema on the homepage.

#### Scenario: Organization schema present
- **WHEN** homepage is rendered
- **THEN** document contains script type="application/ld+json" with @type="Organization"

#### Scenario: Organization schema content
- **WHEN** homepage is rendered
- **THEN** Organization schema includes name, url, and logo properties

### Requirement: Provider detail page includes LocalBusiness schema
The system SHALL include JSON-LD LocalBusiness schema on provider detail pages.

#### Scenario: LocalBusiness schema present
- **WHEN** provider detail page is rendered for provider "Plomería López"
- **THEN** document contains script type="application/ld+json" with @type="LocalBusiness"

#### Scenario: LocalBusiness required properties
- **WHEN** provider detail page is rendered
- **THEN** LocalBusiness schema includes: name, description, address (if available), telephone (if available)

#### Scenario: LocalBusiness with category
- **WHEN** provider has category "Electricista"
- **THEN** LocalBusiness schema includes @type array with "LocalBusiness" and appropriate subcategory

### Requirement: Directory page includes ItemList schema
The system SHALL include JSON-LD ItemList schema on the directory listing page.

#### Scenario: ItemList schema present
- **WHEN** directory page is rendered with providers
- **THEN** document contains script type="application/ld+json" with @type="ItemList"

#### Scenario: ItemList contains provider references
- **WHEN** directory shows 10 providers
- **THEN** ItemList schema includes itemListElement array with 10 ListItem entries

### Requirement: Breadcrumb schema on detail pages
The system SHALL include JSON-LD BreadcrumbList schema on provider detail pages.

#### Scenario: Breadcrumb structure
- **WHEN** provider detail page is rendered for provider in category "Servicios"
- **THEN** BreadcrumbList schema shows path: Inicio > Directorio > {Provider Name}

#### Scenario: Breadcrumb position numbering
- **WHEN** breadcrumb schema is generated
- **THEN** each BreadcrumbListItem has sequential position starting from 1

### Requirement: JSON-LD schemas are valid
The system SHALL generate valid JSON-LD that passes Google's Rich Results Test.

#### Scenario: Valid JSON syntax
- **WHEN** any page with structured data is rendered
- **THEN** JSON-LD script content is valid JSON

#### Scenario: Required context
- **WHEN** any JSON-LD schema is generated
- **THEN** schema includes @context="https://schema.org"
