import { Component, type ComponentType, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../i18n';
import { lazyPage, loadable } from '../lib/loadable';

/** Una descarga que la prueba resuelve o rechaza a mano. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? <p>límite de error</p> : this.props.children;
  }
}

function Hello({ name = 'Surveyor' }: { name?: string }) {
  return <h1>Hola, {name}</h1>;
}

beforeEach(async () => {
  await i18n.changeLanguage('es');
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

describe('lazyPage', () => {
  it('muestra el aviso de carga y, al llegar, la página con sus props', async () => {
    const d = deferred<ComponentType<{ name?: string }>>();
    const load = vi.fn(() => d.promise);
    const Page = lazyPage(load);
    const { rerender } = render(<Page name="Opportunity" />);
    expect(screen.getByRole('status')).toHaveTextContent('Sintonizando…');
    d.resolve(Hello);
    expect(await screen.findByRole('heading', { name: 'Hola, Opportunity' })).toBeInTheDocument();
    // Ya descargada, se pinta al instante y no se vuelve a pedir.
    rerender(<Page name="Spirit" />);
    expect(screen.getByRole('heading', { name: 'Hola, Spirit' })).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('preload descarga antes de montar: la página aparece sin aviso de carga', async () => {
    const Page = lazyPage(() => Promise.resolve(Hello));
    await Page.preload();
    render(<Page />);
    expect(screen.getByRole('heading', { name: 'Hola, Surveyor' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('si la descarga falla, ofrece reintentar y entonces carga', async () => {
    const user = userEvent.setup();
    const load = vi
      .fn<() => Promise<ComponentType>>()
      .mockRejectedValueOnce(new Error('sin red'))
      .mockResolvedValueOnce(Hello);
    const Page = lazyPage(load);
    render(<Page />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar esta parte');
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));
    expect(await screen.findByRole('heading', { name: 'Hola, Surveyor' })).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });
});

describe('loadable', () => {
  it('muestra el fallback mientras llega y después el componente', async () => {
    const d = deferred<ComponentType<{ name?: string }>>();
    const Piece = loadable(() => d.promise);
    render(<Piece name="Viking" fallback={<p>Preparando…</p>} />);
    expect(screen.getByText('Preparando…')).toBeInTheDocument();
    d.resolve(Hello);
    expect(await screen.findByRole('heading', { name: 'Hola, Viking' })).toBeInTheDocument();
    expect(screen.queryByText('Preparando…')).toBeNull();
  });

  it('sin onError, el fallo llega al límite de error más cercano', async () => {
    const Piece = loadable(() => Promise.reject(new Error('sin red')));
    render(
      <Boundary>
        <Piece fallback={<p>Preparando…</p>} />
      </Boundary>,
    );
    expect(await screen.findByText('límite de error')).toBeInTheDocument();
  });

  it('con onError, avisa y sigue mostrando el fallback', async () => {
    const onError = vi.fn();
    const Piece = loadable(() => Promise.reject(new Error('sin red')), { onError });
    render(<Piece fallback={<p>Preparando…</p>} />);
    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(screen.getByText('Preparando…')).toBeInTheDocument();
  });
});
