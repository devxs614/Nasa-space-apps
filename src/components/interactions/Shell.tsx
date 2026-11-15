import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, FastForward, SkipForward } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { playSfx } from '../../audio/play';
import { cx } from '../../lib/cx';

export interface ShellProps {
  title: string;
  done: boolean;
  successText: string;
  live?: string;
  express?: boolean;
  onSkip: () => void;
  onSeeResult?: () => void;
  children: ReactNode;
  illustrative?: boolean;
  label?: string;
}

/** Contrato común de las mini-experiencias (Parte 13.1): saltar, ver resultado, resumen accesible. */
export function Shell({
  title,
  done,
  successText,
  live,
  express,
  onSkip,
  onSeeResult,
  children,
  illustrative = true,
  label,
}: ShellProps) {
  const { t } = useTranslation('ui');
  const [skipped, setSkipped] = useState(false);
  const wasDone = useRef(done);
  useEffect(() => {
    if (done && !wasDone.current) playSfx('right');
    wasDone.current = done;
  }, [done]);
  return (
    <section
      className="panel-solid hud-corners p-4"
      aria-label={title}
      data-keys="own"
      data-interaction
    >
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <h4 className="font-heading text-[length:var(--fs-h3)] font-bold">{title}</h4>
        {illustrative && <Badge tone="info">{label ?? t('ix.illustrative')}</Badge>}
      </header>
      <div className={cx(skipped && !done && 'opacity-60')}>{children}</div>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {done && (
        <p className="mt-3 flex items-start gap-2 text-phosphor" role="status">
          <CheckCircle2 size={18} className="mt-1 shrink-0" aria-hidden="true" />
          {successText}
        </p>
      )}
      {!done && (
        <div className="mt-4 flex flex-wrap gap-2">
          {express && onSeeResult && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onSeeResult}>
              <FastForward size={16} aria-hidden="true" />
              {t('interaction.seeResult')}
            </button>
          )}
          <button
            type="button"
            className="btn btn-subtle btn-sm"
            onClick={() => {
              setSkipped(true);
              onSkip();
            }}
          >
            <SkipForward size={16} aria-hidden="true" />
            {t('interaction.skip')}
          </button>
        </div>
      )}
    </section>
  );
}

/** Marca el fin una sola vez y llama a onComplete. */
export function useDone(onComplete: (r: { score?: number; detail?: string }) => void) {
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const cb = useRef(onComplete);
  cb.current = onComplete;
  const finish = useCallback((detail?: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    cb.current({ detail });
  }, []);
  return { done, finish };
}
