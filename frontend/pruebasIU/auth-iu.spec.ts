import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Pruebas IU - Autenticación y acceso', () => {
  
  test('CPIU-AUT-001 - el formulario de registro muestra todos los campos requeridos', async ({ page }) => {
  await page.goto(`${BASE_URL}/registro`);
  
  await expect(page.getByRole('textbox', { name: 'Ingresa tu nombre' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Ingresa tu correo' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Mínimo 8 caracteres' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Repite tu contraseña' })).toBeVisible();
  await expect(page.getByRole('button', { name: /registrarse/i })).toBeVisible();
});

  test('CPIU-AUT-002A - muestra mensaje cuando el email es inválido', async ({ page }) => {
  await page.goto(`${BASE_URL}/registro`);

  await page.getByRole('textbox', { name: 'Ingresa tu nombre' }).fill('Marvin Santiago');
  await page.getByRole('textbox', { name: 'Ingresa tu correo' }).fill('marago@gmailcom');
  await page.getByRole('textbox', { name: 'Mínimo 8 caracteres' }).fill('Clave123*');
  await page.getByRole('textbox', { name: 'Repite tu contraseña' }).fill('Clave123*');

  await page.getByRole('button', { name: /registrarse/i }).click();

  await expect(page.getByText('Correo electrónico no válido')).toBeVisible();
});

  test('CPIU-AUT-002B - muestra mensaje cuando el email ya está en uso', async ({ page }) => {
  await page.route('**/usuarios/registro', async route => {
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'El correo ya está registrado',
      }),
    });
  });

  await page.goto(`${BASE_URL}/registro`);

  await page.getByRole('textbox', { name: 'Ingresa tu nombre' }).fill('Juan Pablo');
  await page.getByRole('textbox', { name: 'Ingresa tu correo' }).fill('Juanp@estudiante.uniajc.edu.co');
  await page.getByRole('textbox', { name: 'Mínimo 8 caracteres' }).fill('Clave123*');
  await page.getByRole('textbox', { name: 'Repite tu contraseña' }).fill('Clave123*');

  await page.getByRole('button', { name: /registrarse/i }).click();

  await expect(page.getByText('El correo ya está registrado')).toBeVisible();
});

  test('CPIU-AUT-002C - muestra mensaje cuando las contraseñas no coinciden', async ({ page }) => {
  await page.goto(`${BASE_URL}/registro`);

  await page.getByRole('textbox', { name: 'Ingresa tu nombre' }).fill('Juan Pablo');
  await page.getByRole('textbox', { name: 'Ingresa tu correo' }).fill('juanpablo@gmail.com');
  await page.getByRole('textbox', { name: 'Mínimo 8 caracteres' }).fill('Clave123*');
  await page.getByRole('textbox', { name: 'Repite tu contraseña' }).fill('Clave456*');

  await page.getByRole('button', { name: /registrarse/i }).click();

  await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();
});

  test('CPIU-AUT-003 - redirige visualmente al login tras registro exitoso', async ({ page }) => {
    await page.route('**/usuarios/registro', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 999,
          nombre: 'Andres Felipe',
          correo: 'Andre@gmail.com'
        })
      });
    });

    await page.goto(`${BASE_URL}/registro`);

    await page.getByPlaceholder('Ingresa tu nombre').fill('Andres Felipe');
    await page.getByPlaceholder('Ingresa tu correo').fill('andresfelipe@gmail.com');
    await page.getByPlaceholder('Mínimo 8 caracteres').fill('Clave127*');
    await page.getByPlaceholder('Repite tu contraseña').fill('Clave127*');

    await page.getByRole('button', { name: /registrarse/i }).click();

    await expect(page.getByText(/cuenta creada con éxito/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/, { timeout: 7000 });
});

  test('CPIU-AUT-004 - el formulario de login muestra campos y acción principal', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await expect(page.getByRole('textbox').first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
});

  test('CPIU-AUT-005 - el enlace de recuperar contraseña navega a la vista correcta', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.getByRole('link', { name: /¿olvidaste tu contraseña\?/i }).click();
    await expect(page).toHaveURL(/\/recuperar-password$/);
  });
});