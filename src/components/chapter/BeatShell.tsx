import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, EyeOff } from 'lucide-react';
import type { Machine } from '../../data/types';
import { useJourneyStore, type BeatId } from '../../state/useJourneyStore';
import { useAppStore } from '../../state/useAppStore';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { cx } from '../../lib/cx';

gsap.registerPlugin(ScrollTrigger);

/** Alturas de la plantilla de siete momentos (Parte 8.2), en svh. */
export const BEAT_HEIGHT: Record<BeatId, number> = {
  wake: 80,
  identity: 120,
  journey: 100,
  arrival: 100,
  work: 150,
  lastSignal: 120,
  legacy: 80,
};

export interface BeatShellProps {
  machine: Machine;
  beat: BeatId;
  children: ReactNode;
  onProgress?: (p: number) => void;
  wide?: boolean;
  className?: string;
}

/** Un momento del capítulo: `<section aria-labelledby>` con su encabezado, su tramo de scroll y la descripción de escena. */
export function BeatShell({
  machine,
  beat,
  children,
  onProgress,
  wide,
  className,
}: BeatShellProps) {
  const { t } = useTranslation(['ui', 'common', 'chapters']);
  const ref = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const hid = useId();
  const setBeat = useJourneyStore((s) => s.setBeat);
  const reduced = useAppStore((s) => s.reducedMotion);
  const [describe, setDescribe] = useState(false);

  useScrollProgress(
    ref,
    (p) => {
      setBeat(machine.id, beat, p);
      onProgress?.(p);
    },
    [machine.id, beat],
  );

  useEffect(() => {
    const el = content.current;
    if (!el || reduced) return;
    const tween = gsap.from(el.children, {
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(el.children, { clearProps: 'opacity,transform' });
    };
  }, [reduced]);

  return (
    <section
      ref={ref}
      data-beat={beat}
      aria-labelledby={hid}
      className={cx('relative px-4 sm:px-10 lg:pl-28', className)}
      style={{ minHeight: `${BEAT_HEIGHT[beat]}svh` }}
    >
      <div
        ref={content}
        className={cx('pt-[18svh] pb-10', wide ? 'max-w-[980px]' : 'max-w-[600px]')}
      >
        <h3
          id={hid}
          className="mb-4 inline-block rounded-chip bg-void/80 px-2 py-1 font-mono text-[0.8125rem] tracking-[0.2em] text-accent uppercase"
        >
          {t(`common:beats.${beat}`)}
        </h3>
        <div className="space-y-4">{children}</div>
        <div className="mt-4">
          <button
            type="button"
            className="btn btn-subtle btn-sm no-print bg-void/70"
            aria-expanded={describe}
            onClick={() => setDescribe((d) => !d)}
          >
            {describe ? (
              <EyeOff size={16} aria-hidden="true" />
            ) : (
              <Eye size={16} aria-hidden="true" />
            )}
            {describe ? t('beat.hideDescribe') : t('beat.describe')}
          </button>
          <p
            className={cx(
              'mt-2 rounded-card bg-void/80 p-3 text-[0.9375rem] text-ink-dim',
              !describe && 'sr-only',
            )}
          >
            {t(`chapters:${machine.id}.${beat}.sceneAlt`)}
          </p>
        </div>
      </div>
    </section>
  );
}
