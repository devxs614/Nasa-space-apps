import type { MachineId } from '../../data/types';

export interface InteractionProps {
  machineId: MachineId;
  active: boolean; // true mientras su tramo de scroll está en pantalla
  reducedMotion: boolean;
  express?: boolean;
  onComplete: (result: { score?: number; detail?: string }) => void;
  onSkip: () => void;
}
