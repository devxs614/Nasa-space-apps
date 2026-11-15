import type { Machine } from '../types';
import { sitesFor } from '../sites';
import { fact, L } from './helpers';

const MARS = L('Marte', 'Mars');

export const viking: Machine = {
  id: 'viking',
  order: 5,
  world: 'mars',
  body: MARS,
  type: 'lander',
  status: 'silent-surface',
  name: L('Viking 1 y Viking 2', 'Viking 1 and Viking 2'),
  chapterTitle: L('Los primeros en buscar vida', 'The First to Look for Life'),
  launch: { date: '1975-08-20', sourceIds: ['nasa-viking1', 'nasa-viking'] },
  arrival: { date: '1976-07-20T11:53:06Z', kind: 'landing', sourceIds: ['nasa-viking1'] },
  lastSignal: {
    date: '1982-11-11',
    sourceIds: ['nasa-viking1', 'nasa-viking'],
    note: L(
      'El Viking 2 envió sus últimos datos el 11 de abril de 1980, cuando fallaron sus baterías. El Viking 1 dejó de operar el 11 de noviembre de 1982 tras un comando defectuoso enviado desde la Tierra que interrumpió las comunicaciones.',
      'Viking 2 sent its last data on 11 April 1980, when its batteries failed. Viking 1 stopped operating on 11 November 1982 after a faulty command sent from Earth cut off communications.',
    ),
  },
  facts: [
    fact(
      'launches',
      L('Lanzamientos', 'Launches'),
      '1975-08-20',
      L(
        'Viking 1 despegó el 20 de agosto de 1975 y Viking 2 el 9 de septiembre de 1975, en cohetes Titan IIIE-Centaur.',
        'Viking 1 launched on 20 August 1975 and Viking 2 on 9 September 1975, on Titan IIIE-Centaur rockets.',
      ),
      ['nasa-viking1', 'nasa-viking'],
    ),
    fact(
      'landing1',
      L('Aterrizaje del Viking 1', 'Viking 1 landing'),
      '1976-07-20T11:53:06Z',
      L(
        'El 20 de julio de 1976 a las 11:53:06 UTC en 22,483° N, 47,94° O, en las laderas occidentales de Chryse Planitia, a unos 28 km del blanco previsto.',
        'On 20 July 1976 at 11:53:06 UTC at 22.483° N, 47.94° W, on the western slopes of Chryse Planitia, about 28 km from the planned target.',
      ),
      ['nasa-viking1'],
    ),
    fact(
      'firstSuccess',
      L('Un primer histórico', 'A historic first'),
      1976,
      L(
        'NASA lo describe como el primer aterrizaje verdaderamente exitoso en Marte; el soviético Mars 3 aterrizó en 1971 pero perdió contacto segundos después.',
        'NASA describes it as the first truly successful landing on Mars; the Soviet Mars 3 landed in 1971 but lost contact seconds later.',
      ),
      ['nasa-viking1'],
    ),
    fact(
      'coincidence',
      L('Coincidencia', 'Coincidence'),
      '20 · VII',
      L(
        'El Viking 1 aterrizó justo siete años después del Apollo 11: también un 20 de julio (cálculo a partir de las fechas).',
        'Viking 1 landed exactly seven years after Apollo 11: also on a 20 July (calculated from the dates).',
      ),
      ['nasa-viking1', 'nssdca-a11-lm'],
    ),
    fact(
      'firstPhoto',
      L('Primera foto', 'First photo'),
      1976,
      L(
        'El Viking 1 tomó la primera foto desde la superficie de Marte minutos después de aterrizar.',
        'Viking 1 took the first picture from the surface of Mars minutes after landing.',
      ),
      ['nasa-viking1', 'nasa-viking'],
    ),
    fact(
      'landing2',
      L('Aterrizaje del Viking 2', 'Viking 2 landing'),
      '1976-09-03',
      L(
        'El 3 de septiembre de 1976 en 47,64° N, 134,29° E (planetocéntrico), Utopia Planitia, a 6.725 km del Viking 1.',
        'On 3 September 1976 at 47.64° N, 134.29° E (planetocentric), Utopia Planitia, 6,725 km from Viking 1.',
      ),
      ['nasa-viking', 'nasa-astrobio-viking'],
    ),
    fact(
      'power',
      L('Energía', 'Power'),
      2,
      L(
        'Cada aterrizador llevaba dos generadores de radioisótopos SNAP-19; los orbitadores usaban paneles solares.',
        'Each lander carried two SNAP-19 radioisotope generators; the orbiters used solar panels.',
      ),
      ['nasa-viking1'],
    ),
    fact(
      'temps',
      L('Temperaturas', 'Temperatures'),
      -86,
      L(
        'Desde −86 °C antes del amanecer hasta −33 °C por la tarde, en el sitio del Viking 1.',
        'From −86 °C before dawn to −33 °C in the afternoon, at the Viking 1 site.',
      ),
      ['nasa-viking1'],
      { unit: '°C' },
    ),
    fact(
      'lifeSearch',
      L('La búsqueda de vida', 'The search for life'),
      '1976-07-28',
      L(
        'El 28 de julio de 1976 el brazo entregó la primera muestra al laboratorio biológico. Sumando cuatro muestras, los datos biológicos podían leerse como un "positivo débil", pero la prueba principal de compuestos orgánicos dio negativo con un umbral de 10 a 100 partes por mil millones.',
        'On 28 July 1976 the arm delivered the first sample to the biology lab. Across four samples, the biology data could be read as a "weak positive", but the main test for organic compounds came out negative at a threshold of 10 to 100 parts per billion.',
      ),
      ['nasa-viking1'],
    ),
    fact(
      'organics',
      L('Moléculas orgánicas', 'Organic molecules'),
      0,
      L(
        'No se detectaron moléculas orgánicas en el suelo.',
        'No organic molecules were detected in the soil.',
      ),
      ['nasa-viking1'],
    ),
    fact(
      'sulfur',
      L('Azufre', 'Sulfur'),
      'S',
      L(
        'Los datos mostraron abundancia de azufre, distinta de cualquier material conocido de la Tierra o la Luna.',
        'The data showed abundant sulfur, unlike any known material from Earth or the Moon.',
      ),
      ['nasa-viking1'],
    ),
    fact(
      'seismometer',
      L('Sismómetro', 'Seismometer'),
      'Viking 1',
      L('El sismómetro del Viking 1 no funcionó.', "Viking 1's seismometer did not work."),
      ['nasa-viking1'],
    ),
    fact(
      'orbiters',
      L('Orbitadores', 'Orbiters'),
      52663,
      L(
        'Entre ambos orbitadores tomaron 52.663 imágenes y mapearon el 97 % de la superficie con una resolución de 300 m.',
        'Together the orbiters took 52,663 images and mapped 97% of the surface at 300 m resolution.',
      ),
      ['nasa-viking1'],
    ),
    fact(
      'end2',
      L('Fin del Viking 2', 'End of Viking 2'),
      '1980-04-11',
      L(
        'Últimos datos el 11 de abril de 1980, cuando fallaron sus baterías.',
        'Last data on 11 April 1980, when its batteries failed.',
      ),
      ['nasa-viking', 'nasa-astrobio-viking'],
    ),
    fact(
      'end1',
      L('Fin del Viking 1', 'End of Viking 1'),
      '1982-11-11',
      L(
        'Rebautizado Thomas Mutch Memorial Station en enero de 1982; dejó de operar el 11 de noviembre de 1982 tras un comando defectuoso enviado desde la Tierra.',
        'Renamed Thomas Mutch Memorial Station in January 1982; it stopped operating on 11 November 1982 after a faulty command sent from Earth.',
      ),
      ['nasa-viking1'],
    ),
    // TODO(verificar): pata visible en la primera foto (pie de foto de NASA).
    fact(
      'legInPhoto',
      L('Autorretrato', 'Self-portrait'),
      'Viking 1',
      L(
        'En esa primera imagen se ve parte de una pata del propio aterrizador.',
        "Part of the lander's own footpad can be seen in that first image.",
      ),
      ['nasa-viking1'],
      { pending: true },
    ),
  ],
  discoveries: [
    {
      text: L(
        'El primer retrato de Marte desde el suelo; temperaturas, presión y viento durante años; una química del suelo rara y rica en azufre; y una pregunta que sigue abierta, porque los resultados biológicos son ambiguos y no se hallaron orgánicos.',
        'The first portrait of Mars from the ground; years of temperature, pressure and wind; a strange, sulfur-rich soil chemistry; and a question that is still open, because the biology results are ambiguous and no organics were found.',
      ),
      sourceIds: ['nasa-viking1'],
    },
  ],
  today: {
    text: L(
      'Ambos aterrizadores siguen en sus llanuras, en silencio.',
      'Both landers remain on their plains, silent.',
    ),
    sourceIds: ['nasa-viking'],
  },
  legacy: {
    text: L(
      'La astrobiología marciana nace aquí; Phoenix, Curiosity y Perseverance retomaron la búsqueda con mejores instrumentos.',
      'Martian astrobiology starts here; Phoenix, Curiosity and Perseverance picked up the search with better instruments.',
    ),
    to: ['phoenix', 'epilogue'],
  },
  sites: sitesFor('viking'),
  imageQueries: ['Viking 1 first image surface Mars', 'Viking lander Mars'],
  model: 'viking',
  patch: { glyph: 'twin-landers', colors: ['#0b0f1a', '#ff8a5c', '#c7895b'] },
  lightTimeTarget: 'mars',
  keyPart: L('Brazo muestreador', 'Sampler arm'),
};

export const sojourner: Machine = {
  id: 'sojourner',
  order: 6,
  world: 'mars',
  body: MARS,
  type: 'rover',
  status: 'silent-surface',
  name: L('Sojourner y Mars Pathfinder', 'Sojourner and Mars Pathfinder'),
  chapterTitle: L('El pequeño viajero', 'The Little Traveler'),
  launch: { date: '1996-12-04', sourceIds: ['nasa-pathfinder'] },
  arrival: {
    date: '1997-07-04',
    kind: 'landing',
    sourceIds: ['nasa-pathfinder', 'jpl-mpf-factsheet'],
  },
  lastSignal: { date: '1997-09-27', sourceIds: ['nasa-pathfinder'] },
  facts: [
    fact(
      'launch',
      L('Lanzamiento', 'Launch'),
      '1996-12-04',
      L(
        'El 4 de diciembre de 1996 desde Cabo Cañaveral, en un Delta II 7925.',
        'On 4 December 1996 from Cape Canaveral, on a Delta II 7925.',
      ),
      ['nasa-pathfinder'],
    ),
    fact(
      'landing',
      L('Aterrizaje', 'Landing'),
      '1997-07-04',
      L(
        'El 4 de julio de 1997 en Ares Vallis, una antigua llanura de inundación, en 19,13° N, 33,22° O.',
        'On 4 July 1997 in Ares Vallis, an ancient flood plain, at 19.13° N, 33.22° W.',
      ),
      ['nasa-pathfinder', 'jpl-mpf-factsheet'],
    ),
    fact(
      'airbags',
      L('Bolsas de aire', 'Airbags'),
      15,
      L(
        'Primer uso de esta técnica: impacto a 14 m/s; las bolsas se inflaron a unos 100 m de altura; rebotó unas 15 veces, hasta 15 m de alto, y se detuvo 2,5 minutos después, a 1 km del primer impacto.',
        'First use of this technique: impact at 14 m/s; the airbags inflated about 100 m up; it bounced about 15 times, up to 15 m high, and stopped 2.5 minutes later, 1 km from the first impact.',
      ),
      ['nasa-pathfinder'],
      { approx: true },
    ),
    fact(
      'rover',
      L('El rover', 'The rover'),
      10.6,
      L(
        '10,6 kg y 30 cm de alto; bajó por una rampa inclinada 20° en la noche del 5 de julio, durante el sol 2.',
        '10.6 kg and 30 cm tall; it rolled down a ramp tilted 20° on the night of 5 July, during sol 2.',
      ),
      ['nasa-pathfinder'],
      { unit: 'kg' },
    ),
    fact(
      'name',
      L('Su nombre', 'Its name'),
      12,
      L(
        'Lo eligió un concurso de ensayos: ganó Valerie Ambroise, de 12 años, de Bridgeport (Connecticut), con un ensayo sobre la activista Sojourner Truth. "Sojourner" significa viajero.',
        'It was chosen in an essay contest won by 12-year-old Valerie Ambroise of Bridgeport, Connecticut, with an essay about the activist Sojourner Truth. "Sojourner" means traveler.',
      ),
      ['jpl-sojourner-name'],
    ),
    fact(
      'lander',
      L('El aterrizador', 'The lander'),
      'Carl Sagan',
      L(
        'El aterrizador fue rebautizado Carl Sagan Memorial Station en honor al astrónomo.',
        'The lander was renamed Carl Sagan Memorial Station in honor of the astronomer.',
      ),
      ['nasa-pathfinder'],
    ),
    fact(
      'dataSent',
      L('Datos enviados', 'Data returned'),
      16500,
      L(
        '2.300 millones de bits; más de 16.500 imágenes del aterrizador y 550 del rover; más de 15 análisis químicos de rocas y suelo.',
        '2.3 billion bits; more than 16,500 images from the lander and 550 from the rover; more than 15 chemical analyses of rocks and soil.',
      ),
      ['nasa-pathfinder'],
    ),
    fact(
      'lastTx',
      L('Última transmisión', 'Last transmission'),
      '1997-09-27',
      L(
        'La última transmisión de la misión llegó el 27 de septiembre de 1997.',
        "The mission's last transmission arrived on 27 September 1997.",
      ),
      ['nasa-pathfinder'],
    ),
    // TODO(verificar): duración planeada del rover (ficha NSSDCA de Mars Pathfinder).
    fact('plannedWeek', L('Plan', 'Plan'), 7, L('Una semana.', 'One week.'), ['nasa-pathfinder'], {
      unit: 'd',
      pending: true,
    }),
    // TODO(verificar): distancia recorrida (ficha NSSDCA de Mars Pathfinder).
    fact(
      'distance',
      L('Recorrido', 'Distance'),
      100,
      L('Unos 100 m, siempre cerca del aterrizador.', 'About 100 m, always close to the lander.'),
      ['nasa-pathfinder'],
      { unit: 'm', approx: true, pending: true },
    ),
  ],
  discoveries: [
    {
      text: L(
        'Guijarros redondeados que sugieren agua corriente en un pasado más cálido; polvo magnético; remolinos de polvo; nubes de hielo de agua al amanecer; y un núcleo metálico de entre unos 1.300 y 2.000 km de radio, según el seguimiento por radio.',
        'Rounded pebbles that suggest running water in a warmer past; magnetic dust; dust devils; water-ice clouds at dawn; and a metallic core with a radius of roughly 1,300 to 2,000 km, from radio tracking.',
      ),
      sourceIds: ['nasa-pathfinder'],
    },
  ],
  today: {
    text: L(
      'El rover y el aterrizador siguen en Ares Vallis.',
      'The rover and the lander are still in Ares Vallis.',
    ),
    sourceIds: ['nasa-pathfinder'],
  },
  legacy: {
    text: L(
      'Demostró que un rover pequeño podía conducir en Marte y que las bolsas de aire funcionaban.',
      'It proved that a small rover could drive on Mars and that airbags worked.',
    ),
    to: ['spirit', 'opportunity'],
  },
  sites: sitesFor('sojourner'),
  imageQueries: ['Sojourner rover Mars Pathfinder', 'Mars Pathfinder lander'],
  model: 'sojourner',
  patch: { glyph: 'small-rover', colors: ['#0b0f1a', '#ff8a5c', '#ffb547'] },
  lightTimeTarget: 'mars',
  keyPart: L('Seis ruedas con suspensión rocker-bogie', 'Six wheels with rocker-bogie suspension'),
};

export const spirit: Machine = {
  id: 'spirit',
  order: 7,
  world: 'mars',
  body: MARS,
  type: 'rover',
  status: 'silent-surface',
  name: L('Spirit', 'Spirit'),
  chapterTitle: L('La rueda rota que encontró un tesoro', 'The Broken Wheel That Found a Treasure'),
  launch: { date: '2003-06-10', sourceIds: ['nasa-spirit'] },
  arrival: { date: '2004-01-04', kind: 'landing', sourceIds: ['nasa-mer', 'jpl-spirit-end'] },
  lastSignal: { date: '2010-03-22', sourceIds: ['nasa-spirit', 'jpl-spirit-end'] },
  missionEnd: { date: '2011-05-25', sourceIds: ['nasa-spirit', 'jpl-spirit-end'] },
  planned: {
    text: L(
      '90 días marcianos, hasta alrededor del 4 de abril de 2004.',
      '90 Martian days, until around 4 April 2004.',
    ),
    sourceIds: ['nasa-spirit'],
    days: 91,
  },
  facts: [
    fact(
      'landing',
      L('Aterrizaje', 'Landing'),
      '2004-01-04',
      L(
        'El 4 de enero de 2004 en UTC (3 de enero en California), en el cráter Gusev, quizá un antiguo lago.',
        'On 4 January 2004 UTC (3 January in California), in Gusev crater, possibly an ancient lake.',
      ),
      ['nasa-mer', 'jpl-spirit-end'],
    ),
    fact(
      'distance',
      L('Recorrido total', 'Total distance'),
      7.73,
      L('Spirit recorrió 7,73 km.', 'Spirit drove 7.73 km.'),
      ['nasa-spirit'],
      { unit: 'km' },
    ),
    fact(
      'cleaning',
      L('Limpieza por el viento', 'Cleaned by the wind'),
      93,
      L(
        'En marzo de 2005, remolinos de polvo limpiaron sus paneles: la energía pasó de un 60 % a un 93 %.',
        'In March 2005, dust devils cleaned its panels: power went from 60% to 93%.',
      ),
      ['nasa-spirit'],
      { unit: '%' },
    ),
    fact(
      'wheel',
      L('La rueda rota', 'The broken wheel'),
      '2006-03',
      L(
        'Su rueda delantera derecha dejó de girar en marzo de 2006 y desde entonces condujo marcha atrás, arrastrándola.',
        'Its right front wheel stopped turning in March 2006 and from then on it drove backward, dragging it.',
      ),
      ['cornell-spirit-2007'],
    ),
    fact(
      'silica',
      L('El tesoro', 'The treasure'),
      90,
      L(
        'En mayo de 2007, cerca de la meseta Home Plate, la rueda arrastrada destapó un suelo blanco con más de un 90 % de sílice, récord en Marte. En la Tierra, algo así se forma con aguas termales o vapor volcánico.',
        'In May 2007, near the Home Plate plateau, the dragging wheel uncovered white soil with more than 90% silica, a record on Mars. On Earth, deposits like this form in hot springs or volcanic steam vents.',
      ),
      ['nasa-spirit-silica', 'asu-spirit-silica'],
      { unit: '%' },
    ),
    fact(
      'stuck',
      L('Atrapada', 'Stuck'),
      '2009-05-01',
      L(
        'El 1 de mayo de 2009 se hundió en suelo blando en "Troy", en el lado oeste de Home Plate.',
        'On 1 May 2009 it bogged down in soft soil at "Troy", on the west side of Home Plate.',
      ),
      ['astronomy-spirit'],
    ),
    fact(
      'stationary',
      L('Plataforma fija', 'Stationary platform'),
      '2010-01-26',
      L(
        'El 26 de enero de 2010 NASA redefinió su misión como plataforma científica inmóvil.',
        'On 26 January 2010 NASA redefined its mission as a stationary science platform.',
      ),
      ['nasa-spirit'],
    ),
    fact(
      'lastSol',
      L('Última señal', 'Last signal'),
      2208,
      L(
        'Última señal el 22 de marzo de 2010 (sol 2.208), al llegar el invierno.',
        'Last signal on 22 March 2010 (sol 2,208), as winter arrived.',
      ),
      ['nasa-spirit', 'jpl-spirit-end'],
      { unit: 'sol' },
    ),
    fact(
      'end',
      L('Fin de misión', 'End of mission'),
      '2011-05-25',
      L(
        'El 25 de mayo de 2011, tras más de 1.300 comandos sin respuesta; la causa más probable fue un frío excesivo que dejó sin efecto sus calefactores.',
        'On 25 May 2011, after more than 1,300 unanswered commands; the most likely cause was extreme cold that overwhelmed its heaters.',
      ),
      ['nasa-spirit', 'jpl-spirit-end'],
    ),
    // TODO(verificar): nombre elegido por una niña de 9 años (anuncio de NASA de junio de 2003).
    fact(
      'naming',
      L('Su nombre', 'Its name'),
      9,
      L(
        'Spirit y Opportunity fueron bautizados por una niña de 9 años en un concurso de ensayos.',
        'Spirit and Opportunity were named by a 9-year-old girl in an essay contest.',
      ),
      ['nasa-spirit'],
      { pending: true },
    ),
  ],
  discoveries: [
    {
      text: L(
        'La sílice casi pura de Home Plate apunta a un antiguo sistema hidrotermal, uno de los ambientes más prometedores para la vida que encontró en Gusev.',
        'The nearly pure silica at Home Plate points to an ancient hydrothermal system, one of the most promising environments for life it found in Gusev.',
      ),
      sourceIds: ['nasa-spirit-silica', 'asu-spirit-silica'],
    },
  ],
  today: {
    text: L('Sigue en Troy, junto a Home Plate.', 'It is still at Troy, next to Home Plate.'),
    sourceIds: ['astronomy-spirit'],
  },
  legacy: {
    text: L(
      'Demostró que un rover puede seguir siendo útil aun averiado.',
      'It showed that a rover can stay useful even when damaged.',
    ),
    to: ['opportunity', 'epilogue'],
  },
  sites: sitesFor('spirit'),
  imageQueries: ['Spirit rover silica soil', 'Spirit rover Home Plate'],
  model: 'spirit',
  patch: { glyph: 'dragging-wheel', colors: ['#0b0f1a', '#ff8a5c', '#f2f0e6'] },
  lightTimeTarget: 'mars',
  keyPart: L('Rueda delantera derecha bloqueada', 'Jammed right front wheel'),
};

export const opportunity: Machine = {
  id: 'opportunity',
  order: 8,
  world: 'mars',
  body: MARS,
  type: 'rover',
  status: 'silent-surface',
  name: L('Opportunity', 'Opportunity'),
  chapterTitle: L('La maratonista de Marte', 'The Marathon Runner of Mars'),
  arrival: {
    date: '2004-01-25',
    kind: 'landing',
    sourceIds: ['nasa-mer', 'rocketstem-opportunity'],
  },
  lastSignal: {
    date: '2018-06-10',
    sourceIds: ['jpl-opportunity-end', 'sciencenews-opportunity'],
    note: L(
      'Sol 5.111, en plena tormenta de polvo global.',
      'Sol 5,111, in the middle of a planet-wide dust storm.',
    ),
  },
  missionEnd: { date: '2019-02-13', sourceIds: ['jpl-opportunity-end'] },
  planned: {
    text: L('90 soles y unos 1.000 m de recorrido.', '90 sols and about 1,000 m of driving.'),
    sourceIds: ['collectspace-opportunity'],
    days: 92,
  },
  facts: [
    fact(
      'landing',
      L('Aterrizaje', 'Landing'),
      '2004-01-25',
      L(
        'El 25 de enero de 2004 en UTC (24 de enero en California), en Meridiani Planum, dentro del pequeño cráter Eagle.',
        'On 25 January 2004 UTC (24 January in California), in Meridiani Planum, inside the small Eagle crater.',
      ),
      ['nasa-mer', 'rocketstem-opportunity'],
    ),
    fact(
      'whyThere',
      L('Por qué allí', 'Why there'),
      'Fe₂O₃',
      L(
        'Desde órbita se había detectado hematita, un mineral que suele formarse con agua.',
        'Hematite, a mineral that usually forms in water, had been detected from orbit.',
      ),
      ['nasa-marathon'],
    ),
    fact(
      'plan',
      L('Plan', 'Plan'),
      90,
      L('90 soles y unos 1.000 m de recorrido.', '90 sols and about 1,000 m of driving.'),
      ['collectspace-opportunity'],
      { unit: 'sol' },
    ),
    fact(
      'lake',
      L('Primeras pistas', 'First clues'),
      'Eagle',
      L(
        'Las rocas del cráter Eagle se formaron en un antiguo lago poco profundo, aunque demasiado ácido para la vida.',
        'The rocks in Eagle crater formed in an ancient shallow lake, though one too acidic for life.',
      ),
      ['nasa-sciencecasts-marathon'],
    ),
    fact(
      'blueberries',
      L('Arándanos', 'Blueberries'),
      'Fe₂O₃',
      L(
        'Pequeñas esferas de hematita apodadas "arándanos" (blueberries).',
        'Small spheres of hematite nicknamed "blueberries".',
      ),
      ['cornell-opportunity-2019'],
    ),
    fact(
      'endeavour',
      L('Cráter Endeavour', 'Endeavour crater'),
      22,
      L(
        'Llegó en agosto de 2011 a este cráter de unos 22 km; sus grietas están llenas de yeso dejado por agua subterránea, en condiciones menos ácidas y quizá más habitables.',
        'It reached this crater, about 22 km wide, in August 2011; its cracks are filled with gypsum left by groundwater, in less acidic and perhaps more habitable conditions.',
      ),
      ['nasa-sciencecasts-marathon', 'pds-pia19154'],
      { unit: 'km', approx: true },
    ),
    fact(
      'marathon',
      L('Maratón', 'Marathon'),
      42.198,
      L(
        'El 24 de marzo de 2015 (sol 3.968) su odómetro pasó de 42,195 km: 42,198 km tras unos 11 años y 2 meses.',
        'On 24 March 2015 (sol 3,968) its odometer passed 42.195 km: 42.198 km after about 11 years and 2 months.',
      ),
      ['nasa-marathon', 'nasa-sciencecasts-marathon'],
      { unit: 'km' },
    ),
    fact(
      'injury',
      L('Lesión', 'Injury'),
      'RF',
      L(
        'Falló el actuador de dirección delantero derecho, así que recorrió parte del camino marcha atrás.',
        'Its right front steering actuator failed, so it drove part of the way backward.',
      ),
      ['nasa-sciencecasts-marathon'],
    ),
    fact(
      'lastSol',
      L('Última señal', 'Last signal'),
      5111,
      L(
        'Última señal el 10 de junio de 2018, sol 5.111, en plena tormenta de polvo que cubrió el planeta.',
        'Last signal on 10 June 2018, sol 5,111, during a dust storm that covered the whole planet.',
      ),
      ['jpl-opportunity-end', 'sciencenews-opportunity'],
      { unit: 'sol' },
    ),
    fact(
      'rescue',
      L('Intentos de rescate', 'Recovery attempts'),
      1000,
      L(
        'Más de mil comandos; el último intento fue la noche del 12 de febrero de 2019, mientras sonaba la canción "I\'ll Be Seeing You" de Billie Holiday.',
        'More than a thousand commands; the final attempt was on the night of 12 February 2019, while the song "I\'ll Be Seeing You" by Billie Holiday played.',
      ),
      ['jpl-opportunity-end', 'planetary-opportunity'],
    ),
    fact(
      'end',
      L('Fin de misión', 'End of mission'),
      '2019-02-13',
      L(
        'NASA declaró el fin de la misión el 13 de febrero de 2019.',
        'NASA declared the mission over on 13 February 2019.',
      ),
      ['jpl-opportunity-end'],
    ),
    fact(
      'totalDistance',
      L('Recorrido total', 'Total distance'),
      45.16,
      L(
        '45,16 km: récord de distancia en otro mundo hasta el 11 de octubre de 2026.',
        '45.16 km: the off-world distance record until 11 October 2026.',
      ),
      ['nasa-mer'],
      { unit: 'km' },
    ),
    fact(
      'relay',
      L('El relevo', 'The relay'),
      45.22,
      L(
        'El 11 de octubre de 2026, en su sol 2.006, Perseverance alcanzó 45,22 km y superó la marca de Opportunity en unos 5,5 años.',
        'On 11 October 2026, on its sol 2,006, Perseverance reached 45.22 km and beat Opportunity’s mark in about 5.5 years.',
      ),
      ['nasa-perseverance-record', 'petapixel-record'],
      { unit: 'km' },
    ),
    fact(
      'finalPlace',
      L('Lugar final', 'Final place'),
      'Perseverance Valley',
      L(
        'Perseverance Valley, en el borde del cráter Endeavour.',
        'Perseverance Valley, on the rim of Endeavour crater.',
      ),
      ['collectspace-opportunity'],
    ),
    // TODO(verificar): fecha de lanzamiento de Opportunity (ficha NSSDCA).
    fact(
      'launch',
      L('Lanzamiento', 'Launch'),
      '2003-07',
      L('Julio de 2003.', 'July 2003.'),
      ['nasa-mer'],
      { pending: true },
    ),
  ],
  discoveries: [
    {
      text: L(
        'Múltiples pruebas de agua líquida abundante en el Marte antiguo, desde lagos ácidos hasta agua subterránea más amable en Endeavour.',
        'Many lines of evidence for abundant liquid water on ancient Mars, from acidic lakes to friendlier groundwater at Endeavour.',
      ),
      sourceIds: ['nasa-sciencecasts-marathon', 'pds-pia19154'],
    },
  ],
  today: {
    text: L('En silencio en Perseverance Valley.', 'Silent in Perseverance Valley.'),
    sourceIds: ['collectspace-opportunity'],
  },
  legacy: {
    text: L(
      'Su récord duró hasta 2026, cuando lo superó un rover que lleva justo el nombre del valle donde descansa.',
      'Its record lasted until 2026, when it was beaten by a rover named exactly like the valley where it rests.',
    ),
    to: ['epilogue'],
  },
  sites: sitesFor('opportunity'),
  imageQueries: ['Opportunity rover Endeavour crater', 'Opportunity blueberries hematite'],
  model: 'opportunity',
  patch: { glyph: 'odometer', colors: ['#0b0f1a', '#ff8a5c', '#7cffb2'] },
  lightTimeTarget: 'mars',
  keyPart: L('Paneles solares', 'Solar panels'),
};

export const phoenix: Machine = {
  id: 'phoenix',
  order: 9,
  world: 'mars',
  body: MARS,
  type: 'lander',
  status: 'silent-surface',
  name: L('Phoenix', 'Phoenix'),
  chapterTitle: L('La que tocó el hielo', 'The One That Touched the Ice'),
  launch: { date: '2007-08-04', sourceIds: ['nasa-phoenix'] },
  arrival: { date: '2008-05-25', kind: 'landing', sourceIds: ['nasa-phoenix'] },
  lastSignal: { date: '2008-11-02', sourceIds: ['nasa-phoenix', 'spaceflightnow-phoenix'] },
  planned: {
    text: L('Tres meses; funcionó más de cinco.', 'Three months; it worked for more than five.'),
    sourceIds: ['astronomy-phoenix-2008'],
    days: 92,
  },
  facts: [
    fact(
      'launch',
      L('Lanzamiento', 'Launch'),
      '2007-08-04',
      L('El 4 de agosto de 2007, en un Delta II.', 'On 4 August 2007, on a Delta II.'),
      ['nasa-phoenix'],
    ),
    fact(
      'landing',
      L('Aterrizaje', 'Landing'),
      '2008-05-25',
      L(
        'El 25 de mayo de 2008 en 68,22° N, 234,25° E (125,75° O), en Vastitas Borealis, las llanuras árticas.',
        'On 25 May 2008 at 68.22° N, 234.25° E (125.75° W), in Vastitas Borealis, the Arctic plains.',
      ),
      ['nasa-phoenix'],
    ),
    fact(
      'records',
      L('Récords', 'Records'),
      68.22,
      L(
        'Aterrizó más al norte que cualquier nave anterior, a la latitud equivalente al norte de Alaska; fue el primer aterrizador fijo exitoso desde el Viking 2, unos 32 años después.',
        'It landed farther north than any spacecraft before, at the equivalent latitude of northern Alaska; it was the first successful stationary lander since Viking 2, some 32 years later.',
      ),
      ['nasa-phoenix-overview'],
      { unit: '° N' },
    ),
    fact(
      'plan',
      L('Plan', 'Plan'),
      3,
      L('Tres meses; funcionó más de cinco.', 'Three months; it worked for more than five.'),
      ['astronomy-phoenix-2008'],
    ),
    fact(
      'ice',
      L('El hielo', 'The ice'),
      4,
      L(
        'Grumos brillantes en la zanja "Dodo-Goldilocks" desaparecieron en cuatro días: era hielo de agua (conclusión del 19 de junio de 2008). Pasó de sólido a gas sin volverse líquido.',
        'Bright clumps in the "Dodo-Goldilocks" trench vanished within four days: it was water ice (concluded on 19 June 2008). It went from solid to gas without becoming liquid.',
      ),
      ['nasa-phoenix'],
      { unit: 'd' },
    ),
    fact(
      'water',
      L('Agua confirmada', 'Water confirmed'),
      '2008-07-31',
      L(
        'El 31 de julio de 2008 NASA anunció agua en Marte: el instrumento TEGA calentó una muestra y detectó vapor de agua.',
        'On 31 July 2008 NASA announced water on Mars: the TEGA instrument heated a sample and detected water vapor.',
      ),
      ['nasa-phoenix'],
    ),
    fact(
      'perchlorate',
      L('Otros hallazgos', 'Other findings'),
      'ClO₄⁻',
      L(
        'Perclorato (una sal que fue la gran sorpresa), suelo ligeramente alcalino, carbonato de calcio y nieve cayendo desde las nubes.',
        'Perchlorate (a salt that was the big surprise), slightly alkaline soil, calcium carbonate and snow falling from the clouds.',
      ),
      ['astronomy-phoenix-2008', 'jpl-phoenix-climate'],
    ),
    fact(
      'lastSignal',
      L('Última señal', 'Last signal'),
      '2008-11-02',
      L(
        'El 2 de noviembre de 2008, cuando el invierno dejó sin luz sus paneles solares.',
        'On 2 November 2008, when winter left its solar panels without light.',
      ),
      ['nasa-phoenix', 'spaceflightnow-phoenix'],
    ),
    fact(
      'afterWinter',
      L('Después del invierno', 'After winter'),
      2010,
      L(
        'En 2010, imágenes desde órbita mostraron que el panel solar oeste colapsó, probablemente por el peso de la escarcha de dióxido de carbono.',
        'In 2010, images from orbit showed that the west solar panel had collapsed, probably under the weight of carbon dioxide frost.',
      ),
      ['jpl-pia13158', 'hirise-phoenix'],
    ),
  ],
  discoveries: [
    {
      text: L(
        'Hielo de agua bajo el suelo ártico; perclorato, posible fuente de energía para microbios y recurso para futuros exploradores; nieve marciana.',
        'Water ice under the Arctic soil; perchlorate, a possible energy source for microbes and a resource for future explorers; Martian snow.',
      ),
      sourceIds: ['nasa-phoenix', 'jpl-phoenix-mission'],
    },
  ],
  today: {
    text: L(
      'Cubierto de polvo en el Ártico marciano, con un panel caído.',
      'Covered in dust in the Martian Arctic, with one panel down.',
    ),
    sourceIds: ['jpl-pia13158'],
  },
  legacy: {
    text: L(
      'Localizó agua accesible para misiones futuras.',
      'It located accessible water for future missions.',
    ),
    to: ['epilogue'],
  },
  sites: sitesFor('phoenix'),
  imageQueries: ['Phoenix lander ice trench Dodo Goldilocks', 'Phoenix Mars lander'],
  model: 'phoenix',
  patch: { glyph: 'ice-crystal', colors: ['#0b0f1a', '#ff8a5c', '#5ef2ff'] },
  lightTimeTarget: 'mars',
  keyPart: L('Brazo robótico y zanja', 'Robotic arm and trench'),
};

export const insight: Machine = {
  id: 'insight',
  order: 10,
  world: 'mars',
  body: MARS,
  type: 'lander',
  status: 'silent-surface',
  name: L('InSight', 'InSight'),
  chapterTitle: L(
    'La que escuchó el interior de Marte',
    'The One That Listened to the Inside of Mars',
  ),
  launch: { date: '2018-05-05', sourceIds: ['nasa-insight'] },
  arrival: { date: '2018-11-26', kind: 'landing', sourceIds: ['nasa-insight'] },
  lastSignal: { date: '2022-12-15', sourceIds: ['nasa-insight-end', 'engadget-insight'] },
  missionEnd: { date: '2022-12-21', sourceIds: ['nasa-insight-end', 'engadget-insight'] },
  facts: [
    fact(
      'launch',
      L('Lanzamiento', 'Launch'),
      '2018-05-05',
      L(
        'El 5 de mayo de 2018 desde la base Vandenberg, California, en un Atlas V.',
        'On 5 May 2018 from Vandenberg base, California, on an Atlas V.',
      ),
      ['nasa-insight'],
    ),
    fact(
      'marco',
      L('Compañeras de viaje', 'Travel companions'),
      2,
      L(
        'Dos CubeSats MarCO viajaron detrás de InSight y retransmitieron su aterrizaje.',
        'Two MarCO CubeSats flew behind InSight and relayed its landing.',
      ),
      ['nasa-insight', 'jpl-marco-end'],
    ),
    fact(
      'landing',
      L('Aterrizaje', 'Landing'),
      '2018-11-26',
      L(
        'El 26 de noviembre de 2018 en el oeste de Elysium Planitia, hacia 4,5° N, 135,9° E, a unos 600 km del cráter Gale de Curiosity.',
        "On 26 November 2018 in western Elysium Planitia, near 4.5° N, 135.9° E, about 600 km from Curiosity's Gale crater.",
      ),
      ['nasa-insight'],
    ),
    fact(
      'instruments',
      L('Instrumentos clave', 'Key instruments'),
      1.8,
      L(
        'Sismómetro aportado por Francia, sonda de calor llamada "topo" aportada por Alemania y sensores de viento y temperatura del Centro de Astrobiología de España; un brazo de más de 1,8 m los colocó en el suelo.',
        'A seismometer provided by France, a heat probe called the "mole" provided by Germany, and wind and temperature sensors from Spain’s Centro de Astrobiología; an arm more than 1.8 m long placed them on the ground.',
      ),
      ['nasa-insight', 'nasa-insight-end', 'ethz-core'],
      { unit: 'm' },
    ),
    fact(
      'quakes',
      L('Sismos', 'Marsquakes'),
      1319,
      L(
        '1.319 sismos marcianos, algunos causados por impactos de meteoroides.',
        '1,319 marsquakes, some caused by meteoroid impacts.',
      ),
      ['nasa-insight-end'],
    ),
    fact(
      'strongest',
      L('El más fuerte', 'The strongest'),
      4.7,
      L(
        'Magnitud 4,7 el 4 de mayo de 2022 (sol 1.222).',
        'Magnitude 4.7 on 4 May 2022 (sol 1,222).',
      ),
      ['popsci-insight', 'livescience-insight'],
    ),
    fact(
      'iceImpact',
      L('Impacto con hielo', 'Impact with ice'),
      2021,
      L(
        'El mayor impacto detectado, a finales de 2021, desenterró bloques de hielo del tamaño de rocas.',
        'The largest impact it detected, in late 2021, dug up boulder-sized blocks of ice.',
      ),
      ['earthsky-insight'],
    ),
    fact(
      'core',
      L('El núcleo', 'The core'),
      '1650–1700',
      L(
        'Marte tiene un núcleo líquido de hierro; en 2023 se descubrió encima una capa de roca fundida de unos 150 km y el radio del núcleo se corrigió de 1.800–1.850 km a unos 1.650–1.700 km.',
        'Mars has a liquid iron core; in 2023 a layer of molten rock about 150 km thick was found above it, and the core radius was revised from 1,800–1,850 km to about 1,650–1,700 km.',
      ),
      ['ethz-core', 'ipgp-core'],
      { unit: 'km', approx: true },
    ),
    fact(
      'mole',
      L('El topo', 'The mole'),
      'HP3',
      L(
        'El suelo era tan cohesivo que el topo no logró hundirse como estaba previsto, aunque se obtuvieron datos valiosos del suelo.',
        'The soil was so cohesive that the mole could not dig in as planned, although valuable soil data were obtained.',
      ),
      ['newsbytes-insight'],
    ),
    fact(
      'lastSelfie',
      L('Última selfie', 'Last selfie'),
      '2022-04-24',
      L(
        'El 24 de abril de 2022 (sol 1.211), ya muy cubierta de polvo.',
        'On 24 April 2022 (sol 1,211), already heavily covered in dust.',
      ),
      ['vatican-insight'],
    ),
    fact(
      'end',
      L('Fin de misión', 'End of mission'),
      '2022-12-21',
      L(
        'Declarado el 21 de diciembre de 2022 tras dos intentos de contacto fallidos; el polvo en los paneles agotó su energía.',
        'Declared on 21 December 2022 after two failed contact attempts; dust on its panels drained its power.',
      ),
      ['nasa-insight-end', 'engadget-insight'],
    ),
  ],
  discoveries: [
    {
      text: L(
        'Marte es sísmicamente activo; el tamaño de su corteza, su manto y su núcleo se midió por primera vez con sismos; y la ciencia se corrige a sí misma: los datos de InSight se reinterpretaron en 2023.',
        "Mars is seismically active; the sizes of its crust, mantle and core were measured with quakes for the first time; and science corrects itself: InSight's data were reinterpreted in 2023.",
      ),
      sourceIds: ['nasa-insight-end', 'ethz-core', 'ipgp-core'],
    },
  ],
  today: {
    text: L(
      'En silencio en Elysium Planitia, cubierta de polvo.',
      'Silent in Elysium Planitia, covered in dust.',
    ),
    sourceIds: ['nasa-insight-end'],
  },
  legacy: {
    text: L(
      'El primer mapa del interior de otro planeta rocoso hecho con sismología.',
      'The first map of the interior of another rocky planet made with seismology.',
    ),
    to: ['epilogue'],
  },
  sites: sitesFor('insight'),
  imageQueries: ['InSight lander selfie', 'InSight seismometer SEIS'],
  model: 'insight',
  patch: { glyph: 'quake-dome', colors: ['#0b0f1a', '#ff8a5c', '#e2683c'] },
  lightTimeTarget: 'mars',
  keyPart: L('Sismómetro SEIS bajo su cúpula', 'SEIS seismometer under its dome'),
};

export const ingenuity: Machine = {
  id: 'ingenuity',
  order: 11,
  world: 'mars',
  body: MARS,
  type: 'helicopter',
  status: 'still-useful',
  name: L('Ingenuity', 'Ingenuity'),
  chapterTitle: L('La que se atrevió a volar', 'The One That Dared to Fly'),
  arrival: { date: '2021-02-18', kind: 'landing', sourceIds: ['foxweather-ingenuity'] },
  lastSignal: {
    date: '2024-04-16',
    sourceIds: ['nasa-ingenuity-goodbye', 'phys-ingenuity'],
    note: L(
      'Ya no habla con la Tierra, pero un programa le ordena despertar cada día, revisar sus sistemas, tomar una foto y registrar temperaturas, guardando los datos a bordo.',
      'It no longer talks to Earth, but a program tells it to wake up every day, check its systems, take a picture and log temperatures, storing the data on board.',
    ),
  },
  missionEnd: { date: '2024-01-25', sourceIds: ['nasa-ingenuity'] },
  planned: {
    text: L(
      'Un máximo de 5 vuelos de prueba en 30 días.',
      'A maximum of 5 test flights in 30 days.',
    ),
    sourceIds: ['nasa-ingenuity'],
    days: 30,
    start: '2021-04-19',
  },
  facts: [
    fact(
      'arrival',
      L('Llegada', 'Arrival'),
      '2021-02-18',
      L(
        'El 18 de febrero de 2021, enganchado bajo el rover Perseverance, en el cráter Jezero.',
        'On 18 February 2021, attached under the Perseverance rover, in Jezero crater.',
      ),
      ['foxweather-ingenuity'],
    ),
    fact(
      'firstFlight',
      L('Primer vuelo', 'First flight'),
      '2021-04-19',
      L(
        'El 19 de abril de 2021: 39,1 s a unos 3 m de altura; el primer vuelo propulsado y controlado en otro planeta.',
        'On 19 April 2021: 39.1 s at about 3 m high; the first powered, controlled flight on another planet.',
      ),
      ['nasa-wright-history', 'nasa-ingenuity'],
    ),
    fact(
      'airfield',
      L('El aeródromo', 'The airfield'),
      'JZRO',
      L(
        'Se bautizó Wright Brothers Field; la Organización de Aviación Civil Internacional le dio el código JZRO y a Ingenuity el designador de tipo IGY.',
        'It was named Wright Brothers Field; the International Civil Aviation Organization gave it the code JZRO and Ingenuity the type designator IGY.',
      ),
      ['nasa-wright-history'],
    ),
    fact(
      'wright',
      L('Un pedacito de historia', 'A piece of history'),
      1903,
      L(
        'Llevaba bajo su panel solar un trozo de tela del ala del Wright Flyer de 1903, del tamaño de un sello postal.',
        'It carried a stamp-sized piece of wing fabric from the 1903 Wright Flyer under its solar panel.',
      ),
      ['nasa-wright-history'],
    ),
    fact(
      'size',
      L('Tamaño', 'Size'),
      1.8,
      L(
        '1,8 kg; rotores de 1,2 m que giran a unas 2.400 rpm.',
        '1.8 kg; 1.2 m rotors spinning at about 2,400 rpm.',
      ),
      ['nasa-ingenuity', 'aerospacemfg-ingenuity'],
      { unit: 'kg' },
    ),
    fact(
      'flights',
      L('Plan frente a realidad', 'Plan versus reality'),
      72,
      L(
        'Diseñado para un máximo de 5 vuelos de prueba en 30 días; hizo 72 vuelos en casi tres años.',
        'Designed for at most 5 test flights in 30 days; it made 72 flights in almost three years.',
      ),
      ['nasa-ingenuity'],
    ),
    fact(
      'totals',
      L('Totales', 'Totals'),
      17,
      L(
        '128,8 minutos de vuelo, 17,0 km, altura máxima de 24,0 m y velocidad máxima de 10 m/s.',
        '128.8 minutes of flight, 17.0 km, a maximum altitude of 24.0 m and a top speed of 10 m/s.',
      ),
      ['nasa-ingenuity'],
      { unit: 'km' },
    ),
    fact(
      'lastFlight',
      L('Último vuelo', 'Last flight'),
      '2024-01-18',
      L('Vuelo 72, el 18 de enero de 2024.', 'Flight 72, on 18 January 2024.'),
      ['nasa-ingenuity'],
    ),
    fact(
      'end',
      L('Fin de misión', 'End of mission'),
      '2024-01-25',
      L('El 25 de enero de 2024.', 'On 25 January 2024.'),
      ['nasa-ingenuity'],
    ),
    fact(
      'cause',
      L('Por qué cayó', 'Why it came down'),
      2024,
      L(
        'Sobre dunas empinadas y sin textura, su sistema de navegación no encontró suficientes referencias; aterrizó con demasiada velocidad horizontal y se dañaron sus palas. Fue la primera investigación de un accidente aéreo en otro planeta (diciembre de 2024).',
        'Over steep, featureless dunes, its navigation system could not find enough references; it landed with too much horizontal speed and its blades were damaged. It was the first aircraft accident investigation on another planet (December 2024).',
      ),
      ['astronomy-ingenuity', 'earthsky-ingenuity'],
    ),
    fact(
      'finalPlace',
      L('Lugar final', 'Final place'),
      15,
      L(
        '"Valinor Hills"; un trozo de pala quedó a unos 15 m al oeste.',
        '"Valinor Hills"; a piece of blade ended up about 15 m to the west.',
      ),
      ['nasa-ingenuity-goodbye'],
      { unit: 'm', approx: true },
    ),
    fact(
      'station',
      L('Hoy', 'Today'),
      20,
      L(
        'El 16 de abril de 2024 el equipo recibió su última transmisión. Un parche de software le ordena despertar cada día, revisar sus sistemas, tomar una foto y registrar temperaturas, guardando los datos a bordo; su memoria podría almacenar unos 20 años de datos diarios.',
        'On 16 April 2024 the team received its last transmission. A software patch tells it to wake up every day, check its systems, take a picture and log temperatures, storing the data on board; its memory could hold about 20 years of daily data.',
      ),
      ['nasa-ingenuity-goodbye', 'phys-ingenuity'],
      { unit: 'a', approx: true },
    ),
    // TODO(verificar): densidad del aire de Marte (ficha de NASA de Ingenuity).
    fact(
      'airDensity',
      L('Aire de Marte', 'Martian air'),
      1,
      L(
        'Alrededor de un 1 % de la densidad del aire de la Tierra.',
        "About 1% of the density of Earth's air.",
      ),
      ['nasa-ingenuity'],
      { unit: '%', approx: true, pending: true },
    ),
  ],
  discoveries: [
    {
      text: L(
        'Se puede volar en Marte; un explorador aéreo puede servir de explorador para un rover.',
        'Flight on Mars is possible; an aerial scout can explore ahead of a rover.',
      ),
      sourceIds: ['nasa-ingenuity'],
    },
  ],
  today: {
    text: L(
      'En Valinor Hills, convertido en estación de datos que espera a futuros visitantes.',
      'At Valinor Hills, turned into a data station waiting for future visitors.',
    ),
    sourceIds: ['nasa-ingenuity-goodbye'],
  },
  legacy: {
    text: L(
      'Futuros helicópteros marcianos y Dragonfly, el helicóptero que NASA prepara para Titán, la luna de Saturno.',
      "Future Mars helicopters and Dragonfly, the rotorcraft NASA is preparing for Saturn's moon Titan.",
    ),
    to: ['epilogue'],
  },
  sites: sitesFor('ingenuity'),
  imageQueries: ['Ingenuity Mars helicopter', 'Ingenuity helicopter Perseverance'],
  model: 'ingenuity',
  patch: { glyph: 'rotor', colors: ['#0b0f1a', '#ff8a5c', '#e8eef7'] },
  lightTimeTarget: 'mars',
  keyPart: L('Rotores coaxiales', 'Coaxial rotors'),
};
