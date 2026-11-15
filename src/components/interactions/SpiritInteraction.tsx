import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { Slider } from '../ui/Slider';
import { MACHINES_BY_ID, getFact } from '../../data/machines';
import { useAppStore } from '../../state/useAppStore';
import { SourceBadge } from '../ui/SourceBadge';

const FOUND_AT = 0.62;

/** 7. Spirit — "La rueda que arrastra": el surco destapa suelo blanco con más del 90 % de sílice. */
export function SpiritInteraction({
  express,
  reducedMotion,
  onComplete,
  onSkip,
}: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const { done, finish } = useDone(onComplete);
  const [pos, setPos] = useState(0); // 0 → 1 hacia la izquierda
  const [analysis, setAnalysis] = useState(0);
  const [devil, setDevil] = useState(0);
  const drag = useRef<number | null>(null);
  const silica = getFact(MACHINES_BY_ID.spirit, 'silica');
  const cleaning = getFact(MACHINES_BY_ID.spirit, 'cleaning');
  const found = pos >= FOUND_AT;
  const energy = Math.round(60 + devil * 33);

  const analyze = () => {
    if (reducedMotion) {
      setAnalysis(1);
      finish();
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1500);
      setAnalysis(k);
      if (k < 1) requestAnimationFrame(step);
      else finish();
    };
    requestAnimationFrame(step);
  };
  const roverX = 85 - pos * 70;

  return (
    <Shell
      title={t('ix.spirit.title')}
      done={done}
      successText={t('ix.spirit.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setPos(1);
        setAnalysis(1);
        finish();
      }}
      live={found ? t('ix.spirit.found') : undefined}
    >
      <p className="text-[0.9375rem] text-ink-dim">{t('ix.spirit.hint')}</p>
      <div
        className="ix-stage mt-2 h-36 select-none"
        role="img"
        aria-label={t('ix.spirit.back')}
        onPointerDown={(e) => {
          drag.current = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current === null) return;
          const dx = drag.current - e.clientX;
          drag.current = e.clientX;
          if (dx > 0) setPos((p) => Math.min(1, p + dx / 600));
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full">
          <rect x="0" y="28" width="100" height="12" fill="#6e3520" />
          <rect
            x={roverX + 6}
            y="30"
            width={Math.max(0, 85 - roverX)}
            height="2.5"
            fill="#3a1a10"
          />
          {found && (
            <rect x={85 - FOUND_AT * 70 + 4} y="30" width="10" height="2.5" fill="#f2f0e6" />
          )}
          <g transform={`translate(${roverX} 18)`}>
            <rect x="0" y="0" width="12" height="5" fill="#e8eef7" />
            <rect x="-3" y="-1" width="18" height="1" fill="#141c33" />
            <circle cx="2" cy="8" r="2" fill="#9aa3ad" />
            <circle cx="6" cy="8" r="2" fill="#9aa3ad" />
            <circle cx="10" cy="8" r="2" fill="#ff8a5c" />
          </g>
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setPos((p) => Math.min(1, p + 0.08))}
        >
          ← {t('ix.spirit.back')}
        </button>
        {found && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={analyze}
            disabled={analysis > 0}
          >
            {t('ix.spirit.analyze')}
          </button>
        )}
      </div>
      {found && <p className="mt-2">{t('ix.spirit.found')}</p>}
      {analysis > 0 && (
        <div className="mt-2">
          <label className="flex items-center gap-3 font-mono text-[0.875rem]">
            {t('ix.spirit.silica')}
            <meter min={0} max={100} value={analysis * 91} className="w-40" />
            <span>{analysis >= 1 ? '> 90 %' : ''}</span>
          </label>
          {silica && analysis >= 1 && <SourceBadge sourceIds={silica.sourceIds} className="mt-2" />}
        </div>
      )}
      <div className="mt-3 max-w-sm">
        <Slider
          label={t('ix.spirit.devil')}
          value={devil}
          min={0}
          max={1}
          step={0.05}
          onChange={setDevil}
          format={() => t('ix.spirit.energy', { p: energy })}
        />
        {cleaning && devil >= 1 && <p className="voice-log">{cleaning.text?.[locale]}</p>}
      </div>
    </Shell>
  );
}
