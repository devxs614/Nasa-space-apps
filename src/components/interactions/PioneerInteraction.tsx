import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { useLightTime } from '../../hooks/useLightTime';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { AU_KM } from '../../data/orbits';
import { formatLightTime, formatNumber } from '../../lib/format';
import { Badge } from '../ui/Badge';
import { SourceBadge } from '../ui/SourceBadge';
import { NasaImage } from '../media/NasaImage';

type Tool = 'pen' | 'line' | 'circle' | 'eraser';
const ZONES = ['people', 'system', 'pulsars', 'scale'] as const;

function Live() {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const p10 = useLightTime('pioneer10');
  const p11 = useLightTime('pioneer11');
  const row = (craft: string, r: typeof p10) =>
    t('ix.pioneer.distance', {
      craft,
      au: formatNumber((r.distanceKm ?? 0) / AU_KM, locale, 3, 3),
      time: formatLightTime(r.seconds ?? 0, locale),
    });
  return (
    <div className="panel-solid p-3 font-mono text-[0.875rem]" aria-live="off">
      <p className="mb-1 flex items-center gap-2 text-ink-dim">
        {t('ix.pioneer.live')} <Badge tone="approx">{t('badge.estimate')}</Badge>
      </p>
      <p className="tabular">{row('Pioneer 10', p10)}</p>
      <p className="tabular">{row('Pioneer 11', p11)}</p>
      <SourceBadge
        sourceIds={['heavens-above-escape', 'theskylive-pioneer10']}
        estimate
        className="mt-2"
      />
    </div>
  );
}

/** 15. Pioneer 10 y 11 — "Mensaje en una botella": diagrama original, calculadora en vivo y placa propia. */
export function PioneerInteraction({ express, onComplete, onSkip }: InteractionProps) {
  const { t } = useTranslation('ui');
  const setDrawing = useJourneyStore((s) => s.setPlaqueDrawing);
  const { done, finish } = useDone(onComplete);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [zone, setZone] = useState<(typeof ZONES)[number] | null>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [saved, setSaved] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const snapshot = useRef<ImageData | null>(null);

  useEffect(() => {
    if (open.size >= 4) finish();
  }, [open, finish]);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#c9a14a';
    ctx.fillRect(0, 0, 360, 220);
  }, []);

  const pt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 360, y: ((e.clientY - r.top) / r.height) * 220 };
  };
  const ctx = () => canvas.current?.getContext('2d') ?? null;

  return (
    <Shell
      title={t('ix.pioneer.title')}
      done={done}
      successText={t('ix.pioneer.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setOpen(new Set(ZONES));
      }}
      illustrative={false}
      live={zone ? t(`ix.pioneer.zones.${zone}Text`) : undefined}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[0.8125rem] text-ink-dim">{t('ix.pioneer.diagram')}</p>
          <div className="grid grid-cols-2 gap-2">
            {ZONES.map((z) => (
              <button
                key={z}
                type="button"
                className="btn btn-ghost h-auto min-h-16 flex-col py-2"
                aria-expanded={zone === z}
                onClick={() => {
                  setZone(z);
                  setOpen((s) => new Set(s).add(z));
                }}
              >
                <svg viewBox="0 0 60 30" className="h-8 w-16" aria-hidden="true">
                  {z === 'people' && (
                    <path
                      d="M15 5v20M10 12h10M45 5v20M40 12h10M12 25l3-6 3 6M42 25l3-6 3 6"
                      stroke="currentColor"
                      fill="none"
                    />
                  )}
                  {z === 'system' && (
                    <path
                      d="M4 15h52M8 15a2 2 0 1 0 0.1 0M18 15a1 1 0 1 0 .1 0M26 15a1.4 1.4 0 1 0 .1 0M26 15 Q40 2 56 4"
                      stroke="currentColor"
                      fill="none"
                    />
                  )}
                  {z === 'pulsars' && (
                    <path
                      d="M30 15 L55 5 M30 15 L5 8 M30 15 L50 27 M30 15 L8 26 M30 15 L32 2"
                      stroke="currentColor"
                      fill="none"
                    />
                  )}
                  {z === 'scale' && (
                    <path d="M5 22h50M5 18v8M55 18v8M30 20v4" stroke="currentColor" fill="none" />
                  )}
                </svg>
                {t(`ix.pioneer.zones.${z}`)}
              </button>
            ))}
          </div>
          {zone && (
            <p className="mt-2 rounded-card border border-line p-3">
              {t(`ix.pioneer.zones.${zone}Text`)}
            </p>
          )}
          <NasaImage
            query="Pioneer plaque"
            alt={t('ix.pioneer.zones.people')}
            poster="pioneer"
            className="mt-3"
          />
        </div>
        <div className="space-y-3">
          <Live />
          <div>
            <p className="mb-2 font-bold">{t('ix.pioneer.draw')}</p>
            <div className="mb-2 flex flex-wrap gap-1">
              {(['pen', 'line', 'circle', 'eraser'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  className="btn btn-subtle btn-sm border-line"
                  aria-pressed={tool === k}
                  onClick={() => setTool(k)}
                >
                  {t(`ix.pioneer.tools.${k}`)}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-subtle btn-sm border-line"
                onClick={() => {
                  const c = ctx();
                  if (c) {
                    c.fillStyle = '#c9a14a';
                    c.fillRect(0, 0, 360, 220);
                  }
                }}
              >
                {t('ix.pioneer.tools.clear')}
              </button>
            </div>
            <canvas
              ref={canvas}
              width={360}
              height={220}
              aria-label={t('ix.pioneer.canvas')}
              role="img"
              className="w-full touch-none rounded-card border border-line"
              onPointerDown={(e) => {
                const c = ctx();
                if (!c) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                start.current = pt(e);
                snapshot.current = c.getImageData(0, 0, 360, 220);
                c.beginPath();
                c.moveTo(start.current.x, start.current.y);
              }}
              onPointerMove={(e) => {
                const c = ctx();
                if (!c || !start.current) return;
                const p = pt(e);
                c.lineWidth = tool === 'eraser' ? 14 : 2.5;
                c.strokeStyle = tool === 'eraser' ? '#c9a14a' : '#3a2a10';
                c.lineCap = 'round';
                if (tool === 'pen' || tool === 'eraser') {
                  c.lineTo(p.x, p.y);
                  c.stroke();
                } else if (snapshot.current) {
                  c.putImageData(snapshot.current, 0, 0);
                  c.beginPath();
                  if (tool === 'line') {
                    c.moveTo(start.current.x, start.current.y);
                    c.lineTo(p.x, p.y);
                  } else
                    c.arc(
                      start.current.x,
                      start.current.y,
                      Math.hypot(p.x - start.current.x, p.y - start.current.y),
                      0,
                      Math.PI * 2,
                    );
                  c.stroke();
                }
              }}
              onPointerUp={() => (start.current = null)}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm mt-2"
              onClick={() => {
                const url = canvas.current?.toDataURL('image/png');
                if (url) setDrawing(url);
                setSaved(true);
                finish();
              }}
            >
              {t('ix.pioneer.saveDrawing')}
            </button>
            {saved && <p className="mt-1 text-phosphor">{t('ix.pioneer.saved')}</p>}
          </div>
        </div>
      </div>
    </Shell>
  );
}
