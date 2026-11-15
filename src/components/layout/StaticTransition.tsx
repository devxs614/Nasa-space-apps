import { useEffect, useState } from 'react';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useAppStore } from '../../state/useAppStore';

/** Estática de señal de 300 ms al cambiar de escena; fundido a negro con movimiento reducido (Parte 7.6). */
export function StaticTransition() {
  const sceneKey = useJourneyStore((s) => s.sceneKey);
  const reduced = useAppStore((s) => s.reducedMotion);
  const [n, setN] = useState(0);
  useEffect(() => {
    setN((x) => x + 1);
  }, [sceneKey]);
  if (n <= 1) return null;
  return reduced ? (
    <div
      key={n}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[6] bg-void"
      style={{ animation: 'static-fade 300ms linear forwards' }}
    />
  ) : (
    <div key={n} aria-hidden="true" className="static-flash" />
  );
}
