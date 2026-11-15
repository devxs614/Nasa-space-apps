import { startTransition, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Printer } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { MACHINES, EPILOGUE_2026 } from '../data/machines';
import { BEATS } from '../state/useJourneyStore';
import { ScriptLines } from '../components/chapter/ScriptLines';
import { VoiceLine } from '../components/chapter/VoiceLine';
import { FactCard } from '../components/chapter/FactCard';
import { Poster } from '../components/media/Poster';
import { SourceBadge } from '../components/ui/SourceBadge';
import {
  AulaQuestions,
  ProPanel,
  TodayAndLegacy,
  useDiscoveryCards,
} from '../components/chapter/ChapterExtras';
import { useAppStore } from '../state/useAppStore';
import { ACTS, census } from '../data/acts';
import type { Machine } from '../data/types';
import { formatDate } from '../lib/format';

function Cards({ machine }: { machine: Machine }) {
  const cards = useDiscoveryCards(machine);
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <li key={c.key} className="panel-solid p-4">
          <p className="font-bold">{c.title}</p>
          <p className="mt-1 text-[0.9375rem] text-ink-dim">{c.body}</p>
          <SourceBadge sourceIds={c.sourceIds} approx={c.approx} className="mt-2" />
        </li>
      ))}
    </ul>
  );
}

function ChapterArticle({ machine }: { machine: Machine }) {
  const { t } = useTranslation(['ui', 'common', 'chapters']);
  const locale = useAppStore((s) => s.locale);
  const facts = machine.facts.filter((f) => !f.pending);
  const allSources = [...new Set(facts.flatMap((f) => f.sourceIds))];
  return (
    <article
      id={`lectura-${machine.id}`}
      data-chapter={machine.id}
      className="print-break cv-auto border-t border-line pt-12"
      aria-labelledby={`h-${machine.id}`}
    >
      <p className="font-mono text-[0.8125rem] tracking-[0.2em] text-accent uppercase">
        {t('beat.chapterKicker', { n: machine.order, world: t(`common:worlds.${machine.world}`) })}
      </p>
      <h2 id={`h-${machine.id}`} className="mt-2 font-heading text-[length:var(--fs-h2)] font-bold">
        {machine.name[locale]}
      </h2>
      <p className="mt-1 font-story text-[1.25rem] text-ink-dim italic">
        {machine.chapterTitle[locale]}
      </p>
      <Poster name={machine.id} alt={t('beat.noPhoto')} className="mt-6" />
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-[0.875rem] sm:grid-cols-4">
        {machine.launch && (
          <div>
            <dt className="text-ink-dim">{t('common:dates.launch')}</dt>
            <dd>{formatDate(machine.launch.date, locale)}</dd>
          </div>
        )}
        {machine.arrival && (
          <div>
            <dt className="text-ink-dim">{t(`common:arrivalKind.${machine.arrival.kind}`)}</dt>
            <dd>{formatDate(machine.arrival.date, locale)}</dd>
          </div>
        )}
        {!machine.lastSignal.noteOnly && (
          <div>
            <dt className="text-ink-dim">{t('common:dates.lastSignal')}</dt>
            <dd>{formatDate(machine.lastSignal.date, locale)}</dd>
          </div>
        )}
        {machine.missionEnd && (
          <div>
            <dt className="text-ink-dim">{t('common:dates.missionEnd')}</dt>
            <dd>{formatDate(machine.missionEnd.date, locale)}</dd>
          </div>
        )}
      </dl>
      {BEATS.map((b) => (
        <section key={b} aria-labelledby={`h-${machine.id}-${b}`} className="mt-10">
          <h3 id={`h-${machine.id}-${b}`} className="mb-4 font-heading text-[length:var(--fs-h3)]">
            {t(`common:beats.${b}`)}
          </h3>
          <ScriptLines machine={machine} beat={b} />
          {b === 'work' && (
            <div className="mt-6">
              <Cards machine={machine} />
            </div>
          )}
          {b === 'legacy' && (
            <div className="mt-6">
              <TodayAndLegacy machine={machine} />
            </div>
          )}
          <p className="mt-3 text-[0.9375rem] text-ink-dim italic">
            <span className="sr-only">{t('beat.describe')}: </span>
            {t(`chapters:${machine.id}.${b}.sceneAlt`)}
          </p>
        </section>
      ))}
      <ProPanel machine={machine} open className="mt-8" />
      <AulaQuestions machine={machine} className="mt-4" />
      <section className="mt-8" aria-labelledby={`h-${machine.id}-facts`}>
        <h3 id={`h-${machine.id}-facts`} className="mb-4 font-heading text-[length:var(--fs-h3)]">
          {t('reading.facts')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((f) => (
            <FactCard key={f.id} fact={f} />
          ))}
        </div>
        <SourceBadge sourceIds={allSources} className="mt-4" />
      </section>
    </article>
  );
}

export function ReadingModePage() {
  const { t } = useTranslation(['ui', 'chapters', 'common']);
  const locale = useAppStore((s) => s.locale);
  const c = census();
  // Primero el comienzo; los demás capítulos en una transición que cede el hilo (Parte 5.9, móvil).
  const [full, setFull] = useState(false);
  const { hash } = useLocation();
  useEffect(() => startTransition(() => setFull(true)), []);
  useEffect(() => {
    if (!full || !hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' });
  }, [full, hash]);
  return (
    <PageShell
      title={t('routes.reading')}
      intro={<p>{t('reading.intro')}</p>}
      className="reading-page"
    >
      <button type="button" className="btn btn-ghost no-print" onClick={() => window.print()}>
        <Printer size={18} aria-hidden="true" />
        {t('reading.print')}
      </button>
      <nav aria-labelledby="toc" className="no-print mt-8">
        <h2
          id="toc"
          className="mb-3 font-mono text-[0.8125rem] tracking-[0.2em] text-ink-dim uppercase"
        >
          {t('reading.toc')}
        </h2>
        <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {MACHINES.map((m) => (
            <li key={m.id}>
              <a href={`#lectura-${m.id}`} className="inline-flex min-h-11 items-center gap-2">
                <span className="font-mono text-ink-dim">{String(m.order).padStart(2, '0')}</span>
                {m.name[locale]}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <section className="mt-12 space-y-4" aria-labelledby="h-prologue">
        <h2 id="h-prologue" className="font-heading text-[length:var(--fs-h2)] font-bold">
          {t('chapters:prologue.title')}
        </h2>
        <VoiceLine speaker="lumi" lumiFull text={t('chapters:prologue.1')} />
        <VoiceLine speaker="lumi" text={t('chapters:prologue.2')} />
        <VoiceLine speaker="lumi" text={t('chapters:prologue.3')} />
        <VoiceLine speaker="log" text={t('chapters:prologue.census', c)} />
        <VoiceLine speaker="lumi" text={t('chapters:prologue.5')} />
        <VoiceLine speaker="lumi" text={t('chapters:prologue.6')} />
      </section>
      {ACTS.map((act) => (
        <div key={act.world}>
          <section className="mt-16" aria-labelledby={`h-act-${act.world}`}>
            <p className="font-mono text-[0.8125rem] tracking-[0.2em] text-accent uppercase">
              {t(`common:worldsAct.${act.world}`)} · {act.years[0]}–{act.years[1]}
            </p>
            <h2
              id={`h-act-${act.world}`}
              className="mt-2 font-heading text-[length:var(--fs-h2)] font-bold uppercase"
            >
              {t(`chapters:acts.${act.world}.title`)}
            </h2>
            <VoiceLine
              speaker="lumi"
              text={t(`chapters:acts.${act.world}.lumi`)}
              className="mt-4"
            />
          </section>
          <div className="mt-8 space-y-16">
            {act.machines.map((id) => {
              const m = MACHINES.find((x) => x.id === id);
              return m && (full || m.order <= 2) ? <ChapterArticle key={id} machine={m} /> : null;
            })}
          </div>
        </div>
      ))}
      {full && (
        <section
          className="print-break mt-16 space-y-4 border-t border-line pt-12"
          aria-labelledby="h-epilogue"
        >
          <h2 id="h-epilogue" className="font-heading text-[length:var(--fs-h2)] font-bold">
            {t('chapters:epilogue.title')}
          </h2>
          <VoiceLine speaker="lumi" text={t('chapters:epilogue.1')} />
          <VoiceLine speaker="lumi" text={t('chapters:epilogue.2')} />
          <h3 className="pt-4 font-heading text-[length:var(--fs-h3)]">
            {t('chapters:epilogue.yearTitle')}
          </h3>
          {EPILOGUE_2026.map((e) => (
            <VoiceLine key={e.id} speaker="log" text={e.text[locale]} sourceIds={e.sourceIds} />
          ))}
          <VoiceLine speaker="lumi" text={t('chapters:epilogue.4')} />
          <VoiceLine speaker="lumi" text={t('chapters:epilogue.5')} />
        </section>
      )}
    </PageShell>
  );
}
