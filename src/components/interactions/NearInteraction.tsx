import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { Toggle } from '../ui/Toggle';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { formatNumber } from '../../lib/format';
import { playSfx } from '../../audio/play';

/** 12. NEAR Shoemaker — "Aterriza sin manual": frenar a tiempo para tocar a 7 km/h o menos. */
export function NearInteraction({ express, reducedMotion, onComplete, onSkip }: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const setFx = useJourneyStore((s) => s.setFx);
  const { done, finish } = useDone(onComplete);
  const [running, setRunning] = useState(false);
  const [state, setState] = useState({ h: 100, v: 4 });
  const [contact, setContact] = useState<number | null>(null);
  const [assist, setAssist] = useState(false);
  const braking = useRef(false);

  useEffect(() => () => setFx('dig', 0), [setFx]);
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * (reducedMotion ? 3 : 1);
      last = now;
      let stop = false;
      setState((s) => {
        let v = s.v + 2.4 * dt - (braking.current || (assist && s.v > 5.5) ? 6 * dt : 0);
        v = Math.max(0.5, v);
        const h = s.h - v * dt * 2.2;
        if (h <= 0) {
          stop = true;
          setContact(v);
          return { h: 0, v };
        }
        setFx('dig', 1 - h / 100);
        return { h, v };
      });
      if (!stop) raf = requestAnimationFrame(loop);
      else setRunning(false);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, assist, reducedMotion, setFx]);

  useEffect(() => {
    if (contact === null) return;
    playSfx('thud');
    if (contact <= 7) finish();
  }, [contact, finish]);

  return (
    <Shell
      title={t('ix.near.title')}
      done={done}
      successText={t('ix.near.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setContact(6.4);
        setState({ h: 0, v: 6.4 });
      }}
      label={t('ix.near.label')}
      live={
        contact !== null
          ? contact <= 7
            ? t('ix.near.contact', { v: formatNumber(contact, locale, 1, 1) })
            : t('ix.near.tooFast')
          : undefined
      }
    >
      <div className="ix-stage relative h-48" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-8 rounded-t-[50%] bg-[#8a7460]" />
        <span
          className="absolute left-1/2 h-5 w-5 -translate-x-1/2 bg-[#d4a64a]"
          style={{ bottom: `${32 + state.h * 1.3}px` }}
        />
      </div>
      <p className="mt-2 font-mono text-[0.875rem]">
        {t('ix.near.speed')}:{' '}
        <span className="text-amber tabular">{formatNumber(state.v, locale, 1, 1)} km/h</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          disabled={running}
          onClick={() => {
            setContact(null);
            setState({ h: 100, v: 4 });
            setRunning(true);
          }}
        >
          {t('ix.near.start')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={!running}
          onPointerDown={() => (braking.current = true)}
          onPointerUp={() => (braking.current = false)}
          onPointerLeave={() => (braking.current = false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') braking.current = true;
          }}
          onKeyUp={() => (braking.current = false)}
        >
          {t('ix.near.brake')}
        </button>
      </div>
      {contact !== null && (
        <p className="mt-2">
          {contact <= 7
            ? t('ix.near.contact', { v: formatNumber(contact, locale, 1, 1) })
            : t('ix.near.tooFast')}
        </p>
      )}
      <Toggle checked={assist} onChange={setAssist} label={t('interaction.noPressure')} />
    </Shell>
  );
}
