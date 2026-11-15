import type { MachineId, World } from './types';
import { MACHINES } from './machines';
import { ACT_ANCHOR } from './ids';

export interface Act {
  world: World;
  numeral: 'I' | 'II' | 'III' | 'IV';
  years: [number, number]; // Parte 8.4
  anchor: string;
  machines: MachineId[];
}

export const ACTS: Act[] = [
  { world: 'moon', numeral: 'I', years: [1966, 1977], anchor: ACT_ANCHOR.moon, machines: [] },
  { world: 'mars', numeral: 'II', years: [1976, 2024], anchor: ACT_ANCHOR.mars, machines: [] },
  {
    world: 'small-bodies',
    numeral: 'III',
    years: [1996, 2018],
    anchor: ACT_ANCHOR['small-bodies'],
    machines: [],
  },
  {
    world: 'deep-space',
    numeral: 'IV',
    years: [1972, 2018],
    anchor: ACT_ANCHOR['deep-space'],
    machines: [],
  },
].map((a) => ({
  ...a,
  machines: MACHINES.filter((m) => m.world === a.world).map((m) => m.id),
})) as Act[];

export const ACT_OF = Object.fromEntries(ACTS.map((a) => [a.world, a])) as Record<World, Act>;

/** Recuento del prólogo: "15 máquinas en silencio · 4 en la Luna…" (calculado de machines.ts). */
export function census() {
  const by = (w: World) => MACHINES.filter((m) => m.world === w).length;
  return {
    total: MACHINES.length,
    moon: by('moon'),
    mars: by('mars'),
    small: by('small-bodies'),
    deep: by('deep-space'),
  };
}
