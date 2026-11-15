export type MachineId =
  | 'surveyor'
  | 'apollo-lm'
  | 'alsep'
  | 'lrv'
  | 'viking'
  | 'sojourner'
  | 'spirit'
  | 'opportunity'
  | 'phoenix'
  | 'insight'
  | 'ingenuity'
  | 'near'
  | 'dawn'
  | 'kepler'
  | 'pioneer';

export type World = 'moon' | 'mars' | 'small-bodies' | 'deep-space';
export type MachineType =
  'lander' | 'rover' | 'instrument' | 'orbiter' | 'helicopter' | 'telescope' | 'probe';
export type Status = 'silent-surface' | 'silent-orbit' | 'drifting' | 'still-useful';
export type Locale = 'es' | 'en';

export interface L10n {
  es: string;
  en: string;
}

/**
 * Un dato verificado (Parte 11). Extensiones documentadas en DECISIONS.md:
 * - `label` y `text` son L10n dentro de los datos, para que ninguna cifra viva en los archivos de traducción.
 * - La clave del dato (`basis` en quizzes) es `facts.<id>`.
 */
export interface Fact {
  id: string; // id local, usado por guiones y quizzes: 'program' → 'facts.program'
  label: L10n; // etiqueta corta
  value: string | number; // valor sin formatear (ISO para fechas)
  unit?: string; // 'km', 'kg', 'h', 'sol', 'm', 'W'...
  approx?: boolean;
  text?: L10n; // frase completa del dato
  sourceIds: string[];
  pending?: boolean; // true: no mostrar hasta verificar
}

export type SiteKind = 'lander' | 'rover-end' | 'instrument' | 'impact' | 'retroreflector';
export type SiteBody = 'moon' | 'mars';

export interface Site {
  id: string;
  body: SiteBody;
  machineId: MachineId | null; // null para fichas extra (p. ej. Lunar Prospector)
  label: L10n;
  lat: number; // planetocéntrica, grados
  lon: number; // este positivo, −180..180
  kind: SiteKind;
  sourceIds: string[];
  approx?: boolean; // "posición aproximada" (Parte 11.9)
  hideCoords?: boolean; // no mostrar cifras de coordenadas no publicadas en la Parte 11
}

export type LightTarget = 'moon' | 'mars' | 'eros' | 'ceres' | 'kepler' | 'pioneer10' | 'pioneer11';

export interface Machine {
  id: MachineId;
  order: number;
  world: World;
  body: L10n;
  type: MachineType;
  status: Status;
  name: L10n;
  /** Nombre corto para títulos monumentales. */
  shortName?: L10n;
  chapterTitle: L10n;
  /** Ausente cuando la Parte 11 no publica la fecha (Apollo, Opportunity, Ingenuity): ver PROGRESS.md. */
  launch?: { date: string; sourceIds: string[] };
  arrival?: { date: string; kind: 'landing' | 'orbit' | 'flyby'; sourceIds: string[] };
  /** `noteOnly`: la fecha exacta no se publica; la interfaz muestra la nota en lugar de la fecha. */
  lastSignal: { date: string; sourceIds: string[]; note?: L10n; noteOnly?: boolean };
  missionEnd?: { date: string; sourceIds: string[] };
  /** `days` (y `start`, por defecto la llegada) alimentan la barra fantasma de la línea de tiempo (estimación). */
  planned?: { text: L10n; sourceIds: string[]; days?: number; start?: string };
  facts: Fact[];
  discoveries: { text: L10n; sourceIds: string[] }[];
  today: { text: L10n; sourceIds: string[] };
  legacy: { text: L10n; to: string[] };
  sites: Site[];
  imageQueries: string[];
  model: string;
  patch: { glyph: string; colors: [string, string, string] };
  lightTimeTarget: LightTarget;
  /** Pieza clave resaltada en el momento "Quién soy" (Parte 8.5). */
  keyPart: L10n;
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  accessed: string;
}

export interface ExtraEntry {
  id: string;
  world: World;
  type: MachineType;
  status: Status;
  name: L10n;
  text: L10n;
  launchYear: number;
  lastYear: number;
  sourceIds: string[];
}
