import { useId, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, HelpCircle, RotateCcw, X } from 'lucide-react';
import type { Machine } from '../../data/types';
import { quizzesFor } from '../../data/quizzes';
import { useAppStore } from '../../state/useAppStore';
import { createRng, shuffle } from '../../lib/rng';
import { SourceBadge } from '../ui/SourceBadge';
import { Patch, patchState } from '../passport/Patch';
import { announce } from '../layout/LiveRegion';
import { playSfx } from '../../audio/play';
import { cx } from '../../lib/cx';

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;
type OptionKey = (typeof OPTION_KEYS)[number];
type Phase = 'intro' | 'asking' | 'feedback' | 'result';

export interface QuizProps {
  machine: Machine;
  /** Semilla del barajado; por defecto, la hora actual (Parte 14.9). */
  seed?: number;
}

/**
 * Quiz "¿Te acuerdas?" (Parte 14.9): tres preguntas, una por pantalla, con radios nativos.
 * En quiz.json la correcta es siempre `a`; el orden se baraja en cada intento.
 */
export function Quiz({ machine, seed }: QuizProps) {
  const { t } = useTranslation(['ui', 'quiz']);
  const uid = useId();
  const locale = useAppStore((s) => s.locale);
  const classroom = useAppStore((s) => s.classroomMode);
  const completed = useAppStore((s) => s.progress[machine.id]?.completed ?? false);
  const best = useAppStore((s) => s.progress[machine.id]?.bestQuiz ?? 0);
  const saveQuiz = useAppStore((s) => s.saveQuiz);
  const items = useMemo(() => quizzesFor(machine.id), [machine.id]);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [score, setScore] = useState(0);
  const [missing, setMissing] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Un orden por intento: se baraja al empezar y al "Intentar de nuevo".
  const orders = useMemo(() => {
    const rand = createRng((seed ?? Date.now()) + attempt * 7919);
    return items.map(() => shuffle(OPTION_KEYS, rand));
  }, [items, attempt, seed]);

  const item = items[index];
  const total = items.length;
  if (!item) return null;
  const qKey = item.id.split('.')[1] ?? 'q1';
  const text = (k: string) => t(`quiz:${machine.id}.${qKey}.${k}`);
  const order = orders[index] ?? OPTION_KEYS;
  const right = picked === 'a';
  const name = machine.name[locale];

  const start = () => {
    setAttempt((n) => n + 1);
    setIndex(0);
    setScore(0);
    setPicked(null);
    setMissing(false);
    setRevealed(false);
    setPhase('asking');
  };

  const check = (e: FormEvent) => {
    e.preventDefault();
    if (phase !== 'asking') return;
    if (!picked) {
      setMissing(true);
      announce(t('quiz.pickFirst'));
      return;
    }
    const ok = picked === 'a';
    if (ok) setScore((s) => s + 1);
    playSfx(ok ? 'right' : 'gentle');
    setPhase('feedback');
    announce(
      `${ok ? t('quiz.correct') : t('quiz.wrong', { answer: text('a') })} ${text('explain')}`,
    );
  };

  const reveal = () => {
    setRevealed(true);
    setPhase('feedback');
    announce(`${t('quiz.revealed', { answer: text('a') })} ${text('explain')}`);
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setPicked(null);
      setMissing(false);
      setRevealed(false);
      setPhase('asking');
      return;
    }
    if (!classroom) saveQuiz(machine.id, score);
    setPhase('result');
    announce(t('quiz.result', { score, total }));
  };

  return (
    <section
      aria-labelledby={`${uid}-title`}
      data-quiz={machine.id}
      data-quiz-phase={phase}
      className={cx('panel-solid hud-corners p-5', classroom && 'text-[1.15em]')}
    >
      <h4
        id={`${uid}-title`}
        className="flex items-center gap-2 font-heading text-[length:var(--fs-h3)] font-bold"
      >
        <HelpCircle size={22} className="text-signal" aria-hidden="true" />
        {t('quiz.title')}
      </h4>

      {phase === 'intro' && (
        <div className="mt-3 space-y-3">
          <p>{t('quiz.intro', { name })}</p>
          <p className="text-[0.9375rem] text-ink-dim">
            {classroom ? t('quiz.classroom') : t('quiz.goldHint')}
            {!classroom && best > 0 && <> · {t('quiz.best', { n: best })}</>}
          </p>
          <button type="button" className="btn btn-ghost" onClick={start}>
            {t('quiz.start')}
          </button>
        </div>
      )}

      {(phase === 'asking' || phase === 'feedback') && (
        <form className="mt-3" onSubmit={check} noValidate>
          <p className="font-mono text-[0.8125rem] tracking-wider text-ink-dim uppercase">
            {t('quiz.question', { n: index + 1, total })}
          </p>
          <fieldset className="mt-2" disabled={phase === 'feedback'}>
            <legend className="mb-3 text-[1.15em] font-bold">{text('prompt')}</legend>
            <div className="grid gap-2">
              {order.map((k) => {
                const isPicked = picked === k;
                const showRight = phase === 'feedback' && k === 'a';
                const showWrong = phase === 'feedback' && isPicked && k !== 'a';
                return (
                  <label
                    key={k}
                    className={cx(
                      'flex min-h-11 cursor-pointer items-center gap-3 rounded-card border px-3 py-2',
                      classroom && 'min-h-14 py-3',
                      showRight
                        ? 'border-phosphor text-phosphor'
                        : showWrong
                          ? 'border-alert text-alert'
                          : isPicked
                            ? 'border-signal bg-signal/10'
                            : 'border-line-strong',
                    )}
                  >
                    <input
                      type="radio"
                      name={`${uid}-${item.id}`}
                      value={k}
                      checked={isPicked}
                      onChange={() => {
                        setPicked(k);
                        setMissing(false);
                      }}
                      className="h-5 w-5 shrink-0 accent-[var(--signal)]"
                    />
                    <span className="flex-1">{text(k)}</span>
                    {showRight && <Check size={18} aria-hidden="true" />}
                    {showWrong && <X size={18} aria-hidden="true" />}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {phase === 'asking' && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="submit" className="btn btn-primary" aria-describedby={`${uid}-hint`}>
                {t('quiz.check')}
              </button>
              {classroom && (
                <button type="button" className="btn btn-ghost" onClick={reveal}>
                  {t('quiz.reveal')}
                </button>
              )}
              <p
                id={`${uid}-hint`}
                className={cx('text-[0.9375rem]', missing ? 'text-amber' : 'sr-only')}
              >
                {t('quiz.pickFirst')}
              </p>
            </div>
          )}

          {phase === 'feedback' && (
            <div className="mt-4 space-y-3" data-quiz-feedback={revealed ? 'revealed' : right}>
              <p
                className={cx(
                  'flex items-start gap-2 font-bold',
                  revealed ? 'text-ink' : right ? 'text-phosphor' : 'text-alert',
                )}
              >
                {revealed ? null : right ? (
                  <Check size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                ) : (
                  <X size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {revealed
                    ? t('quiz.revealed', { answer: text('a') })
                    : right
                      ? `✔ ${t('quiz.correct')}`
                      : `✘ ${t('quiz.wrong', { answer: text('a') })}`}
                </span>
              </p>
              <p>{text('explain')}</p>
              <p className="flex flex-wrap items-center gap-2 text-[0.9375rem] text-ink-dim">
                <span>{t('quiz.seeFact')}:</span>
                <SourceBadge sourceIds={item.sourceIds} />
              </p>
              <button type="button" className="btn btn-primary" onClick={next} autoFocus>
                {index + 1 < total ? t('quiz.next') : t('quiz.finish')}
              </button>
            </div>
          )}
        </form>
      )}

      {phase === 'result' && (
        <div className="mt-3 flex flex-wrap items-center gap-5" data-quiz-score={score}>
          <Patch
            machine={machine}
            state={patchState(completed, classroom ? best : Math.max(best, score))}
            size={104}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="font-heading text-[length:var(--fs-h3)] font-bold text-signal">
              {t('quiz.result', { score, total })}
            </p>
            <p className="text-ink-dim">
              {classroom
                ? t('quiz.classroom')
                : score === total
                  ? completed
                    ? t('quiz.gold')
                    : t('quiz.goldNeedPatch')
                  : t('quiz.goldHint')}
            </p>
            <button type="button" className="btn btn-ghost" onClick={start}>
              <RotateCcw size={18} aria-hidden="true" />
              {t('quiz.retry')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
