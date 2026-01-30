import { chromium, type Page } from 'playwright';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { type ScrapedProvider, normalizeNeighborhood, normalizePhone } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://1122.com.uy/rubro-zona/montevideo/electricistas/PRD1000390/Z01000';

// Get all business URLs from listing pages
async function getBusinessUrls(page: Page, maxPages: number): Promise<string[]> {
  const urls: string[] = [];
  const seenUrls = new Set<string>();

  for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
    const url = currentPage === 1 ? BASE_URL : `${BASE_URL}?pagina=${currentPage}`;
    console.log(`Fetching listing page ${currentPage}...`);

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Extract all business detail URLs
    const pageUrls = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/local/"]');
      const hrefs: string[] = [];

      for (const link of links) {
        const h2 = link.querySelector('h2');
        if (!h2) continue; // Only business links have h2

        const href = link.getAttribute('href');
        if (href && !hrefs.includes(href)) {
          hrefs.push(href);
        }
      }

      return hrefs;
    });

    for (const href of pageUrls) {
      const fullUrl = href.startsWith('http') ? href : `https://1122.com.uy${href}`;
      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        urls.push(fullUrl);
      }
    }

    console.log(`  Found ${pageUrls.length} businesses, total unique: ${urls.length}`);
  }

  return urls;
}

// Scrape a single business detail page
async function scrapeDetailPage(page: Page, url: string): Promise<ScrapedProvider | null> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const data = await page.evaluate(() => {
      // Business name
      const h1 = document.querySelector('h1');
      const businessName = h1?.textContent?.trim() || '';

      if (!businessName || businessName.length < 2) return null;

      // Address (h2 with location icon)
      const h2 = document.querySelector('h2');
      let address = '';
      let neighborhood = '';
      let department = 'Montevideo';

      if (h2) {
        const addressText = h2.textContent?.trim() || '';
        // Format: "Address - Neighborhood - Department"
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

      // Phone (link with tel:)
      const phoneLink = document.querySelector('a[href^="tel:"]');
      const phone = phoneLink?.textContent?.trim() || '';

      // WhatsApp URL
      const waLink = document.querySelector('a[href*="wa.me"]');
      const whatsappUrl = waLink?.getAttribute('href') || '';

      // Description (h3 under "Información")
      let description = '';
      const infoSection = Array.from(document.querySelectorAll('h3')).find(
        h3 => h3.textContent && h3.textContent.length > 50
      );
      if (infoSection) {
        description = infoSection.textContent?.trim() || '';
      }

      // Instagram link
      const igLink = document.querySelector('a[href*="instagram.com"]');
      const instagram = igLink?.getAttribute('href') || '';

      // Logo URL
      const logoImg = document.querySelector('img[src*="/icono/big/"]') ||
                      document.querySelector('img[src*="/icono/i"]');
      const logoUrl = logoImg?.getAttribute('src') || '';

      // Photos
      const photoImgs = document.querySelectorAll('a[href*="/galeria/"] img, a[href*="/fotos/"] img');
      const photos: string[] = [];
      photoImgs.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.includes('data:image')) {
          // Convert small to large URL
          const largeSrc = src.replace('-sm-', '-').replace('.webp', '.jpg');
          photos.push(largeSrc);
        }
      });

      // Categories
      const categoryLinks = document.querySelectorAll('a[href*="/rubro-zona/"]');
      const categories: string[] = [];
      categoryLinks.forEach(link => {
        const text = link.textContent?.trim();
        if (text && text.length > 2 && !text.includes('(') && !categories.includes(text)) {
          categories.push(text);
        }
      });

      // Hours
      const hours: Record<string, string> = {};
      const hoursSection = document.querySelector('[class*="complementary"], aside');
      if (hoursSection) {
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const texts = hoursSection.textContent || '';
        for (const day of days) {
          const regex = new RegExp(`${day}\\s*([\\d:]+\\s*-\\s*[\\d:]+|Cerrado)`, 'i');
          const match = texts.match(regex);
          if (match) {
            hours[day] = match[1].trim();
          }
        }
      }

      // Check for 24hrs badge
      const is24hrs = document.body.textContent?.includes('24 hrs') ||
                      document.body.textContent?.includes('24 horas') || false;

      // Coordinates from map image URL
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

      // Payment methods
      const paymentMethods: string[] = [];
      const paymentImgs = document.querySelectorAll('img[src*="/fp/"]');
      paymentImgs.forEach(img => {
        const nextText = img.nextSibling?.textContent?.trim() ||
                        img.parentElement?.textContent?.trim() || '';
        if (nextText && nextText.length > 2 && nextText.length < 30) {
          paymentMethods.push(nextText.split('\n')[0].trim());
        }
      });

      // Additional info
      const additionalInfo: Record<string, string> = {};
      const infoTexts = ['Trabajos a medida', 'Atención rápida', 'Trabajo garantizado',
                         'Presupuesto sin cargo', 'Envío a domicilio'];
      const pageText = document.body.textContent || '';
      for (const info of infoTexts) {
        if (pageText.includes(info)) {
          const siMatch = pageText.match(new RegExp(`${info}\\s*(SI|NO|Sí|No)`, 'i'));
          if (siMatch) {
            additionalInfo[info] = siMatch[1].toUpperCase() === 'SI' || siMatch[1].toLowerCase() === 'sí' ? 'SI' : 'NO';
          }
        }
      }

      return {
        businessName,
        address,
        neighborhood,
        department,
        phone,
        whatsappUrl,
        description,
        instagram,
        logoUrl,
        photos,
        categories,
        hours,
        is24hrs,
        lat,
        lng,
        paymentMethods,
        additionalInfo,
      };
    });

    if (!data || !data.businessName) {
      console.log(`  ⚠ No data found for ${url}`);
      return null;
    }

    // Extract external ID from URL
    const externalId = url.split('/').pop() || `1122-${data.businessName.toLowerCase().replace(/\s+/g, '-')}`;

    // Normalize phone
    const normalizedPhone = normalizePhone(data.phone);

    // Extract WhatsApp number
    let whatsapp: string | undefined;
    if (data.whatsappUrl) {
      const waMatch = data.whatsappUrl.match(/wa\.me\/(\d+)/);
      if (waMatch) {
        whatsapp = waMatch[1];
      }
    }

    const provider: ScrapedProvider = {
      business_name: data.businessName,
      description: data.description || undefined,
      address: data.address || undefined,
      department: data.department || 'Montevideo',
      neighborhood: normalizeNeighborhood(data.neighborhood) || undefined,
      contact_phone: normalizedPhone,
      contact_whatsapp: whatsapp,
      category: 'electricista', // Primary category
      categories: data.categories.length > 0 ? data.categories : undefined,
      source: '1122',
      source_url: url,
      external_id: externalId,
      logo_url: data.logoUrl || undefined,
      photos: data.photos.length > 0 ? data.photos : undefined,
      social_instagram: data.instagram || undefined,
      hours: Object.keys(data.hours).length > 0 ? data.hours : undefined,
      is_24hrs: data.is24hrs || undefined,
      location_lat: data.lat,
      location_lng: data.lng,
      payment_methods: data.paymentMethods.length > 0 ? data.paymentMethods : undefined,
      additional_info: Object.keys(data.additionalInfo).length > 0 ? data.additionalInfo : undefined,
    };

    return provider;

  } catch (error) {
    console.error(`  ✗ Error scraping ${url}:`, error);
    return null;
  }
}

async function scrape1122() {
  console.log('Starting 1122.com.uy scraper (with detail pages)...');
  console.log('Category: Electricistas\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  try {
    // Step 1: Get all business URLs
    console.log('=== Step 1: Collecting business URLs ===\n');
    const businessUrls = await getBusinessUrls(page, 10);
    console.log(`\nTotal businesses to scrape: ${businessUrls.length}\n`);

    // Step 2: Scrape each detail page
    console.log('=== Step 2: Scraping detail pages ===\n');
    const allProviders: ScrapedProvider[] = [];

    for (let i = 0; i < businessUrls.length; i++) {
      const url = businessUrls[i];
      console.log(`[${i + 1}/${businessUrls.length}] ${url.split('/').pop()}`);

      const provider = await scrapeDetailPage(page, url);
      if (provider) {
        allProviders.push(provider);
        console.log(`  ✓ ${provider.business_name} | ${provider.contact_phone || 'no phone'} | ${provider.neighborhood || 'no zone'}`);
      }

      // Rate limiting
      await page.waitForTimeout(800);
    }

    console.log(`\n=== TOTAL: ${allProviders.length} providers ===`);

    // Save to file
    const outputPath = resolve(__dirname, '../data/1122-electricistas.json');
    writeFileSync(outputPath, JSON.stringify(allProviders, null, 2));
    console.log(`Saved to: ${outputPath}`);

    // Show stats
    const withPhone = allProviders.filter(p => p.contact_phone).length;
    const withWhatsapp = allProviders.filter(p => p.contact_whatsapp).length;
    const withPhotos = allProviders.filter(p => p.photos && p.photos.length > 0).length;
    const withInstagram = allProviders.filter(p => p.social_instagram).length;
    const withHours = allProviders.filter(p => p.hours).length;
    const withCoords = allProviders.filter(p => p.location_lat).length;

    console.log('\n=== STATS ===');
    console.log(`With phone: ${withPhone}/${allProviders.length}`);
    console.log(`With WhatsApp: ${withWhatsapp}/${allProviders.length}`);
    console.log(`With photos: ${withPhotos}/${allProviders.length}`);
    console.log(`With Instagram: ${withInstagram}/${allProviders.length}`);
    console.log(`With hours: ${withHours}/${allProviders.length}`);
    console.log(`With coordinates: ${withCoords}/${allProviders.length}`);

    // Show sample
    console.log('\n=== SAMPLE ===');
    const sample = allProviders[0];
    if (sample) {
      console.log(JSON.stringify(sample, null, 2));
    }

  } finally {
    await browser.close();
  }
}

scrape1122().catch(console.error);
