import { useTranslation } from 'react-i18next';
import type { Machine } from '../../data/types';
import { BeatShell } from './BeatShell';
import { ScriptLines } from './ScriptLines';
import { useAppStore } from '../../state/useAppStore';
import { formatDate, formatLatLon } from '../../lib/format';
import { SourceBadge } from '../ui/SourceBadge';

/** "El viaje": línea de fechas con una pequeña ruta dibujada en SVG. */
export function BeatJourney({ machine }: { machine: Machine }) {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  const points = [
    machine.launch && {
      key: 'launch',
      label: t('common:dates.launch'),
      date: machine.launch.date,
      src: machine.launch.sourceIds,
    },
    machine.arrival && {
      key: 'arrival',
      label: t(`common:arrivalKind.${machine.arrival.kind}`),
      date: machine.arrival.date,
      src: machine.arrival.sourceIds,
    },
  ].filter(Boolean) as { key: string; label: string; date: string; src: string[] }[];
  return (
    <BeatShell machine={machine} beat="journey">
      <ScriptLines machine={machine} beat="journey" />
      {points.length > 0 && (
        <div className="panel-solid hud-corners p-4">
          <p className="mb-3 font-mono text-[0.8125rem] tracking-wider text-amber uppercase">
            {t('beat.timelineTitle')}
          </p>
          <svg viewBox="0 0 300 40" className="mb-3 h-10 w-full" aria-hidden="true">
            <path
              d="M10 30 Q150 -10 290 30"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeDasharray="4 5"
            />
            <circle cx="10" cy="30" r="4" fill="#6fb6ff" />
            <circle cx="290" cy="30" r="4" fill="var(--signal)" />
          </svg>
          <ol className="grid gap-2 sm:grid-cols-2">
            {points.map((p) => (
              <li key={p.key} className="font-mono text-[0.875rem]">
                <span className="block text-ink-dim">{p.label}</span>
                <span className="block text-ink">{formatDate(p.date, locale, true)}</span>
              </li>
            ))}
          </ol>
          <SourceBadge sourceIds={points.flatMap((p) => p.src)} className="mt-3" />
        </div>
      )}
    </BeatShell>
  );
}

/** "La llegada": texto y datos de aterrizaje u órbita. */
export function BeatArrival({ machine }: { machine: Machine }) {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  const site = machine.sites.find((s) => !s.hideCoords);
  return (
    <BeatShell machine={machine} beat="arrival">
      <ScriptLines machine={machine} beat="arrival" />
      {machine.arrival && (
        <div className="panel-solid hud-corners p-4">
          <dl className="grid gap-2 font-mono text-[0.875rem] sm:grid-cols-2">
            <div>
              <dt className="text-ink-dim">{t(`common:arrivalKind.${machine.arrival.kind}`)}</dt>
              <dd>
                {formatDate(machine.arrival.date, locale, true)}
                <span className="sr-only"> · {t('beat.utcNote')}</span>
              </dd>
            </div>
            {site && (
              <div>
                <dt className="text-ink-dim">{site.label[locale]}</dt>
                <dd>
                  {formatLatLon(site.lat, site.lon, locale)}
                  {site.approx && (
                    <span className="ml-2 text-amber">≈ {t('badge.approxPosition')}</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
          <SourceBadge
            sourceIds={[...machine.arrival.sourceIds, ...(site?.sourceIds ?? [])]}
            className="mt-3"
          />
        </div>
      )}
    </BeatShell>
  );
}
