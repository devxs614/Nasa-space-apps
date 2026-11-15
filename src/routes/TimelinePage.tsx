import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageShell } from '../components/layout/PageShell';
import { SourceBadge } from '../components/ui/SourceBadge';
import { TIMELINE_FROM, TIMELINE_SPANS, spanDays, type TimelineSpan } from '../data/timeline';
import { MACHINES_BY_ID } from '../data/machines';
import { WORLDS } from '../data/ids';
import type { World } from '../data/types';
import { useAppStore } from '../state/useAppStore';
import { diffYMD, formatDate, formatNumber } from '../lib/format';
import { cx } from '../lib/cx';

const PX_PER_YEAR = 44;
const TO = new Date().getUTCFullYear() + 1;
const ms = (d: string) => Date.parse(d.length > 10 ? d : `${d}T00:00:00Z`);
const yearFrac = (d: string) => {
  const t = new Date(ms(d));
  const y = t.getUTCFullYear();
  return y + (t.getTime() - Date.UTC(y, 0, 1)) / (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1));
};
const x = (d: string) => (yearFrac(d) - TIMELINE_FROM) * PX_PER_YEAR;

function useNarrow(): boolean {
  const q = '(max-width: 767px)';
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(q).matches : false,
  );
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setNarrow(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return narrow;
}

/** "Duró 14 años y 4 meses": diferencia de calendario en UTC con plurales de i18next. */
function useSpanText() {
  const { t } = useTranslation('ui');
  return (s: TimelineSpan) => {
    const from = s.arrival ?? s.start;
    const d = diffYMD(from.slice(0, 10), new Date(ms(s.end)));
    const parts: string[] = [];
    if (d.years) parts.push(t('clock.years', { count: d.years }));
    if (d.months) parts.push(t('clock.months', { count: d.months }));
    if (d.days && !d.years) parts.push(t('clock.days', { count: d.days }));
    const span = parts.length
      ? new Intl.ListFormat(t('clock.listLocale'), { style: 'long', type: 'conjunction' }).format(
          parts,
        )
      : t('timeline.sameDay');
    return t('timeline.lasted', { span });
  };
}

/** Línea de tiempo 1966–hoy (Partes 8.11 y 16.9). Con movimiento reducido o en móvil, lista vertical. */
export function TimelinePage() {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  const reduced = useAppStore((s) => s.reducedMotion);
  const narrow = useNarrow();
  const [world, setWorld] = useState<World | 'all'>('all');
  const [byDuration, setByDuration] = useState(false);
  const spanText = useSpanText();

  const rows = useMemo(() => {
    const list = TIMELINE_SPANS.filter((s) => world === 'all' || s.world === world);
    return byDuration ? [...list].sort((a, b) => spanDays(b) - spanDays(a)) : list;
  }, [world, byDuration]);
  const vertical = narrow || reduced;
  const times = (s: TimelineSpan) => {
    if (!s.plannedEnd) return null;
    const from = ms(s.arrival ?? s.start);
    const plan = ms(s.plannedEnd) - from;
    return plan > 0 ? (ms(s.end) - from) / plan : null;
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    e.currentTarget.scrollBy({
      left: step * PX_PER_YEAR * 4,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  const controls = (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <fieldset>
        <legend className="mb-2 font-bold">{t('timeline.filter')}</legend>
        <div className="flex flex-wrap gap-2">
          {(['all', ...WORLDS] as const).map((w) => (
            <button
              key={w}
              type="button"
              className="btn btn-subtle btn-sm border-line"
              aria-pressed={world === w}
              onClick={() => setWorld(w)}
            >
              {w === 'all' ? t('timeline.all') : t(`common:worlds.${w}`)}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        aria-pressed={byDuration}
        onClick={() => setByDuration((v) => !v)}
      >
        {byDuration ? t('timeline.sortDate') : t('timeline.sortDuration')}
      </button>
      <p className="font-mono text-[0.875rem] text-ink-dim" aria-live="polite">
        {t('timeline.count', { n: rows.length })}
      </p>
    </div>
  );

  const legend = (
    <div
      className="mb-4 flex flex-wrap gap-4 font-mono text-[0.8125rem]"
      aria-label={t('timeline.legend')}
      role="group"
    >
      <span className="flex items-center gap-2">
        <span className="inline-block h-2 w-8 rounded-full bg-accent" aria-hidden="true" />{' '}
        {t('timeline.legendReal')}
      </span>
      <span className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-8 rounded-full border border-dashed border-ink-dim"
          aria-hidden="true"
        />{' '}
        {t('timeline.legendPlan')}
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rotate-45 bg-signal" aria-hidden="true" />{' '}
        {t('timeline.legendArrival')}
      </span>
    </div>
  );

  return (
    <PageShell title={t('routes.timeline')} intro={<p>{t('timeline.intro')}</p>} wide>
      {controls}
      {legend}
      {vertical ? (
        <ol className="space-y-3" data-timeline="vertical">
          {rows.map((s) => {
            const m = MACHINES_BY_ID[s.machineId];
            const k = times(s);
            return (
              <li key={s.machineId} className="panel-solid p-4" data-world={s.world}>
                <Link to={`/maquinas/${m.id}`} className="font-bold">
                  {m.name[locale]}
                </Link>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 font-mono text-[0.8125rem]">
                  {m.launch && (
                    <>
                      <dt className="text-ink-dim">{t('common:timeline.launch')}</dt>
                      <dd>{formatDate(m.launch.date, locale)}</dd>
                    </>
                  )}
                  {s.arrival && (
                    <>
                      <dt className="text-ink-dim">{t('common:timeline.arrival')}</dt>
                      <dd>{formatDate(s.arrival, locale)}</dd>
                    </>
                  )}
                  <dt className="text-ink-dim">{t('common:timeline.lastSignal')}</dt>
                  <dd>
                    {m.lastSignal.noteOnly
                      ? m.lastSignal.note?.[locale]
                      : formatDate(s.end, locale)}
                  </dd>
                </dl>
                <p className="mt-1 text-[0.9375rem]">
                  {spanText(s)}
                  {k && k > 1.05 && ` · ${t('timeline.times', { n: formatNumber(k, locale, 0) })}`}
                </p>
              </li>
            );
          })}
        </ol>
      ) : (
        <div
          role="region"
          aria-label={t('timeline.chart')}
          tabIndex={0}
          onKeyDown={onKey}
          data-keys="own"
          data-timeline="horizontal"
          className="panel-solid overflow-x-auto overscroll-x-contain p-4"
        >
          <div className="relative" style={{ width: (TO - TIMELINE_FROM) * PX_PER_YEAR + 220 }}>
            <ol
              className="relative mb-2 flex h-6 font-mono text-[0.75rem] text-ink-dim"
              aria-hidden="true"
            >
              {Array.from(
                { length: Math.ceil((TO - TIMELINE_FROM) / 5) },
                (_, i) => TIMELINE_FROM + i * 5,
              ).map((y) => (
                <li
                  key={y}
                  className="absolute border-l border-line pl-1"
                  style={{ left: (y - TIMELINE_FROM) * PX_PER_YEAR }}
                >
                  {y}
                </li>
              ))}
            </ol>
            <ol className="space-y-2">
              {rows.map((s) => {
                const m = MACHINES_BY_ID[s.machineId];
                const left = x(s.start);
                const width = Math.max(4, x(s.end) - left);
                const planLeft = x(s.arrival ?? s.start);
                const k = times(s);
                const label = t('timeline.row', {
                  name: m.name[locale],
                  from: formatDate(s.start, locale),
                  to: formatDate(s.end, locale),
                });
                return (
                  <li
                    key={s.machineId}
                    className="relative h-11"
                    data-act={s.world}
                    data-world={s.world}
                  >
                    {s.plannedEnd && (
                      <span
                        aria-hidden="true"
                        className="absolute top-2 h-3 rounded-full border border-dashed border-ink-dim"
                        style={{ left: planLeft, width: Math.max(3, x(s.plannedEnd) - planLeft) }}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="absolute top-2.5 h-2 rounded-full bg-accent"
                      style={{ left, width }}
                    />
                    {s.arrival && (
                      <span
                        aria-hidden="true"
                        className="absolute top-2 h-3 w-3 -translate-x-1/2 rotate-45 bg-signal"
                        style={{ left: x(s.arrival) }}
                      />
                    )}
                    <Link
                      to={`/maquinas/${m.id}`}
                      aria-label={`${label}. ${spanText(s)}`}
                      className={cx(
                        'absolute top-5 text-[0.875rem] whitespace-nowrap no-underline hover:underline',
                      )}
                      style={{ left: Math.min(left, (TO - TIMELINE_FROM) * PX_PER_YEAR - 40) }}
                    >
                      {(m.shortName ?? m.name)[locale]} ·{' '}
                      <span className="text-ink-dim">{spanText(s)}</span>
                      {k && k > 1.05 && (
                        <span className="text-phosphor">
                          {' '}
                          · {t('timeline.times', { n: formatNumber(k, locale, 0) })}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
      <p className="mt-4 text-[0.9375rem] text-ink-dim">
        {t('timeline.estimateNote')} {t('timeline.noLaunch')}
      </p>
      <SourceBadge
        sourceIds={[
          ...new Set(rows.flatMap((s) => MACHINES_BY_ID[s.machineId].lastSignal.sourceIds)),
        ]}
        className="mt-2"
      />
    </PageShell>
  );
}
