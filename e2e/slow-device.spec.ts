import { expect, test } from '@playwright/test';

/**
 * Equipos lentos (Parte 5.8: Android de gama media). Con `React.lazy`, La Travesía se montaba en un
 * render de baja prioridad que el reloj de la barra superior reiniciaba cada segundo: con la CPU
 * frenada no llegaba a aparecer nunca. Ver src/lib/loadable.tsx.
 */
test('con la CPU seis veces más lenta, La Travesía, el 3D y las mini-experiencias llegan a montarse', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'la CPU se frena con el protocolo de Chromium');
  test.setTimeout(240_000);
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });

  await page.goto('/?lang=es');
  // Antes de la corrección este capítulo no aparecía ni en dos minutos.
  await expect(page.locator('#ch-surveyor')).toBeAttached({ timeout: 90_000 });
  await expect(page.locator('#ch-pioneer')).toBeAttached();
  await expect(page.locator('canvas')).toBeAttached({ timeout: 60_000 });
  // Ningún póster "Preparando…" pendiente: las 15 mini-experiencias están montadas.
  await expect(page.locator('#contenido [role="status"]')).toHaveCount(0, { timeout: 90_000 });
});

test('con la CPU frenada, ir a La Travesía desde otra página también la monta', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'la CPU se frena con el protocolo de Chromium');
  test.setTimeout(240_000);
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
  await page.goto('/fuentes?lang=es');
  await expect(page.locator('h1')).toBeVisible();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.getByRole('link', { name: /Ir a La Travesía/ }).click();
  await expect(page.locator('#ch-surveyor')).toBeAttached({ timeout: 90_000 });
});
