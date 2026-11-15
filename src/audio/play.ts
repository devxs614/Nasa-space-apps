import { useAppStore } from '../state/useAppStore';

type SfxName =
  | 'tick'
  | 'charge'
  | 'chargeStop'
  | 'send'
  | 'travel'
  | 'arrive'
  | 'flatline'
  | 'stitch'
  | 'right'
  | 'gentle'
  | 'thud'
  | 'laser'
  | 'drill'
  | 'quake';

/** Reproduce un efecto si el sonido está activado; el módulo de efectos se carga al primer uso (Parte 17.7). */
export function playSfx(name: SfxName, ...args: number[]): void {
  if (!useAppStore.getState().soundOn) return;
  void import('./sfx').then((m) => {
    const fn = (m as unknown as Record<string, (...a: number[]) => void>)[name];
    fn?.(...args);
  });
}
