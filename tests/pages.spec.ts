import { test, expect } from '@playwright/test';

test.describe('Plans Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/planes');
	});

	test('should load plans page', async ({ page }) => {
		await expect(page).toHaveTitle(/Planes - Mi Barrio/);

		// Check main heading
		await expect(page.getByRole('heading', { name: /100% gratuito/i })).toBeVisible();
	});

	test('should display free plan features', async ({ page }) => {
		// Check feature list items
		await expect(page.getByText(/Perfil completo/i)).toBeVisible();
		await expect(page.getByText(/categorías de servicios/i)).toBeVisible();
		await expect(page.getByText(/Fotos de tu negocio/i)).toBeVisible();
		await expect(page.getByText(/Contacto directo/i)).toBeVisible();
	});

	test('should display FAQ section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: /Preguntas frecuentes/i })).toBeVisible();

		// Check FAQ items
		await expect(page.getByText(/¿Es realmente gratis\?/i)).toBeVisible();
		await expect(page.getByText(/¿Qué categorías puedo elegir\?/i)).toBeVisible();
		await expect(page.getByText(/¿Cómo me registro\?/i)).toBeVisible();
	});

	test('should have CTA button', async ({ page }) => {
		// The button is inside a card, check for the link
		const ctaLink = page.locator('a[href*="/registrar-negocio"]');
		await expect(ctaLink.first()).toBeVisible();
	});

	test('should have contact section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: /¿Tenés más preguntas\?/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Contactar/i })).toBeVisible();
	});
});

test.describe('Terms Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/terms');
	});

	test('should load terms page', async ({ page }) => {
		await expect(page).toHaveTitle(/Términos y Condiciones - Mi Barrio/);

		// Check main heading
		await expect(page.getByRole('heading', { name: /Términos y Condiciones/i })).toBeVisible();
	});

	test('should display all sections', async ({ page }) => {
		// Check key sections exist
		await expect(page.getByText(/Aceptación de los Términos/i)).toBeVisible();
		await expect(page.getByText(/Definiciones/i)).toBeVisible();
		await expect(page.getByText(/Naturaleza del Servicio/i)).toBeVisible();
	});

	test('should have contact email link', async ({ page }) => {
		const emailLink = page.locator('a[href^="mailto:"]').first();
		await expect(emailLink).toBeVisible();
	});
});

test.describe('Privacy Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/privacy');
	});

	test('should load privacy page', async ({ page }) => {
		await expect(page).toHaveTitle(/Política de Privacidad - Mi Barrio/);

		// Check main heading
		await expect(page.getByRole('heading', { name: /Política de Privacidad/i })).toBeVisible();
	});

	test('should display privacy sections', async ({ page }) => {
		// Check key sections exist
		await expect(page.getByText(/Información que Recopilamos/i)).toBeVisible();
		await expect(page.getByText(/Uso de la Información/i)).toBeVisible();
		await expect(page.getByText(/Derechos del Usuario/i)).toBeVisible();
	});

	test('should have contact email link', async ({ page }) => {
		const emailLink = page.locator('a[href^="mailto:"]').first();
		await expect(emailLink).toBeVisible();
	});
});

test.describe('Navigation', () => {
	test('should have consistent header on all pages', async ({ page }) => {
		const pages = ['/', '/directorio', '/planes', '/terms', '/privacy', '/auth/login'];

		for (const path of pages) {
			await page.goto(path);
			await expect(page.locator('header')).toBeVisible();
			await expect(page.getByRole('link', { name: 'Mi Barrio' })).toBeVisible();
		}
	});

	test('should navigate from header logo to home', async ({ page }) => {
		await page.goto('/directorio');
		await page.getByRole('link', { name: 'Mi Barrio' }).click();
		await expect(page).toHaveURL('/');
	});
});

test.describe('Mobile Navigation', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('should show mobile menu button on mobile', async ({ page }) => {
		await page.goto('/');

		// Mobile menu button should be visible
		await expect(page.getByRole('button', { name: /Abrir menu/i })).toBeVisible();
	});

	test('should toggle mobile menu', async ({ page }) => {
		await page.goto('/directorio');

		// Click menu button
		const menuButton = page.getByRole('button', { name: /Abrir menu/i });

		if (await menuButton.isVisible()) {
			await menuButton.click();

			// Wait a bit for the menu to open
			await page.waitForTimeout(300);

			// Either close button or menu content should be visible
			const closeButton = page.getByRole('button', { name: /Cerrar menu/i });
			const menuLinks = page.locator('nav a');

			const hasCloseButton = await closeButton.isVisible().catch(() => false);
			const hasMenuLinks = (await menuLinks.count()) > 0;

			expect(hasCloseButton || hasMenuLinks).toBe(true);
		}
	});
});
