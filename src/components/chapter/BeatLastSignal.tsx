import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';
import type { Machine } from '../../data/types';
import { BeatShell } from './BeatShell';
import { ScriptLines } from './ScriptLines';
import { Oscilloscope } from '../hud/Oscilloscope';
import { MissionClock } from '../hud/MissionClock';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { formatDate } from '../../lib/format';
import { SourceBadge } from '../ui/SourceBadge';

/** "Última señal": el osciloscopio queda plano y aparece la fecha de la última señal (Parte 8.2). */
export function BeatLastSignal({ machine }: { machine: Machine }) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const setFx = useJourneyStore((s) => s.setFx);
  const amp = useCallback(() => {
    const js = useJourneyStore.getState();
    if (js.chapterId !== machine.id || js.beat !== 'lastSignal') return 1;
    return 1 - Math.min(1, js.beatProgress / 0.7);
  }, [machine.id]);
  const onProgress = (p: number) => {
    if (machine.id === 'opportunity') setFx('storm', Math.min(1, Math.max(0, (p - 0.05) / 0.6)));
  };
  return (
    <BeatShell machine={machine} beat="lastSignal" onProgress={onProgress}>
      <ScriptLines machine={machine} beat="lastSignal" />
      <div className="panel-solid hud-corners p-4">
        <Oscilloscope amplitude={amp} color="var(--alert)" className="h-12 w-full" />
        <p className="mt-2 flex items-center gap-2 font-mono text-[0.875rem] text-alert">
          <Activity size={16} aria-hidden="true" />
          {t('signal.silent')}
          {!machine.lastSignal.noteOnly && (
            <span>· {formatDate(machine.lastSignal.date, locale)}</span>
          )}
        </p>
        {!machine.lastSignal.noteOnly && (
          <MissionClock
            mode="silence"
            since={machine.lastSignal.date}
            className="mt-1 block font-mono text-[0.875rem] text-ink-dim"
          />
        )}
        <SourceBadge sourceIds={machine.lastSignal.sourceIds} className="mt-3" />
      </div>
    </BeatShell>
  );
}
