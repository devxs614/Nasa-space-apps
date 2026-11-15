import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Check, Circle, CircleDot } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { useUiStore } from '../../state/useUiStore';
import { useAppStore } from '../../state/useAppStore';
import { MACHINES } from '../../data/machines';
import { WORLDS } from '../../data/ids';

/** Menú de capítulos (tecla M): las 15 máquinas por mundo y accesos a las páginas. */
export function ChapterIndex() {
  const { t } = useTranslation(['ui', 'common']);
  const open = useUiStore((s) => s.indexOpen);
  const setOpen = useUiStore((s) => s.setIndexOpen);
  const locale = useAppStore((s) => s.locale);
  const progress = useAppStore((s) => s.progress);
  const navigate = useNavigate();
  const close = () => setOpen(false);
  const go = (hash: string) => {
    close();
    void navigate(`/#${hash}`);
  };
  const links: [string, string][] = [
    ['/atlas/luna', 'routes.atlasMoon'],
    ['/atlas/marte', 'routes.atlasMars'],
    ['/maquinas', 'routes.catalog'],
    ['/linea-de-tiempo', 'routes.timeline'],
    ['/pasaporte', 'routes.passport'],
    ['/fuentes', 'routes.sources'],
    ['/lectura', 'routes.reading'],
    ['/acerca', 'routes.about'],
  ];
  return (
    <Dialog open={open} onClose={close} title={t('index.title')} full>
      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="grid gap-6 sm:grid-cols-2">
          {WORLDS.map((w) => (
            <section key={w} aria-labelledby={`idx-${w}`}>
              <h3
                id={`idx-${w}`}
                className="mb-2 font-mono text-[0.8125rem] tracking-[0.2em] text-ink-dim uppercase"
              >
                {t(`common:worldsAct.${w}`)} · {t(`common:worlds.${w}`)}
              </h3>
              <ul className="space-y-1">
                {MACHINES.filter((m) => m.world === w).map((m) => {
                  const p = progress[m.id];
                  const state = p?.completed ? 'completed' : p?.visited ? 'visited' : 'new';
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => go(m.id)}
                        className="flex min-h-11 w-full items-center gap-3 rounded-chip px-2 text-left hover:bg-white/5"
                      >
                        {state === 'completed' ? (
                          <Check size={16} className="text-phosphor" aria-hidden="true" />
                        ) : state === 'visited' ? (
                          <CircleDot size={16} className="text-signal" aria-hidden="true" />
                        ) : (
                          <Circle size={16} className="text-ink-dim" aria-hidden="true" />
                        )}
                        <span className="font-mono text-[0.8125rem] text-ink-dim">
                          {String(m.order).padStart(2, '0')}
                        </span>
                        <span className="flex-1">{m.name[locale]}</span>
                        <span className="sr-only">· {t(`index.state_${state}`)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <nav aria-labelledby="idx-explore">
          <h3
            id="idx-explore"
            className="mb-2 font-mono text-[0.8125rem] tracking-[0.2em] text-ink-dim uppercase"
          >
            {t('index.explore')}
          </h3>
          <ul className="space-y-1">
            {links.map(([to, key]) => (
              <li key={to}>
                <Link
                  to={to}
                  onClick={close}
                  className="flex min-h-11 items-center rounded-chip px-2 hover:bg-white/5"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Dialog>
  );
}
