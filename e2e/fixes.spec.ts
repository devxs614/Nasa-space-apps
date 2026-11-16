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
  await ix.getByRole('button', { name: 'Start', exact: true }).click();
  await ix.getByRole('button', { name: 'Turn on ion engine' }).click();
  // El texto dice lo que hará el siguiente toque y se sigue leyendo sobre el fondo cian.
  const off = ix.getByRole('button', { name: 'Turn off ion engine' });
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

test('F · en Ajustes, la rueda desplaza el panel y no la página de detrás', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'la rueda del ratón es de escritorio');
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1366, height: 520 });
  await page.goto('/?lang=en'); // sin movimiento reducido: el scroll inercial está activo
  await expect(page.locator('#ch-surveyor')).toBeAttached({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Settings' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Settings' });
  await dialog.getByRole('tab', { name: 'Sound' }).click();
  const body = dialog.locator('[data-dialog-body]');
  const box = await body.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  const scrollTop = () =>
    page.evaluate<number>(`document.querySelector('[data-dialog-body]').scrollTop`);
  expect(await scrollTop()).toBe(0);
  await page.mouse.wheel(0, 600);
  await expect.poll(scrollTop).toBeGreaterThan(50);
  await page.waitForTimeout(600);
  expect(await page.evaluate<number>('window.scrollY')).toBeLessThan(2);
});

test('E · el riel marca el capítulo que está en pantalla aunque la página crezca después', async ({
  page,
}, info) => {
  test.skip(
    info.project.name === 'webkit',
    'el WebKit de pruebas tarda minutos en montar La Travesía',
  );
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?lang=en');
  await expect(page.locator('#ch-pioneer')).toBeAttached({ timeout: 60_000 });
  await expect(page.locator('#contenido [role="status"]')).toHaveCount(0, { timeout: 90_000 });
  // Algo llega tarde y alarga la página por encima de todos los capítulos (una foto, una actividad…).
  await page.evaluate(`(() => {
    const first = document.querySelector('[data-chapter="surveyor"]');
    const late = document.createElement('div');
    late.style.height = '1800px';
    first.parentElement.insertBefore(late, first);
  })()`);
  await page.waitForTimeout(700);
  for (const id of ['kepler', 'pioneer', 'opportunity', 'kepler']) {
    await page.evaluate(
      `document.querySelector('[data-chapter="${id}"] [data-beat="work"]').scrollIntoView({ block: 'center' })`,
    );
    await expect(page.locator(`a[href="#${id}"][aria-current="step"]`), id).toHaveCount(1);
  }
});

test('J · el visor del catálogo encuadra entera cada máquina, también Kepler', async ({
  page,
}, info) => {
  test.skip(
    info.project.name === 'webkit',
    'el 3D por software del WebKit de pruebas es muy lento',
  );
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/maquinas?lang=en&debug=1');
  for (const name of ['Kepler space telescope', 'Viking 1 and Viking 2', 'Dawn']) {
    const card = page.locator('li', { has: page.getByRole('heading', { name, exact: true }) });
    await card.getByRole('button', { name: /View in 3D/ }).click();
    await expect(
      page.getByRole('dialog', { name: new RegExp(`3D viewer: ${name}`) }),
    ).toBeVisible();
    // 1 = la máquina toca el borde de la pantalla; con margen, se queda por debajo.
    await expect
      .poll(() => page.evaluate<number>('window.__viewerDebug ? window.__viewerDebug.fit() : 99'), {
        timeout: 30_000,
        message: name,
      })
      .toBeLessThanOrEqual(0.92);
    await page.getByRole('button', { name: 'Close viewer' }).click();
  }
});
