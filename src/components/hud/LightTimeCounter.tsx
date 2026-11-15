import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Machine } from '../../data/types';
import { useLightTime } from '../../hooks/useLightTime';
import { signalPlayback } from '../../lib/signal';
import { formatLightTime, formatNumber } from '../../lib/format';
import { AU_KM } from '../../data/orbits';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { Badge } from '../ui/Badge';
import { SourceBadge } from '../ui/SourceBadge';
import { ORBIT_SOURCES } from '../../data/orbits';

/** Tiempo de luz (estimación) con insignia de método y compresión, y la fórmula en Modo Pro (Parte 16.3). */
export function LightTimeCounter({ machine }: { machine: Machine }) {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  const pro = useAppStore((s) => s.proMode);
  const lt = useLightTime(machine.lightTimeTarget);
  const traveling = useJourneyStore(
    (s) => s.signal.target === machine.id && s.signal.status === 'traveling',
  );
  const elapsed = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!traveling || lt.seconds === null) return;
    let raf = 0;
    const tick = () => {
      const sig = useJourneyStore.getState().signal;
      const k = Math.min(1, (performance.now() - sig.startedAt) / Math.max(1, sig.etaMs));
      if (elapsed.current)
        elapsed.current.textContent = formatLightTime(k * (lt.seconds ?? 0), locale);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [traveling, lt.seconds, locale]);

  const off = lt.seconds === null;
  const pb = off ? null : signalPlayback(lt.seconds ?? 0);
  const value = off
    ? '—'
    : lt.range
      ? t('signal.lightRange', {
          min: formatLightTime(lt.range[0], locale),
          max: formatLightTime(lt.range[1], locale),
        })
      : formatLightTime(lt.seconds ?? 0, locale);
  const auKm = (km: number) => formatNumber(km / AU_KM, locale, 3);

  return (
    <div className="panel-solid hud-corners p-4" data-testid="light-time">
      <p className="font-mono text-[0.8125rem] tracking-wider text-ink-dim uppercase">
        {t('signal.lightLabel')}
      </p>
      <p className="mt-1 font-mono text-[1.6rem] text-amber tabular">{value}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {off ? (
          <Badge tone="info">{t('signal.transmitterOff')}</Badge>
        ) : pb?.realTime ? (
          <Badge tone="realtime">{t('badge.realtime')}</Badge>
        ) : (
          <Badge tone="compression">
            ×{formatNumber(pb?.compression ?? 1, locale, 0)}
            {lt.range ? ` · ${t('badge.range')}` : ''}
          </Badge>
        )}
        <Badge tone="approx">{t('badge.estimate')}</Badge>
      </div>
      {traveling && !off && (
        <p className="mt-2 font-mono text-[0.875rem] text-ink-dim" aria-hidden="true">
          {t('signal.elapsed')}: <span ref={elapsed} className="text-signal tabular" />
        </p>
      )}
      <details className="mt-3 text-[0.9375rem]" open={pro}>
        <summary className="flex min-h-11 cursor-pointer items-center text-signal">
          {t('signal.formulaTitle')}
        </summary>
        <p className="font-mono">{t('signal.formula')}</p>
        <p className="text-ink-dim">
          {t('signal.method', { method: t(`common:lightMethod.${lt.method}`) })}
        </p>
        {lt.distanceKm !== null && (
          <p className="text-ink-dim">
            {t('signal.distance', {
              km: formatNumber(lt.distanceKm, locale, 0),
              au: auKm(lt.distanceKm),
            })}
          </p>
        )}
        {lt.range && (
          <p className="text-ink-dim">
            {t('signal.distanceRange', {
              min: formatNumber((lt.range[0] * 299792.458) / AU_KM, locale, 3),
              max: formatNumber((lt.range[1] * 299792.458) / AU_KM, locale, 3),
            })}
          </p>
        )}
        <p className="text-ink-dim">
          {lt.method === 'mean'
            ? t('signal.meanNote')
            : lt.method === 'extrapolated'
              ? t('signal.pioneerNote')
              : lt.method === 'ephemeris'
                ? t('signal.ephemerisNote')
                : ''}
        </p>
        <SourceBadge
          sourceIds={[...ORBIT_SOURCES[machine.lightTimeTarget]]}
          estimate
          className="mt-2"
        />
      </details>
    </div>
  );
}
