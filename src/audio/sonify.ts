import { AudioEngine } from './AudioEngine';
import type { SoundFn } from './scope';
import { brown, whiteNoise } from './sfx';

export interface ToneHandle {
  setFreq: (hz: number) => void;
  setLevel: (level: number) => void;
  stop: () => void;
}

const NOOP: ToneHandle = {
  setFreq: () => undefined,
  setLevel: () => undefined,
  stop: () => undefined,
};

/**
 * Tono sostenido para sonificaciones (Parte 15.5): curva de luz de Kepler (660 Hz que baja con cada caída),
 * rotor de Ingenuity (diente de sierra filtrado que sigue las rpm). Devuelve un manejador no-op sin sonido.
 */
export function createTone(
  type: OscillatorType = 'sine',
  freq = 660,
  level = 0.08,
  lowpass?: number,
): ToneHandle {
  const ctx = AudioEngine.context;
  if (!ctx || !AudioEngine.acquireVoice()) return NOOP;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), t + 0.2);
  let head: AudioNode = o;
  let lp: BiquadFilterNode | null = null;
  if (lowpass) {
    lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = lowpass;
    o.connect(lp);
    head = lp;
  }
  head.connect(g).connect(AudioEngine.out('sfx'));
  o.start(t);
  let stopped = false;
  return {
    setFreq: (hz) => {
      if (!stopped) o.frequency.setTargetAtTime(Math.max(20, hz), ctx.currentTime, 0.05);
    },
    setLevel: (l) => {
      if (!stopped) g.gain.setTargetAtTime(Math.max(0.0001, l), ctx.currentTime, 0.08);
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      const now = ctx.currentTime;
      g.gain.setTargetAtTime(0.0001, now, 0.05);
      o.stop(now + 0.3);
      window.setTimeout(() => {
        [o, g, lp].forEach((n) => n?.disconnect());
        AudioEngine.releaseVoice();
      }, 400);
    },
  };
}

/** Siseo del motor iónico de Dawn: ruido con paso alto en 3 kHz, muy suave, mientras el motor está encendido. */
export function createHiss(level = 0.03): ToneHandle {
  const ctx = AudioEngine.context;
  if (!ctx || !AudioEngine.acquireVoice()) return NOOP;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = whiteNoise(ctx);
  src.loop = true;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 3000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + 0.4);
  src.connect(hp).connect(g).connect(AudioEngine.out('sfx'));
  src.start(t);
  let stopped = false;
  return {
    setFreq: () => undefined,
    setLevel: (l) => {
      if (!stopped) g.gain.setTargetAtTime(Math.max(0.0001, l), ctx.currentTime, 0.1);
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1);
      src.stop(ctx.currentTime + 0.5);
      window.setTimeout(() => {
        [src, hp, g].forEach((n) => n.disconnect());
        AudioEngine.releaseVoice();
      }, 600);
    },
  };
}

/*
 * Bucles para `api.sound.loop` (corrección B). Suenan solo mientras exista en pantalla lo que los
 * justifica; el mango que devuelve el alcance los para y ajusta sus parámetros.
 */

/** Tono sostenido; parámetros `freq` y `level`. */
export const toneLoop: SoundFn<[OscillatorType, number, number, number?]> = (
  ctx,
  out,
  type,
  freq,
  level,
  lowpass,
) => {
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), t + 0.2);
  const nodes: AudioNode[] = [o, g];
  if (lowpass) {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = lowpass;
    o.connect(lp).connect(g);
    nodes.push(lp);
  } else {
    o.connect(g);
  }
  g.connect(out);
  o.start(t);
  return { sources: [o], nodes, params: { freq: o.frequency, level: g.gain } };
};

/** Ruido filtrado sostenido; parámetro `level`. */
function noiseLoop(
  ctx: AudioContext,
  out: AudioNode,
  buffer: AudioBuffer,
  type: BiquadFilterType,
  cutoff: number,
  level: number,
) {
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = cutoff;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), t + 0.25);
  src.connect(f).connect(g).connect(out);
  src.start(t);
  return { sources: [src], nodes: [src, f, g], params: { level: g.gain } };
}

/** Siseo del motor iónico de Dawn: ruido con paso alto en 3 kHz, muy suave. */
export const hissLoop: SoundFn<[number?]> = (ctx, out, level = 0.03) =>
  noiseLoop(ctx, out, whiteNoise(ctx), 'highpass', 3000, level);

/** Propulsores de NEAR: retumbo grave mientras se mantiene el botón. */
export const thrusterLoop: SoundFn<[number?]> = (ctx, out, level = 0.12) =>
  noiseLoop(ctx, out, brown(ctx), 'lowpass', 420, level);
