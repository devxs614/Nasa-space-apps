import { useEffect, type RefObject } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

import { scrollBridge } from '../lib/scrollBridge';

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

let refreshTimer: number | undefined;
/** Varios cambios de altura seguidos acaban en un solo recálculo, 150 ms después del último. */
export function requestScrollRefresh(): void {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
}

/**
 * Las mini-experiencias, las fotos y el quiz llegan o se abren después de crear los disparadores y
 * alargan la página: sin recalcular, los capítulos de más abajo se activaban antes de estar en
 * pantalla (el riel marcaba Pioneer con Kepler todavía a la vista).
 */
export function useScrollRefresh(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let height = el.offsetHeight;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      if (h === height) return; // los cambios de ancho ya los recalcula ScrollTrigger
      height = h;
      requestScrollRefresh();
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.clearTimeout(refreshTimer);
    };
  }, [ref]);
}
scrollBridge.setRefresh(refreshScroll);
