import type { L10n } from './types';

/** Unidades con nombre distinto por idioma; los símbolos (km, kg, %, °C…) se muestran tal cual. */
export const UNITS: Record<string, L10n> = {
  sol: { es: 'soles', en: 'sols' },
  a: { es: 'años', en: 'years' },
  sem: { es: 'semanas', en: 'weeks' },
  d: { es: 'días', en: 'days' },
  'M a': { es: 'millones de años', en: 'million years' },
  'M km': { es: 'millones de km', en: 'million km' },
  UA: { es: 'UA', en: 'AU' },
  '× Everest': { es: '× Everest', en: '× Everest' },
  '° N': { es: '° N', en: '° N' },
};
