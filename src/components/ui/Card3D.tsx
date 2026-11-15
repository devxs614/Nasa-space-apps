import { useRef, type PointerEvent, type ReactNode } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { cx } from '../../lib/cx';

export interface Card3DProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function Card3D({ children, className, maxTilt = 8 }: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useAppStore((s) => s.reducedMotion);
  const set = (k: string, v: string) => ref.current?.style.setProperty(k, v);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    set('--rx', `${(-y * maxTilt).toFixed(2)}deg`);
    set('--ry', `${(x * maxTilt).toFixed(2)}deg`);
    set('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
    set('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const reset = () => {
    set('--rx', '0deg');
    set('--ry', '0deg');
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cx('card3d relative rounded-card border border-line bg-panel', className)}
    >
      {children}
    </div>
  );
}
