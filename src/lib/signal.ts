export const MAX_SIGNAL_MS = 3000;
export interface SignalPlayback {
  durationMs: number;
  compression: number;
  realTime: boolean;
}

/** Duración mostrada del pulso: tiempo real si dura 3 s o menos; si no, 3 s con insignia ×N (Parte 14.4). */
export function signalPlayback(realSeconds: number): SignalPlayback {
  const realMs = realSeconds * 1000;
  if (realMs <= MAX_SIGNAL_MS) return { durationMs: realMs, compression: 1, realTime: true };
  return {
    durationMs: MAX_SIGNAL_MS,
    compression: Math.round(realMs / MAX_SIGNAL_MS),
    realTime: false,
  };
}
