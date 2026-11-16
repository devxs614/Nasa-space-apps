import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Toggle } from '../ui/Toggle';
import { StateButton } from '../ui/StateButton';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { fx } from '../../audio/sfx';
import { toneLoop } from '../../audio/sonify';
import type { LoopHandle } from '../../audio/scope';
import { cx } from '../../lib/cx';

// Todo es ilustrativo y sin cifras: la aguja va de 0 a 1 y la bajada, de 1 a 0.
const MARKERS = [22, 50, 80]; // posición horizontal de las marcas, en %
const DUNES_FROM = 62; // a partir de aquí el suelo es arena lisa
const GREEN_FROM = 0.78; // "Necesario en Marte"
const EARTH_AT = 0.17; // "Bastaría en la Tierra"
const SPIN_UP = 0.5; // por segundo, manteniendo
const SPIN_DOWN = 0.14;
const FLY_S = 2;
const CRUISE = 0.72; // altura de crucero, de 0 a 1
const V_START = 0.1;
const V_MAX = 0.5;
const V_MIN = 0.045;
const V_GREEN = 0.17; // bajada suave si toca el suelo por debajo
const FALL = 0.11; // la bajada se acelera al soltar
const SLOW = 0.26; // y se frena al mantener

type Label = 'spin' | 'spinning' | 'lifting' | 'slow' | 'slowing';

interface Sim {
  step: 1 | 2 | 3;
  needle: number;
  green: number; // segundos seguidos en la zona verde
  marker: number; // marca que toca (0–2)
  x: number;
  y: number; // altura, de 0 a 1
  fly: { from: number; to: number; t: number } | null;
  v: number; // velocidad de bajada
}

/** 11. Ingenuity — "Vuela en aire fino": acelerar los rotores, tocar tres marcas y aterrizar suave. */
export function IngenuityInteraction({ active, reducedMotion, api }: InteractionProps) {
  const { t } = useTranslation('ui');
  const instant = useAppStore((s) => s.instantSignal);
  const setFx = useJourneyStore((s) => s.setFx);
  const [noPressure, setNoPressure] = useState(false);
  const sim = useRef<Sim>({
    step: 1,
    needle: 0,
    green: 0,
    marker: 0,
    x: 8,
    y: 0,
    fly: null,
    v: V_START,
  });
  const [view, setView] = useState<Sim>(sim.current);
  const [held, setHeld] = useState(false);
  const holding = useRef(false);
  const ended = useRef(false);
  const rotor = useRef<LoopHandle | null>(null);
  const easy = useRef(noPressure);
  easy.current = noPressure;

  const hold = useCallback(
    (on: boolean) => {
      if (ended.current || holding.current === on) return;
      holding.current = on;
      setHeld(on);
      if (on) api.touch();
    },
    [api],
  );

  const reach = useCallback(
    (i: number) => {
      const s = sim.current;
      if (s.step !== 2 || i !== s.marker || s.fly) return;
      api.touch();
      s.fly = { from: s.x, to: MARKERS[i]!, t: reducedMotion ? FLY_S : 0 };
    },
    [api, reducedMotion],
  );

  const land = useCallback(
    (v: number) => {
      if (ended.current) return;
      ended.current = true;
      holding.current = false;
      setHeld(false);
      rotor.current?.stop(200);
      rotor.current = null;
      if (v <= V_GREEN) {
        api.sound.play(fx.thud);
        api.succeed({ detailKey: 'ixm.ingenuity.success', quiet: true });
      } else {
        api.sound.play(fx.gentle);
        api.fail('ixm.ingenuity.fail');
      }
    },
    [api],
  );

  useEffect(() => {
    api.onSeeResult(() => land(0));
    return () => api.onSeeResult(null);
  }, [api, land]);
  useEffect(() => () => setFx('fly', 0), [setFx]);

  // Zumbido de los rotores: existe mientras la actividad está en marcha y su tono sigue a la aguja.
  useEffect(() => {
    if (!active || ended.current) return;
    rotor.current = api.sound.loop(toneLoop, 'sawtooth', 30, 0.0001, 900);
    return () => {
      rotor.current?.stop();
      rotor.current = null;
    };
  }, [active, api]);

  useEffect(() => {
    if (!active || ended.current) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      const on = holding.current;
      if (s.step === 1) {
        s.needle = Math.max(0, Math.min(1, s.needle + (on ? SPIN_UP : -SPIN_DOWN) * dt));
        s.green = s.needle >= GREEN_FROM ? s.green + dt : 0;
        if (s.green >= 0.5) {
          // Despega solo: el botón se suelta y la acción pasa a las marcas.
          s.step = 2;
          holding.current = false;
          setHeld(false);
          api.setStep(2, 3, undefined, { n: 1 });
        }
      } else {
        s.needle = Math.min(1, s.needle + 0.6 * dt); // en vuelo, los rotores siguen arriba
      }
      if (s.step === 2) {
        s.y = Math.min(CRUISE, s.y + 0.5 * dt);
        if (s.fly) {
          s.fly.t += dt;
          const k = Math.min(1, s.fly.t / FLY_S);
          s.x = s.fly.from + (s.fly.to - s.fly.from) * (k * k * (3 - 2 * k));
          if (k >= 1) {
            s.fly = null;
            s.marker += 1;
            api.sound.play(fx.tick);
            if (s.marker >= MARKERS.length) {
              s.step = 3;
              s.v = V_START;
              api.setStep(3);
            } else api.setStep(2, 3, undefined, { n: s.marker + 1 });
          }
        }
      }
      if (s.step === 3) {
        if (easy.current) s.v += (V_GREEN * 0.7 - s.v) * Math.min(1, dt * 3);
        else s.v = Math.max(V_MIN, Math.min(V_MAX, s.v + (on ? -SLOW : FALL) * dt));
        s.y = Math.max(0, s.y - s.v * dt);
      }
      rotor.current?.set('freq', 30 + s.needle * 90);
      rotor.current?.set('level', s.needle > 0.05 ? 0.045 : 0.0001);
      setFx('fly', s.step === 1 ? s.needle * 0.6 : 1);
      setView({ ...s });
      if (s.step === 3 && s.y === 0) {
        land(s.v);
        return; // no se pide otro fotograma
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      holding.current = false;
      setHeld(false);
    };
  }, [active, api, land, setFx]);

  // Alternativa con flechas o WASD en el paso 2: acercarse a la marca también la alcanza.
  const onStageKey = (e: React.KeyboardEvent) => {
    const s = sim.current;
    if (s.step !== 2 || s.fly) return;
    const dir =
      e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A'
          ? -1
          : 0;
    if (!dir) return;
    e.preventDefault();
    s.x = Math.max(4, Math.min(96, s.x + dir * 4));
    if (Math.abs(s.x - MARKERS[s.marker]!) <= 4) reach(s.marker);
  };

  const step = view.step;
  const lifting = step === 1 && view.needle >= GREEN_FROM;
  const label: Label =
    step === 3 ? (held ? 'slowing' : 'slow') : lifting ? 'lifting' : held ? 'spinning' : 'spin';
  const holdProps = instant
    ? {}
    : {
        onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          hold(true);
        },
        onPointerUp: () => hold(false),
        onPointerCancel: () => hold(false),
        onLostPointerCapture: () => hold(false),
        onBlur: () => hold(false),
        onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!e.repeat) hold(true);
          }
        },
        onKeyUp: (e: React.KeyboardEvent<HTMLButtonElement>) => {
          if (e.key === ' ' || e.key === 'Enter') hold(false);
        },
      };
  const navLow = step >= 2 && view.x > DUNES_FROM;
  const vPct = Math.min(100, (view.v / V_MAX) * 100);
  const gentle = view.v <= V_GREEN;

  return (
    <div onKeyDown={onStageKey}>
      <div
        className="ix-stage relative h-44 overflow-hidden"
        role="group"
        aria-label={t('ixm.ingenuity.stage')}
      >
        <div className="absolute inset-x-0 bottom-0 h-6 bg-[#7a4a32]" aria-hidden="true" />
        <div
          className="absolute right-0 bottom-0 h-6 bg-[#c79a6b]"
          style={{ width: `${100 - DUNES_FROM}%` }}
          aria-hidden="true"
        />
        {MARKERS.map((x, i) => {
          const isActive = step === 2 && i === view.marker && !view.fly;
          const reached = i < view.marker || step === 3;
          return (
            <button
              key={x}
              type="button"
              data-marker={i + 1}
              data-active={isActive || undefined}
              disabled={!isActive}
              onClick={() => reach(i)}
              aria-label={
                reached
                  ? t('ixm.ingenuity.markerDone', { n: i + 1 })
                  : t('ixm.ingenuity.marker', { n: i + 1 })
              }
              className={cx(
                'absolute top-3 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-2 font-mono font-bold',
                reached
                  ? 'border-phosphor text-phosphor'
                  : isActive
                    ? 'btn-attention border-signal bg-signal text-void'
                    : 'border-line-strong text-ink-dim',
              )}
              style={{ left: `${x}%` }}
            >
              {i + 1}
            </button>
          );
        })}
        <span
          className="absolute h-3 w-8 -translate-x-1/2 rounded-sm bg-[#d9d2c4]"
          style={{ left: `${view.x}%`, bottom: `${24 + view.y * 96}px` }}
          aria-hidden="true"
        >
          <span
            className="absolute -top-1 left-1/2 h-0.5 -translate-x-1/2 bg-signal"
            style={{ width: `${20 + view.needle * 28}px`, opacity: 0.4 + view.needle * 0.6 }}
          />
        </span>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[0.8125rem] text-ink-dim">{t('ix.ingenuity.rpm')}</p>
          <div
            className="relative mt-1 h-4 rounded-full bg-white/10"
            role="img"
            aria-label={`${t('ix.ingenuity.rpm')}: ${Math.round(view.needle * 100)} %`}
            data-needle={view.needle.toFixed(2)}
          >
            <span
              className="absolute inset-y-0 right-0 rounded-r-full bg-phosphor/35"
              style={{ left: `${GREEN_FROM * 100}%` }}
            />
            <span
              className="absolute inset-y-0 w-0.5 bg-ink-dim"
              style={{ left: `${EARTH_AT * 100}%` }}
            />
            <span
              className={cx(
                'absolute inset-y-0 w-1.5 rounded-full',
                view.needle >= GREEN_FROM ? 'bg-phosphor' : 'bg-amber',
              )}
              style={{ left: `calc(${view.needle * 100}% - 3px)` }}
            />
          </div>
          <p className="mt-1 flex justify-between text-[0.75rem]">
            <span className="text-ink-dim" style={{ marginLeft: `${EARTH_AT * 100 - 8}%` }}>
              {t('ixm.ingenuity.earth')}
            </span>
            <span className="text-phosphor">{t('ixm.ingenuity.marsNeed')}</span>
          </p>
          <p className="mt-1 text-[0.875rem] text-ink-dim">{t('ixm.ingenuity.thin')}</p>
        </div>
        <div>
          {step === 3 ? (
            <>
              <p className="font-mono text-[0.8125rem] text-ink-dim">
                {t('ixm.ingenuity.descent')}
              </p>
              <div
                className="relative mt-1 h-4 rounded-full bg-white/10"
                role="img"
                aria-label={`${t('ixm.ingenuity.descent')}: ${gentle ? t('ixm.ingenuity.gentle') : t('ix.ingenuity.hard')}`}
                data-descent={view.v.toFixed(3)}
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-l-full bg-phosphor/35"
                  style={{ width: `${(V_GREEN / V_MAX) * 100}%` }}
                />
                <span
                  className={cx(
                    'absolute inset-y-0 w-1.5 rounded-full',
                    gentle ? 'bg-phosphor' : 'bg-amber',
                  )}
                  style={{ left: `calc(${vPct}% - 3px)` }}
                />
              </div>
              <p className="mt-1 text-[0.75rem] text-phosphor">{t('ixm.ingenuity.gentle')}</p>
            </>
          ) : (
            <>
              <p className="font-mono text-[0.8125rem] text-ink-dim">{t('ix.ingenuity.nav')}</p>
              <p className={cx('mt-1', navLow ? 'text-amber' : 'text-phosphor')} data-nav>
                {navLow ? t('ixm.ingenuity.navLow') : t('ixm.ingenuity.navOk')}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {step !== 2 && (
          <StateButton<Label>
            state={label}
            labels={{
              spin: t(instant ? 'ixm.ingenuity.tapSpin' : 'ixm.ingenuity.btnSpin'),
              spinning: t(instant ? 'ixm.ingenuity.tapSpinning' : 'ixm.ingenuity.btnSpinning'),
              lifting: t('ixm.ingenuity.btnLifting'),
              slow: t(instant ? 'ixm.ingenuity.tapSlow' : 'ixm.ingenuity.btnSlow'),
              slowing: t(instant ? 'ixm.ingenuity.tapSlowing' : 'ixm.ingenuity.btnSlowing'),
            }}
            onPress={() => {
              if (instant) hold(!holding.current);
            }}
            pressed={instant ? held : undefined}
            attention={!held && step === 1 && view.needle < 0.05}
            buttonProps={{ ...holdProps, 'data-ingenuity-main': true }}
          />
        )}
        {step === 3 && (
          <Toggle
            checked={noPressure}
            onChange={setNoPressure}
            label={t('interaction.noPressure')}
          />
        )}
      </div>
    </div>
  );
}
