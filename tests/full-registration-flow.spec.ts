import { test, expect } from '@playwright/test';

test.describe('Full Business Registration Form Flow', () => {
	test('should complete full business registration form (UI only)', async ({ page }) => {
		// Note: This test verifies the complete UI flow without actual authentication
		// For full E2E with real auth, you need to disable email confirmation in Supabase

		// Step 1: Navigate to business registration
		await page.goto('/registrar-negocio');
		await expect(page).toHaveTitle(/Ofrecer Servicios - Mi Barrio/);

		// Step 2: Select business type
		await expect(page.getByRole('heading', { name: '¿Cómo querés registrarte?' })).toBeVisible();
		await page.getByRole('heading', { name: 'Particular' }).click();

		// Step 3: Verify full form is shown
		await expect(page.getByText('Registrá tus servicios')).toBeVisible();
		await expect(page.getByText('Completá tu perfil para que te encuentren en tu barrio')).toBeVisible();

		// Step 4: Fill business name
		await page.getByText('Nombre del negocio').click();
		await page.locator('input[placeholder="Nombre del negocio"]').fill('Electricista Juan');
		await page.keyboard.press('Enter');

		// Verify name is displayed
		await expect(page.getByText('Electricista Juan')).toBeVisible();

		// Step 4: Select category
		await page.getByText('Seleccionar categorías').click();
		await page.getByRole('button', { name: 'Electricistas' }).click();
		await page.keyboard.press('Escape');

		// Verify category is displayed
		await expect(page.locator('span').filter({ hasText: 'Electricistas' }).first()).toBeVisible();

		// Step 5: Select location
		await page.getByText('Agregar ubicación').click();
		await page.locator('#loc-department').selectOption('Montevideo');
		await page.locator('#loc-neighborhood').selectOption('Centro');
		await page.getByRole('button', { name: 'Listo' }).click();

		// Verify location is displayed
		await expect(page.getByText('Centro, Montevideo')).toBeVisible();

		// Step 6: Add phone number
		await page.getByText('Agregar teléfono').click();
		await page.locator('input[type="tel"]').fill('099123456');
		await page.keyboard.press('Enter');

		// Verify phone is displayed
		await expect(page.getByText('099123456')).toBeVisible();

		// Step 7: Description section - textarea first with helper option
		const descTextarea = page.locator('textarea[placeholder="Contá sobre tu negocio, servicios, horarios..."]');
		await expect(descTextarea).toBeVisible();
		await expect(page.getByText('¿Necesitás ayuda para escribir tu descripción?')).toBeVisible();

		// Step 8: Use the description helper
		await page.getByText('¿Necesitás ayuda para escribir tu descripción?').click();
		await page.locator('#services').fill('Instalaciones y reparaciones eléctricas');
		await page.locator('#experience').selectOption('5+');
		await page.getByRole('button', { name: /Generar descripción/i }).click();

		// Verify description was generated in textarea
		await expect(descTextarea).toHaveValue(/Instalaciones y reparaciones eléctricas/);

		// Step 9: Verify photo guidance is shown
		await expect(page.getByText('Tu foto')).toBeVisible();
		await expect(page.getByText('Tu trabajo')).toBeVisible();
		await expect(page.getByText('LA MÁS IMPORTANTE')).toBeVisible();
		await expect(page.getByText(/Fotos claras y con buena luz/i)).toBeVisible();

		// Step 10: Verify publish button is available
		await expect(page.getByRole('button', { name: 'Publicar mi negocio' })).toBeVisible();

		// Step 11: Try to submit (will show auth error since not logged in)
		await page.getByRole('button', { name: 'Publicar mi negocio' }).click();

		// Should show auth-related message or redirect to login
		await page.waitForTimeout(1000);

		// Either we get redirected to login or we see an error toast
		const isOnLoginPage = page.url().includes('/auth/login');
		const authErrorToast = page.getByText(/iniciar sesión/i);
		const hasAuthError = await authErrorToast.isVisible().catch(() => false);

		expect(isOnLoginPage || hasAuthError).toBe(true);
	});

	test('should show validation errors for incomplete form', async ({ page }) => {
		await page.goto('/registrar-negocio');

		// Select business type first
		await page.getByRole('heading', { name: 'Particular' }).click();

		// Try to submit empty form
		await page.getByRole('button', { name: 'Publicar mi negocio' }).click();

		// Should show validation errors
		await expect(page.getByText('Revisá los campos marcados en rojo')).toBeVisible();
		await expect(page.getByText('Ingresá el nombre de tu negocio')).toBeVisible();
	});

	test('should preserve form data while filling', async ({ page }) => {
		await page.goto('/registrar-negocio');

		// Select business type first
		await page.getByRole('heading', { name: 'Particular' }).click();

		// Fill business name
		await page.getByText('Nombre del negocio').click();
		await page.locator('input[placeholder="Nombre del negocio"]').fill('Test Business');
		await page.keyboard.press('Enter');

		// Select category
		await page.getByText('Seleccionar categorías').click();
		await page.getByRole('button', { name: 'Plomeros' }).click();
		await page.keyboard.press('Escape');

		// Verify data is preserved
		await expect(page.getByText('Test Business')).toBeVisible();
		await expect(page.locator('span').filter({ hasText: 'Plomeros' }).first()).toBeVisible();
	});
});

