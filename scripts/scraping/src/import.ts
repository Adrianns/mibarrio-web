import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { supabase, type ScrapedProvider } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ImportResult {
  inserted: number;
  skipped: number;
  errors: number;
}

// Check if provider already exists (by external_id or similar name+address)
async function providerExists(provider: ScrapedProvider): Promise<boolean> {
  // First check by external_id
  const { data: byId } = await supabase
    .from('mb_providers')
    .select('id')
    .eq('external_id', provider.external_id)
    .maybeSingle();

  if (byId) return true;

  // Check by name and address (fuzzy match)
  const { data: byName } = await supabase
    .from('mb_providers')
    .select('id')
    .ilike('business_name', provider.business_name)
    .eq('department', provider.department)
    .maybeSingle();

  return !!byName;
}

// Import a single provider
async function importProvider(provider: ScrapedProvider): Promise<'inserted' | 'skipped' | 'error'> {
  try {
    // Check if exists
    if (await providerExists(provider)) {
      console.log(`  Skipped (exists): ${provider.business_name}`);
      return 'skipped';
    }

    // Insert into mb_providers
    const { data: newProvider, error: providerError } = await supabase
      .from('mb_providers')
      .insert({
        user_id: null, // No owner yet
        business_name: provider.business_name,
        description: provider.description || null,
        address: provider.address || null,
        department: provider.department,
        neighborhood: provider.neighborhood || null,
        contact_phone: provider.contact_phone || null,
        contact_whatsapp: provider.contact_whatsapp || provider.contact_phone || null,
        is_active: true,
        is_claimed: false,
        source: provider.source,
        source_url: provider.source_url,
        external_id: provider.external_id,
      })
      .select('id')
      .single();

    if (providerError) {
      console.error(`  Error inserting ${provider.business_name}:`, providerError.message);
      return 'error';
    }

    // Add category
    if (newProvider && provider.category) {
      const { error: catError } = await supabase
        .from('mb_provider_categories')
        .insert({
          provider_id: newProvider.id,
          category_name: provider.category,
        });

      if (catError) {
        console.error(`  Error adding category for ${provider.business_name}:`, catError.message);
      }
    }

    console.log(`  Inserted: ${provider.business_name}`);
    return 'inserted';

  } catch (error) {
    console.error(`  Error with ${provider.business_name}:`, error);
    return 'error';
  }
}

// Import all providers from a JSON file
async function importFromFile(filePath: string): Promise<ImportResult> {
  console.log(`\nImporting from: ${filePath}`);

  const content = readFileSync(filePath, 'utf-8');
  const providers: ScrapedProvider[] = JSON.parse(content);

  console.log(`Found ${providers.length} providers to import`);

  const result: ImportResult = { inserted: 0, skipped: 0, errors: 0 };

  for (const provider of providers) {
    const status = await importProvider(provider);
    result[status === 'inserted' ? 'inserted' : status === 'skipped' ? 'skipped' : 'errors']++;

    // Rate limiting to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return result;
}

// Main import function
async function runImport() {
  console.log('Starting import to Supabase...');

  const dataDir = resolve(__dirname, '../data');
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('No JSON files found in data directory. Run scrapers first.');
    return;
  }

  console.log(`Found ${files.length} data file(s): ${files.join(', ')}`);

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const file of files) {
    const filePath = resolve(dataDir, file);
    const result = await importFromFile(filePath);

    totalInserted += result.inserted;
    totalSkipped += result.skipped;
    totalErrors += result.errors;

    console.log(`\nFile ${file} results:`);
    console.log(`  Inserted: ${result.inserted}`);
    console.log(`  Skipped: ${result.skipped}`);
    console.log(`  Errors: ${result.errors}`);
  }

  console.log('\n=== TOTAL RESULTS ===');
  console.log(`Inserted: ${totalInserted}`);
  console.log(`Skipped: ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
}

// Run if called directly
runImport().catch(console.error);
