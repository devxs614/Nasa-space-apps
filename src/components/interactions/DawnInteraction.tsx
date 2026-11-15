import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { useJourneyStore } from '../../state/useJourneyStore';
import { SourceBadge } from '../ui/SourceBadge';

const GOAL = 100;

/** 13. Dawn — "Paciencia iónica": empujón químico breve frente a empuje iónico suave y constante. */
export function DawnInteraction({
  active,
  express,
  reducedMotion,
  onComplete,
  onSkip,
}: InteractionProps) {
  const { t } = useTranslation('ui');
  const setFx = useJourneyStore((s) => s.setFx);
  const { done, finish } = useDone(onComplete);
  const [ion, setIon] = useState(false);
  const [sim, setSim] = useState({
    t: 0,
    chemV: 0,
    chemX: 0,
    chemFuel: 1,
    ionV: 0,
    ionX: 0,
    ionFuel: 1,
  });
  const hist = useRef<{ c: number; i: number }[]>([]);

  useEffect(() => {
    setFx('ion', ion ? 1 : 0.2);
  }, [ion, setFx]);
  useEffect(() => () => setFx('ion', 1), [setFx]);

  useEffect(() => {
    if (!active || done) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * (reducedMotion ? 4 : 1.5);
      last = now;
      setSim((s) => {
        const ionOn = ion && s.ionFuel > 0;
        const ionV = s.ionV + (ionOn ? 0.9 * dt : 0);
        const ionFuel = Math.max(0, s.ionFuel - (ionOn ? 0.004 * dt : 0));
        const n = {
          ...s,
          t: s.t + dt,
          ionV,
          ionFuel,
          ionX: s.ionX + ionV * dt,
          chemX: s.chemX + s.chemV * dt,
        };
        if (Math.floor(n.t * 4) !== Math.floor(s.t * 4))
          hist.current = [...hist.current, { c: n.chemV, i: n.ionV }].slice(-120);
        return n;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, done, ion, reducedMotion]);

  useEffect(() => {
    if (sim.ionX >= GOAL) {
      setIon(false);
      finish();
    }
  }, [sim.ionX, finish]);

  const chem = () =>
    setSim((s) => (s.chemFuel > 0 ? { ...s, chemV: s.chemV + 6, chemFuel: 0 } : s));
  const pts = (k: 'c' | 'i') =>
    hist.current.map((h, i) => `${(i / 120) * 300},${100 - Math.min(98, h[k] * 6)}`).join(' ');
  const pct = Math.min(1, sim.ionX / GOAL);

  return (
    <Shell
      title={t('ix.dawn.title')}
      done={done}
      successText={t('ix.dawn.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => setSim((s) => ({ ...s, ionX: GOAL }))}
      label={t('ix.dawn.label')}
      live={done ? t('ix.dawn.arrived') : undefined}
    >
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost" onClick={chem} disabled={sim.chemFuel <= 0}>
          {t('ix.dawn.chemical')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          aria-pressed={ion}
          onClick={() => setIon((v) => !v)}
        >
          {ion ? t('ix.dawn.ionOn') : t('ix.dawn.ionOff')}
        </button>
      </div>
      <svg
        viewBox="0 0 300 100"
        className="ix-stage mt-3 h-28 w-full"
        role="img"
        aria-label={t('ix.dawn.speed')}
      >
        <polyline points={pts('c')} fill="none" stroke="#ffb547" strokeWidth="2" />
        <polyline points={pts('i')} fill="none" stroke="#7fb7ff" strokeWidth="2" />
      </svg>
      <p className="mt-1 font-mono text-[0.8125rem]">
        <span className="text-amber">— {t('ix.dawn.chemical')}</span> ·{' '}
        <span className="text-[#7fb7ff]">— {t('ix.dawn.ion')}</span>
      </p>
      <div className="relative mt-3 h-10" aria-hidden="true">
        <span
          className="absolute top-1/2 left-0 h-6 w-6 -translate-y-1/2 rounded-full bg-[#73665a]"
          title={t('ix.dawn.vesta')}
        />
        <span className="absolute top-1/2 right-0 h-8 w-8 -translate-y-1/2 rounded-full bg-[#3c3a37]">
          {done && (
            <span className="absolute top-2 left-3 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
          )}
        </span>
        <span
          className="absolute top-1/2 h-2 w-2 -translate-y-1/2 bg-signal"
          style={{ left: `calc(${pct * 92}% + 12px)` }}
        />
      </div>
      <p className="font-mono text-[0.8125rem] text-ink-dim">
        {t('ix.dawn.vesta')} → {t('ix.dawn.ceres')} · {Math.round(pct * 100)} %
      </p>
      {done && (
        <p className="mt-2">
          {t('ix.dawn.arrived')}{' '}
          <SourceBadge sourceIds={['nasa-dawn-history', 'nasa-dawn-107840']} />
        </p>
      )}
    </Shell>
  );
}
