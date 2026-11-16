// Genera public/last-signal-slides.pdf: las 7 diapositivas de la entrega (Parte 20.7), en inglés.
// Captura pantallas reales de la app compilada, rellena docs/slides/template.html y lo imprime a PDF.
// Uso: npm run build && npx vite preview --port 4173 &  →  npm run slides [http://localhost:4173] [--reuse]
//   --reuse  no vuelve a capturar: usa las imágenes de docs/slides/.cache (para cambiar solo textos o equipo).
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const reuse = args.includes('--reuse');
const base = (args.find((a) => a.startsWith('http')) ?? 'http://localhost:4173').replace(/\/$/, '');
const root = fileURLToPath(new URL('..', import.meta.url));
const dir = join(root, 'docs/slides');
const cache = join(dir, '.cache');
const out = join(root, 'public/last-signal-slides.pdf');
const SLIDES = 7; // límite de Space Apps, contando la portada
await mkdir(cache, { recursive: true });

/** Con GPU el 3D sale en calidad alta; sin ella (CI, contenedores) se usa el dibujo por software. */
async function launch() {
  const gpu = ['--enable-gpu', '--ignore-gpu-blocklist'];
  if (process.platform === 'darwin') gpu.push('--use-angle=metal');
  try {
    return await chromium.launch({ channel: 'chromium', args: gpu });
  } catch {
    return chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  }
}

const HIDE_DOM =
  'main, header, footer, nav, .site-chrome, .overlay-grain, [data-rail] { visibility: hidden !important }';
const WORLDS = {
  moon: 'surveyor',
  mars: 'opportunity',
  'small-bodies': 'dawn',
  'deep-space': 'pioneer',
};
const browser = await launch();

async function capture() {
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1.5,
  });
  const page = await desktop.newPage();
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
  const jpg = (name) => ({ path: join(cache, `${name}.jpg`), type: 'jpeg', quality: 86 });
  const open = async (path, ready) => {
    await page.goto(`${base}${path}`);
    await page.locator(ready).first().waitFor({ state: 'attached', timeout: 60_000 });
  };
  /** Coloca el borde superior de un elemento a `y` píxeles del borde de la ventana. */
  const scrollTop = (locator, y) =>
    locator.evaluate((el, offset) => {
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - offset);
    }, y);

  // 1 · Portada: la Tierra del prólogo, sin texto. La ventana es más ancha que la diapositiva para
  // que, al recortar por la izquierda, la Tierra quede a la derecha del título.
  const wide = await browser.newContext({
    viewport: { width: 1800, height: 720 },
    deviceScaleFactor: 1.2,
  });
  const hero = await wide.newPage();
  await hero.route('https://images-api.nasa.gov/**', (r) => r.abort());
  await hero.goto(`${base}/?lang=en`);
  await hero.locator('#ch-surveyor').waitFor({ state: 'attached', timeout: 60_000 });
  await hero.waitForTimeout(4000);
  await hero.addStyleTag({ content: HIDE_DOM });
  await hero.evaluate(() => window.scrollTo(0, 700));
  await hero.waitForTimeout(3500);
  await hero.screenshot(jpg('cover'));
  await wide.close();

  // 2 · Un mundo por acto, sin texto, y los nombres cortos de la línea de tiempo.
  for (const [world, id] of Object.entries(WORLDS)) {
    await open(`/maquinas/${id}?lang=en`, '[data-chapter]');
    await page.waitForTimeout(4500);
    await page.addStyleTag({ content: HIDE_DOM });
    await page.screenshot(jpg(`act-${world}`));
  }
  await open('/linea-de-tiempo?lang=en', '[data-timeline="horizontal"] li[data-act]');
  const names = await page.evaluate(() =>
    [...document.querySelectorAll('[data-timeline="horizontal"] li[data-act]')].map((li) => ({
      world: li.getAttribute('data-act'),
      name: (li.querySelector('a')?.textContent ?? '').split('·')[0].trim(),
    })),
  );
  if (names.length !== 15)
    throw new Error(`La línea de tiempo muestra ${names.length} máquinas, no 15.`);
  await writeFile(join(cache, 'names.json'), JSON.stringify(names));

  // 6 · Ajustes (antes de desplazar: la barra superior se esconde al bajar) y modo lectura.
  await open('/maquinas/ingenuity?lang=en', '[data-chapter]');
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Settings' }).first().click();
  await page.getByRole('tab', { name: 'Visual' }).click();
  await page.waitForTimeout(600);
  await page.getByRole('dialog').screenshot(jpg('settings'));
  await open('/lectura?lang=en', '#lectura-surveyor');
  await page.waitForTimeout(1200);
  await scrollTop(page.locator('#lectura-surveyor'), -20);
  await page.waitForTimeout(800);
  await page.screenshot(jpg('reading'));

  // 5 · La señal a Opportunity, con el tiempo de luz y la respuesta archivada.
  await open('/maquinas/opportunity?lang=en', '[data-chapter]');
  await page.waitForTimeout(3500);
  const send = page.getByRole('button', { name: /Send a signal to/ });
  await send.focus();
  await page.keyboard.press('Enter');
  await page.getByTestId('archived-reply').waitFor({ timeout: 30_000 });
  await scrollTop(send, 24);
  await page.waitForTimeout(2500);
  await page.screenshot(jpg('signal'));

  // 3 · El momento "Who I am": ficción rotulada y datos verificados junto al 3D.
  await scrollTop(page.getByRole('region', { name: 'Who I am' }).first(), -160);
  await page.waitForTimeout(3000);
  await page.screenshot(jpg('experience'));
  await desktop.close();

  // 4 · Tres mini-experiencias, en ancho de móvil para que el texto se lea en la diapositiva.
  const narrow = await browser.newContext({
    viewport: { width: 560, height: 900 },
    deviceScaleFactor: 2,
  });
  const small = await narrow.newPage();
  await small.route('https://images-api.nasa.gov/**', (r) => r.abort());
  for (const id of ['surveyor', 'sojourner', 'kepler']) {
    await small.goto(`${base}/maquinas/${id}?lang=en`);
    const ix = small.locator('[data-interaction]');
    await ix.waitFor({ timeout: 60_000 });
    await ix.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await ix.getByRole('button', { name: 'Start', exact: true }).click();
    await small.waitForTimeout(3000);
    if (id === 'surveyor') {
      // Con la hipótesis elegida y la nave posada, la tarjeta enseña la mini-experiencia en marcha.
      await ix.getByRole('button', { name: 'Firm ground' }).click();
      await ix.getByRole('button', { name: 'Land' }).click();
      const dig = ix.getByRole('button', { name: 'Dig with the scoop' });
      await dig.waitFor({ timeout: 20_000 });
      await dig.click();
      await small.waitForTimeout(1500);
      // Una segunda zanja si el botón ya está libre; si no, la captura sale con una.
      await dig.click({ timeout: 3000 }).catch(() => undefined);
      await small.waitForTimeout(1200);
      await ix.evaluate((el) => el.scrollIntoView({ block: 'start' }));
    }
    await small.waitForTimeout(500);
    await ix.screenshot(jpg(`ix-${id}`));
  }
  await narrow.close();
}

if (!reuse) await capture();

// ── Datos del texto ──
const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );
const team = JSON.parse(await readFile(join(dir, 'team.json'), 'utf8'));
const names = JSON.parse(await readFile(join(cache, 'names.json'), 'utf8'));
const sources = (await readFile(join(root, 'SOURCES.md'), 'utf8'))
  .split('\n')
  .filter((line) => line.startsWith('| `')).length;
const font = (pkg, file) =>
  pathToFileURL(join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).href;
const tokens = {
  'font.unbounded': font('unbounded', 'unbounded-latin-wght-normal.woff2'),
  'font.atkinson': font(
    'atkinson-hyperlegible-next',
    'atkinson-hyperlegible-next-latin-wght-normal.woff2',
  ),
  'font.mono': font('jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2'),
  'font.fraunces': font('fraunces', 'fraunces-latin-wght-italic.woff2'),
  qr: pathToFileURL(join(dir, 'qr.svg')).href,
  team: esc(team.team),
  members: esc(team.members),
  sources: String(sources),
};
for (const world of Object.keys(WORLDS)) {
  const list = names.filter((n) => n.world === world).map((n) => esc(n.name));
  tokens[`acts.${world}`] = list.join(' · ');
}
for (const img of [
  'cover',
  ...Object.keys(WORLDS).map((w) => `act-${w}`),
  'experience',
  'signal',
  'settings',
  'reading',
  'ix-surveyor',
  'ix-sojourner',
  'ix-kepler',
]) {
  const file = join(cache, `${img}.jpg`);
  await access(file); // falla con un mensaje claro si falta una captura (--reuse sin caché)
  tokens[`img.${img}`] = pathToFileURL(file).href;
}

const template = await readFile(join(dir, 'template.html'), 'utf8');
const html = template.replace(/\{\{([\w.-]+)\}\}/g, (match, key) => {
  if (!(key in tokens))
    throw new Error(`template.html usa ${match} y no hay valor para esa clave.`);
  return tokens[key];
});
const built = join(cache, 'slides.html');
await writeFile(built, html);

// ── PDF ──
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(pathToFileURL(built).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const check = await page.evaluate(async () => {
  const slides = [...document.querySelectorAll('.slide')];
  let qr = null;
  try {
    // Si el navegador sabe leer códigos QR, se comprueba que el de la última diapositiva abre la web.
    const found = await new BarcodeDetector({ formats: ['qr_code'] }).detect(
      document.querySelector('.visit img'),
    );
    qr = found[0]?.rawValue ?? '';
  } catch {
    qr = null;
  }
  return {
    slides: slides.length,
    overflow: slides
      .map((s, i) =>
        s.scrollHeight > s.clientHeight + 1 || s.scrollWidth > s.clientWidth + 1 ? i + 1 : 0,
      )
      .filter(Boolean),
    broken: [...document.images]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.alt),
    fonts: ['Unbounded', 'Atkinson', 'Mono', 'Fraunces'].filter(
      (f) => !document.fonts.check(`16px "${f}"`),
    ),
    qr,
  };
});
if (check.slides !== SLIDES)
  throw new Error(`Hay ${check.slides} diapositivas; el límite es ${SLIDES}.`);
if (check.overflow.length)
  throw new Error(`El contenido se sale en la diapositiva ${check.overflow.join(', ')}.`);
if (check.broken.length) throw new Error(`Imágenes sin cargar: ${check.broken.join(' | ')}`);
if (check.fonts.length) throw new Error(`Fuentes sin cargar: ${check.fonts.join(', ')}`);
if (check.qr !== null && !check.qr.startsWith('https://devxs614.github.io/Nasa-space-apps')) {
  throw new Error(`El código QR apunta a "${check.qr}".`);
}
for (let i = 0; i < SLIDES; i++) {
  await page
    .locator('.slide')
    .nth(i)
    .screenshot({ path: join(cache, `slide-${i + 1}.png`) });
}
await page.pdf({
  path: out,
  width: '1280px',
  height: '720px',
  printBackground: true,
  preferCSSPageSize: true,
  tagged: true,
  outline: true,
});
await browser.close();

const pdf = await readFile(out, 'latin1');
const pages = (pdf.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
if (pages !== SLIDES) throw new Error(`El PDF tiene ${pages} páginas; deben ser ${SLIDES}.`);
const kb = Math.round((await stat(out)).size / 1024);
console.log(
  `last-signal-slides.pdf: ${pages} páginas, ${kb} KB · QR ${check.qr === null ? 'sin comprobar' : 'comprobado'} · equipo: ${team.team}`,
);
