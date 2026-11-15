// Alojamiento estático sin reescrituras (GitHub Pages): copia dist/index.html a cada ruta conocida
// para que una ruta profunda responda 200. Sin esto la sirve 404.html: la app carga igual, pero con
// estado HTTP 404, y los rastreadores, las vistas previas de enlaces y Lighthouse la descartan.
// Uso: npm run build && node scripts/spa-routes.mjs [dist]
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const dist = process.argv[2] ?? 'dist';

// Los ids salen de la misma lista que usa la app, para no mantener dos copias.
const ids = await readFile(new URL('../src/data/ids.ts', import.meta.url), 'utf8');
const block = /MACHINE_IDS[^=]*=\s*\[([^\]]+)\]/.exec(ids)?.[1] ?? '';
const machines = [...block.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
if (machines.length !== 15) {
  throw new Error(`Se esperaban 15 máquinas en src/data/ids.ts y hay ${machines.length}.`);
}

/** Rutas de src/App.tsx (sin la portada, que ya es index.html). */
export const ROUTES = [
  'lectura',
  'maquinas',
  ...machines.map((id) => `maquinas/${id}`),
  'atlas/luna',
  'atlas/marte',
  'linea-de-tiempo',
  'pasaporte',
  'fuentes',
  'acerca',
];

const index = join(dist, 'index.html');
// Dos formas por ruta: `ruta.html` (se sirve en /ruta sin redirección) y `ruta/index.html` (por si el
// servidor prefiere la carpeta y redirige a /ruta/).
const targets = ['404.html', ...ROUTES.flatMap((r) => [`${r}.html`, `${r}/index.html`])];
for (const target of targets) {
  const out = join(dist, target);
  await mkdir(dirname(out), { recursive: true });
  await copyFile(index, out);
}
console.log(`spa-routes: ${ROUTES.length} rutas (${targets.length} archivos) en ${dist}/`);
