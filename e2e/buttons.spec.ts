import { expect, test, type Page } from '@playwright/test';

const MACHINES = [
  'surveyor',
  'apollo-lm',
  'alsep',
  'lrv',
  'viking',
  'sojourner',
  'spirit',
  'opportunity',
  'phoenix',
  'insight',
  'ingenuity',
  'near',
  'dawn',
  'kepler',
  'pioneer',
];

/** Botones principales visibles sin texto, o con contraste entre texto y fondo menor de 4,5:1. */
const AUDIT = `(() => {
  const rgb = (c) => (c.match(/[\\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const c = rgb(getComputedStyle(e).backgroundColor);
      if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c;
    }
    return [5, 6, 10];
  };
  const bad = [];
  for (const b of document.querySelectorAll('[data-variant="primary"], .btn-primary')) {
    const r = b.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || getComputedStyle(b).visibility === 'hidden') continue;
    const text = (b.innerText || '').trim();
    const a = lum(rgb(getComputedStyle(b).color));
    const c = lum(bgOf(b));
    const ratio = (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05);
    if (!text || ratio < 4.5) bad.push((text || '(vacío)') + ' · ' + ratio.toFixed(1) + ':1');
  }
  return bad;
})()`;

async function audit(page: Page, where: string) {
  expect(await page.evaluate<string[]>(AUDIT), where).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('los botones cian tienen texto y contraste en las 15 actividades, antes y después de pulsarlos', async ({
  page,
}) => {
  test.setTimeout(300_000);
  for (const id of MACHINES) {
    await page.goto(`/maquinas/${id}?lang=en&lite=1`);
    const ix = page.locator('[data-interaction]');
    await expect(ix.locator('[data-goal]')).toBeVisible();
    await audit(page, `${id}: antes de empezar`);
    await ix.getByRole('button', { name: 'Start', exact: true }).click();
    await expect(ix.locator('[data-stage]')).toBeVisible();
    await page.waitForTimeout(300);
    await audit(page, `${id}: al empezar`);
    // Pulsa cada botón principal de la actividad y vuelve a mirar: ninguno se queda sin texto.
    const primaries = ix.locator(
      '[data-stage] [data-variant="primary"], [data-stage] .btn-primary',
    );
    const n = await primaries.count();
    for (let i = 0; i < n; i++) {
      const b = primaries.nth(i);
      if (!(await b.isVisible().catch(() => false)) || (await b.isDisabled().catch(() => true))) {
        continue;
      }
      await b.click({ timeout: 2000 }).catch(() => undefined);
      await page.waitForTimeout(200);
      await audit(page, `${id}: tras pulsar el botón ${i + 1}`);
    }
  }
});

test('los botones cian de las rutas principales tienen texto y contraste', async ({ page }) => {
  test.setTimeout(120_000);
  for (const route of ['/', '/maquinas', '/pasaporte', '/linea-de-tiempo', '/fuentes', '/acerca']) {
    await page.goto(`${route}?lang=en&lite=1`);
    await expect(page.locator('main h1').first()).toBeVisible();
    await audit(page, route);
  }
});
