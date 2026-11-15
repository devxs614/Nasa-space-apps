import { EPILOGUE_2026, MACHINES } from './machines';
import { EXTRAS } from './extras';
import { ORBIT_SOURCES } from './orbits';
import { SOURCES, sortSources } from './sources';
import type { Machine, MachineId, Source } from './types';

/** Todas las fuentes que respaldan los datos de una máquina. */
export function machineSourceIds(m: Machine): string[] {
  return [
    ...new Set([
      ...(m.launch?.sourceIds ?? []),
      ...(m.arrival?.sourceIds ?? []),
      ...m.lastSignal.sourceIds,
      ...(m.missionEnd?.sourceIds ?? []),
      ...(m.planned?.sourceIds ?? []),
      ...m.facts.flatMap((f) => f.sourceIds),
      ...m.discoveries.flatMap((d) => d.sourceIds),
      ...m.today.sourceIds,
      ...m.sites.flatMap((s) => s.sourceIds),
    ]),
  ];
}

export interface SourceGroup {
  id: MachineId | 'general';
  sources: Source[];
}

/** Fuentes agrupadas por máquina (Parte 8.12); el último grupo reúne epílogo, fichas extra y efemérides. */
export const SOURCE_GROUPS: SourceGroup[] = (() => {
  const used = new Set<string>();
  const groups: SourceGroup[] = MACHINES.map((m) => {
    const ids = machineSourceIds(m);
    ids.forEach((id) => used.add(id));
    return { id: m.id, sources: sortSources(ids) };
  });
  const general = [
    ...EPILOGUE_2026.flatMap((e) => [...e.sourceIds]),
    ...EXTRAS.flatMap((e) => e.sourceIds),
    ...Object.values(ORBIT_SOURCES).flat(),
    ...SOURCES.filter((s) => !used.has(s.id)).map((s) => s.id),
  ];
  return [...groups, { id: 'general', sources: sortSources(general) }];
})();
