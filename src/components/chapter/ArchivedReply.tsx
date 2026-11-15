import { useTranslation } from 'react-i18next';
import { Archive } from 'lucide-react';
import type { Machine } from '../../data/types';
import { useAppStore } from '../../state/useAppStore';
import { archivedText } from '../../hooks/useSignal';
import { lightTime } from '../../lib/astro';
import { formatDate } from '../../lib/format';
import { SourceBadge } from '../ui/SourceBadge';

/** Tarjeta "Respuesta archivada" con la voz de la Bitácora (Parte 14.2). */
export function ArchivedReply({ machine }: { machine: Machine }) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const isPioneer =
    machine.lightTimeTarget === 'pioneer10' || machine.lightTimeTarget === 'pioneer11';
  let greeting: string | null = null;
  if (isPioneer) {
    const lt = lightTime(machine.lightTimeTarget);
    const when = new Date(Date.now() + (lt.seconds ?? 0) * 1000);
    const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(
      when,
    );
    greeting = t('signal.pioneerGreeting', { craft: 'Pioneer 10', date });
  }
  return (
    <div className="panel-solid hud-corners border-phosphor/50 p-4" data-testid="archived-reply">
      <p className="mb-1 flex items-center gap-2 font-mono text-[0.8125rem] tracking-wider text-phosphor uppercase">
        <Archive size={16} aria-hidden="true" />
        {t('signal.arrivedTitle')}
      </p>
      {greeting && <p className="mb-2 font-bold">{greeting}</p>}
      <p className="voice-log">
        {isPioneer
          ? t('signal.pioneerMemory', { date: formatDate(machine.lastSignal.date, locale) })
          : archivedText((k, o) => t(k, o ?? {}), machine, locale)}
      </p>
      {machine.lastSignal.note && !machine.lastSignal.noteOnly && (
        <p className="voice-log mt-2 text-ink-dim">{machine.lastSignal.note[locale]}</p>
      )}
      <SourceBadge sourceIds={machine.lastSignal.sourceIds} className="mt-3" />
    </div>
  );
}
