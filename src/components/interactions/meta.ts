import type { MachineId } from '../../data/types';
import type { InteractionMeta } from './types';

/** Clave de textos de cada actividad en `ui.json` (`ix.<clave>` e `ixm.<clave>`). */
export const IX_KEY: Record<MachineId, string> = {
  surveyor: 'surveyor',
  'apollo-lm': 'apollo',
  alsep: 'alsep',
  lrv: 'lrv',
  viking: 'viking',
  sojourner: 'sojourner',
  spirit: 'spirit',
  opportunity: 'opportunity',
  phoenix: 'phoenix',
  insight: 'insight',
  ingenuity: 'ingenuity',
  near: 'near',
  dawn: 'dawn',
  kepler: 'kepler',
  pioneer: 'pioneer',
};

/** Pasos de cada actividad y si explica sus propios controles (si no, usa los comunes). */
const SHAPE: Record<MachineId, { steps: number; ownControls?: boolean }> = {
  surveyor: { steps: 1, ownControls: true },
  'apollo-lm': { steps: 1 },
  alsep: { steps: 1 },
  lrv: { steps: 1, ownControls: true },
  viking: { steps: 1 },
  sojourner: { steps: 1 },
  spirit: { steps: 1, ownControls: true },
  opportunity: { steps: 1, ownControls: true },
  phoenix: { steps: 1 },
  insight: { steps: 1 },
  ingenuity: { steps: 3, ownControls: true },
  near: { steps: 2, ownControls: true },
  dawn: { steps: 3 },
  kepler: { steps: 1 },
  pioneer: { steps: 1, ownControls: true },
};

function build(id: MachineId): InteractionMeta {
  const key = IX_KEY[id];
  const { steps, ownControls } = SHAPE[id];
  const controls = ownControls ? `ixm.${key}` : 'ixm.common';
  const list = (prefix: string) =>
    Array.from({ length: steps }, (_, i) => `ixm.${key}.${prefix}${i + 1}`);
  return {
    titleKey: `ix.${key}.title`,
    goalKey: `ixm.${key}.goal`,
    controls: {
      mouseKey: `${controls}.mouse`,
      touchKey: `${controls}.touch`,
      keyboardKey: `${controls}.keyboard`,
    },
    steps,
    stepKeys: list('s'),
    hintKeys: list('h'),
    realKey: `ix.${key}.success`,
  };
}

/**
 * Objetivo, controles, pasos y pistas de las 15 mini-experiencias (corrección A). Viven aquí, y no en
 * el archivo de cada actividad, para que el objetivo se vea antes de que llegue su fragmento.
 */
export const META = Object.fromEntries(
  (Object.keys(IX_KEY) as MachineId[]).map((id) => [id, build(id)]),
) as Record<MachineId, InteractionMeta>;
