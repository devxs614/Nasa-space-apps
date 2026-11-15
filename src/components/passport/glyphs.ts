/** Glifos originales de los parches (Parte 14.5): paths de trazo en una caja de 100×100. */
const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const GLYPHS: Record<string, string> = {
  scoop:
    'M10 70 H90 M28 70 l5 9 M43 70 l5 9 M58 70 l5 9 M73 70 l5 9 M30 42 L60 32 L68 50 L48 58 Z M60 32 L82 16',
  'descent-stage':
    'M35 46 L45 39 H55 L65 46 V56 L55 63 H45 L35 56 Z M35 56 L18 82 M65 56 L82 82 M42 63 L36 86 M58 63 L64 86 M50 39 V12 M42 20 L50 12 L58 20',
  seismo: `M5 48 L20 48 L27 33 L35 63 L43 23 L51 73 L59 38 L66 53 L72 48 H95 ${circle(42, 86, 3)} ${circle(58, 86, 3)} ${circle(50, 76, 3)}`,
  'wheel-tracks': `${circle(50, 38, 22)} M28 38 H72 M50 16 V60 M35 23 L65 53 M65 23 L35 53 M32 68 L25 96 M68 68 L75 96`,
  'twin-landers':
    'M14 50 H40 L35 42 H19 Z M17 50 L9 70 M37 50 L45 70 M27 50 V70 M60 50 H86 L81 42 H65 Z M63 50 L55 70 M83 50 L91 70 M73 50 V70 M5 74 H95',
  'small-rover': `M18 54 H60 V44 H18 Z ${circle(24, 62, 5)} ${circle(39, 62, 5)} ${circle(54, 62, 5)} M56 44 V28 M70 68 L80 48 L95 68 Z M5 70 H95`,
  'dragging-wheel': `${circle(30, 44, 15)} M15 44 H45 M30 29 V59 M45 58 H95 M45 66 H95 M55 62 H90`,
  odometer:
    'M15 72 A35 35 0 0 1 85 72 M50 72 L80 50 M22 57 l5 3 M33 42 l4 5 M50 37 v6 M67 42 l-4 5 M78 57 l-5 3',
  'ice-crystal':
    'M50 14 L62 21 V37 L50 44 L38 37 V21 Z M50 14 V44 M38 21 L62 37 M62 21 L38 37 M12 64 H34 L42 80 H58 L66 64 H88',
  'quake-dome':
    'M30 50 A20 20 0 0 1 70 50 Z M20 62 Q50 72 80 62 M12 72 Q50 85 88 72 M6 82 Q50 97 94 82',
  rotor: 'M10 24 H90 M15 37 H85 M50 20 V74 M42 74 H58 V84 H42 Z M42 84 L34 95 M58 84 L66 95',
  'asteroid-touch': `M14 70 Q20 50 50 55 Q80 58 88 72 Q80 88 50 85 Q20 88 14 70 Z M82 14 Q66 30 55 51 ${circle(55, 55, 3)}`,
  'ion-trail': `M44 44 h12 v12 h-12z M34 50 H44 M56 50 H66 M44 54 L18 64 M44 50 L14 50 M44 46 L18 36 ${circle(80, 24, 8)} ${circle(80, 78, 10)}`,
  transit: `${circle(50, 32, 17)} ${circle(44, 32, 4)} M8 76 H36 L43 87 H57 L64 76 H92`,
  'two-paths': `${circle(20, 76, 6)} M26 72 Q55 54 92 18 M26 79 Q60 76 94 52`,
};
