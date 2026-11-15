import type { MachineId } from '../../data/types';
import type { DemoDrive } from '../../state/useJourneyStore';

/** Duración total del Modo Demo: el máximo que admite Space Apps para el vídeo (Parte 3.3). */
export const DEMO_TOTAL_MS = 30_000;

export type DemoStepKey = 's1' | 's2' | 's3' | 's4' | 's5';
export interface DemoStep {
  key: DemoStepKey;
  from: number;
  to: number;
  /** Póster SVG que sustituye al 3D cuando no hay WebGL. */
  poster: string;
  machineId: MachineId | null;
}

/** Los cinco momentos estrella de la Parte 3.6, seis segundos cada uno. */
export const DEMO_STEPS: readonly DemoStep[] = [
  { key: 's1', from: 0, to: 6000, poster: 'scene-prologue', machineId: null },
  { key: 's2', from: 6000, to: 12_000, poster: 'apollo-lm', machineId: 'apollo-lm' },
  { key: 's3', from: 12_000, to: 18_000, poster: 'opportunity', machineId: 'opportunity' },
  { key: 's4', from: 18_000, to: 24_000, poster: 'ingenuity', machineId: 'ingenuity' },
  { key: 's5', from: 24_000, to: DEMO_TOTAL_MS, poster: 'pioneer', machineId: 'pioneer' },
];

/** Momento en que sale el pulso hacia la Luna dentro del paso 2. */
export const DEMO_SIGNAL_AT = 7400;

export type DemoSignalPhase = 'idle' | 'traveling' | 'arrived';
export interface DemoFrame extends DemoDrive {
  step: number;
  signal: DemoSignalPhase;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (ms: number, a: number, b: number) => clamp01((ms - a) / (b - a));

export function demoStepIndex(ms: number): number {
  const i = DEMO_STEPS.findIndex((s) => ms < s.to);
  return i === -1 ? DEMO_STEPS.length - 1 : i;
}

/**
 * Estado de la escena en el milisegundo `ms` de la demo. Función pura: el componente la
 * evalúa en cada fotograma y la escribe en el store con `demoDrive`.
 * `moonLightMs` es el tiempo de luz real Tierra–Luna, para que el pulso tarde lo mismo que la luz.
 */
export function demoFrame(ms: number, moonLightMs: number): DemoFrame {
  const t = Math.min(DEMO_TOTAL_MS, Math.max(0, ms));
  const step = demoStepIndex(t);
  const base = { beatProgress: 0, section: null, sectionProgress: 0, fx: {} } as const;
  if (step === 0)
    return {
      ...base,
      step,
      chapterId: null,
      beat: null,
      section: 'prologue',
      sectionProgress: 0.02 + 0.22 * seg(t, 0, 6000),
      signal: 'idle',
    };
  if (step === 1) {
    // Primer contacto: el pulso viaja a la Luna y la etapa de descenso del Eagle se enciende.
    const signal: DemoSignalPhase =
      t < DEMO_SIGNAL_AT ? 'idle' : t < DEMO_SIGNAL_AT + moonLightMs ? 'traveling' : 'arrived';
    const identityAt = DEMO_SIGNAL_AT + moonLightMs + 600;
    if (t < identityAt)
      return { ...base, step, chapterId: 'apollo-lm', beat: 'wake', beatProgress: 0.2, signal };
    return {
      ...base,
      step,
      chapterId: 'apollo-lm',
      beat: 'identity',
      beatProgress: seg(t, identityAt, 12_000),
      signal,
    };
  }
  if (step === 2) {
    // La última señal de Opportunity: la tormenta lo cubre todo.
    const p = 0.05 + 0.9 * seg(t, 12_400, 17_700);
    return {
      ...base,
      step,
      chapterId: 'opportunity',
      beat: 'lastSignal',
      beatProgress: p,
      fx: { storm: clamp01((p - 0.05) / 0.6) },
      signal: 'idle',
    };
  }
  if (step === 3) {
    // El vuelo de Ingenuity: los rotores aceleran y despega.
    const spin = seg(t, 18_400, 19_900);
    return {
      ...base,
      step,
      chapterId: 'ingenuity',
      beat: 'work',
      beatProgress: seg(t, 18_000, 24_000),
      fx: { fly: spin < 1 ? Math.round(spin * 30) / 50 : 1 },
      signal: 'idle',
    };
  }
  // La botella de Pioneer: la cámara se aleja hasta ver el sistema solar entero.
  if (t < 25_600) return { ...base, step, chapterId: 'pioneer', beat: 'identity', signal: 'idle' };
  return {
    ...base,
    step,
    chapterId: 'pioneer',
    beat: 'legacy',
    beatProgress: seg(t, 25_600, DEMO_TOTAL_MS),
    signal: 'idle',
  };
}
