import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { diffYMD, formatList, formatUtcClock } from '../../lib/format';

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

/**
 * Hora UTC de la TopBar. El segundero se escribe directamente en el DOM: una actualización de
 * React por segundo en la barra superior interrumpía, en equipos lentos, cualquier render de baja
 * prioridad que tardase más de un segundo (ver src/lib/loadable.tsx).
 */
function UtcClock({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [initial] = useState(() => formatUtcClock(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => {
      if (ref.current && !document.hidden) ref.current.textContent = formatUtcClock(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className={className} aria-hidden="true">
      <span className="text-ink-dim">UTC </span>
      <span ref={ref} className="tabular">
        {initial}
      </span>
    </span>
  );
}

/** "En silencio desde hace…": cambia como mucho una vez al día, así que se revisa cada minuto. */
function SilenceClock({ since, className }: { since: string; className?: string }) {
  const { t } = useTranslation('ui');
  const now = useNow(60_000);
  const d = diffYMD(since, now);
  const parts: string[] = [];
  if (d.years) parts.push(t('clock.years', { count: d.years }));
  if (d.months) parts.push(t('clock.months', { count: d.months }));
  if (d.days) parts.push(t('clock.days', { count: d.days }));
  const list = formatList(parts, t('clock.listLocale'));
  return <span className={className}>{t('clock.silentFor', { span: list })}</span>;
}

/** Reloj de misión: hora UTC en la TopBar o "En silencio desde hace…" (Parte 16.3). */
export function MissionClock({ mode, since, className }: MissionClockProps) {
  if (mode === 'utc') return <UtcClock className={className} />;
  return since ? <SilenceClock since={since} className={className} /> : null;
}
