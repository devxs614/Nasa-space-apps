import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/lectura',
  '/maquinas',
  '/maquinas/opportunity',
  '/pasaporte',
  '/fuentes',
  '/acerca',
  '/atlas/luna',
  '/atlas/marte',
  '/linea-de-tiempo',
];

for (const route of routes) {
  test(`axe ${route}`, async ({ page }) => {
    // La Travesía tiene los 15 capítulos en el DOM: axe tarda más de un minuto con el 3D por software.
    if (route === '/') test.setTimeout(360_000);
    await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    // Se audita la página, no el aviso "Sintonizando…" que se ve mientras llega su fragmento.
    await expect(page.locator('#contenido > [role="status"]')).toHaveCount(0, { timeout: 30_000 });
    if (route === '/') await expect(page.locator('#ch-pioneer')).toBeAttached();
    await page.waitForTimeout(800);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(
      serious.map(
        (v) =>
          `${v.id}: ${v.nodes
            .map((n) => n.target.join(' '))
            .slice(0, 3)
            .join(' | ')}`,
      ),
    ).toEqual([]);
  });
}
