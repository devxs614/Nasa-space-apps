import type { Fact, Locale, Machine } from '../data/types';
import { SITE_BY_ID } from '../data/sites';
import { UNITS } from '../data/units';
import { formatDate, formatLatLon, formatNumber, formatValue, isIsoDate } from './format';

export interface Resolved {
  text: string;
  sourceIds: string[];
  approx?: boolean;
}

export function unitLabel(unit: string | undefined, locale: Locale): string {
  if (!unit) return '';
  return UNITS[unit]?.[locale] ?? unit;
}

/** Valor grande de una FactCard: número o fecha formateados, más su unidad. */
export function factValue(f: Fact, locale: Locale): string {
  const v =
    typeof f.value === 'number'
      ? formatNumber(f.value, locale, 3)
      : isIsoDate(f.value) && f.value.length >= 10
        ? formatDate(f.value, locale)
        : String(f.value);
  const u = unitLabel(f.unit, locale);
  return u ? `${v} ${u}` : v;
}

/**
 * Resuelve una referencia del guion contra los datos de la máquina (Parte 12.1).
 * Devuelve null si el dato no existe o está pendiente de verificar (nunca se muestra).
 */
export function resolveRef(m: Machine, ref: string, locale: Locale): Resolved | null {
  const [head, id, sub] = ref.split('.');
  switch (head) {
    case 'facts': {
      const f = m.facts.find((x) => x.id === id);
      if (!f || f.pending) return null;
      if (sub === 'value')
        return { text: factValue(f, locale), sourceIds: f.sourceIds, approx: f.approx };
      return {
        text: f.text?.[locale] ?? factValue(f, locale),
        sourceIds: f.sourceIds,
        approx: f.approx,
      };
    }
    case 'lastSignal':
      if (id === 'note')
        return m.lastSignal.note
          ? { text: m.lastSignal.note[locale], sourceIds: m.lastSignal.sourceIds }
          : null;
      return { text: formatDate(m.lastSignal.date, locale), sourceIds: m.lastSignal.sourceIds };
    case 'missionEnd':
      return m.missionEnd
        ? { text: formatDate(m.missionEnd.date, locale), sourceIds: m.missionEnd.sourceIds }
        : null;
    case 'arrival':
      return m.arrival
        ? { text: formatDate(m.arrival.date, locale, true), sourceIds: m.arrival.sourceIds }
        : null;
    case 'launch':
      return m.launch
        ? { text: formatDate(m.launch.date, locale, true), sourceIds: m.launch.sourceIds }
        : null;
    case 'planned':
      return m.planned ? { text: m.planned.text[locale], sourceIds: m.planned.sourceIds } : null;
    case 'discoveries': {
      const d = m.discoveries[Number(id)];
      return d ? { text: d.text[locale], sourceIds: d.sourceIds } : null;
    }
    case 'sites': {
      const s = SITE_BY_ID.get(ref.slice('sites.'.length));
      if (!s) return null;
      return { text: formatLatLon(s.lat, s.lon, locale), sourceIds: s.sourceIds, approx: s.approx };
    }
    default:
      return null;
  }
}

/** Resuelve todas las variables de una línea de plantilla; null si alguna falta. */
export function resolveVars(
  m: Machine,
  vars: Record<string, string>,
  locale: Locale,
): { values: Record<string, string>; sourceIds: string[] } | null {
  const values: Record<string, string> = {};
  const sources = new Set<string>();
  for (const [k, ref] of Object.entries(vars)) {
    const r = resolveRef(m, ref, locale);
    if (!r) return null;
    values[k] = r.text;
    r.sourceIds.forEach((s) => sources.add(s));
  }
  return { values, sourceIds: [...sources] };
}

export { formatValue };
