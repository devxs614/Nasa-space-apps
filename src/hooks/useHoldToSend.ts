import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

/** Mantener pulsado 1,2 s envía; soltar antes cancela. Teclado: Enter o Espacio envían al instante (Parte 14.2). */
export function useHoldToSend(
  onSend: () => void,
  opts: { holdMs?: number; instant?: boolean } = {},
) {
  const { holdMs = 1200, instant = false } = opts;
  const [progress, setProgress] = useState(0); // 0–1, alimenta el anillo
  const raf = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
    setProgress(0);
  }, []);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      if (instant) {
        onSend();
        return;
      }
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const t0 = performance.now();
      const loop = (t: number) => {
        const p = Math.min(1, (t - t0) / holdMs);
        setProgress(p);
        if (p >= 1) {
          raf.current = null;
          setProgress(0);
          onSend();
          return;
        }
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
    },
    [holdMs, instant, onSend],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend],
  );

  useEffect(() => cancel, [cancel]);
  return {
    progress,
    handlers: {
      onPointerDown,
      onPointerUp: cancel,
      onPointerCancel: cancel,
      onPointerLeave: cancel,
      onKeyDown,
    },
  };
}
