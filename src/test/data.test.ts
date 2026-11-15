import sourcesMd from '../../SOURCES.md?raw';
import { describe, expect, it } from 'vitest';
import { MACHINES } from '../data/machines';
import { SOURCES, SOURCE_BY_ID } from '../data/sources';
import { SITES } from '../data/sites';
import { EXTRAS } from '../data/extras';
import { QUIZZES } from '../data/quizzes';
import { SCRIPTS } from '../data/script';
import { GLOSSARY_IDS } from '../data/glossary';
import { GLYPHS } from '../components/passport/glyphs';
import { EPILOGUE_2026 } from '../data/machines';

const ms = (d: string) => Date.parse(d.length > 10 ? d : `${d}T00:00:00Z`);
function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
};

describe('máquinas', () => {
  it('15 máquinas con ids únicos y orden 1..15', () => {
    expect(MACHINES).toHaveLength(15);
    expect(new Set(MACHINES.map((m) => m.id)).size).toBe(15);
    expect(MACHINES.map((m) => m.order)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    MACHINES.forEach((m) =>
      expect(['moon', 'mars', 'small-bodies', 'deep-space']).toContain(m.world),
    );
  });
  it('fechas ISO válidas y en orden', () => {
    for (const m of MACHINES) {
      const dates = [m.launch?.date, m.arrival?.date, m.lastSignal.date, m.missionEnd?.date].filter(
        Boolean,
      ) as string[];
      dates.forEach((d) => expect(Number.isNaN(ms(d))).toBe(false));
      if (m.launch && m.arrival) expect(ms(m.launch.date)).toBeLessThan(ms(m.arrival.date));
      if (m.arrival)
        expect(ms(m.arrival.date.slice(0, 10))).toBeLessThanOrEqual(ms(m.lastSignal.date));
    }
  });
  it('lightTimeTarget coherente con el mundo', () => {
    for (const m of MACHINES) {
      if (m.world === 'moon') expect(m.lightTimeTarget).toBe('moon');
      if (m.world === 'mars') expect(m.lightTimeTarget).toBe('mars');
    }
    const by = Object.fromEntries(MACHINES.map((m) => [m.id, m.lightTimeTarget]));
    expect(by.near).toBe('eros');
    expect(by.dawn).toBe('ceres');
    expect(by.kepler).toBe('kepler');
    expect(['pioneer10', 'pioneer11']).toContain(by.pioneer);
  });
  it('ids de hechos únicos por máquina', () => {
    for (const m of MACHINES) expect(new Set(m.facts.map((f) => f.id)).size).toBe(m.facts.length);
  });
});

describe('fuentes', () => {
  it('cada fuente es completa y https', () => {
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length);
    for (const s of SOURCES) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.publisher.length).toBeGreaterThan(0);
      expect(s.url.startsWith('https://')).toBe(true);
      expect(s.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it('todo sourceId usado existe', () => {
    const used = new Set<string>();
    for (const m of MACHINES) {
      [m.launch, m.arrival, m.lastSignal, m.missionEnd, m.planned, m.today].forEach((x) =>
        x?.sourceIds.forEach((s) => used.add(s)),
      );
      m.facts.forEach((f) => f.sourceIds.forEach((s) => used.add(s)));
      m.discoveries.forEach((d) => d.sourceIds.forEach((s) => used.add(s)));
    }
    SITES.forEach((s) => s.sourceIds.forEach((x) => used.add(x)));
    EXTRAS.forEach((e) => e.sourceIds.forEach((x) => used.add(x)));
    QUIZZES.forEach((q) => q.sourceIds.forEach((x) => used.add(x)));
    EPILOGUE_2026.forEach((e) => e.sourceIds.forEach((x) => used.add(x)));
    for (const id of used) expect(SOURCE_BY_ID.has(id), id).toBe(true);
  });
  it('SOURCES.md está sincronizado con sources.ts', () => {
    const md = sourcesMd;
    for (const s of SOURCES) expect(md.includes(`\`${s.id}\``), s.id).toBe(true);
  });
});

describe('sitios', () => {
  it('coordenadas válidas y cuerpo coherente', () => {
    expect(new Set(SITES.map((s) => s.id)).size).toBe(SITES.length);
    for (const s of SITES) {
      expect(s.lat).toBeGreaterThanOrEqual(-90);
      expect(s.lat).toBeLessThanOrEqual(90);
      expect(s.lon).toBeGreaterThanOrEqual(-180);
      expect(s.lon).toBeLessThanOrEqual(180);
      if (s.machineId) {
        const m = MACHINES.find((x) => x.id === s.machineId);
        expect(m?.world).toBe(s.body);
      }
    }
  });
});

describe('parches', () => {
  it('glifo existe, colores hex y contraste ≥ 3:1', () => {
    for (const m of MACHINES) {
      expect(GLYPHS[m.patch.glyph], m.patch.glyph).toBeDefined();
      m.patch.colors.forEach((c) => expect(c).toMatch(/^#[0-9a-f]{6}$/i));
      expect(contrast(m.patch.colors[2], '#0b0f1a')).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('quizzes y guiones', () => {
  it('45 preguntas, 3 por máquina, basis existente', () => {
    expect(QUIZZES).toHaveLength(45);
    for (const m of MACHINES) expect(QUIZZES.filter((q) => q.machineId === m.id)).toHaveLength(3);
    for (const q of QUIZZES) {
      const m = MACHINES.find((x) => x.id === q.machineId)!;
      const f = m.facts.find((x) => `facts.${x.id}` === q.basis);
      expect(f, q.id).toBeDefined();
      expect(q.sourceIds.length).toBeGreaterThan(0);
    }
  });
  it('las referencias de los guiones existen y no son datos pendientes', () => {
    for (const m of MACHINES) {
      const s = SCRIPTS[m.id];
      const refs = [
        ...Object.values(s).flatMap((v) =>
          Array.isArray(v)
            ? v.flatMap((l) => ('refs' in l ? l.refs : [l.ref, ...Object.values(l.vars ?? {})]))
            : [],
        ),
      ].filter((r): r is string => typeof r === 'string');
      for (const r of refs) {
        if (!r.startsWith('facts.')) continue;
        const id = r.split('.')[1];
        const f = m.facts.find((x) => x.id === id);
        expect(f, `${m.id} ${r}`).toBeDefined();
        expect(f?.pending, `${m.id} ${r}`).not.toBe(true);
      }
    }
  });
  it('glosario con 38 términos', () => {
    expect(GLOSSARY_IDS.length).toBe(38);
  });
});
