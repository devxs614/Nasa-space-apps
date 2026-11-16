import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Toggle } from '../ui/Toggle';
import { StateButton } from '../ui/StateButton';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { formatNumber } from '../../lib/format';
import { fx } from '../../audio/sfx';
import { thrusterLoop } from '../../audio/sonify';
import type { LoopHandle } from '../../audio/scope';

// Física ilustrativa (sin cifras de la Parte 11 salvo el límite de 7 km/h): un intento cuidadoso dura
// unos 20 s, dejarse caer (10 s) falla siempre y hay combustible de sobra para ganar al segundo intento.
const ALT0_M = 30;
const V0_KMH = 6;
const LIMIT_KMH = 7;
const GRAVITY_KMH_S = 1.1;
const THRUST_KMH_S = 3.4;
const BURN_PER_S = 0.085;
const MIN_KMH = 1.5; // los propulsores frenan, no hacen subir
const V_MAX_GAUGE = 24;

type Thrust = 'hold' | 'firing' | 'tapOn' | 'tapOff';

/** 12. NEAR Shoemaker — "Aterriza sin manual": frenar a tiempo para tocar a 7 km/h o menos. */
export function NearInteraction({ active, reducedMotion, api }: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const instant = useAppStore((s) => s.instantSignal);
  const setFx = useJourneyStore((s) => s.setFx);
  const [assist, setAssist] = useState(false);
  const [view, setView] = useState({ alt: ALT0_M, v: V0_KMH, fuel: 1 });
  const [firing, setFiring] = useState(false);
  const sim = useRef({ alt: ALT0_M, v: V0_KMH, fuel: 1 });
  const ended = useRef(false);
  const braking = useRef(false);
  const thruster = useRef<LoopHandle | null>(null);
  const stepRef = useRef(1);
  const assistRef = useRef(assist);
  assistRef.current = assist;

  const brake = useCallback(
    (on: boolean) => {
      if (ended.current) return;
      const fire = on && sim.current.fuel > 0;
      if (braking.current === fire) return;
      braking.current = fire;
      setFiring(fire);
      thruster.current?.stop();
      thruster.current = fire ? api.sound.loop(thrusterLoop) : null;
      if (on) api.touch();
    },
    [api],
  );

  // Un solo final por intento: se para el bucle, se callan los propulsores y suena un único efecto.
  const touchdown = useCallback(
    (vKmh: number) => {
      if (ended.current) return;
      ended.current = true;
      braking.current = false;
      setFiring(false);
      thruster.current?.stop();
      thruster.current = null;
      const speed = formatNumber(vKmh, locale, 1, 1);
      if (vKmh <= LIMIT_KMH) {
        api.sound.play(fx.thud);
        api.succeed({ detailKey: 'ixm.near.success', detailVars: { speed }, quiet: true });
      } else {
        api.sound.play(fx.gentle);
        api.fail('ixm.near.fail', { speed });
      }
    },
    [api, locale],
  );

  useEffect(() => {
    api.onSeeResult(() => {
      sim.current = { ...sim.current, alt: 0, v: 6.4 };
      setView({ ...sim.current });
      touchdown(6.4);
    });
    return () => api.onSeeResult(null);
  }, [api, touchdown]);
  useEffect(() => () => setFx('dig', 0), [setFx]);

  useEffect(() => {
    if (!active || ended.current) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      const easy = assistRef.current;
      const fire = braking.current && s.fuel > 0;
      const g = GRAVITY_KMH_S * (easy ? 0.6 : 1);
      s.v = Math.max(MIN_KMH, s.v + (g - (fire ? THRUST_KMH_S : 0)) * dt);
      if (fire) s.fuel = Math.max(0, s.fuel - BURN_PER_S * (easy ? 0.5 : 1) * dt);
      if (braking.current && s.fuel === 0) {
        braking.current = false;
        setFiring(false);
        thruster.current?.stop();
        thruster.current = null;
      }
      s.alt = Math.max(0, s.alt - (s.v / 3.6) * dt);
      if (s.alt <= ALT0_M / 2 && stepRef.current === 1) {
        stepRef.current = 2;
        api.setStep(2);
      }
      setView({ alt: s.alt, v: s.v, fuel: s.fuel });
      setFx('dig', 1 - s.alt / ALT0_M);
      if (s.alt === 0) {
        touchdown(s.v);
        return; // no se pide otro fotograma
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Fuera de pantalla o en pausa: el botón deja de estar mantenido.
      braking.current = false;
      setFiring(false);
      thruster.current?.stop();
      thruster.current = null;
    };
  }, [active, api, setFx, touchdown]);

  // La barra espaciadora frena aunque el foco no esté en el botón (dentro de la actividad).
  const empty = view.fuel === 0;
  const state: Thrust = instant ? (firing ? 'tapOff' : 'tapOn') : firing ? 'firing' : 'hold';
  const holdProps = instant
    ? {}
    : {
        onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          brake(true);
        },
        onPointerUp: () => brake(false),
        onPointerCancel: () => brake(false),
        onLostPointerCapture: () => brake(false),
        onBlur: () => brake(false),
        onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!e.repeat) brake(true);
          }
        },
        onKeyUp: (e: React.KeyboardEvent<HTMLButtonElement>) => {
          if (e.key === ' ' || e.key === 'Enter') brake(false);
        },
      };
  const speedPct = Math.min(100, (view.v / V_MAX_GAUGE) * 100);
  const limitPct = (LIMIT_KMH / V_MAX_GAUGE) * 100;
  const ok = view.v <= LIMIT_KMH;
  const speedText = `${formatNumber(view.v, locale, 1, 1)} km/h`;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div
          className="ix-stage relative h-48"
          aria-hidden="true"
          style={reducedMotion ? undefined : { transition: 'none' }}
        >
          <div className="absolute inset-x-0 bottom-0 h-8 rounded-t-[50%] bg-[#8a7460]" />
          <span
            className="absolute left-1/2 h-5 w-5 -translate-x-1/2 bg-[#d4a64a]"
            style={{ bottom: `${32 + (view.alt / ALT0_M) * 130}px` }}
          />
          {firing && (
            <span
              className="absolute left-1/2 h-3 w-2 -translate-x-1/2 rounded-b-full bg-signal"
              style={{ bottom: `${20 + (view.alt / ALT0_M) * 130}px` }}
            />
          )}
        </div>
        <dl className="grid content-start gap-3 font-mono text-[0.875rem] sm:w-56">
          <div>
            <dt className="text-ink-dim">{t('ixm.near.speed')}</dt>
            <dd
              className={ok ? 'text-phosphor tabular' : 'text-amber tabular'}
              data-near-speed={view.v.toFixed(2)}
            >
              {speedText}
            </dd>
            <div
              className="relative mt-1 h-3 overflow-hidden rounded-full bg-white/10"
              role="img"
              aria-label={t('ixm.near.limit')}
            >
              <span
                className="absolute inset-y-0 left-0 bg-phosphor/35"
                style={{ width: `${limitPct}%` }}
              />
              <span
                className="absolute inset-y-0 w-0.5 bg-phosphor"
                style={{ left: `${limitPct}%` }}
              />
              <span
                className={`absolute inset-y-0 w-1.5 ${ok ? 'bg-phosphor' : 'bg-amber'}`}
                style={{ left: `calc(${speedPct}% - 3px)` }}
              />
            </div>
            <p className="mt-1 text-[0.75rem] text-ink-dim">{t('ixm.near.limit')}</p>
          </div>
          <div>
            <dt className="text-ink-dim">{t('ixm.near.height')}</dt>
            <dd className="tabular">{formatNumber(view.alt, locale, 0)} m</dd>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full bg-signal"
                style={{ width: `${(view.alt / ALT0_M) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <dt className="text-ink-dim">{t('ixm.near.fuel')}</dt>
            <dd className="tabular">{formatNumber(view.fuel * 100, locale, 0)} %</dd>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full bg-amber" style={{ width: `${view.fuel * 100}%` }} />
            </div>
          </div>
        </dl>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <StateButton<Thrust>
          state={state}
          labels={{
            hold: t('ixm.near.hold'),
            firing: t('ixm.near.firing'),
            tapOn: t('ixm.near.tapOn'),
            tapOff: t('ixm.near.tapOff'),
          }}
          onPress={() => {
            if (instant) brake(!braking.current);
          }}
          pressed={instant ? firing : undefined}
          disabledReason={empty ? t('ixm.near.empty') : undefined}
          attention={!firing && view.fuel === 1}
          buttonProps={{ ...holdProps, 'data-near-thrust': true }}
        />
        <Toggle checked={assist} onChange={setAssist} label={t('interaction.noPressure')} />
      </div>
    </div>
  );
}
