import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { Slider } from '../ui/Slider';
import { Toggle } from '../ui/Toggle';
import {
  AudioEngine,
  defaultAudioPrefs,
  loadAudioPrefs,
  type AudioPrefs,
} from '../../audio/AudioEngine';

type Level = 'master' | 'music' | 'ambience' | 'sfx' | 'voice';
const LEVELS: Level[] = ['master', 'music', 'ambience', 'sfx', 'voice'];
const pct = (v: number) => `${Math.round(v * 100)} %`;

/** Avisa a quien controla la música (AudioBridge) de que cambió el mezclador. */
export const MIXER_EVENT = 'ultima-senal:mixer';

export interface AudioMixerProps {
  soundOn: boolean;
  onToggleSound: (on: boolean) => void;
}

/**
 * Mezclador de audio (corrección L): interruptor general, interruptor de música y cinco barras
 * (General, Música, Ambiente, Efectos y Voz). Se usa en Ajustes → Sonido y en la barra superior.
 * Los valores se guardan en `ultima-senal:audio`.
 */
export function AudioMixer({ soundOn, onToggleSound }: AudioMixerProps) {
  const { t } = useTranslation('ui');
  const [prefs, setPrefs] = useState<AudioPrefs>(() => loadAudioPrefs());
  const update = (patch: Partial<AudioPrefs>) => {
    // Se parte de lo guardado: otro panel puede haber cambiado otra cosa (la velocidad de la voz).
    const next = { ...loadAudioPrefs(), ...patch };
    setPrefs(next);
    AudioEngine.setPrefs(next);
    window.dispatchEvent(new Event(MIXER_EVENT));
  };
  return (
    <div data-mixer>
      <div className="divide-y divide-line">
        <Toggle
          checked={soundOn}
          onChange={onToggleSound}
          label={t('settings.sound')}
          description={t('settings.soundDesc')}
        />
        <Toggle
          checked={prefs.musicOn}
          onChange={(v) => update({ musicOn: v })}
          label={t('mixer.music')}
          description={t('mixer.note')}
        />
      </div>
      {LEVELS.map((level) => (
        <Slider
          key={level}
          label={t(`mixer.${level}`)}
          value={prefs[level]}
          min={0}
          max={1}
          step={0.05}
          format={pct}
          onChange={(v) => update({ [level]: v })}
        />
      ))}
      <button
        type="button"
        className="btn btn-ghost btn-sm mt-2"
        onClick={() =>
          update({
            master: defaultAudioPrefs.master,
            music: defaultAudioPrefs.music,
            ambience: defaultAudioPrefs.ambience,
            sfx: defaultAudioPrefs.sfx,
            voice: defaultAudioPrefs.voice,
          })
        }
      >
        <RotateCcw size={16} aria-hidden="true" />
        {t('mixer.reset')}
      </button>
    </div>
  );
}
