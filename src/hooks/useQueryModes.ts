import { useEffect } from 'react';
import { useAppStore } from '../state/useAppStore';
import { useJourneyStore } from '../state/useJourneyStore';

/** Aplica ?aula=1, ?lite=1, ?demo=1 y ?lang=xx una vez al cargar (Parte 3.3 y 20.3). */
export function useQueryModes(): void {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const app = useAppStore.getState();
    const lang = q.get('lang');
    if (lang === 'es' || lang === 'en') app.setLocale(lang);
    if (q.get('aula') === '1') app.updateSettings({ classroomMode: true, soundOn: false });
    if (q.get('lite') === '1') app.setLiteMode(true);
    if (q.get('demo') === '1') useJourneyStore.getState().setDemo(true);
  }, []);
}
