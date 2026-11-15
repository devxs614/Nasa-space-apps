import { Vector3 } from 'three';
import { MACHINES_BY_ID } from '../data/machines';
import { MACHINE_IDS } from '../data/ids';
import type { MachineId } from '../data/types';
import { latLonToVector3 } from '../lib/coords';

/** Tamaño de encuadre aproximado (m) de cada máquina en su diorama: solo para la cámara (Parte 10.1.8). */
export const FRAME: Record<MachineId, number> = {
  surveyor: 4.3,
  'apollo-lm': 9.4,
  alsep: 6,
  lrv: 3.4,
  viking: 3.2,
  sojourner: 0.8,
  spirit: 2.4,
  opportunity: 2.4,
  phoenix: 5.6,
  insight: 6,
  ingenuity: 1.3,
  near: 2.2,
  dawn: 3,
  kepler: 2.2,
  pioneer: 2.2,
};

export const GLOBE_R = 5;

/** Dirección media de los sitios de un capítulo sobre su globo. */
export function siteDirection(id: MachineId, out = new Vector3()): Vector3 {
  const m = MACHINES_BY_ID[id];
  out.set(0, 0, 0);
  if (m.sites.length === 0) return out.set(1, 0, 0);
  for (const s of m.sites) out.add(latLonToVector3(s.lat, s.lon, 1));
  return out.normalize();
}

/** Dirección hacia la Tierra para el arco de trayectoria: el sitio girado 70° alrededor de Y. */
export function earthDirection(siteDir: Vector3, out = new Vector3()): Vector3 {
  return out
    .copy(siteDir)
    .applyAxisAngle(new Vector3(0, 1, 0), (70 * Math.PI) / 180)
    .setY(0.25)
    .normalize();
}

export function nextOnSameWorld(id: MachineId): MachineId | null {
  const i = MACHINE_IDS.indexOf(id);
  const next = MACHINE_IDS[i + 1];
  if (!next) return null;
  return MACHINES_BY_ID[next].world === MACHINES_BY_ID[id].world ? next : null;
}

// Escenas pequeñas y profundas
export const VESTA_POS = new Vector3(-16, 0, 0);
export const CERES_POS = new Vector3(16, 0, 0);
export const KEPLER_ORBIT_R = 9;
/** Escala logarítmica de la Parte 9.2: r' = 6 · log10(1 + r_UA). */
export const logR = (au: number) => 6 * Math.log10(1 + au);
export const PIONEER_DIRS = {
  pioneer10: new Vector3(1, 0.05, 0.55).normalize(),
  pioneer11: new Vector3(-0.8, 0.18, 0.65).normalize(),
};
