/** Temas de la música generativa (corrección L): acordes en números MIDI y la escala de la melodía. */
export type ThemeId = 'prologue' | 'moon' | 'mars' | 'smallBodies' | 'deepSpace' | 'epilogue';
export interface Theme {
  chordSeconds: number;
  chords: number[][];
  scale: number[];
}

export const THEMES: Record<ThemeId, Theme> = {
  // La menor: Am(add9) – Fmaj7 – C(add9) – G6
  prologue: {
    chordSeconds: 8,
    chords: [
      [45, 52, 57, 59, 60, 64],
      [41, 48, 57, 60, 64],
      [48, 55, 62, 64, 67],
      [43, 50, 59, 62, 64],
    ],
    scale: [57, 60, 62, 64, 67, 69, 72],
  },
  // La dórico, escaso: Am9 – D(add9)/F# – Em7 – Am9
  moon: {
    chordSeconds: 9,
    chords: [
      [45, 52, 55, 59, 60],
      [42, 50, 57, 62, 64],
      [40, 47, 55, 59, 62],
      [45, 52, 55, 59, 60],
    ],
    scale: [57, 59, 60, 62, 64, 66, 69],
  },
  // Sol menor, cálido: Gm9 – Ebmaj7 – Bb(add9) – F/A
  mars: {
    chordSeconds: 8,
    chords: [
      [43, 50, 53, 57, 58],
      [39, 46, 55, 58, 62],
      [46, 53, 60, 62, 65],
      [45, 53, 57, 60, 65],
    ],
    scale: [55, 58, 60, 62, 65, 67, 70],
  },
  // La lidio, curioso: A(add9) – B/A – C#m7 – Esus2
  smallBodies: {
    chordSeconds: 7,
    chords: [
      [45, 52, 57, 59, 61],
      [45, 54, 59, 63, 66],
      [49, 56, 59, 64, 68],
      [40, 47, 54, 59, 64],
    ],
    scale: [57, 59, 61, 63, 64, 66, 69],
  },
  // Re mayor, amplio y lento: Dmaj9 – Bm11 – Gmaj9 – A6/9
  deepSpace: {
    chordSeconds: 10,
    chords: [
      [38, 45, 54, 57, 61, 64],
      [35, 47, 54, 57, 62, 64],
      [31, 43, 50, 54, 57, 59],
      [33, 45, 52, 54, 59, 61],
    ],
    scale: [62, 64, 66, 69, 71, 74, 76],
  },
  // La mayor, resolución del relato: A – E/G# – F#m7 – D(add9)
  epilogue: {
    chordSeconds: 8,
    chords: [
      [45, 52, 57, 61, 64],
      [44, 52, 56, 59, 64],
      [42, 49, 57, 61, 64],
      [38, 50, 57, 62, 64],
    ],
    scale: [57, 59, 61, 64, 66, 69, 71],
  },
};

/** Intensidad (0 a 1) de la música en cada momento del capítulo. */
export const INTENSITY = {
  wake: 0.4,
  identity: 0.5,
  journey: 0.7,
  arrival: 0.8,
  work: 0.45, // no distrae de la actividad
  lastSignal: 0.15, // el silencio es parte de la historia
  legacy: 0.9,
} as const;
