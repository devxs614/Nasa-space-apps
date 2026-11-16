import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FastForward, RotateCcw, SkipForward } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { createScope } from '../../audio/scope';
import { fx } from '../../audio/sfx';
import { useAppStore } from '../../state/useAppStore';
import { cx } from '../../lib/cx';
import { LegacyContext, type LegacyBridge } from './Shell';
import type { InteractionApi, InteractionMeta, InteractionProps, RunPhase } from './types';

type Vars = Record<string, string | number>;

export interface InteractionShellProps {
  machineId: InteractionProps['machineId'];
  active: boolean;
  reducedMotion: boolean;
  express?: boolean;
  meta: InteractionMeta;
  Interaction: ComponentType<InteractionProps>;
  /** Revela la tercera tarjeta de "El trabajo" y deja seguir el relato. */
  onDone: (kind: 'success' | 'skip') => void;
}

const noop = () => undefined;
const HINT_MS = 6000;

/**
 * Shell común de las 15 mini-experiencias (corrección A): objetivo y paso siempre a la vista, tarjeta
 * "Cómo se juega", pista a los 6 s sin acción, "Reiniciar" en cualquier momento y un panel de
 * resultado con "Intentar de nuevo". Cada intento monta la actividad desde cero y tiene su propio
 * alcance de sonido, que se apaga al reiniciar, terminar o salir de pantalla (corrección B).
 */
export function InteractionShell({
  machineId,
  active,
  reducedMotion,
  express,
  meta,
  Interaction,
  onDone,
}: InteractionShellProps) {
  const { t } = useTranslation('ui');
  const hotkeysOn = useAppStore((s) => s.hotkeysOn);
  const [runId, setRunId] = useState(0);
  const [phase, setPhaseState] = useState<RunPhase>('intro');
  const [paused, setPaused] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [played, setPlayed] = useState(false);
  const [real, setReal] = useState(false);
  const [step, setStep] = useState<{ n: number; total: number; key: string; vars?: Vars }>({
    n: 1,
    total: meta.steps,
    key: meta.stepKeys[0] ?? '',
  });
  const [hint, setHint] = useState<{ key: string; vars?: Vars; visible: boolean }>({
    key: meta.hintKeys[0] ?? '',
    visible: false,
  });
  const [result, setResult] = useState<string | null>(null);

  const root = useRef<HTMLElement>(null);
  const startBtn = useRef<HTMLButtonElement>(null);
  const idle = useRef<number | undefined>(undefined);
  const seeResult = useRef<(() => void) | null>(null);
  const phaseRef = useRef<RunPhase>('intro');
  const doneCb = useRef(onDone);
  doneCb.current = onDone;
  const tr = useRef(t);
  tr.current = t;

  const setPhase = useCallback((p: RunPhase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  // Un alcance de sonido por intento.
  const sound = useMemo(() => createScope(`${machineId}#${runId}`), [machineId, runId]);
  useEffect(() => {
    sound.revive();
    return () => sound.dispose();
  }, [sound]);

  // Fuera de pantalla: se pausa y calla. Al volver no se reanuda sola: aparece "Reanudar".
  useEffect(() => {
    if (active || phaseRef.current !== 'playing') return;
    sound.stopAll();
    window.clearTimeout(idle.current);
    setPaused(true);
  }, [active, sound]);

  const armHint = useCallback(() => {
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(
      () => setHint((h) => (h.key ? { ...h, visible: true } : h)),
      HINT_MS,
    );
  }, []);
  const touch = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    setHint((h) => (h.visible ? { ...h, visible: false } : h));
    armHint();
  }, [armHint]);
  useEffect(() => () => window.clearTimeout(idle.current), []);

  /** Un solo final por intento: después de ganar o fallar no se admite otro. */
  const finish = useCallback(
    (kind: 'success' | 'fail', text: string | null, quiet = false) => {
      if (phaseRef.current !== 'playing') return;
      window.clearTimeout(idle.current);
      sound.stopLoops();
      if (kind === 'success' && !quiet) sound.play(fx.right);
      setHint((h) => ({ ...h, visible: false }));
      setResult(text);
      setPhase(kind);
      if (kind === 'success') doneCb.current('success');
    },
    [sound, setPhase],
  );

  const api = useMemo<InteractionApi>(
    () => ({
      setStep: (n, total, key, vars) => {
        setStep((s) => ({
          n,
          total: total ?? s.total,
          key: key ?? meta.stepKeys[n - 1] ?? s.key,
          vars,
        }));
        // Cambiar de paso no es una acción del visitante: el contador de la pista sigue corriendo.
        setHint((h) => ({ key: meta.hintKeys[n - 1] ?? '', vars, visible: h.visible }));
      },
      setHint: (key, vars) => setHint({ key, vars, visible: false }),
      touch,
      succeed: (r) =>
        finish(
          'success',
          r?.detail ?? (r?.detailKey ? tr.current(r.detailKey, r.detailVars ?? {}) : null),
          r?.quiet,
        ),
      fail: (key, vars) => finish('fail', tr.current(key, vars ?? {})),
      onSeeResult: (fn) => {
        seeResult.current = fn;
      },
      sound,
    }),
    [sound, touch, finish, meta],
  );
  const legacy = useMemo<LegacyBridge>(
    () => ({
      succeed: (text) => finish('success', text),
      setSeeResult: (fn) => {
        seeResult.current = fn;
      },
    }),
    [finish],
  );

  const start = useCallback(() => {
    setPlayed(true);
    setPhase('playing');
    armHint();
  }, [setPhase, armHint]);

  const restart = useCallback(() => {
    sound.dispose();
    window.clearTimeout(idle.current);
    seeResult.current = null;
    setResult(null);
    setReal(false);
    setPaused(false);
    setPlayed(false);
    setHint({ key: meta.hintKeys[0] ?? '', visible: false });
    setStep({ n: 1, total: meta.steps, key: meta.stepKeys[0] ?? '' });
    setPhase('intro');
    setRunId((r) => r + 1); // key nuevo = la actividad se monta desde cero
  }, [sound, meta, setPhase]);
  // Tras reiniciar, el foco vuelve a "Empezar".
  useEffect(() => {
    if (runId > 0) startBtn.current?.focus({ preventScroll: true });
  }, [runId]);

  const skip = () => {
    sound.stopAll();
    window.clearTimeout(idle.current);
    setHint((h) => ({ ...h, visible: false }));
    setSkipped(true);
    doneCb.current('skip');
  };
  const showResult = () => {
    if (phaseRef.current === 'playing' && seeResult.current) {
      seeResult.current();
      return;
    }
    if (phaseRef.current === 'intro') setPhase('playing');
    finish('success', tr.current(meta.realKey));
  };
  const continueStory = () => {
    doneCb.current('success');
    const el = root.current;
    if (!el) return;
    window.scrollBy({
      top: el.getBoundingClientRect().bottom - 96,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!hotkeysOn || phase === 'intro' || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      restart();
    }
  };

  const title = t(meta.titleKey);
  const ended = phase === 'success' || phase === 'fail';
  const stepText =
    phase === 'playing' && step.key
      ? `${step.total > 1 ? `${t('interaction.step', { n: step.n, total: step.total })} · ` : ''}${t(step.key, step.vars ?? {})}`
      : '';
  const hintText =
    hint.visible && phase === 'playing' && !paused
      ? `${t('interaction.hint')}: ${t(hint.key, hint.vars ?? {})}`
      : '';
  const resultTitle = ended
    ? t(phase === 'success' ? 'interaction.success' : 'interaction.fail')
    : '';
  const live = ended ? `${resultTitle}. ${result ?? ''}` : hintText || stepText;

  return (
    <section
      ref={root}
      className="panel-solid hud-corners p-4"
      aria-label={title}
      data-keys="own"
      data-interaction
      data-phase={phase}
      data-run={runId}
      onKeyDown={onKeyDown}
    >
      <header className="mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-heading text-[length:var(--fs-h3)] font-bold">{title}</h4>
          <Badge tone="info">{t('ix.illustrative')}</Badge>
        </div>
        <p className="mt-2" data-goal>
          <strong className="text-signal">{t('interaction.goal')}:</strong> {t(meta.goalKey)}
        </p>
        {stepText && (
          <p className="mt-1 font-mono text-[0.875rem] text-amber" data-step={step.n}>
            {stepText}
          </p>
        )}
      </header>

      {phase === 'intro' && (
        <div className="rounded-card border border-line p-4" data-howto>
          <h5 className="font-bold">{t('interaction.howTo')}</h5>
          <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
            {(
              [
                ['mouse', meta.controls.mouseKey],
                ['touch', meta.controls.touchKey],
                ['keyboard', meta.controls.keyboardKey],
              ] as const
            ).map(([kind, key]) => (
              <div key={kind} className="contents">
                <dt className="font-mono text-[0.8125rem] text-ink-dim uppercase">
                  {t(`interaction.controls.${kind}`)}
                </dt>
                <dd>{t(key)}</dd>
              </div>
            ))}
          </dl>
          <button
            ref={startBtn}
            type="button"
            className="btn btn-primary mt-4"
            data-variant="primary"
            onClick={start}
          >
            {t('interaction.start')}
          </button>
        </div>
      )}

      {played && phase !== 'intro' && (
        <div
          className={cx((ended || paused) && 'opacity-50')}
          inert={ended || paused}
          onPointerDownCapture={touch}
          onKeyDownCapture={touch}
          data-stage
        >
          <LegacyContext.Provider value={legacy}>
            <Interaction
              key={runId}
              machineId={machineId}
              active={active && phase === 'playing' && !paused}
              reducedMotion={reducedMotion}
              api={api}
              express={express}
              onComplete={noop}
              onSkip={noop}
            />
          </LegacyContext.Provider>
        </div>
      )}

      {paused && phase === 'playing' && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-card border border-line p-3">
          <p className="mr-auto">{t('interaction.paused')}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            data-variant="primary"
            onClick={() => {
              setPaused(false);
              armHint();
            }}
          >
            {t('interaction.resume')}
          </button>
        </div>
      )}

      {hintText && (
        <p className="mt-3 rounded-chip border border-amber/50 px-3 py-2 text-amber" data-hint>
          {hintText}
        </p>
      )}

      {ended && (
        <div
          className={cx(
            'mt-4 rounded-card border p-4',
            phase === 'success' ? 'border-phosphor/60' : 'border-amber/60',
          )}
          data-result={phase}
        >
          <p
            className={cx(
              'font-heading text-[length:var(--fs-h3)] font-bold',
              phase === 'success' ? 'text-phosphor' : 'text-amber',
            )}
          >
            {resultTitle}
          </p>
          {result && <p className="mt-1">{result}</p>}
          {real && phase === 'fail' && <p className="mt-2 text-ink-dim">{t(meta.realKey)}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {phase === 'fail' ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-variant="primary"
                  onClick={restart}
                >
                  {t('interaction.tryAgain')}
                </button>
                {!real && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setReal(true);
                      doneCb.current('skip');
                    }}
                  >
                    {t('interaction.real')}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-variant="primary"
                  onClick={continueStory}
                >
                  {t('interaction.continue')}
                </button>
                <button type="button" className="btn btn-ghost" onClick={restart}>
                  {t('interaction.playAgain')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!ended && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
          {phase === 'playing' && (
            <button type="button" className="btn btn-subtle btn-sm" onClick={restart}>
              <RotateCcw size={16} aria-hidden="true" />
              {t('interaction.restart')}
            </button>
          )}
          {express && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={showResult}>
              <FastForward size={16} aria-hidden="true" />
              {t('interaction.seeResult')}
            </button>
          )}
          {!skipped && (
            <button type="button" className="btn btn-subtle btn-sm" onClick={skip}>
              <SkipForward size={16} aria-hidden="true" />
              {t('interaction.skip')}
            </button>
          )}
        </div>
      )}

      <p className="sr-only" aria-live="polite" data-live>
        {live}
      </p>
    </section>
  );
}
