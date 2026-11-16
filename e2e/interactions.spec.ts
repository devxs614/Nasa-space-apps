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

test('Acto I · Apollo: visitar dos sitios y despegar', async ({ page }) => {
  await page.goto('/maquinas/apollo-lm');
  const ix = page.locator('[data-interaction]');
  await ix.getByRole('button', { name: 'Empezar' }).click();
  await ix.getByText('Apollo 12 · Intrepid').click();
  await ix.getByRole('button', { name: 'Despegar' }).click();
  await expect(ix.locator('[data-result="success"]')).toContainText('Visitaste varios sitios');
});

test('Acto II · Viking: muestra, pruebas y votación', async ({ page }) => {
  await page.goto('/maquinas/viking');
  const ix = page.locator('[data-interaction]');
  await ix.getByRole('button', { name: 'Empezar' }).click();
  await ix.getByRole('button', { name: 'Recoger muestra' }).click();
  for (const name of [
    'Dar alimento y medir gases',
    'Calentar y medir',
    'Buscar moléculas orgánicas',
  ]) {
    await ix.getByRole('button', { name }).click();
  }
  await ix.getByRole('button', { name: 'Química' }).click();
  await expect(ix.locator('[data-result="success"]')).toContainText('Votaste');
});

test('Acto III · NEAR: sin tocar nada falla una sola vez y se puede reintentar sin scroll', async ({
  page,
}) => {
  await page.goto('/maquinas/near?debug=1&lite=1');
  const ix = page.locator('[data-interaction]');
  await expect(ix.locator('[data-goal]')).toContainText('Toca Eros a 7 km/h o menos');
  await ix.getByRole('button', { name: 'Empezar' }).click();
  await expect(ix.locator('[data-step]')).toContainText('Paso 1 de 2');
  // Dejarse caer sin frenar: fallo con la velocidad real del contacto, en menos de 30 s.
  await expect(ix.locator('[data-result="fail"]')).toContainText('demasiado rápido', {
    timeout: 30_000,
  });
  await expect(ix.locator('[data-result="fail"]')).toContainText(/Tocaste a \d+,\d km\/h/);
  await expect
    .poll(() => page.evaluate<number>('window.__audioDebug?.activeLoops() ?? -1'), {
      timeout: 2000,
    })
    .toBe(0);
  await ix.getByRole('button', { name: 'Intentar de nuevo' }).click();
  // Reintentar no exige hacer scroll: la tarjeta inicial y su botón quedan a la vista.
  await expect(ix.getByText('Cómo se juega')).toBeVisible();
  await expect(ix.getByRole('button', { name: 'Empezar' })).toBeInViewport();
});

test('Acto III · NEAR: se gana solo con teclado, con toques de la barra espaciadora', async ({
  page,
}) => {
  // Con movimiento reducido (como en estas pruebas) un toque enciende los propulsores y otro los apaga.
  await page.goto('/maquinas/near?debug=1&lite=1');
  const ix = page.locator('[data-interaction]');
  await ix.getByRole('button', { name: 'Empezar' }).click();
  const thrust = ix.locator('[data-near-thrust]');
  await expect(thrust).toHaveAccessibleName('Encender propulsores');
  await thrust.focus();
  // Enciende por encima de 5 km/h y apaga por debajo de 3. El margen hasta los 7 km/h aguanta casi
  // dos segundos de retraso, para que la prueba no dependa de lo cargada que esté la máquina.
  const read = `(() => {
    const ix = document.querySelector('[data-interaction]');
    return {
      done: Boolean(ix.querySelector('[data-result]')),
      v: Number(ix.querySelector('[data-near-speed]')?.getAttribute('data-near-speed')),
      firing: ix.querySelector('[data-near-thrust]')?.getAttribute('data-state') === 'tapOff',
    };
  })()`;
  for (let i = 0; i < 1500; i++) {
    const s = await page.evaluate<{ done: boolean; v: number; firing: boolean }>(read);
    if (s.done) break;
    if ((s.v > 5 && !s.firing) || (s.v < 3 && s.firing)) await page.keyboard.press('Space');
    await page.waitForTimeout(30);
  }
  await expect(ix.locator('[data-result="success"]')).toContainText('NEAR lo hizo a unos 6,4 km/h');
  await expect
    .poll(() => page.evaluate<number>('window.__audioDebug?.activeLoops() ?? -1'), {
      timeout: 2000,
    })
    .toBe(0);
  // Tres intentos seguidos sin recargar ni hacer scroll.
  await ix.getByRole('button', { name: 'Jugar de nuevo' }).click();
  await expect(ix.getByText('Cómo se juega')).toBeVisible();
  await ix.getByRole('button', { name: 'Empezar' }).click();
  await ix.getByRole('button', { name: 'Reiniciar' }).click();
  await expect(ix.getByText('Cómo se juega')).toBeVisible();
});

test('Acto IV · Pioneer: abrir las cuatro zonas', async ({ page }) => {
  await page.goto('/maquinas/pioneer');
  const ix = page.locator('[data-interaction]');
  await ix.getByRole('button', { name: 'Empezar' }).click();
  for (const name of ['Las dos personas', 'El sistema solar', 'El mapa de púlsares', 'La escala']) {
    await ix.getByRole('button', { name }).click();
  }
  await expect(ix.locator('[data-result="success"]')).toContainText('Exploraste la placa');
});

test('Saltar revela la tercera tarjeta', async ({ page }) => {
  await page.goto('/maquinas/kepler');
  await page.getByRole('button', { name: 'Saltar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Revelar ahora' })).toHaveCount(0);
});
