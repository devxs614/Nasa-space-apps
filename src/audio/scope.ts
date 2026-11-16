import { AudioEngine } from './AudioEngine';

/** Lo que devuelve una función de sonido: sus fuentes, sus nodos y, si tiene final, su duración. */
export interface Voice {
  sources: AudioScheduledSourceNode[];
  nodes: AudioNode[];
  seconds?: number;
  /** Parámetros que un bucle deja ajustar mientras suena (frecuencia, nivel…). */
  params?: Record<string, AudioParam>;
}
export type SoundFn<A extends unknown[]> = (ctx: AudioContext, out: AudioNode, ...args: A) => Voice;
export interface LoopHandle {
  stop(fadeMs?: number): void;
  /** Mueve con suavidad un parámetro del bucle; no hace nada si ya paró. */
  set(param: string, value: number, timeConstant?: number): void;
  readonly playing: boolean;
}

/**
 * Todos los sonidos de un intento de una mini-experiencia (corrección B). El shell lo apaga al
 * reiniciar, terminar o salir de pantalla, así que ningún bucle puede quedar sonando.
 */
export interface SoundScope {
  /** Efecto corto: 1,5 s como mucho. */
  play<A extends unknown[]>(fn: SoundFn<A>, ...args: A): void;
  /** Sonido sostenido atado a algo visible. Si la voz tiene duración, se apaga sola al acabar. */
  loop<A extends unknown[]>(fn: SoundFn<A>, ...args: A): LoopHandle;
  stopAll(fadeMs?: number): void;
  /** Para solo los bucles: los efectos cortos del final (un golpe, un acierto) terminan de sonar. */
  stopLoops(fadeMs?: number): void;
  dispose(): void;
  /** Vuelve a dejarlo utilizable (React monta dos veces los efectos en desarrollo). */
  revive(): void;
  readonly activeLoops: number;
}

interface Entry {
  v: Voice;
  gain: GainNode;
  loop: boolean;
  stopped: boolean;
}

const SILENT: LoopHandle = {
  stop: () => undefined,
  set: () => undefined,
  playing: false,
};
const scopes = new Set<SoundScope>();

/** Bucles vivos en todos los alcances: debe ser 0 al terminar, reiniciar o salir de una actividad. */
export function activeLoops(): number {
  let n = 0;
  scopes.forEach((s) => (n += s.activeLoops));
  return n;
}

export function createScope(id: string): SoundScope {
  const live = new Set<Entry>();
  let disposed = false;

  const start = <A extends unknown[]>(fn: SoundFn<A>, args: A, loop: boolean): Entry | null => {
    const ctx = AudioEngine.context; // null si el sonido está apagado
    if (!ctx || disposed) return null;
    const gain = ctx.createGain();
    gain.connect(AudioEngine.out('sfx'));
    const entry: Entry = { v: fn(ctx, gain, ...args), gain, loop, stopped: false };
    live.add(entry);
    return entry;
  };
  const kill = (entry: Entry, fadeMs: number) => {
    if (entry.stopped) return;
    entry.stopped = true;
    live.delete(entry);
    const ctx = AudioEngine.rawContext; // el contexto aunque el sonido esté apagado
    const now = ctx?.currentTime ?? 0;
    const at = now + fadeMs / 1000;
    try {
      entry.gain.gain.setTargetAtTime(0, now, Math.max(0.005, fadeMs / 3000)); // sin clic
    } catch {
      /* contexto cerrado */
    }
    entry.v.sources.forEach((s) => {
      try {
        s.stop(at);
      } catch {
        /* ya parado */
      }
    });
    window.setTimeout(() => {
      [...entry.v.nodes, entry.gain].forEach((n) => {
        try {
          n.disconnect();
        } catch {
          /* ya desconectado */
        }
      });
    }, fadeMs + 80);
  };
  const stopAll = (fadeMs = 80) => [...live].forEach((e) => kill(e, fadeMs));
  const stopLoops = (fadeMs = 80) =>
    [...live].filter((e) => e.loop).forEach((e) => kill(e, fadeMs));

  const scope: SoundScope = {
    play(fn, ...args) {
      if (!AudioEngine.context || disposed || !AudioEngine.acquireVoice()) return;
      const entry = start(fn, args, false);
      if (!entry) {
        AudioEngine.releaseVoice();
        return;
      }
      const ms = Math.min(entry.v.seconds ?? 1.5, 1.5) * 1000 + 100;
      window.setTimeout(() => {
        kill(entry, 0);
        AudioEngine.releaseVoice();
      }, ms);
    },
    loop(fn, ...args) {
      const entry = start(fn, args, true);
      if (!entry) return SILENT;
      if (entry.v.seconds !== undefined) {
        window.setTimeout(() => kill(entry, 0), entry.v.seconds * 1000 + 100);
      }
      return {
        stop: (fadeMs = 80) => kill(entry, fadeMs),
        set: (param, value, timeConstant = 0.06) => {
          const p = entry.v.params?.[param];
          const ctx = AudioEngine.rawContext;
          if (p && ctx && !entry.stopped) p.setTargetAtTime(value, ctx.currentTime, timeConstant);
        },
        get playing() {
          return !entry.stopped;
        },
      };
    },
    stopAll,
    stopLoops,
    dispose() {
      stopAll(40);
      disposed = true;
      scopes.delete(scope);
    },
    revive() {
      disposed = false;
      scopes.add(scope);
    },
    get activeLoops() {
      let n = 0;
      live.forEach((e) => (n += e.loop ? 1 : 0));
      return n;
    },
  };
  scopes.add(scope);
  void id; // el nombre solo sirve para depurar
  return scope;
}

declare global {
  interface Window {
    __audioDebug?: { activeLoops: () => number };
  }
}
// Las pruebas e2e comprueban con esto que no queda ningún bucle sonando.
if (typeof window !== 'undefined') window.__audioDebug = { ...window.__audioDebug, activeLoops };
