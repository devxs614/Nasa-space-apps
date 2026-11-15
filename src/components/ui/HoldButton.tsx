import { useEffect, useRef } from 'react';
import { Radio } from 'lucide-react';
import { useHoldToSend } from '../../hooks/useHoldToSend';
import { SEND_SIGNAL_EVENT } from '../../hooks/useHotkeys';
import { cx } from '../../lib/cx';

export interface HoldButtonProps {
  onSend: () => void;
  label: string;
  /** Texto adicional para lectores de pantalla (nombre de la máquina y tiempo de luz). */
  srLabel: string;
  instant?: boolean;
  disabled?: boolean;
  onProgress?: (p: number) => void;
  /** Escucha la barra espaciadora global mientras el botón está en pantalla (Parte 8.6). */
  listenSpace?: boolean;
}

const R = 28;
const C = 2 * Math.PI * R;

/** Botón de señal con anillo de carga (Parte 16.5). */
export function HoldButton({
  onSend,
  label,
  srLabel,
  instant,
  disabled,
  onProgress,
  listenSpace,
}: HoldButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { progress, handlers } = useHoldToSend(() => !disabled && onSend(), { instant });
  useEffect(() => onProgress?.(progress), [progress, onProgress]);

  useEffect(() => {
    if (!listenSpace || disabled) return;
    const on = (e: Event) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      e.preventDefault();
      onSend();
    };
    window.addEventListener(SEND_SIGNAL_EVENT, on);
    return () => window.removeEventListener(SEND_SIGNAL_EVENT, on);
  }, [listenSpace, disabled, onSend]);

  return (
    <button
      ref={ref}
      type="button"
      aria-disabled={disabled || undefined}
      {...handlers}
      onClick={(e) => {
        // Clic sintético sin puntero ni teclado (p. ej. lectores de pantalla): envía directamente.
        if (e.detail === 0 && !disabled) onSend();
      }}
      className={cx(
        'group relative flex min-h-[72px] items-center gap-4 rounded-full border border-signal/60 bg-void/80 py-2 pr-6 pl-2 text-left font-bold text-ink transition-colors hover:border-signal',
        disabled && 'opacity-60',
      )}
      style={{ touchAction: 'none' }}
    >
      <span
        className="relative flex h-16 w-16 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        {!disabled && (
          <>
            <span className="signal-ring" />
            <span className="signal-ring" />
            <span className="signal-ring" />
          </>
        )}
        <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
          <circle cx="32" cy="32" r={R} fill="none" stroke="var(--line-strong)" strokeWidth="2" />
          <circle
            cx="32"
            cy="32"
            r={R}
            fill="none"
            stroke="var(--signal)"
            strokeWidth="3"
            strokeDasharray={C}
            strokeDashoffset={(1 - progress) * C}
            strokeLinecap="round"
          />
        </svg>
        <Radio size={26} strokeWidth={1.5} className="text-signal" />
      </span>
      <span>
        {label}
        <span className="sr-only">. {srLabel}</span>
      </span>
    </button>
  );
}
