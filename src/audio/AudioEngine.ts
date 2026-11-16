import { readJSON, writeJSON } from '../lib/storage';

export type Bus = 'ambience' | 'sfx' | 'voice';
export const LEVELS: Record<Bus, number> = { ambience: 0.25, sfx: 0.5, voice: 1 };
export interface AudioPrefs {
  ambience: number;
  sfx: number;
  voice: number;
  narrationRate: 0.8 | 1 | 1.2;
}
const PREFS_KEY = 'ultima-senal:audio';
export const defaultAudioPrefs: AudioPrefs = { ambience: 1, sfx: 1, voice: 1, narrationRate: 1 };

export function loadAudioPrefs(): AudioPrefs {
  return { ...defaultAudioPrefs, ...readJSON<Partial<AudioPrefs>>(PREFS_KEY, {}) };
}
export function saveAudioPrefs(p: AudioPrefs): void {
  writeJSON(PREFS_KEY, p);
}

class AudioEngineImpl {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buses = new Map<Bus, GainNode>();
  private enabled = false;
  private ducked = false;
  private voices = 0;
  private prefs: AudioPrefs = defaultAudioPrefs;
  readonly maxVoices = 8;

  get ready(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  /** Llamar solo desde un gesto del visitante. */
  async init(): Promise<boolean> {
    if (this.ctx) {
      await this.ctx.resume();
      return true;
    }
    if (typeof AudioContext === 'undefined') return false;
    this.prefs = loadAudioPrefs();
    const ctx = new AudioContext({ latencyHint: 'interactive' });
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(comp).connect(ctx.destination);
    (Object.keys(LEVELS) as Bus[]).forEach((bus) => {
      const g = ctx.createGain();
      g.gain.value = LEVELS[bus] * this.prefs[bus];
      g.connect(master);
      this.buses.set(bus, g);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) void ctx.suspend();
      else if (this.enabled) void ctx.resume();
    });
    this.ctx = ctx;
    this.master = master;
    await ctx.resume().catch(() => undefined);
    return true;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 0.8 : 0, t, 0.05); // sin clics; < 300 ms
    if (on) void this.ctx.resume();
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  setPrefs(p: AudioPrefs): void {
    this.prefs = p;
    saveAudioPrefs(p);
    (Object.keys(LEVELS) as Bus[]).forEach((bus) => {
      const level = bus === 'ambience' && this.ducked ? 0.06 * p.ambience : LEVELS[bus] * p[bus];
      this.setBusLevel(bus, level);
    });
  }

  get audioPrefs(): AudioPrefs {
    return this.prefs;
  }

  setBusLevel(bus: Bus, level: number): void {
    const g = this.buses.get(bus);
    if (this.ctx && g) g.gain.setTargetAtTime(level, this.ctx.currentTime, 0.1);
  }

  /** Baja el ambiente mientras habla la narración o durante "La última señal". */
  duck(on: boolean, depth = 0.1): void {
    this.ducked = on;
    this.setBusLevel(
      'ambience',
      on ? depth * this.prefs.ambience : LEVELS.ambience * this.prefs.ambience,
    );
  }

  get context(): AudioContext | null {
    return this.enabled ? this.ctx : null;
  }
  /** El contexto aunque el sonido esté apagado: para detener lo que ya suena. */
  get rawContext(): AudioContext | null {
    return this.ctx;
  }
  out(bus: Bus): GainNode {
    const g = this.buses.get(bus);
    if (!g) throw new Error(`AudioEngine: bus ${bus} sin inicializar`);
    return g;
  }
  acquireVoice(): boolean {
    if (this.voices >= this.maxVoices) return false;
    this.voices += 1;
    return true;
  }
  releaseVoice(): void {
    this.voices = Math.max(0, this.voices - 1);
  }
}

export const AudioEngine = new AudioEngineImpl();
