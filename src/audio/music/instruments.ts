/*
 * Instrumentos de la música generativa (corrección L). Todo es síntesis: osciladores con una
 * envolvente suave. Cada nota se programa con el reloj del audio, se para sola y avisa al terminar.
 */
export const midiHz = (note: number) => 440 * Math.pow(2, (note - 69) / 12);

type Play = (
  ctx: BaseAudioContext,
  out: AudioNode,
  note: number,
  at: number,
  seconds: number,
  level: number,
  done: () => void,
) => void;

function voice(
  ctx: BaseAudioContext,
  out: AudioNode,
  at: number,
  attack: number,
  hold: number,
  release: number,
  level: number,
  done: () => void,
  build: (gain: GainNode) => OscillatorNode[],
): void {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(level, at + attack);
  gain.gain.setValueAtTime(level, at + attack + hold);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + release);
  gain.connect(out);
  const oscillators = build(gain);
  const end = at + attack + hold + release + 0.05;
  oscillators.forEach((o) => {
    o.start(at);
    o.stop(end);
  });
  oscillators[0]!.onended = () => {
    gain.disconnect();
    done();
  };
}
const osc = (ctx: BaseAudioContext, type: OscillatorType, hz: number, detune = 0) => {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = hz;
  o.detune.value = detune;
  return o;
};

/** Pad: dos dientes de sierra desafinados y un triángulo tras un paso bajo; ataque de 2,5 s y salida de 4 s. */
export const pad: Play = (ctx, out, note, at, seconds, level, done) =>
  voice(ctx, out, at, 2.5, Math.max(0.1, seconds - 2.5), 4, level, done, (gain) => {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    lp.connect(gain);
    const hz = midiHz(note);
    return [
      osc(ctx, 'sawtooth', hz, -7),
      osc(ctx, 'sawtooth', hz, 7),
      osc(ctx, 'triangle', hz),
    ].map((o, i) => {
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.5 : 0.25;
      o.connect(g).connect(lp);
      return o;
    });
  });

/** Órgano suave: senos aditivos con los armónicos 1, 2, 3, 4 y 6 a niveles bajos. */
export const organ: Play = (ctx, out, note, at, seconds, level, done) =>
  voice(ctx, out, at, 1.2, Math.max(0.1, seconds - 1.2), 2.5, level, done, (gain) =>
    [1, 2, 3, 4, 6].map((h, i) => {
      const o = osc(ctx, 'sine', midiHz(note) * h);
      const g = ctx.createGain();
      g.gain.value = [0.5, 0.22, 0.12, 0.08, 0.04][i]!;
      o.connect(g).connect(gain);
      return o;
    }),
  );

/** Piano lejano: triángulo más un seno una octava arriba, ataque inmediato y caída de 1,8 s. */
export const piano: Play = (ctx, out, note, at, _seconds, level, done) =>
  voice(ctx, out, at, 0.01, 0.02, 1.8, level, done, (gain) => {
    const a = osc(ctx, 'triangle', midiHz(note));
    const b = osc(ctx, 'sine', midiHz(note + 12));
    const g = ctx.createGain();
    g.gain.value = 0.3;
    a.connect(gain);
    b.connect(g).connect(gain);
    return [a, b];
  });

/** Grave: seno en la fundamental una octava abajo. */
export const bass: Play = (ctx, out, note, at, seconds, level, done) =>
  voice(ctx, out, at, 1.5, Math.max(0.1, seconds - 1.5), 3, level, done, (gain) => {
    const o = osc(ctx, 'sine', midiHz(note - 12));
    o.connect(gain);
    return [o];
  });

/** Brillo: seno dos octavas arriba con trémolo de 0,2 Hz. */
export const shimmer: Play = (ctx, out, note, at, seconds, level, done) =>
  voice(ctx, out, at, 3, Math.max(0.1, seconds - 3), 4, level, done, (gain) => {
    const o = osc(ctx, 'sine', midiHz(note + 24));
    const trem = ctx.createGain();
    trem.gain.value = 0.6;
    const lfo = osc(ctx, 'sine', 0.2);
    const depth = ctx.createGain();
    depth.gain.value = 0.4;
    lfo.connect(depth).connect(trem.gain);
    o.connect(trem).connect(gain);
    return [o, lfo];
  });
