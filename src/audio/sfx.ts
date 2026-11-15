import { AudioEngine } from './AudioEngine';

/**
 * Efectos sintetizados con Web Audio (Parte 15.3). Cada uno crea sus nodos, los conecta al bus `sfx`,
 * programa envolventes con rampas (sin saltos de ganancia) y los desconecta al terminar.
 * Si ya suenan 8 voces, el efecto nuevo se descarta.
 */

let whiteBuffer: AudioBuffer | null = null;
let brownBuffer: AudioBuffer | null = null;

function white(ctx: AudioContext): AudioBuffer {
  if (whiteBuffer) return whiteBuffer;
  const len = ctx.sampleRate * 2;
  whiteBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = whiteBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return whiteBuffer;
}

/** Ruido marrón: ruido blanco integrado (graves, como un retumbo). */
export function brown(ctx: AudioContext): AudioBuffer {
  if (brownBuffer) return brownBuffer;
  const len = ctx.sampleRate * 4;
  brownBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = brownBuffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  return brownBuffer;
}
export { white as whiteNoise };

function envelope(g: GainNode, t: number, attack: number, peak: number, decay: number): void {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

/** Ejecuta un efecto con una voz reservada; libera la voz y desconecta los nodos al final. */
function voice(
  build: (ctx: AudioContext, t: number, out: GainNode) => { nodes: AudioNode[]; end: number },
): void {
  const ctx = AudioEngine.context;
  if (!ctx || !AudioEngine.acquireVoice()) return;
  const t = ctx.currentTime;
  const { nodes, end } = build(ctx, t, AudioEngine.out('sfx'));
  window.setTimeout(
    () => {
      nodes.forEach((n) => {
        try {
          n.disconnect();
        } catch {
          /* ya desconectado */
        }
      });
      AudioEngine.releaseVoice();
    },
    (end - t) * 1000 + 200,
  );
}

function osc(ctx: AudioContext, type: OscillatorType, freq: number): OscillatorNode {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  return o;
}

/** Clic en botones y pestañas: seno de 1,2 kHz, 30 ms. Nunca al pasar el ratón. */
export function tick(): void {
  voice((ctx, t, out) => {
    const o = osc(ctx, 'sine', 1200);
    const g = ctx.createGain();
    envelope(g, t, 0.003, 0.15, 0.03);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.05);
    return { nodes: [o, g], end: t + 0.05 };
  });
}

let charging: { o: OscillatorNode; g: GainNode } | null = null;
/** Mientras se mantiene "Enviar señal": seno que sube de 300 a 900 Hz en 1,2 s. */
export function charge(): void {
  const ctx = AudioEngine.context;
  if (!ctx || charging || !AudioEngine.acquireVoice()) return;
  const t = ctx.currentTime;
  const o = osc(ctx, 'sine', 300);
  o.frequency.exponentialRampToValueAtTime(900, t + 1.2);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.15);
  o.connect(g).connect(AudioEngine.out('sfx'));
  o.start(t);
  charging = { o, g };
  window.setTimeout(chargeStop, 1300);
}
/** Si se suelta, se apaga en 80 ms. */
export function chargeStop(): void {
  const ctx = AudioEngine.context;
  const c = charging;
  if (!c) return;
  charging = null;
  const t = ctx?.currentTime ?? 0;
  c.g.gain.cancelScheduledValues(t);
  c.g.gain.setTargetAtTime(0.0001, t, 0.03);
  c.o.stop(t + 0.1);
  window.setTimeout(() => {
    c.o.disconnect();
    c.g.disconnect();
    AudioEngine.releaseVoice();
  }, 200);
}

/** Envío de señal: un ping de 880 Hz con eco. */
export function send(freq = 880): void {
  chargeStop();
  voice((ctx, t, out) => {
    const o = osc(ctx, 'sine', freq);
    const g = ctx.createGain();
    envelope(g, t, 0.005, 0.4, 0.6);
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.25;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.3;
    o.connect(g).connect(out);
    g.connect(delay).connect(feedback).connect(delay);
    delay.connect(out);
    o.start(t);
    o.stop(t + 0.7);
    return { nodes: [o, g, delay, feedback], end: t + 2.2 };
  });
}

/** Viaje del pulso: ruido con paso banda que barre de 400 a 3.000 Hz durante la duración mostrada (máx. 3 s). */
export function travel(seconds = 3): void {
  const dur = Math.min(3, Math.max(0.3, seconds));
  voice((ctx, t, out) => {
    const src = ctx.createBufferSource();
    src.buffer = white(ctx);
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 6;
    band.frequency.setValueAtTime(400, t);
    band.frequency.exponentialRampToValueAtTime(3000, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.1);
    g.gain.setValueAtTime(0.08, t + dur - 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(band).connect(g).connect(out);
    src.start(t);
    src.stop(t + dur + 0.05);
    return { nodes: [src, band, g], end: t + dur + 0.05 };
  });
}

/** Estática de radio corta. */
export function staticBurst(seconds = 0.8, level = 0.25): void {
  voice((ctx, t, out) => {
    const src = ctx.createBufferSource();
    src.buffer = white(ctx);
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 2200;
    band.Q.value = 0.8;
    const g = ctx.createGain();
    envelope(g, t, 0.03, level, seconds);
    src.connect(band).connect(g).connect(out);
    src.start(t);
    src.stop(t + seconds + 0.1);
    return { nodes: [src, band, g], end: t + seconds + 0.1 };
  });
}

/** Respuesta archivada: estática que se aclara con un paso bajo descendente y dos notas suaves (mi y si). */
export function arrive(): void {
  voice((ctx, t, out) => {
    const src = ctx.createBufferSource();
    src.buffer = white(ctx);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(4000, t);
    lp.frequency.exponentialRampToValueAtTime(200, t + 0.5);
    const gn = ctx.createGain();
    envelope(gn, t, 0.02, 0.12, 0.5);
    src.connect(lp).connect(gn).connect(out);
    src.start(t);
    src.stop(t + 0.6);
    const notes = [659.25, 987.77].map((f, i) => {
      const o = osc(ctx, 'sine', f);
      const g = ctx.createGain();
      envelope(g, t + 0.45 + i * 0.22, 0.02, 0.18, 0.9);
      o.connect(g).connect(out);
      o.start(t + 0.45 + i * 0.22);
      o.stop(t + 1.8);
      return [o, g];
    });
    return { nodes: [src, lp, gn, ...notes.flat()], end: t + 1.9 };
  });
}

/** Línea plana: seno de 440 Hz muy bajo que se desvanece en 2 s. Nada de pitidos de hospital. */
export function flatline(): void {
  voice((ctx, t, out) => {
    const o = osc(ctx, 'sine', 440);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 2.3);
    return { nodes: [o, g], end: t + 2.3 };
  });
}

/** Bordado del parche: 8 clics de 2 ms cada 60 ms y un acorde cálido al final. */
export function stitch(): void {
  voice((ctx, t, out) => {
    const nodes: AudioNode[] = [];
    for (let i = 0; i < 8; i++) {
      const o = osc(ctx, 'square', 1800);
      const g = ctx.createGain();
      envelope(g, t + i * 0.06, 0.001, 0.05, 0.004);
      o.connect(g).connect(out);
      o.start(t + i * 0.06);
      o.stop(t + i * 0.06 + 0.01);
      nodes.push(o, g);
    }
    [261.63, 329.63, 392].forEach((f) => {
      const o = osc(ctx, 'triangle', f);
      const g = ctx.createGain();
      envelope(g, t + 0.5, 0.05, 0.08, 1.2);
      o.connect(g).connect(out);
      o.start(t + 0.5);
      o.stop(t + 1.8);
      nodes.push(o, g);
    });
    return { nodes, end: t + 1.9 };
  });
}

/** Quiz correcto: tercera mayor ascendente. */
export function right(): void {
  voice((ctx, t, out) => {
    const nodes: AudioNode[] = [];
    [523.25, 659.25].forEach((f, i) => {
      const o = osc(ctx, 'sine', f);
      const g = ctx.createGain();
      envelope(g, t + i * 0.12, 0.01, 0.16, 0.35);
      o.connect(g).connect(out);
      o.start(t + i * 0.12);
      o.stop(t + 0.7);
      nodes.push(o, g);
    });
    return { nodes, end: t + 0.7 };
  });
}

/** Quiz incorrecto: una sola nota grave y suave. Sin zumbidos de error. */
export function gentle(): void {
  voice((ctx, t, out) => {
    const o = osc(ctx, 'sine', 196);
    const g = ctx.createGain();
    envelope(g, t, 0.02, 0.12, 0.5);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.6);
    return { nodes: [o, g], end: t + 0.6 };
  });
}

/** Aterrizaje: seno de 60 Hz con caída rápida más un golpe de ruido paso bajo. Nunca fuerte. */
export function thud(): void {
  voice((ctx, t, out) => {
    const o = osc(ctx, 'sine', 60);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.4);
    const g = ctx.createGain();
    envelope(g, t, 0.005, 0.35, 0.45);
    const src = ctx.createBufferSource();
    src.buffer = white(ctx);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 180;
    const gn = ctx.createGain();
    envelope(gn, t, 0.005, 0.2, 0.25);
    o.connect(g).connect(out);
    src.connect(lp).connect(gn).connect(out);
    o.start(t);
    o.stop(t + 0.5);
    src.start(t);
    src.stop(t + 0.3);
    return { nodes: [o, g, src, lp, gn], end: t + 0.5 };
  });
}

/** Láser de ALSEP: blip de 2 kHz al disparar y de 1,6 kHz al volver, separados por el tiempo real (≈ 2,57 s). */
export function laser(roundTrip = 2.57): void {
  voice((ctx, t, out) => {
    const nodes: AudioNode[] = [];
    [
      [2000, 0],
      [1600, roundTrip],
    ].forEach(([f, at]) => {
      const o = osc(ctx, 'sine', f!);
      const g = ctx.createGain();
      envelope(g, t + at!, 0.002, 0.12, 0.04);
      o.connect(g).connect(out);
      o.start(t + at!);
      o.stop(t + at! + 0.06);
      nodes.push(o, g);
    });
    return { nodes, end: t + roundTrip + 0.1 };
  });
}

/** Zanjas de Surveyor y Phoenix: ráfagas de ruido paso bajo a 6 Hz. */
export function drill(seconds = 0.8): void {
  voice((ctx, t, out) => {
    const src = ctx.createBufferSource();
    src.buffer = white(ctx);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 700;
    const g = ctx.createGain();
    g.gain.value = 0;
    const lfo = osc(ctx, 'square', 6);
    const depth = ctx.createGain();
    depth.gain.value = 0.06;
    lfo.connect(depth).connect(g.gain);
    const master = ctx.createGain();
    envelope(master, t, 0.02, 1, seconds);
    src.connect(lp).connect(g).connect(master).connect(out);
    src.start(t);
    lfo.start(t);
    src.stop(t + seconds + 0.05);
    lfo.stop(t + seconds + 0.05);
    return { nodes: [src, lp, g, lfo, depth, master], end: t + seconds + 0.05 };
  });
}

/**
 * Sonificación ilustrativa de un sismo (Parte 15.5): ruido marrón con envolvente (ataque de 0,3 s y caída exponencial),
 * paso bajo de 300 Hz, más un seno que baja de 80 a 30 Hz. `amp` escala la amplitud (magnitud en InSight).
 */
export function quake(seconds = 12, amp = 1): void {
  const a = Math.max(0.1, Math.min(1, amp));
  voice((ctx, t, out) => {
    const src = ctx.createBufferSource();
    src.buffer = brown(ctx);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 300;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5 * a, t + 0.3);
    g.gain.setTargetAtTime(0.0001, t + 0.3, seconds / 4);
    const o = osc(ctx, 'sine', 80);
    o.frequency.exponentialRampToValueAtTime(30, t + seconds);
    const go = ctx.createGain();
    go.gain.setValueAtTime(0.0001, t);
    go.gain.exponentialRampToValueAtTime(0.25 * a, t + 0.3);
    go.gain.setTargetAtTime(0.0001, t + 0.3, seconds / 4);
    src.connect(lp).connect(g).connect(out);
    o.connect(go).connect(out);
    src.start(t);
    o.start(t);
    src.stop(t + seconds);
    o.stop(t + seconds);
    return { nodes: [src, lp, g, o, go], end: t + seconds };
  });
}
