import { AudioEngine } from '../AudioEngine';
import { createRng } from '../../lib/rng';
import { bass, organ, pad, piano, shimmer } from './instruments';
import { makeReverb } from './reverb';
import { THEMES, type Theme, type ThemeId } from './themes';

const TICK_MS = 25;
const AHEAD_S = 0.12;
const MAX_VOICES = 24;
const FADE_S = 4;

/**
 * Música original generada en el navegador (corrección L). No cita ni imita ninguna obra: los acordes
 * de cada acto están en `themes.ts` y la melodía se elige al azar entre los tonos del acorde y de su
 * escala, con huecos irregulares. Un planificador programa las notas con el reloj del audio; con la
 * música apagada o su barra en 0, el planificador se detiene.
 */
class MusicEngineImpl {
  private timer: number | undefined;
  private theme: ThemeId | null = null;
  private layer: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private nextChord = 0;
  private chord = 0;
  private intensity = 0.4;
  private target = 0.4;
  private lite = false;
  private voices = 0;
  private rng = createRng(20261115);

  get activeVoices(): number {
    return this.voices;
  }
  get running(): boolean {
    return this.timer !== undefined;
  }
  get currentTheme(): ThemeId | null {
    return this.theme;
  }

  /** Calidad baja o modo ligero: solo pad y piano, sin reverberación. */
  setLite(on: boolean): void {
    this.lite = on;
  }
  /** Intensidad según el momento del capítulo; la música llega a ella en unos 3 s. */
  setIntensity(v: number): void {
    this.target = Math.max(0, Math.min(1, v));
  }

  /** Cambia de tema con un fundido cruzado de potencia constante. `null` deja la música en silencio. */
  setTheme(id: ThemeId | null): void {
    if (id === this.theme) return;
    this.theme = id;
    const ctx = AudioEngine.context;
    if (ctx && this.layer) this.fade(ctx, this.layer, 0);
    this.layer = null;
    this.sync();
  }

  /** Arranca o detiene el planificador según el sonido, el interruptor de música y su barra. */
  sync(): void {
    const ctx = AudioEngine.context;
    const p = AudioEngine.audioPrefs;
    const wanted = Boolean(ctx && this.theme && p.musicOn && p.music > 0 && p.master > 0);
    if (!wanted) {
      this.stop();
      return;
    }
    if (this.timer !== undefined || !ctx) return;
    this.nextChord = ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  stop(): void {
    window.clearInterval(this.timer);
    this.timer = undefined;
    const ctx = AudioEngine.rawContext;
    if (ctx && this.layer) this.fade(ctx, this.layer, 0, 0.3);
    this.layer = null;
  }

  private fade(ctx: AudioContext, node: GainNode, to: number, seconds = FADE_S): void {
    const now = ctx.currentTime;
    const from = Math.max(0.0001, node.gain.value);
    // Curva de potencia constante: la suma de los dos temas no baja ni sube durante el cruce.
    const steps = 32;
    const curve = new Float32Array(steps);
    for (let i = 0; i < steps; i++) {
      const k = i / (steps - 1);
      curve[i] =
        to > from
          ? from + (to - from) * Math.sin((k * Math.PI) / 2)
          : to + (from - to) * Math.cos((k * Math.PI) / 2);
    }
    try {
      node.gain.cancelScheduledValues(now);
      node.gain.setValueCurveAtTime(curve, now, seconds);
    } catch {
      node.gain.setTargetAtTime(to, now, seconds / 4);
    }
    if (to === 0) window.setTimeout(() => node.disconnect(), (seconds + 6) * 1000);
  }

  private ensureLayer(ctx: AudioContext): GainNode {
    if (this.layer) return this.layer;
    const layer = ctx.createGain();
    layer.gain.value = 0.0001;
    const bus = AudioEngine.out('music');
    layer.connect(bus);
    if (!this.lite) {
      this.reverb ??= (() => {
        const r = makeReverb(ctx);
        const wet = ctx.createGain();
        wet.gain.value = 0.35;
        r.connect(wet).connect(bus);
        return r;
      })();
      layer.connect(this.reverb);
    }
    this.fade(ctx, layer, 1);
    this.layer = layer;
    return layer;
  }

  private tick(): void {
    const ctx = AudioEngine.context;
    const theme = this.theme ? THEMES[this.theme] : null;
    if (!ctx || !theme) {
      this.stop();
      return;
    }
    while (this.nextChord < ctx.currentTime + AHEAD_S) {
      this.intensity += (this.target - this.intensity) * 0.6;
      this.scheduleChord(ctx, theme, this.nextChord);
      this.nextChord += theme.chordSeconds;
      this.chord += 1;
    }
  }

  private note(
    play: typeof pad,
    ctx: AudioContext,
    out: AudioNode,
    note: number,
    at: number,
    seconds: number,
    level: number,
  ): void {
    if (this.voices >= MAX_VOICES) return;
    this.voices += 1;
    play(ctx, out, note, at, seconds, level, () => {
      this.voices = Math.max(0, this.voices - 1);
    });
  }

  private scheduleChord(ctx: AudioContext, theme: Theme, at: number): void {
    const out = this.ensureLayer(ctx);
    const notes = theme.chords[this.chord % theme.chords.length]!;
    const dur = theme.chordSeconds;
    const k = this.intensity;
    const full = !this.lite;
    const loud = 0.35 + 0.65 * k;
    // Pad: siempre, con las cuatro notas más graves del acorde.
    notes.slice(0, 4).forEach((n) => this.note(pad, ctx, out, n, at, dur, 0.05 * loud));
    if (full && k >= 0.45)
      notes.slice(1, 4).forEach((n) => this.note(organ, ctx, out, n + 12, at, dur, 0.022 * loud));
    if (full && k >= 0.65) this.note(bass, ctx, out, notes[0]!, at, dur, 0.09 * loud);
    if (full && k >= 0.8)
      notes.slice(-2).forEach((n) => this.note(shimmer, ctx, out, n, at, dur, 0.012 * loud));
    // Melodía de piano: de 1 a 4 notas por acorde, con huecos irregulares; nunca una figura fija.
    if (k >= 0.3) {
      const pool = [...notes.slice(2).map((n) => n + 12), ...theme.scale];
      const count = 1 + Math.floor(this.rng() * (1 + k * 3));
      let when = at + 0.4 + this.rng() * 1.5;
      for (let i = 0; i < count && when < at + dur - 0.5; i++) {
        const n = pool[Math.floor(this.rng() * pool.length)]!;
        this.note(piano, ctx, out, n, when, 2, 0.045 * loud);
        when += 0.9 + this.rng() * (dur / 2);
      }
    }
  }
}

export const MusicEngine = new MusicEngineImpl();

// Para las pruebas y el recorrido manual: tema actual, si el planificador corre y cuántas voces suenan.
if (typeof window !== 'undefined') {
  const debug = (window.__audioDebug ??= { activeLoops: () => 0 }) as typeof window.__audioDebug & {
    music?: () => { theme: string | null; running: boolean; voices: number };
  };
  debug.music = () => ({
    theme: MusicEngine.currentTheme,
    running: MusicEngine.running,
    voices: MusicEngine.activeVoices,
  });
}
