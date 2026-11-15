import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { Toggle } from '../ui/Toggle';
import { createRng } from '../../lib/rng';
import { playSfx } from '../../audio/play';
import { createTone, type ToneHandle } from '../../audio/sonify';
import { useAppStore } from '../../state/useAppStore';

const STARS = [
  { period: 5.2, depth: 0.12, width: 0.7 },
  { period: 3.6, depth: 0.06, width: 0.5 },
  { period: 7.1, depth: 0.2, width: 0.9 },
];
const SPEED = 1.2; // unidades de tiempo por segundo

function brightness(star: (typeof STARS)[number], tt: number, noise: number): number {
  const ph = ((tt % star.period) + star.period) % star.period;
  const inDip = ph < star.width;
  return 1 - (inDip ? star.depth * Math.sin((ph / star.width) * Math.PI) : 0) + noise;
}
const inTransit = (star: (typeof STARS)[number], tt: number) =>
  ((tt % star.period) + star.period) % star.period < star.width;

/** 14. Kepler — "Caza un planeta": pulsar ¡Tránsito! durante las caídas de brillo. */
export function KeplerInteraction({
  active,
  express,
  reducedMotion,
  onComplete,
  onSkip,
}: InteractionProps) {
  const { t } = useTranslation('ui');
  const { done, finish } = useDone(onComplete);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [star, setStar] = useState(0);
  const [hits, setHits] = useState(0);
  const [msg, setMsg] = useState('');
  const [flag, setFlag] = useState(false);
  const [dimming, setDimming] = useState(false);
  const time = useRef(0);
  const lastHitCycle = useRef(-1);
  const rng = useRef(createRng(1630));
  const soundOn = useAppStore((s) => s.soundOn);
  const tone = useRef<ToneHandle | null>(null);

  // Sonificación de la curva de luz (Parte 15.5): 660 Hz de base; cada caída baja el tono.
  useEffect(() => {
    if (!flag || !soundOn || !active || done) return;
    tone.current = createTone('sine', 660, 0.05);
    return () => {
      tone.current?.stop();
      tone.current = null;
    };
  }, [flag, soundOn, active, done]);

  useEffect(() => {
    if (!active || done) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * (reducedMotion ? 0.6 : 1);
      last = now;
      time.current += dt * SPEED;
      const s = STARS[star]!;
      const d = inTransit(s, time.current);
      tone.current?.setFreq(660 * (1 - (1 - brightness(s, time.current, 0)) * 4));
      setDimming((p) => {
        if (d && !p && flag) playSfx('tick');
        return d;
      });
      const c = canvas.current;
      const ctx = c?.getContext('2d');
      if (c && ctx) {
        ctx.fillStyle = '#05060a';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.strokeStyle = '#ffb547';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < c.width; x++) {
          const tt = time.current - ((c.width - x) / c.width) * 12;
          const b = brightness(s, tt, (rng.current() - 0.5) * 0.012);
          const y = 20 + (1.05 - b) * (c.height - 40) * 3.2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, done, star, flag, reducedMotion]);

  const press = () => {
    const s = STARS[star]!;
    const tt = time.current;
    const cycle = Math.floor(tt / s.period);
    // Margen generoso: cuenta si estás en la caída o justo después.
    const ok = inTransit(s, tt) || inTransit(s, tt - 0.6);
    if (ok && cycle !== lastHitCycle.current) {
      lastHitCycle.current = cycle;
      playSfx('right');
      setHits((h) => {
        const n = h + 1;
        if (n >= 3) finish();
        return n;
      });
      setMsg(t('ix.kepler.found', { n: Math.min(3, hits + 1) }));
    } else if (!ok) {
      setMsg(t('ix.kepler.miss'));
      playSfx('gentle');
    }
  };

  return (
    <Shell
      title={t('ix.kepler.title')}
      done={done}
      successText={t('ix.kepler.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setHits(3);
        finish();
      }}
      live={flag && dimming ? t('ix.kepler.dimming') : msg}
    >
      <div className="flex flex-wrap gap-2">
        {STARS.map((_, i) => (
          <button
            key={i}
            type="button"
            className="btn btn-ghost btn-sm"
            aria-pressed={star === i}
            onClick={() => {
              setStar(i);
              setHits(0);
              lastHitCycle.current = -1;
            }}
          >
            {t('ix.kepler.star', { n: i + 1 })}
          </button>
        ))}
      </div>
      <canvas
        ref={canvas}
        width={560}
        height={140}
        className="ix-stage mt-3 h-[140px] w-full"
        role="img"
        aria-label={t('ix.kepler.title')}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={press}
          onKeyDown={(e) => {
            if (e.key === ' ') {
              e.preventDefault();
              press();
            }
          }}
        >
          {t('ix.kepler.transit')}
        </button>
        <span className="font-mono text-[0.875rem]">{t('ix.kepler.found', { n: hits })}</span>
        {flag && dimming && (
          <span className="font-mono text-amber">▼ {t('ix.kepler.dimming')}</span>
        )}
      </div>
      {msg && <p className="mt-2">{msg}</p>}
      {done && <p className="mt-2">{t('ix.kepler.candidate')}</p>}
      <Toggle checked={flag} onChange={setFlag} label={t('ix.kepler.accessible')} />
    </Shell>
  );
}
