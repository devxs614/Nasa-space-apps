import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import i18n from '../i18n';
import { AudioMixer, MIXER_EVENT } from '../components/audio/AudioMixer';
import { defaultAudioPrefs, loadAudioPrefs, saveAudioPrefs } from '../audio/AudioEngine';
import { MusicEngine } from '../audio/music/MusicEngine';
import { INTENSITY, THEMES } from '../audio/music/themes';

beforeEach(async () => {
  await i18n.changeLanguage('en');
  saveAudioPrefs(defaultAudioPrefs);
});

describe('mezclador de audio', () => {
  it('tiene cinco barras con su valor visible y los valores iniciales del prompt', () => {
    render(<AudioMixer soundOn onToggleSound={() => undefined} />);
    const expected = {
      Master: '80 %',
      Music: '50 %',
      Ambience: '40 %',
      Effects: '70 %',
      Voice: '100 %',
    };
    for (const [name, value] of Object.entries(expected)) {
      const slider = screen.getByRole('slider', { name });
      expect(slider).toHaveAttribute('aria-valuetext', value);
      expect(slider).toHaveAttribute('step', '0.05');
    }
  });

  it('cada barra cambia su canal, se guarda y avisa a la música', () => {
    const heard = vi.fn();
    window.addEventListener(MIXER_EVENT, heard);
    render(<AudioMixer soundOn onToggleSound={() => undefined} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Music' }), { target: { value: '0.2' } });
    expect(loadAudioPrefs().music).toBeCloseTo(0.2);
    expect(screen.getByRole('slider', { name: 'Music' })).toHaveAttribute('aria-valuetext', '20 %');
    expect(loadAudioPrefs().sfx).toBeCloseTo(0.7); // las demás no cambian
    expect(heard).toHaveBeenCalled();
    window.removeEventListener(MIXER_EVENT, heard);
  });

  it('"Reset levels" vuelve a los valores iniciales y el interruptor apaga la música', () => {
    render(<AudioMixer soundOn onToggleSound={() => undefined} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Voice' }), { target: { value: '0.3' } });
    fireEvent.click(screen.getByRole('switch', { name: /Music/ }));
    expect(loadAudioPrefs().musicOn).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Reset levels' }));
    expect(loadAudioPrefs().voice).toBe(1);
    expect(loadAudioPrefs().musicOn).toBe(false); // restablecer niveles no toca los interruptores
  });

  it('el interruptor general pide activar o apagar el sonido', () => {
    const onToggle = vi.fn();
    render(<AudioMixer soundOn={false} onToggleSound={onToggle} />);
    fireEvent.click(screen.getByRole('switch', { name: /Sound/ }));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('las barras de la versión anterior no se heredan, pero la velocidad de la voz sí', () => {
    localStorage.setItem(
      'ultima-senal:audio',
      JSON.stringify({ ambience: 1, sfx: 1, voice: 0.2, narrationRate: 1.2 }),
    );
    expect(loadAudioPrefs()).toMatchObject({
      ambience: 0.4,
      voice: 1,
      music: 0.5,
      narrationRate: 1.2,
    });
  });
});

describe('música generativa', () => {
  it('hay un tema por acto con cuatro acordes en MIDI y su escala', () => {
    expect(Object.keys(THEMES)).toEqual([
      'prologue',
      'moon',
      'mars',
      'smallBodies',
      'deepSpace',
      'epilogue',
    ]);
    for (const theme of Object.values(THEMES)) {
      expect(theme.chords).toHaveLength(4);
      expect(theme.chordSeconds).toBeGreaterThanOrEqual(7);
      for (const note of [...theme.chords.flat(), ...theme.scale]) {
        expect(Number.isInteger(note) && note >= 24 && note <= 84).toBe(true);
      }
    }
  });

  it('en "La última señal" la música casi desaparece y en "El legado" crece', () => {
    expect(INTENSITY.lastSignal).toBe(Math.min(...Object.values(INTENSITY)));
    expect(INTENSITY.legacy).toBe(Math.max(...Object.values(INTENSITY)));
    expect(INTENSITY.work).toBeLessThan(INTENSITY.journey);
  });

  it('sin sonido activado no arranca el planificador ni crea voces', () => {
    MusicEngine.setTheme('moon');
    MusicEngine.sync();
    expect(MusicEngine.running).toBe(false);
    expect(MusicEngine.activeVoices).toBe(0);
    MusicEngine.setTheme(null);
  });
});
