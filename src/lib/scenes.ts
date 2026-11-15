import type { MachineId } from '../data/types';
import { WORLD_OF } from '../data/ids';
import type { BeatId, SceneKey, SectionId } from '../state/useJourneyStore';

const SURFACE_BEATS: BeatId[] = ['identity', 'arrival', 'work', 'lastSignal'];

/** Escena 3D de cada momento (Partes 8.1 y 8.5). */
export function sceneForBeat(id: MachineId, beat: BeatId): SceneKey {
  switch (id) {
    case 'near':
      return 'eros';
    case 'dawn':
      return 'vesta-ceres';
    case 'kepler':
      return 'kepler';
    case 'pioneer':
      return 'outer-system';
    default: {
      const w = WORLD_OF[id];
      const surface = SURFACE_BEATS.includes(beat);
      if (w === 'moon') return surface ? 'moon-surface' : 'moon-orbit';
      return surface ? 'mars-surface' : 'mars-orbit';
    }
  }
}

export function sceneForSection(s: SectionId): SceneKey {
  switch (s) {
    case 'prologue':
      return 'prologue';
    case 'act-moon':
      return 'moon-orbit';
    case 'act-mars':
      return 'mars-orbit';
    case 'act-small-bodies':
      return 'eros';
    case 'act-deep-space':
      return 'kepler';
    case 'epilogue':
      return 'epilogue';
  }
}

/** Variante del diorama de superficie (Parte 9.3). */
export type SurfaceVariant = 'lunar' | 'plain' | 'arctic' | 'crater' | 'hills' | 'dunes' | 'rocky';
export function surfaceVariant(id: MachineId): SurfaceVariant {
  switch (id) {
    case 'phoenix':
      return 'arctic';
    case 'opportunity':
      return 'crater';
    case 'spirit':
      return 'hills';
    case 'ingenuity':
      return 'dunes';
    case 'sojourner':
    case 'viking':
      return 'rocky';
    case 'insight':
      return 'plain';
    default:
      return 'lunar';
  }
}
