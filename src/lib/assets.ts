const cache = new Map<string, Promise<boolean>>();

/** True solo si el archivo existe de verdad (el servidor de Vite devuelve index.html para rutas inexistentes). */
export function assetExists(url: string): Promise<boolean> {
  let p = cache.get(url);
  if (!p) {
    p = fetch(url, { method: 'HEAD' })
      .then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
      .catch(() => false);
    cache.set(url, p);
  }
  return p;
}

/** Ruta a un archivo de public/ respetando BASE_PATH (Parte 20.3). */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
