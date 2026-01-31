import { chromium, type Page } from 'playwright';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { type ScrapedProvider, normalizeNeighborhood, normalizePhone, supabase } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Categories with their PRD codes from 1122.com.uy
const CATEGORIES = [
  // Hogar
  { name: 'plomero', prd: 'PRD1000922', label: 'Sanitarios' },
  { name: 'albanil', prd: 'PRD1002184', label: 'Albañiles' },
  { name: 'cerrajero', prd: 'PRD1000247', label: 'Cerrajerías' },
  { name: 'pintor', prd: 'PRD1000808', label: 'Pintores' },
  { name: 'carpintero', prd: 'PRD1000223', label: 'Carpinterías' },
  { name: 'jardinero', prd: 'PRD1000622', label: 'Jardinería' },
  { name: 'vidrieria', prd: 'PRD1001040', label: 'Vidrierías' },
  { name: 'herreria', prd: 'PRD1000538', label: 'Herrerías' },
  { name: 'tecnico-aire', prd: 'PRD1000025', label: 'Aire Acondicionado' },
  // Autos
  { name: 'mecanico', prd: 'PRD1000959', label: 'Talleres Mecánicos' },
  { name: 'gomeria', prd: 'PRD1000502', label: 'Gomerías' },
  { name: 'lavadero', prd: 'PRD1000653', label: 'Lavaderos' },
  // Servicios
  { name: 'mudanzas', prd: 'PRD1000757', label: 'Mudanzas' },
  { name: 'limpieza', prd: 'PRD1000680', label: 'Limpieza' },
  { name: 'fletes', prd: 'PRD1000472', label: 'Fletes' },
  // Salud y Belleza
  { name: 'veterinario', prd: 'PRD1001033', label: 'Veterinarias' },
  { name: 'peluqueria', prd: 'PRD1000800', label: 'Peluquerías' },
  { name: 'farmacia', prd: 'PRD1000460', label: 'Farmacias' },
  { name: 'optica', prd: 'PRD1000772', label: 'Ópticas' },
  // Comida
  { name: 'restaurante', prd: 'PRD1000890', label: 'Restaurantes' },
  { name: 'panaderia', prd: 'PRD1000779', label: 'Panaderías' },
  { name: 'carniceria', prd: 'PRD1000219', label: 'Carnicerías' },
  // Comercios
  { name: 'ferreteria', prd: 'PRD1000466', label: 'Ferreterías' },
  { name: 'libreria', prd: 'PRD1000676', label: 'Librerías' },
  // Profesionales
  { name: 'abogado', prd: 'PRD1000005', label: 'Abogados' },
  { name: 'contador', prd: 'PRD1000290', label: 'Contadores' },
  { name: 'arquitecto', prd: 'PRD1000060', label: 'Arquitectos' },
];

const LIMIT_PER_CATEGORY = 10;

// Get business URLs from listing page
async function getBusinessUrls(page: Page, category: typeof CATEGORIES[0], limit: number): Promise<string[]> {
  const url = `https://1122.com.uy/rubro-zona/montevideo/${category.label.toLowerCase().replace(/í/g, 'i').replace(/ñ/g, 'n').replace(/é/g, 'e')}/${category.prd}/Z01000`;

  console.log(`  Fetching: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    const pageUrls = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/local/"]');
      const hrefs: string[] = [];

      for (const link of links) {
        const h2 = link.querySelector('h2');
        if (!h2) continue;

        const href = link.getAttribute('href');
        if (href && !hrefs.includes(href)) {
          hrefs.push(href);
        }
      }

      return hrefs;
    });

    return pageUrls.slice(0, limit).map(href =>
      href.startsWith('http') ? href : `https://1122.com.uy${href}`
    );
  } catch (error) {
    console.error(`  Error fetching category ${category.label}:`, error);
    return [];
  }
}

// Scrape a single business detail page
async function scrapeDetailPage(page: Page, url: string, categoryName: string): Promise<ScrapedProvider | null> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    const data = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const businessName = h1?.textContent?.trim() || '';

      if (!businessName || businessName.length < 2) return null;

      const h2 = document.querySelector('h2');
      let address = '';
      let neighborhood = '';
      let department = 'Montevideo';

      if (h2) {
        const addressText = h2.textContent?.trim() || '';
        const parts = addressText.split(' - ').map(p => p.trim());
        if (parts.length >= 3) {
          address = parts[0];
          neighborhood = parts[1];
          department = parts[2];
        } else if (parts.length === 2) {
          address = parts[0];
          neighborhood = parts[1];
        } else {
          address = addressText;
        }
      }

      const phoneLink = document.querySelector('a[href^="tel:"]');
      const phone = phoneLink?.textContent?.trim() || '';

      const waLink = document.querySelector('a[href*="wa.me"]');
      const whatsappUrl = waLink?.getAttribute('href') || '';

      let description = '';
      const infoSection = Array.from(document.querySelectorAll('h3')).find(
        h3 => h3.textContent && h3.textContent.length > 50
      );
      if (infoSection) {
        description = infoSection.textContent?.trim() || '';
      }

      const igLink = document.querySelector('a[href*="instagram.com"]');
      const instagram = igLink?.getAttribute('href') || '';

      // Images will be added by owners when they claim their profile

      let lat: number | undefined;
      let lng: number | undefined;
      const mapImg = document.querySelector('img[src*="maps"]');
      if (mapImg) {
        const mapSrc = mapImg.getAttribute('src') || '';
        const coordMatch = mapSrc.match(/(-?\d+\.\d+)_(-?\d+\.\d+)/);
        if (coordMatch) {
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        }
      }

      const is24hrs = document.body.textContent?.includes('24 hrs') ||
                      document.body.textContent?.includes('24 horas') || false;

      return {
        businessName,
        address,
        neighborhood,
        department,
        phone,
        whatsappUrl,
        description,
        instagram,
        lat,
        lng,
        is24hrs,
      };
    });

    if (!data || !data.businessName) {
      return null;
    }

    const externalId = url.split('/').pop() || `1122-${data.businessName.toLowerCase().replace(/\s+/g, '-')}`;
    const normalizedPhone = normalizePhone(data.phone);

    let whatsapp: string | undefined;
    if (data.whatsappUrl) {
      const waMatch = data.whatsappUrl.match(/wa\.me\/(\d+)/);
      if (waMatch) {
        whatsapp = waMatch[1];
      }
    }

    return {
      business_name: data.businessName,
      description: data.description || undefined,
      address: data.address || undefined,
      department: data.department || 'Montevideo',
      neighborhood: normalizeNeighborhood(data.neighborhood) || undefined,
      contact_phone: normalizedPhone,
      contact_whatsapp: whatsapp,
      category: categoryName,
      source: '1122',
      source_url: url,
      external_id: externalId,
      social_instagram: data.instagram || undefined,
      is_24hrs: data.is24hrs || undefined,
      location_lat: data.lat,
      location_lng: data.lng,
    };

  } catch (error) {
    console.error(`  Error scraping ${url}:`, error);
    return null;
  }
}

// Check if provider exists
async function providerExists(externalId: string, businessName: string): Promise<boolean> {
  const { data: byId } = await supabase
    .from('mb_providers')
    .select('id')
    .eq('external_id', externalId)
    .maybeSingle();

  if (byId) return true;

  const { data: byName } = await supabase
    .from('mb_providers')
    .select('id')
    .ilike('business_name', businessName)
    .eq('department', 'Montevideo')
    .maybeSingle();

  return !!byName;
}

// Import provider to Supabase
async function importProvider(provider: ScrapedProvider): Promise<boolean> {
  try {
    if (await providerExists(provider.external_id, provider.business_name)) {
      console.log(`    ⏭ Skipped (exists): ${provider.business_name}`);
      return false;
    }

    const { data: newProvider, error: providerError } = await supabase
      .from('mb_providers')
      .insert({
        user_id: null,
        business_name: provider.business_name,
        description: provider.description || null,
        address: provider.address || null,
        department: provider.department,
        neighborhood: provider.neighborhood || null,
        contact_phone: provider.contact_phone || null,
        contact_whatsapp: provider.contact_whatsapp || null,
        social_instagram: provider.social_instagram || null,
        location_lat: provider.location_lat || null,
        location_lng: provider.location_lng || null,
        is_active: true,
        is_claimed: false,
        source: provider.source,
        source_url: provider.source_url,
        external_id: provider.external_id,
      })
      .select('id')
      .single();

    if (providerError) {
      console.error(`    ✗ Error inserting ${provider.business_name}:`, providerError.message);
      return false;
    }

    // Add category
    if (newProvider && provider.category) {
      await supabase
        .from('mb_provider_categories')
        .insert({
          provider_id: newProvider.id,
          category_name: provider.category,
        });
    }

    console.log(`    ✓ Imported: ${provider.business_name}`);
    return true;

  } catch (error) {
    console.error(`    ✗ Error with ${provider.business_name}:`, error);
    return false;
  }
}

async function scrapeAndImport() {
  console.log('=== 1122.com.uy Multi-Category Scraper ===');
  console.log(`Scraping ${LIMIT_PER_CATEGORY} businesses per category\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  const allProviders: ScrapedProvider[] = [];
  let totalImported = 0;
  let totalSkipped = 0;

  try {
    for (const category of CATEGORIES) {
      console.log(`\n📂 Category: ${category.label} (${category.name})`);

      const urls = await getBusinessUrls(page, category, LIMIT_PER_CATEGORY);
      console.log(`  Found ${urls.length} businesses`);

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`  [${i + 1}/${urls.length}] Scraping...`);

        const provider = await scrapeDetailPage(page, url, category.name);

        if (provider) {
          allProviders.push(provider);

          // Import immediately
          const imported = await importProvider(provider);
          if (imported) {
            totalImported++;
          } else {
            totalSkipped++;
          }
        }

        await page.waitForTimeout(500);
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total scraped: ${allProviders.length}`);
    console.log(`Imported: ${totalImported}`);
    console.log(`Skipped: ${totalSkipped}`);

    // Save to file as backup
    const outputPath = resolve(__dirname, '../data/1122-multi-category.json');
    writeFileSync(outputPath, JSON.stringify(allProviders, null, 2));
    console.log(`\nBackup saved to: ${outputPath}`);

  } finally {
    await browser.close();
  }
}

scrapeAndImport().catch(console.error);
