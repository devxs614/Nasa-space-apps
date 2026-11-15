import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { Slider } from '../ui/Slider';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { formatNumber } from '../../lib/format';
import { SourceBadge } from '../ui/SourceBadge';
import { playSfx } from '../../audio/play';

// Hitos con fecha y distancia de la Parte 11; entre ellos se interpola (se avisa en pantalla).
const KNOWN: [number, number][] = [
  [2004.07, 0],
  [2015.23, 42.198],
  [2018.44, 45.16],
];
const MILESTONES: { year: number; key: string }[] = [
  { year: 2004.07, key: 'eagle' },
  { year: 2011.6, key: 'endeavour' },
  { year: 2015.23, key: 'marathon' },
  { year: 2018.44, key: 'storm' },
];
function odometer(y: number): number {
  for (let i = 1; i < KNOWN.length; i++) {
    const [y0, d0] = KNOWN[i - 1]!;
    const [y1, d1] = KNOWN[i]!;
    if (y <= y1) return d0 + ((y - y0) / (y1 - y0)) * (d1 - d0);
  }
  return 45.16;
}

/** 8. Opportunity — "La maratón": línea de tiempo 2004–2018 con odómetro y el relevo de Perseverance. */
export function OpportunityInteraction({ express, onComplete, onSkip }: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const setFx = useJourneyStore((s) => s.setFx);
  const { done, finish } = useDone(onComplete);
  const [year, setYear] = useState(2004.07);
  const km = odometer(year);
  const storm = Math.max(0, Math.min(1, (year - 2018.3) / 0.14));
  const reached = MILESTONES.filter((m) => year >= m.year);
  useEffect(() => {
    setFx('storm', storm);
    if (year >= 2018.44) finish();
  }, [storm, year, setFx, finish]);
  useEffect(() => () => setFx('storm', 0), [setFx]);

  return (
    <Shell
      title={t('ix.opportunity.title')}
      done={done}
      successText={t('ix.opportunity.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => setYear(2018.44)}
      live={reached.length ? t(`ix.opportunity.${reached[reached.length - 1]!.key}`) : undefined}
    >
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <div className="panel-solid p-3 text-center font-mono">
          <p className="text-[0.8125rem] text-ink-dim">{t('ix.opportunity.odometer')}</p>
          <p className="text-[2rem] text-amber tabular">{formatNumber(km, locale, 2, 2)} km</p>
          <p className="mt-1 text-[0.8125rem] text-ink-dim">{t('ix.opportunity.energy')}</p>
          <meter min={0} max={1} low={0.2} value={1 - storm} className="w-full" />
        </div>
        <ol className="space-y-1 font-mono text-[0.875rem]">
          {MILESTONES.map((m) => (
            <li key={m.key} className={year >= m.year ? 'text-ink' : 'text-ink-dim/60'}>
              {Math.floor(m.year)} · {t(`ix.opportunity.${m.key}`)}
            </li>
          ))}
          {year >= 2018.44 && (
            <li className="text-phosphor">2026 · {t('ix.opportunity.relay')} (45,22 km)</li>
          )}
        </ol>
      </div>
      <Slider
        label={t('ix.opportunity.year')}
        value={year}
        min={2004.07}
        max={2018.44}
        step={0.05}
        format={(v) => String(Math.floor(v))}
        onChange={(v) => {
          if (Math.floor(v) !== Math.floor(year)) playSfx('tick');
          setYear(v);
        }}
      />
      <p className="text-[0.8125rem] text-ink-dim">{t('ix.opportunity.interp')}</p>
      {year >= 2018.44 && (
        <SourceBadge
          sourceIds={['nasa-marathon', 'nasa-mer', 'nasa-perseverance-record']}
          className="mt-2"
        />
      )}
    </Shell>
  );
}
