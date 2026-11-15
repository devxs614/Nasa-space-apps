import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import esCommon from './es/common.json';
import esUi from './es/ui.json';
import esChapters from './es/chapters.json';
import esQuiz from './es/quiz.json';
import esGlossary from './es/glossary.json';
import enCommon from './en/common.json';
import enUi from './en/ui.json';
import enChapters from './en/chapters.json';
import enQuiz from './en/quiz.json';
import enGlossary from './en/glossary.json';

export const resources = {
  es: { common: esCommon, ui: esUi, chapters: esChapters, quiz: esQuiz, glossary: esGlossary },
  en: { common: enCommon, ui: enUi, chapters: enChapters, quiz: enQuiz, glossary: enGlossary },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true, // es-EC, es-MX… → es
    load: 'languageOnly',
    fallbackLng: 'en',
    ns: ['common', 'ui', 'chapters', 'quiz', 'glossary'],
    defaultNS: 'ui',
    interpolation: { escapeValue: false }, // React ya escapa
    detection: { order: ['querystring', 'navigator'], lookupQuerystring: 'lang', caches: [] },
    returnNull: false,
  });

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
});
if (typeof document !== 'undefined') document.documentElement.lang = i18n.resolvedLanguage ?? 'es';

export function detectedLocale(): 'es' | 'en' {
  return i18n.resolvedLanguage === 'es' ? 'es' : 'en';
}

export default i18n;
