import { expect, test } from '@playwright/test';

// Versión de lectura estática (Parte 17.10): se abre sin JavaScript y conserva las 15 historias.
test.describe('lectura estática sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [file, lang, prologue] of [
    ['lectura-es.html', 'es', 'Prólogo: Silencio'],
    ['lectura-en.html', 'en', 'Prologue: Silence'],
  ] as const) {
    test(file, async ({ page }) => {
      await page.goto(`/${file}`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.getByRole('heading', { name: prologue })).toBeVisible();
      await expect(page.locator('[data-chapter]')).toHaveCount(15);
      await expect(page.locator('script')).toHaveCount(0);
      await expect(page.locator('button')).toHaveCount(0);
    });
  }

  test('el aviso noscript enlaza la versión estática', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'versión de lectura estática' }).click();
    await expect(page.getByRole('heading', { name: 'Prólogo: Silencio' })).toBeVisible();
  });
});

test('la ruta /lectura sigue siendo la app, no la página estática', async ({ page }) => {
  await page.goto('/lectura?lang=en');
  await expect(page.locator('#root header.site-chrome')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Reading mode' })).toBeVisible();
});
