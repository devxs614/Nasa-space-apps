import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('la portada carga con el título', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ÚLTIMA SEÑAL|LAST SIGNAL/);
  await expect(page.locator('main')).toBeVisible();
});

test('la señal llega y muestra la respuesta archivada', async ({ page }) => {
  await page.goto('/maquinas/surveyor');
  const btn = page.getByRole('button', {
    name: /Enviar señal a Surveyor|Send a signal to Surveyor/,
  });
  await btn.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('archived-reply')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/Respuesta archivada|Archived reply/).first()).toBeVisible();
});

test('recibir parche marca el capítulo como completado', async ({ page }) => {
  await page.goto('/maquinas/surveyor');
  await page.getByRole('button', { name: /Recibir parche|Receive patch/ }).click();
  await expect(page.getByText(/Parche conseguido|Patch earned/).first()).toBeVisible();
});

test('/lectura contiene los 15 capítulos', async ({ page }) => {
  await page.goto('/lectura');
  await expect(page.locator('[data-chapter]')).toHaveCount(15);
});

test('recargar una ruta profunda no da 404', async ({ page }) => {
  await page.goto('/maquinas/opportunity');
  await expect(page.locator('h1')).toContainText('Opportunity');
});
