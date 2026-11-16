import { expect, test, type Page } from '@playwright/test';

/*
 * Pruebas "siguiendo las instrucciones" (correcciones G, H e I): solo usan lo que la actividad dice
 * en pantalla para decidir qué pulsar. Con movimiento reducido, como aquí, los botones de mantener
 * funcionan con un toque para encender y otro para apagar.
 */
const loops = (page: Page) => page.evaluate<number>('window.__audioDebug?.activeLoops() ?? -1');

test.beforeEach(async ({ page }) => {
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('G · Ingenuity: acelerar los rotores, tocar las tres marcas y aterrizar suave', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto('/maquinas/ingenuity?lang=en&lite=1&debug=1');
  const ix = page.locator('[data-interaction]');
  await expect(ix.locator('[data-goal]')).toContainText(
    'Fly Ingenuity to the three markers and land gently.',
  );
  await ix.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(ix.locator('[data-step]')).toContainText('Step 1 of 3 · Spin up the rotors');
  await ix.getByRole('button', { name: 'Spin up rotors' }).click();
  for (const n of [1, 2, 3]) {
    await expect(ix.locator('[data-step]')).toContainText(`Fly to marker ${n} of 3`, {
      timeout: 15_000,
    });
    await ix.getByRole('button', { name: `Fly to marker ${n}`, exact: true }).click();
  }
  await expect(ix.locator('[data-step]')).toContainText('Step 3 of 3 · Land gently');
  await ix.getByRole('button', { name: 'Slow the descent' }).click();
  await expect(ix.locator('[data-result="success"]')).toContainText('made 72', {
    timeout: 40_000,
  });
  await expect.poll(() => loops(page), { timeout: 2000 }).toBe(0);
});

test('G · Ingenuity: si no se frena la bajada, el aterrizaje es brusco y se puede reintentar', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto('/maquinas/ingenuity?lang=en&lite=1&debug=1');
  const ix = page.locator('[data-interaction]');
  await ix.getByRole('button', { name: 'Start', exact: true }).click();
  await ix.getByRole('button', { name: 'Spin up rotors' }).click();
  for (const n of [1, 2, 3]) {
    await ix
      .getByRole('button', { name: `Fly to marker ${n}`, exact: true })
      .click({ timeout: 15_000 });
  }
  await expect(ix.locator('[data-result="fail"]')).toContainText('Hard landing', {
    timeout: 30_000,
  });
  await expect.poll(() => loops(page), { timeout: 2000 }).toBe(0);
  await ix.getByRole('button', { name: 'Try again' }).click();
  await expect(ix.getByText('How to play')).toBeVisible();
});

test('H · Dawn: el cohete químico se agota y el motor iónico llega a Ceres', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/maquinas/dawn?lang=en&lite=1&debug=1');
  const ix = page.locator('[data-interaction]');
  await expect(ix.locator('[data-goal]')).toContainText('Which engine gets there');
  await ix.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(ix.locator('[data-step]')).toContainText('Step 1 of 3 · Try the chemical rocket');
  await ix.getByRole('button', { name: 'Fire chemical rocket' }).click();
  await expect(ix.locator('[data-step]')).toContainText('Step 2 of 3 · Now turn on the ion engine');
  await expect(ix.locator('[data-dawn-chem]')).toHaveAttribute('aria-disabled', 'true');
  await expect(ix.getByText('Chemical rockets burn their fuel in minutes.')).toBeVisible();
  await expect(ix.locator('[data-dawn-note]')).toContainText('Race paused: turn on the ion engine');
  await ix.getByRole('button', { name: 'Turn on ion engine' }).click();
  await expect(ix.locator('[data-step]')).toContainText('Step 3 of 3 · Keep it on');
  await expect(ix.getByRole('button', { name: 'Turn off ion engine' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(ix.locator('[data-dawn-note]')).toContainText('now faster than the chemical', {
    timeout: 20_000,
  });
  await expect(ix.locator('[data-result="success"]')).toContainText('Patience wins', {
    timeout: 30_000,
  });
  await expect.poll(() => loops(page), { timeout: 2000 }).toBe(0);
});

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

test('I · las 15 actividades dan una pista a los 6 s sin acción y "Restart" las deja en silencio', async ({
  page,
}) => {
  test.setTimeout(420_000);
  for (const id of MACHINES) {
    await page.goto(`/maquinas/${id}?lang=en&lite=1&debug=1`);
    const ix = page.locator('[data-interaction]');
    await expect(ix.locator('[data-goal]'), id).toContainText('Goal:');
    await expect(ix.getByText('How to play'), id).toBeVisible();
    await ix.getByRole('button', { name: 'Start', exact: true }).click();
    await expect(ix.locator('[data-step]'), id).not.toBeEmpty();
    await expect(ix.locator('[data-hint]'), id).toContainText('Hint:', { timeout: 15_000 });
    await ix.getByRole('button', { name: 'Restart' }).click();
    await expect(ix.getByText('How to play'), id).toBeVisible();
    await expect.poll(() => loops(page), { timeout: 2000, message: id }).toBe(0);
  }
});
