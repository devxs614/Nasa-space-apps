let webgl2Cache: boolean | null = null;

/** ¿Hay WebGL 2? `?nowebgl=1` lo fuerza a falso (pruebas). */
export function hasWebGL2(): boolean {
  if (webgl2Cache !== null) return webgl2Cache;
  try {
    if (new URLSearchParams(window.location.search).get('nowebgl') === '1') {
      webgl2Cache = false;
      return false;
    }
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    webgl2Cache = Boolean(gl);
    const lose = gl?.getExtension('WEBGL_lose_context');
    lose?.loseContext();
  } catch {
    webgl2Cache = false;
  }
  return webgl2Cache;
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function isCoarsePointer(): boolean {
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

export function shouldStartLite(gpuTier: number | undefined): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    gpuTier === 0 ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    nav.connection?.saveData === true
  );
}

export function queryFlag(name: string): boolean {
  try {
    return new URLSearchParams(window.location.search).get(name) === '1';
  } catch {
    return false;
  }
}
