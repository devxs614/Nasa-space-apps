import { useEffect, useState } from 'react';
import { hasVoice } from '../audio/narrator';
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
