import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { Toggle } from '../ui/Toggle';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { formatNumber } from '../../lib/format';
import { playSfx } from '../../audio/play';
import { cx } from '../../lib/cx';

/** Valores ilustrativos: altura inicial (0–100), velocidad inicial y límite de un toque suave, en km/h. */
const H0 = 100;
const V0 = 4;
const SAFE_KMH = 7;
/** Tope de la escala del velocímetro. */
const V_SCALE = 20;

/** 12. NEAR Shoemaker — "Aterriza sin manual": frenar a tiempo para tocar a 7 km/h o menos. */
export function NearInteraction({
  active,
  express,
  reducedMotion,
  onComplete,
  onSkip,
}: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const setFx = useJourneyStore((s) => s.setFx);
  const { done, finish } = useDone(onComplete);
  const [running, setRunning] = useState(false);
  const [state, setState] = useState({ h: H0, v: V0 });
  const [contact, setContact] = useState<number | null>(null);
  const [assist, setAssist] = useState(false);
  const [firing, setFiring] = useState(false);
  // La simulación vive en una ref: el bucle no depende de cuándo procese React cada actualización.
  const sim = useRef({ h: H0, v: V0 });
  const braking = useRef(false);
  const ended = useRef(true);

  const brake = useCallback((on: boolean) => {
    braking.current = on;
    setFiring(on);
  }, []);

  /** El contacto ocurre una sola vez por intento: para el bucle y suena un único efecto. */
  const touchdown = useCallback(
    (v: number) => {
      if (ended.current) return;
      ended.current = true;
      brake(false);
      setRunning(false);
      setContact(v);
      if (v <= SAFE_KMH) {
        playSfx('thud');
        finish();
      } else {
        playSfx('gentle');
      }
    },
    [brake, finish],
  );

  const start = () => {
    sim.current = { h: H0, v: V0 };
    ended.current = false;
    brake(false);
    setContact(null);
    setState({ h: H0, v: V0 });
    setRunning(true);
  };

  useEffect(() => () => setFx('dig', 0), [setFx]);
  useEffect(() => {
    if (!running || !active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * (reducedMotion ? 3 : 1);
      last = now;
      const s = sim.current;
      const slowing = braking.current || (assist && s.v > 5.5);
      const v = Math.max(0.5, s.v + 2.4 * dt - (slowing ? 6 * dt : 0));
      const h = Math.max(0, s.h - v * dt * 2.2);
      sim.current = { h, v };
      setState({ h, v });
      if (h <= 0) {
        touchdown(v); // no se pide otro fotograma
        return;
      }
      setFx('dig', 1 - h / H0);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, active, assist, reducedMotion, setFx, touchdown]);

  // Soltar fuera del botón, cambiar de pestaña o salir de pantalla también apaga los propulsores.
  useEffect(() => {
    if (!running) return;
    const off = () => brake(false);
    window.addEventListener('pointerup', off);
    window.addEventListener('blur', off);
    document.addEventListener('visibilitychange', off);
    return () => {
      window.removeEventListener('pointerup', off);
      window.removeEventListener('blur', off);
      document.removeEventListener('visibilitychange', off);
    };
  }, [running, brake]);
  useEffect(() => {
    if (!active) brake(false);
  }, [active, brake]);

  const speed = (v: number) => formatNumber(v, locale, 1, 1);
  const result =
    contact === null
      ? null
      : contact <= SAFE_KMH
        ? t('ix.near.win', { speed: speed(contact) })
        : t('ix.near.fail', { speed: speed(contact) });
  const step = !running ? null : state.h > H0 / 2 ? t('ix.near.step1') : t('ix.near.step2');
  const safe = state.v <= SAFE_KMH;

  return (
    <Shell
      title={t('ix.near.title')}
      goal={t('ix.near.goal')}
      done={done}
      successText={t('ix.near.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        ended.current = true;
        brake(false);
        setRunning(false);
        setContact(6.4);
        setState({ h: 0, v: 6.4 });
        finish();
      }}
      label={t('ix.near.label')}
      live={result ?? step ?? undefined}
    >
      <div className="ix-stage relative h-48" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-8 rounded-t-[50%] bg-[#8a7460]" />
        <span
          className="absolute left-1/2 h-5 w-5 -translate-x-1/2 bg-[#d4a64a]"
          style={{ bottom: `${32 + state.h * 1.3}px` }}
        />
        {firing && running && (
          <span
            className="absolute left-1/2 h-3 w-2 -translate-x-1/2 rounded-b-full bg-signal"
            style={{ bottom: `${20 + state.h * 1.3}px` }}
          />
        )}
      </div>
      <p className="mt-2 font-mono text-[0.875rem]">
        {t('ix.near.speed')}:{' '}
        <span
          className={cx('tabular', safe ? 'text-phosphor' : 'text-amber')}
          data-testid="near-speed"
        >
          {speed(state.v)} km/h
        </span>
      </p>
      {/* Velocímetro: franja verde de 0 a 7 km/h y una marca en la velocidad actual. */}
      <div className="relative mt-1 h-3 rounded-full bg-white/10" aria-hidden="true">
        <span
          className="absolute inset-y-0 left-0 rounded-l-full bg-phosphor/40"
          style={{ width: `${(SAFE_KMH / V_SCALE) * 100}%` }}
        />
        <span
          className={cx('absolute -inset-y-1 w-1 rounded-full', safe ? 'bg-phosphor' : 'bg-amber')}
          style={{ left: `${Math.min(1, state.v / V_SCALE) * 100}%` }}
        />
      </div>
      <p className="mt-1 font-mono text-[0.75rem] text-ink-dim">{t('ix.near.zone')}</p>
      {step && <p className="mt-2 font-bold">{step}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" disabled={running} onClick={start}>
          {contact === null
            ? t('ix.near.start')
            : contact <= SAFE_KMH
              ? t('interaction.playAgain')
              : t('interaction.tryAgain')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={!running}
          onPointerDown={() => brake(true)}
          onPointerUp={() => brake(false)}
          onPointerLeave={() => brake(false)}
          onPointerCancel={() => brake(false)}
          onBlur={() => brake(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') brake(true);
          }}
          onKeyUp={() => brake(false)}
        >
          {firing && running ? t('ix.near.firing') : t('ix.near.hold')}
        </button>
      </div>
      {result && (
        <p className="mt-2" data-testid="near-result">
          {result}
        </p>
      )}
      <Toggle checked={assist} onChange={setAssist} label={t('interaction.noPressure')} />
    </Shell>
  );
}
