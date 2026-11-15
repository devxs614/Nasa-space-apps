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
  await ix.getByText('Apollo 12 · Intrepid').click();
  await ix.getByRole('button', { name: 'Despegar' }).click();
  await expect(ix.getByRole('status')).toContainText('Visitaste varios sitios');
});

test('Acto II · Viking: muestra, pruebas y votación', async ({ page }) => {
  await page.goto('/maquinas/viking');
  const ix = page.locator('[data-interaction]');
  await ix.getByRole('button', { name: 'Recoger muestra' }).click();
  for (const name of [
    'Dar alimento y medir gases',
    'Calentar y medir',
    'Buscar moléculas orgánicas',
  ]) {
    await ix.getByRole('button', { name }).click();
  }
  await ix.getByRole('button', { name: 'Química' }).click();
  await expect(ix.getByRole('status')).toContainText('Votaste');
});

test('Acto III · NEAR: aterrizar en modo sin presión', async ({ page }) => {
  await page.goto('/maquinas/near');
  const ix = page.locator('[data-interaction]');
  await ix.getByRole('switch', { name: 'Modo sin presión' }).click();
  await ix.getByRole('button', { name: 'Empezar el descenso' }).click();
  await expect(ix.getByRole('status')).toContainText('7 km/h o menos', { timeout: 30_000 });
});

test('Acto IV · Pioneer: abrir las cuatro zonas', async ({ page }) => {
  await page.goto('/maquinas/pioneer');
  const ix = page.locator('[data-interaction]');
  for (const name of ['Las dos personas', 'El sistema solar', 'El mapa de púlsares', 'La escala']) {
    await ix.getByRole('button', { name }).click();
  }
  await expect(ix.getByRole('status')).toContainText('Exploraste la placa');
});

test('Saltar revela la tercera tarjeta', async ({ page }) => {
  await page.goto('/maquinas/kepler');
  await page.getByRole('button', { name: 'Saltar interacción' }).click();
  await expect(page.getByRole('button', { name: 'Revelar ahora' })).toHaveCount(0);
});
