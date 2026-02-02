// Domain Types for Mi Barrio

// User roles
export type UserRole = 'visitor' | 'provider';

// Provider types
export type ProviderType = 'individual' | 'business';

// Category types
export type CategoryType = 'service' | 'business' | 'both';

// Category from database
export interface Category {
	id: string;
	name: string;
	label: string;
	icon: string;
	color: string;
	description?: string | null;
	category_type: CategoryType;
	is_active: boolean;
	display_order: number;
	created_at: string;
	updated_at?: string;
}

// User profile
export interface UserProfile {
	id: string;
	email: string;
	full_name: string;
	avatar_url?: string | null;
	phone?: string | null;
	role: UserRole;
	is_active: boolean;
	is_admin: boolean;
	created_at: string;
	updated_at?: string;
}

// Claim request status
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

// Provider data source
export type ProviderSource = 'manual' | '1122' | 'guiacomercial' | 'google_places';

// Provider profile
export interface Provider {
	id: string;
	slug?: string | null; // Custom URL slug (@username)
	user_id: string | null; // Nullable for unclaimed profiles
	provider_type: ProviderType;
	display_name: string;
	business_name?: string | null;
	business_rut?: string | null;
	logo_url?: string | null;
	description?: string | null;
	short_description?: string | null;

	// Contact info
	contact_phone?: string | null;
	contact_whatsapp?: string | null;
	contact_email?: string | null;
	website_url?: string | null;
	instagram_url?: string | null;
	facebook_url?: string | null;

	// Location
	department: Department;
	neighborhood?: string | null;
	address?: string | null;
	location_lat?: number | null;
	location_lng?: number | null;

	// Media
	photos: string[];

	// Status
	is_verified: boolean;
	is_active: boolean;
	is_featured: boolean;

	// Claim status (for imported profiles)
	is_claimed: boolean;
	claimed_at?: string | null;
	source: ProviderSource;
	source_url?: string | null;
	external_id?: string | null;

	// Stats
	view_count: number;
	contact_click_count: number;

	created_at: string;
	updated_at?: string;

	// Joined data
	categories?: Category[];
	subscription?: Subscription;
	user?: Partial<UserProfile>;
}

// Subscription status
export type SubscriptionStatus = 'pending' | 'active' | 'paused' | 'cancelled' | 'expired';

// Subscription plan
export interface SubscriptionPlan {
	id: string;
	name: string;
	label: string;
	description?: string | null;
	price_monthly: number;
	features: string[];
	max_photos: number;
	highlight_in_search: boolean;
	show_contact_directly: boolean;
	priority_order: number;
	is_active: boolean;
	mercadopago_plan_id?: string | null;
	created_at: string;
	updated_at?: string;
}

// Billing cycle
export type BillingCycle = 'monthly' | 'annual';

// Subscription
export interface Subscription {
	id: string;
	provider_id: string;
	plan_id: string;
	status: SubscriptionStatus;
	billing_cycle?: BillingCycle | null;
	amount?: number | null;
	mp_subscription_id?: string | null;
	mp_preapproval_id?: string | null;
	mp_payment_id?: string | null;
	mp_preference_id?: string | null;
	starts_at?: string | null;
	ends_at?: string | null;
	cancelled_at?: string | null;
	created_at: string;
	updated_at?: string;
	// Joined data
	plan?: SubscriptionPlan;
}

// Subscription payment history
export interface SubscriptionPayment {
	id: string;
	subscription_id: string;
	amount: number;
	status: 'pending' | 'approved' | 'rejected' | 'refunded';
	mp_payment_id?: string | null;
	mp_preference_id?: string | null;
	mp_status?: string | null;
	billing_cycle?: BillingCycle | null;
	period_start?: string | null;
	period_end?: string | null;
	paid_at?: string | null;
	created_at: string;
}

// Contact click types
export type ContactType = 'phone' | 'whatsapp' | 'email' | 'website' | 'instagram' | 'facebook';

// Contact click for analytics
export interface ContactClick {
	id: string;
	provider_id: string;
	contact_type: ContactType;
	visitor_ip?: string | null;
	created_at: string;
}

// Uruguayan departments (sorted alphabetically)
export const DEPARTMENTS = [
	'Artigas',
	'Canelones',
	'Cerro Largo',
	'Colonia',
	'Durazno',
	'Flores',
	'Florida',
	'Lavalleja',
	'Maldonado',
	'Montevideo',
	'Paysandú',
	'Rivera',
	'Río Negro',
	'Rocha',
	'Salto',
	'San José',
	'Soriano',
	'Tacuarembó',
	'Treinta y Tres'
] as const;

export type Department = (typeof DEPARTMENTS)[number];

// Montevideo neighborhoods (sorted alphabetically)
export const MONTEVIDEO_NEIGHBORHOODS = [
	'Aguada',
	'Barrio Sur',
	'Brazo Oriental',
	'Buceo',
	'Carrasco',
	'Centro',
	'Cerro',
	'Ciudad Vieja',
	'Colón',
	'Cordón',
	'Goes',
	'Jacinto Vera',
	'La Blanqueada',
	'La Teja',
	'Malvín',
	'Manga',
	'Palermo',
	'Parque Batlle',
	'Parque Rodó',
	'Paso Molino',
	'Peñarol',
	'Piedras Blancas',
	'Pocitos',
	'Prado',
	'Punta Carretas',
	'Reducto',
	'Sayago',
	'Tres Cruces',
	'Unión',
	'Villa Española'
] as const;

export type MontevideoNeighborhood = (typeof MONTEVIDEO_NEIGHBORHOODS)[number];

// Default categories for Mi Barrio
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'created_at' | 'updated_at'>[] = [
	// Professional Services
	{ name: 'electricista', label: 'Electricistas', icon: 'Zap', color: 'bg-yellow-500', category_type: 'service', is_active: true, display_order: 1 },
	{ name: 'plomero', label: 'Plomeros', icon: 'Droplets', color: 'bg-blue-500', category_type: 'service', is_active: true, display_order: 2 },
	{ name: 'albanil', label: 'Albañiles', icon: 'Hammer', color: 'bg-orange-500', category_type: 'service', is_active: true, display_order: 3 },
	{ name: 'pintor', label: 'Pintores', icon: 'Paintbrush', color: 'bg-purple-500', category_type: 'service', is_active: true, display_order: 4 },
	{ name: 'carpintero', label: 'Carpinteros', icon: 'Axe', color: 'bg-amber-600', category_type: 'service', is_active: true, display_order: 5 },
	{ name: 'jardinero', label: 'Jardineros', icon: 'Flower2', color: 'bg-green-500', category_type: 'service', is_active: true, display_order: 6 },
	{ name: 'mecanico', label: 'Mecánicos', icon: 'Wrench', color: 'bg-zinc-600', category_type: 'service', is_active: true, display_order: 7 },
	{ name: 'tecnico-pc', label: 'Técnicos PC', icon: 'Monitor', color: 'bg-slate-600', category_type: 'service', is_active: true, display_order: 8 },
	{ name: 'cerrajero', label: 'Cerrajeros', icon: 'Key', color: 'bg-gray-600', category_type: 'service', is_active: true, display_order: 9 },
	{ name: 'mudanzas', label: 'Mudanzas', icon: 'Truck', color: 'bg-sky-500', category_type: 'service', is_active: true, display_order: 10 },
	{ name: 'limpieza', label: 'Limpieza', icon: 'Sparkles', color: 'bg-cyan-500', category_type: 'service', is_active: true, display_order: 11 },
	{ name: 'cuidado-personas', label: 'Cuidadores', icon: 'Heart', color: 'bg-red-400', category_type: 'service', is_active: true, display_order: 12 },
	{ name: 'veterinario', label: 'Veterinarios', icon: 'Stethoscope', color: 'bg-emerald-500', category_type: 'service', is_active: true, display_order: 13 },
	{ name: 'abogado', label: 'Abogados', icon: 'Scale', color: 'bg-gray-700', category_type: 'service', is_active: true, display_order: 14 },
	{ name: 'contador', label: 'Contadores', icon: 'Calculator', color: 'bg-cyan-600', category_type: 'service', is_active: true, display_order: 15 },

	// Local Businesses
	{ name: 'restaurante', label: 'Restaurantes', icon: 'UtensilsCrossed', color: 'bg-orange-500', category_type: 'business', is_active: true, display_order: 16 },
	{ name: 'cafe', label: 'Cafés', icon: 'Coffee', color: 'bg-amber-700', category_type: 'business', is_active: true, display_order: 17 },
	{ name: 'panaderia', label: 'Panaderías', icon: 'Croissant', color: 'bg-yellow-600', category_type: 'business', is_active: true, display_order: 18 },
	{ name: 'carniceria', label: 'Carnicerías', icon: 'Beef', color: 'bg-red-600', category_type: 'business', is_active: true, display_order: 19 },
	{ name: 'verduleria', label: 'Verdulerías', icon: 'Apple', color: 'bg-green-600', category_type: 'business', is_active: true, display_order: 20 },
	{ name: 'farmacia', label: 'Farmacias', icon: 'Pill', color: 'bg-emerald-600', category_type: 'business', is_active: true, display_order: 21 },
	{ name: 'ferreteria', label: 'Ferreterías', icon: 'Hammer', color: 'bg-stone-600', category_type: 'business', is_active: true, display_order: 22 },
	{ name: 'peluqueria', label: 'Peluquerías', icon: 'Scissors', color: 'bg-pink-500', category_type: 'business', is_active: true, display_order: 23 },
	{ name: 'gimnasio', label: 'Gimnasios', icon: 'Dumbbell', color: 'bg-lime-500', category_type: 'business', is_active: true, display_order: 24 },
	{ name: 'veterinaria', label: 'Veterinarias', icon: 'PawPrint', color: 'bg-orange-400', category_type: 'business', is_active: true, display_order: 25 },
	{ name: 'lavadero', label: 'Lavaderos', icon: 'WashingMachine', color: 'bg-blue-400', category_type: 'business', is_active: true, display_order: 26 },
	{ name: 'kiosco', label: 'Kioscos', icon: 'Store', color: 'bg-violet-500', category_type: 'business', is_active: true, display_order: 27 },
	{ name: 'mercado', label: 'Mercados', icon: 'ShoppingCart', color: 'bg-teal-500', category_type: 'business', is_active: true, display_order: 28 },
	{ name: 'taller', label: 'Talleres', icon: 'Settings', color: 'bg-zinc-500', category_type: 'business', is_active: true, display_order: 29 },
	{ name: 'imprenta', label: 'Imprentas', icon: 'Printer', color: 'bg-indigo-500', category_type: 'business', is_active: true, display_order: 30 },
	{ name: 'floreria', label: 'Florerías', icon: 'Flower', color: 'bg-rose-500', category_type: 'business', is_active: true, display_order: 31 },
	{ name: 'libreria', label: 'Librerías', icon: 'BookOpen', color: 'bg-amber-500', category_type: 'business', is_active: true, display_order: 32 },
	{ name: 'optica', label: 'Ópticas', icon: 'Glasses', color: 'bg-sky-600', category_type: 'business', is_active: true, display_order: 33 },
	{ name: 'informatica', label: 'Informática', icon: 'Cpu', color: 'bg-indigo-600', category_type: 'service', is_active: true, display_order: 34 },
	{ name: 'ingenieria', label: 'Ingeniería', icon: 'HardHat', color: 'bg-stone-500', category_type: 'service', is_active: true, display_order: 35 },
	{ name: 'otro', label: 'Otros', icon: 'MoreHorizontal', color: 'bg-gray-500', category_type: 'both', is_active: true, display_order: 99 }
];

// Claim request for unclaimed profiles
export interface ClaimRequest {
	id: string;
	provider_id: string;
	user_id: string;
	status: ClaimStatus;
	message?: string | null;
	admin_notes?: string | null;
	reviewed_by?: string | null;
	reviewed_at?: string | null;
	created_at: string;
	updated_at?: string;
	// Joined data
	provider?: Provider;
	user?: Partial<UserProfile>;
	reviewer?: Partial<UserProfile>;
}

// Generic result type for service methods
export interface Result<T> {
	data: T | null;
	error: Error | null;
}
