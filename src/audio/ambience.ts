import { AudioEngine } from './AudioEngine';
import { brown, whiteNoise } from './sfx';

export type AmbienceKind = 'earth' | 'moon' | 'mars' | 'small' | 'deep';

interface Layer {
  gain: GainNode;
  nodes: AudioNode[];
  sources: (AudioScheduledSourceNode | null)[];
  timers: number[];
}

const FADE_S = 2.5;
let current: { kind: AmbienceKind; layer: Layer } | null = null;

function lfo(
  ctx: AudioContext,
  rate: number,
  depth: number,
  target: AudioParam,
  nodes: AudioNode[],
  sources: AudioScheduledSourceNode[],
): void {
  const o = ctx.createOscillator();
  o.frequency.value = rate;
  const g = ctx.createGain();
  g.gain.value = depth;
  o.connect(g).connect(target);
  o.start();
  nodes.push(o, g);
  sources.push(o);
}

/** Recetas generativas por acto (Parte 15.4). En calidad baja se usa la mitad de osciladores. */
function build(ctx: AudioContext, kind: AmbienceKind, low: boolean): Layer {
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  gain.connect(AudioEngine.out('ambience'));
  const nodes: AudioNode[] = [gain];
  const sources: AudioScheduledSourceNode[] = [];
  const timers: number[] = [];
  const sine = (
    f: number,
    level: number,
    type: OscillatorType = 'sine',
    dest: AudioNode = gain,
  ) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = level;
    o.connect(g).connect(dest);
    o.start();
    nodes.push(o, g);
    sources.push(o);
    return g;
  };
  const noise = (buf: AudioBuffer, filter: BiquadFilterType, freq: number, level: number) => {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = level;
    src.connect(f).connect(g).connect(gain);
    src.start();
    nodes.push(src, f, g);
    sources.push(src);
    return { f, g };
  };

  switch (kind) {
    case 'earth': {
      // La menor con novena en senos, con crecidas lentas cada 12 s.
      const chord = low ? [220, 329.63] : [220, 261.63, 329.63, 493.88];
      chord.forEach((f) => {
        const g = sine(f, 0.05);
        lfo(ctx, 1 / 12, 0.03, g.gain, nodes, sources);
      });
      break;
    }
    case 'moon': {
      sine(55, 0.05);
      const n = noise(whiteNoise(ctx), 'lowpass', 500, 0.02);
      lfo(ctx, 0.05, 250, n.f.frequency, nodes, sources);
      // Crujidos de radio esporádicos (media de uno cada 3 s) en paso banda de 2 kHz.
      const crackle = () => {
        const t = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = whiteNoise(ctx);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 2000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        src.connect(bp).connect(g).connect(gain);
        src.start(t);
        src.stop(t + 0.15);
        src.onended = () => [src, bp, g].forEach((x) => x.disconnect());
        timers.push(window.setTimeout(crackle, 1000 + Math.random() * 4000));
      };
      timers.push(window.setTimeout(crackle, 1500));
      break;
    }
    case 'mars': {
      // Viento lejano: ruido marrón con paso banda de 300–600 Hz y ráfagas; dron de 49 Hz.
      const n = noise(brown(ctx), 'bandpass', 450, 0.35);
      n.f.Q.value = 0.7;
      lfo(ctx, 0.17, 150, n.f.frequency, nodes, sources);
      lfo(ctx, 0.11, 0.15, n.g.gain, nodes, sources);
      if (!low) sine(49, 0.04);
      break;
    }
    case 'small': {
      sine(220, 0.035);
      sine(221.5, 0.035);
      const scale = [523.25, 587.33, 659.25, 783.99, 880];
      const note = () => {
        const t = ctx.currentTime;
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = scale[Math.floor(Math.random() * scale.length)] ?? 659.25;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.04, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        o.connect(g).connect(gain);
        o.start(t);
        o.stop(t + 1.5);
        o.onended = () => [o, g].forEach((x) => x.disconnect());
        timers.push(window.setTimeout(note, 1200 + Math.random() * (low ? 4000 : 2000)));
      };
      timers.push(window.setTimeout(note, 800));
      break;
    }
    case 'deep': {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 800;
      lp.connect(gain);
      nodes.push(lp);
      (low ? [55] : [55, 55.4, 54.7]).forEach((f) => sine(f, 0.03, 'sawtooth', lp));
      // Tono portador tenue que aparece y desaparece.
      const carrier = sine(1400, 0.0);
      lfo(ctx, 0.07, 0.008, carrier.gain, nodes, sources);
      break;
    }
  }
  return { gain, nodes, sources, timers };
}

function release(layer: Layer, ctx: AudioContext): void {
  const t = ctx.currentTime;
  const g = layer.gain.gain;
  try {
    g.cancelAndHoldAtTime(t);
  } catch {
    g.cancelScheduledValues(t);
  }
  // Salida suave en la misma ventana de 2,5 s que la entrada (cruce de potencia aproximadamente constante).
  g.setTargetAtTime(0.0001, t + 0.01, FADE_S / 3);
  layer.timers.forEach((x) => window.clearTimeout(x));
  window.setTimeout(
    () => {
      layer.sources.forEach((s) => {
        try {
          s?.stop();
        } catch {
          /* ya detenido */
        }
      });
      layer.nodes.forEach((n) => n.disconnect());
    },
    FADE_S * 1000 + 200,
  );
}

/** Cambia el ambiente con un fundido cruzado de 2,5 s. `null` lo apaga. */
export function setAmbience(kind: AmbienceKind | null, low = false): void {
  const ctx = AudioEngine.context;
  if (!ctx) {
    if (current) current = null;
    return;
  }
  if (current?.kind === kind) return;
  if (current) release(current.layer, ctx);
  current = null;
  if (!kind) return;
  const layer = build(ctx, kind, low);
  const t = ctx.currentTime;
  layer.gain.gain.setValueCurveAtTime(
    Float32Array.from({ length: 16 }, (_, i) =>
      Math.max(0.0001, Math.sin(((i / 15) * Math.PI) / 2)),
    ),
    t,
    FADE_S,
  );
  current = { kind, layer };
}

export function stopAmbience(): void {
  setAmbience(null);
}
