import { MACHINES } from './machines';
import type { MachineId, World } from './types';

export type TimelineKind = 'launch' | 'arrival' | 'lastSignal' | 'missionEnd';
export interface TimelineEvent {
  machineId: MachineId;
  kind: TimelineKind;
  date: string;
  sourceIds: string[];
}
export interface TimelineSpan {
  machineId: MachineId;
  world: World;
  start: string; // lanzamiento o, si no se publica, llegada
  arrival: string | null;
  end: string; // última señal
  plannedEnd: string | null; // fin planeado (estimación calculada)
}

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const ms = (d: string) => Date.parse(d.length > 10 ? d : `${d}T00:00:00Z`);

/** Eventos derivados de machines.ts (Parte 8.11). */
export const TIMELINE_EVENTS: TimelineEvent[] = MACHINES.flatMap((m) => {
  const out: TimelineEvent[] = [];
  if (m.launch)
    out.push({
      machineId: m.id,
      kind: 'launch',
      date: m.launch.date,
      sourceIds: m.launch.sourceIds,
    });
  if (m.arrival)
    out.push({
      machineId: m.id,
      kind: 'arrival',
      date: m.arrival.date,
      sourceIds: m.arrival.sourceIds,
    });
  if (!m.lastSignal.noteOnly)
    out.push({
      machineId: m.id,
      kind: 'lastSignal',
      date: m.lastSignal.date,
      sourceIds: m.lastSignal.sourceIds,
    });
  if (m.missionEnd)
    out.push({
      machineId: m.id,
      kind: 'missionEnd',
      date: m.missionEnd.date,
      sourceIds: m.missionEnd.sourceIds,
    });
  return out;
}).sort((a, b) => ms(a.date) - ms(b.date));

export const TIMELINE_SPANS: TimelineSpan[] = MACHINES.map((m) => {
  const start = m.launch?.date ?? m.arrival?.date ?? m.lastSignal.date;
  const planStart = m.planned?.start ?? m.arrival?.date ?? start;
  const plannedEnd = m.planned?.days ? iso(ms(planStart) + m.planned.days * DAY) : null;
  return {
    machineId: m.id,
    world: m.world,
    start,
    arrival: m.arrival?.date ?? null,
    end: m.lastSignal.date,
    plannedEnd,
  };
});

export const TIMELINE_FROM = 1966;
export const TIMELINE_TO = 2026;

/** Duración real de cada máquina en días (de la llegada, o el lanzamiento, a la última señal). */
export function spanDays(s: TimelineSpan): number {
  return (ms(s.end) - ms(s.arrival ?? s.start)) / DAY;
}
