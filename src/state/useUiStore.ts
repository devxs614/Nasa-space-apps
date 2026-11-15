import { create } from 'zustand';

export type SettingsTab =
  'language' | 'motion' | 'visual' | 'sound' | 'experience' | 'progress' | 'data';

/** Estado efímero de la interfaz (diálogos abiertos). No se persiste. */
export interface UiState {
  settingsOpen: boolean;
  settingsTab: SettingsTab;
  indexOpen: boolean;
  helpOpen: boolean;
  liteBanner: boolean;
  liteAsk: boolean;
  noWebglBanner: boolean;
  threeFailed: boolean;
  contextLosses: number;
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  setIndexOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  setLiteBanner: (on: boolean) => void;
  setLiteAsk: (on: boolean) => void;
  setThreeFailed: (on: boolean) => void;
  registerContextLoss: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  settingsOpen: false,
  settingsTab: 'language',
  indexOpen: false,
  helpOpen: false,
  liteBanner: false,
  liteAsk: false,
  noWebglBanner: false,
  threeFailed: false,
  contextLosses: 0,
  openSettings: (tab) => set((s) => ({ settingsOpen: true, settingsTab: tab ?? s.settingsTab })),
  closeSettings: () => set({ settingsOpen: false }),
  setIndexOpen: (open) => set({ indexOpen: open }),
  setHelpOpen: (open) => set({ helpOpen: open }),
  setLiteBanner: (on) => set({ liteBanner: on }),
  setLiteAsk: (on) => set({ liteAsk: on }),
  setThreeFailed: (on) => set({ threeFailed: on }),
  registerContextLoss: () => set((s) => ({ contextLosses: s.contextLosses + 1 })),
}));
