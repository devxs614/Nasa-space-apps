import type { MachineId, World } from './types';

/** Orden canónico de La Travesía (Parte 2.4). */
export const MACHINE_IDS: readonly MachineId[] = [
  'surveyor',
  'apollo-lm',
  'alsep',
  'lrv',
  'viking',
  'sojourner',
  'spirit',
  'opportunity',
  'phoenix',
  'insight',
  'ingenuity',
  'near',
  'dawn',
  'kepler',
  'pioneer',
] as const;

export const WORLDS: readonly World[] = ['moon', 'mars', 'small-bodies', 'deep-space'];

export const WORLD_OF: Record<MachineId, World> = {
  surveyor: 'moon',
  'apollo-lm': 'moon',
  alsep: 'moon',
  lrv: 'moon',
  viking: 'mars',
  sojourner: 'mars',
  spirit: 'mars',
  opportunity: 'mars',
  phoenix: 'mars',
  insight: 'mars',
  ingenuity: 'mars',
  near: 'small-bodies',
  dawn: 'small-bodies',
  kepler: 'deep-space',
  pioneer: 'deep-space',
};

/** Anclas de las portadas de acto (Parte 8.1). */
export const ACT_ANCHOR: Record<World, string> = {
  moon: 'luna',
  mars: 'marte',
  'small-bodies': 'pequenos',
  'deep-space': 'profundo',
};

export function isMachineId(v: string | undefined | null): v is MachineId {
  return typeof v === 'string' && (MACHINE_IDS as readonly string[]).includes(v);
}
