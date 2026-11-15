import { useEffect, useRef } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';

/** Osciloscopio del HUD: pierde amplitud hasta quedar plano en "Última señal" (Parte 7.7). Decorativo. */
export function Oscilloscope({
  amplitude,
  color = 'var(--signal)',
  className,
}: {
  amplitude: () => number;
  color?: string;
  className?: string;
}) {
  const path = useRef<SVGPathElement>(null);
  useEffect(() => {
    let raf = 0;
    let t = 0;
    const draw = () => {
      const reduced = useAppStore.getState().reducedMotion;
      const paused = useJourneyStore.getState().paused;
      if (!reduced && !paused) t += 0.06;
      const a = Math.max(0, Math.min(1, amplitude()));
      let d = 'M0 20';
      for (let x = 0; x <= 200; x += 4) {
        const y =
          20 + Math.sin(x * 0.12 + t) * 14 * a * (0.6 + 0.4 * Math.sin(x * 0.031 + t * 0.3));
        d += ` L${x} ${y.toFixed(2)}`;
      }
      path.current?.setAttribute('d', d);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [amplitude]);
  return (
    <svg viewBox="0 0 200 40" className={className} aria-hidden="true" preserveAspectRatio="none">
      <path ref={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
