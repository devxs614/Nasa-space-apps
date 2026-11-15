import { describe, expect, it } from 'vitest';
import {
  DEMO_SIGNAL_AT,
  DEMO_STEPS,
  DEMO_TOTAL_MS,
  demoFrame,
  demoStepIndex,
} from '../components/demo/demoScript';
import { sceneForBeat, sceneForSection } from '../lib/scenes';
import { resources } from '../i18n/resources';
import { useJourneyStore } from '../state/useJourneyStore';

const MOON_MS = 1284;

describe('Modo Demo', () => {
  it('dura 30 s en cinco pasos contiguos', () => {
    expect(DEMO_TOTAL_MS).toBe(30_000);
    expect(DEMO_STEPS).toHaveLength(5);
    expect(DEMO_STEPS[0]!.from).toBe(0);
    expect(DEMO_STEPS.at(-1)!.to).toBe(DEMO_TOTAL_MS);
    DEMO_STEPS.slice(1).forEach((s, i) => expect(s.from).toBe(DEMO_STEPS[i]!.to));
  });

  it('cada paso tiene su subtítulo en inglés en los dos idiomas', () => {
    for (const lang of ['es', 'en'] as const) {
      const demo = (resources[lang].ui as unknown as { demo: Record<string, string> }).demo;
      for (const s of DEMO_STEPS) expect(demo[s.key], `${lang} ${s.key}`).toBeTruthy();
    }
    expect(resources.es.ui.demo.s1).toBe(resources.en.ui.demo.s1);
  });

  it('recorre los cinco momentos estrella en orden', () => {
    const at = (ms: number) => demoFrame(ms, MOON_MS);
    expect(at(0).section).toBe('prologue');
    expect(at(6500).chapterId).toBe('apollo-lm');
    expect(at(13_000).chapterId).toBe('opportunity');
    expect(at(13_000).beat).toBe('lastSignal');
    expect(at(20_500).chapterId).toBe('ingenuity');
    expect(at(29_000).chapterId).toBe('pioneer');
    expect(demoStepIndex(DEMO_TOTAL_MS + 5000)).toBe(4);
  });

  it('el pulso a la Luna tarda el tiempo de luz real', () => {
    expect(demoFrame(DEMO_SIGNAL_AT - 1, MOON_MS).signal).toBe('idle');
    expect(demoFrame(DEMO_SIGNAL_AT + 1, MOON_MS).signal).toBe('traveling');
    expect(demoFrame(DEMO_SIGNAL_AT + MOON_MS + 1, MOON_MS).signal).toBe('arrived');
    expect(demoFrame(11_000, MOON_MS).beat).toBe('identity');
  });

  it('la tormenta de Opportunity crece y el progreso nunca sale de 0..1', () => {
    expect(demoFrame(12_100, MOON_MS).fx.storm).toBe(0);
    expect(demoFrame(17_900, MOON_MS).fx.storm).toBe(1);
    expect(demoFrame(23_000, MOON_MS).fx.fly).toBe(1);
    for (let ms = 0; ms <= DEMO_TOTAL_MS; ms += 250) {
      const f = demoFrame(ms, MOON_MS);
      expect(f.beatProgress).toBeGreaterThanOrEqual(0);
      expect(f.beatProgress).toBeLessThanOrEqual(1);
      expect(f.sectionProgress).toBeLessThanOrEqual(1);
      // Cada fotograma resuelve a una escena válida.
      const scene =
        f.chapterId && f.beat
          ? sceneForBeat(f.chapterId, f.beat)
          : f.section
            ? sceneForSection(f.section)
            : null;
      expect(scene, `ms ${ms}`).not.toBeNull();
    }
  });

  it('mientras dura la demo, el scroll no mueve la escena', () => {
    const js = useJourneyStore.getState();
    js.setDemo(true);
    js.demoDrive(demoFrame(13_000, MOON_MS));
    js.setSection('prologue', 0.5);
    js.setBeat('surveyor', 'wake', 0.3);
    expect(useJourneyStore.getState().chapterId).toBe('opportunity');
    js.setDemo(false);
    const after = useJourneyStore.getState();
    expect(after.chapterId).toBeNull();
    expect(after.section).toBe('prologue');
    expect(after.fx).toEqual({});
    after.demoDrive(demoFrame(13_000, MOON_MS));
    expect(useJourneyStore.getState().chapterId).toBeNull();
  });
});
