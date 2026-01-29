import { test, expect } from '@playwright/test';

test.describe('Business Detail Page', () => {
	test('should display business information when visiting detail page', async ({ page }) => {
		// Navigate to directorio first
		await page.goto('/directorio');
		await page.waitForLoadState('networkidle');

		// Try to navigate to a business detail
		const businessCard = page.locator('a[href^="/directorio/"]').first();

		if (!(await businessCard.isVisible())) {
			test.skip();
			return;
		}

		await businessCard.click();
		await page.waitForLoadState('networkidle');

		// Check page loaded
		await expect(page.locator('header')).toBeVisible();

		// Check back link
		await expect(page.getByRole('link', { name: /Volver al directorio/i })).toBeVisible();

		// Check business name heading
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		// Check contact section
		await expect(page.getByRole('heading', { name: 'Contactar' })).toBeVisible();
	});

	test('should navigate back to directorio', async ({ page }) => {
		await page.goto('/directorio');
		await page.waitForLoadState('networkidle');

		const businessCard = page.locator('a[href^="/directorio/"]').first();

		if (!(await businessCard.isVisible())) {
			test.skip();
			return;
		}

		await businessCard.click();
		await page.waitForLoadState('networkidle');

		await page.getByRole('link', { name: /Volver al directorio/i }).click();
		await expect(page).toHaveURL('/directorio');
	});

	test('should display location information', async ({ page }) => {
		await page.goto('/directorio');
		await page.waitForLoadState('networkidle');

		const businessCard = page.locator('a[href^="/directorio/"]').first();

		if (!(await businessCard.isVisible())) {
			test.skip();
			return;
		}

		await businessCard.click();
		await page.waitForLoadState('networkidle');

		// Location info should be visible (at minimum a department name)
		const hasLocation = await page.getByText(/Montevideo|Canelones|Maldonado|Artigas|Cerro Largo|Colonia|Durazno|Flores|Florida|Lavalleja|Paysandú|Rivera|Río Negro|Rocha|Salto|San José|Soriano|Tacuarembó|Treinta y Tres/i).first().isVisible();
		expect(hasLocation).toBe(true);
	});
});

test.describe('Business Detail - Photo Lightbox', () => {
	test('should open lightbox when clicking gallery photo', async ({ page }) => {
		await page.goto('/directorio');
		await page.waitForLoadState('networkidle');

		const businessCard = page.locator('a[href^="/directorio/"]').first();

		if (!(await businessCard.isVisible())) {
			test.skip();
			return;
		}

		await businessCard.click();
		await page.waitForLoadState('networkidle');

		// Find photo buttons in gallery section (look for images inside buttons)
		const photoButtons = page.locator('button img[alt="Foto"]');
		const photoCount = await photoButtons.count();

		if (photoCount === 0) {
			// Also try buttons with "Foto" text
			const altPhotoButtons = page.locator('button').filter({ hasText: 'Foto' });
			if ((await altPhotoButtons.count()) === 0) {
				test.skip();
				return;
			}
			await altPhotoButtons.first().click();
		} else {
			await photoButtons.first().click();
		}

		// Lightbox should open - look for close button
		await expect(page.getByRole('button', { name: /Cerrar/i })).toBeVisible();
	});

	test('should navigate photos with buttons in lightbox', async ({ page }) => {
		await page.goto('/directorio');
		await page.waitForLoadState('networkidle');

		const businessCard = page.locator('a[href^="/directorio/"]').first();

		if (!(await businessCard.isVisible())) {
			test.skip();
			return;
		}

		await businessCard.click();
		await page.waitForLoadState('networkidle');

		// Find and click first photo
		const photoButtons = page.locator('button').filter({ hasText: 'Foto' });
		const photoCount = await photoButtons.count();

		if (photoCount < 2) {
			test.skip();
			return;
		}

		await photoButtons.first().click();

		// Check counter shows "1 / X"
		await expect(page.getByText(/1 \/ \d+/)).toBeVisible();

		// Click next
		const nextButton = page.getByRole('button', { name: /Siguiente/i });
		if (await nextButton.isVisible()) {
			await nextButton.click();
			// Counter should update
			await expect(page.getByText(/2 \/ \d+/)).toBeVisible();
		}
	});

	test('should close lightbox with Escape key', async ({ page }) => {
		await page.goto('/directorio');
		await page.waitForLoadState('networkidle');

		const businessCard = page.locator('a[href^="/directorio/"]').first();

		if (!(await businessCard.isVisible())) {
			test.skip();
			return;
		}

		await businessCard.click();
		await page.waitForLoadState('networkidle');

		const photoButtons = page.locator('button').filter({ hasText: 'Foto' });

		if ((await photoButtons.count()) === 0) {
			test.skip();
			return;
		}

		// Open lightbox
		await photoButtons.first().click();
		const closeButton = page.getByRole('button', { name: /Cerrar/i });
		await expect(closeButton.first()).toBeVisible();

		// Close with Escape
		await page.keyboard.press('Escape');

		// Lightbox should be closed
		await expect(closeButton.first()).not.toBeVisible();
	});

	test('should navigate photos with arrow keys', async ({ page }) => {
		await page.goto('/directorio');
		await page.waitForLoadState('networkidle');

		const businessCard = page.locator('a[href^="/directorio/"]').first();

		if (!(await businessCard.isVisible())) {
			test.skip();
			return;
		}

		await businessCard.click();
		await page.waitForLoadState('networkidle');

		const photoButtons = page.locator('button').filter({ hasText: 'Foto' });
		const photoCount = await photoButtons.count();

		if (photoCount < 2) {
			test.skip();
			return;
		}

		// Open lightbox
		await photoButtons.first().click();
		await expect(page.getByText(/1 \/ \d+/)).toBeVisible();

		// Navigate with ArrowRight
		await page.keyboard.press('ArrowRight');
		await expect(page.getByText(/2 \/ \d+/)).toBeVisible();

		// Navigate with ArrowLeft
		await page.keyboard.press('ArrowLeft');
		await expect(page.getByText(/1 \/ \d+/)).toBeVisible();
	});
});
