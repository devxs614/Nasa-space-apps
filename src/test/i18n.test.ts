import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n, { NAMESPACES, activateLocale, isLocaleLoaded, loadLocale } from '../i18n';
import { resources } from '../i18n/resources';
import { MACHINES } from '../data/machines';
import { BEATS } from '../state/useJourneyStore';
import { useAppStore } from '../state/useAppStore';

type Tree = { [k: string]: string | Tree };
const PLURAL = /_(zero|one|two|few|many|other)$/;

function flatten(t: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [k, v] of Object.entries(t)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.set(key, v);
    else flatten(v, key).forEach((val, kk) => out.set(kk, val));
  }
  return out;
}
const vars = (s: string) => [...s.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort();

describe('paridad de idiomas', () => {
  const namespaces = Object.keys(resources.es) as (keyof typeof resources.es)[];
  for (const ns of namespaces) {
    it(`namespace ${ns}`, () => {
      const es = flatten(resources.es[ns]);
      const en = flatten(resources.en[ns]);
      const norm = (m: Map<string, string>) =>
        new Set([...m.keys()].map((k) => k.replace(PLURAL, '')));
      const kes = norm(es);
      const ken = norm(en);
      expect(
        [...kes].filter((k) => !ken.has(k)),
        'faltan en inglés',
      ).toEqual([]);
      expect(
        [...ken].filter((k) => !kes.has(k)),
        'faltan en español',
      ).toEqual([]);
      for (const [k, v] of [...es, ...en]) {
        expect(v.trim().length, k).toBeGreaterThan(0);
        expect(v, k).not.toBe(k);
        expect(/<\/?[a-z][^>]*>/i.test(v), `HTML en ${k}`).toBe(false);
      }
      for (const [k, v] of es) {
        const other = en.get(k) ?? en.get(k.replace(PLURAL, '_other'));
        if (other !== undefined) expect(vars(v), k).toEqual(vars(other));
      }
    });
  }
  it('sceneAlt en todos los momentos de todos los capítulos', () => {
    for (const lang of ['es', 'en'] as const) {
      const ch = resources[lang].chapters as unknown as Record<
        string,
        Record<string, Record<string, unknown>>
      >;
      for (const m of MACHINES) {
        for (const b of BEATS) {
          expect(typeof ch[m.id]?.[b]?.sceneAlt, `${lang} ${m.id}.${b}`).toBe('string');
        }
      }
    }
  });
});

describe('carga de idiomas por separado', () => {
  afterEach(async () => {
    // Deja los dos idiomas cargados, como en el resto de las pruebas.
    await loadLocale('es');
    await loadLocale('en');
    await i18n.changeLanguage('es');
    useAppStore.setState({ locale: 'es', highContrast: false });
  });
  const unload = (lng: 'es' | 'en') =>
    NAMESPACES.forEach((ns) => i18n.removeResourceBundle(lng, ns));

  it('cada idioma trae exactamente las cinco secciones de textos', () => {
    for (const lang of ['es', 'en'] as const)
      expect(Object.keys(resources[lang]).sort()).toEqual([...NAMESPACES].sort());
  });

  it('loadLocale descarga y registra un idioma que faltaba', async () => {
    unload('en');
    expect(isLocaleLoaded('en')).toBe(false);
    await Promise.all([loadLocale('en'), loadLocale('en')]);
    expect(isLocaleLoaded('en')).toBe(true);
    await activateLocale('en');
    expect(i18n.t('ui:brand')).toBe('LAST SIGNAL');
    expect(document.documentElement.lang).toBe('en');
  });

  it('setLocale no cambia el idioma del store hasta que los textos están listos', async () => {
    await activateLocale('es');
    useAppStore.setState({ locale: 'es' });
    unload('en');
    useAppStore.getState().setLocale('en');
    expect(useAppStore.getState().locale).toBe('es');
    expect(i18n.t('ui:brand')).toBe('ÚLTIMA SEÑAL');
    await vi.waitFor(() => expect(useAppStore.getState().locale).toBe('en'));
    expect(i18n.t('ui:brand')).toBe('LAST SIGNAL');
    // Con el idioma ya cargado, el cambio es inmediato.
    useAppStore.getState().setLocale('es');
    expect(useAppStore.getState().locale).toBe('es');
    expect(i18n.t('ui:brand')).toBe('ÚLTIMA SEÑAL');
  });

  it('updateSettings cambia el idioma junto con otros ajustes', () => {
    useAppStore.getState().updateSettings({ locale: 'en', highContrast: true });
    const st = useAppStore.getState();
    expect(st.locale).toBe('en');
    expect(st.highContrast).toBe(true);
    expect(i18n.t('ui:brand')).toBe('LAST SIGNAL');
    st.updateSettings({ highContrast: false });
    expect(useAppStore.getState().locale).toBe('en');
  });
});
