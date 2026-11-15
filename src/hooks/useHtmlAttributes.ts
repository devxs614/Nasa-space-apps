import { useEffect } from 'react';
import { useAppStore } from '../state/useAppStore';
import { useJourneyStore } from '../state/useJourneyStore';
import { WORLD_OF } from '../data/ids';
import { isCoarsePointer } from '../lib/device';

/** AppShell escribe en <html> los atributos de ajustes y en <body> el acto (Parte 16.1). */
export function useHtmlAttributes(): void {
  const highContrast = useAppStore((s) => s.highContrast);
  const legible = useAppStore((s) => s.legibleFont);
  const reduced = useAppStore((s) => s.reducedMotion);
  const textScale = useAppStore((s) => s.textScale);
  const quality = useAppStore((s) => s.quality);
  const classroom = useAppStore((s) => s.classroomMode);
  const paused = useJourneyStore((s) => s.paused);
  const chapterId = useJourneyStore((s) => s.chapterId);
  const section = useJourneyStore((s) => s.section);

  useEffect(() => {
    const h = document.documentElement;
    h.dataset.contrast = highContrast ? 'high' : 'normal';
    h.dataset.legible = String(legible);
    h.dataset.reducedMotion = String(reduced);
    h.dataset.quality = quality;
    h.dataset.paused = String(paused);
    h.dataset.crosshair = String(!reduced && !isCoarsePointer());
    // Modo Aula: texto un 20 % más grande como mínimo.
    const scale = classroom ? Math.max(1.2, textScale) : textScale;
    h.style.setProperty('--text-scale', String(scale));
  }, [highContrast, legible, reduced, textScale, quality, paused, classroom]);

  useEffect(() => {
    const act = chapterId
      ? WORLD_OF[chapterId]
      : section?.startsWith('act-')
        ? section.slice(4)
        : null;
    if (act) document.body.dataset.act = act;
    else delete document.body.dataset.act;
  }, [chapterId, section]);
}
