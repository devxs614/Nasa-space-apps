import { useTranslation } from 'react-i18next';
import { BadgeCheck, ExternalLink } from 'lucide-react';
import { Popover } from './Popover';
import { sortSources } from '../../data/sources';
import { formatDate } from '../../lib/format';
import { useAppStore } from '../../state/useAppStore';
import { cx } from '../../lib/cx';

export interface SourceBadgeProps {
  sourceIds: readonly string[];
  approx?: boolean;
  estimate?: boolean;
  className?: string;
}

/** Chip "✔ Dato verificado" que abre un popover con cada fuente (Parte 16.4). */
export function SourceBadge({ sourceIds, approx, estimate, className }: SourceBadgeProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const list = sortSources(sourceIds);
  if (list.length === 0) return null;
  return (
    <span className={cx('inline-flex flex-wrap items-center gap-1.5 align-middle', className)}>
      <Popover
        title={t('sources.popoverTitle')}
        triggerLabel={t('sources.badgeLabel', { count: list.length })}
        triggerClassName="inline-flex min-h-8 items-center gap-1 rounded-full border border-phosphor/50 bg-void/70 px-2 font-mono text-[0.8125rem] text-phosphor hover:border-phosphor focus-visible:border-phosphor"
        trigger={
          <>
            <BadgeCheck size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>{t('badge.verified')}</span>
          </>
        }
      >
        <p className="mb-2 font-mono text-[0.8125rem] tracking-wider text-ink-dim uppercase">
          {t('sources.popoverTitle')}
        </p>
        <ul className="space-y-3">
          {list.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1 font-bold"
                aria-label={t('sources.open', { title: s.title })}
              >
                <span>{s.title}</span>
                <ExternalLink size={14} className="mt-1 shrink-0" aria-hidden="true" />
              </a>
              <p className="text-ink-dim">
                {s.publisher} · {t('sources.accessed', { date: formatDate(s.accessed, locale) })}
              </p>
            </li>
          ))}
        </ul>
      </Popover>
      {approx && (
        <span className="font-mono text-[0.8125rem] text-amber">≈ {t('badge.approx')}</span>
      )}
      {estimate && (
        <span className="font-mono text-[0.8125rem] text-amber">{t('badge.estimate')}</span>
      )}
    </span>
  );
}
