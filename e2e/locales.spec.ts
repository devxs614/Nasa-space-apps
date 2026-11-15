import { expect, test, type Page } from '@playwright/test';

// Cada idioma va en su propio fragmento (Parte 17.7): solo el activo bloquea el primer pintado.
const EN_CHUNK = /\/assets\/en-[\w-]+\.js$/;

async function withStoredLocale(page: Page, locale: 'es' | 'en') {
  await page.addInitScript((l) => {
    try {
      localStorage.setItem(
        'ultima-senal:app',
        JSON.stringify({ state: { locale: l }, version: 1 }),
      );
    } catch {
      /* ignorar */
    }
  }, locale);
}

test.beforeEach(async ({ page }) => {
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('la página se pinta con el idioma guardado sin esperar al otro idioma', async ({ page }) => {
  await withStoredLocale(page, 'es');
  const order: string[] = [];
  page.on('request', (r) => {
    const m = /\/assets\/(es|en)-[\w-]+\.js$/.exec(r.url());
    if (m?.[1]) order.push(m[1]);
  });
  // El inglés queda retenido: si la página lo necesitara para pintar, no llegaría a mostrarse.
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(EN_CHUNK, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/lectura');
  await expect(page.getByRole('heading', { level: 1, name: 'Modo lectura' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  expect(order[0]).toBe('es');
  // index.html precarga en paralelo el idioma y la página de esta ruta.
  await expect(page.locator('link[rel="modulepreload"][href*="/assets/es-"]')).toHaveCount(1);
  await expect(
    page.locator('link[rel="modulepreload"][href*="/assets/ReadingModePage-"]'),
  ).not.toHaveCount(0);

  release();
  await page.getByRole('button', { name: /Cambiar a inglés/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Reading mode' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle(/LAST SIGNAL/);
});

test('?lang manda sobre el idioma guardado desde el primer pintado', async ({ page }) => {
  await withStoredLocale(page, 'es');
  await page.goto('/acerca?lang=en');
  await expect(page.getByRole('heading', { level: 1, name: 'About' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'Acerca de' })).toHaveCount(0);
});

test('sin red, el cambio de idioma funciona porque el otro ya se precargó', async ({
  page,
  context,
}) => {
  await withStoredLocale(page, 'es');
  const english = page.waitForResponse(EN_CHUNK);
  await page.goto('/fuentes');
  await expect(page.getByRole('heading', { level: 1, name: 'Fuentes' })).toBeVisible();
  await english;
  await context.setOffline(true);
  await page.getByRole('button', { name: /Cambiar a inglés/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Sources' })).toBeVisible();
  await context.setOffline(false);
});

test('si el otro idioma no se puede descargar, la web sigue en el actual sin romperse', async ({
  page,
}) => {
  await withStoredLocale(page, 'es');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route(EN_CHUNK, (route) => route.abort());
  await page.goto('/fuentes');
  await expect(page.getByRole('heading', { level: 1, name: 'Fuentes' })).toBeVisible();
  await page.getByRole('button', { name: /Cambiar a inglés/ }).click();
  await page.waitForTimeout(600);
  await expect(page.getByRole('heading', { level: 1, name: 'Fuentes' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  expect(errors).toEqual([]);
});

test('la portada precarga La Travesía y un capítulo suelto, su página', async ({ page }) => {
  await page.goto('/?lang=en&lite=1');
  await expect(page.locator('link[rel="modulepreload"][href*="/assets/JourneyPage-"]')).toHaveCount(
    1,
  );
  await expect(page.getByRole('heading', { level: 1, name: 'LAST SIGNAL' })).toBeVisible();
  await page.goto('/maquinas/opportunity?lang=en&lite=1');
  await expect(page.locator('link[rel="modulepreload"][href*="/assets/ChapterPage-"]')).toHaveCount(
    1,
  );
  await expect(page.locator('h1')).toContainText('Opportunity');
});
