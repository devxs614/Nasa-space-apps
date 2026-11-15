import { useEffect, type RefObject } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

gsap.registerPlugin(ScrollTrigger);

/**
 * Progreso 0..1 de un tramo de scroll mientras su caja cruza la línea del 55 % de la pantalla.
 * Los tramos contiguos se relevan sin solaparse (Parte 8.13, sin `pin`: ver DECISIONS.md).
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (self.isActive) onProgress(self.progress);
      },
      onUpdate: (self) => {
        if (self.isActive) onProgress(self.progress);
      },
    });
    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onProgress es estable por diseño en los llamadores
  }, [ref, ...deps]);
}

/** Recalcula los disparadores cuando cambian las alturas (idioma, tamaño de texto, exprés). */
export function refreshScroll(): void {
  window.requestAnimationFrame(() => ScrollTrigger.refresh());
}
