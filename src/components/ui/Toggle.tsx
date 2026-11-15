import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../lib/cx';

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Interruptor accesible: el estado se dice con texto, no solo con color. */
export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  const { t } = useTranslation('ui');
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p id={`${id}-l`} className="font-bold text-ink">
          {label}
        </p>
        {description && (
          <p id={`${id}-d`} className="mt-1 text-[0.9375rem] text-ink-dim">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        aria-describedby={description ? `${id}-d` : undefined}
        aria-disabled={disabled || undefined}
        onClick={() => !disabled && onChange(!checked)}
        className="flex min-h-11 shrink-0 items-center gap-2 rounded-full px-1"
      >
        <span
          aria-hidden="true"
          className={cx(
            'relative h-7 w-12 rounded-full border transition-colors',
            checked ? 'border-signal bg-signal/30' : 'border-line-strong bg-deep',
          )}
        >
          <span
            className={cx(
              'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-[left]',
              checked ? 'left-6 bg-signal' : 'left-1 bg-ink-dim',
            )}
          />
        </span>
        <span className="w-20 text-left font-mono text-[0.8125rem] text-ink-dim">
          {checked ? t('common.on') : t('common.off')}
        </span>
      </button>
    </div>
  );
}
