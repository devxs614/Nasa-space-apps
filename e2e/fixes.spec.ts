import { expect, test } from '@playwright/test';

// Correcciones v1.1: fallos vistos al recorrer la web en inglés.

test.beforeEach(async ({ page }) => {
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
});

/** Contraste WCAG entre el color del texto y el del fondo del primer elemento que casa con `selector`. */
const contrastOf = (selector: string) => `(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) return -1;
  const cs = getComputedStyle(el);
  const lum = (css) => {
    const [r, g, b] = css.match(/[\\d.]+/g).slice(0, 3).map((n) => {
      const c = Number(n) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = lum(cs.color);
  const b = lum(cs.backgroundColor);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
})()`;

test('D · el botón cian del motor iónico conserva su texto al pulsarlo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/maquinas/dawn?lang=en');
  const ix = page.locator('[data-interaction]');
  await ix.getByRole('button', { name: 'Turn on the ion engine' }).click();
  // El texto dice lo que hará el siguiente toque y se sigue leyendo sobre el fondo cian.
  const off = ix.getByRole('button', { name: 'Turn off the ion engine' });
  await expect(off).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(300); // transición de color
  const ratio = await page.evaluate<number>(
    contrastOf('[data-interaction] .btn-primary[aria-pressed="true"]'),
  );
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});

test('D · ningún botón cian de las actividades se queda sin texto legible', async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const id of ['near', 'dawn', 'ingenuity', 'kepler', 'alsep', 'surveyor']) {
    await page.goto(`/maquinas/${id}?lang=en`);
    await expect(page.locator('[data-interaction]')).toBeVisible({ timeout: 30_000 });
    const result = await page.evaluate<{ empty: number; low: number }>(`(() => {
      const lum = (css) => {
        const [r, g, b] = css.match(/[\\d.]+/g).slice(0, 3).map((n) => {
          const c = Number(n) / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      let empty = 0;
      let low = 0;
      for (const el of document.querySelectorAll('[data-interaction] .btn-primary')) {
        if (!el.textContent.trim()) empty += 1;
        const cs = getComputedStyle(el);
        const a = lum(cs.color);
        const b = lum(cs.backgroundColor);
        if ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) < 4.5) low += 1;
      }
      return { empty, low };
    })()`);
    expect(result, id).toEqual({ empty: 0, low: 0 });
  }
});
