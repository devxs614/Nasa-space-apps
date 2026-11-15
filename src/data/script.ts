import type { MachineId } from './types';
import type { BeatId } from '../state/useJourneyStore';

/**
 * Estructura de los guiones de la Parte 12. El texto vive en `chapters.json` (clave
 * `chapters.<id>.<beat>.<k>`); las cifras de la Bitácora se interpolan desde `machines.ts`.
 *
 * Referencias (`ref` y valores de `vars`):
 * - `facts.<id>`        → frase del dato; `facts.<id>.value` → valor formateado
 * - `lastSignal.date`, `lastSignal.note`, `missionEnd.date`, `arrival.date`, `launch.date`, `planned`
 * - `sites.<id>`        → coordenadas formateadas del sitio
 */
export type Speaker = 'lumi' | 'machine' | 'log' | 'note';
export interface ScriptLine {
  s: Speaker;
  k?: string;
  ref?: string;
  vars?: Record<string, string>;
  who?: string;
  /** Solo en "Despertar": aparece cuando llega la señal. */
  afterSignal?: boolean;
}
export interface CardSpec {
  k: string;
  refs: string[]; // 'facts.<id>' o 'discoveries.<n>'
}
export type ChapterScript = Record<BeatId, ScriptLine[]> & { cards: CardSpec[] };

const m = (k: string, who?: string, afterSignal?: boolean): ScriptLine => ({
  s: 'machine',
  k,
  ...(who ? { who } : {}),
  ...(afterSignal ? { afterSignal } : {}),
});
const lumi = (k: string): ScriptLine => ({ s: 'lumi', k });
const log = (ref: string): ScriptLine => ({ s: 'log', ref });
const logT = (k: string, vars: Record<string, string>): ScriptLine => ({ s: 'log', k, vars });
const note = (k: string): ScriptLine => ({ s: 'note', k });
const card = (k: string, ...refs: string[]): CardSpec => ({ k, refs });

export const SCRIPTS: Record<MachineId, ChapterScript> = {
  surveyor: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('facts.program'), log('facts.failures')],
    journey: [m('1')],
    arrival: [m('1', 's3'), log('facts.s3Bounce')],
    work: [m('1')],
    lastSignal: [m('1', 's3'), logT('2', { date: 'lastSignal.date' })],
    legacy: [m('1', 's3'), lumi('2')],
    cards: [card('1', 'facts.s3Work'), card('2', 'facts.s6Hop'), card('3', 'facts.s5Chem')],
  },
  'apollo-lm': {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('facts.descentShape')],
    journey: [m('1')],
    arrival: [m('1'), logT('2', { date: 'arrival.date', site: 'sites.apollo-11-lm' })],
    work: [m('1')],
    lastSignal: [m('1'), logT('2', { time: 'facts.surfaceTime.value' })],
    legacy: [m('1'), lumi('2')],
    cards: [card('1', 'facts.plaque'), card('2', 'facts.goodwill'), card('3', 'facts.samples')],
  },
  alsep: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('facts.instruments12'), log('facts.power')],
    journey: [m('1')],
    arrival: [m('1'), log('facts.artificialQuake')],
    work: [m('1')],
    lastSignal: [m('1'), log('facts.end')],
    legacy: [m('1', 'retro'), lumi('2')],
    cards: [card('1', 'facts.network'), card('2', 'facts.recession'), card('3', 'facts.retros')],
  },
  lrv: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('facts.mass'), log('facts.size')],
    journey: [m('1')],
    arrival: [m('1')],
    work: [m('1')],
    lastSignal: [m('1'), log('facts.apollo17')],
    legacy: [m('1')],
    cards: [
      card('1', 'facts.apollo15', 'facts.apollo16', 'facts.apollo17'),
      card('2', 'facts.fender'),
      card('3', 'facts.speed'),
    ],
  },
  viking: {
    wake: [lumi('1'), m('2', 'v1', true), m('3', 'v2', true)],
    identity: [m('1', 'v1'), log('facts.firstSuccess'), log('facts.coincidence')],
    journey: [m('1', 'v2')],
    arrival: [m('1', 'v1'), logT('2', { date: 'arrival.date', site: 'sites.viking-1' })],
    work: [m('1', 'v1')],
    lastSignal: [m('1', 'v2'), m('2', 'v1'), log('lastSignal.note')],
    legacy: [m('1', 'v1'), lumi('2')],
    cards: [card('1', 'facts.lifeSearch'), card('2', 'facts.sulfur'), card('3', 'facts.orbiters')],
  },
  sojourner: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('facts.name'), log('facts.rover')],
    journey: [m('1')],
    arrival: [m('1'), log('facts.airbags')],
    work: [m('1')],
    lastSignal: [m('1'), logT('2', { date: 'lastSignal.date' })],
    legacy: [m('1'), lumi('2')],
    cards: [card('1', 'discoveries.0'), card('2', 'facts.dataSent'), card('3', 'facts.lander')],
  },
  spirit: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('planned'), log('facts.distance')],
    journey: [m('1')],
    arrival: [m('1'), log('facts.landing')],
    work: [m('1')],
    lastSignal: [m('1'), logT('2', { date: 'lastSignal.date', end: 'missionEnd.date' })],
    legacy: [m('1'), lumi('2')],
    cards: [card('1', 'facts.silica'), card('2', 'facts.cleaning'), card('3', 'discoveries.0')],
  },
  opportunity: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('planned'), log('facts.totalDistance')],
    journey: [m('1')],
    arrival: [m('1'), log('facts.landing')],
    work: [m('1')],
    lastSignal: [
      m('1'),
      logT('2', { date: 'lastSignal.date', sol: 'facts.lastSol.value' }),
      log('facts.rescue'),
      note('3'),
    ],
    legacy: [m('1'), log('facts.relay')],
    cards: [
      card('1', 'facts.blueberries'),
      card('2', 'facts.endeavour'),
      card('3', 'facts.marathon'),
    ],
  },
  phoenix: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('facts.records')],
    journey: [m('1')],
    arrival: [m('1'), logT('2', { date: 'arrival.date', site: 'sites.phoenix' })],
    work: [m('1')],
    lastSignal: [m('1'), logT('2', { date: 'lastSignal.date' }), log('facts.afterWinter')],
    legacy: [m('1')],
    cards: [card('1', 'facts.ice'), card('2', 'facts.perchlorate'), card('3', 'facts.water')],
  },
  insight: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('facts.instruments')],
    journey: [m('1'), log('facts.marco')],
    arrival: [m('1')],
    work: [m('1')],
    lastSignal: [m('1'), logT('2', { date: 'lastSignal.date', end: 'missionEnd.date' })],
    legacy: [m('1'), lumi('2')],
    cards: [card('1', 'facts.core'), card('2', 'facts.iceImpact'), card('3', 'facts.mole')],
  },
  ingenuity: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('facts.size')],
    journey: [m('1')],
    arrival: [m('1'), log('facts.firstFlight'), log('facts.airfield')],
    work: [m('1')],
    lastSignal: [m('1'), log('facts.lastFlight'), log('facts.cause')],
    legacy: [m('1'), lumi('2')],
    cards: [card('1', 'facts.flights'), card('2', 'facts.totals'), card('3', 'facts.wright')],
  },
  near: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('facts.orbit'), log('facts.rename')],
    journey: [m('1')],
    arrival: [m('1'), log('facts.images')],
    work: [m('1')],
    lastSignal: [m('1'), logT('2', { date: 'lastSignal.date' }), log('facts.lastAttempt')],
    legacy: [m('1'), lumi('2')],
    cards: [card('1', 'facts.orbit'), card('2', 'facts.landing'), card('3', 'facts.images')],
  },
  dawn: {
    wake: [lumi('1'), m('2', undefined, true)],
    identity: [m('1'), log('facts.propulsion')],
    journey: [m('1'), note('2')],
    arrival: [m('1'), log('facts.vestaArrival'), log('facts.ceresArrival')],
    work: [m('1')],
    lastSignal: [m('1'), log('lastSignal.note'), logT('2', { end: 'missionEnd.date' })],
    legacy: [m('1'), log('facts.orbitStability')],
    cards: [card('1', 'facts.ceresArrival'), card('2', 'facts.occator'), card('3', 'facts.ahuna')],
  },
  kepler: {
    wake: [lumi('1'), m('2', 'memory', true)],
    identity: [m('1'), log('facts.field')],
    journey: [m('1')],
    arrival: [m('1'), log('facts.method')],
    work: [m('1')],
    lastSignal: [m('1'), logT('2', { date: 'missionEnd.date' }), log('facts.goodnight')],
    legacy: [m('1')],
    cards: [card('1', 'facts.conclusion'), card('2', 'facts.firsts'), card('3', 'facts.k2')],
  },
  pioneer: {
    wake: [lumi('1'), m('2', 'p10m', true)],
    identity: [m('1', 'p10'), log('facts.firsts')],
    journey: [m('1', 'p11')],
    arrival: [m('1', 'p10'), log('facts.jupiter')],
    work: [m('1', 'p10')],
    lastSignal: [m('1', 'p11'), m('2', 'p10'), log('lastSignal.note')],
    legacy: [m('1', 'p10'), m('2', 'p11'), lumi('3')],
    cards: [card('1', 'facts.plaque'), card('2', 'facts.jupiter'), card('3', 'facts.p11')],
  },
};

/** Voces con nombre propio de cada capítulo (chapters.<id>.voices.<who>). */
export const VOICES: Partial<Record<MachineId, string[]>> = {
  surveyor: ['s3'],
  alsep: ['retro'],
  viking: ['v1', 'v2'],
  kepler: ['memory'],
  pioneer: ['p10', 'p11', 'p10m'],
};
