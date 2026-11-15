import type { Machine } from '../types';
import { fact, L } from './helpers';

export const near: Machine = {
  id: 'near',
  order: 12,
  world: 'small-bodies',
  body: L('433 Eros', '433 Eros'),
  type: 'orbiter',
  status: 'silent-surface',
  name: L('NEAR Shoemaker', 'NEAR Shoemaker'),
  shortName: L('NEAR', 'NEAR'),
  chapterTitle: L(
    'La que aterrizó sin estar diseñada para ello',
    'The One That Landed Without Being Built To',
  ),
  launch: { date: '1996-02-17T20:43:27Z', sourceIds: ['nasa-near'] },
  arrival: { date: '2000-02-14', kind: 'orbit', sourceIds: ['nasa-near'] },
  lastSignal: {
    date: '2001-02-28',
    sourceIds: ['nasa-near'],
    note: L(
      'Vencida por un frío extremo de −173 °C. El 10 de diciembre de 2002 NASA intentó contactarla sin éxito.',
      'Overcome by extreme cold of −173 °C. On December 10, 2002, NASA tried to contact it without success.',
    ),
  },
  facts: [
    fact(
      'launch',
      L('Lanzamiento', 'Launch'),
      '1996-02-17T20:43:27Z',
      L('El 17 de febrero de 1996 a las 20:43:27 UTC.', 'On February 17, 1996, at 20:43:27 UTC.'),
      ['nasa-near'],
    ),
    fact(
      'mathilde',
      L('Paso por Mathilde', 'Mathilde flyby'),
      1200,
      L(
        'El 27 de junio de 1997 pasó a unos 1.200 km del asteroide Mathilde.',
        'On June 27, 1997, it flew about 1,200 km from the asteroid Mathilde.',
      ),
      ['nasa-near'],
      { unit: 'km', approx: true },
    ),
    fact(
      'missed',
      L('La cita fallida', 'The missed date'),
      3827,
      L(
        'El 20 de diciembre de 1998 se abortó un encendido clave; la nave pasó de largo junto a Eros el 23 de diciembre a unos 3.827 km y tuvo que dar una vuelta más alrededor del Sol.',
        'On December 20, 1998, a key engine burn aborted; the spacecraft flew past Eros on December 23 at about 3,827 km and had to make one more loop around the Sun.',
      ),
      ['nasa-near'],
      { unit: 'km', approx: true },
    ),
    fact(
      'orbit',
      L('En órbita', 'In orbit'),
      '2000-02-14',
      L(
        'El 14 de febrero de 2000 (Día de San Valentín), un año más tarde de lo previsto: el primer objeto humano en orbitar un asteroide.',
        "On February 14, 2000 (Valentine's Day), a year later than planned: the first human-made object to orbit an asteroid.",
      ),
      ['nasa-near'],
    ),
    fact(
      'rename',
      L('Nuevo nombre', 'New name'),
      '2000-03-14',
      L(
        'El 14 de marzo de 2000 NASA la rebautizó NEAR Shoemaker en honor del geólogo Eugene M. Shoemaker (1928–1997).',
        'On March 14, 2000, NASA renamed it NEAR Shoemaker in honor of geologist Eugene M. Shoemaker (1928–1997).',
      ),
      ['nasa-near'],
    ),
    fact(
      'landing',
      L('Aterrizaje', 'Landing'),
      6.4,
      L(
        'El 12 de febrero de 2001 a las 19:44 UTC, justo al sur de la silla llamada Himeros, a unos 6,4 km/h. No estaba diseñada para posarse.',
        'On February 12, 2001, at 19:44 UTC, just south of the saddle called Himeros, at about 6.4 km/h. It was not designed to land.',
      ),
      ['nasa-near'],
      { unit: 'km/h', approx: true },
    ),
    fact(
      'images',
      L('Imágenes', 'Images'),
      160000,
      L(
        '69 fotos de alta resolución durante el descenso; 160.000 en total, unas diez veces más datos de los planeados.',
        '69 high-resolution pictures during the descent; 160,000 in total, about ten times more data than planned.',
      ),
      ['nasa-near'],
    ),
    fact(
      'surfaceData',
      L('Desde la superficie', 'From the surface'),
      2,
      L(
        'Envió datos valiosos durante unas dos semanas desde la superficie.',
        'It sent valuable data from the surface for about two weeks.',
      ),
      ['nasa-near'],
      { unit: 'sem', approx: true },
    ),
    fact(
      'cold',
      L('Última señal', 'Last signal'),
      -173,
      L(
        'El 28 de febrero de 2001, vencida por un frío extremo de −173 °C.',
        'On February 28, 2001, overcome by extreme cold of −173 °C.',
      ),
      ['nasa-near'],
      { unit: '°C' },
    ),
    fact(
      'lastAttempt',
      L('Último intento', 'Last attempt'),
      '2002-12-10',
      L(
        'El 10 de diciembre de 2002 NASA intentó contactarla sin éxito.',
        'On December 10, 2002, NASA tried to contact it without success.',
      ),
      ['nasa-near'],
    ),
    fact(
      'eros',
      L('Eros', 'Eros'),
      34.4,
      L(
        'Unos 34,4 × 11,2 × 11,2 km; rota cada 5,27 h y da una vuelta al Sol cada 1,76 años.',
        'About 34.4 × 11.2 × 11.2 km; it spins every 5.27 h and orbits the Sun every 1.76 years.',
      ),
      ['psi-eros', 'theskylive-eros'],
      { unit: 'km', approx: true },
    ),
  ],
  discoveries: [
    {
      text: L(
        'Eros es un cuerpo sólido, cubierto de rocas y polvo fino, que guarda información de los inicios del sistema solar.',
        'Eros is a solid body, covered in boulders and fine dust, that keeps a record of the early Solar System.',
      ),
      sourceIds: ['nasa-near'],
    },
  ],
  today: {
    text: L(
      'Sigue posada sobre Eros, que viaja alrededor del Sol.',
      'It still rests on Eros, which travels around the Sun.',
    ),
    sourceIds: ['nasa-near'],
  },
  legacy: {
    text: L(
      'Misiones posteriores tomaron muestras de asteroides y hasta desviaron uno; Eugene Shoemaker también está en la Luna (ficha extra de Lunar Prospector).',
      'Later missions sampled asteroids and even nudged one; Eugene Shoemaker is also on the Moon (see the Lunar Prospector extra entry).',
    ),
    to: ['dawn', 'epilogue'],
  },
  sites: [],
  imageQueries: ['NEAR Shoemaker Eros', '433 Eros asteroid'],
  model: 'near',
  patch: { glyph: 'asteroid-touch', colors: ['#0b0f1a', '#e6c79c', '#a3876b'] },
  lightTimeTarget: 'eros',
  keyPart: L('Antena de alta ganancia y paneles', 'High-gain antenna and panels'),
};

export const dawn: Machine = {
  id: 'dawn',
  order: 13,
  world: 'small-bodies',
  body: L('Ceres', 'Ceres'),
  type: 'orbiter',
  status: 'silent-orbit',
  name: L('Dawn', 'Dawn'),
  chapterTitle: L('La viajera de dos mundos', 'The Traveler of Two Worlds'),
  launch: { date: '2007-09-27', sourceIds: ['nasa-dawn-highlights', 'nasa-dawn'] },
  arrival: { date: '2011-07-16', kind: 'orbit', sourceIds: ['nasa-dawn-history'] },
  lastSignal: {
    date: '2018-11-01',
    noteOnly: true,
    sourceIds: ['jpl-dawn-end'],
    note: L(
      'No respondió en las sesiones de comunicación del 31 de octubre y el 1 de noviembre de 2018: se le acabó la hidracina que usaba para orientarse.',
      'It did not respond during the communication sessions of October 31 and November 1, 2018: it had run out of the hydrazine it used to point itself.',
    ),
  },
  missionEnd: { date: '2018-11-01', sourceIds: ['jpl-dawn-end', 'nasa-dawn-107840'] },
  facts: [
    fact(
      'launch',
      L('Lanzamiento', 'Launch'),
      '2007-09-27',
      L('El 27 de septiembre de 2007.', 'On September 27, 2007.'),
      ['nasa-dawn-highlights', 'nasa-dawn'],
    ),
    fact(
      'marsAssist',
      L('Ayuda de Marte', 'Mars assist'),
      '2009-02-17',
      L(
        'El 17 de febrero de 2009 la gravedad de Marte le dio un empujón.',
        "On February 17, 2009, Mars's gravity gave it a push.",
      ),
      ['nasa-dawn-highlights'],
    ),
    fact(
      'propulsion',
      L('Propulsión', 'Propulsion'),
      425,
      L(
        'Propulsión eléctrica solar con motores iónicos y 425 kg (937 libras) de gas xenón.',
        'Solar electric propulsion with ion engines and 425 kg (937 pounds) of xenon gas.',
      ),
      ['nasa-dawn-history'],
      { unit: 'kg' },
    ),
    fact(
      'vestaArrival',
      L('Llegada a Vesta', 'Arrival at Vesta'),
      '2011-07-16',
      L(
        'El 16 de julio de 2011: la primera nave en orbitar un objeto del cinturón principal de asteroides.',
        'On July 16, 2011: the first spacecraft to orbit an object in the main asteroid belt.',
      ),
      ['nasa-dawn-history'],
    ),
    fact(
      'vestaDeparture',
      L('Salida de Vesta', 'Leaving Vesta'),
      '2012-09-05',
      L(
        'El 5 de septiembre de 2012, tras unos 14 meses en órbita.',
        'On September 5, 2012, after about 14 months in orbit.',
      ),
      ['nasa-dawn-history', 'nasa-dawn-140784'],
    ),
    fact(
      'ceresArrival',
      L('Llegada a Ceres', 'Arrival at Ceres'),
      '2015-03-06',
      L(
        'El 6 de marzo de 2015: la primera nave en orbitar dos cuerpos distintos más allá de la Tierra y la primera en visitar un planeta enano, cuatro meses antes de que New Horizons pasara por Plutón.',
        'On March 6, 2015: the first spacecraft to orbit two different bodies beyond Earth and the first to visit a dwarf planet, four months before New Horizons flew past Pluto.',
      ),
      ['nasa-dawn-140784', 'jpl-dawn-end'],
    ),
    fact(
      'vesta',
      L('Vesta', 'Vesta'),
      2,
      L(
        'Su montaña central, en una gigantesca cuenca del polo sur, mide unas dos veces la altura del Everest: una de las más altas del sistema solar. También tiene minerales con agua.',
        'Its central mountain, inside a giant south-polar basin, is about twice the height of Everest: one of the tallest in the Solar System. It also has water-bearing minerals.',
      ),
      ['nasa-dawn-107840', 'nasa-dawn-highlights'],
      { unit: '× Everest', approx: true },
    ),
    fact(
      'occator',
      L('Ceres', 'Ceres'),
      'Na₂CO₃',
      L(
        'Las manchas brillantes del cráter Occator son sales, sobre todo carbonato de sodio, subidas en forma de salmuera: el mayor depósito de carbonatos visto fuera de la Tierra.',
        'The bright spots in Occator crater are salts, mostly sodium carbonate, brought up as brine: the largest deposit of carbonates seen outside Earth.',
      ),
      ['nasa-dawn-history', 'nasa-dawn-107840'],
    ),
    fact(
      'ahuna',
      L('Ahuna Mons', 'Ahuna Mons'),
      '4–5',
      L(
        'Una montaña solitaria de unos 4 a 5 km que probablemente es un criovolcán: un volcán de agua salada y barro helado.',
        'A lone mountain about 4 to 5 km tall that is probably a cryovolcano: a volcano of salty water and icy mud.',
      ),
      ['nasa-dawn-107840', 'americaspace-dawn'],
      { unit: 'km', approx: true },
    ),
    fact(
      'closest',
      L('Muy cerca', 'Up close'),
      35,
      L(
        'En sus últimas órbitas llegó a unos 35 km de la superficie de Ceres.',
        'In its final orbits it came within about 35 km of the surface of Ceres.',
      ),
      ['mps-dawn'],
      { unit: 'km', approx: true },
    ),
    fact(
      'journey',
      L('Viaje total', 'Total journey'),
      6900,
      L('Unos 6.900 millones de km en 11 años.', 'About 6.9 billion km in 11 years.'),
      ['astronomy-dawn'],
      { unit: 'M km', approx: true },
    ),
    fact(
      'hydrazine',
      L('Última señal', 'Last signal'),
      '2018-11-01',
      L(
        'No respondió en las sesiones del 31 de octubre y el 1 de noviembre de 2018: se le acabó la hidracina que usaba para orientarse.',
        'It did not respond during the sessions of October 31 and November 1, 2018: it had run out of the hydrazine it used to point itself.',
      ),
      ['jpl-dawn-end'],
    ),
    fact(
      'orbitStability',
      L('Su órbita', 'Its orbit'),
      20,
      L(
        'Se diseñó para no estrellarse durante al menos 20 años; los ingenieros tienen más del 99 % de confianza en que durará al menos 50.',
        'It was designed not to crash for at least 20 years; engineers are more than 99% confident it will last at least 50.',
      ),
      ['jpl-dawn-legacy', 'phys-dawn-end'],
      { unit: 'a' },
    ),
  ],
  discoveries: [
    {
      text: L(
        'Vesta es un mundo más variado de lo esperado; Ceres estuvo geológicamente activo hace poco, con líquidos salados bajo la superficie.',
        'Vesta is a more varied world than expected; Ceres was geologically active recently, with salty liquids under the surface.',
      ),
      sourceIds: ['nasa-dawn-highlights', 'nasa-dawn-107840'],
    },
  ],
  today: {
    text: L(
      'Un "monumento celeste" inerte en órbita alrededor de Ceres, en palabras de su director de vuelo.',
      'An inert "celestial monument" orbiting Ceres, in the words of its flight director.',
    ),
    sourceIds: ['jpl-dawn-legacy'],
  },
  legacy: {
    text: L(
      'Llevó la propulsión iónica más lejos que nunca, después de que Deep Space 1 la demostrara.',
      'It took ion propulsion farther than ever, after Deep Space 1 demonstrated it.',
    ),
    to: ['epilogue'],
  },
  sites: [],
  imageQueries: ['Dawn Ceres Occator bright spots', 'Dawn Vesta'],
  model: 'dawn',
  patch: { glyph: 'ion-trail', colors: ['#0b0f1a', '#e6c79c', '#5ef2ff'] },
  lightTimeTarget: 'ceres',
  keyPart: L('Motor iónico encendido', 'Ion engine firing'),
};

export const kepler: Machine = {
  id: 'kepler',
  order: 14,
  world: 'deep-space',
  body: L('Órbita solar', 'Solar orbit'),
  type: 'telescope',
  status: 'drifting',
  name: L('Telescopio espacial Kepler', 'Kepler space telescope'),
  shortName: L('Kepler', 'Kepler'),
  chapterTitle: L('El cazador de planetas', 'The Planet Hunter'),
  launch: { date: '2009-03-06', sourceIds: ['nasa-kepler'] },
  lastSignal: {
    date: '2018-11-15',
    sourceIds: ['nasa-kepler-goodnight', 'solardaily-kepler'],
    note: L(
      'Ese día recibió los comandos finales que apagaron sus comunicaciones.',
      'That day it received the final commands that turned off its communications.',
    ),
  },
  missionEnd: { date: '2018-10-30', sourceIds: ['nasa-kepler'] },
  facts: [
    fact(
      'launch',
      L('Lanzamiento', 'Launch'),
      '2009-03-06',
      L('El 6 de marzo de 2009.', 'On March 6, 2009.'),
      ['nasa-kepler'],
    ),
    fact(
      'orbit',
      L('Órbita', 'Orbit'),
      'Sol',
      L('Alrededor del Sol, no de la Tierra.', 'Around the Sun, not around Earth.'),
      ['nasa-kepler'],
    ),
    fact(
      'field',
      L('Qué miraba', 'What it watched'),
      150000,
      L(
        'Una sola región del cielo en la constelación del Cisne, con unas 150.000 estrellas; espejo de 1,4 m.',
        'A single patch of sky in the constellation Cygnus, with about 150,000 stars; a 1.4 m mirror.',
      ),
      ['nasa-kepler'],
      { approx: true },
    ),
    fact(
      'method',
      L('Cómo encontraba planetas', 'How it found planets'),
      'Δ',
      L(
        'Medía el brillo de las estrellas sin parar; cuando un planeta pasa delante de su estrella, el brillo baja un poco (tránsito).',
        'It measured the brightness of stars nonstop; when a planet passes in front of its star, the brightness dips a little (a transit).',
      ),
      ['nasa-kepler'],
    ),
    fact(
      'firsts',
      L('Primeros hallazgos', 'First finds'),
      'Kepler-11',
      L(
        'Enero de 2010: Kepler-4b a 8b; abril de 2010: Kepler-9, el primer sistema confirmado con varios planetas en tránsito; febrero de 2011: Kepler-11, a unos 2.000 años luz, con seis planetas.',
        'January 2010: Kepler-4b to 8b; April 2010: Kepler-9, the first confirmed system with several transiting planets; February 2011: Kepler-11, about 2,000 light-years away, with six planets.',
      ),
      ['nasa-kepler'],
    ),
    fact(
      'wheels',
      L('La avería', 'The breakdown'),
      '2013-05',
      L(
        'En mayo de 2013 falló la segunda de sus cuatro ruedas de reacción; necesitaba tres para apuntar con precisión.',
        'In May 2013 the second of its four reaction wheels failed; it needed three to point precisely.',
      ),
      ['nasa-kepler'],
    ),
    fact(
      'k2',
      L('K2, la segunda vida', 'K2, its second life'),
      19,
      L(
        'Los ingenieros usaron la presión de la luz solar para estabilizarlo y observar a lo largo de la eclíptica en "campañas" de unos tres meses: esperaban 10 y completaron 19; en total vigiló más de 500.000 estrellas.',
        'Engineers used the pressure of sunlight to steady it and observe along the ecliptic in "campaigns" of about three months: they hoped for 10 and completed 19; in total it watched more than 500,000 stars.',
      ),
      ['nasa-kepler'],
    ),
    fact(
      'retire',
      L('Retiro', 'Retirement'),
      '2018-10-30',
      L(
        'El 30 de octubre de 2018, al quedarse sin combustible para la ciencia.',
        'On October 30, 2018, when it ran out of fuel for science.',
      ),
      ['nasa-kepler'],
    ),
    fact(
      'goodnight',
      L('Buenas noches', 'Goodnight'),
      '2018-11-15',
      L(
        'El 15 de noviembre de 2018 recibió los comandos finales que apagaron sus comunicaciones, en el aniversario de la muerte del astrónomo Johannes Kepler (1630).',
        'On November 15, 2018, it received the final commands that turned off its communications, on the anniversary of the death of astronomer Johannes Kepler (1630).',
      ),
      ['nasa-kepler-goodnight', 'solardaily-kepler'],
    ),
    fact(
      'planets',
      L('Planetas', 'Planets'),
      2600,
      L(
        'Más de 2.600 planetas descubiertos fuera del sistema solar.',
        'More than 2,600 planets discovered outside the Solar System.',
      ),
      ['nasa-kepler'],
    ),
    fact(
      'conclusion',
      L('Gran conclusión', 'Big conclusion'),
      '20–50',
      L(
        'Hay más planetas que estrellas; entre el 20 % y el 50 % de las estrellas visibles probablemente tienen planetas pequeños, quizá rocosos, en su zona habitable; el tamaño más común está entre el de la Tierra y el de Neptuno, un tipo que no existe en nuestro sistema solar.',
        'There are more planets than stars; 20% to 50% of the stars we can see probably have small, possibly rocky planets in their habitable zones; the most common size is between Earth and Neptune, a kind of planet our Solar System does not have.',
      ),
      ['nasa-kepler', 'nasa-kepler-goodnight'],
      { unit: '%' },
    ),
  ],
  discoveries: [
    {
      text: L(
        'Hay más planetas que estrellas, y muchos son de un tamaño entre la Tierra y Neptuno que no existe en nuestro sistema solar.',
        'There are more planets than stars, and many are a size between Earth and Neptune that our Solar System does not have.',
      ),
      sourceIds: ['nasa-kepler', 'nasa-kepler-goodnight'],
    },
  ],
  today: {
    text: L(
      'Sigue en órbita alrededor del Sol, en silencio y sin transmisores encendidos.',
      'It is still orbiting the Sun, silent, with its transmitters off.',
    ),
    sourceIds: ['nasa-kepler-goodnight'],
  },
  legacy: {
    text: L(
      'Los cazadores de planetas posteriores, como TESS, heredaron su misión.',
      'Later planet hunters, such as TESS, inherited its mission.',
    ),
    to: ['epilogue'],
  },
  sites: [],
  imageQueries: ['Kepler space telescope', 'Kepler field of view Cygnus'],
  model: 'kepler',
  patch: { glyph: 'transit', colors: ['#0b0f1a', '#a99bff', '#ffb547'] },
  lightTimeTarget: 'kepler',
  keyPart: L('Fotómetro y parasol', 'Photometer and sunshade'),
};

export const pioneer: Machine = {
  id: 'pioneer',
  order: 15,
  world: 'deep-space',
  body: L('Espacio profundo', 'Deep space'),
  type: 'probe',
  status: 'drifting',
  name: L('Pioneer 10 y Pioneer 11', 'Pioneer 10 and Pioneer 11'),
  shortName: L('Pioneer', 'Pioneer'),
  chapterTitle: L('Las mensajeras de la botella', 'The Messengers in a Bottle'),
  launch: { date: '1972-03-02', sourceIds: ['nasa-pioneer10'] },
  arrival: { date: '1973-12-04', kind: 'flyby', sourceIds: ['nasa-pioneer10'] },
  lastSignal: {
    date: '2003-01-23',
    sourceIds: ['nasa-pioneer10', 'nasa-pioneer11'],
    note: L(
      'Pioneer 10 envió su última señal el 23 de enero de 2003, desde 12.230 millones de km: tardó 11 h 20 min en llegar. Pioneer 11 tuvo su contacto final el 30 de septiembre de 1995, a 44,1 UA, y envió unos minutos de datos de ingeniería el 24 de noviembre de 1995.',
      'Pioneer 10 sent its last signal on January 23, 2003, from 12.23 billion km: it took 11 h 20 min to arrive. Pioneer 11 made final contact on September 30, 1995, at 44.1 AU, and sent a few minutes of engineering data on November 24, 1995.',
    ),
  },
  planned: {
    text: L(
      'Pioneer 10 se diseñó para 21 meses y duró más de 30 años.',
      'Pioneer 10 was designed for 21 months and lasted more than 30 years.',
    ),
    sourceIds: ['nasa-pioneer10'],
    days: 639,
    start: '1972-03-02',
  },
  facts: [
    fact(
      'launch10',
      L('Lanzamiento de Pioneer 10', 'Pioneer 10 launch'),
      258,
      L(
        'El 2 de marzo de 1972 (fecha de Florida), en un Atlas-Centaur; 258 kg; diseñada para 21 meses, duró más de 30 años.',
        'On March 2, 1972 (Florida date), on an Atlas-Centaur; 258 kg; designed for 21 months, it lasted more than 30 years.',
      ),
      ['nasa-pioneer10'],
      { unit: 'kg' },
    ),
    fact(
      'firsts',
      L('Primeras veces', 'Firsts'),
      4,
      L(
        'Pioneer 10 fue la primera nave en cruzar el cinturón de asteroides, en pasar junto a Júpiter y en tomar rumbo para salir del sistema solar, y el primer objeto humano en cruzar la órbita de Neptuno (13 de junio de 1983). Pioneer 11 fue la primera en estudiar Saturno de cerca.',
        "Pioneer 10 was the first spacecraft to cross the asteroid belt, to fly past Jupiter and to head out of the Solar System, and the first human-made object to cross Neptune's orbit (June 13, 1983). Pioneer 11 was the first to study Saturn up close.",
      ),
      ['nasa-pioneer10', 'nasa-pioneer11'],
    ),
    fact(
      'jupiter',
      L('Júpiter', 'Jupiter'),
      130354,
      L(
        'Máximo acercamiento el 4 de diciembre de 1973, a 130.354 km; unas 500 imágenes, incluida la Gran Mancha Roja.',
        'Closest approach on December 4, 1973, at 130,354 km; about 500 images, including the Great Red Spot.',
      ),
      ['nasa-pioneer10'],
      { unit: 'km' },
    ),
    fact(
      'power',
      L('Energía', 'Power'),
      140,
      L(
        'Generadores de radioisótopos SNAP-19: unos 140 W durante el paso por Júpiter.',
        'SNAP-19 radioisotope generators: about 140 W during the Jupiter flyby.',
      ),
      ['nasa-pioneer10'],
      { unit: 'W', approx: true },
    ),
    fact(
      'plaque',
      L('La placa', 'The plaque'),
      14,
      L(
        'Una placa de aluminio dorado con un hombre y una mujer, el sistema solar y la posición del Sol respecto a 14 púlsares, para quien la encuentre.',
        'A gold-anodized aluminum plaque showing a man and a woman, the Solar System and the position of the Sun relative to 14 pulsars, for whoever finds it.',
      ),
      ['nasa-pioneer10'],
    ),
    fact(
      'last10',
      L('Última señal de Pioneer 10', 'Pioneer 10 last signal'),
      '2003-01-23',
      L(
        'El 23 de enero de 2003, desde 12.230 millones de km: la señal tardó 11 h 20 min en llegar; su energía ya no alcanzaba para el transmisor. Un último intento en 2006 falló.',
        'On January 23, 2003, from 12.23 billion km: the signal took 11 h 20 min to arrive; its power was no longer enough for the transmitter. A final attempt in 2006 failed.',
      ),
      ['nasa-pioneer10'],
    ),
    fact(
      'lastDelay',
      L('Viaje de la última señal', 'Last signal travel time'),
      '11 h 20 min',
      L(
        'La última señal de Pioneer 10 tardó 11 h 20 min en llegar a la Tierra.',
        "Pioneer 10's last signal took 11 h 20 min to reach Earth.",
      ),
      ['nasa-pioneer10'],
    ),
    fact(
      'record',
      L('Récord perdido', 'Record lost'),
      '1998-02-17',
      L(
        'Fue el objeto humano más lejano hasta que Voyager 1 la superó el 17 de febrero de 1998.',
        'It was the most distant human-made object until Voyager 1 overtook it on February 17, 1998.',
      ),
      ['nasa-pioneer10'],
    ),
    fact(
      'heading10',
      L('Rumbo de Pioneer 10', 'Pioneer 10 heading'),
      2,
      L(
        'Hacia Aldebarán, el ojo rojo de Tauro; pasará cerca en unos dos millones de años.',
        'Toward Aldebaran, the red eye of Taurus; it will pass near it in about two million years.',
      ),
      ['nasa-pioneer10'],
      { unit: 'M a', approx: true },
    ),
    fact(
      'p11',
      L('Pioneer 11', 'Pioneer 11'),
      21000,
      L(
        'Lanzada en abril de 1973; pasó a unos 21.000 km de las nubes de Saturno el 1 de septiembre de 1979 y aportó la primera prueba clara de su campo magnético.',
        "Launched in April 1973; it passed about 21,000 km above Saturn's clouds on September 1, 1979, and gave the first clear evidence of its magnetic field.",
      ),
      ['nasa-pioneer11'],
      { unit: 'km', approx: true },
    ),
    fact(
      'last11',
      L('Última señal de Pioneer 11', 'Pioneer 11 last signal'),
      44.1,
      L(
        'Contacto final el 30 de septiembre de 1995 a 44,1 UA; unos minutos de datos de ingeniería el 24 de noviembre de 1995.',
        'Final contact on September 30, 1995, at 44.1 AU; a few minutes of engineering data on November 24, 1995.',
      ),
      ['nasa-pioneer11'],
      { unit: 'UA' },
    ),
    fact(
      'heading11',
      L('Rumbo de Pioneer 11', 'Pioneer 11 heading'),
      4,
      L(
        'Hacia la constelación del Águila; pasará cerca de la estrella Lambda Aquilae en casi cuatro millones de años.',
        'Toward the constellation Aquila; it will pass near the star Lambda Aquilae in almost four million years.',
      ),
      ['nasa-pioneer11'],
      { unit: 'M a', approx: true },
    ),
    fact(
      'today',
      L('Dónde están hoy (estimación)', 'Where they are today (estimate)'),
      141,
      L(
        'Noviembre de 2026: Pioneer 10 a unas 141 UA del Sol, alejándose a 11,87 km/s, en Tauro; Pioneer 11 a unas 118 UA, a 11,13 km/s, en Scutum. La luz tardaría unas 19,6 h y 16,4 h en llegar a ellas.',
        'November 2026: Pioneer 10 about 141 AU from the Sun, receding at 11.87 km/s, in Taurus; Pioneer 11 about 118 AU away, at 11.13 km/s, in Scutum. Light would take about 19.6 h and 16.4 h to reach them.',
      ),
      ['heavens-above-escape', 'theskylive-pioneer10'],
      { unit: 'UA', approx: true },
    ),
  ],
  discoveries: [
    {
      text: L(
        'Las primeras visitas a Júpiter y a Saturno, el primer cruce del cinturón de asteroides y la primera prueba clara del campo magnético de Saturno.',
        "The first visits to Jupiter and Saturn, the first crossing of the asteroid belt and the first clear evidence of Saturn's magnetic field.",
      ),
      sourceIds: ['nasa-pioneer10', 'nasa-pioneer11'],
    },
  ],
  today: {
    text: L(
      'Viajan en silencio hacia otras estrellas.',
      'They travel in silence toward other stars.',
    ),
    sourceIds: ['nasa-pioneer10', 'nasa-pioneer11'],
  },
  legacy: {
    text: L(
      'Abrieron el camino a las Voyager, que siguen activas; alrededor del 13 de noviembre de 2026 Voyager 1 alcanzó un día-luz de distancia de la Tierra.',
      'They opened the way for the Voyagers, which are still active; around November 13, 2026, Voyager 1 reached one light-day from Earth.',
    ),
    to: ['epilogue'],
  },
  sites: [],
  imageQueries: ['Pioneer plaque', 'Pioneer 10 spacecraft'],
  model: 'pioneer',
  patch: { glyph: 'two-paths', colors: ['#0b0f1a', '#a99bff', '#e8eef7'] },
  lightTimeTarget: 'pioneer10',
  keyPart: L('Placa y antena de 2,74 m', 'Plaque and 2.74 m antenna'),
};
