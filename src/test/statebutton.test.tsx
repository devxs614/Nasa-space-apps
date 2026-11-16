import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StateButton } from '../components/ui/StateButton';

const labels = { idle: 'Encender motor iónico', on: 'Apagar motor iónico' };

describe('StateButton', () => {
  it('la etiqueta visible cambia con el estado y todas ocupan la misma celda', () => {
    const { rerender, container } = render(
      <StateButton state="idle" labels={labels} onPress={() => undefined} />,
    );
    const visible = () =>
      [...container.querySelectorAll('button > span')]
        .filter((s) => (s as HTMLElement).style.visibility === 'visible')
        .map((s) => s.textContent);
    expect(visible()).toEqual(['Encender motor iónico']);
    expect(screen.getByRole('button', { name: 'Encender motor iónico' })).toBeInTheDocument();
    rerender(<StateButton state="on" labels={labels} onPress={() => undefined} pressed />);
    expect(visible()).toEqual(['Apagar motor iónico']);
    // El ancho no salta: las dos etiquetas siguen en el botón, apiladas en la misma celda.
    const spans = [...container.querySelectorAll('button > span')];
    expect(spans).toHaveLength(2);
    for (const s of spans) expect(s.className).toContain('[grid-area:1/1]');
    expect(screen.getByRole('button', { name: 'Apagar motor iónico' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('deshabilitado muestra el motivo y no ejecuta la acción', () => {
    const onPress = vi.fn();
    render(
      <StateButton
        state="idle"
        labels={labels}
        onPress={onPress}
        disabledReason="Sin combustible"
      />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Sin combustible')).toBeInTheDocument();
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('es un botón principal con texto, nunca vacío', () => {
    render(<StateButton state="idle" labels={labels} onPress={() => undefined} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button.textContent?.trim().length).toBeGreaterThan(0);
  });
});
