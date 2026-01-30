import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from project root
function loadEnv() {
  const envPath = resolve(__dirname, '../../../.env');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  } catch (error) {
    console.error('Error loading .env file:', error);
    process.exit(1);
  }
}

loadEnv();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Category mapping from 1122/guiacomercial to our categories
export const CATEGORY_MAP: Record<string, string> = {
  'electricistas': 'electricista',
  'electricista': 'electricista',
  'plomeros': 'plomero',
  'sanitarios': 'plomero',
  'albaniles': 'albanil',
  'albañiles': 'albanil',
  'pintores': 'pintor',
  'carpinteros': 'carpintero',
  'jardineros': 'jardinero',
  'mecanicos': 'mecanico',
  'mecánicos': 'mecanico',
  'cerrajeros': 'cerrajero',
  'cerrajerías': 'cerrajero',
  'mudanzas': 'mudanzas',
  'limpieza': 'limpieza',
  'veterinarios': 'veterinario',
  'abogados': 'abogado',
  'contadores': 'contador',
};

// Data structure for scraped providers
export interface ScrapedProvider {
  business_name: string;
  description?: string;
  address?: string;
  department: string;
  neighborhood?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  contact_email?: string;
  category: string;
  categories?: string[]; // Multiple categories from source
  source: '1122' | 'guiacomercial';
  source_url: string;
  external_id: string;
  // New fields from detail page
  logo_url?: string;
  photos?: string[];
  social_instagram?: string;
  social_facebook?: string;
  website?: string;
  hours?: Record<string, string>; // { "Lunes": "7:00 - 17:00", ... }
  is_24hrs?: boolean;
  location_lat?: number;
  location_lng?: number;
  payment_methods?: string[];
  additional_info?: Record<string, string>; // { "Trabajos a medida": "SI", ... }
}

// Normalize phone number to Uruguayan format
export function normalizePhone(phone: string): string | undefined {
  if (!phone) return undefined;

  // Remove non-digits
  let cleaned = phone.replace(/\D/g, '');

  // Skip if too short or has asterisks (incomplete)
  if (cleaned.length < 8 || phone.includes('*')) {
    return undefined;
  }

  // Add Uruguay prefix if not present
  if (cleaned.length === 8) {
    cleaned = '598' + cleaned;
  } else if (cleaned.length === 9 && cleaned.startsWith('0')) {
    cleaned = '598' + cleaned.slice(1);
  }

  return cleaned;
}

// Normalize neighborhood name
export function normalizeNeighborhood(neighborhood: string): string | undefined {
  if (!neighborhood || neighborhood === '.' || neighborhood === '—') {
    return undefined;
  }

  // Map common variations to standard names
  const mapping: Record<string, string> = {
    'la blanqueada': 'La Blanqueada',
    'blanqueada': 'La Blanqueada',
    'punta carretas': 'Punta Carretas',
    'tres cruces': 'Tres Cruces',
    'piedras blancas': 'Piedras Blancas',
    'goes': 'Goes',
    'aguada': 'Aguada',
    'malvin': 'Malvín',
    'malvín': 'Malvín',
    'pocitos': 'Pocitos',
    'centro': 'Centro',
    'cordon': 'Cordón',
    'cordón': 'Cordón',
    'carrasco': 'Carrasco',
    'buceo': 'Buceo',
    'parque batlle': 'Parque Batlle',
    'parque rodó': 'Parque Rodó',
    'la teja': 'La Teja',
    'cerro': 'Cerro',
    'union': 'Unión',
    'unión': 'Unión',
    'prado': 'Prado',
    'sayago': 'Sayago',
    'paso molino': 'Paso Molino',
    'barrio sur': 'Barrio Sur',
    'ciudad vieja': 'Ciudad Vieja',
    'palermo': 'Palermo',
  };

  const lower = neighborhood.toLowerCase().trim();
  return mapping[lower] || neighborhood.trim();
}
