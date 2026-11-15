import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import i18n from '../i18n';
import { ThreeNotices } from '../components/layout/ThreeNotices';
import { useUiStore } from '../state/useUiStore';
import { useAppStore } from '../state/useAppStore';
import { useToastStore } from '../components/ui/Toast';

beforeEach(async () => {
  await i18n.changeLanguage('es');
  useUiStore.setState({ liteBanner: false, liteAsk: false, threeFailed: false, contextLosses: 0 });
  useAppStore.setState({ locale: 'es', liteMode: false, liteDecided: false });
  useToastStore.setState({ items: [] });
});

describe('avisos del 3D', () => {
  it('no muestra nada si todo va bien', () => {
    const { container } = render(<ThreeNotices />);
    expect(container).toBeEmptyDOMElement();
  });

  it('pregunta por el modo ligero y lo activa con «Sí»', () => {
    useUiStore.setState({ liteAsk: true });
    render(<ThreeNotices />);
    expect(screen.getByText('¿Cambiar a modo ligero?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sí' }));
    expect(useAppStore.getState().liteMode).toBe(true);
    expect(useUiStore.getState().liteAsk).toBe(false);
  });

  it('«No, gracias» recuerda la decisión y no activa el modo ligero', () => {
    useUiStore.setState({ liteAsk: true });
    render(<ThreeNotices />);
    fireEvent.click(screen.getByRole('button', { name: 'No, gracias' }));
    expect(useAppStore.getState().liteMode).toBe(false);
    expect(useAppStore.getState().liteDecided).toBe(true);
  });

  it('tras un fallo ofrece reintentar, y tras dos pérdidas también el modo ligero', () => {
    useUiStore.setState({ threeFailed: true, contextLosses: 1 });
    const { rerender } = render(<ThreeNotices />);
    expect(screen.getByRole('button', { name: 'Reintentar 3D' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sí' })).toBeNull();
    act(() => useUiStore.setState({ contextLosses: 2 }));
    rerender(<ThreeNotices />);
    expect(screen.getByText(/se interrumpió dos veces/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar 3D' }));
    expect(useUiStore.getState().threeFailed).toBe(false);
  });

  it('avisa con un toast cuando el modo ligero arranca solo', () => {
    useUiStore.setState({ liteBanner: true });
    render(<ThreeNotices />);
    expect(useToastStore.getState().items[0]?.title).toMatch(/Modo ligero activado/);
    expect(useUiStore.getState().liteBanner).toBe(false);
  });
});
