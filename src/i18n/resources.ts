import es from './locales/es';
import en from './locales/en';

/**
 * Los dos idiomas a la vez. Solo para las pruebas (paridad de claves, textos del quiz): la app
 * nunca importa este archivo, porque carga cada idioma por separado desde `./index`.
 */
export const resources = { es, en } as const;
