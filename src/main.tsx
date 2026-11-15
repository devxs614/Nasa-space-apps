import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LOCALES, activateLocale, preloadOtherLocales } from './i18n';
import './styles/globals.css';
import { App } from './App';
import { useAppStore } from './state/useAppStore';
import type { Locale } from './data/types';

/** Idioma inicial: `?lang`; si no, el guardado (o el del navegador en la primera visita). */
function initialLocale(): Locale {
  const q = new URLSearchParams(window.location.search).get('lang');
  return q === 'es' || q === 'en' ? q : useAppStore.getState().locale;
}

/** Los textos del idioma activo se cargan antes de pintar; el otro idioma llega después. */
async function start(): Promise<void> {
  const root = document.getElementById('root');
  if (!root) return;
  let locale = initialLocale();
  try {
    await activateLocale(locale);
  } catch {
    // Sin red para ese idioma: se intenta con el otro antes de pintar.
    const other = LOCALES.find((l) => l !== locale);
    if (other) {
      await activateLocale(other).catch(() => undefined);
      locale = other;
    }
  }
  if (useAppStore.getState().locale !== locale) useAppStore.setState({ locale });
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  preloadOtherLocales(locale);
}
void start();

if (import.meta.env.DEV) {
  void Promise.all([
    import('./state/useJourneyStore'),
    import('./state/useAppStore'),
    import('./state/useUiStore'),
  ]).then(([j, a, u]) => {
    Object.assign(window, {
      __journey: j.useJourneyStore,
      __app: a.useAppStore,
      __ui: u.useUiStore,
    });
  });
}
