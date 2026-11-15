import { AudioEngine } from './AudioEngine';
import type { Locale } from '../data/types';

export type Speaker = 'lumi' | 'machine' | 'log';
const PROFILE: Record<Speaker, { pitch: number; rate: number }> = {
  lumi: { pitch: 1.1, rate: 1 },
  machine: { pitch: 0.85, rate: 0.92 },
  log: { pitch: 1, rate: 1.05 },
};

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null;
}

function pickVoice(locale: Locale): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  const all = s.getVoices().filter((v) => v.lang.toLowerCase().startsWith(locale));
  return all.find((v) => v.localService) ?? all[0] ?? null;
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

export async function hasVoice(locale: Locale): Promise<boolean> {
  if (!synth()) return false;
  await waitForVoices();
  return pickVoice(locale) !== null;
}

let speakingId = 0;
/** Lee el texto por frases (las frases largas se cortan en algunos navegadores). */
export function speak(
  text: string,
  speaker: Speaker,
  locale: Locale,
  speed = 1,
  onEnd?: () => void,
): boolean {
  const s = synth();
  if (!s) return false;
  s.cancel();
  const id = ++speakingId;
  const clean = text
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const sentences = clean.match(/[^.!?…]+[.!?…]*/g) ?? [clean];
  const voice = pickVoice(locale);
  AudioEngine.duck(true);
  sentences.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part.trim());
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? locale;
    u.pitch = PROFILE[speaker].pitch;
    u.rate = PROFILE[speaker].rate * speed;
    if (i === sentences.length - 1)
      u.onend = () => {
        AudioEngine.duck(false);
        if (id === speakingId) onEnd?.();
      };
    s.speak(u);
  });
  return true;
}

export function stopSpeaking(): void {
  synth()?.cancel();
  speakingId++;
  AudioEngine.duck(false);
}
