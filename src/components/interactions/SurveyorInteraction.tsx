import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { useJourneyStore } from '../../state/useJourneyStore';
import { MACHINES_BY_ID, getFact } from '../../data/machines';
import { useAppStore } from '../../state/useAppStore';
import { SourceBadge } from '../ui/SourceBadge';
import { playSfx } from '../../audio/play';

const TOTAL = 4;

/** 1. Surveyor — "¿Aguanta el suelo?" (Parte 13.2). */
export function SurveyorInteraction({
  express,
  reducedMotion,
  onComplete,
  onSkip,
}: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const setFx = useJourneyStore((s) => s.setFx);
  const { done, finish } = useDone(onComplete);
  const [choice, setChoice] = useState<'dust' | 'firm' | null>(null);
  const [phase, setPhase] = useState<'idle' | 'landing' | 'landed'>('idle');
  const [trenches, setTrenches] = useState(0);
  const [dug, setDug] = useState(0);
  const digging = useRef(false);
  const bounce = getFact(MACHINES_BY_ID.surveyor, 's3Bounce');

  useEffect(() => () => setFx('dig', 0), [setFx]);

  const land = () => {
    setPhase('landing');
    playSfx('thud');
    window.setTimeout(() => setPhase('landed'), reducedMotion ? 50 : 1800);
  };
  const addDig = (amount: number) => {
    setFx('dig', 1);
    playSfx('drill');
    setDug((d) => {
      const nd = d + amount;
      if (nd >= 1) {
        setTrenches((n) => {
          const nn = Math.min(TOTAL, n + 1);
          if (nn >= 1) finish();
          return nn;
        });
        window.setTimeout(() => setFx('dig', 0), 400);
        return 0;
      }
      return nd;
    });
  };

  return (
    <Shell
      title={t('ix.surveyor.title')}
      done={done}
      successText={t('ix.surveyor.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setChoice('firm');
        setPhase('landed');
        setTrenches(1);
        finish();
      }}
      live={
        trenches
          ? t('ix.surveyor.trenches', { n: trenches, total: TOTAL })
          : phase === 'landed'
            ? t('ix.surveyor.landed')
            : undefined
      }
    >
      <fieldset>
        <legend className="mb-2">{t('ix.surveyor.hypothesis')}</legend>
        <div className="flex flex-wrap gap-2">
          {(['dust', 'firm'] as const).map((c) => (
            <button
              key={c}
              type="button"
              className="btn btn-ghost btn-sm"
              aria-pressed={choice === c}
              onClick={() => setChoice(c)}
            >
              {t(`ix.surveyor.${c}`)}
            </button>
          ))}
        </div>
      </fieldset>
      {choice && (
        <div className="mt-4 space-y-3">
          <p>{t('ix.surveyor.chose', { choice: t(`ix.surveyor.${choice}`) })}</p>
          <div className="ix-stage h-40" aria-hidden="true">
            <svg viewBox="0 0 400 160" className="h-full w-full">
              <rect x="0" y="130" width="400" height="30" fill="#2a2b30" />
              <g
                style={{
                  transform: `translate(170px, ${phase === 'idle' ? 0 : 84}px)`,
                  transition: reducedMotion ? 'none' : 'transform 1.8s cubic-bezier(.3,1.6,.5,1)',
                }}
              >
                <path
                  d="M30 20 L60 0 L90 20 Z M35 20 L15 46 M85 20 L105 46 M60 20 V46 M8 46 h14 M98 46 h14 M53 46 h14"
                  stroke="var(--signal)"
                  strokeWidth="2.5"
                  fill="none"
                />
              </g>
              {Array.from({ length: trenches }, (_, i) => (
                <path
                  key={i}
                  d={`M${120 + i * 45} 132 q12 10 24 0`}
                  stroke="#8e8f94"
                  strokeWidth="3"
                  fill="none"
                />
              ))}
            </svg>
          </div>
          {phase === 'idle' && (
            <button type="button" className="btn btn-primary" onClick={land}>
              {t('ix.surveyor.land')}
            </button>
          )}
          {phase === 'landing' && <p className="text-ink-dim">{t('ix.surveyor.landing')}</p>}
          {phase === 'landed' && (
            <>
              <p>{t('ix.surveyor.landed')}</p>
              {bounce && (
                <p className="voice-log">
                  {bounce.text?.[locale]} <SourceBadge sourceIds={bounce.sourceIds} />
                </p>
              )}
              <p className="text-[0.9375rem] text-ink-dim">{t('ix.surveyor.digHint')}</p>
              <div
                role="img"
                aria-label={t('ix.surveyor.soil')}
                className="ix-stage h-20 cursor-crosshair bg-[#2a2b30]"
                onPointerDown={(e) => {
                  digging.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerUp={() => (digging.current = false)}
                onPointerMove={(e) => {
                  if (digging.current) addDig(Math.abs(e.movementX) / 600);
                }}
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => addDig(1)}
                  disabled={trenches >= TOTAL}
                >
                  {t('ix.surveyor.dig')}
                </button>
                <span className="font-mono">
                  {t('ix.surveyor.trenches', { n: trenches, total: TOTAL })}
                </span>
                <meter min={0} max={1} value={dug} className="w-24" aria-hidden="true" />
              </div>
            </>
          )}
        </div>
      )}
    </Shell>
  );
}
