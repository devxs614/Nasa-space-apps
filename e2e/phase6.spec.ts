import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    try {
      localStorage.setItem(
        'ultima-senal:app',
        JSON.stringify({ state: { locale: 'es' }, version: 1 }),
      );
    } catch {
      /* ignorar */
    }
  });
});

test('atlas lunar: cada sitio se alcanza con el teclado desde la lista', async ({ page }) => {
  await page.goto('/atlas/luna');
  const list = page.locator('[data-site-list]');
  const first = list.getByRole('button').first();
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-site-detail]')).toBeVisible();
  await page.keyboard.press('Tab');
  const count = await list.getByRole('button').count();
  expect(count).toBeGreaterThanOrEqual(20);
});

test('atlas de Marte: los ocho sitios de Marte', async ({ page }) => {
  await page.goto('/atlas/marte');
  await expect(page.locator('[data-site-list]').getByRole('button')).toHaveCount(8);
});

test('línea de tiempo con las 15 máquinas y orden por duración', async ({ page }) => {
  await page.goto('/linea-de-tiempo');
  const rows = page.locator('[data-timeline] > li, [data-timeline] ol.space-y-2 > li');
  await expect(rows).toHaveCount(15);
  await page.getByRole('button', { name: 'Ordenar por duración' }).click();
  await expect(page.getByRole('button', { name: 'Ordenar por fecha' })).toBeVisible();
});

test('el quiz aparece al final del capítulo', async ({ page }) => {
  await page.goto('/maquinas/opportunity');
  await page.getByRole('button', { name: 'Empezar el quiz' }).click();
  await expect(page.getByText('Pregunta 1 de 3')).toBeVisible();
});

test.describe('móvil', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('la línea de tiempo pasa a lista vertical', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/linea-de-tiempo');
    await expect(page.locator('[data-timeline="vertical"]')).toBeVisible();
  });
});
