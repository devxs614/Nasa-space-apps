import { cx } from '../../lib/cx';
import type { SignalStatus } from '../../state/useJourneyStore';

/** Cinco barras verticales; el estado se anuncia con texto en el botón (decorativo). */
export function SignalMeter({ progress, status }: { progress: number; status: SignalStatus }) {
  const level = status === 'arrived' ? 5 : status === 'traveling' ? 4 : Math.round(progress * 5);
  return (
    <span className="flex h-6 items-end gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cx(
            'w-1.5 rounded-sm transition-colors',
            i <= level ? 'bg-signal' : 'bg-line-strong',
          )}
          style={{ height: `${i * 20}%` }}
        />
      ))}
    </span>
  );
}
