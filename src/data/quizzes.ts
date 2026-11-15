import type { MachineId } from './types';
import { MACHINES_BY_ID } from './machines';

export interface QuizItem {
  id: `${MachineId}.q${1 | 2 | 3}`;
  machineId: MachineId;
  basis: string; // campo de machines.ts en el que se basa la respuesta, p. ej. 'facts.trenches'
  sourceIds: string[]; // copia los sourceIds de ese campo
}

function q(machineId: MachineId, n: 1 | 2 | 3, basis: string): QuizItem {
  const factId = basis.replace(/^facts\./, '');
  const f = MACHINES_BY_ID[machineId].facts.find((x) => x.id === factId);
  return { id: `${machineId}.q${n}`, machineId, basis, sourceIds: f ? [...f.sourceIds] : [] };
}

/** 45 entradas, en el orden de la Parte 14.10. El texto vive en quiz.json; la correcta es siempre `a`. */
export const QUIZZES: QuizItem[] = [
  q('surveyor', 1, 'facts.context'),
  q('surveyor', 2, 'facts.trenches'),
  q('surveyor', 3, 'facts.apollo12Visit'),
  q('apollo-lm', 1, 'facts.missions'),
  q('apollo-lm', 2, 'facts.launchPad'),
  q('apollo-lm', 3, 'facts.goodwill'),
  q('alsep', 1, 'facts.artificialQuake'),
  q('alsep', 2, 'facts.end'),
  q('alsep', 3, 'facts.roundTrip'),
  q('lrv', 1, 'facts.count'),
  q('lrv', 2, 'facts.apollo17'),
  q('lrv', 3, 'facts.count'),
  q('viking', 1, 'facts.landing1'),
  q('viking', 2, 'facts.organics'),
  q('viking', 3, 'facts.end2'),
  q('sojourner', 1, 'facts.landing'),
  q('sojourner', 2, 'facts.name'),
  q('sojourner', 3, 'facts.landing'),
  q('spirit', 1, 'facts.silica'),
  q('spirit', 2, 'facts.cleaning'),
  q('spirit', 3, 'facts.stuck'),
  q('opportunity', 1, 'facts.plan'),
  q('opportunity', 2, 'facts.totalDistance'),
  q('opportunity', 3, 'facts.relay'),
  q('phoenix', 1, 'facts.landing'),
  q('phoenix', 2, 'facts.ice'),
  q('phoenix', 3, 'facts.perchlorate'),
  q('insight', 1, 'facts.quakes'),
  q('insight', 2, 'facts.strongest'),
  q('insight', 3, 'facts.end'),
  q('ingenuity', 1, 'facts.firstFlight'),
  q('ingenuity', 2, 'facts.flights'),
  q('ingenuity', 3, 'facts.cause'),
  q('near', 1, 'facts.landing'),
  q('near', 2, 'facts.landing'),
  q('near', 3, 'facts.landing'),
  q('dawn', 1, 'facts.ceresArrival'),
  q('dawn', 2, 'facts.propulsion'),
  q('dawn', 3, 'facts.occator'),
  q('kepler', 1, 'facts.method'),
  q('kepler', 2, 'facts.planets'),
  q('kepler', 3, 'facts.retire'),
  q('pioneer', 1, 'facts.last10'),
  q('pioneer', 2, 'facts.lastDelay'),
  q('pioneer', 3, 'facts.plaque'),
];

export const quizzesFor = (id: MachineId) => QUIZZES.filter((x) => x.machineId === id);
