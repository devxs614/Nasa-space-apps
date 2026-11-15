import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { diffYMD, formatUtcClock } from '../../lib/format';

export interface MissionClockProps {
  mode: 'utc' | 'silence';
  /** Fecha ISO de la última señal (modo silence). */
  since?: string;
  className?: string;
}

function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) setNow(new Date());
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Reloj de misión: hora UTC en la TopBar o "En silencio desde hace…" (Parte 16.3). */
export function MissionClock({ mode, since, className }: MissionClockProps) {
  const { t } = useTranslation('ui');
  const now = useNow(mode === 'utc' ? 1000 : 60_000);
  if (mode === 'utc') {
    return (
      <span className={className} aria-hidden="true">
        <span className="text-ink-dim">UTC </span>
        <span className="tabular">{formatUtcClock(now)}</span>
      </span>
    );
  }
  if (!since) return null;
  const d = diffYMD(since, now);
  const parts: string[] = [];
  if (d.years) parts.push(t('clock.years', { count: d.years }));
  if (d.months) parts.push(t('clock.months', { count: d.months }));
  if (d.days) parts.push(t('clock.days', { count: d.days }));
  const list = new Intl.ListFormat(t('clock.listLocale'), {
    style: 'long',
    type: 'conjunction',
  }).format(parts);
  return <span className={className}>{t('clock.silentFor', { span: list })}</span>;
}
