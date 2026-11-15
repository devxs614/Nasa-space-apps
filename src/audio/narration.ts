import { AudioEngine, loadAudioPrefs } from './AudioEngine';
import type { Locale } from '../data/types';
import type { Speaker } from './narrator';

const PROFILE: Record<Speaker, { pitch: number; rate: number }> = {
  lumi: { pitch: 1.1, rate: 1 },
  machine: { pitch: 0.85, rate: 0.92 },
  log: { pitch: 1, rate: 1.05 },
};

/** Lee varias líneas seguidas, cada una con el perfil de su voz (narración automática, Parte 15.6). */
export function speakLines(lines: { text: string; speaker: Speaker }[], locale: Locale): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const s = window.speechSynthesis;
  s.cancel();
  const voice = s
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith(locale))
    .sort((a, b) => Number(b.localService) - Number(a.localService))[0];
  if (!voice || !lines.length) return;
  const speed = loadAudioPrefs().narrationRate;
  AudioEngine.duck(true);
  lines.forEach((l, i) => {
    const u = new SpeechSynthesisUtterance(l.text.replace(/\s+/g, ' ').trim());
    u.voice = voice;
    u.lang = voice.lang;
    u.pitch = PROFILE[l.speaker].pitch;
    u.rate = PROFILE[l.speaker].rate * speed;
    u.volume = loadAudioPrefs().voice;
    if (i === lines.length - 1) u.onend = () => AudioEngine.duck(false);
    s.speak(u);
  });
}
