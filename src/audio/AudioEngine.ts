import { readJSON, writeJSON } from '../lib/storage';

export type Bus = 'music' | 'ambience' | 'sfx' | 'voice';
/** Nivel de cada canal con su barra al 100 %. Con los valores iniciales: música 0,35, ambiente 0,24, efectos 0,49. */
export const LEVELS: Record<Bus, number> = { music: 0.7, ambience: 0.6, sfx: 0.7, voice: 1 };
export interface AudioPrefs {
  /** Versión del formato guardado: la 1 no tenía música ni volumen general. */
  v: 2;
  musicOn: boolean;
  master: number;
  music: number;
  ambience: number;
  sfx: number;
  voice: number;
  narrationRate: 0.8 | 1 | 1.2;
  /** El mezclador ya se abrió solo una vez al activar el sonido. */
  mixerSeen: boolean;
}
const PREFS_KEY = 'ultima-senal:audio';
/** Valores iniciales del mezclador (corrección L): General 80, Música 50, Ambiente 40, Efectos 70, Voz 100. */
export const defaultAudioPrefs: AudioPrefs = {
  v: 2,
  musicOn: true,
  master: 0.8,
  music: 0.5,
  ambience: 0.4,
  sfx: 0.7,
  voice: 1,
  narrationRate: 1,
  mixerSeen: false,
};
/** Mientras habla la narración, la música baja a este nivel y vuelve al terminar. */
const MUSIC_DUCK = 0.45;

export function loadAudioPrefs(): AudioPrefs {
  const saved = readJSON<Partial<AudioPrefs>>(PREFS_KEY, {});
  // Las barras de la versión anterior tenían otra escala: solo se conserva la velocidad de la voz.
  if (saved.v !== 2) {
    return { ...defaultAudioPrefs, narrationRate: saved.narrationRate ?? 1 };
  }
  return { ...defaultAudioPrefs, ...saved };
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
  private talking = false;
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
      g.gain.value = this.levelOf(bus);
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
    this.master.gain.setTargetAtTime(on ? this.prefs.master : 0, t, 0.05); // sin clics; < 300 ms
    if (on) void this.ctx.resume();
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  setPrefs(p: AudioPrefs): void {
    this.prefs = p;
    saveAudioPrefs(p);
    (Object.keys(LEVELS) as Bus[]).forEach((bus) => this.setBusLevel(bus, this.levelOf(bus)));
    if (this.ctx && this.master && this.enabled) {
      this.master.gain.setTargetAtTime(p.master, this.ctx.currentTime, 0.05);
    }
  }

  /** Nivel actual de un canal: su barra, el interruptor de música y los atenuados en curso. */
  private levelOf(bus: Bus): number {
    const p = this.prefs;
    if (bus === 'music')
      return p.musicOn ? LEVELS.music * p.music * (this.talking ? MUSIC_DUCK : 1) : 0;
    if (bus === 'ambience' && this.ducked) return this.duckDepth * p.ambience;
    return LEVELS[bus] * p[bus];
  }
  private duckDepth = 0.1;

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
    this.duckDepth = depth;
    this.setBusLevel('ambience', this.levelOf('ambience'));
  }

  /** Mientras habla LUMI, la música baja al 45 % y vuelve en 1,5 s al terminar (corrección L). */
  setTalking(on: boolean): void {
    if (this.talking === on) return;
    this.talking = on;
    const g = this.buses.get('music');
    if (this.ctx && g)
      g.gain.setTargetAtTime(this.levelOf('music'), this.ctx.currentTime, on ? 0.15 : 0.5);
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
