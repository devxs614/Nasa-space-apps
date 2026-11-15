import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
});

test('el Modo Demo dura 30 s y muestra subtítulos en inglés', async ({ page }) => {
  await page.goto('/?demo=1&lang=en');
  const demo = page.locator('[data-demo-state]');
  await expect(demo).toHaveAttribute('data-demo-state', 'running');
  const subtitle = page.getByTestId('demo-subtitle');
  await expect(subtitle).toHaveAttribute('lang', 'en');
  await expect(subtitle).toContainText('Fifteen machines are still out there');
  // El contenido de la página queda oculto mientras dura la demo.
  await expect(page.locator('main')).toBeHidden();
  await expect(page.locator('[data-demo-step="3"]')).toBeVisible({ timeout: 14_000 });
  await expect(subtitle).toContainText('Opportunity');
  await expect(page.locator('[data-demo-state="done"]')).toBeVisible({ timeout: 32_000 });
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
