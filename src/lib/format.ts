import type { Locale } from '../data/types';

const nfCache = new Map<string, Intl.NumberFormat>();
function nf(locale: Locale, min: number, max: number): Intl.NumberFormat {
  const k = `${locale}|${min}|${max}`;
  let f = nfCache.get(k);
  if (!f) {
    f = new Intl.NumberFormat(locale, { minimumFractionDigits: min, maximumFractionDigits: max });
    nfCache.set(k, f);
  }
  return f;
}

export function formatNumber(n: number, locale: Locale, maxDigits = 2, minDigits = 0): string {
  return nf(locale, minDigits, maxDigits).format(n);
}

export function formatLightTime(seconds: number, locale: Locale): string {
  if (seconds < 10) return `${formatNumber(seconds, locale, 2, 2)} s`; // 1,28 s · 1.28 s
  const total = Math.round(seconds);
  if (total < 60) return `${total} s`;
  if (total < 3600) return `${Math.floor(total / 60)} min ${total % 60} s`;
  const minutes = Math.round(seconds / 60);
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

/** Diferencia de calendario en UTC para el MissionClock ("En silencio desde hace…"). */
export function diffYMD(
  fromIso: string,
  to: Date,
): { years: number; months: number; days: number } {
  const f = new Date(`${fromIso.slice(0, 10)}T00:00:00Z`);
  let years = to.getUTCFullYear() - f.getUTCFullYear();
  let months = to.getUTCMonth() - f.getUTCMonth();
  let days = to.getUTCDate() - f.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

/**
 * Crear un formateador de `Intl` es caro (cientos de veces más que usarlo) y La Travesía muestra
 * cientos de fechas: se crea uno por idioma y estilo, y se reutiliza.
 */
const DATE_STYLES = {
  date: { dateStyle: 'long', timeZone: 'UTC' },
  dateTime: { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' },
  monthYear: { month: 'long', year: 'numeric', timeZone: 'UTC' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;
const dfCache = new Map<string, Intl.DateTimeFormat>();
function df(locale: Locale, style: keyof typeof DATE_STYLES): Intl.DateTimeFormat {
  const k = `${locale}|${style}`;
  let f = dfCache.get(k);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, DATE_STYLES[style]);
    dfCache.set(k, f);
  }
  return f;
}

const lfCache = new Map<string, Intl.ListFormat>();
/** "2 años, 3 meses y 4 días" / "2 years, 3 months, and 4 days". */
export function formatList(parts: readonly string[], locale: string): string {
  let f = lfCache.get(locale);
  if (!f) {
    f = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
    lfCache.set(locale, f);
  }
  return f.format(parts);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;
export function isIsoDate(v: unknown): v is string {
  return typeof v === 'string' && ISO_DATE.test(v);
}

/** Fecha de calendario en UTC (Parte 17.6). Con hora si el ISO la incluye y `withTime`. */
export function formatDate(iso: string, locale: Locale, withTime = false): string {
  const hasTime = iso.length > 10;
  const d = new Date(hasTime ? iso : `${iso}T00:00:00Z`);
  const s = df(locale, withTime && hasTime ? 'dateTime' : 'date').format(d);
  return withTime && hasTime ? `${s} UTC` : s;
}

export function formatMonthYear(iso: string, locale: Locale): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return df(locale, 'monthYear').format(d);
}

export function yearOf(iso: string): number {
  return Number(iso.slice(0, 4));
}

/** "3,01° S · 23,34° O" (es) / "3.01° S · 23.34° W" (en). */
export function formatLatLon(lat: number, lon: number, locale: Locale, digits = 2): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : locale === 'es' ? 'O' : 'W';
  const f = (n: number) => formatNumber(Math.abs(n), locale, digits, digits);
  return `${f(lat)}° ${ns} · ${f(lon)}° ${ew}`;
}

export function formatValue(value: string | number, locale: Locale): string {
  if (typeof value === 'number') return formatNumber(value, locale, 3);
  if (isIsoDate(value)) return formatDate(value, locale, true);
  return value;
}

export function formatUtcClock(d: Date): string {
  return d.toISOString().slice(11, 19);
}
