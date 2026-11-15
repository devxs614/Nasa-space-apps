import type { ExtraEntry } from './types';

/** Fichas extra del catálogo, sin capítulo (Parte 11.6). */
export const EXTRAS: ExtraEntry[] = [
  {
    id: 'marco',
    world: 'deep-space',
    type: 'probe',
    status: 'drifting',
    name: {
      es: 'MarCO A y B, apodadas EVE y WALL-E',
      en: 'MarCO A and B, nicknamed EVE and WALL-E',
    },
    text: {
      es: 'Las primeras CubeSats interplanetarias. Viajaron con InSight (lanzamiento el 5 de mayo de 2018) y retransmitieron su aterrizaje casi en tiempo real, incluida su primera imagen. Último contacto: WALL-E el 29 de diciembre de 2018 y EVE el 4 de enero de 2019, ya más allá de Marte. Hoy orbitan el Sol en silencio.',
      en: 'The first interplanetary CubeSats. They flew with InSight (launched on 5 May 2018) and relayed its landing almost in real time, including its first image. Last contact: WALL-E on 29 December 2018 and EVE on 4 January 2019, already beyond Mars. Today they orbit the Sun in silence.',
    },
    launchYear: 2018,
    lastYear: 2019,
    sourceIds: ['jpl-marco-end', 'spaceflightnow-marco'],
  },
  {
    id: 'lunar-prospector',
    world: 'moon',
    type: 'orbiter',
    status: 'silent-surface',
    name: { es: 'Lunar Prospector', en: 'Lunar Prospector' },
    text: {
      es: 'Lanzado el 6 de enero de 1998; en órbita lunar el 12 de enero de 1998. Se estrelló a propósito en el cráter Shoemaker, cerca del polo sur, el 31 de julio de 1999 a las 09:52:02 UTC, buscando vapor de agua (no se detectó). Llevaba unos 28 g de las cenizas de Eugene Shoemaker, la primera persona sepultada en la Luna.',
      en: 'Launched on 6 January 1998; in lunar orbit on 12 January 1998. It was crashed on purpose into Shoemaker crater, near the south pole, on 31 July 1999 at 09:52:02 UTC, looking for water vapor (none was detected). It carried about 28 g of the ashes of Eugene Shoemaker, the first person laid to rest on the Moon.',
    },
    launchYear: 1998,
    lastYear: 1999,
    sourceIds: ['nasa-lunar-prospector', 'esa-31-july'],
  },
  {
    id: 'apollo11-ascent',
    world: 'moon',
    type: 'lander',
    status: 'silent-orbit',
    name: { es: 'Etapa de ascenso del Apollo 11', en: 'Apollo 11 ascent stage' },
    text: {
      es: 'Quedó en órbita lunar en 1969; su destino exacto se desconoce.',
      en: 'It was left in lunar orbit in 1969; its exact fate is unknown.',
    },
    launchYear: 1969,
    lastYear: 1969,
    sourceIds: ['nssdca-a11-lm'],
  },
];
