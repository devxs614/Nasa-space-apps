import {
  AU_KM,
  C_KM_S,
  MOON_MEAN_KM,
  EM_BARY,
  MARS,
  EROS,
  CERES_A_AU,
  PIONEER,
} from '../data/orbits';
import type { LightTarget } from '../data/types';

export type { LightTarget };

const DEG = Math.PI / 180;
export const J2000 = 2451545.0;
export const LIGHT_S_PER_AU = AU_KM / C_KM_S; // ≈ 499,005 s
const EARTH_APHELION_AU = 1.017;

export type LightMethod = 'mean' | 'ephemeris' | 'range' | 'extrapolated' | 'off';
export interface LightTimeResult {
  target: LightTarget;
  method: LightMethod;
  seconds: number | null; // null cuando el transmisor está apagado (Kepler)
  range?: [number, number]; // solo Ceres
  distanceKm: number | null;
  approx: true;
}
export type Vec3 = [number, number, number];
type Elements = {
  readonly [K in 'a' | 'e' | 'I' | 'L' | 'peri' | 'node']: readonly [number, number];
};

export function julianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}
export function normalizeDeg180(deg: number): number {
  return ((((deg + 180) % 360) + 360) % 360) - 180;
}
/** Resuelve M = E − e·sin E por Newton (radianes). */
export function solveKepler(M: number, e: number, tol = 1e-12, maxIter = 30): number {
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < maxIter; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tol) break;
  }
  return E;
}
function orbitToEcliptic(
  a: number,
  e: number,
  I: number,
  node: number,
  argPeri: number,
  Mdeg: number,
): Vec3 {
  const E = solveKepler(normalizeDeg180(Mdeg) * DEG, e);
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(argPeri * DEG),
    sw = Math.sin(argPeri * DEG);
  const cO = Math.cos(node * DEG),
    sO = Math.sin(node * DEG);
  const ci = Math.cos(I * DEG),
    si = Math.sin(I * DEG);
  return [
    (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp,
    (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp,
    sw * si * xp + cw * si * yp,
  ];
}
export function planetPositionAU(el: Elements, jd: number): Vec3 {
  const T = (jd - J2000) / 36525;
  const at = (k: keyof Elements) => el[k][0] + el[k][1] * T;
  const peri = at('peri');
  const node = at('node');
  return orbitToEcliptic(at('a'), at('e'), at('I'), node, peri - node, at('L') - peri);
}
export function erosPositionAU(jd: number): Vec3 {
  const M = EROS.M0 + (360 * (jd - EROS.epochJD)) / EROS.periodDays;
  return orbitToEcliptic(EROS.a, EROS.e, EROS.I, EROS.node, EROS.argPeri, M);
}
export function earthPositionAU(jd: number): Vec3 {
  return planetPositionAU(EM_BARY, jd);
}
export function marsPositionAU(jd: number): Vec3 {
  return planetPositionAU(MARS, jd);
}
export function pioneerDistanceAU(id: 'pioneer10' | 'pioneer11', date: Date): number {
  const ref = PIONEER[id];
  const dtS = (date.getTime() - Date.parse(`${ref.t0}T00:00:00Z`)) / 1000;
  return ref.d0AU + (ref.vKmS * dtS) / AU_KM;
}
const dist = (p: Vec3, q: Vec3) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

export function lightTime(target: LightTarget, date: Date = new Date()): LightTimeResult {
  const jd = julianDay(date);
  switch (target) {
    case 'moon':
      return {
        target,
        method: 'mean',
        seconds: MOON_MEAN_KM / C_KM_S,
        distanceKm: MOON_MEAN_KM,
        approx: true,
      };
    case 'mars':
    case 'eros': {
      const there = target === 'mars' ? planetPositionAU(MARS, jd) : erosPositionAU(jd);
      const d = dist(planetPositionAU(EM_BARY, jd), there);
      return {
        target,
        method: 'ephemeris',
        seconds: d * LIGHT_S_PER_AU,
        distanceKm: d * AU_KM,
        approx: true,
      };
    }
    case 'ceres': {
      const min = (CERES_A_AU - EARTH_APHELION_AU) * LIGHT_S_PER_AU;
      const max = (CERES_A_AU + EARTH_APHELION_AU) * LIGHT_S_PER_AU;
      return {
        target,
        method: 'range',
        seconds: (min + max) / 2,
        range: [min, max],
        distanceKm: null,
        approx: true,
      };
    }
    case 'pioneer10':
    case 'pioneer11': {
      const d = pioneerDistanceAU(target, date); // distancia al Sol; desde la Tierra varía ±1 UA (±0,7 %)
      return {
        target,
        method: 'extrapolated',
        seconds: d * LIGHT_S_PER_AU,
        distanceKm: d * AU_KM,
        approx: true,
      };
    }
    case 'kepler':
      return { target, method: 'off', seconds: null, distanceKm: null, approx: true };
  }
}

/** Ida y vuelta de un pulso láser a la Luna: 2 × MOON_MEAN_KM / C_KM_S. */
export const LASER_ROUND_TRIP_S = (2 * MOON_MEAN_KM) / C_KM_S;
