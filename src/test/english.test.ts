import { describe, expect, it } from 'vitest';
import i18n, { NAMESPACES } from '../i18n';
import { resources } from '../i18n/resources';
import { MACHINES } from '../data/machines';
import { EXTRAS } from '../data/extras';
import { formatDate } from '../lib/format';

/** Todos los textos en inglés de un árbol de datos (`{ es, en }`) o de un JSON de traducciones. */
function englishTexts(
  node: unknown,
  path = '',
  inEnglish = false,
  out = new Map<string, string>(),
) {
  if (typeof node === 'string') {
    if (inEnglish) out.set(path, node);
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => englishTexts(v, `${path}[${i}]`, inEnglish, out));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      englishTexts(v, path ? `${path}.${k}` : k, inEnglish || k === 'en', out);
    }
  }
  return out;
}

describe('versión inglesa', () => {
  // La interfaz escribe "July 20, 1969" (Intl, `en`); el texto corrido no puede decir "20 July 1969".
  const dayFirst =
    /\b\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December)\b/;

  it('las fechas de los textos van en el mismo estilo que las de la interfaz', () => {
    const texts = new Map<string, string>();
    for (const ns of NAMESPACES) {
      englishTexts(resources.en[ns], ns, true).forEach((v, k) => texts.set(k, v));
    }
    englishTexts(MACHINES, 'machines').forEach((v, k) => texts.set(k, v));
    englishTexts(EXTRAS, 'extras').forEach((v, k) => texts.set(k, v));
    expect(texts.size).toBeGreaterThan(1500);
    const wrong = [...texts].filter(([, v]) => dayFirst.test(v)).map(([k, v]) => `${k}: ${v}`);
    expect(wrong).toEqual([]);
  });

  it('las fechas con hora se escriben en UTC y de 0 a 23', () => {
    expect(formatDate('2018-06-10', 'en')).toBe('June 10, 2018');
    expect(formatDate('2018-06-10', 'es')).toBe('10 de junio de 2018');
    const en = formatDate('1967-04-20T00:04:17Z', 'en', true);
    expect(en).toMatch(/^April 20, 1967\b.*\b00:04 UTC$/);
    expect(en).not.toMatch(/AM|PM/i);
    expect(formatDate('1967-04-20T13:04:17Z', 'es', true)).toMatch(/13:04 UTC$/);
  });

  it('los recuentos concuerdan en singular y en plural', () => {
    const cases = [
      ['en', 'catalog.results', '1 result', '2 results'],
      ['es', 'catalog.results', '1 resultado', '2 resultados'],
      ['en', 'sources.count', '1 source', '2 sources'],
      ['es', 'sources.count', '1 fuente', '2 fuentes'],
      ['en', 'sources.groupCount', '1 source in this group', '2 sources in this group'],
      ['es', 'sources.groupCount', '1 fuente en este grupo', '2 fuentes en este grupo'],
      ['en', 'atlas.sitesCount', '1 site shown', '2 sites shown'],
      ['es', 'atlas.sitesCount', '1 sitio visible', '2 sitios visibles'],
      ['en', 'timeline.count', '1 machine', '2 machines'],
      ['es', 'timeline.count', '1 máquina', '2 máquinas'],
    ] as const;
    for (const [lng, key, one, two] of cases) {
      const t = i18n.getFixedT(lng, 'ui');
      expect(t(key, { count: 1 })).toBe(one);
      expect(t(key, { count: 2 })).toBe(two);
    }
  });
});
