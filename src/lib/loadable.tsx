import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteFallback } from '../components/layout/RouteFallback';

/**
 * Componentes en su propio fragmento, sin `React.lazy`.
 *
 * Con `React.lazy`, lo que llega en diferido se monta en un render de baja prioridad que cualquier
 * otra actualización interrumpe y reinicia, y que nunca caduca. La web tiene relojes que se
 * actualizan cada segundo (hora UTC, tiempo de luz): en un equipo lento, donde montar La Travesía
 * tarda más de un segundo, ese render no terminaba nunca y la portada se quedaba en
 * "Sintonizando…". Aquí el componente llega con una actualización normal, que React pinta de una
 * vez y nadie interrumpe.
 */
interface Loader<P extends object> {
  get: () => ComponentType<P> | null;
  preload: () => Promise<void>;
}

function createLoader<P extends object>(load: () => Promise<ComponentType<P>>): Loader<P> {
  let Loaded: ComponentType<P> | null = null;
  let pending: Promise<void> | null = null;
  return {
    get: () => Loaded,
    preload: () => {
      pending ??= load().then(
        (C) => {
          Loaded = C;
        },
        (err: unknown) => {
          pending = null; // permite reintentar
          throw err;
        },
      );
      return pending;
    },
  };
}

/** Devuelve el componente cuando está descargado, o el error si la descarga falló. */
function useLoaded<P extends object>(
  loader: Loader<P>,
  attempt: number,
): { Loaded: ComponentType<P> | null; error: Error | null } {
  const [, setTick] = useState(0);
  const [failure, setFailure] = useState<{ attempt: number; error: Error } | null>(null);
  useEffect(() => {
    if (loader.get()) return;
    let alive = true;
    loader.preload().then(
      () => alive && setTick((n) => n + 1),
      (err: unknown) =>
        alive &&
        setFailure({ attempt, error: err instanceof Error ? err : new Error(String(err)) }),
    );
    return () => {
      alive = false;
    };
  }, [loader, attempt]);
  return { Loaded: loader.get(), error: failure?.attempt === attempt ? failure.error : null };
}

export interface LoadableOptions {
  /**
   * Qué hacer si la descarga falla. Sin esta función, el error se lanza al límite de error más
   * cercano; con ella, se avisa y se sigue mostrando `fallback`.
   */
  onError?: (error: Error) => void;
}

export type Loadable<P extends object> = ((props: P & { fallback?: ReactNode }) => ReactNode) & {
  /** Descarga el componente (una sola vez). Se puede llamar antes de mostrarlo. */
  preload: () => Promise<void>;
};

/** Un componente en diferido; mientras llega se muestra `fallback` (nada, por defecto). */
export function loadable<P extends object = object>(
  load: () => Promise<ComponentType<P>>,
  { onError }: LoadableOptions = {},
): Loadable<P> {
  const loader = createLoader(load);
  function LoadableComponent({ fallback = null, ...props }: P & { fallback?: ReactNode }) {
    const { Loaded, error } = useLoaded(loader, 0);
    useEffect(() => {
      if (error && onError) onError(error);
    }, [error]);
    if (error && !onError) throw error;
    return Loaded ? <Loaded {...(props as unknown as P)} /> : fallback;
  }
  LoadableComponent.preload = loader.preload;
  return LoadableComponent;
}

function LoadFailed({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation('ui');
  return (
    <div
      className="flex min-h-[60svh] flex-col items-center justify-center gap-4 px-4"
      role="alert"
    >
      <p className="text-center text-ink-dim">{t('interaction.loadFailed')}</p>
      <button type="button" className="btn btn-ghost" onClick={onRetry}>
        {t('quiz.retry')}
      </button>
    </div>
  );
}

export type LazyPage<P extends object> = ((props: P) => ReactNode) & {
  preload: () => Promise<void>;
};

/** Una página en diferido: aviso de carga mientras llega y "Intentar de nuevo" si falla la descarga. */
export function lazyPage<P extends object = object>(
  load: () => Promise<ComponentType<P>>,
): LazyPage<P> {
  const loader = createLoader(load);
  function Page(props: P) {
    const [attempt, setAttempt] = useState(0);
    const { Loaded, error } = useLoaded(loader, attempt);
    useEffect(() => {
      if (error) console.error('página', error);
    }, [error]);
    if (Loaded) return <Loaded {...props} />;
    if (error) return <LoadFailed onRetry={() => setAttempt((n) => n + 1)} />;
    return <RouteFallback />;
  }
  Page.preload = loader.preload;
  return Page;
}
