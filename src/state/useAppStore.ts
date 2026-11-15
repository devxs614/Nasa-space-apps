import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import i18n, { detectedLocale } from '../i18n';
import { MACHINE_IDS } from '../data/ids';
import type { Locale, MachineId } from '../data/types';
import { safeStorage } from '../lib/storage';
import { prefersReducedMotion } from '../lib/device';

export type { Locale };
export type Quality = 'low' | 'medium' | 'high';
export type TextScale = 1 | 1.15 | 1.3;
export interface ChapterProgress {
  visited: boolean;
  signalSent: boolean;
  completed: boolean;
  bestQuiz: number;
}

export interface Settings {
  locale: Locale;
  quality: Quality;
  autoQuality: boolean;
  reducedMotion: boolean; // inicia con prefers-reduced-motion; el usuario puede cambiarlo
  soundOn: boolean; // falso por defecto: nunca sonar sin un gesto del usuario
  narrationOn: boolean;
  textScale: TextScale;
  highContrast: boolean;
  legibleFont: boolean; // todo en Atkinson Hyperlegible
  classroomMode: boolean;
  proMode: boolean; // abre los paneles Modo Pro por defecto
  liteMode: boolean; // modo ligero (Parte 17.8)
  liteDecided: boolean; // el visitante ya eligió (o rechazó) el modo ligero; ver DECISIONS.md
  instantSignal: boolean; // "Pulsar en lugar de mantener" (Parte 14.2)
  hotkeysOn: boolean; // atajos de teclado activados (Parte 8.6)
}

export interface AppState extends Settings {
  progress: Record<MachineId, ChapterProgress>;
  patches: MachineId[];
  patchDates: Partial<Record<MachineId, string>>;
  postcard: { message: string; createdAt: string } | null;
  setLocale: (l: Locale) => void;
  setQuality: (q: Quality, auto?: boolean) => void;
  setLiteMode: (on: boolean) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markVisited: (id: MachineId) => void;
  markSignalSent: (id: MachineId) => void;
  completeChapter: (id: MachineId) => void;
  saveQuiz: (id: MachineId, score: number) => void;
  savePostcard: (message: string) => void;
  resetProgress: () => void;
}

const emptyProgress = (): Record<MachineId, ChapterProgress> =>
  Object.fromEntries(
    MACHINE_IDS.map((id) => [
      id,
      { visited: false, signalSent: false, completed: false, bestQuiz: 0 },
    ]),
  ) as Record<MachineId, ChapterProgress>;

const reduced = prefersReducedMotion();

export const defaultSettings = (): Settings => ({
  locale: detectedLocale(),
  quality: 'medium',
  autoQuality: true,
  reducedMotion: reduced,
  soundOn: false,
  narrationOn: false,
  textScale: 1,
  highContrast: false,
  legibleFont: false,
  classroomMode: false,
  proMode: false,
  liteMode: false,
  liteDecided: false,
  instantSignal: reduced,
  hotkeysOn: true,
});

function patchProgress(
  s: AppState,
  id: MachineId,
  patch: Partial<ChapterProgress>,
): Pick<AppState, 'progress'> {
  const prev = s.progress[id] ?? {
    visited: false,
    signalSent: false,
    completed: false,
    bestQuiz: 0,
  };
  return { progress: { ...s.progress, [id]: { ...prev, ...patch } } };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...defaultSettings(),
      progress: emptyProgress(),
      patches: [],
      patchDates: {},
      postcard: null,
      setLocale: (l) => {
        void i18n.changeLanguage(l);
        set({ locale: l });
      },
      setQuality: (q, auto = false) => set({ quality: q, autoQuality: auto }),
      setLiteMode: (on) => set({ liteMode: on, liteDecided: true }),
      updateSettings: (patch) => {
        if (patch.locale) void i18n.changeLanguage(patch.locale);
        set(patch);
      },
      markVisited: (id) => {
        if (get().progress[id]?.visited) return;
        set((s) => patchProgress(s, id, { visited: true }));
      },
      markSignalSent: (id) => set((s) => patchProgress(s, id, { visited: true, signalSent: true })),
      completeChapter: (id) =>
        set((s) => ({
          ...patchProgress(s, id, { visited: true, completed: true }),
          patches: s.patches.includes(id) ? s.patches : [...s.patches, id],
          patchDates: s.patchDates[id]
            ? s.patchDates
            : { ...s.patchDates, [id]: new Date().toISOString() },
        })),
      saveQuiz: (id, score) =>
        set((s) =>
          patchProgress(s, id, {
            bestQuiz: Math.max(s.progress[id]?.bestQuiz ?? 0, Math.min(3, score)),
          }),
        ),
      savePostcard: (message) =>
        set({ postcard: { message, createdAt: new Date().toISOString() } }),
      resetProgress: () =>
        set({ progress: emptyProgress(), patches: [], patchDates: {}, postcard: null }),
    }),
    {
      name: 'ultima-senal:app',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          progress: { ...emptyProgress(), ...(p.progress ?? {}) },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state && state.locale !== i18n.resolvedLanguage) void i18n.changeLanguage(state.locale);
      },
    },
  ),
);
