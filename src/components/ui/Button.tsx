import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../lib/cx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconOnly?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

/** Botón base. `iconOnly` exige `aria-label`. Altura mínima de 44 px. */
export function Button({
  variant = 'ghost',
  size = 'md',
  icon,
  iconOnly,
  className,
  children,
  type = 'button',
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'btn',
        `btn-${variant}`,
        size === 'sm' && 'btn-sm',
        size === 'lg' && 'btn-lg',
        iconOnly && 'btn-icon',
        className,
      )}
      {...rest}
    >
      {icon}
      {!iconOnly && children}
    </button>
  );
}
