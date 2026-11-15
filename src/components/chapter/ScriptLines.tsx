import { useTranslation } from 'react-i18next';
import type { Machine, Locale } from '../../data/types';
import type { BeatId } from '../../state/useJourneyStore';
import { SCRIPTS, type ScriptLine } from '../../data/script';
import { resolveRef, resolveVars } from '../../lib/resolve';
import { useAppStore } from '../../state/useAppStore';
import { VoiceLine } from './VoiceLine';
import { cx } from '../../lib/cx';

export interface ResolvedLine {
  speaker: ScriptLine['s'];
  text: string;
  who?: string;
  sourceIds: string[];
  approx?: boolean;
}

/** Resuelve una línea del guion a texto final y fuentes (null si el dato no se puede mostrar). */
export function resolveLine(
  t: (key: string, opts?: Record<string, unknown>) => string,
  m: Machine,
  beat: BeatId,
  line: ScriptLine,
  locale: Locale,
): ResolvedLine | null {
  const who = line.who ? t(`chapters:${m.id}.voices.${line.who}`) : undefined;
  if (line.ref) {
    const r = resolveRef(m, line.ref, locale);
    return r
      ? { speaker: line.s, text: r.text, who, sourceIds: r.sourceIds, approx: r.approx }
      : null;
  }
  if (!line.k) return null;
  const key = `chapters:${m.id}.${beat}.${line.k}`;
  if (line.vars) {
    const v = resolveVars(m, line.vars, locale);
    if (!v) return null;
    return { speaker: line.s, text: t(key, v.values), who, sourceIds: v.sourceIds };
  }
  return { speaker: line.s, text: t(key), who, sourceIds: [] };
}

export interface ScriptLinesProps {
  machine: Machine;
  beat: BeatId;
  /** 'before' muestra las líneas previas a la señal; 'after', las que llegan con ella; 'all', todas. */
  phase?: 'before' | 'after' | 'all';
  className?: string;
}

export function ScriptLines({ machine, beat, phase = 'all', className }: ScriptLinesProps) {
  const { t } = useTranslation(['chapters', 'ui']);
  const locale = useAppStore((s) => s.locale);
  const lines = SCRIPTS[machine.id][beat].filter((l) =>
    phase === 'all' ? true : phase === 'after' ? Boolean(l.afterSignal) : !l.afterSignal,
  );
  const tt = (key: string, opts?: Record<string, unknown>) => t(key, opts ?? {});
  return (
    <div className={cx('space-y-4', className)}>
      {lines.map((l, i) => {
        const r = resolveLine(tt, machine, beat, l, locale);
        if (!r) return null;
        return (
          <VoiceLine
            key={`${beat}-${i}`}
            speaker={r.speaker}
            text={r.text}
            who={r.who}
            sourceIds={r.sourceIds}
            approx={r.approx}
          />
        );
      })}
    </div>
  );
}
