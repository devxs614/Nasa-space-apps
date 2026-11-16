import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import i18n from '../i18n';
import { NearInteraction } from '../components/interactions/NearInteraction';

const { playSfx } = vi.hoisted(() => ({ playSfx: vi.fn() }));
vi.mock('../audio/play', () => ({ playSfx }));

/** Deja caer la nave sin frenar: con los valores ilustrativos toca el suelo en menos de 6 s. */
function fall(seconds: number) {
  for (let ms = 0; ms < seconds * 1000; ms += 16) {
    act(() => {
      vi.advanceTimersByTime(16);
    });
  }
}

describe('NEAR: "Land without a manual"', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    playSfx.mockClear();
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout'],
    });
  });
  afterEach(() => vi.useRealTimers());

  const mount = () =>
    render(
      <NearInteraction
        machineId="near"
        active
        reducedMotion={false}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />,
    );

  it('muestra el objetivo antes de empezar', () => {
    mount();
    expect(screen.getByTestId('interaction-goal')).toHaveTextContent(
      'Goal: Touch down on Eros at 7 km/h or slower.',
    );
  });

  it('sin frenar falla una sola vez, con un único sonido, y deja reintentar', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Start the descent' }));
    fall(8);
    expect(screen.getByTestId('near-result')).toHaveTextContent(/too fast for a gentle landing/);
    const sounds = playSfx.mock.calls.length;
    expect(sounds).toBe(1);

    // Tras el contacto no queda ningún bucle vivo: pasan 5 s y no suena nada más.
    fall(5);
    expect(playSfx).toHaveBeenCalledTimes(sounds);

    // Se puede volver a intentar sin recargar ni hacer scroll, tres veces seguidas.
    for (let attempt = 0; attempt < 3; attempt++) {
      const again = screen.getByRole('button', { name: 'Try again' });
      expect(again).toBeEnabled();
      fireEvent.click(again);
      expect(screen.queryByTestId('near-result')).toBeNull();
      fall(8);
      expect(screen.getByTestId('near-result')).toHaveTextContent(/too fast/);
    }
    expect(playSfx).toHaveBeenCalledTimes(sounds + 3);
  });

  it('frenando con el teclado se toca a 7 km/h o menos y se puede jugar otra vez', () => {
    const onComplete = vi.fn();
    render(
      <NearInteraction
        machineId="near"
        active
        reducedMotion={false}
        onComplete={onComplete}
        onSkip={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Start the descent' }));
    const thrusters = screen.getByRole('button', { name: 'Hold to fire thrusters' });
    fireEvent.keyDown(thrusters, { key: ' ' });
    expect(screen.getByRole('button', { name: 'Firing, release to stop' })).toBeInTheDocument();
    // Frena solo cuando la velocidad pasa de 6 km/h, como haría alguien que mira el velocímetro.
    for (let ms = 0; ms < 60_000 && !screen.queryByTestId('near-result'); ms += 16) {
      const kmh = parseFloat(screen.getByTestId('near-speed').textContent ?? '');
      if (kmh > 6) fireEvent.keyDown(thrusters, { key: ' ' });
      else fireEvent.keyUp(thrusters, { key: ' ' });
      fall(0.016);
    }
    expect(screen.getByTestId('near-result')).toHaveTextContent(/NEAR did it at about 6\.4 km\/h/);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Play again' })).toBeEnabled();
  });

  it('fuera de pantalla el descenso se detiene', () => {
    const { rerender } = mount();
    fireEvent.click(screen.getByRole('button', { name: 'Start the descent' }));
    fall(1);
    rerender(
      <NearInteraction
        machineId="near"
        active={false}
        reducedMotion={false}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    fall(10);
    expect(screen.queryByTestId('near-result')).toBeNull();
    expect(playSfx).not.toHaveBeenCalled();
  });
});
