import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import i18n from '../i18n';
import { HoldButton } from '../components/ui/HoldButton';
import { LightTimeCounter } from '../components/hud/LightTimeCounter';
import { Patch } from '../components/passport/Patch';
import { MACHINES_BY_ID } from '../data/machines';
import { useAppStore } from '../state/useAppStore';

beforeEach(async () => {
  await i18n.changeLanguage('es');
  useAppStore.setState({ locale: 'es', proMode: false });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('HoldButton', () => {
  it('Enter envía una sola vez (sin repetición al mantener)', () => {
    const onSend = vi.fn();
    render(<HoldButton onSend={onSend} label="Mantén pulsado" srLabel="Enviar señal a Surveyor" />);
    const btn = screen.getByRole('button', { name: /Enviar señal a Surveyor/ });
    fireEvent.keyDown(btn, { key: 'Enter' });
    fireEvent.keyDown(btn, { key: 'Enter', repeat: true });
    expect(onSend).toHaveBeenCalledTimes(1);
  });
  it('mantener 1,2 s envía y soltar a los 0,5 s no envía', () => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout'],
    });
    const onSend = vi.fn();
    render(<HoldButton onSend={onSend} label="Mantén pulsado" srLabel="x" />);
    const btn = screen.getByRole('button');
    fireEvent.pointerDown(btn, { button: 0, pointerId: 1 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.pointerUp(btn, { pointerId: 1 });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.pointerDown(btn, { button: 0, pointerId: 1 });
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(onSend).toHaveBeenCalledTimes(1);
  });
  it('con instant, un clic envía', () => {
    const onSend = vi.fn();
    render(<HoldButton onSend={onSend} label="Pulsa" srLabel="x" instant />);
    fireEvent.pointerDown(screen.getByRole('button'), { button: 0, pointerId: 1 });
    expect(onSend).toHaveBeenCalledTimes(1);
  });
});

describe('LightTimeCounter', () => {
  it('Kepler muestra "Transmisor apagado"', () => {
    render(<LightTimeCounter machine={MACHINES_BY_ID.kepler} />);
    expect(screen.getByText('Transmisor apagado')).toBeInTheDocument();
  });
  it('Ceres muestra un rango', () => {
    render(<LightTimeCounter machine={MACHINES_BY_ID.dawn} />);
    expect(screen.getByText(/Entre 14 min 33 s y 31 min 28 s/)).toBeInTheDocument();
  });
  it('la Luna muestra 1,28 s en tiempo real', () => {
    render(<LightTimeCounter machine={MACHINES_BY_ID.surveyor} />);
    expect(screen.getByText('1,28 s')).toBeInTheDocument();
    expect(screen.getByText('Tiempo real')).toBeInTheDocument();
  });
});

describe('Patch', () => {
  it('tiene role img, título y estado', () => {
    const { rerender } = render(<Patch machine={MACHINES_BY_ID.opportunity} state="locked" />);
    const img = screen.getByRole('img', { name: /Parche de Opportunity/ });
    expect(img).toHaveAccessibleName(/Bloqueado: completa el capítulo 8/);
    rerender(<Patch machine={MACHINES_BY_ID.opportunity} state="earned" />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/Conseguido/);
    rerender(<Patch machine={MACHINES_BY_ID.opportunity} state="gold" />);
    expect(screen.getByRole('img').querySelector('[stroke="var(--amber)"]')).not.toBeNull();
  });
});
