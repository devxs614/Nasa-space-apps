import { afterEach, describe, expect, it, vi } from 'vitest';
import { assetExists, publicUrl } from '../lib/assets';

afterEach(() => vi.unstubAllGlobals());

describe('recursos opcionales de public/', () => {
  it('no pregunta al servidor por un archivo que no estaba al compilar', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(assetExists('textures/starmap_4k.jpg', new Set())).resolves.toBe(false);
    await expect(assetExists('/models/kepler.glb', new Set())).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('confirma con HEAD los que sí estaban y descarta el index.html de relleno', async () => {
    const bundled = new Set(['textures/a.jpg', 'textures/b.jpg']);
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve({
        ok: true,
        headers: new Headers({
          'content-type': url.endsWith('a.jpg') ? 'image/jpeg' : 'text/html',
        }),
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(assetExists('textures/a.jpg', bundled)).resolves.toBe(true);
    await expect(assetExists('/textures/b.jpg', bundled)).resolves.toBe(false);
    await assetExists('textures/a.jpg', bundled);
    expect(fetchMock).toHaveBeenCalledTimes(2); // la respuesta se recuerda
    expect(fetchMock).toHaveBeenCalledWith(publicUrl('textures/a.jpg'), { method: 'HEAD' });
  });

  it('la lista de compilación solo contiene rutas de textures/ y models/', () => {
    expect(Array.isArray(__OPTIONAL_ASSETS__)).toBe(true);
    for (const path of __OPTIONAL_ASSETS__) expect(path).toMatch(/^(textures|models)\/[^/.][^/]*$/);
  });
});
