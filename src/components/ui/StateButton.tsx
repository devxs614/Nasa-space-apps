import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export interface StateButtonProps<S extends string> {
  state: S;
  /** Un texto por estado: lo que pasará al pulsar. */
  labels: Record<S, string>;
  onPress: () => void;
  /** Para interruptores (encendido/apagado). */
  pressed?: boolean;
  /** Si existe, el botón se deshabilita y muestra el motivo. */
  disabledReason?: string;
  /** Anillo que late hasta el primer uso (contorno fijo con movimiento reducido). */
  attention?: boolean;
  className?: string;
  /** Eventos extra (mantener pulsado, teclas) y atributos `data-*`. */
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement> & Record<`data-${string}`, unknown>;
}

/**
 * Botón principal que siempre dice lo que hará (corrección D). Todas las etiquetas se apilan en la
 * misma celda y solo se ve la del estado actual: el ancho no salta al cambiar el texto.
 */
export function StateButton<S extends string>({
  state,
  labels,
  onPress,
  pressed,
  disabledReason,
  attention,
  className,
  buttonProps,
}: StateButtonProps<S>) {
  const keys = Object.keys(labels) as S[];
  const disabled = Boolean(disabledReason);
  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        {...buttonProps}
        data-variant="primary"
        data-state={state}
        aria-pressed={pressed}
        aria-disabled={disabled || undefined}
        aria-label={disabled ? `${labels[state]}. ${disabledReason}` : labels[state]}
        onClick={() => {
          if (!disabled) onPress();
        }}
        className={cx(
          'btn btn-primary !grid',
          attention && !disabled && 'btn-attention',
          className,
        )}
      >
        {keys.map((k) => (
          <span
            key={k}
            className="[grid-area:1/1]"
            style={{ visibility: k === state ? 'visible' : 'hidden' }}
            aria-hidden="true"
          >
            {labels[k]}
          </span>
        ))}
      </button>
      {disabledReason && <span className="text-[0.875rem] text-ink-dim">{disabledReason}</span>}
    </div>
  );
}
