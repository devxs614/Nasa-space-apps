import { describe, expect, it } from 'vitest';
import { resources } from '../i18n';
import { MACHINES } from '../data/machines';
import { BEATS } from '../state/useJourneyStore';

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
