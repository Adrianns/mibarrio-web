// JSON-LD Schema builders for structured data
import { SITE_NAME, SITE_URL } from './constants';

export interface OrganizationSchema {
	'@context': string;
	'@type': string;
	name: string;
	url: string;
	logo: string;
	description: string;
}

export function buildOrganizationSchema(description: string): OrganizationSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: SITE_URL,
		logo: `${SITE_URL}/og-image.png`,
		description
	};
}

export interface LocalBusinessSchema {
	'@context': string;
	'@type': string | string[];
	name: string;
	description: string;
	url: string;
	image?: string;
	telephone?: string;
	address?: {
		'@type': string;
		addressLocality?: string;
		addressRegion?: string;
		addressCountry: string;
	};
}

export interface LocalBusinessData {
	id: string;
	name: string;
	description: string;
	phone?: string;
	city?: string;
	department?: string;
	logo_url?: string;
	category?: string;
}

export function buildLocalBusinessSchema(business: LocalBusinessData): LocalBusinessSchema {
	const schema: LocalBusinessSchema = {
		'@context': 'https://schema.org',
		'@type': business.category ? ['LocalBusiness', business.category] : 'LocalBusiness',
		name: business.name,
		description: business.description || `${business.name} en Mi Barrio`,
		url: `${SITE_URL}/directorio/${business.id}`
	};

	if (business.logo_url) {
		schema.image = business.logo_url;
	}

	if (business.phone) {
		schema.telephone = business.phone;
	}

	if (business.city || business.department) {
		schema.address = {
			'@type': 'PostalAddress',
			addressCountry: 'UY'
		};
		if (business.city) {
			schema.address.addressLocality = business.city;
		}
		if (business.department) {
			schema.address.addressRegion = business.department;
		}
	}

	return schema;
}

export interface BreadcrumbItem {
	name: string;
	url: string;
}

export interface BreadcrumbSchema {
	'@context': string;
	'@type': string;
	itemListElement: Array<{
		'@type': string;
		position: number;
		name: string;
		item: string;
	}>;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
		}))
	};
}

export interface ItemListSchema {
	'@context': string;
	'@type': string;
	itemListElement: Array<{
		'@type': string;
		position: number;
		url: string;
		name: string;
	}>;
}

export interface ItemListItem {
	id: string;
	name: string;
}

export function buildItemListSchema(items: ItemListItem[]): ItemListSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			url: `${SITE_URL}/directorio/${item.id}`,
			name: item.name
		}))
	};
}
