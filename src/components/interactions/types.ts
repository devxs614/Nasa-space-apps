import type { MachineId } from '../../data/types';
import type { SoundScope } from '../../audio/scope';

export type RunPhase = 'intro' | 'playing' | 'success' | 'fail';

export interface InteractionResult {
  score?: number;
  /** Clave i18n (namespace `ui`) de la frase del resultado, con sus variables. */
  detailKey?: string;
  detailVars?: Record<string, string>;
  /** Frase ya traducida (actividades anteriores al contrato v2). */
  detail?: string;
  /** La actividad ya hizo sonar su propio final: el shell no añade el suyo. */
  quiet?: boolean;
}

/** Lo que el shell común ofrece a cada mini-experiencia (corrección A del prompt v1.1). */
export interface InteractionApi {
  /** Paso actual (desde 1). Sin clave, la instrucción y la pista salen de `META`. */
  setStep(
    step: number,
    total?: number,
    instructionKey?: string,
    vars?: Record<string, string | number>,
  ): void;
  /** Pista concreta para el paso actual; la muestra el shell tras 6 s sin acción. */
  setHint(hintKey: string, vars?: Record<string, string | number>): void;
  /** Marca actividad del visitante (reinicia el contador de la pista). */
  touch(): void;
  succeed(result?: InteractionResult): void;
  fail(reasonKey: string, reasonVars?: Record<string, string>): void;
  /** Qué hace "Ver resultado" en el recorrido exprés; sin registrar, enseña lo que pasó de verdad. */
  onSeeResult(fn: (() => void) | null): void;
  /** Todos los sonidos de este intento. El shell los para al reiniciar, terminar o salir de pantalla. */
  sound: SoundScope;
}

export interface InteractionProps {
  machineId: MachineId;
  active: boolean; // false fuera de pantalla o en pausa: el bucle de juego se detiene
  reducedMotion: boolean;
  api: InteractionApi;
  express?: boolean;
  /** @deprecated El final lo decide el shell: usar `api.succeed` o el `Shell` de compatibilidad. */
  onComplete: (result: { score?: number; detail?: string }) => void;
  /** @deprecated "Saltar" lo pone el shell. */
  onSkip: () => void;
}

export interface InteractionMeta {
  titleKey: string;
  goalKey: string;
  controls: { mouseKey: string; touchKey: string; keyboardKey: string };
  steps: number;
  /** Instrucción y pista por defecto de cada paso (índice = paso − 1). */
  stepKeys: string[];
  hintKeys: string[];
  /** Lo que pasó de verdad: se enseña tras un fallo o con "Ver resultado". */
  realKey: string;
}
