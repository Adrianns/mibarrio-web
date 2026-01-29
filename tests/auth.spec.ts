import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/auth/login');
	});

	test('should load login page', async ({ page }) => {
		await expect(page).toHaveTitle(/Ingresar - Mi Barrio/);

		// Check form elements
		await expect(page.getByLabel(/Email/i)).toBeVisible();
		await expect(page.getByLabel(/Contraseña/i)).toBeVisible();
		await expect(page.getByRole('button', { name: /Ingresar/i })).toBeVisible();
	});

	test('should have link to register', async ({ page }) => {
		await expect(page.getByRole('link', { name: /Registrate/i })).toBeVisible();
	});

	test('should have link to forgot password', async ({ page }) => {
		await expect(page.getByRole('link', { name: /Olvidaste tu contraseña/i })).toBeVisible();
	});

	test('should navigate to register page', async ({ page }) => {
		await page.getByRole('link', { name: /Registrate/i }).click();
		await expect(page).toHaveURL(/\/auth\/register/);
	});

	test('should navigate to forgot password page', async ({ page }) => {
		await page.getByRole('link', { name: /Olvidaste tu contraseña/i }).click();
		await expect(page).toHaveURL(/\/auth\/forgot-password/);
	});

	test('should require email field', async ({ page }) => {
		const emailInput = page.getByLabel(/Email/i);
		const isRequired = await emailInput.evaluate((el: HTMLInputElement) => el.required);
		expect(isRequired).toBe(true);
	});

	test('should require password field', async ({ page }) => {
		const passwordInput = page.getByLabel(/Contraseña/i);
		const isRequired = await passwordInput.evaluate((el: HTMLInputElement) => el.required);
		expect(isRequired).toBe(true);
	});

	test('should toggle password visibility', async ({ page }) => {
		const passwordInput = page.locator('input#password');

		// Initially password type
		await expect(passwordInput).toHaveAttribute('type', 'password');

		// Find and click the toggle button (inside the password field container)
		const toggleButton = page.locator('input#password').locator('..').locator('button');
		await toggleButton.click();

		// Should be text type now
		await expect(passwordInput).toHaveAttribute('type', 'text');
	});
});

test.describe('Register Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/auth/register');
	});

	test('should load register page', async ({ page }) => {
		await expect(page).toHaveTitle(/Registrarse - Mi Barrio/);

		// Check form elements
		await expect(page.getByLabel(/Nombre completo/i)).toBeVisible();
		await expect(page.getByLabel(/Email/i)).toBeVisible();
	});

	test('should have link to login', async ({ page }) => {
		await expect(page.getByRole('link', { name: /Ingresá/i })).toBeVisible();
	});

	test('should have terms checkbox checked by default', async ({ page }) => {
		const termsCheckbox = page.getByRole('checkbox');
		await expect(termsCheckbox).toBeVisible();
		await expect(termsCheckbox).toBeChecked();
	});

	test('should have links to terms and privacy', async ({ page }) => {
		await expect(page.getByRole('link', { name: /Términos/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Privacidad/i })).toBeVisible();
	});

	test('should navigate to login page', async ({ page }) => {
		await page.getByRole('link', { name: /Ingresá/i }).click();
		await expect(page).toHaveURL(/\/auth\/login/);
	});
});

test.describe('Forgot Password Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/auth/forgot-password');
	});

	test('should load forgot password page', async ({ page }) => {
		await expect(page).toHaveTitle(/Recuperar contraseña - Mi Barrio/);

		// Check form elements
		await expect(page.getByLabel(/Email/i)).toBeVisible();
	});

	test('should have link back to login', async ({ page }) => {
		await expect(page.getByRole('link', { name: /Volver/i })).toBeVisible();
	});
});
