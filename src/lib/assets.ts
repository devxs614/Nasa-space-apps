const cache = new Map<string, Promise<boolean>>();

/** Texturas y modelos opcionales que estaban en public/ al compilar (ver vite.config.ts). */
const BUNDLED: ReadonlySet<string> = new Set(
  typeof __OPTIONAL_ASSETS__ === 'undefined' ? [] : __OPTIONAL_ASSETS__,
);

/** Ruta a un archivo de public/ respetando BASE_PATH (Parte 20.3). */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

/**
 * True solo si el archivo opcional de public/ (por ejemplo `textures/moon_color_2k.jpg`) existe de
 * verdad. Si no estaba al compilar, no se pregunta al servidor: cada 404 queda como error en la
 * consola. Si estaba, se confirma con HEAD (el servidor de Vite devuelve index.html para rutas
 * inexistentes).
 */
export function assetExists(
  path: string,
  bundled: ReadonlySet<string> = BUNDLED,
): Promise<boolean> {
  const rel = path.replace(/^\//, '');
  if (!bundled.has(rel)) return Promise.resolve(false);
  let p = cache.get(rel);
  if (!p) {
    p = fetch(publicUrl(rel), { method: 'HEAD' })
      .then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
      .catch(() => false);
    cache.set(rel, p);
  }
  return p;
}
