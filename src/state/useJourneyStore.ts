import { create } from 'zustand';
import type { MachineId, SiteKind } from '../data/types';

export type SceneKey =
  | 'prologue'
  | 'moon-orbit'
  | 'moon-surface'
  | 'mars-orbit'
  | 'mars-surface'
  | 'eros'
  | 'vesta-ceres'
  | 'kepler'
  | 'outer-system'
  | 'epilogue'
  | 'atlas-moon'
  | 'atlas-mars'
  | 'showcase'
  | 'idle';
export type BeatId = 'wake' | 'identity' | 'journey' | 'arrival' | 'work' | 'lastSignal' | 'legacy';
export const BEATS: readonly BeatId[] = [
  'wake',
  'identity',
  'journey',
  'arrival',
  'work',
  'lastSignal',
  'legacy',
];

/** Secciones que no son capítulo: prólogo, portadas de acto y epílogo. */
export type SectionId =
  'prologue' | 'act-moon' | 'act-mars' | 'act-small-bodies' | 'act-deep-space' | 'epilogue';

export type SignalStatus = 'idle' | 'charging' | 'traveling' | 'arrived';
export type FxKey =
  'dust' | 'storm' | 'reveal' | 'fly' | 'dig' | 'ion' | 'laser' | 'quake' | 'liftoff';

export type AtlasCommandType = 'near-side' | 'reset' | 'zoom-in' | 'zoom-out';

export interface JourneyState {
  sceneKey: SceneKey;
  chapterId: MachineId | null;
  beat: BeatId | null;
  beatProgress: number; // 0 a 1 dentro del momento actual
  section: SectionId | null; // sección no-capítulo activa
  sectionProgress: number;
  globalProgress: number; // 0 a 1 de toda La Travesía
  canvasInteractive: boolean;
  signal: { status: SignalStatus; target: MachineId | null; etaMs: number; startedAt: number };
  showcaseId: MachineId | null; // máquina mostrada en el visor 3D del catálogo
  showcaseView: { yaw: number; zoom: number };
  atlasSiteId: string | null; // sitio enfocado en el atlas (ver DECISIONS.md)
  atlasHidden: SiteKind[]; // capas del atlas apagadas
  atlasDayNight: boolean; // "Ver día y noche" (Marte)
  atlasCommand: { type: AtlasCommandType; n: number } | null; // botones equivalentes al arrastre y al pellizco
  paused: boolean; // "Pausar animaciones" (Parte 17.4)
  express: boolean; // recorrido exprés (Parte 8.1)
  demo: boolean;
  fx: Partial<Record<FxKey, number>>; // valores que las interacciones pasan a la escena 3D
  plaqueDrawing: string | null; // dibujo de "Diseña tu propia placa" (Pioneer) para la postal
  setBeat: (chapterId: MachineId, beat: BeatId, progress: number) => void;
  setSection: (section: SectionId, progress: number) => void;
  setScene: (key: SceneKey) => void;
  setPaused: (p: boolean) => void;
  setSignal: (s: Partial<JourneyState['signal']>) => void;
  setGlobalProgress: (p: number) => void;
  setCanvasInteractive: (on: boolean) => void;
  setShowcase: (id: MachineId | null) => void;
  setShowcaseView: (v: Partial<JourneyState['showcaseView']>) => void;
  setAtlasSite: (id: string | null) => void;
  toggleAtlasKind: (kind: SiteKind) => void;
  setAtlasDayNight: (on: boolean) => void;
  sendAtlasCommand: (type: AtlasCommandType) => void;
  resetAtlas: () => void;
  setExpress: (on: boolean) => void;
  setDemo: (on: boolean) => void;
  setFx: (key: FxKey, value: number) => void;
  clearFx: () => void;
  setPlaqueDrawing: (d: string | null) => void;
  /** El Modo Demo conduce la escena sin scroll; mientras dura, setBeat y setSection se ignoran. */
  demoDrive: (frame: DemoDrive) => void;
}

export type DemoDrive = Pick<
  JourneyState,
  'chapterId' | 'beat' | 'beatProgress' | 'section' | 'sectionProgress'
> & { fx: Partial<Record<FxKey, number>> };

const IDLE_SIGNAL: JourneyState['signal'] = {
  status: 'idle',
  target: null,
  etaMs: 0,
  startedAt: 0,
};
const sameFx = (a: Partial<Record<FxKey, number>>, b: Partial<Record<FxKey, number>>) => {
  const ka = Object.keys(a) as FxKey[];
  return ka.length === Object.keys(b).length && ka.every((k) => a[k] === b[k]);
};

export const useJourneyStore = create<JourneyState>()((set, get) => ({
  sceneKey: 'idle',
  chapterId: null,
  beat: null,
  beatProgress: 0,
  section: null,
  sectionProgress: 0,
  globalProgress: 0,
  canvasInteractive: false,
  signal: { ...IDLE_SIGNAL },
  showcaseId: null,
  showcaseView: { yaw: 0, zoom: 1 },
  atlasSiteId: null,
  atlasHidden: [],
  atlasDayNight: false,
  atlasCommand: null,
  paused: false,
  express: false,
  demo: false,
  fx: {},
  plaqueDrawing: null,
  setBeat: (chapterId, beat, progress) => {
    const s = get();
    if (s.demo) return;
    const p = Math.min(1, Math.max(0, progress));
    if (s.chapterId === chapterId && s.beat === beat && Math.abs(s.beatProgress - p) < 0.002)
      return;
    const changedChapter = s.chapterId !== chapterId;
    set({
      chapterId,
      beat,
      beatProgress: p,
      section: null,
      ...(changedChapter ? { signal: { ...IDLE_SIGNAL }, fx: {} } : {}),
    });
  },
  setSection: (section, progress) => {
    const s = get();
    if (s.demo) return;
    const p = Math.min(1, Math.max(0, progress));
    if (s.section === section && s.chapterId === null && Math.abs(s.sectionProgress - p) < 0.002)
      return;
    set({ section, sectionProgress: p, chapterId: null, beat: null, beatProgress: 0 });
  },
  setScene: (key) => {
    if (get().sceneKey !== key) set({ sceneKey: key });
  },
  setPaused: (p) => set({ paused: p }),
  setSignal: (sig) => set((s) => ({ signal: { ...s.signal, ...sig } })),
  setGlobalProgress: (p) => {
    if (Math.abs(get().globalProgress - p) > 0.001) set({ globalProgress: p });
  },
  setCanvasInteractive: (on) => {
    if (get().canvasInteractive !== on) set({ canvasInteractive: on });
  },
  setShowcase: (id) => set({ showcaseId: id, showcaseView: { yaw: 0, zoom: 1 } }),
  setShowcaseView: (v) => set((s) => ({ showcaseView: { ...s.showcaseView, ...v } })),
  setAtlasSite: (id) => set({ atlasSiteId: id }),
  toggleAtlasKind: (kind) =>
    set((s) => ({
      atlasHidden: s.atlasHidden.includes(kind)
        ? s.atlasHidden.filter((k) => k !== kind)
        : [...s.atlasHidden, kind],
    })),
  setAtlasDayNight: (on) => set({ atlasDayNight: on }),
  sendAtlasCommand: (type) =>
    set((s) => ({ atlasCommand: { type, n: (s.atlasCommand?.n ?? 0) + 1 } })),
  resetAtlas: () =>
    set({ atlasSiteId: null, atlasHidden: [], atlasDayNight: false, atlasCommand: null }),
  setExpress: (on) => set({ express: on }),
  setDemo: (on) => {
    if (get().demo === on) return;
    // Al salir, la escena vuelve al prólogo; el scroll la resincroniza después.
    set(
      on
        ? { demo: true }
        : {
            demo: false,
            chapterId: null,
            beat: null,
            beatProgress: 0,
            section: 'prologue',
            sectionProgress: 0,
            signal: { ...IDLE_SIGNAL },
            fx: {},
          },
    );
  },
  demoDrive: (f) => {
    const s = get();
    if (!s.demo) return;
    const changedChapter = s.chapterId !== f.chapterId;
    set({
      chapterId: f.chapterId,
      beat: f.beat,
      beatProgress: f.beatProgress,
      section: f.section,
      sectionProgress: f.sectionProgress,
      fx: sameFx(s.fx, f.fx) ? s.fx : f.fx,
      ...(changedChapter ? { signal: { ...IDLE_SIGNAL } } : {}),
    });
  },
  setFx: (key, value) => {
    if (get().fx[key] === value) return;
    set((s) => ({ fx: { ...s.fx, [key]: value } }));
  },
  clearFx: () => set({ fx: {} }),
  setPlaqueDrawing: (d) => set({ plaqueDrawing: d }),
}));
