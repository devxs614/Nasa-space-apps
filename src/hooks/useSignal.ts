import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Machine } from '../data/types';
import { useJourneyStore, type SignalStatus } from '../state/useJourneyStore';
import { useAppStore } from '../state/useAppStore';
import { lightTime } from '../lib/astro';
import { signalPlayback } from '../lib/signal';
import { formatDate } from '../lib/format';
import { announce } from '../components/layout/LiveRegion';
import { playSfx } from '../audio/play';

let timer: number | null = null;

/** Texto de la "Respuesta archivada" (Parte 14.2). */
export function archivedText(
  t: (k: string, o?: Record<string, unknown>) => string,
  m: Machine,
  locale: 'es' | 'en',
): string {
  const name = m.name[locale];
  if (m.lastSignal.noteOnly)
    return `${t('signal.arrivedBodyNote', { name })} ${m.lastSignal.note?.[locale] ?? ''}`;
  return t('signal.arrivedBody', { name, date: formatDate(m.lastSignal.date, locale) });
}

/** Estado idle → charging → traveling → arrived de la señal de un capítulo. */
export function useSignal(m: Machine) {
  const { t } = useTranslation('ui');
  const status: SignalStatus = useJourneyStore((s) =>
    s.signal.target === m.id ? s.signal.status : 'idle',
  );
  const markSignalSent = useAppStore((s) => s.markSignalSent);

  const send = useCallback(
    (auto = false) => {
      const js = useJourneyStore.getState();
      if (
        js.signal.target === m.id &&
        (js.signal.status === 'traveling' || js.signal.status === 'arrived')
      )
        return;
      const app = useAppStore.getState();
      const locale = app.locale;
      const lt = lightTime(m.lightTimeTarget);
      const now = performance.now();
      if (timer !== null) window.clearTimeout(timer);
      const arrive = () => {
        timer = null;
        const s = useJourneyStore.getState();
        if (s.signal.target !== m.id) return;
        s.setSignal({ status: 'arrived' });
        markSignalSent(m.id);
        playSfx('arrive');
        announce(archivedText((k, o) => t(k, o ?? {}), m, locale));
      };
      if (auto) announce(t('signal.lumiAuto'));
      if (lt.seconds === null) {
        // Kepler: transmisor apagado; no sale ningún pulso, LUMI reproduce un recuerdo.
        js.setSignal({ status: 'traveling', target: m.id, etaMs: 0, startedAt: now });
        arrive();
        return;
      }
      const reduced = app.reducedMotion;
      const pb = signalPlayback(lt.seconds);
      const dur = reduced ? 600 : pb.durationMs;
      js.setSignal({ status: 'traveling', target: m.id, etaMs: dur, startedAt: now });
      playSfx('send');
      playSfx('travel', dur / 1000);
      timer = window.setTimeout(arrive, dur);
    },
    [m, markSignalSent, t],
  );

  const setCharging = useCallback(
    (on: boolean) => {
      const js = useJourneyStore.getState();
      if (on && js.signal.status === 'idle') js.setSignal({ status: 'charging', target: m.id });
      else if (!on && js.signal.target === m.id && js.signal.status === 'charging')
        js.setSignal({ status: 'idle', target: null });
    },
    [m.id],
  );

  useEffect(
    () => () => {
      if (timer !== null && useJourneyStore.getState().signal.target === m.id) {
        window.clearTimeout(timer);
        timer = null;
      }
    },
    [m.id],
  );

  return { status, send, setCharging };
}
