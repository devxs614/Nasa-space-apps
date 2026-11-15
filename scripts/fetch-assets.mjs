// Descarga opcional de texturas (Anexo C). Nunca hace fallar la compilación.
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const manifest = JSON.parse(await readFile(new URL('./assets.manifest.json', import.meta.url), 'utf8'));
let ready = 0;

for (const asset of manifest) {
  const out = join('public', asset.file);
  try {
    await access(out);
    console.log(`✓ ya existe: ${asset.file}`);
    ready += 1;
    continue;
  } catch {
    /* no existe */
  }
  if (!asset.url) {
    console.log(`· manual: ${asset.file} → ${asset.page}`);
    continue;
  }
  try {
    const res = await fetch(asset.url, { signal: AbortSignal.timeout(60_000) });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || type.includes('text/html')) throw new Error(`HTTP ${res.status} ${type}`);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, Buffer.from(await res.arrayBuffer()));
    console.log(`✓ descargado: ${asset.file}`);
    ready += 1;
  } catch (err) {
    console.warn(`· no descargado: ${asset.file} (${err.message}). Descárgalo desde ${asset.page}`);
  }
}

console.log(`${ready}/${manifest.length} recursos opcionales listos. La web funciona igual sin ellos.`);
process.exitCode = 0;
