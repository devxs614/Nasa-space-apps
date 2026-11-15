import { create } from 'zustand';
import type { MachineId } from '../data/types';

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
  setExpress: (on: boolean) => void;
  setDemo: (on: boolean) => void;
  setFx: (key: FxKey, value: number) => void;
  clearFx: () => void;
  setPlaqueDrawing: (d: string | null) => void;
}

export const useJourneyStore = create<JourneyState>()((set, get) => ({
  sceneKey: 'idle',
  chapterId: null,
  beat: null,
  beatProgress: 0,
  section: null,
  sectionProgress: 0,
  globalProgress: 0,
  canvasInteractive: false,
  signal: { status: 'idle', target: null, etaMs: 0, startedAt: 0 },
  showcaseId: null,
  showcaseView: { yaw: 0, zoom: 1 },
  atlasSiteId: null,
  paused: false,
  express: false,
  demo: false,
  fx: {},
  plaqueDrawing: null,
  setBeat: (chapterId, beat, progress) => {
    const s = get();
    const p = Math.min(1, Math.max(0, progress));
    if (s.chapterId === chapterId && s.beat === beat && Math.abs(s.beatProgress - p) < 0.002)
      return;
    const changedChapter = s.chapterId !== chapterId;
    set({
      chapterId,
      beat,
      beatProgress: p,
      section: null,
      ...(changedChapter
        ? { signal: { status: 'idle', target: null, etaMs: 0, startedAt: 0 }, fx: {} }
        : {}),
    });
  },
  setSection: (section, progress) => {
    const s = get();
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
  setExpress: (on) => set({ express: on }),
  setDemo: (on) => set({ demo: on }),
  setFx: (key, value) => {
    if (get().fx[key] === value) return;
    set((s) => ({ fx: { ...s.fx, [key]: value } }));
  },
  clearFx: () => set({ fx: {} }),
  setPlaqueDrawing: (d) => set({ plaqueDrawing: d }),
}));
