/** Rangos por número de parches (Parte 14.7). */
const THRESHOLDS = [15, 10, 6, 3, 1, 0] as const;
export function rankKey(patches: number): `passport.ranks.${(typeof THRESHOLDS)[number]}` {
  const th = THRESHOLDS.find((x) => patches >= x) ?? 0;
  return `passport.ranks.${th}`;
}
