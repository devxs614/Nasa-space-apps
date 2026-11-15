import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { ACTS } from '../../data/acts';
import { MACHINES_BY_ID } from '../../data/machines';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { scrollToEl } from '../../hooks/useLenis';
import { cx } from '../../lib/cx';

/** Riel de progreso: izquierda en escritorio, abajo en móvil (Parte 8.6). */
export function ProgressRail() {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const progress = useAppStore((s) => s.progress);
  const current = useJourneyStore((s) => s.chapterId);
  return (
    <nav
      aria-label={t('rail.label')}
      className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-line bg-void/85 px-2 py-1 backdrop-blur-md lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-4 lg:-translate-y-1/2 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
    >
      <ol className="flex items-center justify-between gap-1 lg:flex-col lg:items-start lg:gap-3">
        {ACTS.map((act) => (
          <li key={act.world} className="flex-1 lg:flex-none">
            <ol
              className="flex items-center justify-center gap-0.5 border-t-2 border-accent/40 pt-1 lg:flex-col lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-2"
              data-act={act.world}
            >
              {act.machines.map((id) => {
                const m = MACHINES_BY_ID[id];
                const p = progress[id];
                const state = p?.completed ? 'completed' : p?.visited ? 'visited' : 'new';
                const isCurrent = current === id;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={isCurrent ? 'step' : undefined}
                      aria-label={t('rail.item', {
                        n: m.order,
                        name: m.name[locale],
                        state: t(`rail.state_${state}`),
                      })}
                      title={m.name[locale]}
                      onClick={(e) => {
                        const el = document.getElementById(id);
                        if (!el) return;
                        e.preventDefault();
                        scrollToEl(el);
                        history.replaceState(null, '', `#${id}`);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full sm:h-7 sm:w-7"
                    >
                      <span
                        className={cx(
                          'flex h-3 w-3 items-center justify-center rounded-full border',
                          state === 'new' && 'border-ink-dim',
                          state !== 'new' && 'border-accent bg-accent/60',
                          isCurrent &&
                            'h-4 w-4 border-signal bg-signal shadow-[0_0_10px_var(--signal)]',
                        )}
                      >
                        {state === 'completed' && !isCurrent && (
                          <Check
                            size={9}
                            strokeWidth={3}
                            className="text-void"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </nav>
  );
}
