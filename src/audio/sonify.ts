import type { SoundFn } from './scope';
import { brown, whiteNoise } from './sfx';

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
