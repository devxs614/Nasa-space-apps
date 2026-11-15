import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { LASER_ROUND_TRIP_S } from '../../lib/astro';
import { formatLightTime, formatNumber } from '../../lib/format';
import { useAppStore } from '../../state/useAppStore';
import { MACHINES_BY_ID, getFact } from '../../data/machines';
import { Badge } from '../ui/Badge';
import { playSfx } from '../../audio/play';

const QUAKE_S = 12;

/** Traza sintética del sismo: misma serie para el dibujo y la sonificación (Parte 15.5). */
export function quakeSample(t: number, amp = 1): number {
  const env = t < 0.3 ? t / 0.3 : Math.exp(-(t - 0.3) / 3.2);
  return (
    env *
    amp *
    (Math.sin(t * 37) * 0.6 + Math.sin(t * 91 + 1.3) * 0.4) *
    (0.7 + 0.3 * Math.sin(t * 3.1))
  );
}

/** 3. ALSEP — "El temblor y el láser". */
export function AlsepInteraction({ express, reducedMotion, onComplete, onSkip }: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const { done, finish } = useDone(onComplete);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [quaked, setQuaked] = useState(false);
  const [laser, setLaser] = useState<'idle' | 'out' | 'back'>('idle');
  const [lp, setLp] = useState(0);
  const recession = getFact(MACHINES_BY_ID.alsep, 'recession');
  const cm = (new Date().getUTCFullYear() - 1969) * 3.8;

  useEffect(() => {
    if (quaked && laser === 'back') finish();
  });

  const drawQuake = (upTo: number) => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#5ef2ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < c.width; x++) {
      const tt = (x / c.width) * QUAKE_S;
      const y = c.height / 2 + (tt <= upTo ? quakeSample(tt) * (c.height * 0.42) : 0);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  useEffect(() => drawQuake(0), []);

  const drop = () => {
    setQuaked(true);
    playSfx('quake', QUAKE_S);
    if (reducedMotion) {
      drawQuake(QUAKE_S);
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const s = (now - t0) / 1000;
      drawQuake(s);
      if (s < QUAKE_S) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const fire = () => {
    setLaser('out');
    playSfx('laser');
    const ms = LASER_ROUND_TRIP_S * 1000;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      setLp(k);
      if (k < 1) requestAnimationFrame(step);
      else setLaser('back');
    };
    requestAnimationFrame(step);
  };

  return (
    <Shell
      title={t('ix.alsep.title')}
      done={done}
      successText={t('ix.alsep.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setQuaked(true);
        drawQuake(QUAKE_S);
        setLaser('back');
        setLp(1);
        finish();
      }}
      live={
        laser === 'back'
          ? t('ix.alsep.laserBack', { time: formatLightTime(LASER_ROUND_TRIP_S, locale) })
          : quaked
            ? t('ix.alsep.quakeDone')
            : undefined
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-[0.8125rem] text-ink-dim">{t('ix.alsep.trace')}</p>
          <canvas
            ref={canvas}
            width={480}
            height={140}
            className="ix-stage h-[140px] w-full"
            role="img"
            aria-label={t('ix.alsep.trace')}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={drop}>
              {t('ix.alsep.drop')}
            </button>
            <Badge tone="compression">{t('ix.alsep.compressed')}</Badge>
            <Badge tone="sonification">{t('badge.sonification')}</Badge>
          </div>
        </div>
        <div>
          <div className="ix-stage relative h-[140px]" aria-hidden="true">
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-signal transition-none"
              style={{
                left: `${(lp < 0.5 ? lp * 2 : 2 - lp * 2) * 92 + 4}%`,
                opacity: laser === 'out' ? 1 : 0,
              }}
            />
            <div className="absolute right-3 bottom-3 grid grid-cols-5 gap-1">
              {Array.from({ length: 15 }, (_, i) => (
                <span
                  key={i}
                  className="h-3 w-3 rounded-full"
                  style={{ background: laser !== 'idle' && lp > 0.45 ? 'var(--phosphor)' : '#334' }}
                />
              ))}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={fire}
              disabled={laser === 'out'}
            >
              {t('ix.alsep.fire')}
            </button>
            <Badge tone="realtime">{t('badge.realtime')}</Badge>
          </div>
          <p className="mt-2 font-mono text-[0.875rem]">
            {laser === 'out'
              ? t('ix.alsep.laserTraveling')
              : laser === 'back'
                ? t('ix.alsep.laserBack', { time: formatLightTime(LASER_ROUND_TRIP_S, locale) })
                : ''}
          </p>
        </div>
      </div>
      <p className="mt-3 font-mono text-[0.875rem]">
        {t('ix.alsep.drift', { cm: formatNumber(cm, locale, 0) })}{' '}
        <Badge tone="approx">{t('badge.estimate')}</Badge>
        {recession && <span className="sr-only"> {recession.text?.[locale]}</span>}
      </p>
    </Shell>
  );
}
