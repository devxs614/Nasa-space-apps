import { useEffect, useState } from 'react';
import { hasVoice, voiceQuality } from '../audio/narrator';
import type { Locale } from '../data/types';

/** ¿Tiene el navegador una voz para este idioma? (Parte 15.6). */
export function useVoiceAvailable(locale: Locale): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    void hasVoice(locale).then((v) => {
      if (alive) setOk(v);
    });
    return () => {
      alive = false;
    };
  }, [locale]);
  return ok;
}

/** Calidad de la mejor voz del navegador para el idioma ('basic' = solo voces sencillas). */
export function useVoiceQuality(locale: Locale): 'natural' | 'basic' | 'none' {
  const [quality, setQuality] = useState<'natural' | 'basic' | 'none'>('none');
  useEffect(() => {
    let alive = true;
    void hasVoice(locale).then(() => {
      if (alive) setQuality(voiceQuality(locale));
    });
    return () => {
      alive = false;
    };
  }, [locale]);
  return quality;
}
