import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
});

test('el Modo Demo dura 30 s y muestra subtítulos en inglés', async ({ page }) => {
  // La demo dura 30 s; con el 3D por software y varios procesos, el arranque puede tardar.
  test.setTimeout(120_000);
  // Modo ligero: la demo avanza con el reloj real y no debe depender de la velocidad del 3D por software.
  await page.goto('/?demo=1&lang=en&lite=1');
  const demo = page.locator('[data-demo-state]');
  await expect(demo).toHaveAttribute('data-demo-state', 'running');
  const subtitle = page.getByTestId('demo-subtitle');
  await expect(subtitle).toHaveAttribute('lang', 'en');
  await expect(subtitle).not.toBeEmpty();
  // El contenido de la página queda oculto mientras dura la demo.
  await expect(page.locator('main')).toBeHidden();
  await expect(page.locator('[data-demo-step]')).toHaveAttribute('data-demo-step', /^[1-5]$/);
  await expect(page.locator('[data-demo-state="done"]')).toBeVisible({ timeout: 40_000 });
  await page.getByRole('button', { name: 'Start the journey' }).click();
  await expect(demo).toHaveCount(0);
  await expect(page.locator('main')).toBeVisible();
});

test('Esc sale de la demo y el botón de la portada la inicia', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?lang=en');
  await page.getByRole('button', { name: 'Watch the 30-second demo' }).click();
  await expect(page.locator('[data-demo-state="running"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-demo-state]')).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
});
