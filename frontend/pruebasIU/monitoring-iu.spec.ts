import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

test('CPIU-MON-001 - el dashboard de reportes muestra los cinco parámetros de calidad del agua', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  await page.getByRole('textbox').first().fill('msantiagocarabali@estudiante.uniajc.edu.co');
  await page.locator('input[type="password"]').fill('Acarabali2026');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  await page.waitForURL(/\/inicio$/);
  await page.goto(`${BASE_URL}/reportes`);


  await expect(
    page.getByText(/Historial de Calidad del Agua \(Gráfico IRCA\)/i)
  ).toBeVisible({ timeout: 10000 });

  await expect(page.getByText(/no hay registros para mostrar/i)).not.toBeVisible();

  await expect(page.getByRole('heading', { name: /^ph$|^pH$/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /temperatura/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /conductividad/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /turbidez/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /oxígeno disuelto|oxigeno disuelto/i })).toBeVisible();
});