import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { Toggle } from '../ui/Toggle';
import { useJourneyStore } from '../../state/useJourneyStore';
import { playSfx } from '../../audio/play';
import { createTone, type ToneHandle } from '../../audio/sonify';
import { useAppStore } from '../../state/useAppStore';
import { cx } from '../../lib/cx';

const WAYPOINTS = [20, 50, 82]; // % horizontal
const DUNES_FROM = 62; // a partir de aquí el suelo no tiene textura

/** 11. Ingenuity — "Vuela en aire fino": rpm, referencias de navegación y aterrizaje suave. */
export function IngenuityInteraction({
  active,
  express,
  reducedMotion,
  onComplete,
  onSkip,
}: InteractionProps) {
  const { t } = useTranslation('ui');
  const setFx = useJourneyStore((s) => s.setFx);
  const { done, finish } = useDone(onComplete);
  const [mars, setMars] = useState(true);
  const [noPressure, setNoPressure] = useState(false);
  const [rpm, setRpm] = useState(0);
  const [flying, setFlying] = useState(false);
  const [pos, setPos] = useState({ x: 8, y: 0, vy: 0 });
  const [reached, setReached] = useState<boolean[]>([false, false, false]);
  const [msg, setMsg] = useState('');
  const [flights, setFlights] = useState(0);
  const spinning = useRef(false);
  const keys = useRef<Record<string, boolean>>({});
  const need = mars ? 2400 : 400; // ilustrativo: en Marte hace falta girar mucho más rápido
  const green = rpm >= need * 0.95;
  const soundOn = useAppStore((s) => s.soundOn);
  const rotor = useRef<ToneHandle | null>(null);

  // Sonido del rotor: diente de sierra filtrado cuya frecuencia sigue las rpm (Parte 15.3).
  useEffect(() => {
    if (!soundOn || !active) return;
    rotor.current = createTone('sawtooth', 30, 0.0001, 900);
    return () => {
      rotor.current?.stop();
      rotor.current = null;
    };
  }, [soundOn, active]);
  useEffect(() => {
    rotor.current?.setFreq(30 + rpm / 30);
    rotor.current?.setLevel(rpm > 50 ? 0.05 : 0.0001);
  }, [rpm]);

  useEffect(() => () => setFx('fly', 0), [setFx]);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setRpm((r) => {
        const target = spinning.current || flying ? need * 1.05 : 0;
        return r + (target - r) * Math.min(1, dt * 2.5);
      });
      if (flying) {
        setPos((p) => {
          const k = keys.current;
          const climb = (k.up ? 1 : 0) - (k.down ? 1 : 0);
          let vy = p.vy + (climb * 14 - 4) * dt;
          if (noPressure && p.y < 6 && climb <= 0) vy = Math.max(vy, -1.2);
          vy = Math.max(-8, Math.min(6, vy));
          const y = Math.max(0, Math.min(24, p.y + vy * dt));
          const x = Math.max(
            2,
            Math.min(96, p.x + ((k.right ? 1 : 0) - (k.left ? 1 : 0)) * 18 * dt),
          );
          return { x, y, vy: y === 0 ? 0 : vy };
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, flying, need, noPressure]);

  useEffect(() => {
    setFx('fly', flying ? 1 : Math.min(1, rpm / need) * 0.6);
    if (!flying) return;
    setReached((r) => r.map((v, i) => v || (Math.abs(pos.x - WAYPOINTS[i]!) < 4 && pos.y > 1.5)));
  }, [pos, flying, rpm, need, setFx]);

  const navLow = flying && pos.x > DUNES_FROM;
  const land = () => {
    const soft = noPressure || Math.abs(pos.vy) < 2.2;
    setFlying(false);
    setPos((p) => ({ ...p, y: 0, vy: 0 }));
    if (soft) {
      setFlights((n) => n + 1);
      setMsg(t('ix.ingenuity.soft'));
      playSfx('thud');
      if (reached.every(Boolean)) finish();
    } else setMsg(t('ix.ingenuity.hard'));
  };
  const hold = (k: string) => ({
    onPointerDown: () => (keys.current[k] = true),
    onPointerUp: () => (keys.current[k] = false),
    onPointerLeave: () => (keys.current[k] = false),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') keys.current[k] = true;
    },
    onKeyUp: () => (keys.current[k] = false),
  });
  const n = reached.filter(Boolean).length;

  return (
    <Shell
      title={t('ix.ingenuity.title')}
      done={done}
      successText={t('ix.ingenuity.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setReached([true, true, true]);
        setFlights((f) => f + 1);
        finish();
      }}
      live={`${t('ix.ingenuity.waypoints', { n })}. ${navLow ? t('ix.ingenuity.navLow') : ''} ${msg}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold">{t('ix.ingenuity.air')}:</span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-pressed={!mars}
          onClick={() => setMars(false)}
          disabled={flying}
        >
          {t('ix.ingenuity.earth')}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-pressed={mars}
          onClick={() => setMars(true)}
          disabled={flying}
        >
          {t('ix.ingenuity.mars')}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 font-mono text-[0.875rem]">
          {t('ix.ingenuity.rpm')}
          <meter
            min={0}
            max={need * 1.1}
            low={need * 0.95}
            optimum={need}
            value={rpm}
            className="w-40"
          />
          <span className="tabular">{Math.round(rpm)} rpm</span>
        </label>
        <span className={cx('font-mono text-[0.875rem]', green ? 'text-phosphor' : 'text-amber')}>
          {green ? t('ix.ingenuity.green') : t('ix.ingenuity.needMore')}
        </span>
      </div>
      {!flying && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onPointerDown={() => (spinning.current = true)}
            onPointerUp={() => (spinning.current = false)}
            onPointerLeave={() => (spinning.current = false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') spinning.current = true;
            }}
            onKeyUp={() => (spinning.current = false)}
          >
            {t('ix.ingenuity.spin')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!green}
            onClick={() => {
              setFlying(true);
              setMsg('');
              setPos((p) => ({ ...p, y: 0.5, vy: 2 }));
            }}
          >
            ↑ {t('ix.ingenuity.up')}
          </button>
        </div>
      )}
      <div className="ix-stage relative mt-3 h-40" aria-hidden="true">
        <div
          className="absolute inset-x-0 bottom-0 h-6"
          style={{
            background: `linear-gradient(90deg, #6e3520 0 ${DUNES_FROM}%, #c99f7f ${DUNES_FROM}% 100%)`,
          }}
        />
        {WAYPOINTS.map((x, i) => (
          <span
            key={x}
            className={cx(
              'absolute bottom-16 h-3 w-3 rounded-full border-2',
              reached[i] ? 'border-phosphor bg-phosphor' : 'border-amber',
            )}
            style={{ left: `${x}%` }}
          />
        ))}
        <span
          className="absolute h-4 w-6 rounded-sm bg-ink"
          style={{
            left: `${pos.x}%`,
            bottom: `${24 + pos.y * 5}px`,
            transition: reducedMotion ? 'none' : undefined,
          }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[0.875rem]">
        <span>{t('ix.ingenuity.waypoints', { n })}</span>
        <span>{t('ix.ingenuity.flights', { n: flights })}</span>
        <span className={navLow ? 'text-amber' : 'text-phosphor'}>
          {t('ix.ingenuity.nav')}: {navLow ? '▂' : '▆'}
        </span>
      </div>
      {navLow && <p className="text-amber">{t('ix.ingenuity.navLow')}</p>}
      {flying && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(['left', 'up', 'down', 'right'] as const).map((k) => (
            <button key={k} type="button" className="btn btn-ghost btn-sm" {...hold(k)}>
              {t(`ix.ingenuity.${k}`)}
            </button>
          ))}
          <button type="button" className="btn btn-primary btn-sm" onClick={land}>
            {t('ix.ingenuity.land')}
          </button>
        </div>
      )}
      {msg && <p className="mt-2">{msg}</p>}
      <Toggle checked={noPressure} onChange={setNoPressure} label={t('interaction.noPressure')} />
    </Shell>
  );
}
