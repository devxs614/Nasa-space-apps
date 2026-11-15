// Constantes y efemérides (Parte 11.8).
export const C_KM_S = 299_792.458; // velocidad de la luz (exacta)
export const AU_KM = 149_597_870.7; // unidad astronómica (exacta)
export const MOON_MEAN_KM = 385_000; // distancia media aproximada (jpl-llr-2019) → ≈ 1,28 s de luz

// Elementos keplerianos aproximados de JPL, tabla 1 (válidos 1800–2050), eclíptica J2000.
// [valor, tasa por siglo juliano]. Fuente: jpl-approx-pos.
export const EM_BARY = {
  a: [1.00000261, 0.00000562],
  e: [0.01671123, -0.00004392],
  I: [-0.00001531, -0.01294668],
  L: [100.46457166, 35999.37244981],
  peri: [102.93768193, 0.32327364],
  node: [0.0, 0.0],
} as const;
export const MARS = {
  a: [1.52371034, 0.00001847],
  e: [0.0933941, 0.00007882],
  I: [1.84969142, -0.00813131],
  L: [-4.55343205, 19140.30268499],
  peri: [-23.94362959, 0.44441088],
  node: [49.55953891, -0.29257343],
} as const;

// 433 Eros: elementos osculantes de la base de datos de cuerpos pequeños de JPL, época JD 2460200.5
// (spacereference-eros). Propagación kepleriana simple: válida para estimaciones de pocos años.
export const EROS = {
  epochJD: 2460200.5,
  a: 1.458,
  e: 0.2228,
  I: 10.83,
  node: 304.29,
  argPeri: 178.91,
  M0: 222.76,
  periodDays: 643,
} as const;

// Ceres: solo semieje mayor (earthsky-au); se muestra un rango de distancia, no una posición.
export const CERES_A_AU = 2.767;

// Pioneer: referencia lineal (heavens-above-escape, noviembre de 2026). d(t) = d0 + v·(t − t0)
export const PIONEER = {
  pioneer10: { t0: '2026-11-14', d0AU: 141.0, vKmS: 11.867 },
  pioneer11: { t0: '2026-11-14', d0AU: 118.4, vKmS: 11.129 },
} as const;

export const ORBIT_SOURCES = {
  moon: ['jpl-llr-2019'],
  mars: ['jpl-approx-pos'],
  eros: ['jpl-approx-pos', 'spacereference-eros'],
  ceres: ['earthsky-au'],
  kepler: ['nasa-kepler-goodnight'],
  pioneer10: ['heavens-above-escape', 'theskylive-pioneer10'],
  pioneer11: ['heavens-above-escape'],
} as const;
