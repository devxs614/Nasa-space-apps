import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import '../i18n';
import i18n from '../i18n';
import { SourceBadge } from '../components/ui/SourceBadge';
import { FactCard } from '../components/chapter/FactCard';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { useAppStore } from '../state/useAppStore';
import { useUiStore } from '../state/useUiStore';
import { useHtmlAttributes } from '../hooks/useHtmlAttributes';
import type { Fact } from '../data/types';

beforeEach(async () => {
  await i18n.changeLanguage('es');
  useAppStore.setState({ locale: 'es', highContrast: false, textScale: 1 });
});

describe('SourceBadge', () => {
  it('se abre con Enter, lista las fuentes y se cierra con Esc devolviendo el foco', async () => {
    const user = userEvent.setup();
    render(<SourceBadge sourceIds={['nasa-surveyor3', 'nssdca-surveyor']} />);
    const btn = screen.getByRole('button', { name: /Dato verificado/ });
    btn.focus();
    await user.keyboard('{Enter}');
    const dlg = await screen.findByRole('dialog', { name: 'Fuentes de este dato' });
    const links = dlg.querySelectorAll('a[href^="https://"]');
    expect(links.length).toBe(2);
    expect(links[0]?.getAttribute('rel')).toContain('noopener');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(btn);
  });
});

describe('FactCard', () => {
  it('no renderiza datos pendientes', () => {
    const f: Fact = {
      id: 'x',
      label: { es: 'X', en: 'X' },
      value: 1,
      sourceIds: ['nasa-mer'],
      pending: true,
    };
    const { container } = render(<FactCard fact={f} />);
    expect(container.textContent).toBe('');
  });
  it('muestra el valor con unidad y la fuente', () => {
    const f: Fact = {
      id: 'd',
      label: { es: 'Recorrido', en: 'Distance' },
      value: 45.16,
      unit: 'km',
      sourceIds: ['nasa-mer'],
    };
    render(<FactCard fact={f} />);
    expect(screen.getByText('45,16 km')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dato verificado/ })).toBeInTheDocument();
  });
});

function Harness() {
  useHtmlAttributes();
  return <SettingsPanel />;
}

describe('SettingsPanel', () => {
  it('alto contraste escribe data-contrast y el tamaño de texto cambia --text-scale', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Harness />
      </MemoryRouter>,
    );
    act(() => useUiStore.getState().openSettings('visual'));
    const contrast = await screen.findByRole('switch', { name: 'Alto contraste' });
    await user.click(contrast);
    expect(document.documentElement.dataset.contrast).toBe('high');
    fireEvent.click(screen.getByLabelText('130 %'));
    expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('1.3');
  });
});
