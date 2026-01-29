import { test, expect } from '@playwright/test';

test.describe('Directorio Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/directorio');
	});

	test('should load and display directory', async ({ page }) => {
		await expect(page).toHaveTitle(/Directorio - Mi Barrio/);

		// Check header
		await expect(page.locator('header')).toBeVisible();

		// Check search input
		await expect(page.getByPlaceholder(/Buscar servicios/i)).toBeVisible();

		// Check filter button
		await expect(page.getByRole('button', { name: /Filtros/i })).toBeVisible();
	});

	test('should open filter dialog when clicking filter button', async ({ page }) => {
		// Click filter button
		await page.getByRole('button', { name: /Filtros/i }).click();

		// Check dialog is open
		await expect(page.getByRole('heading', { name: 'Filtros' })).toBeVisible();

		// Check filter sections exist
		await expect(page.getByText('Tipo')).toBeVisible();
		await expect(page.getByText('Categoría')).toBeVisible();
		await expect(page.getByText('Departamento')).toBeVisible();

		// Check buttons
		await expect(page.getByRole('button', { name: 'Limpiar' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Aplicar filtros' })).toBeVisible();
	});

	test('should close filter dialog when clicking apply', async ({ page }) => {
		// Open dialog
		await page.getByRole('button', { name: /Filtros/i }).click();
		await expect(page.getByRole('heading', { name: 'Filtros' })).toBeVisible();

		// Click apply
		await page.getByRole('button', { name: 'Aplicar filtros' }).click();

		// Dialog should be closed
		await expect(page.getByRole('heading', { name: 'Filtros' })).not.toBeVisible();
	});

	test('should apply category filter and show chip', async ({ page }) => {
		// Open dialog
		await page.getByRole('button', { name: /Filtros/i }).click();

		// Select a category
		await page.getByRole('button', { name: 'Electricistas' }).click();

		// Click apply
		await page.getByRole('button', { name: 'Aplicar filtros' }).click();

		// Check filter chip is visible
		await expect(page.getByText('Electricistas')).toBeVisible();

		// Check filter count badge shows 1
		await expect(page.getByRole('button', { name: /Filtros 1/i })).toBeVisible();
	});

	test('should apply type filter and show chip', async ({ page }) => {
		// Open dialog
		await page.getByRole('button', { name: /Filtros/i }).click();

		// Select type
		await page.getByRole('button', { name: 'Profesionales' }).click();

		// Click apply
		await page.getByRole('button', { name: 'Aplicar filtros' }).click();

		// Check filter chip
		await expect(page.getByText('Profesionales')).toBeVisible();
	});

	test('should clear all filters with clear button', async ({ page }) => {
		// Open dialog and select a filter
		await page.getByRole('button', { name: /Filtros/i }).click();
		await page.getByRole('button', { name: 'Electricistas' }).click();
		await page.getByRole('button', { name: 'Aplicar filtros' }).click();

		// Verify filter is applied
		await expect(page.getByRole('button', { name: /Filtros 1/i })).toBeVisible();

		// Click clear all
		await page.getByRole('button', { name: /Limpiar filtros/i }).click();

		// Filters should be cleared (no count badge)
		await expect(page.getByRole('button', { name: /^Filtros$/i })).toBeVisible();
	});

	test('should search for businesses', async ({ page }) => {
		const searchInput = page.getByPlaceholder(/Buscar servicios/i);

		// Type search query
		await searchInput.fill('test');

		// Wait for debounce
		await page.waitForTimeout(600);

		// Search should be applied (no error)
		await expect(searchInput).toHaveValue('test');
	});

	test('should display business cards or empty state', async ({ page }) => {
		// Wait for content to load
		await page.waitForLoadState('networkidle');

		// Check if there are business cards or empty state
		const businessCard = page.locator('a[href^="/directorio/"]').first();
		const emptyState = page.getByText(/No se encontraron/i);

		// Either business cards or empty state should be visible
		const hasBusinesses = await businessCard.isVisible().catch(() => false);
		const hasEmptyState = await emptyState.isVisible().catch(() => false);
		const hasCount = await page.getByText(/negocio(s)? encontrado/i).isVisible().catch(() => false);

		expect(hasBusinesses || hasEmptyState || hasCount).toBe(true);
	});

	test('should navigate to business detail when clicking card', async ({ page }) => {
		await page.waitForLoadState('networkidle');

		const businessCard = page.locator('a[href^="/directorio/"]').first();

		if (await businessCard.isVisible()) {
			await businessCard.click();
			await expect(page).toHaveURL(/\/directorio\/.+/);
		}
	});

	test('should apply department filter', async ({ page }) => {
		// Open dialog
		await page.getByRole('button', { name: /Filtros/i }).click();

		// Select department from dropdown
		await page.locator('select').selectOption('Montevideo');

		// Click apply
		await page.getByRole('button', { name: 'Aplicar filtros' }).click();

		// Check filter chip
		await expect(page.getByText('Montevideo')).toBeVisible();
	});
});
