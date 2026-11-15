/**
 * Puente mínimo hacia el scroll de La Travesía. El scroll inercial (Lenis) y los disparadores
 * (GSAP ScrollTrigger) viven en el fragmento de La Travesía; lo que está en el paquete inicial,
 * como el Modo Demo, los maneja a través de este módulo sin importar esas librerías.
 */
interface SmoothScroll {
  stop: () => void;
  start: () => void;
}

let smooth: SmoothScroll | null = null;
let refresh: (() => void) | null = null;

export const scrollBridge = {
  /** `useLenis` registra aquí la instancia activa (o null al desmontarse). */
  setSmooth(instance: SmoothScroll | null): void {
    smooth = instance;
  },
  /** `useScrollProgress` registra aquí cómo recalcular los disparadores. */
  setRefresh(fn: (() => void) | null): void {
    refresh = fn;
  },
  /** Detiene el scroll inercial; sin él (movimiento reducido u otra ruta) no hace nada. */
  stop(): void {
    smooth?.stop();
  },
  start(): void {
    smooth?.start();
  },
  refresh(): void {
    refresh?.();
  },
};
