import { useTranslation } from 'react-i18next';
import type { Site, SiteKind } from '../../data/types';
import { useAppStore } from '../../state/useAppStore';
import { cx } from '../../lib/cx';

export const KIND_ORDER: readonly SiteKind[] = [
  'lander',
  'rover-end',
  'instrument',
  'retroreflector',
  'impact',
];
/** Mismo color que la baliza del globo; siempre acompañado de texto. */
export const KIND_DOT: Record<SiteKind, string> = {
  lander: 'bg-signal',
  'rover-end': 'bg-signal',
  instrument: 'bg-signal',
  retroreflector: 'bg-phosphor',
  impact: 'bg-amber',
};

export interface SiteListProps {
  sites: readonly Site[];
  selectedId: string | null;
  /** `via` distingue el foco del teclado de una pulsación. */
  onSelect: (site: Site, via: 'focus' | 'click') => void;
  labelledBy: string;
}

/**
 * Lista de marcadores de un mundo (Parte 16.9): la alternativa accesible a pulsar en el globo.
 * Al enfocar o pulsar un sitio, el globo gira hacia él.
 */
export function SiteList({ sites, selectedId, onSelect, labelledBy }: SiteListProps) {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  if (sites.length === 0) return <p className="text-ink-dim">{t('atlas.none')}</p>;
  return (
    <ul aria-labelledby={labelledBy} className="space-y-1" data-site-list>
      {sites.map((s) => {
        const on = s.id === selectedId;
        return (
          <li key={s.id}>
            <button
              type="button"
              data-site={s.id}
              aria-current={on ? 'true' : undefined}
              onFocus={() => {
                if (!on) onSelect(s, 'focus');
              }}
              onClick={() => onSelect(s, 'click')}
              className={cx(
                'flex min-h-11 w-full items-center gap-3 rounded-chip border px-2 py-1 text-left',
                on ? 'border-signal bg-signal/10 text-ink' : 'border-transparent hover:bg-white/5',
              )}
            >
              <span
                aria-hidden="true"
                className={cx('h-2.5 w-2.5 shrink-0 rounded-full', KIND_DOT[s.kind])}
              />
              <span className="min-w-0 flex-1">
                <span className="block">{s.label[locale]}</span>
                <span className="block font-mono text-[0.8125rem] text-ink-dim">
                  {t(`common:siteKind.${s.kind}`)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
