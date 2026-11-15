import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import type { Machine } from '../../data/types';
import { useDiscoveryCards } from './ChapterExtras';
import { Card3D } from '../ui/Card3D';
import { SourceBadge } from '../ui/SourceBadge';
import { cx } from '../../lib/cx';

/** Las tres tarjetas de "El trabajo"; la tercera está velada hasta terminar o saltar la mini-experiencia. */
export function DiscoveryCards({
  machine,
  revealed,
  onReveal,
}: {
  machine: Machine;
  revealed: boolean;
  onReveal: () => void;
}) {
  const { t } = useTranslation('ui');
  const cards = useDiscoveryCards(machine);
  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {cards.map((c, i) => {
        const veiled = i === 2 && !revealed;
        return (
          <li key={c.key}>
            <Card3D className="h-full p-4">
              <p className="font-mono text-[0.8125rem] text-ink-dim">
                {t('beat.discovery', { n: i + 1 })}
              </p>
              <p className="mt-1 font-bold">{c.title}</p>
              {veiled ? (
                <div className="mt-2">
                  <p
                    aria-hidden="true"
                    className={cx('text-[0.9375rem] text-ink-dim blur-sm select-none')}
                  >
                    {c.body.slice(0, 90)}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-[0.9375rem]">
                    <Lock size={16} aria-hidden="true" />
                    {t('beat.revealHint')}
                  </p>
                  <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={onReveal}>
                    {t('beat.revealNow')}
                  </button>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-[0.9375rem] text-ink-dim">{c.body}</p>
                  <SourceBadge sourceIds={c.sourceIds} approx={c.approx} className="mt-3" />
                </>
              )}
            </Card3D>
          </li>
        );
      })}
    </ul>
  );
}
