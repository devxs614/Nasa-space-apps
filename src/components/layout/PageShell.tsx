import type { ReactNode } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { cx } from '../../lib/cx';

export interface PageShellProps {
  title: string;
  kicker?: string;
  intro?: ReactNode;
  children?: ReactNode;
  wide?: boolean;
  className?: string;
}

/** Contenedor de páginas secundarias: un h1 por ruta y título del documento. */
export function PageShell({ title, kicker, intro, children, wide, className }: PageShellProps) {
  useDocumentTitle(title);
  return (
    <div
      className={cx(
        'relative mx-auto px-6 pt-24 pb-24 sm:px-10 lg:px-16',
        wide ? 'max-w-[1400px]' : 'max-w-5xl',
        className,
      )}
    >
      <header className="mb-10">
        {kicker && (
          <p className="mb-3 font-mono text-[0.8125rem] tracking-[0.2em] text-accent uppercase">
            {kicker}
          </p>
        )}
        <h1 className="font-heading text-[length:var(--fs-h1)] font-bold">{title}</h1>
        {intro && <div className="reading-col mt-5 text-ink-dim">{intro}</div>}
      </header>
      {children}
    </div>
  );
}
