import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.prod
function loadEnvProd() {
  const envPath = resolve(__dirname, '../../../.env.prod');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    for (const line of envContent.split('\n')) {
      const match = line.match(/^([^=]+)=["']?([^"']+)["']?$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    }
    return env;
  } catch (error) {
    console.error('Error loading .env.prod:', error);
    process.exit(1);
  }
}

const prodEnv = loadEnvProd();
const supabaseProd = createClient(
  prodEnv.PUBLIC_SUPABASE_URL,
  prodEnv.SUPABASE_SERVICE_ROLE_KEY
);

// Load dev env for source
function loadEnvDev() {
  const envPath = resolve(__dirname, '../../../.env');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    for (const line of envContent.split('\n')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
    return env;
  } catch (error) {
    console.error('Error loading .env:', error);
    process.exit(1);
  }
}

const devEnv = loadEnvDev();
const supabaseDev = createClient(
  devEnv.PUBLIC_SUPABASE_URL,
  devEnv.SUPABASE_SERVICE_ROLE_KEY
);

async function copyData() {
  console.log('=== Copying data from dev to prod ===\n');

  // Get all imported providers from dev
  const { data: providers, error: fetchError } = await supabaseDev
    .from('mb_providers')
    .select('*')
    .eq('source', '1122');

  if (fetchError) {
    console.error('Error fetching from dev:', fetchError);
    return;
  }

  console.log(`Found ${providers?.length || 0} providers in dev\n`);

  let imported = 0;
  let skipped = 0;

  for (const provider of providers || []) {
    // Check if exists in prod
    const { data: existing } = await supabaseProd
      .from('mb_providers')
      .select('id')
      .eq('external_id', provider.external_id)
      .maybeSingle();

    if (existing) {
      console.log(`⏭ Skipped: ${provider.business_name}`);
      skipped++;
      continue;
    }

    // Insert without images
    const { data: newProvider, error: insertError } = await supabaseProd
      .from('mb_providers')
      .insert({
        user_id: null,
        business_name: provider.business_name,
        description: provider.description,
        address: provider.address,
        department: provider.department,
        neighborhood: provider.neighborhood,
        contact_phone: provider.contact_phone,
        contact_whatsapp: provider.contact_whatsapp,
        contact_email: provider.contact_email,
        website: provider.website,
        social_facebook: provider.social_facebook,
        social_instagram: provider.social_instagram,
        social_tiktok: provider.social_tiktok,
        location_lat: provider.location_lat,
        location_lng: provider.location_lng,
        is_active: true,
        is_claimed: false,
        source: provider.source,
        source_url: provider.source_url,
        external_id: provider.external_id,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error(`✗ Error: ${provider.business_name}:`, insertError.message);
      continue;
    }

    // Copy categories
    const { data: categories } = await supabaseDev
      .from('mb_provider_categories')
      .select('category_name')
      .eq('provider_id', provider.id);

    if (categories && newProvider) {
      for (const cat of categories) {
        await supabaseProd
          .from('mb_provider_categories')
          .insert({
            provider_id: newProvider.id,
            category_name: cat.category_name,
          });
      }
    }

    console.log(`✓ Imported: ${provider.business_name}`);
    imported++;
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
}

copyData().catch(console.error);
