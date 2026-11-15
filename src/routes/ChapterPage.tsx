import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLenis } from '../hooks/useLenis';
import { useAppStore } from '../state/useAppStore';
import { ChapterSection } from '../components/chapter/ChapterSection';
import { MACHINES_BY_ID, nextMachine, prevMachine } from '../data/machines';
import { isMachineId } from '../data/ids';
import { NotFoundPage } from './NotFoundPage';
import { BEATS } from '../state/useJourneyStore';
import { refreshScroll } from '../hooks/useScrollProgress';

/** Capítulo individual por URL directa: /maquinas/:id?momento=work (Parte 8.7). */
export function ChapterPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const reduced = useAppStore((s) => s.reducedMotion);
  const machine = isMachineId(id) ? MACHINES_BY_ID[id] : null;
  useDocumentTitle(machine ? machine.name[locale] : t('routes.notFound'));
  useLenis(!reduced && Boolean(machine));
  const beat = params.get('momento');

  useEffect(() => {
    refreshScroll();
    if (!machine || !beat || !(BEATS as readonly string[]).includes(beat)) {
      window.scrollTo(0, 0);
      return;
    }
    const tm = window.setTimeout(() => {
      document.querySelector(`[data-beat='${beat}']`)?.scrollIntoView({ block: 'start' });
    }, 150);
    return () => window.clearTimeout(tm);
  }, [machine, beat]);

  if (!machine) return <NotFoundPage />;
  const prev = prevMachine(machine.id);
  const next = nextMachine(machine.id);
  return (
    <div className="relative" data-act={machine.world}>
      <ChapterSection key={machine.id} machine={machine} standalone />
      <nav
        aria-label={t('index.title')}
        className="flex flex-wrap justify-between gap-3 px-4 pb-24 sm:px-10 lg:pl-28"
      >
        {prev ? (
          <Link className="btn btn-ghost" to={`/maquinas/${prev.id}`}>
            ← {prev.name[locale]}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link className="btn btn-ghost" to={`/maquinas/${next.id}`}>
            {next.name[locale]} →
          </Link>
        )}
      </nav>
    </div>
  );
}
