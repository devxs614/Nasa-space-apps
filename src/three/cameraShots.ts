import { CatmullRomCurve3, Vector3 } from 'three';
import type { JourneyState } from '../state/useJourneyStore';
import type { MachineId } from '../data/types';
import {
  CERES_POS,
  FRAME,
  GLOBE_R,
  KEPLER_ORBIT_R,
  VESTA_POS,
  earthDirection,
  logR,
  siteDirection,
} from './layout';

export type ShotType =
  'orbitHigh' | 'orbitSite' | 'hero34' | 'detail' | 'lowAngle' | 'trajectory' | 'pullBack';
export interface Shot {
  type: ShotType;
  position: Vector3;
  target: Vector3;
  fov: number;
  smoothTime?: number;
  drift?: boolean;
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
const tmp = new Vector3();
const tmp2 = new Vector3();
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

/** Altura de descenso de la máquina en "La llegada" (la escena la usa igual). */
export function descentOffset(id: MachineId, p: number): number {
  const f = FRAME[id];
  return Math.max(0, 1 - p / 0.85) ** 1.6 * f * 3;
}

function surfaceShot(id: MachineId, beat: JourneyState['beat'], p: number): Shot {
  const F = FRAME[id];
  switch (beat) {
    case 'identity':
      return {
        type: 'hero34',
        position: v(0.95 * F, 0.42 * F + 0.4, 1.15 * F),
        target: v(0, 0.28 * F, 0),
        fov: 36,
        drift: true,
      };
    case 'arrival': {
      const y = descentOffset(id, p);
      return {
        type: 'lowAngle',
        position: v(-1.1 * F, 0.12 * F + 0.4, 1.4 * F),
        target: v(0, 0.35 * F + y, 0),
        fov: 42,
        smoothTime: 0.2,
      };
    }
    case 'work':
      return {
        type: 'detail',
        position: v(0.75 * F, 0.5 * F + 0.3, 0.95 * F),
        target: v(0, 0.22 * F, 0),
        fov: 38,
      };
    case 'lastSignal':
      return {
        type: 'pullBack',
        position: v(lerp(1.2, 1.9, p) * F, lerp(0.45, 0.8, p) * F, lerp(1.5, 2.3, p) * F),
        target: v(0, 0.2 * F, 0),
        fov: 38,
      };
    default:
      return {
        type: 'hero34',
        position: v(F, 0.5 * F, 1.2 * F),
        target: v(0, 0.25 * F, 0),
        fov: 38,
      };
  }
}

function orbitShot(
  id: MachineId | null,
  beat: JourneyState['beat'],
  p: number,
  mars: boolean,
): Shot {
  if (!id) {
    const base = mars ? v(4, 5, 17) : v(17, 4, 5);
    return { type: 'orbitHigh', position: base, target: v(0, 0, 0), fov: 40, drift: true };
  }
  const dir = siteDirection(id, tmp);
  if (beat === 'journey') {
    const e = earthDirection(dir, tmp2);
    const pos = dir
      .clone()
      .multiplyScalar(0.6)
      .add(e.clone().multiplyScalar(0.8))
      .normalize()
      .multiplyScalar(lerp(26, 17, ease(p)));
    pos.y += 5;
    return {
      type: 'trajectory',
      position: pos,
      target: dir.clone().multiplyScalar(GLOBE_R * 0.6),
      fov: 40,
    };
  }
  if (beat === 'legacy') {
    const pos = dir.clone().multiplyScalar(lerp(14, 24, ease(p)));
    pos.y += lerp(2, 6, p);
    return { type: 'pullBack', position: pos, target: v(0, 0, 0), fov: 40 };
  }
  const pos = dir.clone().multiplyScalar(17);
  pos.y += 3;
  return {
    type: 'orbitSite',
    position: pos,
    target: dir.clone().multiplyScalar(GLOBE_R * 0.55),
    fov: 38,
    drift: true,
  };
}

function erosShot(beat: JourneyState['beat'], p: number): Shot {
  switch (beat) {
    case 'identity':
      return { type: 'hero34', position: v(9, 4.5, 6), target: v(6, 2.4, 0), fov: 36, drift: true };
    case 'journey':
      return {
        type: 'trajectory',
        position: v(lerp(-6, 0, p), 14, 28),
        target: v(0, 0, 0),
        fov: 42,
      };
    case 'arrival':
      return { type: 'orbitHigh', position: v(4, 10, 16), target: v(0, 0, 0), fov: 40 };
    case 'work':
      return {
        type: 'detail',
        position: v(lerp(6, 2.5, p), lerp(9, 4.6, p), lerp(9, 5.5, p)),
        target: v(0.2, lerp(3, 2.2, p), 0),
        fov: 38,
        smoothTime: 0.25,
      };
    case 'lastSignal':
      return { type: 'lowAngle', position: v(3.2, 3.2, 4.2), target: v(0.2, 2.1, 0), fov: 40 };
    case 'legacy':
      return {
        type: 'pullBack',
        position: v(0, lerp(10, 18, p), lerp(20, 34, p)),
        target: v(0, 0, 0),
        fov: 40,
      };
    default:
      return { type: 'orbitHigh', position: v(0, 7, 21), target: v(0, 0, 0), fov: 40, drift: true };
  }
}

/** Posición de Dawn en la escena: de Vesta a Ceres durante "El viaje". */
export function dawnPosition(beat: JourneyState['beat'], p: number, out = new Vector3()): Vector3 {
  const atVesta = VESTA_POS.clone().add(v(0, 2.4, 4.4));
  const atCeres = CERES_POS.clone().add(v(0, 2.8, 5.6));
  if (beat === 'wake') return out.copy(atVesta);
  if (beat === 'journey') return out.lerpVectors(atVesta, atCeres, ease(p));
  return out.copy(atCeres);
}

function vestaCeresShot(beat: JourneyState['beat'], p: number): Shot {
  const d = dawnPosition(beat, p, tmp);
  switch (beat) {
    case 'wake':
      return {
        type: 'orbitSite',
        position: VESTA_POS.clone().add(v(5, 4, 13)),
        target: VESTA_POS.clone().add(v(0, 0.5, 0)),
        fov: 38,
        drift: true,
      };
    case 'identity':
      return {
        type: 'hero34',
        position: d.clone().add(v(4, 2.2, 6)),
        target: d.clone(),
        fov: 38,
        drift: true,
      };
    case 'journey':
      return {
        type: 'trajectory',
        position: v(lerp(-10, 10, ease(p)), 12, 26),
        target: v(lerp(-8, 8, ease(p)), 0, 0),
        fov: 44,
      };
    case 'legacy':
      return {
        type: 'pullBack',
        position: v(0, lerp(10, 22, p), lerp(30, 46, p)),
        target: v(0, 0, 0),
        fov: 42,
      };
    default:
      return {
        type: 'orbitSite',
        position: CERES_POS.clone().add(v(6, 4.5, 14)),
        target: CERES_POS.clone().add(v(0, 0.8, 1)),
        fov: 38,
        drift: true,
      };
  }
}

/** Ángulo de la Tierra (y de Kepler detrás) en su órbita ilustrativa. */
export function keplerAngles(
  beat: JourneyState['beat'],
  p: number,
): { earth: number; kepler: number } {
  const base =
    beat === 'journey'
      ? p * 1.2
      : beat && ['arrival', 'work', 'lastSignal', 'legacy'].includes(beat)
        ? 1.2
        : 0;
  return {
    earth: 0.6 + base,
    kepler: 0.6 + base - 0.32 - (beat === 'journey' ? p * 0.12 : base * 0.1),
  };
}

function keplerShot(beat: JourneyState['beat'], p: number): Shot {
  const { kepler } = keplerAngles(beat, p);
  const k = v(
    Math.cos(kepler) * (KEPLER_ORBIT_R + 0.4),
    0,
    -Math.sin(kepler) * (KEPLER_ORBIT_R + 0.4),
  );
  switch (beat) {
    case 'identity':
      return {
        type: 'hero34',
        position: k.clone().add(v(2.6, 1.6, 2.8)),
        target: k.clone().add(v(0, 0.4, 0)),
        fov: 36,
        drift: true,
      };
    case 'arrival':
    case 'work':
      return {
        type: 'detail',
        position: k.clone().add(v(-1.4, 0.6, 2.2)),
        target: k.clone().add(v(0.5, 4, -1)),
        fov: 50,
      };
    case 'lastSignal':
      return { type: 'hero34', position: k.clone().add(v(3, 2, 3.4)), target: k.clone(), fov: 38 };
    case 'legacy':
      return {
        type: 'pullBack',
        position: v(0, lerp(16, 30, p), lerp(18, 34, p)),
        target: v(0, 0, 0),
        fov: 42,
      };
    case 'journey':
      return { type: 'trajectory', position: v(0, 15, 17), target: v(0, 0, 0), fov: 42 };
    default:
      return {
        type: 'orbitHigh',
        position: v(0, 13, 17),
        target: v(0, 0, 0),
        fov: 42,
        drift: true,
      };
  }
}

export function pioneerPosition(
  which: 'pioneer10' | 'pioneer11',
  frac = 1,
  out = new Vector3(),
): Vector3 {
  const r = which === 'pioneer10' ? logR(141) : logR(118.4);
  return out
    .copy(which === 'pioneer10' ? v(1, 0.05, 0.55).normalize() : v(-0.8, 0.18, 0.65).normalize())
    .multiplyScalar(r * frac);
}

function outerShot(beat: JourneyState['beat'], p: number): Shot {
  const p10 = pioneerPosition('pioneer10', beat === 'journey' ? lerp(0.35, 0.8, p) : 1, tmp);
  switch (beat) {
    case 'identity':
    case 'work':
      return {
        type: 'hero34',
        position: p10.clone().add(v(1.8, 1.2, 2.4)),
        target: p10.clone(),
        fov: 36,
        drift: true,
      };
    case 'arrival':
      return {
        type: 'detail',
        position: v(4.2, 2.2, 5),
        target: v(logR(5.2) * 0.8, 0, 0.6),
        fov: 40,
      };
    case 'journey':
      return { type: 'trajectory', position: v(0, 16, 22), target: v(2, 0, 3), fov: 42 };
    case 'lastSignal':
      return {
        type: 'pullBack',
        position: v(0, lerp(14, 22, p), lerp(20, 30, p)),
        target: v(0, 0, 2),
        fov: 42,
      };
    case 'legacy':
      return {
        type: 'pullBack',
        position: v(0, lerp(20, 36, p), lerp(28, 50, p)),
        target: v(0, 0, 0),
        fov: 42,
      };
    default:
      return {
        type: 'orbitHigh',
        position: v(0, 18, 24),
        target: v(0, 0, 2),
        fov: 42,
        drift: true,
      };
  }
}

const PROLOGUE_PATH = new CatmullRomCurve3([
  v(0, 3, 75),
  v(4, 2, 30),
  v(5, 3, 24),
  v(-3, 6, 30),
  v(-6, 3, 24),
  v(4, 3, 27),
  v(18, 4, 14),
  v(40, 6, -4),
]);
const PROLOGUE_TARGET = new CatmullRomCurve3([
  v(-2, 0, 0),
  v(-3, 0, 0),
  v(-2, 0.5, 0),
  v(-2, 0, 0),
  v(-2, 0, 0),
  v(-2, 0, 0),
  v(30, 2, -10),
  v(80, 4, -30),
]);

function prologueShot(p: number): Shot {
  return {
    type: 'trajectory',
    position: PROLOGUE_PATH.getPoint(Math.min(1, p)),
    target: PROLOGUE_TARGET.getPoint(Math.min(1, p)),
    fov: 40,
    smoothTime: 0.4,
  };
}

function epilogueShot(p: number): Shot {
  return {
    type: 'trajectory',
    position: v(lerp(-14, 14, p), 3 + Math.sin(p * Math.PI) * 2, 16),
    target: v(lerp(-10, 10, p), 0.5, 0),
    fov: 42,
  };
}

/** Plano para el estado actual (Parte 8.5). Funciones puras, sin estado de React. */
export function resolveShot(
  s: Pick<
    JourneyState,
    | 'sceneKey'
    | 'chapterId'
    | 'beat'
    | 'beatProgress'
    | 'section'
    | 'sectionProgress'
    | 'showcaseView'
  >,
): Shot {
  const p = s.chapterId ? s.beatProgress : s.sectionProgress;
  switch (s.sceneKey) {
    case 'prologue':
      return prologueShot(s.section === 'prologue' ? p : 0);
    case 'moon-orbit':
      return orbitShot(s.chapterId, s.beat, p, false);
    case 'mars-orbit':
      return orbitShot(s.chapterId, s.beat, p, true);
    case 'moon-surface':
    case 'mars-surface':
      return s.chapterId
        ? surfaceShot(s.chapterId, s.beat, p)
        : { type: 'hero34', position: v(4, 2, 5), target: v(0, 1, 0), fov: 38 };
    case 'eros':
      return erosShot(s.chapterId === 'near' ? s.beat : null, p);
    case 'vesta-ceres':
      return vestaCeresShot(s.beat, p);
    case 'kepler':
      return keplerShot(s.chapterId === 'kepler' ? s.beat : null, p);
    case 'outer-system':
      return outerShot(s.beat, p);
    case 'epilogue':
      return epilogueShot(s.section === 'epilogue' ? p : 0);
    case 'showcase':
      return {
        type: 'hero34',
        position: v(0, 1.7, 6.2 / s.showcaseView.zoom),
        target: v(0, 1.1, 0),
        fov: 38,
      };
    default:
      return { type: 'orbitHigh', position: v(0, 0, 14), target: v(0, 0, 0), fov: 40, drift: true };
  }
}
