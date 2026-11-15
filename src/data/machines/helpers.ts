import type { Fact, L10n } from '../types';

export const L = (es: string, en: string): L10n => ({ es, en });

/** Atajo para declarar un dato verificado. */
export function fact(
  id: string,
  label: L10n,
  value: string | number,
  text: L10n,
  sourceIds: string[],
  opts: { unit?: string; approx?: boolean; pending?: boolean } = {},
): Fact {
  return { id, label, value, text, sourceIds, ...opts };
}
