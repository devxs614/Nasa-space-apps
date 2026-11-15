import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollBridge } from '../lib/scrollBridge';

gsap.registerPlugin(ScrollTrigger);

let current: Lenis | null = null;
export function getLenis(): Lenis | null {
  return current;
}

/** Scroll inercial sincronizado con ScrollTrigger (Parte 8.13). Con movimiento reducido, scroll nativo. */
export function useLenis(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
    current = lenis;
    scrollBridge.setSmooth(lenis);
    lenis.on('scroll', () => ScrollTrigger.update());
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      current = null;
      scrollBridge.setSmooth(null);
    };
  }, [enabled]);
}

/** Desplaza a un elemento usando Lenis si está activo (respeta movimiento reducido). */
export function scrollToEl(el: Element, immediate = false): void {
  const lenis = current;
  if (lenis) lenis.scrollTo(el, { offset: 0, immediate, force: true });
  else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: 'start' });
}
