import { DEFAULT_CATEGORIES, DEPARTMENTS, type Department, type MontevideoNeighborhood } from '$lib/domain/types';

// Map category name to URL slug (lowercase, no accents)
export const CATEGORY_SLUGS: Record<string, string> = {
	electricista: 'electricistas',
	plomero: 'plomeros',
	albanil: 'albaniles',
	pintor: 'pintores',
	carpintero: 'carpinteros',
	jardinero: 'jardineros',
	mecanico: 'mecanicos',
	'tecnico-pc': 'tecnicos-pc',
	cerrajero: 'cerrajeros',
	mudanzas: 'mudanzas',
	limpieza: 'limpieza',
	'cuidado-personas': 'cuidadores',
	veterinario: 'veterinarios',
	abogado: 'abogados',
	contador: 'contadores',
	restaurante: 'restaurantes',
	cafe: 'cafes',
	panaderia: 'panaderias',
	carniceria: 'carnicerias',
	verduleria: 'verdulerias',
	farmacia: 'farmacias',
	ferreteria: 'ferreterias',
	peluqueria: 'peluquerias',
	gimnasio: 'gimnasios',
	veterinaria: 'veterinarias',
	lavadero: 'lavaderos',
	kiosco: 'kioscos',
	mercado: 'mercados',
	taller: 'talleres',
	imprenta: 'imprentas',
	floreria: 'florerias',
	libreria: 'librerias',
	optica: 'opticas',
	informatica: 'informatica',
	ingenieria: 'ingenieria',
	otro: 'otros'
};

// Reverse mapping: slug to category name
export const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
	Object.entries(CATEGORY_SLUGS).map(([k, v]) => [v, k])
);

// Department slug mapping (lowercase, no accents, hyphenated)
export const DEPARTMENT_SLUGS: Record<Department, string> = {
	Artigas: 'artigas',
	Canelones: 'canelones',
	'Cerro Largo': 'cerro-largo',
	Colonia: 'colonia',
	Durazno: 'durazno',
	Flores: 'flores',
	Florida: 'florida',
	Lavalleja: 'lavalleja',
	Maldonado: 'maldonado',
	Montevideo: 'montevideo',
	Paysandú: 'paysandu',
	Rivera: 'rivera',
	'Río Negro': 'rio-negro',
	Rocha: 'rocha',
	Salto: 'salto',
	'San José': 'san-jose',
	Soriano: 'soriano',
	Tacuarembó: 'tacuarembo',
	'Treinta y Tres': 'treinta-y-tres'
};

// Reverse mapping: slug to department name
export const SLUG_TO_DEPARTMENT: Record<string, Department> = Object.fromEntries(
	Object.entries(DEPARTMENT_SLUGS).map(([k, v]) => [v, k as Department])
) as Record<string, Department>;

// Montevideo neighborhood slug mapping (lowercase, no accents, hyphenated)
export const NEIGHBORHOOD_SLUGS: Record<MontevideoNeighborhood, string> = {
	Aguada: 'aguada',
	'Barrio Sur': 'barrio-sur',
	'Brazo Oriental': 'brazo-oriental',
	Buceo: 'buceo',
	Carrasco: 'carrasco',
	Centro: 'centro',
	Cerro: 'cerro',
	'Ciudad Vieja': 'ciudad-vieja',
	Colón: 'colon',
	Cordón: 'cordon',
	Goes: 'goes',
	'Jacinto Vera': 'jacinto-vera',
	'La Blanqueada': 'la-blanqueada',
	'La Teja': 'la-teja',
	Malvín: 'malvin',
	Manga: 'manga',
	Palermo: 'palermo',
	'Parque Batlle': 'parque-batlle',
	'Parque Rodó': 'parque-rodo',
	'Paso Molino': 'paso-molino',
	Peñarol: 'penarol',
	'Piedras Blancas': 'piedras-blancas',
	Pocitos: 'pocitos',
	Prado: 'prado',
	'Punta Carretas': 'punta-carretas',
	Reducto: 'reducto',
	Sayago: 'sayago',
	'Tres Cruces': 'tres-cruces',
	Unión: 'union',
	'Villa Española': 'villa-espanola'
};

// Reverse mapping: slug to neighborhood name
export const SLUG_TO_NEIGHBORHOOD: Record<string, MontevideoNeighborhood> = Object.fromEntries(
	Object.entries(NEIGHBORHOOD_SLUGS).map(([k, v]) => [v, k as MontevideoNeighborhood])
) as Record<string, MontevideoNeighborhood>;

// Get all valid category slugs
export const VALID_CATEGORY_SLUGS = Object.values(CATEGORY_SLUGS);

// Get all valid department slugs
export const VALID_DEPARTMENT_SLUGS = Object.values(DEPARTMENT_SLUGS);

// Get all valid neighborhood slugs
export const VALID_NEIGHBORHOOD_SLUGS = Object.values(NEIGHBORHOOD_SLUGS);

// Parse a combined slug like "electricistas-montevideo-pocitos", "electricistas-montevideo" or just "electricistas"
export function parseLocationSlug(slug: string): {
	category: string | null;
	categorySlug: string | null;
	categoryLabel: string | null;
	department: Department | null;
	departmentSlug: string | null;
	neighborhood: MontevideoNeighborhood | null;
	neighborhoodSlug: string | null;
} {
	// First try: category + montevideo + neighborhood (most specific)
	// Pattern: electricistas-montevideo-pocitos
	for (const [catName, catSlug] of Object.entries(CATEGORY_SLUGS)) {
		for (const [nbName, nbSlug] of Object.entries(NEIGHBORHOOD_SLUGS)) {
			const combined = `${catSlug}-montevideo-${nbSlug}`;
			if (slug === combined) {
				const category = DEFAULT_CATEGORIES.find((c) => c.name === catName);
				return {
					category: catName,
					categorySlug: catSlug,
					categoryLabel: category?.label || catSlug,
					department: 'Montevideo' as Department,
					departmentSlug: 'montevideo',
					neighborhood: nbName as MontevideoNeighborhood,
					neighborhoodSlug: nbSlug
				};
			}
		}
	}

	// Second try: category + department combination
	for (const [catName, catSlug] of Object.entries(CATEGORY_SLUGS)) {
		for (const [deptName, deptSlug] of Object.entries(DEPARTMENT_SLUGS)) {
			const combined = `${catSlug}-${deptSlug}`;
			if (slug === combined) {
				const category = DEFAULT_CATEGORIES.find((c) => c.name === catName);
				return {
					category: catName,
					categorySlug: catSlug,
					categoryLabel: category?.label || catSlug,
					department: deptName as Department,
					departmentSlug: deptSlug,
					neighborhood: null,
					neighborhoodSlug: null
				};
			}
		}
	}

	// Third try: just category
	if (SLUG_TO_CATEGORY[slug]) {
		const catName = SLUG_TO_CATEGORY[slug];
		const category = DEFAULT_CATEGORIES.find((c) => c.name === catName);
		return {
			category: catName,
			categorySlug: slug,
			categoryLabel: category?.label || slug,
			department: null,
			departmentSlug: null,
			neighborhood: null,
			neighborhoodSlug: null
		};
	}

	return {
		category: null,
		categorySlug: null,
		categoryLabel: null,
		department: null,
		departmentSlug: null,
		neighborhood: null,
		neighborhoodSlug: null
	};
}

// Generate all valid slugs for sitemap with priorities
export function generateAllCategorySlugs(): Array<{ slug: string; priority: number }> {
	const slugs: Array<{ slug: string; priority: number }> = [];

	// Category only (highest priority: 0.9)
	for (const catSlug of VALID_CATEGORY_SLUGS) {
		if (catSlug !== 'otros') {
			slugs.push({ slug: catSlug, priority: 0.9 });
		}
	}

	// Category + Department (medium priority: 0.85)
	const mainDepartments: Department[] = ['Montevideo', 'Canelones', 'Maldonado', 'Salto', 'Paysandú'];
	for (const catSlug of VALID_CATEGORY_SLUGS) {
		if (catSlug !== 'otros') {
			for (const dept of mainDepartments) {
				slugs.push({ slug: `${catSlug}-${DEPARTMENT_SLUGS[dept]}`, priority: 0.85 });
			}
		}
	}

	// Category + Montevideo + Neighborhood (neighborhood priority: 0.8)
	for (const catSlug of VALID_CATEGORY_SLUGS) {
		if (catSlug !== 'otros') {
			for (const nbSlug of VALID_NEIGHBORHOOD_SLUGS) {
				slugs.push({ slug: `${catSlug}-montevideo-${nbSlug}`, priority: 0.8 });
			}
		}
	}

	return slugs;
}

// Get SEO title for a category page
export function getCategoryPageTitle(categoryLabel: string, department?: string | null): string {
	if (department) {
		return `${categoryLabel} en ${department} - Directorio Mi Barrio`;
	}
	return `${categoryLabel} en Uruguay - Directorio Mi Barrio`;
}

// Get SEO description for a category page
export function getCategoryPageDescription(
	categoryLabel: string,
	department?: string | null
): string {
	const location = department ? `en ${department}` : 'en Uruguay';
	return `Encontrá los mejores ${categoryLabel.toLowerCase()} ${location}. Contactá directamente por WhatsApp o teléfono. Directorio gratuito de servicios y negocios locales.`;
}

// Get FAQ content for a category
export function getCategoryFAQs(
	categoryLabel: string,
	categoryName: string,
	department?: string | null
): Array<{ question: string; answer: string }> {
	const location = department || 'Uruguay';
	const isService =
		DEFAULT_CATEGORIES.find((c) => c.name === categoryName)?.category_type === 'service';

	if (isService) {
		return [
			{
				question: `¿Cómo encontrar ${categoryLabel.toLowerCase()} en ${location}?`,
				answer: `En Mi Barrio podés encontrar ${categoryLabel.toLowerCase()} verificados en ${location}. Buscá por barrio, consultá las reseñas y contactá directamente por WhatsApp o teléfono.`
			},
			{
				question: `¿Cuánto cobra un ${categoryLabel.toLowerCase().replace(/s$/, '')} en ${location}?`,
				answer: `Los precios varían según el trabajo. Te recomendamos contactar a varios ${categoryLabel.toLowerCase()} para pedir presupuestos sin compromiso.`
			},
			{
				question: `¿Los ${categoryLabel.toLowerCase()} de Mi Barrio son confiables?`,
				answer: `Todos los profesionales en Mi Barrio tienen perfiles verificados. Podés ver sus datos de contacto, fotos de trabajos y contactarlos directamente.`
			}
		];
	}

	return [
		{
			question: `¿Dónde encontrar ${categoryLabel.toLowerCase()} en ${location}?`,
			answer: `En Mi Barrio tenés un directorio completo de ${categoryLabel.toLowerCase()} en ${location}. Podés filtrar por barrio y ver sus horarios y datos de contacto.`
		},
		{
			question: `¿Cómo contactar ${categoryLabel.toLowerCase()} en ${location}?`,
			answer: `Desde Mi Barrio podés llamar, enviar WhatsApp o ver la ubicación de cada negocio. Es gratis y sin intermediarios.`
		}
	];
}
