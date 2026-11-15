import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ExternalLink, Info } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { SOURCE_GROUPS } from '../data/sourceIndex';
import { MACHINES_BY_ID } from '../data/machines';
import { useAppStore } from '../state/useAppStore';
import { useHashScroll } from '../hooks/useHashScroll';
import { formatDate } from '../lib/format';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

/** Fuentes (Partes 8.12 y 16.9): todas las fuentes agrupadas por máquina, con buscador y aviso legal. */
export function SourcesPage() {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const [q, setQ] = useState('');
  useHashScroll();

  const groups = useMemo(() => {
    const needle = norm(q.trim());
    return SOURCE_GROUPS.map((g) => {
      const machine = g.id === 'general' ? null : MACHINES_BY_ID[g.id];
      const name = machine ? machine.name[locale] : t('sources.general');
      const names = machine ? [machine.name.es, machine.name.en] : [name];
      const whole = !needle || names.some((n) => norm(n).includes(needle));
      const sources = whole
        ? g.sources
        : g.sources.filter((s) => norm(`${s.title} ${s.publisher} ${s.url}`).includes(needle));
      return { id: g.id, machine, name, sources };
    }).filter((g) => g.sources.length > 0);
  }, [q, locale, t]);
  const total = new Set(groups.flatMap((g) => g.sources.map((s) => s.id))).size;

  return (
    <PageShell title={t('sources.title')} intro={<p>{t('sources.intro')}</p>}>
      <aside
        aria-labelledby="src-notice"
        className="panel-solid mb-8 flex gap-3 p-4 text-[0.9375rem]"
      >
        <Info size={20} className="mt-1 shrink-0 text-amber" aria-hidden="true" />
        <div className="space-y-2">
          <h2 id="src-notice" className="font-bold">
            {t('sources.disclaimerTitle')}
          </h2>
          <p>{t('footer.disclaimer')}</p>
          <p className="text-ink-dim">{t('sources.estimates')}</p>
        </div>
      </aside>

      <form role="search" className="no-print mb-3 max-w-md" onSubmit={(e) => e.preventDefault()}>
        <label className="flex flex-col gap-1 text-[0.9375rem]">
          <span className="font-bold">{t('sources.search')}</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-h-11 rounded-chip border border-line-strong bg-deep px-2 text-ink"
          />
        </label>
      </form>
      <p className="mb-8 font-mono text-[0.875rem] text-ink-dim" aria-live="polite">
        {total === 0 ? t('sources.none') : t('sources.count', { count: total })}
      </p>

      <div className="space-y-10">
        {groups.map((g) => (
          <section
            key={g.id}
            id={`fuentes-${g.id}`}
            aria-labelledby={`src-${g.id}`}
            tabIndex={-1}
            className="scroll-mt-20 outline-none"
          >
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-2">
              <h2 id={`src-${g.id}`} className="font-heading text-[length:var(--fs-h3)] font-bold">
                {g.machine && (
                  <span className="mr-2 font-mono text-[0.8125rem] font-normal text-ink-dim">
                    {String(g.machine.order).padStart(2, '0')}
                  </span>
                )}
                {g.name}
              </h2>
              <p className="font-mono text-[0.8125rem] text-ink-dim">
                {t('sources.groupCount', { count: g.sources.length })}
              </p>
            </div>
            <ul className="space-y-3">
              {g.sources.map((s) => (
                <li key={s.id} data-source={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1 font-bold"
                    aria-label={t('sources.open', { title: s.title })}
                  >
                    <span>{s.title}</span>
                    <ExternalLink size={14} className="mt-1.5 shrink-0" aria-hidden="true" />
                  </a>
                  <p className="text-[0.9375rem] text-ink-dim">
                    {s.publisher} ·{' '}
                    {t('sources.accessed', { date: formatDate(s.accessed, locale) })}
                  </p>
                </li>
              ))}
            </ul>
            {g.machine && (
              <p className="no-print mt-3 text-[0.9375rem]">
                <Link to={`/maquinas/${g.machine.id}`}>
                  {t('sources.toChapter', { name: g.machine.name[locale] })}
                </Link>
              </p>
            )}
          </section>
        ))}
      </div>
    </PageShell>
  );
}
