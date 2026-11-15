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
