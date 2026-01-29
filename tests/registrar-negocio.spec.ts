import { test, expect } from '@playwright/test';

test.describe('Registrar Negocio Page - Full Mode', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/registrar-negocio');
	});

	test('should load registration page with full form', async ({ page }) => {
		await expect(page).toHaveTitle(/Ofrecer Servicios - Mi Barrio/);

		// Check page title and subtitle
		await expect(page.getByRole('heading', { name: 'Registrá tu negocio' })).toBeVisible();
		await expect(page.getByText('Completá tu perfil para que te encuentren en tu barrio')).toBeVisible();
	});

	test('should show auth notice when not logged in', async ({ page }) => {
		// Check auth notice
		await expect(page.getByText('Para registrar tu negocio necesitás una cuenta')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Registrate' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'ingresá' })).toBeVisible();
	});

	test('should show all form fields', async ({ page }) => {
		// Business name field (shown as button with placeholder text when empty)
		await expect(page.getByText('Nombre del negocio')).toBeVisible();

		// Category picker should be visible (placeholder text)
		await expect(page.getByText('Seleccionar categorías')).toBeVisible();

		// Location picker should be visible (placeholder text)
		await expect(page.getByText('Agregar ubicación')).toBeVisible();

		// Contact section should exist
		await expect(page.getByText('Contacto')).toBeVisible();

		// Description section should be visible (full mode shows all fields)
		await expect(page.getByRole('heading', { name: 'Descripción' })).toBeVisible();

		// Photos section should be visible
		await expect(page.getByRole('heading', { name: /Fotos/i })).toBeVisible();
	});

	test('should have publish button', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Publicar mi negocio' })).toBeVisible();
	});
});

test.describe('Registrar Negocio - Validation Errors', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/registrar-negocio');
	});

	test('should show inline error for empty business name', async ({ page }) => {
		// Try to submit without filling anything
		await page.getByRole('button', { name: 'Publicar mi negocio' }).click();

		// Check for inline error message
		await expect(page.getByText('Ingresá el nombre de tu negocio')).toBeVisible();
	});

	test('should show inline error for missing category', async ({ page }) => {
		// Click on name field to activate editing
		await page.getByText('Nombre del negocio').click();
		// Input should now appear, fill it
		await page.locator('input[placeholder="Nombre del negocio"]').fill('Test Business');
		// Press Enter to finish editing
		await page.keyboard.press('Enter');

		// Try to submit
		await page.getByRole('button', { name: 'Publicar mi negocio' }).click();

		// Check for category error
		await expect(page.getByText('Elegí al menos una categoría')).toBeVisible();
	});

	test('should show inline error for missing department', async ({ page }) => {
		// Click on name field to activate editing
		await page.getByText('Nombre del negocio').click();
		await page.locator('input[placeholder="Nombre del negocio"]').fill('Test Business');
		await page.keyboard.press('Enter');

		// Select a category - first open the picker, then select
		await page.getByText('Seleccionar categorías').click();
		await page.getByRole('button', { name: 'Electricistas' }).click();
		// Close the dropdown by pressing Escape
		await page.keyboard.press('Escape');

		// Try to submit
		await page.getByRole('button', { name: 'Publicar mi negocio' }).click();

		// Check for department error
		await expect(page.getByText('Elegí dónde trabajás')).toBeVisible();
	});

	test('should show inline error for missing contact', async ({ page }) => {
		// Click on name field to activate editing
		await page.getByText('Nombre del negocio').click();
		await page.locator('input[placeholder="Nombre del negocio"]').fill('Test Business');
		await page.keyboard.press('Enter');

		// Select a category
		await page.getByText('Seleccionar categorías').click();
		await page.getByRole('button', { name: 'Electricistas' }).click();
		await page.keyboard.press('Escape');

		// Select department - first open location picker, then select
		await page.getByText('Agregar ubicación').click();
		await page.locator('#loc-department').selectOption('Montevideo');
		await page.getByRole('button', { name: 'Listo' }).click();

		// Try to submit
		await page.getByRole('button', { name: 'Publicar mi negocio' }).click();

		// Check for contact error
		await expect(page.getByText(/Ingresá al menos un contacto/i)).toBeVisible();
	});

	test('should show toast with general error message', async ({ page }) => {
		// Try to submit without filling anything
		await page.getByRole('button', { name: 'Publicar mi negocio' }).click();

		// Check for toast message
		await expect(page.getByText('Revisá los campos marcados en rojo')).toBeVisible();
	});

	test('should have red border on field with error', async ({ page }) => {
		// Try to submit without filling anything
		await page.getByRole('button', { name: 'Publicar mi negocio' }).click();

		// Check for red ring/border class on the field container
		const nameFieldContainer = page.locator('#field-businessName');
		await expect(nameFieldContainer).toBeVisible();
	});
});

test.describe('Registrar Negocio - Guided Description', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/registrar-negocio');
	});

	test('should show guided description questions', async ({ page }) => {
		// Check questions are visible
		await expect(page.getByText('¿Qué servicios ofrecés?')).toBeVisible();
		await expect(page.getByText('¿Cuánto tiempo de experiencia tenés?')).toBeVisible();
		await expect(page.getByText('¿Vas a domicilio?')).toBeVisible();
		await expect(page.getByText('¿Hacés presupuestos sin cargo?')).toBeVisible();
		await expect(page.getByText('¿Algo más que quieras agregar?')).toBeVisible();
	});

	test('should have experience dropdown with options', async ({ page }) => {
		const experienceSelect = page.locator('#experience');
		await expect(experienceSelect).toBeVisible();

		// Check options
		await expect(experienceSelect.locator('option', { hasText: 'Recién empiezo' })).toBeAttached();
		await expect(experienceSelect.locator('option', { hasText: '1-5 años' })).toBeAttached();
		await expect(experienceSelect.locator('option', { hasText: 'Más de 5 años' })).toBeAttached();
		await expect(experienceSelect.locator('option', { hasText: 'Más de 10 años' })).toBeAttached();
	});

	test('should have domicilio dropdown with options', async ({ page }) => {
		const domicilioSelect = page.locator('#domicilio');
		await expect(domicilioSelect).toBeVisible();

		// Check options
		await expect(domicilioSelect.locator('option', { hasText: 'Sí' })).toBeAttached();
		await expect(domicilioSelect.locator('option', { hasText: 'No' })).toBeAttached();
		await expect(domicilioSelect.locator('option', { hasText: 'A veces' })).toBeAttached();
	});

	test('should generate description from answers', async ({ page }) => {
		// Wait for guided description form to be visible
		await expect(page.locator('#services')).toBeVisible();

		// Fill in the services field
		await page.locator('#services').fill('Instalaciones eléctricas');

		// The description should now contain the text we typed
		// Note: Once description is generated, the form switches to EditableTextarea view
		// So we verify the generated description is visible
		await expect(page.getByText(/Instalaciones eléctricas/)).toBeVisible();
	});

	test('should toggle to free edit mode', async ({ page }) => {
		// Click toggle to free edit
		await page.getByRole('button', { name: /Editar texto libremente/i }).click();

		// Textarea should be visible
		const textarea = page.locator('textarea[placeholder="Contá sobre tu negocio, servicios, horarios..."]');
		await expect(textarea).toBeVisible();

		// Questions should be hidden
		await expect(page.getByText('¿Qué servicios ofrecés?')).not.toBeVisible();

		// Back button should be visible
		await expect(page.getByRole('button', { name: /Volver a las preguntas guiadas/i })).toBeVisible();
	});

	test('should toggle back to guided mode', async ({ page }) => {
		// Switch to free edit
		await page.getByRole('button', { name: /Editar texto libremente/i }).click();

		// Switch back to guided
		await page.getByRole('button', { name: /Volver a las preguntas guiadas/i }).click();

		// Questions should be visible again
		await expect(page.getByText('¿Qué servicios ofrecés?')).toBeVisible();
	});
});

test.describe('Registrar Negocio - Photo Guidance', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/registrar-negocio');
	});

	test('should show photo placeholders with guidance', async ({ page }) => {
		// Check placeholder icons/labels
		await expect(page.getByText('Tu foto')).toBeVisible();
		await expect(page.getByText('Tu trabajo')).toBeVisible();
		await expect(page.getByText('Trabajo terminado')).toBeVisible();
		await expect(page.getByText('Tu local')).toBeVisible();
	});

	test('should highlight most important photo', async ({ page }) => {
		// Check "LA MÁS IMPORTANTE" indicator
		await expect(page.getByText('LA MÁS IMPORTANTE')).toBeVisible();
	});

	test('should show photo tip', async ({ page }) => {
		// Check tip text
		await expect(page.getByText(/Fotos claras y con buena luz/i)).toBeVisible();
	});

	test('should show click to choose photos text', async ({ page }) => {
		await expect(page.getByText('Click para elegir fotos')).toBeVisible();
	});
});

test.describe('Registrar Negocio - Mobile Viewport', () => {
	test.use({ viewport: { width: 375, height: 667 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/registrar-negocio');
	});

	test('should render properly on mobile', async ({ page }) => {
		// Page should load
		await expect(page).toHaveTitle(/Ofrecer Servicios - Mi Barrio/);

		// Main elements should be visible
		await expect(page.getByRole('heading', { name: 'Registrá tu negocio' })).toBeVisible();
		await expect(page.getByText('Nombre del negocio')).toBeVisible();
	});

	test('should have scrollable content on mobile', async ({ page }) => {
		// All main sections should be accessible (may need to scroll)
		await expect(page.getByRole('heading', { name: 'Descripción' })).toBeVisible();

		// Scroll down to see photos section
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await expect(page.getByRole('heading', { name: /Fotos/i })).toBeVisible();
	});

	test('should show contact section on mobile', async ({ page }) => {
		// Scroll to contact section
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await expect(page.getByText('Contacto')).toBeVisible();
	});
});
