import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AudioEngine } from './AudioEngine';
import { setAmbience, type AmbienceKind } from './ambience';
import { MusicEngine } from './music/MusicEngine';
import { INTENSITY, type ThemeId } from './music/themes';
import { MIXER_EVENT } from '../components/audio/AudioMixer';
import { flatline } from './sfx';
import { speakLines } from './narration';
import { stopSpeaking } from './narrator';
import { useAppStore } from '../state/useAppStore';
import { useJourneyStore, type SceneKey } from '../state/useJourneyStore';
import { MACHINES_BY_ID } from '../data/machines';
import { SCRIPTS } from '../data/script';
import { resolveLine } from '../components/chapter/ScriptLines';

const AMBIENCE: Partial<Record<SceneKey, AmbienceKind>> = {
  prologue: 'earth',
  epilogue: 'earth',
  idle: 'earth',
  showcase: 'earth',
  'moon-orbit': 'moon',
  'moon-surface': 'moon',
  'atlas-moon': 'moon',
  'mars-orbit': 'mars',
  'mars-surface': 'mars',
  'atlas-mars': 'mars',
  eros: 'small',
  'vesta-ceres': 'small',
  kepler: 'deep',
  'outer-system': 'deep',
};

const MUSIC: Partial<Record<SceneKey, ThemeId>> = {
  prologue: 'prologue',
  idle: 'prologue',
  showcase: 'prologue',
  epilogue: 'epilogue',
  'moon-orbit': 'moon',
  'moon-surface': 'moon',
  'atlas-moon': 'moon',
  'mars-orbit': 'mars',
  'mars-surface': 'mars',
  'atlas-mars': 'mars',
  eros: 'smallBodies',
  'vesta-ceres': 'smallBodies',
  kepler: 'deepSpace',
  'outer-system': 'deepSpace',
};
let gestured = false;

/** Conecta el motor de audio con el store: interruptor general, ambiente por acto, silencio de la última señal y narración. */
export function AudioBridge() {
  const { t } = useTranslation(['chapters', 'ui']);
  const soundOn = useAppStore((s) => s.soundOn);
  const narrationOn = useAppStore((s) => s.narrationOn);
  const quality = useAppStore((s) => s.quality);
  const liteMode = useAppStore((s) => s.liteMode);
  const sceneKey = useJourneyStore((s) => s.sceneKey);
  const flatlined = useRef<string | null>(null);

  useEffect(() => {
    const mark = () => {
      gestured = true;
    };
    window.addEventListener('pointerdown', mark, { once: true });
    window.addEventListener('keydown', mark, { once: true });
    return () => {
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', mark);
    };
  }, []);

  // Interruptor general: silencia todo en menos de 300 ms (Parte 15.7).
  useEffect(() => {
    AudioEngine.setEnabled(soundOn);
    if (!soundOn) {
      setAmbience(null);
      MusicEngine.stop();
      stopSpeaking();
    }
  }, [soundOn]);
  // Música generativa: un tema por acto con fundido cruzado; solo pad y piano en calidad baja o modo ligero.
  useEffect(() => {
    if (!soundOn || !AudioEngine.ready) return;
    MusicEngine.setLite(quality === 'low' || liteMode);
    MusicEngine.setTheme(MUSIC[sceneKey] ?? 'prologue');
    MusicEngine.sync();
  }, [soundOn, sceneKey, quality, liteMode]);
  // El mezclador enciende, apaga o deja en 0 la música: el planificador arranca o se detiene.
  useEffect(() => {
    const sync = () => MusicEngine.sync();
    window.addEventListener(MIXER_EVENT, sync);
    return () => window.removeEventListener(MIXER_EVENT, sync);
  }, []);

  // Ambiente por acto con fundido cruzado.
  useEffect(() => {
    if (!soundOn || !AudioEngine.ready) return;
    setAmbience(AMBIENCE[sceneKey] ?? 'earth', quality === 'low');
  }, [soundOn, sceneKey, quality]);

  // "La última señal": el ambiente baja mientras crece la estática y suena la línea plana una sola vez.
  useEffect(
    () =>
      useJourneyStore.subscribe((s, prev) => {
        // La música crece y se calma con el relato; en "La última señal" casi desaparece.
        if (s.beat !== prev.beat) MusicEngine.setIntensity(s.beat ? INTENSITY[s.beat] : 0.4);
        if (!useAppStore.getState().soundOn || !AudioEngine.ready) return;
        const inLast = s.beat === 'lastSignal' && s.beatProgress > 0.3;
        const wasLast = prev.beat === 'lastSignal' && prev.beatProgress > 0.3;
        if (inLast !== wasLast) AudioEngine.duck(inLast, 0.06);
        if (
          s.beat === 'lastSignal' &&
          s.beatProgress > 0.7 &&
          s.chapterId &&
          flatlined.current !== s.chapterId
        ) {
          flatlined.current = s.chapterId;
          flatline();
        }
        if (s.chapterId !== prev.chapterId) flatlined.current = null;
      }),
    [],
  );

  // Narración automática: lee cada momento al entrar, solo tras un gesto del visitante; al salir, cancela.
  useEffect(() => {
    if (!narrationOn) {
      stopSpeaking();
      return;
    }
    return useJourneyStore.subscribe((s, prev) => {
      if (!gestured || (s.chapterId === prev.chapterId && s.beat === prev.beat)) return;
      if (!s.chapterId || !s.beat) {
        stopSpeaking();
        return;
      }
      const m = MACHINES_BY_ID[s.chapterId];
      const locale = useAppStore.getState().locale;
      const tt = (k: string, o?: Record<string, unknown>) => t(k, o ?? {});
      const lines = SCRIPTS[m.id][s.beat]
        .filter((l) => !l.afterSignal)
        .map((l) => resolveLine(tt, m, s.beat!, l, locale))
        .filter((r): r is NonNullable<typeof r> => Boolean(r) && r!.speaker !== 'note')
        .map((r) => ({ text: r.text, speaker: r.speaker as 'lumi' | 'machine' | 'log' }));
      speakLines(lines, locale);
    });
  }, [narrationOn, t]);

  return null;
}
