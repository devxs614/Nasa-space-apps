import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { Locale } from '../data/types';

export const LOCALES: readonly Locale[] = ['es', 'en'];
export const NAMESPACES = ['common', 'ui', 'chapters', 'quiz', 'glossary'] as const;
type Namespace = (typeof NAMESPACES)[number];
type Bundle = Record<Namespace, object>;

/**
 * Cada idioma vive en su propio fragmento (Parte 17.7): la primera carga solo descarga el idioma
 * activo y el otro llega después, en segundo plano, para que el cambio de idioma sea inmediato.
 */
const loaders: Record<Locale, () => Promise<{ default: Bundle }>> = {
  es: () => import('./locales/es'),
  en: () => import('./locales/en'),
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {}, // se añaden con loadLocale(); un objeto vacío mantiene la inicialización síncrona
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true, // es-EC, es-MX… → es
    load: 'languageOnly',
    fallbackLng: 'en',
    ns: [...NAMESPACES],
    defaultNS: 'ui',
    interpolation: { escapeValue: false }, // React ya escapa
    detection: { order: ['querystring', 'navigator'], lookupQuerystring: 'lang', caches: [] },
    returnNull: false,
  });

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng.slice(0, 2);
});

/** Idioma que eligió el detector (parámetro `?lang` o navegador) antes de cargar ningún texto. */
export function detectedLocale(): Locale {
  return (i18n.language ?? '').toLowerCase().startsWith('es') ? 'es' : 'en';
}
if (typeof document !== 'undefined') document.documentElement.lang = detectedLocale();

export function isLocaleLoaded(lng: Locale): boolean {
  return NAMESPACES.every((ns) => i18n.hasResourceBundle(lng, ns));
}

const pending = new Map<Locale, Promise<void>>();

/** Descarga los textos de un idioma (una sola vez) y los registra en i18next. */
export function loadLocale(lng: Locale): Promise<void> {
  if (isLocaleLoaded(lng)) return Promise.resolve();
  let p = pending.get(lng);
  if (!p) {
    p = loaders[lng]()
      .then((m) => {
        for (const ns of NAMESPACES) i18n.addResourceBundle(lng, ns, m.default[ns], true, true);
      })
      .finally(() => pending.delete(lng));
    pending.set(lng, p);
  }
  return p;
}

/** Carga el idioma si falta y lo activa. Si ya está cargado, el cambio es síncrono. */
export function activateLocale(lng: Locale): Promise<void> {
  if (isLocaleLoaded(lng)) {
    void i18n.changeLanguage(lng);
    return Promise.resolve();
  }
  return loadLocale(lng).then(() => {
    void i18n.changeLanguage(lng);
  });
}

/** Trae el otro idioma cuando el navegador está libre: así el cambio funciona también sin red. */
export function preloadOtherLocales(current: Locale): void {
  const run = () => {
    for (const lng of LOCALES) if (lng !== current) void loadLocale(lng).catch(() => undefined);
  };
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 6000 });
  else setTimeout(run, 3000);
}

export default i18n;
