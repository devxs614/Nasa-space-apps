// Genera public/og-image.png (1200×630) y las versiones de lectura estáticas sin JavaScript
// (public/lectura-es.html en español y public/lectura-en.html en inglés) a partir de la app compilada.
// Uso: npm run build && npx vite preview --port 4173 & → node scripts/prerender.mjs [http://localhost:4173]
// No se llaman lectura.html: el servidor resolvería /lectura (ruta de la app) hacia ese archivo.
import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const base = (process.argv[2] ?? 'http://localhost:4173').replace(/\/$/, '');
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

async function blockNasa(page) {
  await page.route('https://images-api.nasa.gov/**', (r) => r.abort());
}

// ── Imagen para redes: el héroe con el título, en inglés ──
{
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await blockNasa(page);
  await page.goto(`${base}/?lang=en`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);
  await page.addStyleTag({
    content:
      'header,.site-chrome,[data-rail],nav[aria-label],.overlay-grain{display:none!important}',
  });
  await page.screenshot({ path: 'public/og-image.png' });
  await page.close();
  console.log('og-image.png');
}

// ── Lectura estática ──
for (const [lang, file] of [
  ['es', 'lectura-es.html'],
  ['en', 'lectura-en.html'],
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await blockNasa(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${base}/lectura?lang=${lang}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-chapter]');
  await page.waitForTimeout(800);
  const html = await page.evaluate(() => {
    // CSS en línea, sin @font-face (las fuentes caen a las del sistema) para que funcione sin JavaScript.
    const css = [...document.styleSheets]
      .flatMap((sheet) => {
        try {
          return [...sheet.cssRules].map((r) => r.cssText);
        } catch {
          return [];
        }
      })
      .filter((t) => !t.startsWith('@font-face'))
      .join('\n');
    const clone = document.documentElement.cloneNode(true);
    clone
      .querySelectorAll(
        'script, link[rel="modulepreload"], link[rel="stylesheet"], link[rel="preload"], style, canvas, dialog, header, .site-chrome, .no-print, [aria-live], section[aria-label]',
      )
      .forEach((n) => n.remove());
    clone.querySelectorAll('[data-reactroot], [inert]').forEach((n) => n.removeAttribute('inert'));
    const style = document.createElement('style');
    style.textContent = css;
    clone.querySelector('head').appendChild(style);
    // Sin JavaScript los botones no hacen nada: «Escuchar» se quita; insignias de fuente y términos del
    // glosario quedan como texto (la etiqueta accesible pasa a title).
    clone.querySelectorAll('button[aria-pressed].btn-sm').forEach((n) => n.remove());
    clone.querySelectorAll('button').forEach((b) => {
      const s = document.createElement('span');
      s.className = b.className;
      const label = b.getAttribute('aria-label');
      if (label) s.title = label;
      s.innerHTML = b.innerHTML;
      b.replaceWith(s);
    });
    // Enlace de vuelta a la experiencia completa (para cuando JavaScript sí está disponible).
    const es = document.documentElement.lang.startsWith('es');
    const back = document.createElement('p');
    back.setAttribute('style', 'max-width:56rem;margin:0 auto;padding:16px 24px 0;font-size:14px');
    back.innerHTML = es
      ? 'Versión estática sin JavaScript · <a href="./?lang=es" style="color:#5ef2ff;text-decoration:underline">Abrir la experiencia 3D</a> · <a href="lectura-en.html" lang="en" style="color:#5ef2ff;text-decoration:underline">Read in English</a>'
      : 'Static version, no JavaScript needed · <a href="./?lang=en" style="color:#5ef2ff;text-decoration:underline">Open the 3D experience</a> · <a href="lectura-es.html" lang="es" style="color:#5ef2ff;text-decoration:underline">Leer en español</a>';
    clone.querySelector('body').prepend(back);
    return '<!doctype html>\n' + clone.outerHTML;
  });
  // Rutas relativas para que funcione también bajo una subruta (GitHub Pages).
  const out = html
    .replaceAll('src="/posters/', 'src="posters/')
    .replaceAll('href="/favicon.svg"', 'href="favicon.svg"')
    .replace(/href="\/(?!\/)/g, 'href="./')
    .replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
  await writeFile(`public/${file}`, out);
  console.log(file, `${Math.round(out.length / 1024)} KB`);
  await page.close();
}

await browser.close();
