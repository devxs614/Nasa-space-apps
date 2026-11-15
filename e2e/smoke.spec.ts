import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('la portada carga con el título', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ÚLTIMA SEÑAL|LAST SIGNAL/);
  await expect(page.locator('main')).toBeVisible();
});

// Con ?lite=1: con varias páginas dibujando 3D por software (SwiftShader) a la vez, el hilo principal se
// retrasa y la prueba mediría la CPU de la máquina, no la lógica de la señal (Parte 19.6).
test('la señal llega y muestra la respuesta archivada', async ({ page }) => {
  await page.goto('/maquinas/surveyor?lite=1');
  const btn = page.getByRole('button', {
    name: /Enviar señal a Surveyor|Send a signal to Surveyor/,
  });
  await btn.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('archived-reply')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/Respuesta archivada|Archived reply/).first()).toBeVisible();
});

test('recibir parche marca el capítulo como completado y aparece en el pasaporte', async ({
  page,
}) => {
  await page.goto('/maquinas/surveyor?lang=es');
  await page.getByRole('button', { name: /Recibir parche|Receive patch/ }).click();
  await expect(page.getByText(/Parche conseguido|Patch earned/).first()).toBeVisible();
  await page.goto('/pasaporte?lang=es');
  const surveyor = page.locator('[data-patch="surveyor"]');
  await expect(surveyor).toHaveAttribute('data-state', 'earned');
  await expect(surveyor).toContainText('Conseguido');
});

test('la tecla M abre el índice, Esc lo cierra y elegir Opportunity lleva a su capítulo', async ({
  page,
}) => {
  await page.goto('/?lang=es');
  await expect(page.locator('main')).toBeVisible();
  // La Travesía llega en su propio fragmento: los atajos se prueban con ella ya montada.
  await expect(page.locator('#ch-surveyor')).toBeAttached();
  const dialog = page.getByRole('dialog', { name: 'Índice de capítulos' });
  await page.keyboard.press('m');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  // M justo después de Esc: el evento `close` atrasado del <dialog> no debe cerrar el índice nuevo.
  await page.keyboard.press('m');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /Opportunity/ }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#opportunity$/);
  await expect(page.locator('#ch-opportunity')).toBeInViewport({ timeout: 15_000 });
});

test('cambiar a inglés pone lang="en" y traduce la barra superior', async ({ page }) => {
  await page.goto('/?lang=es');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.getByRole('button', { name: /Cambiar a inglés/ }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('button', { name: /Switch to Spanish/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Settings/ }).first()).toBeVisible();
});

test('/lectura contiene los 15 capítulos', async ({ page }) => {
  await page.goto('/lectura');
  await expect(page.locator('[data-chapter]')).toHaveCount(15);
});

test('recargar una ruta profunda no da 404', async ({ page }) => {
  await page.goto('/maquinas/opportunity');
  await expect(page.locator('h1')).toContainText('Opportunity');
});
