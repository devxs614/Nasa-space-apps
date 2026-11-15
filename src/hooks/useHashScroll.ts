import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** Desplaza al ancla de la URL (#ia, #creditos…) al cargar una página secundaria y le da el foco. */
export function useHashScroll(): void {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ block: 'start' });
      el.focus({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(t);
  }, [hash]);
}
