import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { Slider } from '../ui/Slider';
import { useAppStore } from '../../state/useAppStore';
import { formatNumber } from '../../lib/format';
import { quakeSample } from './AlsepInteraction';
import { SourceBadge } from '../ui/SourceBadge';
import { Badge } from '../ui/Badge';
import { playSfx } from '../../audio/play';

/** 10. InSight — "Escucha a Marte": sismógrafo con magnitud y corte del interior (2021 frente a 2023). */
export function InsightInteraction({
  express,
  reducedMotion,
  onComplete,
  onSkip,
}: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const { done, finish } = useDone(onComplete);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mag, setMag] = useState(3);
  const [model, setModel] = useState<2021 | 2023>(2021);
  const [used, setUsed] = useState({ quake: false, model: false });

  useEffect(() => {
    if (used.quake && used.model) finish();
  }, [used, finish]);

  const quake = () => {
    setUsed((u) => ({ ...u, quake: true }));
    const amp = (mag - 1.5) / 3.2;
    const dur = 6 + (mag - 2) * 3;
    playSfx('quake', dur, amp);
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const draw = (upTo: number) => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.strokeStyle = '#e2683c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < c.width; x++) {
        const tt = (x / c.width) * dur;
        const y =
          c.height / 2 + (tt <= upTo ? quakeSample(tt * (12 / dur), amp) * c.height * 0.45 : 0);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    if (reducedMotion) {
      draw(dur);
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const s = (now - t0) / 1000;
      draw(s);
      if (s < dur) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Como en el texto del capítulo: "1,800–1,850" en inglés y "1.800–1.850" en español.
  const thousands = locale === 'es' ? '.' : ',';
  const coreR = (model === 2021 ? '1 800–1 850' : '1 650–1 700').replaceAll(' ', thousands);
  const coreScale = model === 2021 ? 0.54 : 0.495;
  return (
    <Shell
      title={t('ix.insight.title')}
      done={done}
      successText={t('ix.insight.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setModel(2023);
        setUsed({ quake: true, model: true });
      }}
      label={t('ix.insight.label')}
      live={t('ix.insight.coreRadius', { r: coreR })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <canvas
            ref={canvas}
            width={480}
            height={140}
            className="ix-stage h-[140px] w-full"
            role="img"
            aria-label={t('ix.insight.listen')}
          />
          <Slider
            label={t('ix.insight.magnitude')}
            value={mag}
            min={2}
            max={4.7}
            step={0.1}
            format={(v) => formatNumber(v, locale, 1, 1)}
            onChange={setMag}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={quake}>
              {t('ix.insight.listen')}
            </button>
            <Badge tone="sonification">{t('badge.sonification')}</Badge>
          </div>
        </div>
        <div>
          <fieldset>
            <legend className="mb-2 font-bold">{t('ix.insight.model')}</legend>
            <div className="flex gap-2">
              {([2021, 2023] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-pressed={model === m}
                  onClick={() => {
                    setModel(m);
                    setUsed((u) => ({ ...u, model: true }));
                  }}
                >
                  {t(m === 2021 ? 'ix.insight.m2021' : 'ix.insight.m2023')}
                </button>
              ))}
            </div>
          </fieldset>
          <svg
            viewBox="0 0 200 200"
            className="mt-2 h-48 w-48"
            role="img"
            aria-label={`${t('ix.insight.core')}: ${t('ix.insight.coreRadius', { r: coreR })}`}
          >
            <circle cx="100" cy="100" r="96" fill="#7a3a22" />
            <circle cx="100" cy="100" r="90" fill="#b4552e" />
            {model === 2023 && (
              <circle cx="100" cy="100" r={96 * coreScale + 9} fill="#ffb547" opacity="0.85" />
            )}
            <circle
              cx="100"
              cy="100"
              r={96 * coreScale}
              fill="#f2c14e"
              style={{ transition: 'r 600ms' }}
            />
          </svg>
          <ul className="mt-2 space-y-1 font-mono text-[0.8125rem]">
            <li>
              ■ {t('ix.insight.crust')} · {t('ix.insight.mantle')}
            </li>
            {model === 2023 && <li className="text-amber">■ {t('ix.insight.molten')}</li>}
            <li className="text-[#f2c14e]">
              ■ {t('ix.insight.core')} · {t('ix.insight.coreRadius', { r: coreR })}
            </li>
          </ul>
          <p className="text-[0.8125rem] text-ink-dim">{t('ix.insight.notToScale')}</p>
          <SourceBadge sourceIds={['ethz-core', 'ipgp-core']} className="mt-2" />
        </div>
      </div>
    </Shell>
  );
}
