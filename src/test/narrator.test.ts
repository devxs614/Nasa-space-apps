import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bestVoices,
  rankVoice,
  speak,
  speakable,
  splitForSpeech,
  stopSpeaking,
  voiceFor,
  voiceQuality,
} from '../audio/narrator';

const voice = (name: string, lang: string, localService = true) =>
  ({ name, lang, localService, default: false, voiceURI: name }) as SpeechSynthesisVoice;

const VOICES = [
  voice('Samantha', 'en-US'),
  voice('Daniel (Enhanced)', 'en-GB'),
  voice('Google US English', 'en-US', false),
  voice('Microsoft Aria Online (Natural) - English (United States)', 'en-US', false),
  voice('Mónica', 'es-ES'),
  voice('Paulina', 'es-MX'),
  voice('Google español', 'es-ES', false),
];

class FakeUtterance {
  voice: SpeechSynthesisVoice | null = null;
  lang = '';
  pitch = 0;
  rate = 0;
  volume = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}
let spoken: FakeUtterance[] = [];
let voices = VOICES;

beforeEach(() => {
  spoken = [];
  voices = VOICES;
  vi.useFakeTimers();
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      getVoices: () => voices,
      cancel: vi.fn(),
      speak: (u: FakeUtterance) => spoken.push(u),
      addEventListener: vi.fn(),
    },
  });
});
afterEach(() => {
  stopSpeaking();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('selección de voz', () => {
  it('prefiere las voces neuronales, luego las de Google y luego las mejoradas', () => {
    expect(bestVoices('en').map((v) => v.name.split(' ')[0])).toEqual([
      'Microsoft',
      'Google',
      'Daniel',
      'Samantha',
    ]);
    expect(rankVoice(VOICES[0]!, 'es')).toBe(-1); // otra lengua
  });

  it('en español prefiere el acento de América si la calidad es la misma', () => {
    voices = [voice('Mónica', 'es-ES'), voice('Paulina', 'es-MX')];
    expect(bestVoices('es')[0]!.name).toBe('Paulina');
    expect(voiceQuality('es')).toBe('basic'); // solo voces sencillas: Ajustes sugiere Edge
  });

  it('LUMI y la Máquina usan voces distintas cuando hay más de una', () => {
    expect(voiceFor('lumi', 'en')!.name).toContain('Natural');
    expect(voiceFor('machine', 'en')!.name).toBe('Google US English');
    expect(voiceFor('log', 'en')!.name).toContain('Natural');
    expect(voiceQuality('en')).toBe('natural');
    voices = [];
    expect(voiceFor('lumi', 'en')).toBeNull();
    expect(voiceQuality('en')).toBe('none');
  });
});

describe('texto para el oído', () => {
  it('lee unidades y símbolos como palabras', () => {
    expect(speakable('It touched down at ≈ 6.4 km/h, ×220 faster. 2.1 AU at 30°.', 'en')).toBe(
      'It touched down at about 6.4 kilometers per hour, 220 times faster. 2.1 astronomical units at 30 degrees.',
    );
    expect(speakable('[LUMI] Tocó a ≈ 6,4 km/h, ×220. 2,1 UA a 30°.', 'es')).toBe(
      'Tocó a unos 6,4 kilómetros por hora, 220 veces. 2,1 unidades astronómicas a 30 grados.',
    );
  });

  it('una frase por enunciado, con pausa más larga tras puntos suspensivos y párrafos', () => {
    const chunks = splitForSpeech('Listen. Do you hear it… That is silence.\n\nNew paragraph.');
    expect(chunks.map((c) => c.text)).toEqual([
      'Listen.',
      'Do you hear it…',
      'That is silence.',
      'New paragraph.',
    ]);
    expect(chunks.map((c) => c.pauseMs)).toEqual([350, 650, 650, 650]);
  });

  it('parte las frases largas por las comas: ningún enunciado pasa de unos 12 s', () => {
    const long = `${'word '.repeat(30)}, ${'more '.repeat(30)}, ${'last '.repeat(20)}.`;
    const chunks = splitForSpeech(long);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.text.length).toBeLessThanOrEqual(170);
  });
});

describe('narración', () => {
  it('habla despacio, sin alterar el tono y con un silencio real entre frases', () => {
    const onEnd = vi.fn();
    expect(speak('First sentence. Second one.', 'lumi', 'en', 1, onEnd)).toBe(true);
    expect(spoken).toHaveLength(1); // no se encola todo de golpe
    expect(spoken[0]!.text).toBe('First sentence.');
    expect(spoken[0]!.rate).toBeCloseTo(0.9);
    expect(spoken[0]!.pitch).toBe(1);
    expect(spoken[0]!.voice!.name).toContain('Natural');
    spoken[0]!.onend?.();
    vi.advanceTimersByTime(300);
    expect(spoken).toHaveLength(1); // todavía en la pausa de 350 ms
    vi.advanceTimersByTime(100);
    expect(spoken).toHaveLength(2);
    expect(spoken[1]!.text).toBe('Second one.');
    spoken[1]!.onend?.();
    vi.advanceTimersByTime(700);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('la Máquina habla aún más despacio y con otra voz', () => {
    speak('I am a machine.', 'machine', 'en');
    expect(spoken[0]!.rate).toBeCloseTo(0.85);
    expect(spoken[0]!.pitch).toBe(1);
    expect(spoken[0]!.voice!.name).toBe('Google US English');
  });

  it('pedir silencio corta la cadena: no llega la frase siguiente', () => {
    speak('One. Two. Three.', 'lumi', 'en');
    stopSpeaking();
    spoken[0]!.onend?.();
    vi.advanceTimersByTime(2000);
    expect(spoken).toHaveLength(1);
  });
});
