import type { Machine, MachineId } from './types';
import { alsep, apolloLm, lrv, surveyor } from './machines/moon';
import {
  ingenuity,
  insight,
  opportunity,
  phoenix,
  sojourner,
  spirit,
  viking,
} from './machines/mars';
import { dawn, kepler, near, pioneer } from './machines/space';

export { APOLLO_LANDINGS, APOLLO_LANDINGS_SOURCES, APOLLO11_PLAQUE } from './machines/moon';

/** Las 15 máquinas (Parte 11), en el orden de La Travesía. */
export const MACHINES: Machine[] = [
  surveyor,
  apolloLm,
  alsep,
  lrv,
  viking,
  sojourner,
  spirit,
  opportunity,
  phoenix,
  insight,
  ingenuity,
  near,
  dawn,
  kepler,
  pioneer,
];

export const MACHINES_BY_ID = Object.fromEntries(MACHINES.map((m) => [m.id, m])) as Record<
  MachineId,
  Machine
>;

export function getFact(m: Machine, id: string) {
  return m.facts.find((f) => f.id === id && !f.pending);
}

export function nextMachine(id: MachineId): Machine | null {
  const i = MACHINES.findIndex((m) => m.id === id);
  return MACHINES[i + 1] ?? null;
}
export function prevMachine(id: MachineId): Machine | null {
  const i = MACHINES.findIndex((m) => m.id === id);
  return i > 0 ? (MACHINES[i - 1] ?? null) : null;
}

/** Datos de 2026 para el epílogo (Parte 11.7). */
export const EPILOGUE_2026 = [
  {
    id: 'artemis2',
    date: '2026-04-01',
    text: {
      es: 'Artemis II despegó el 1 de abril de 2026, sobrevoló la Luna el 6 de abril con vistas de la cara oculta y amerizó el 10 de abril frente a San Diego. Tripulación: Reid Wiseman (comandante), Victor Glover (piloto), Christina Koch y Jeremy Hansen (Agencia Espacial Canadiense). Fue el primer viaje humano a la Luna en más de medio siglo.',
      en: 'Artemis II launched on 1 April 2026, flew around the Moon on 6 April with views of the far side and splashed down on 10 April off San Diego. Crew: Reid Wiseman (commander), Victor Glover (pilot), Christina Koch and Jeremy Hansen (Canadian Space Agency). It was the first human trip to the Moon in more than half a century.',
    },
    sourceIds: ['ap-artemis2', 'adn-artemis2'],
  },
  {
    id: 'perseverance',
    date: '2026-10-11',
    text: {
      es: 'El 11 de octubre de 2026 Perseverance superó el récord de distancia de Opportunity con 45,22 km.',
      en: "On 11 October 2026 Perseverance beat Opportunity's distance record with 45.22 km.",
    },
    sourceIds: ['nasa-perseverance-record'],
  },
  {
    id: 'voyager',
    date: '2026-11-13',
    text: {
      es: 'Alrededor del 13 de noviembre de 2026, Voyager 1 llegó a un día-luz de distancia de la Tierra.',
      en: 'Around 13 November 2026, Voyager 1 reached one light-day from Earth.',
    },
    sourceIds: ['skyatnight-voyager'],
  },
  {
    id: 'plans',
    date: '2027-01-01',
    plan: true,
    text: {
      es: 'Plan anunciado en 2026, no un hecho: Artemis III (2027) probaría el acoplamiento con aterrizadores lunares en órbita terrestre y Artemis IV intentaría alunizar en 2028 cerca del polo sur.',
      en: 'A plan announced in 2026, not a fact: Artemis III (2027) would test docking with lunar landers in Earth orbit and Artemis IV would attempt a landing near the south pole in 2028.',
    },
    sourceIds: ['ap-artemis2'],
  },
] as const;
