import { useTranslation } from 'react-i18next';
import type { Machine } from '../../data/types';
import { SCRIPTS } from '../../data/script';
import { resolveRef } from '../../lib/resolve';
import { useAppStore } from '../../state/useAppStore';
import { SourceBadge } from '../ui/SourceBadge';
import { cx } from '../../lib/cx';

/** Las tres tarjetas de descubrimiento de "El trabajo": título (i18n) y dato (machines.ts). */
export function useDiscoveryCards(m: Machine) {
  const { t } = useTranslation('chapters');
  const locale = useAppStore((s) => s.locale);
  return SCRIPTS[m.id].cards.map((c) => {
    const parts = c.refs
      .map((r) => resolveRef(m, r, locale))
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
    return {
      key: c.k,
      title: t(`${m.id}.work.cards.${c.k}`),
      body: parts.map((p) => p.text).join(' '),
      sourceIds: [...new Set(parts.flatMap((p) => p.sourceIds))],
      approx: parts.some((p) => p.approx),
    };
  });
}

export function ProPanel({
  machine,
  open,
  className,
}: {
  machine: Machine;
  open?: boolean;
  className?: string;
}) {
  const { t } = useTranslation(['ui', 'chapters']);
  const pro = useAppStore((s) => s.proMode);
  return (
    <details className={cx('panel-solid group p-4', className)} open={open ?? pro}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-bold text-signal">
        <span aria-hidden="true" className="font-mono transition-transform group-open:rotate-90">
          ›
        </span>
        {t('beat.pro')}
        <span className="font-normal text-ink-dim">· {t('beat.proHint')}</span>
      </summary>
      <p className="mt-2 text-ink">{t(`chapters:${machine.id}.pro`)}</p>
    </details>
  );
}

export function AulaQuestions({ machine, className }: { machine: Machine; className?: string }) {
  const { t } = useTranslation(['ui', 'chapters']);
  return (
    <section
      className={cx('rounded-card border border-line p-4', className)}
      aria-label={t('beat.aula')}
    >
      <h4 className="mb-2 font-mono text-[0.8125rem] tracking-wider text-amber uppercase">
        {t('beat.aula')}
      </h4>
      <ol className="list-decimal space-y-1 pl-5">
        {(['1', '2', '3'] as const).map((n) => (
          <li key={n}>{t(`chapters:${machine.id}.aula.${n}`)}</li>
        ))}
      </ol>
    </section>
  );
}

export function TodayAndLegacy({ machine }: { machine: Machine }) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="panel-solid p-4">
        <h4 className="mb-1 font-mono text-[0.8125rem] tracking-wider text-ink-dim uppercase">
          {t('beat.today')}
        </h4>
        <p>{machine.today.text[locale]}</p>
        <SourceBadge sourceIds={machine.today.sourceIds} className="mt-2" />
      </div>
      <div className="panel-solid p-4">
        <h4 className="mb-1 font-mono text-[0.8125rem] tracking-wider text-ink-dim uppercase">
          {t('beat.chain')}
        </h4>
        <p>{machine.legacy.text[locale]}</p>
      </div>
    </div>
  );
}
