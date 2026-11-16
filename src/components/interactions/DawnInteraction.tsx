import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { StateButton } from '../ui/StateButton';
import { Badge } from '../ui/Badge';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { formatNumber } from '../../lib/format';
import { fx } from '../../audio/sfx';
import { hissLoop } from '../../audio/sonify';
import type { LoopHandle } from '../../audio/scope';

// Comparación ilustrativa (sin cifras de la Parte 11): Vesta–Ceres mide 100 unidades de pantalla.
const GOAL = 100;
const CHEM_V = 2.4; // unidades/s tras el empujón
const BURN_S = 1.5;
const ION_A = 0.32; // unidades/s²: llega en unos 25 s y adelanta al químico hacia los 15 s
const ION_FUEL_PER_S = 0.012;
const GRAPH_S = 30;
const GRAPH_V = 9;

interface Sim {
  t: number; // reloj de la carrera: solo avanza durante el quemado y con el iónico encendido
  chem: { x: number; v: number; fuel: number; burn: number; used: boolean };
  ion: { x: number; v: number; fuel: number; on: boolean };
  trace: { t: number; chem: number; ion: number }[];
}
const fresh = (): Sim => ({
  t: 0,
  chem: { x: 0, v: 0, fuel: 1, burn: 0, used: false },
  ion: { x: 0, v: 0, fuel: 1, on: false },
  trace: [{ t: 0, chem: 0, ion: 0 }],
});
type Chem = 'fire' | 'burning' | 'used';
type Ion = 'off' | 'on';

/** 13. Dawn — "Paciencia iónica": un gran empujón contra un empuje suave que nunca para. */
export function DawnInteraction({ active, api }: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const setFx = useJourneyStore((s) => s.setFx);
  const sim = useRef<Sim>(fresh());
  const [view, setView] = useState<Sim>(sim.current);
  const ended = useRef(false);
  const step = useRef(1);
  const hiss = useRef<LoopHandle | null>(null);

  const goStep = useCallback(
    (n: number) => {
      if (step.current >= n) return;
      step.current = n;
      api.setStep(n);
    },
    [api],
  );
  const setIon = useCallback(
    (on: boolean) => {
      const s = sim.current;
      if (ended.current || s.ion.on === on) return;
      s.ion.on = on;
      hiss.current?.stop();
      hiss.current = on ? api.sound.loop(hissLoop, 0.03) : null;
      setFx('ion', on ? 1 : 0.2);
      if (on) goStep(3);
      api.touch();
      setView({ ...s, ion: { ...s.ion } });
    },
    [api, goStep, setFx],
  );
  const fire = () => {
    const s = sim.current;
    if (ended.current || s.chem.used) return;
    s.chem.used = true;
    s.chem.burn = BURN_S;
    api.sound.play(fx.staticBurst, 1.4, 0.2); // efecto corto: el quemado dura 1,5 s
    api.touch();
    setView({ ...s, chem: { ...s.chem } });
  };

  const arrive = useCallback(() => {
    if (ended.current) return;
    ended.current = true;
    sim.current.ion.on = false;
    hiss.current?.stop(300);
    hiss.current = null;
    setFx('ion', 1);
    api.succeed({ detailKey: 'ixm.dawn.success' });
  }, [api, setFx]);

  useEffect(() => {
    api.onSeeResult(() => {
      sim.current.ion.x = GOAL;
      setView({ ...sim.current });
      arrive();
    });
    return () => api.onSeeResult(null);
  }, [api, arrive]);
  useEffect(() => () => setFx('ion', 1), [setFx]);

  useEffect(() => {
    if (!active || ended.current) return;
    const state = sim.current; // el mismo objeto durante todo el intento
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state;
      const burning = s.chem.burn > 0;
      if (burning || s.ion.on) {
        s.t += dt;
        if (burning) {
          s.chem.burn = Math.max(0, s.chem.burn - dt);
          s.chem.v = CHEM_V * (1 - s.chem.burn / BURN_S);
          s.chem.fuel = s.chem.burn / BURN_S;
          if (s.chem.burn === 0) goStep(2);
        }
        s.chem.x = Math.min(GOAL, s.chem.x + s.chem.v * dt);
        if (s.ion.on) {
          s.ion.v += ION_A * dt;
          s.ion.fuel = Math.max(0.05, s.ion.fuel - ION_FUEL_PER_S * dt);
        }
        s.ion.x = Math.min(GOAL, s.ion.x + s.ion.v * dt);
        const lastPoint = s.trace[s.trace.length - 1]!;
        if (s.t - lastPoint.t >= 0.25) s.trace.push({ t: s.t, chem: s.chem.v, ion: s.ion.v });
        setView({ ...s, chem: { ...s.chem }, ion: { ...s.ion } });
        if (s.ion.x >= GOAL) {
          arrive();
          return; // no se pide otro fotograma
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Fuera de pantalla o en pausa: el motor se apaga y su siseo también.
      if (state.ion.on) {
        state.ion.on = false;
        hiss.current?.stop();
        hiss.current = null;
        setView({ ...state, ion: { ...state.ion } });
      }
    };
  }, [active, arrive, goStep]);

  const { chem, ion } = view;
  const chemState: Chem = chem.burn > 0 ? 'burning' : chem.used ? 'used' : 'fire';
  const paused = chem.used && chem.burn === 0 && !ion.on && ion.x < GOAL;
  const faster = chem.used && ion.v > chem.v && chem.v > 0;
  const arrived = ion.x >= GOAL;
  const num = (v: number) => formatNumber(v, locale, 1, 1);
  const path = (key: 'chem' | 'ion') =>
    view.trace
      .map((p) => `${(p.t / GRAPH_S) * 300},${80 - Math.min(1, p[key] / GRAPH_V) * 76}`)
      .join(' ');
  const lane = (name: string, x: number, fuel: number, v: number, color: string, glow: boolean) => (
    <div>
      <p className="flex flex-wrap justify-between gap-2 font-mono text-[0.8125rem]">
        <span style={{ color }}>{name}</span>
        <span className="text-ink-dim">
          {t('ixm.dawn.speed')}: <span className="tabular text-ink">{num(v)}</span> ·{' '}
          {t('ixm.dawn.fuel')}:{' '}
          <span className="tabular text-ink">{formatNumber(fuel * 100, locale, 0)} %</span>
        </span>
      </p>
      <div className="relative mt-1 h-7 rounded-full bg-white/5" aria-hidden="true">
        <span
          className="absolute top-1/2 h-3 w-5 -translate-y-1/2 rounded-sm"
          style={{
            left: `calc(${(x / GOAL) * 100}% - ${(x / GOAL) * 20}px)`,
            background: color,
            boxShadow: glow ? `-10px 0 14px 2px ${color}` : undefined,
          }}
        />
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <span className="block h-full" style={{ width: `${fuel * 100}%`, background: color }} />
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.8125rem] text-ink-dim">
        <Badge tone="info">{t('ixm.dawn.label')}</Badge>
        <span>{t('ixm.dawn.timelapse')}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[0.8125rem]">{t('ix.dawn.vesta')}</span>
        <div className="grid flex-1 gap-3" data-dawn-race>
          {lane(t('ixm.dawn.chemLane'), chem.x, chem.fuel, chem.v, '#ff8a5c', chem.burn > 0)}
          {lane(t('ixm.dawn.ionLane'), ion.x, ion.fuel, ion.v, '#5ef2ff', ion.on)}
        </div>
        <span className="relative font-mono text-[0.8125rem]">
          {t('ix.dawn.ceres')}
          {arrived && (
            <span
              className="absolute -top-2 -right-1 h-2 w-2 rounded-full bg-white shadow-[0_0_10px_3px_#fff]"
              aria-hidden="true"
            />
          )}
        </span>
      </div>
      <svg
        viewBox="0 0 300 84"
        className="mt-3 h-24 w-full rounded-card border border-line bg-void/60"
        role="img"
        aria-label={t('ixm.dawn.graph')}
      >
        <polyline points={path('chem')} fill="none" stroke="#ff8a5c" strokeWidth="2" />
        <polyline points={path('ion')} fill="none" stroke="#5ef2ff" strokeWidth="2" />
      </svg>
      <p className="mt-2 min-h-6" data-dawn-note>
        {arrived ? (
          <span className="text-phosphor">{t('ixm.dawn.arrived')}</span>
        ) : paused ? (
          <span className="text-amber">{t('ixm.dawn.paused')}</span>
        ) : faster ? (
          <span className="text-phosphor">{t('ixm.dawn.faster')}</span>
        ) : null}
      </p>
      <div className="mt-2 flex flex-wrap items-start gap-4">
        <StateButton<Chem>
          state={chemState}
          labels={{
            fire: t('ixm.dawn.chemFire'),
            burning: t('ixm.dawn.chemBurning'),
            used: t('ixm.dawn.chemUsed'),
          }}
          onPress={fire}
          disabledReason={
            chemState === 'used'
              ? t('ixm.dawn.chemReason')
              : chemState === 'burning'
                ? t('ixm.dawn.chemBurning')
                : undefined
          }
          attention={!chem.used && !ion.on}
          buttonProps={{ 'data-dawn-chem': true }}
        />
        <StateButton<Ion>
          state={ion.on ? 'on' : 'off'}
          labels={{ off: t('ixm.dawn.ionOn'), on: t('ixm.dawn.ionOff') }}
          onPress={() => setIon(!sim.current.ion.on)}
          pressed={ion.on}
          attention={chem.used && chem.burn === 0 && !ion.on}
          buttonProps={{ 'data-dawn-ion': true }}
        />
      </div>
      <p className="mt-3 text-[0.8125rem] text-ink-dim">{t('ixm.dawn.soundNote')}</p>
    </div>
  );
}
