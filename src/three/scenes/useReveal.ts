import type { MachineId } from '../../data/types';
import { useJourneyStore } from '../../state/useJourneyStore';

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Revelado objetivo según el momento: dormida hasta la señal, recordando después, y de vuelta al holograma al final. */
export function revealTarget(id: MachineId): number {
  const js = useJourneyStore.getState();
  if (js.chapterId !== id) return 1;
  if (js.beat === 'wake') return js.signal.status === 'arrived' ? 1 : 0;
  if (js.beat === 'lastSignal') return 1 - smooth(0.6, 0.95, js.beatProgress);
  return 1;
}

/** Polvo, escarcha o noche acumulados durante "Última señal" (Parte 7.5). */
export function dustAmount(id: MachineId): number {
  const js = useJourneyStore.getState();
  if (js.chapterId !== id || js.beat !== 'lastSignal') return 0;
  if (['spirit', 'opportunity', 'insight', 'phoenix'].includes(id))
    return smooth(0.1, 0.85, js.beatProgress);
  return 0;
}

export function lastSignalDim(id: MachineId | null): number {
  const js = useJourneyStore.getState();
  if (!id || js.chapterId !== id || js.beat !== 'lastSignal') return 0;
  return smooth(0.3, 0.95, js.beatProgress);
}
