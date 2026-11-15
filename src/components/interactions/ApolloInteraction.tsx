import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import {
  APOLLO_LANDINGS,
  APOLLO_LANDINGS_SOURCES,
  APOLLO11_PLAQUE,
  MACHINES_BY_ID,
  getFact,
} from '../../data/machines';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { formatDate } from '../../lib/format';
import { SourceBadge } from '../ui/SourceBadge';
import { cx } from '../../lib/cx';

/** 2. Etapas de descenso Apollo — "Seis sitios, una despedida". */
export function ApolloInteraction({
  express,
  reducedMotion,
  onComplete,
  onSkip,
}: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const setFx = useJourneyStore((s) => s.setFx);
  const { done, finish } = useDone(onComplete);
  const [sel, setSel] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [lifted, setLifted] = useState(false);
  const site = APOLLO_LANDINGS[sel]!;
  const goodwill = getFact(MACHINES_BY_ID['apollo-lm'], 'goodwill');

  useEffect(() => {
    if (visited.size >= 2 && lifted) finish();
  });
  useEffect(() => () => setFx('liftoff', 0), [setFx]);

  const liftoff = () => {
    setLifted(true);
    if (reducedMotion) {
      setFx('liftoff', 1);
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 2500);
      setFx('liftoff', k * k);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <Shell
      title={t('ix.apollo.title')}
      done={done}
      successText={t('ix.apollo.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setVisited(new Set([0, 1]));
        liftoff();
        finish();
      }}
      illustrative={false}
      live={t('ix.apollo.visited', { n: visited.size })}
    >
      <fieldset>
        <legend className="mb-2">{t('ix.apollo.pick')}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {APOLLO_LANDINGS.map((l, i) => (
            <label
              key={l.site}
              className={cx(
                'btn btn-sm justify-start border-line',
                sel === i ? 'btn-ghost border-signal text-signal' : 'btn-subtle',
              )}
            >
              <input
                type="radio"
                name="apollo-site"
                className="sr-only"
                checked={sel === i}
                onChange={() => {
                  setSel(i);
                  setVisited((v) => new Set(v).add(i));
                }}
              />
              {l.mission} · {l.lm}
            </label>
          ))}
        </div>
      </fieldset>
      <dl className="mt-3 grid gap-1 font-mono text-[0.875rem] sm:grid-cols-[auto_1fr] sm:gap-x-4">
        <dt className="text-ink-dim">{site.mission}</dt>
        <dd>
          {site.lm} · {formatDate(site.date, locale, true)}
        </dd>
        <dt className="text-ink-dim">{site.place[locale]}</dt>
        <dd>
          {t('ix.apollo.walkers')}: {site.walkers}
        </dd>
      </dl>
      <SourceBadge sourceIds={APOLLO_LANDINGS_SOURCES} className="mt-2" />
      <p className="mt-2 font-mono text-[0.8125rem] text-ink-dim">
        {t('ix.apollo.visited', { n: visited.size })}
      </p>
      {sel === 0 && (
        <div className="mt-3 rounded-card border border-line p-3">
          <p className="font-mono text-[0.8125rem] text-ink-dim">{t('ix.apollo.plaque')}</p>
          <blockquote lang="en" className="font-story text-[1.1rem] italic">
            “{APOLLO11_PLAQUE.original}”
          </blockquote>
          {locale === 'es' && (
            <p className="mt-2 text-[0.9375rem] text-ink-dim">
              {t('ix.apollo.translation')}: {APOLLO11_PLAQUE.es}
            </p>
          )}
          {goodwill && <p className="voice-log mt-2">{goodwill.text?.[locale]}</p>}
        </div>
      )}
      <div className="mt-3">
        <button type="button" className="btn btn-primary" onClick={liftoff} disabled={lifted}>
          {t('ix.apollo.liftoff')}
        </button>
        {lifted && <p className="mt-2">{t('ix.apollo.liftoffDone')}</p>}
      </div>
    </Shell>
  );
}
