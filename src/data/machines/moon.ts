import type { Machine } from '../types';
import { sitesFor } from '../sites';
import { fact, L } from './helpers';

const MOON = L('Luna', 'Moon');

export const surveyor: Machine = {
  id: 'surveyor',
  order: 1,
  world: 'moon',
  body: MOON,
  type: 'lander',
  status: 'silent-surface',
  name: L('Surveyor 1, 3, 5, 6 y 7', 'Surveyor 1, 3, 5, 6 and 7'),
  shortName: L('Surveyor', 'Surveyor'),
  chapterTitle: L('Los exploradores de avanzada', 'The Advance Scouts'),
  launch: { date: '1967-04-17', sourceIds: ['nasa-surveyor3'] },
  arrival: {
    date: '1967-04-20T00:04:17Z',
    kind: 'landing',
    sourceIds: ['nssdca-surveyor', 'nasa-surveyor3'],
  },
  lastSignal: {
    date: '1967-05-04',
    sourceIds: ['nasa-surveyor3'],
    note: L(
      'Registro del Surveyor 3: último contacto dos días después del inicio de la noche lunar.',
      'Surveyor 3 record: last contact two days after lunar night began.',
    ),
  },
  facts: [
    fact(
      'program',
      L('Programa', 'Program'),
      5,
      L(
        '7 lanzamientos entre 1966 y 1968; 5 alunizajes suaves con éxito (Surveyor 1, 3, 5, 6 y 7).',
        '7 launches between 1966 and 1968; 5 successful soft landings (Surveyor 1, 3, 5, 6 and 7).',
      ),
      ['nssdca-surveyor', 'lroc-surveyor6'],
    ),
    fact(
      'failures',
      L('Hermanos perdidos', 'Lost siblings'),
      2,
      L(
        'Surveyor 2 se estrelló (septiembre de 1966); Surveyor 4 perdió contacto 2,5 minutos antes de tocar suelo (17 de julio de 1967).',
        'Surveyor 2 crashed (September 1966); Surveyor 4 lost contact 2.5 minutes before touchdown (17 July 1967).',
      ),
      ['nssdca-surveyor'],
    ),
    fact(
      'objective',
      L('Objetivo', 'Goal'),
      'Apollo',
      L(
        'Obtener imágenes de cerca y comprobar si el terreno era seguro para aterrizajes tripulados.',
        'Take close-up images and check whether the ground was safe for crewed landings.',
      ),
      ['nssdca-surveyor'],
    ),
    fact(
      'context',
      L('El gran miedo', 'The big fear'),
      1966,
      L(
        'Antes de 1966, algunos creían que la Luna estaba cubierta por un mar de polvo profundo que tragaría cualquier nave.',
        'Before 1966, some people believed the Moon was covered by a deep sea of dust that would swallow any spacecraft.',
      ),
      ['fourmilab-nssdca'],
    ),
    fact(
      's1',
      L('Surveyor 1', 'Surveyor 1'),
      '1966-06-02T06:17:36Z',
      L(
        'Alunizó el 2 de junio de 1966 a las 06:17:36 UTC en 2,45° S, 43,21° O (Flamsteed P) y tomó más de 10.000 fotos en su primer día lunar.',
        'Landed on 2 June 1966 at 06:17:36 UTC at 2.45° S, 43.21° W (Flamsteed P) and took more than 10,000 pictures in its first lunar day.',
      ),
      ['nssdca-surveyor', 'nasa-surveyor1-1966'],
    ),
    fact(
      's3',
      L('Surveyor 3', 'Surveyor 3'),
      '1967-04-20T00:04:17Z',
      L(
        'Lanzado el 17 de abril de 1967; alunizó el 20 de abril a las 00:04:17 UTC en 3,01° S, 23,34° O, en el Océano de las Tormentas.',
        'Launched on 17 April 1967; landed on 20 April at 00:04:17 UTC at 3.01° S, 23.34° W, in the Ocean of Storms.',
      ),
      ['nasa-surveyor3', 'nssdca-surveyor'],
    ),
    fact(
      's3Bounce',
      L('El rebote', 'The bounce'),
      3,
      L(
        'Rocas muy reflectantes confundieron el radar; el motor no se apagó a unos 4,3 m; rebotó dos veces (10 m y 3 m) y se posó al tercer contacto.',
        'Highly reflective rocks confused the radar; the engine did not cut off at about 4.3 m; it bounced twice (10 m and 3 m) and settled on the third contact.',
      ),
      ['nasa-surveyor3'],
    ),
    fact(
      's3Work',
      L('Trabajo del Surveyor 3', "Surveyor 3's work"),
      6326,
      L(
        '6.326 fotos; con su pala cavó 4 zanjas e hizo 4 pruebas de carga y 13 de impacto. El suelo se parecía a arena húmeda, con una resistencia de unos 0,7 kg/cm², suficiente para un módulo lunar.',
        '6,326 pictures; with its scoop it dug 4 trenches and made 4 bearing tests and 13 impact tests. The soil was like wet sand, with a strength of about 0.7 kg/cm², enough for a lunar module.',
      ),
      ['nasa-surveyor3'],
    ),
    fact(
      'trenches',
      L('Zanjas', 'Trenches'),
      4,
      L('La pala del Surveyor 3 cavó 4 zanjas.', "Surveyor 3's scoop dug 4 trenches."),
      ['nasa-surveyor3'],
    ),
    fact(
      'apollo12Visit',
      L('La visita del Apollo 12', 'The Apollo 12 visit'),
      180,
      L(
        'El módulo Intrepid se posó a unos 180 m; los astronautas recuperaron piezas, entre ellas la cámara y la pala, para estudiar casi 2,5 años de exposición.',
        'The Intrepid lunar module landed about 180 m away; the astronauts recovered parts, including the camera and the scoop, to study almost 2.5 years of exposure.',
      ),
      ['nasa-surveyor3'],
      { unit: 'm', approx: true },
    ),
    fact(
      's5Chem',
      L('Surveyor 5', 'Surveyor 5'),
      '1967-09-11T00:46:44Z',
      L(
        'Alunizó el 11 de septiembre de 1967 en 1,41° N, 23,18° E, en el Mar de la Tranquilidad, y analizó la química del suelo con un instrumento de dispersión alfa.',
        'Landed on 11 September 1967 at 1.41° N, 23.18° E, in the Sea of Tranquility, and analyzed the soil chemistry with an alpha-scattering instrument.',
      ),
      ['nssdca-surveyor'],
    ),
    fact(
      's6',
      L('Surveyor 6', 'Surveyor 6'),
      29952,
      L(
        'Lanzado el 7 de noviembre de 1967; alunizó el 10 de noviembre en 0,46° N, 1,37° O (Sinus Medii) y envió 29.952 imágenes.',
        'Launched on 7 November 1967; landed on 10 November at 0.46° N, 1.37° W (Sinus Medii) and returned 29,952 images.',
      ),
      ['nasa-surveyor6', 'nssdca-surveyor'],
    ),
    fact(
      's6Hop',
      L('El salto del Surveyor 6', "Surveyor 6's hop"),
      3,
      L(
        'El 17 de noviembre de 1967 encendió sus motores 2,5 s, se elevó unos 3 m y se posó unos 2,5 m al oeste: el primer despegue desde la Luna.',
        'On 17 November 1967 it fired its engines for 2.5 s, rose about 3 m and set down about 2.5 m to the west: the first liftoff from the Moon.',
      ),
      ['nasa-surveyor6', 'lroc-surveyor6'],
      { unit: 'm', approx: true },
    ),
    fact(
      's7',
      L('Surveyor 7', 'Surveyor 7'),
      '1968-01-10T01:05:36Z',
      L(
        'Lanzado el 7 de enero de 1968; alunizó el 10 de enero a las 01:05:36 UTC en 40,86° S, 11,47° O, en el borde norte del cráter Tycho, en las tierras altas.',
        'Launched on 7 January 1968; landed on 10 January at 01:05:36 UTC at 40.86° S, 11.47° W, on the northern rim of Tycho crater, in the highlands.',
      ),
      ['nssdca-surveyor'],
    ),
    // TODO(verificar): láseres vistos por el Surveyor 7 (ficha NSSDCA del Surveyor 7).
    fact(
      's7Lasers',
      L('Láseres vistos desde la Luna', 'Lasers seen from the Moon'),
      1968,
      L(
        'En enero de 1968 su cámara habría captado rayos láser disparados desde observatorios de Arizona y California.',
        'In January 1968 its camera reportedly captured laser beams fired from observatories in Arizona and California.',
      ),
      ['nssdca-surveyor'],
      { pending: true },
    ),
  ],
  discoveries: [
    {
      text: L(
        'El suelo lunar soporta el peso de una nave; su textura se parece a arena húmeda; la química de los mares es basáltica (Surveyor 5 y 6).',
        'The lunar soil can hold the weight of a spacecraft; it feels like wet sand; the chemistry of the maria is basaltic (Surveyor 5 and 6).',
      ),
      sourceIds: ['nasa-surveyor3', 'lroc-surveyor6'],
    },
  ],
  today: {
    text: L(
      'Las naves siguen en la Luna; las cámaras del Lunar Reconnaissance Orbiter han fotografiado a varias de ellas.',
      'The spacecraft are still on the Moon; the Lunar Reconnaissance Orbiter cameras have photographed several of them.',
    ),
    sourceIds: ['lroc-surveyor6'],
  },
  legacy: {
    text: L(
      'Los datos de Surveyor permitieron elegir y aterrizar con seguridad en los sitios Apollo.',
      'Surveyor data made it possible to choose the Apollo sites and land on them safely.',
    ),
    to: ['apollo-lm'],
  },
  sites: sitesFor('surveyor'),
  imageQueries: ['Surveyor 3 Apollo 12', 'Surveyor 3 lunar surface'],
  model: 'surveyor',
  patch: { glyph: 'scoop', colors: ['#0b0f1a', '#a8d8ff', '#c9ccd3'] },
  lightTimeTarget: 'moon',
  keyPart: L('Pala muestreadora y cámara de TV', 'Surface sampler scoop and TV camera'),
};

export const apolloLm: Machine = {
  id: 'apollo-lm',
  order: 2,
  world: 'moon',
  body: MOON,
  type: 'lander',
  status: 'silent-surface',
  name: L('Etapas de descenso de los módulos lunares Apollo', 'Apollo Lunar Module descent stages'),
  shortName: L('Apollo LM', 'Apollo LM'),
  chapterTitle: L('Las plataformas que se quedaron', 'The Platforms That Stayed'),
  arrival: { date: '1969-07-20T20:17:40Z', kind: 'landing', sourceIds: ['nssdca-a11-lm'] },
  lastSignal: {
    date: '1969-07-21',
    sourceIds: ['nssdca-a11-lm'],
    note: L(
      'La etapa de descenso no tenía radio propia: esta es la fecha en que la etapa de ascenso del Eagle despegó desde ella, 21 h 36 min después del alunizaje (cálculo a partir de los datos de NSSDCA).',
      "The descent stage had no radio of its own: this is the date Eagle's ascent stage lifted off from it, 21 h 36 min after landing (calculated from NSSDCA data).",
    ),
  },
  facts: [
    fact(
      'missions',
      L('Etapas en la Luna', 'Stages on the Moon'),
      6,
      L(
        'Seis etapas de descenso siguen en sus sitios: Apollo 11 (Eagle), 12 (Intrepid), 14 (Antares), 15 (Falcon), 16 (Orion) y 17 (Challenger).',
        'Six descent stages remain at their sites: Apollo 11 (Eagle), 12 (Intrepid), 14 (Antares), 15 (Falcon), 16 (Orion) and 17 (Challenger).',
      ),
      ['nssdca-a11-lm', 'nssdca-lunar-sites', 'nasa-sp4214'],
    ),
    fact(
      'totalMass',
      L('Masa total del Eagle', "Eagle's total mass"),
      15103,
      L(
        'El módulo lunar Eagle pesaba 15.103 kg con propelente.',
        'The Eagle lunar module had a mass of 15,103 kg with propellant.',
      ),
      ['nssdca-a11-lm'],
      { unit: 'kg' },
    ),
    fact(
      'descentMass',
      L('Etapa de descenso', 'Descent stage'),
      2034,
      L(
        'La etapa de descenso pesaba 2.034 kg en seco y llevaba 8.248 kg de propelente.',
        'The descent stage had a dry mass of 2,034 kg and carried 8,248 kg of propellant.',
      ),
      ['nssdca-a11-lm'],
      { unit: 'kg' },
    ),
    fact(
      'ascentMass',
      L('Etapa de ascenso', 'Ascent stage'),
      2445,
      L(
        'La etapa de ascenso pesaba 2.445 kg en seco y llevaba 2.376 kg de propelente.',
        'The ascent stage had a dry mass of 2,445 kg and carried 2,376 kg of propellant.',
      ),
      ['nssdca-a11-lm'],
      { unit: 'kg' },
    ),
    fact(
      'descentShape',
      L('Forma', 'Shape'),
      4.2,
      L(
        'Prisma octogonal de 4,2 m de ancho y 1,7 m de alto; las patas lo sostienen a 1,5 m del suelo y los discos de apoyo opuestos quedan a 9,4 m.',
        'An octagonal prism 4.2 m wide and 1.7 m tall; the legs hold it 1.5 m above the ground and opposite footpads are 9.4 m apart.',
      ),
      ['nssdca-a11-lm'],
      { unit: 'm' },
    ),
    fact(
      'surfaceTime',
      L('Tiempo en la superficie', 'Time on the surface'),
      '21 h 36 min',
      L('El Eagle pasó 21 h 36 min en la superficie.', 'Eagle spent 21 h 36 min on the surface.'),
      ['nssdca-a11-lm'],
    ),
    fact(
      'samples',
      L('Muestras del Apollo 11', 'Apollo 11 samples'),
      21.55,
      L(
        'El Apollo 11 devolvió 21,55 kg de rocas y suelo lunar.',
        'Apollo 11 returned 21.55 kg of lunar rock and soil.',
      ),
      ['nssdca-a11-lm'],
      { unit: 'kg' },
    ),
    fact(
      'launchPad',
      L('Su papel', 'Its role'),
      'LM',
      L(
        'La etapa de descenso se quedó en la Luna y sirvió de plataforma de lanzamiento para la etapa de ascenso.',
        'The descent stage stayed on the Moon and served as the launch pad for the ascent stage.',
      ),
      ['nssdca-a11-lm'],
    ),
    fact(
      'ascentFate',
      L('La otra mitad', 'The other half'),
      '1969-07-22',
      L(
        'La etapa de ascenso del Eagle se soltó en órbita lunar el 22 de julio de 1969; se supone que cayó en 1 a 4 meses, pero su destino exacto no se conoce.',
        "Eagle's ascent stage was released in lunar orbit on 22 July 1969; it is thought to have crashed within 1 to 4 months, but its exact fate is unknown.",
      ),
      ['nssdca-a11-lm'],
    ),
    fact(
      'goodwill',
      L('Disco de buena voluntad', 'Goodwill disc'),
      73,
      L(
        'Un disco de silicio con mensajes de líderes de 73 países; entre ellos, los presidentes de México (Gustavo Díaz Ordaz) y Ecuador (José María Velasco Ibarra).',
        'A silicon disc with messages from leaders of 73 countries, including the presidents of Mexico (Gustavo Díaz Ordaz) and Ecuador (José María Velasco Ibarra).',
      ),
      ['nasa-goodwill', 'wiki-goodwill'],
    ),
    fact(
      'plaque',
      L('La placa', 'The plaque'),
      'Apollo 11',
      L(
        'Placa en la pata de la escalera del Eagle (texto original en inglés, dominio público).',
        "Plaque on Eagle's ladder leg (original English text, public domain).",
      ),
      ['nssdca-a11-lm'],
    ),
  ],
  discoveries: [
    {
      text: L(
        'El regreso de 21,55 kg de rocas y suelo del Apollo 11, y de cientos de kilos en las misiones siguientes, permitió datar la Luna y entender su origen.',
        'The return of 21.55 kg of rock and soil by Apollo 11, and hundreds of kilograms by later missions, made it possible to date the Moon and understand its origin.',
      ),
      sourceIds: ['nssdca-a11-lm'],
    },
  ],
  today: {
    text: L(
      'Las seis etapas de descenso siguen en sus sitios.',
      'All six descent stages remain at their sites.',
    ),
    sourceIds: ['nssdca-a11-lm', 'nssdca-lunar-sites'],
  },
  legacy: {
    text: L(
      'El método de dos etapas inspira a los aterrizadores lunares actuales.',
      'The two-stage approach inspires today’s lunar landers.',
    ),
    to: ['alsep', 'lrv', 'epilogue'],
  },
  sites: sitesFor('apollo-lm'),
  imageQueries: ['Apollo 11 lunar module Eagle', 'Apollo 11 plaque'],
  model: 'apollo-lm',
  patch: { glyph: 'descent-stage', colors: ['#0b0f1a', '#a8d8ff', '#e8eef7'] },
  lightTimeTarget: 'moon',
  keyPart: L(
    'Patas con discos de apoyo y placa del Apollo 11',
    'Legs with footpads and the Apollo 11 plaque',
  ),
};

/** Datos de la tabla de alunizajes Apollo (Parte 11.2), usados por la mini-experiencia. */
export const APOLLO_LANDINGS = [
  {
    site: 'apollo-11-lm',
    mission: 'Apollo 11',
    lm: 'Eagle',
    date: '1969-07-20T20:17:40Z',
    place: L('Mar de la Tranquilidad', 'Sea of Tranquility'),
    walkers: 'Neil Armstrong · Buzz Aldrin',
  },
  {
    site: 'apollo-12-lm',
    mission: 'Apollo 12',
    lm: 'Intrepid',
    date: '1969-11-19',
    place: L(
      'Océano de las Tormentas, a unos 180 m del Surveyor 3',
      'Ocean of Storms, about 180 m from Surveyor 3',
    ),
    walkers: 'Pete Conrad · Alan Bean',
  },
  {
    site: 'apollo-14-lm',
    mission: 'Apollo 14',
    lm: 'Antares',
    date: '1971-02-05',
    place: L('Fra Mauro', 'Fra Mauro'),
    walkers: 'Alan Shepard · Edgar Mitchell',
  },
  {
    site: 'apollo-15-lm',
    mission: 'Apollo 15',
    lm: 'Falcon',
    date: '1971-07-30',
    place: L('Hadley–Apeninos', 'Hadley–Apennine'),
    walkers: 'David Scott · James Irwin',
  },
  {
    site: 'apollo-16-lm',
    mission: 'Apollo 16',
    lm: 'Orion',
    date: '1972-04-21',
    place: L('Tierras altas de Descartes', 'Descartes Highlands'),
    walkers: 'John Young · Charles Duke',
  },
  {
    site: 'apollo-17-lm',
    mission: 'Apollo 17',
    lm: 'Challenger',
    date: '1972-12-11',
    place: L('Valle de Taurus-Littrow', 'Taurus-Littrow valley'),
    walkers: 'Eugene Cernan · Harrison Schmitt',
  },
] as const;
export const APOLLO_LANDINGS_SOURCES = [
  'nssdca-a11-lm',
  'nssdca-a12-alsep',
  'nssdca-lunar-sites',
  'nssdca-a15-lrv',
  'nasa-sp4214',
];

/** Texto de la placa del Apollo 11 (dominio público; en inglés original). */
export const APOLLO11_PLAQUE = {
  original:
    'Here men from the planet Earth first set foot upon the Moon, July 1969 A.D. We came in peace for all mankind.',
  es: 'Aquí hombres del planeta Tierra pisaron por primera vez la Luna, julio de 1969 d. C. Vinimos en paz en nombre de toda la humanidad.',
};

export const alsep: Machine = {
  id: 'alsep',
  order: 3,
  world: 'moon',
  body: MOON,
  type: 'instrument',
  status: 'still-useful',
  name: L('ALSEP y retrorreflectores láser', 'ALSEP and laser retroreflectors'),
  shortName: L('ALSEP', 'ALSEP'),
  chapterTitle: L('Los que escuchaban a la Luna', 'The Ones Who Listened to the Moon'),
  arrival: { date: '1969-11-19', kind: 'landing', sourceIds: ['nssdca-a12-alsep'] },
  lastSignal: {
    date: '1977-09-30',
    sourceIds: ['nasa-pr-77-203', 'ntrs-alsep-termination'],
    note: L(
      'Los retrorreflectores, que no necesitan energía, siguen devolviendo los pulsos de láser.',
      'The retroreflectors, which need no power, still send laser pulses back.',
    ),
  },
  facts: [
    fact(
      'what',
      L('Qué es', 'What it is'),
      'ALSEP',
      L(
        'Paquetes de experimentos que los astronautas dejaron funcionando en la Luna, controlados desde la Tierra.',
        'Experiment packages that astronauts left running on the Moon, controlled from Earth.',
      ),
      ['nssdca-a12-alsep'],
    ),
    fact(
      'missions',
      L('Misiones', 'Missions'),
      5,
      L(
        'Estaciones ALSEP en Apollo 12, 14, 15, 16 y 17; el Apollo 11 dejó un paquete precursor (EASEP) con sismómetro y retrorreflector.',
        'ALSEP stations on Apollo 12, 14, 15, 16 and 17; Apollo 11 left a precursor package (EASEP) with a seismometer and a retroreflector.',
      ),
      ['nssdca-a11-lm', 'ntrs-alsep-termination'],
    ),
    fact(
      'easep',
      L('EASEP del Apollo 11', 'Apollo 11 EASEP'),
      48,
      L(
        '48 kg, con paneles solares; se encendió el 21 de julio de 1969 y dejó de transmitir el 3 de agosto de 1969.',
        '48 kg, solar powered; switched on 21 July 1969 and stopped transmitting on 3 August 1969.',
      ),
      ['nssdca-a11-lm'],
      { unit: 'kg' },
    ),
    fact(
      'instruments12',
      L('Instrumentos del Apollo 12', 'Apollo 12 instruments'),
      6,
      L(
        'Seis: sismómetro pasivo, detector de iones supratérmicos, medidor de iones de cátodo frío, detector de polvo, magnetómetro y espectrómetro de viento solar.',
        'Six: passive seismometer, suprathermal ion detector, cold cathode ion gauge, dust detector, magnetometer and solar wind spectrometer.',
      ),
      ['nssdca-a12-alsep'],
    ),
    fact(
      'power',
      L('Energía', 'Power'),
      70,
      L(
        'Generador de radioisótopos SNAP-27: 70 W a 16 V al desplegarse y 63,5 W tras un año; cápsula de unos 4 kg de plutonio-238; generador de 17 kg y 46 cm de alto.',
        'SNAP-27 radioisotope generator: 70 W at 16 V when deployed and 63.5 W after a year; a capsule of about 4 kg of plutonium-238; a 17 kg generator 46 cm tall.',
      ),
      ['nssdca-a12-alsep'],
      { unit: 'W' },
    ),
    fact(
      'central12',
      L('Estación central', 'Central station'),
      25,
      L(
        'Caja de 25 kg con una antena de 58 cm apuntada a la Tierra; desplegada el 19 de noviembre de 1969 en 3,0094° S, 23,4246° O.',
        'A 25 kg box with a 58 cm antenna aimed at Earth; deployed on 19 November 1969 at 3.0094° S, 23.4246° W.',
      ),
      ['nssdca-a12-alsep'],
      { unit: 'kg' },
    ),
    fact(
      'artificialQuake',
      L('El sismo artificial', 'The artificial quake'),
      55,
      L(
        'El 20 de noviembre de 1969 la etapa de ascenso del Intrepid se estrelló a propósito en 3,94° S, 21,20° O: el primer sismo lunar artificial registrado. El suelo siguió vibrando unos 55 minutos.',
        "On 20 November 1969 Intrepid's ascent stage was crashed on purpose at 3.94° S, 21.20° W: the first artificial moonquake ever recorded. The ground kept vibrating for about 55 minutes.",
      ),
      ['nssdca-a12-alsep', 'apollo12-seismic'],
      { unit: 'min', approx: true },
    ),
    fact(
      'network',
      L('Red sísmica', 'Seismic network'),
      4,
      L(
        'Los cuatro sismómetros (Apollo 12, 14, 15 y 16) funcionaron juntos como una red.',
        'The four seismometers (Apollo 12, 14, 15 and 16) worked together as a network.',
      ),
      ['nasa-pr-77-203'],
    ),
    fact(
      'end',
      L('Fin', 'End'),
      '1977-09-30',
      L(
        'Todas las estaciones se apagaron el 30 de septiembre de 1977; NASA consideró que seguir era menos prioritario que otros usos del presupuesto.',
        'All stations were switched off on 30 September 1977; NASA judged that continuing was a lower priority than other uses of its budget.',
      ),
      ['nasa-pr-77-203', 'ntrs-alsep-termination'],
    ),
    fact(
      'data',
      L('Datos recibidos', 'Data received'),
      '10¹²',
      L(
        'Más de un billón (10¹²) de bits y más de 29 años de funcionamiento sumando todas las estaciones.',
        'More than a trillion (10¹²) bits and more than 29 years of operation adding up all the stations.',
      ),
      ['nasa-pr-77-203'],
    ),
    fact(
      'retros',
      L('Retrorreflectores en uso', 'Retroreflectors in use'),
      3,
      L(
        'Los de Apollo 11, 14 y 15 siguen usándose; los del 11 y el 14 tienen 100 prismas y el del 15 tiene 300. Hay otros dos en los rovers soviéticos Lunokhod 1 y 2.',
        'Those of Apollo 11, 14 and 15 are still in use; Apollo 11 and 14 have 100 prisms each and Apollo 15 has 300. There are two more on the Soviet Lunokhod 1 and 2 rovers.',
      ),
      ['nist-retro', 'jpl-llr-2019'],
    ),
    fact(
      'recession',
      L('La Luna se aleja', 'The Moon drifts away'),
      3.8,
      L(
        'La Luna se aleja de la Tierra unos 3,8 cm por año; la precisión actual de la distancia es de aproximadamente 1 mm.',
        'The Moon moves away from Earth by about 3.8 cm per year; today the distance is measured to about 1 mm.',
      ),
      ['nist-retro', 'jpl-llr-2019'],
      { unit: 'cm', approx: true },
    ),
    fact(
      'analogy',
      L('Puntería', 'Aim'),
      3,
      L(
        'Acertar con un láser en un retrorreflector se ha comparado con dar con un rifle a una moneda en movimiento a 3 km.',
        'Hitting a retroreflector with a laser has been compared to hitting a moving coin with a rifle from 3 km away.',
      ),
      ['nist-retro'],
      { unit: 'km' },
    ),
    fact(
      'roundTrip',
      L('Ida y vuelta del láser', 'Laser round trip'),
      2.57,
      L(
        'Un pulso de luz tarda unos 2,6 s en ir y volver (estimación calculada: 2 × 385.000 km ÷ 299.792,458 km/s).',
        'A light pulse takes about 2.6 s to go and come back (calculated estimate: 2 × 385,000 km ÷ 299,792.458 km/s).',
      ),
      ['jpl-llr-2019'],
      { unit: 's', approx: true },
    ),
  ],
  discoveries: [
    {
      text: L(
        'La Luna tiene sismos (profundos, superficiales y por impactos); vibra mucho tiempo porque su capa exterior está muy fracturada y seca; y se aleja de la Tierra 3,8 cm al año.',
        'The Moon has quakes (deep, shallow and from impacts); it rings for a long time because its outer layer is very fractured and dry; and it moves away from Earth by 3.8 cm per year.',
      ),
      sourceIds: ['apollo12-seismic', 'nist-retro'],
    },
  ],
  today: {
    text: L(
      'Los instrumentos con energía están apagados desde 1977; los retrorreflectores, que no necesitan energía, siguen devolviendo láseres.',
      'The powered instruments have been off since 1977; the retroreflectors, which need no power, still return laser pulses.',
    ),
    sourceIds: ['jpl-llr-2019'],
  },
  legacy: {
    text: L(
      'Observatorios de todo el mundo siguen apuntando a estos espejos.',
      'Observatories around the world still aim at these mirrors.',
    ),
    to: ['epilogue'],
  },
  sites: sitesFor('alsep'),
  imageQueries: ['Apollo 12 ALSEP', 'laser ranging retroreflector Apollo 11'],
  model: 'alsep',
  patch: { glyph: 'seismo', colors: ['#0b0f1a', '#a8d8ff', '#5ef2ff'] },
  lightTimeTarget: 'moon',
  keyPart: L('Sismómetro y retrorreflector', 'Seismometer and retroreflector'),
};

export const lrv: Machine = {
  id: 'lrv',
  order: 4,
  world: 'moon',
  body: MOON,
  type: 'rover',
  status: 'silent-surface',
  name: L('Vehículo de exploración lunar (LRV)', 'Lunar Roving Vehicle (LRV)'),
  shortName: L('LRV', 'LRV'),
  chapterTitle: L('Los autos de la Luna', 'The Cars of the Moon'),
  arrival: { date: '1971-07-30', kind: 'landing', sourceIds: ['nssdca-a15-lrv'] },
  lastSignal: {
    date: '1972-12-11',
    sourceIds: ['nssdca-lunar-sites', 'nssdca-lrv'],
    note: L(
      'El LRV no tenía radio propia para hablar con la Tierra. Esta fecha es la del alunizaje del Apollo 17, la misión de su último viaje.',
      'The LRV had no radio of its own to talk to Earth. This date is the landing of Apollo 17, the mission of its last drive.',
    ),
  },
  facts: [
    fact(
      'count',
      L('En la Luna', 'On the Moon'),
      3,
      L(
        'Tres quedaron en la Luna (Apollo 15, 16 y 17); se construyeron cuatro, uno para repuestos.',
        'Three stayed on the Moon (Apollo 15, 16 and 17); four were built, one used for spare parts.',
      ),
      ['nssdca-lrv'],
    ),
    fact(
      'mass',
      L('Masa', 'Mass'),
      210,
      L(
        'Pesaba 210 kg y estaba diseñado para llevar 490 kg de carga adicional en la Luna.',
        'It had a mass of 210 kg and was designed to carry 490 kg of extra payload on the Moon.',
      ),
      ['nssdca-lrv'],
      { unit: 'kg' },
    ),
    fact(
      'size',
      L('Tamaño', 'Size'),
      3.1,
      L(
        '3,1 m de largo, 2,3 m entre ejes, 1,14 m de altura máxima y 36 cm de despeje cargado.',
        '3.1 m long, 2.3 m wheelbase, 1.14 m maximum height and 36 cm ground clearance when loaded.',
      ),
      ['nssdca-lrv'],
      { unit: 'm' },
    ),
    fact(
      'power',
      L('Energía', 'Power'),
      36,
      L(
        'Dos baterías de 36 V de plata-zinc e hidróxido de potasio, no recargables, de 121 Ah.',
        'Two non-rechargeable 36 V silver-zinc potassium hydroxide batteries of 121 Ah.',
      ),
      ['nssdca-lrv'],
      { unit: 'V' },
    ),
    fact(
      'controls',
      L('Mandos', 'Controls'),
      'T',
      L(
        'Un mando en T entre los asientos controlaba los cuatro motores de tracción, los dos de dirección y los frenos.',
        'A T-shaped hand controller between the seats drove the four traction motors, the two steering motors and the brakes.',
      ),
      ['nssdca-lrv'],
    ),
    fact(
      'apollo15',
      L('Apollo 15', 'Apollo 15'),
      27.8,
      L(
        '27,8 km en 3 h 2 min de conducción; tramo más largo 12,5 km; hasta 5,0 km del módulo (la ficha de la misión suma 27,9 km en tres salidas).',
        '27.8 km in 3 h 2 min of driving; longest traverse 12.5 km; up to 5.0 km from the lunar module (the mission record totals 27.9 km over three outings).',
      ),
      ['nssdca-lrv', 'nssdca-a15-lrv'],
      { unit: 'km' },
    ),
    fact(
      'apollo16',
      L('Apollo 16', 'Apollo 16'),
      26.7,
      L(
        '26,7 km en 3 h 26 min; tramo más largo 11,6 km; hasta 4,5 km del módulo.',
        '26.7 km in 3 h 26 min; longest traverse 11.6 km; up to 4.5 km from the lunar module.',
      ),
      ['nssdca-lrv'],
      { unit: 'km' },
    ),
    fact(
      'apollo17',
      L('Apollo 17', 'Apollo 17'),
      35.9,
      L(
        '35,9 km en 4 h 26 min; tramo más largo 20,1 km; hasta 7,6 km del módulo.',
        '35.9 km in 4 h 26 min; longest traverse 20.1 km; up to 7.6 km from the lunar module.',
      ),
      ['nssdca-lrv'],
      { unit: 'km' },
    ),
    fact(
      'speed',
      L('Velocidad récord', 'Speed record'),
      18,
      L(
        '18 km/h con Eugene Cernan al volante en el Apollo 17, según Guinness World Records.',
        '18 km/h with Eugene Cernan driving on Apollo 17, according to Guinness World Records.',
      ),
      ['register-lrv'],
      { unit: 'km/h' },
    ),
    fact(
      'fender',
      L('El guardabarros', 'The fender'),
      'Apollo 17',
      L(
        'En la primera salida del Apollo 17, un martillo se enganchó en el guardabarros trasero derecho y arrancó una parte; hubo que improvisar un guardabarros nuevo.',
        'On the first Apollo 17 outing, a hammer caught the right rear fender and tore part of it off; a new fender had to be improvised.',
      ),
      ['astronomy-lrv'],
    ),
    fact(
      'finalPos',
      L('Posición final', 'Final position'),
      'LROC',
      L(
        'Apollo 16: 8,9729° S, 15,5037° E; Apollo 17: 20,1896° N, 30,7769° E.',
        'Apollo 16: 8.9729° S, 15.5037° E; Apollo 17: 20.1896° N, 30.7769° E.',
      ),
      ['lroc-coords-2016'],
    ),
    // TODO(verificar): cámara remota del LRV (Apollo Lunar Surface Journal).
    fact(
      'tvCamera',
      L('Cámara remota', 'Remote camera'),
      'TV',
      L(
        'Una cámara de TV del LRV, manejada desde la Tierra, filmó los despegues de los módulos.',
        'An LRV TV camera, operated from Earth, filmed the lunar module liftoffs.',
      ),
      ['nssdca-lrv'],
      { pending: true },
    ),
    // TODO(verificar): reparación con mapas plastificados (Apollo Lunar Surface Journal).
    fact(
      'mapFix',
      L('Reparación', 'Repair'),
      'Apollo 17',
      L(
        'El guardabarros improvisado se hizo con mapas plastificados, cinta y pinzas.',
        'The improvised fender was made from laminated maps, tape and clamps.',
      ),
      ['astronomy-lrv'],
      { pending: true },
    ),
  ],
  discoveries: [
    {
      text: L(
        'Sin el LRV, los grandes hallazgos geológicos de Apollo 15, 16 y 17 no habrían sido posibles, según el geólogo del Apollo 17, Harrison Schmitt.',
        'Without the LRV, the major geological finds of Apollo 15, 16 and 17 would not have been possible, according to Apollo 17 geologist Harrison Schmitt.',
      ),
      sourceIds: ['nssdca-lrv'],
    },
  ],
  today: {
    text: L(
      'Los tres siguen aparcados; sus baterías no eran recargables, así que no pueden volver a moverse.',
      'All three are still parked; their batteries were not rechargeable, so they cannot move again.',
    ),
    sourceIds: ['nssdca-lrv', 'register-lrv'],
  },
  legacy: {
    text: L(
      'Los rovers lunares que se diseñan hoy parten de su experiencia.',
      'Lunar rovers being designed today build on its experience.',
    ),
    to: ['epilogue'],
  },
  sites: sitesFor('lrv'),
  imageQueries: ['Lunar Roving Vehicle Apollo 15', 'Apollo 17 lunar rover'],
  model: 'lrv',
  patch: { glyph: 'wheel-tracks', colors: ['#0b0f1a', '#a8d8ff', '#ffb547'] },
  lightTimeTarget: 'moon',
  keyPart: L('Ruedas de malla metálica', 'Wire-mesh wheels'),
};
