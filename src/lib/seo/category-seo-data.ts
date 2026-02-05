// Category-specific SEO data optimized for Google search patterns in Uruguay
import type { Department } from '$lib/domain/types';

export interface CategorySEOData {
	// Meta tags
	titleTemplate: string; // Use {location} placeholder
	descriptionTemplate: string;
	// Keywords for content
	keywords: string[];
	// Extended FAQs targeting real search queries
	faqs: Array<{ question: string; answer: string }>;
	// Related services people search for
	relatedServices: string[];
	// Common problems/needs (for content)
	commonNeeds: string[];
}

// SEO data per category - targeting actual Google searches
export const CATEGORY_SEO_DATA: Record<string, CategorySEOData> = {
	electricista: {
		titleTemplate: 'Electricistas en {location} - Servicio 24 Horas | Mi Barrio',
		descriptionTemplate:
			'Encontrá electricistas en {location} ✓ Urgencias 24 horas ✓ Autorizados UTE ✓ Presupuesto sin cargo. Contactá directo por WhatsApp.',
		keywords: [
			'electricista urgente',
			'electricista 24 horas',
			'electricista a domicilio',
			'electricista autorizado UTE',
			'instalación eléctrica',
			'corto circuito',
			'tablero eléctrico',
			'electricista cerca de mi'
		],
		faqs: [
			{
				question: '¿Cuánto cobra un electricista en {location}?',
				answer:
					'El precio de un electricista en {location} varía según el trabajo. Una visita simple puede costar entre $800 y $1500, mientras que instalaciones completas dependen del tamaño. Pedí presupuesto sin cargo a varios electricistas en Mi Barrio.'
			},
			{
				question: '¿Dónde encontrar electricista urgente en {location}?',
				answer:
					'En Mi Barrio tenés electricistas con servicio de urgencia 24 horas en {location}. Filtrá por disponibilidad y contactá directo por WhatsApp para emergencias eléctricas.'
			},
			{
				question: '¿Cómo saber si un electricista está autorizado por UTE?',
				answer:
					'Los electricistas autorizados por UTE tienen carnet habilitante. En Mi Barrio podés ver los perfiles verificados y contactar directamente para consultar su habilitación.'
			},
			{
				question: '¿Qué hacer si se corta la luz en casa?',
				answer:
					'Primero verificá si el corte es general o solo en tu casa. Si es solo tuyo, revisá la llave térmica. Si no se soluciona, contactá un electricista urgente en Mi Barrio para diagnóstico.'
			}
		],
		relatedServices: ['instalación eléctrica', 'reparación tablero', 'iluminación', 'puesta a tierra'],
		commonNeeds: ['corto circuito', 'apagón', 'instalación nueva', 'cambio de llaves térmicas']
	},

	plomero: {
		titleTemplate: 'Plomeros en {location} - Urgencias 24hs | Mi Barrio',
		descriptionTemplate:
			'Plomeros y sanitarios en {location} ✓ Destape de cañerías ✓ Urgencias 24 horas ✓ Presupuesto gratis. Contactá directo por WhatsApp.',
		keywords: [
			'plomero urgente',
			'sanitario 24 horas',
			'destape de cañerías',
			'pérdida de agua',
			'plomero a domicilio',
			'desobstrucción',
			'plomero cerca de mi',
			'sanitario montevideo'
		],
		faqs: [
			{
				question: '¿Cuánto cobra un plomero en {location}?',
				answer:
					'Un plomero en {location} cobra aproximadamente $1000-$2000 por visita simple. Destapes de cañerías desde $1500. Reparaciones mayores requieren presupuesto. Pedí cotización sin cargo en Mi Barrio.'
			},
			{
				question: '¿Hay plomeros de urgencia 24 horas en {location}?',
				answer:
					'Sí, en Mi Barrio encontrás plomeros con servicio de emergencia las 24 horas en {location}. Ideales para pérdidas de agua, caños rotos o inundaciones.'
			},
			{
				question: '¿Qué hacer si tengo una pérdida de agua?',
				answer:
					'Cerrá la llave de paso principal para evitar daños mayores y contactá un plomero urgente. En Mi Barrio podés encontrar profesionales disponibles ahora mismo en {location}.'
			},
			{
				question: '¿Los plomeros de Mi Barrio hacen destape de cañerías?',
				answer:
					'Sí, muchos plomeros en {location} ofrecen servicio de destape y desobstrucción de cañerías. Consultá en el perfil de cada profesional o contactá directo por WhatsApp.'
			}
		],
		relatedServices: ['destape cañerías', 'instalación sanitaria', 'reparación calefón', 'cisterna'],
		commonNeeds: ['pérdida de agua', 'cañería tapada', 'goteo', 'instalación baño']
	},

	cerrajero: {
		titleTemplate: 'Cerrajeros en {location} - 24 Horas Urgencias | Mi Barrio',
		descriptionTemplate:
			'Cerrajeros en {location} ✓ Apertura de puertas 24hs ✓ Cambio de cerraduras ✓ Autos y casas. Llegamos rápido, contactá por WhatsApp.',
		keywords: [
			'cerrajero urgente',
			'cerrajero 24 horas',
			'apertura de puerta',
			'cambio de cerradura',
			'cerrajero a domicilio',
			'cerrajero de autos',
			'cerrajero cerca de mi',
			'cerrajería emergencia'
		],
		faqs: [
			{
				question: '¿Cuánto cobra un cerrajero en {location}?',
				answer:
					'Un cerrajero en {location} cobra desde $1200 por apertura simple. Cambio de cerradura desde $2000 más materiales. Servicio nocturno y feriados tiene recargo. Pedí presupuesto en Mi Barrio.'
			},
			{
				question: '¿Hay cerrajeros 24 horas en {location}?',
				answer:
					'Sí, en Mi Barrio encontrás cerrajeros con servicio de emergencia 24 horas en {location}, incluyendo domingos y feriados para aperturas urgentes.'
			},
			{
				question: '¿Pueden abrir la puerta sin romper la cerradura?',
				answer:
					'Sí, los cerrajeros profesionales en {location} utilizan técnicas de apertura no destructiva. Solo en casos extremos es necesario forzar. Consultá antes de contratar.'
			},
			{
				question: '¿Los cerrajeros de Mi Barrio trabajan con autos?',
				answer:
					'Algunos cerrajeros en {location} se especializan en vehículos. Filtrá en Mi Barrio o consultá en el perfil si ofrecen servicio de cerrajería automotriz.'
			}
		],
		relatedServices: ['apertura puerta', 'cambio cerradura', 'copia llaves', 'cerrajería auto'],
		commonNeeds: ['puerta trabada', 'perdí las llaves', 'cerradura rota', 'reforzar seguridad']
	},

	albanil: {
		titleTemplate: 'Albañiles en {location} - Reformas y Construcción | Mi Barrio',
		descriptionTemplate:
			'Albañiles en {location} ✓ Reformas ✓ Construcción ✓ Reparaciones. Presupuesto sin cargo. Encontrá profesionales verificados.',
		keywords: [
			'albañil reformas',
			'albañil construcción',
			'albañil a domicilio',
			'reparaciones albañilería',
			'albañil presupuesto',
			'albañil cerca de mi',
			'obra nueva',
			'refacción'
		],
		faqs: [
			{
				question: '¿Cuánto cobra un albañil en {location}?',
				answer:
					'Un albañil en {location} cobra entre $600-$1000 por día según experiencia. Trabajos por metro cuadrado varían: revoque $400-600/m², contrapiso $500-800/m². Pedí presupuesto detallado en Mi Barrio.'
			},
			{
				question: '¿Cómo encontrar un buen albañil en {location}?',
				answer:
					'En Mi Barrio podés ver fotos de trabajos anteriores, verificar datos de contacto y contactar directo. Pedí referencias y presupuesto por escrito antes de contratar.'
			},
			{
				question: '¿Los albañiles de Mi Barrio hacen reformas completas?',
				answer:
					'Sí, muchos albañiles en {location} realizan reformas integrales: baños, cocinas, ampliaciones. Consultá en el perfil o por WhatsApp qué servicios ofrecen.'
			}
		],
		relatedServices: ['reformas', 'construcción', 'revoque', 'contrapiso', 'mampostería'],
		commonNeeds: ['humedad', 'grietas', 'ampliación', 'reforma baño']
	},

	pintor: {
		titleTemplate: 'Pintores en {location} - Casas y Apartamentos | Mi Barrio',
		descriptionTemplate:
			'Pintores profesionales en {location} ✓ Interior y exterior ✓ Presupuesto gratis ✓ Trabajos garantizados. Contactá por WhatsApp.',
		keywords: [
			'pintor de casas',
			'pintor interior',
			'pintor exterior',
			'pintura apartamento',
			'pintor presupuesto',
			'pintor a domicilio',
			'pintor cerca de mi',
			'pintura látex'
		],
		faqs: [
			{
				question: '¿Cuánto cobra un pintor en {location}?',
				answer:
					'Un pintor en {location} cobra entre $150-$300 por metro cuadrado (sin materiales). Un ambiente estándar puede costar $3000-$6000. Pedí presupuesto detallado incluyendo preparación de paredes.'
			},
			{
				question: '¿El precio incluye la pintura?',
				answer:
					'Generalmente no. Los pintores en {location} suelen cotizar mano de obra por separado. Algunos ofrecen servicio completo con materiales. Consultá en Mi Barrio qué incluye cada presupuesto.'
			},
			{
				question: '¿Cuánto demora pintar un apartamento?',
				answer:
					'Un apartamento de 2 ambientes toma 2-3 días. Casas más grandes 5-7 días. El tiempo depende de preparación necesaria y cantidad de manos. Consultá con el pintor en {location}.'
			}
		],
		relatedServices: ['pintura interior', 'pintura exterior', 'empapelado', 'impermeabilización'],
		commonNeeds: ['pintar casa', 'humedad', 'renovar paredes', 'pintura nueva']
	},

	mecanico: {
		titleTemplate: 'Mecánicos en {location} - Taller y Domicilio | Mi Barrio',
		descriptionTemplate:
			'Mecánicos en {location} ✓ Service completo ✓ Diagnóstico ✓ Reparaciones. Encontrá talleres y mecánicos a domicilio.',
		keywords: [
			'mecánico automotriz',
			'taller mecánico',
			'mecánico a domicilio',
			'service auto',
			'reparación autos',
			'mecánico cerca de mi',
			'diagnóstico auto',
			'mecánico urgente'
		],
		faqs: [
			{
				question: '¿Cuánto cobra un mecánico en {location}?',
				answer:
					'La hora de mecánico en {location} va de $500-$1000 según especialidad. Un service básico $2000-$4000. Reparaciones mayores requieren diagnóstico. Pedí presupuesto en Mi Barrio.'
			},
			{
				question: '¿Hay mecánicos a domicilio en {location}?',
				answer:
					'Sí, algunos mecánicos en {location} ofrecen servicio a domicilio para reparaciones menores, cambio de batería, arranque con pinzas. Consultá en Mi Barrio quién ofrece este servicio.'
			},
			{
				question: '¿Cómo elegir un buen taller mecánico?',
				answer:
					'Buscá talleres con buenas referencias, que expliquen el problema claramente y den presupuesto por escrito. En Mi Barrio podés ver perfiles verificados y contactar directo.'
			}
		],
		relatedServices: ['service auto', 'cambio aceite', 'frenos', 'electricidad auto', 'scanner'],
		commonNeeds: ['auto no arranca', 'ruido motor', 'frenos', 'service']
	},

	'tecnico-pc': {
		titleTemplate: 'Técnicos PC en {location} - Reparación Computadoras | Mi Barrio',
		descriptionTemplate:
			'Técnicos de PC y notebooks en {location} ✓ Reparación ✓ Formateo ✓ A domicilio. Solucioná problemas de computadora rápido.',
		keywords: [
			'técnico pc',
			'reparación computadoras',
			'técnico notebook',
			'formateo pc',
			'técnico informático',
			'reparación laptop',
			'técnico a domicilio',
			'pc lenta'
		],
		faqs: [
			{
				question: '¿Cuánto cobra un técnico de PC en {location}?',
				answer:
					'Un técnico de PC en {location} cobra $800-$1500 por diagnóstico/visita. Formateo completo $1500-$2500. Reparaciones de hardware según repuesto. Pedí presupuesto en Mi Barrio.'
			},
			{
				question: '¿Hay técnicos de PC a domicilio en {location}?',
				answer:
					'Sí, muchos técnicos en {location} van a domicilio para diagnóstico y reparaciones. Ideal para problemas de software, virus o configuración. Contactá por WhatsApp en Mi Barrio.'
			},
			{
				question: '¿Pueden recuperar mis datos si la PC no prende?',
				answer:
					'En muchos casos sí. Los técnicos de {location} pueden intentar recuperar datos del disco duro. Consultá antes de formatear si tenés información importante.'
			}
		],
		relatedServices: ['formateo', 'limpieza virus', 'upgrade memoria', 'reparación pantalla'],
		commonNeeds: ['pc lenta', 'virus', 'no prende', 'pantalla rota']
	},

	restaurante: {
		titleTemplate: 'Restaurantes en {location} - Dónde Comer | Mi Barrio',
		descriptionTemplate:
			'Restaurantes en {location} ✓ Menú del día ✓ Delivery ✓ Reservas. Encontrá dónde comer cerca tuyo con teléfono y dirección.',
		keywords: [
			'restaurantes cerca',
			'donde comer',
			'restaurante delivery',
			'restaurante reservas',
			'comida casera',
			'restaurante económico',
			'restaurante familiar',
			'menú del día'
		],
		faqs: [
			{
				question: '¿Dónde comer bien en {location}?',
				answer:
					'En Mi Barrio encontrás restaurantes de todo tipo en {location}: comida casera, parrillas, pizzerías, cocina internacional. Filtrá por barrio y contactá directo para reservar.'
			},
			{
				question: '¿Qué restaurantes tienen delivery en {location}?',
				answer:
					'Muchos restaurantes en {location} ofrecen delivery. En Mi Barrio podés ver sus datos de contacto y pedir directo por teléfono o WhatsApp.'
			}
		],
		relatedServices: ['delivery', 'comida casera', 'parrilla', 'pizzería'],
		commonNeeds: ['comer afuera', 'delivery', 'reserva grupo', 'menú económico']
	},

	farmacia: {
		titleTemplate: 'Farmacias en {location} - Turnos y Delivery | Mi Barrio',
		descriptionTemplate:
			'Farmacias en {location} ✓ Farmacias de turno ✓ Delivery medicamentos ✓ Teléfonos y direcciones actualizadas.',
		keywords: [
			'farmacia de turno',
			'farmacia cerca',
			'farmacia 24 horas',
			'farmacia delivery',
			'medicamentos',
			'farmacia abierta',
			'farmacia nocturna'
		],
		faqs: [
			{
				question: '¿Dónde hay farmacia de turno en {location}?',
				answer:
					'En Mi Barrio podés encontrar farmacias en {location} con sus teléfonos para consultar turnos. Llamá antes de ir para confirmar disponibilidad del medicamento.'
			},
			{
				question: '¿Hay farmacias con delivery en {location}?',
				answer:
					'Sí, varias farmacias en {location} ofrecen delivery de medicamentos. Consultá en Mi Barrio los teléfonos y contactá directo para pedir envío a domicilio.'
			}
		],
		relatedServices: ['medicamentos', 'delivery', 'vacunas', 'test'],
		commonNeeds: ['medicamento urgente', 'farmacia abierta', 'turno noche']
	}
};

// Get SEO data for a category, with fallback
export function getCategorySEOData(categoryName: string): CategorySEOData | null {
	return CATEGORY_SEO_DATA[categoryName] || null;
}

// Build location string from department and neighborhood
function buildLocationString(department?: string | null, neighborhood?: string | null): string {
	if (neighborhood && department === 'Montevideo') {
		return `${neighborhood}, Montevideo`;
	}
	return department || 'Uruguay';
}

// Generate optimized title for a category page
export function getOptimizedTitle(
	categoryName: string,
	categoryLabel: string,
	department?: string | null,
	neighborhood?: string | null
): string {
	const seoData = CATEGORY_SEO_DATA[categoryName];
	const location = buildLocationString(department, neighborhood);

	if (seoData) {
		return seoData.titleTemplate.replace(/{location}/g, location);
	}

	// Fallback with good SEO structure
	if (neighborhood) {
		return `${categoryLabel} en ${neighborhood} (Montevideo) - Contacto Directo | Mi Barrio`;
	}
	if (department) {
		return `${categoryLabel} en ${department} - Contacto Directo | Mi Barrio`;
	}
	return `${categoryLabel} en Uruguay - Directorio Gratuito | Mi Barrio`;
}

// Generate optimized meta description
export function getOptimizedDescription(
	categoryName: string,
	categoryLabel: string,
	department?: string | null,
	neighborhood?: string | null
): string {
	const seoData = CATEGORY_SEO_DATA[categoryName];
	const location = buildLocationString(department, neighborhood);

	if (seoData) {
		return seoData.descriptionTemplate.replace(/{location}/g, location);
	}

	// Fallback description
	return `Encontrá ${categoryLabel.toLowerCase()} en ${location}. Contactá directo por WhatsApp o teléfono. Directorio gratuito Mi Barrio.`;
}

// Generate extended FAQs with location
export function getOptimizedFAQs(
	categoryName: string,
	categoryLabel: string,
	department?: string | null,
	neighborhood?: string | null
): Array<{ question: string; answer: string }> {
	const seoData = CATEGORY_SEO_DATA[categoryName];
	const location = buildLocationString(department, neighborhood);

	if (seoData) {
		return seoData.faqs.map((faq) => ({
			question: faq.question.replace(/{location}/g, location),
			answer: faq.answer.replace(/{location}/g, location)
		}));
	}

	// Fallback FAQs
	return [
		{
			question: `¿Cómo encontrar ${categoryLabel.toLowerCase()} en ${location}?`,
			answer: `En Mi Barrio podés buscar ${categoryLabel.toLowerCase()} en ${location} y contactar directo por WhatsApp o teléfono. Es gratis y sin intermediarios.`
		},
		{
			question: `¿Cuánto cuesta contratar ${categoryLabel.toLowerCase()} en ${location}?`,
			answer: `Los precios varían según el servicio. Te recomendamos contactar a varios profesionales en Mi Barrio para comparar presupuestos sin compromiso.`
		}
	];
}
