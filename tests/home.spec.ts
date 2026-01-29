import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
	test('should load and display main elements', async ({ page }) => {
		await page.goto('/');

		// Check page title
		await expect(page).toHaveTitle(/Mi Barrio/);

		// Check header is visible
		await expect(page.locator('header')).toBeVisible();

		// Check main heading
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		// Check search form
		await expect(page.getByPlaceholder(/¿Qué servicio buscás\?/i)).toBeVisible();
		await expect(page.getByRole('button', { name: /Buscar/i })).toBeVisible();

		// Check CTA for providers
		await expect(page.getByRole('link', { name: /Ofrecer servicios/i }).first()).toBeVisible();
	});

	test('should navigate to directorio from search', async ({ page }) => {
		await page.goto('/');

		await page.getByRole('button', { name: /Buscar/i }).click();

		await expect(page).toHaveURL(/\/directorio/);
	});

	test('should navigate to login for providers', async ({ page }) => {
		await page.goto('/');

		// Click on "Ofrecer servicios" CTA (in the hero section)
		await page.getByRole('link', { name: /Ofrecer servicios/i }).first().click();

		await expect(page).toHaveURL(/\/auth\/login/);
	});

	test('should display popular categories', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { name: /Categorías populares/i })).toBeVisible();

		// Check that category links exist
		const categoryLinks = page.locator('a[href^="/directorio?categoria="]');
		const count = await categoryLinks.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should search with query parameter', async ({ page }) => {
		await page.goto('/');

		// Enter search query
		await page.getByPlaceholder(/¿Qué servicio buscás\?/i).fill('electricista');

		// Click search
		await page.getByRole('button', { name: /Buscar/i }).click();

		// Should navigate with query param
		await expect(page).toHaveURL(/\/directorio\?q=electricista/);
	});

	test('should filter by department', async ({ page }) => {
		await page.goto('/');

		// Select department
		await page.locator('select').first().selectOption('Montevideo');

		// Search
		await page.getByRole('button', { name: /Buscar/i }).click();

		await expect(page).toHaveURL(/departamento=Montevideo/);
	});

	test('should show neighborhood selector for Montevideo', async ({ page }) => {
		await page.goto('/');

		// Initially neighborhood selector should not be visible
		const neighborhoodSelect = page.locator('select').nth(1);

		// Select Montevideo
		await page.locator('select').first().selectOption('Montevideo');

		// Neighborhood selector should appear
		await expect(neighborhoodSelect).toBeVisible();
	});
});
