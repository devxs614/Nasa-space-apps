import { createRng } from './rng';

/**
 * Ruido simplex 2D (algoritmo de Stefan Gustavson, dominio público), con tabla de permutación sembrada.
 */
export function createNoise2D(seed = 1): (x: number, y: number) => number {
  const rand = createRng(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = p[i] as number;
    p[i] = p[j] as number;
    p[j] = t;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255] as number;
  const grad = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const dot = (g: readonly [number, number], x: number, y: number) => g[0] * x + g[1] * y;
  return (xin: number, yin: number) => {
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const g0 = grad[(perm[ii + (perm[jj] as number)] as number) % 8] as readonly [number, number];
    const g1 = grad[(perm[ii + i1 + (perm[jj + j1] as number)] as number) % 8] as readonly [
      number,
      number,
    ];
    const g2 = grad[(perm[ii + 1 + (perm[jj + 1] as number)] as number) % 8] as readonly [
      number,
      number,
    ];
    let n0 = 0;
    let n1 = 0;
    let n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * dot(g0, x0, y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * dot(g1, x1, y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * dot(g2, x2, y2);
    }
    return 70 * (n0 + n1 + n2);
  };
}

export function fbm2(
  noise: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves = 5,
): number {
  let a = 0.5;
  let f = 1;
  let s = 0;
  for (let i = 0; i < octaves; i++) {
    s += a * noise(x * f, y * f);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}
