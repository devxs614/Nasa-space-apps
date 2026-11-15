import type { Quality } from '../state/useAppStore';
import { useAppStore } from '../state/useAppStore';

export interface QualityParams {
  dpr: number;
  stars: number;
  sphereSegments: number;
  terrainSegments: number;
  shadows: 0 | 1024 | 2048;
  dust: number;
  rocks: number;
  octaves: number;
  post: 'css' | 'basic' | 'full';
}

/** Sistema de calidad (Parte 9.13). */
export const QUALITY: Record<Quality, QualityParams> = {
  low: {
    dpr: 1,
    stars: 3000,
    sphereSegments: 64,
    terrainSegments: 96,
    shadows: 0,
    dust: 500,
    rocks: 300,
    octaves: 3,
    post: 'css',
  },
  medium: {
    dpr: 1.5,
    stars: 6000,
    sphereSegments: 128,
    terrainSegments: 160,
    shadows: 1024,
    dust: 1500,
    rocks: 600,
    octaves: 4,
    post: 'basic',
  },
  high: {
    dpr: 2,
    stars: 12000,
    sphereSegments: 192,
    terrainSegments: 256,
    shadows: 2048,
    dust: 4000,
    rocks: 1200,
    octaves: 5,
    post: 'full',
  },
};

export function useQuality(): QualityParams {
  const q = useAppStore((s) => s.quality);
  const lite = useAppStore((s) => s.liteMode);
  const p = QUALITY[lite ? 'low' : q];
  return lite ? { ...p, dust: 0 } : p;
}

/** Nivel de GPU sin peticiones externas (ver DECISIONS.md): 0 muy baja · 3 alta. */
export function estimateGpuTier(): number {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return 0;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(
      ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    ).toLowerCase();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = navigator.hardwareConcurrency || 4;
    const mem = nav.deviceMemory ?? 8;
    const mobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent);
    if (/swiftshader|llvmpipe|software|basic render/.test(renderer)) return 1;
    if (/apple m\d|rtx|radeon rx|geforce gtx 1[0-9]|geforce rtx|arc a/.test(renderer))
      return mobile ? 2 : 3;
    if (mobile) return mem <= 3 || cores <= 4 ? 1 : 2;
    if (/intel/.test(renderer)) return cores >= 8 ? 2 : 1;
    return mem >= 8 && cores >= 8 ? 3 : 2;
  } catch {
    return 1;
  }
}

export function tierToQuality(tier: number): Quality {
  return tier >= 3 ? 'high' : tier === 2 ? 'medium' : 'low';
}
