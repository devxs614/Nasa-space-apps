import { AudioEngine, loadAudioPrefs } from './AudioEngine';
import type { Locale } from '../data/types';

export type Speaker = 'lumi' | 'machine' | 'log';

/*
 * Narración con la voz del navegador (corrección M1): la voz más natural disponible, más despacio,
 * sin alterar el tono (subirlo o bajarlo hace que una voz sintética suene más artificial) y con una
 * pausa real entre frases. LUMI y la Máquina se distinguen con dos voces distintas cuando existen.
 */
const RATE: Record<Speaker, number> = { lumi: 0.9, machine: 0.85, log: 0.9 };
const ORDER: Record<Locale, string[]> = {
  en: ['en-us', 'en-gb'],
  es: ['es-mx', 'es-us', 'es-419', 'es-es'],
};
const PAUSE_SENTENCE = 350;
const PAUSE_LONG = 650; // puntos suspensivos o salto de párrafo
const PAUSE_CLAUSE = 150;
/** Unos 12 s a esta velocidad: las voces en línea de Chrome fallan con enunciados de más de 14 s. */
const MAX_CHARS = 170;

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null;
}

/** Puntuación de una voz para un idioma: −1 si no sirve; cuanto más alta, más natural. */
export function rankVoice(v: SpeechSynthesisVoice, locale: Locale): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase().replace('_', '-');
  if (!lang.startsWith(locale)) return -1;
  let score = 0;
  if (/natural|online/.test(name))
    score += 100; // voces neuronales de Edge
  else if (name.startsWith('google'))
    score += 60; // voces en línea de Chrome
  else if (/premium|enhanced/.test(name)) score += 50;
  if (v.localService) score += 5;
  const i = ORDER[locale].indexOf(lang);
  if (i >= 0) score += 20 - i * 4;
  return score;
}

/** Voces del idioma, de la más natural a la menos. */
export function bestVoices(locale: Locale): SpeechSynthesisVoice[] {
  const s = synth();
  if (!s) return [];
  return s
    .getVoices()
    .map((v) => ({ v, s: rankVoice(v, locale) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.v);
}

/** LUMI y la bitácora usan la mejor voz; la Máquina, la siguiente con otro nombre si la hay. */
export function voiceFor(speaker: Speaker, locale: Locale): SpeechSynthesisVoice | null {
  const all = bestVoices(locale);
  const first = all[0] ?? null;
  if (speaker !== 'machine' || !first) return first;
  return all.find((v) => v.name !== first.name) ?? first;
}

/** 'natural' si hay una voz neuronal o mejorada; 'basic' si solo hay voces sencillas. */
export function voiceQuality(locale: Locale): 'natural' | 'basic' | 'none' {
  const best = bestVoices(locale)[0];
  if (!best) return 'none';
  return rankVoice(best, locale) >= 50 ? 'natural' : 'basic';
}

/** Prepara un texto para el oído: unidades y símbolos como palabras, sin etiquetas de hablante. */
export function speakable(text: string, locale: Locale): string {
  const es = locale === 'es';
  return text
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/km\/h/g, es ? 'kilómetros por hora' : 'kilometers per hour')
    .replace(/×\s?(\d+(?:[.,]\d+)*)/g, es ? '$1 veces' : '$1 times')
    .replace(/≈\s?/g, es ? 'unos ' : 'about ')
    .replace(es ? /\bUA\b/g : /\bAU\b/g, es ? 'unidades astronómicas' : 'astronomical units')
    .replace(/\s?°/g, es ? ' grados' : ' degrees')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export interface SpeechChunk {
  text: string;
  /** Silencio después de decirlo, en milisegundos. */
  pauseMs: number;
}

/** Parte un texto en enunciados cortos (una frase cada uno) con la pausa que le sigue. */
export function splitForSpeech(text: string): SpeechChunk[] {
  const out: SpeechChunk[] = [];
  for (const paragraph of text.split(/\n{2,}/)) {
    const sentences = paragraph.replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]*/g) ?? [];
    for (const raw of sentences) {
      const sentence = raw.trim();
      if (!/[\p{L}\p{N}]/u.test(sentence)) continue;
      const pause = /(…|\.\.\.)$/.test(sentence) ? PAUSE_LONG : PAUSE_SENTENCE;
      if (sentence.length <= MAX_CHARS) {
        out.push({ text: sentence, pauseMs: pause });
        continue;
      }
      // Frase larga: se parte por comas o punto y coma para que ningún enunciado pase de unos 12 s.
      let piece = '';
      const clauses = sentence.match(/[^,;:]+[,;:]?/g) ?? [sentence];
      for (const clause of clauses) {
        if (piece && (piece + clause).length > MAX_CHARS) {
          out.push({ text: piece.trim(), pauseMs: PAUSE_CLAUSE });
          piece = '';
        }
        piece += clause;
      }
      if (piece.trim()) out.push({ text: piece.trim(), pauseMs: pause });
    }
    const last = out[out.length - 1];
    if (last) last.pauseMs = Math.max(last.pauseMs, PAUSE_LONG);
  }
  return out;
}

let voicesReady: Promise<void> | null = null;
/** getVoices() puede llegar vacío la primera vez: espera una vez a `voiceschanged`. */
export function waitForVoices(): Promise<void> {
  const s = synth();
  if (!s) return Promise.resolve();
  if (s.getVoices().length > 0) return Promise.resolve();
  voicesReady ??= new Promise<void>((resolve) => {
    const done = () => resolve();
    s.addEventListener('voiceschanged', done, { once: true });
    window.setTimeout(done, 1500);
  });
  return voicesReady;
}

/** En Edge para Android la lista llega vacía: sin voz, el botón "Escuchar" se oculta. */
export async function hasVoice(locale: Locale): Promise<boolean> {
  if (!synth()) return false;
  await waitForVoices();
  return bestVoices(locale).length > 0;
}

let runId = 0;
let gap: number | undefined;

/**
 * Dice varias líneas seguidas, cada una con su voz. Los enunciados se encadenan con `onend` y un
 * temporizador (no con un solo texto largo), para que entre frases haya un silencio de verdad.
 */
export function speakLines(
  lines: { text: string; speaker: Speaker }[],
  locale: Locale,
  speed = 1,
  onEnd?: () => void,
): boolean {
  const s = synth();
  if (!s) return false;
  window.clearTimeout(gap);
  s.cancel();
  const id = ++runId;
  const queue = lines.flatMap((line) =>
    splitForSpeech(speakable(line.text, locale)).map((chunk) => ({
      ...chunk,
      speaker: line.speaker,
    })),
  );
  if (queue.length === 0) return false;
  AudioEngine.duck(true);
  const next = (i: number) => {
    if (id !== runId) return; // otra narración tomó el relevo o se pidió silencio
    const item = queue[i];
    if (!item) {
      AudioEngine.duck(false);
      onEnd?.();
      return;
    }
    const u = new SpeechSynthesisUtterance(item.text);
    const voice = voiceFor(item.speaker, locale);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? locale;
    u.pitch = 1;
    u.rate = RATE[item.speaker] * speed;
    u.volume = loadAudioPrefs().voice;
    let moved = false;
    const advance = (pauseMs: number) => {
      if (moved || id !== runId) return;
      moved = true;
      gap = window.setTimeout(() => next(i + 1), pauseMs);
    };
    u.onend = () => advance(item.pauseMs);
    u.onerror = () => advance(0);
    s.speak(u);
  };
  next(0);
  return true;
}

/** Lee un texto con la voz de quien habla. */
export function speak(
  text: string,
  speaker: Speaker,
  locale: Locale,
  speed = 1,
  onEnd?: () => void,
): boolean {
  return speakLines([{ text, speaker }], locale, speed, onEnd);
}

export function stopSpeaking(): void {
  window.clearTimeout(gap);
  runId++;
  synth()?.cancel();
  AudioEngine.duck(false);
}
