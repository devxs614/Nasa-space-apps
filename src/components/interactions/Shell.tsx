import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface ShellProps {
  done: boolean;
  successText: string;
  live?: string;
  onSeeResult?: () => void;
  children: ReactNode;
  /** Ya no se usan: el título, la etiqueta, "Saltar" y el resultado los pone `InteractionShell`. */
  title?: string;
  goal?: string;
  express?: boolean;
  onSkip?: () => void;
  illustrative?: boolean;
  label?: string;
}

/** Puente entre una actividad anterior al contrato v2 y el shell común. */
export interface LegacyBridge {
  succeed(text: string): void;
  setSeeResult(fn: (() => void) | null): void;
}
export const LegacyContext = createContext<LegacyBridge | null>(null);

/**
 * Cuerpo de una actividad escrita con el contrato de la Parte 13.1. No dibuja cabecera ni botones:
 * avisa al `InteractionShell` cuando la actividad termina y le dice cómo "ver el resultado".
 */
export function Shell({ done, successText, live, onSeeResult, children }: ShellProps) {
  const bridge = useContext(LegacyContext);
  const see = useRef(onSeeResult);
  see.current = onSeeResult;
  useEffect(() => {
    if (!bridge) return;
    bridge.setSeeResult(() => see.current?.());
    return () => bridge.setSeeResult(null);
  }, [bridge]);
  useEffect(() => {
    if (done) bridge?.succeed(successText);
  }, [done, successText, bridge]);
  return (
    <>
      {children}
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </>
  );
}

/** Marca el fin una sola vez y llama a onComplete. */
export function useDone(onComplete: (r: { score?: number; detail?: string }) => void) {
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const cb = useRef(onComplete);
  cb.current = onComplete;
  const finish = useCallback((detail?: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    cb.current({ detail });
  }, []);
  return { done, finish };
}
