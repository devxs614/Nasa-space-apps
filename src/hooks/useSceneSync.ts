import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useJourneyStore, type SceneKey } from '../state/useJourneyStore';
import { sceneForBeat, sceneForSection } from '../lib/scenes';

/** Decide la escena 3D según la ruta y, en La Travesía, según el momento activo (Partes 6.5 y 6.6). */
export function useSceneSync(): void {
  const { pathname } = useLocation();
  useEffect(() => {
    const route = pathname.replace(/\/$/, '') || '/';
    const fixed: SceneKey | null = route.startsWith('/atlas/luna')
      ? 'atlas-moon'
      : route.startsWith('/atlas/marte')
        ? 'atlas-mars'
        : route === '/' || /^\/maquinas\/[^/]+$/.test(route)
          ? null
          : 'idle';
    const js = useJourneyStore.getState();
    js.setCanvasInteractive(fixed === 'atlas-moon' || fixed === 'atlas-mars');
    if (fixed) {
      js.setScene(route === '/maquinas' && js.showcaseId ? 'showcase' : fixed);
      return;
    }
    const apply = (s: ReturnType<typeof useJourneyStore.getState>) => {
      if (s.chapterId && s.beat) s.setScene(sceneForBeat(s.chapterId, s.beat));
      else if (s.section) s.setScene(sceneForSection(s.section));
    };
    apply(js);
    return useJourneyStore.subscribe((s, prev) => {
      if (s.chapterId !== prev.chapterId || s.beat !== prev.beat || s.section !== prev.section)
        apply(s);
    });
  }, [pathname]);
}
