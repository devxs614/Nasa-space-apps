import { loadAudioPrefs } from './AudioEngine';
import type { Locale } from '../data/types';
import { speakLines as speakQueue, type Speaker } from './narrator';

/** Lee varias líneas seguidas, cada una con su voz (narración automática, Parte 15.6). */
export function speakLines(lines: { text: string; speaker: Speaker }[], locale: Locale): void {
  speakQueue(lines, locale, loadAudioPrefs().narrationRate);
}
