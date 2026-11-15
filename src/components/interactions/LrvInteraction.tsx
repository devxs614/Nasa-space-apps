import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { Toggle } from '../ui/Toggle';
import { useJourneyStore } from '../../state/useJourneyStore';

const W = 480;
const H = 320;
const LM = { x: W / 2, y: H / 2 };
const STOPS = [
  { x: 110, y: 80 },
  { x: 380, y: 95 },
  { x: 300, y: 265 },
];
const WALK_R = 175;

/** 4. LRV — "Al volante en la Luna": vista cenital, batería y círculo de regreso a pie. */
export function LrvInteraction({
  active,
  express,
  reducedMotion,
  onComplete,
  onSkip,
}: InteractionProps) {
  const { t } = useTranslation('ui');
  const setFx = useJourneyStore((s) => s.setFx);
  const { done, finish } = useDone(onComplete);
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef({
    x: LM.x,
    y: LM.y + 30,
    a: -Math.PI / 2,
    v: 0,
    battery: 1,
    visited: [false, false, false],
    dust: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
  });
  const keys = useRef<Record<string, boolean>>({});
  const [hud, setHud] = useState({ battery: 1, stops: 0, msg: '' });
  const [noPressure, setNoPressure] = useState(false);

  const press = useCallback((k: string, on: boolean) => {
    keys.current[k] = on;
  }, []);

  useEffect(() => {
    if (!active) setFx('fly', 0);
  }, [active, setFx]);

  useEffect(() => {
    if (!active || done) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = st.current;
      const k = keys.current;
      const accel = (k.up ? 1 : 0) - (k.down ? 1 : 0);
      if (s.battery > 0) s.v += accel * 60 * dt;
      s.v *= k.brake ? 0.85 : 0.97;
      s.v = Math.max(-40, Math.min(70, s.v));
      if (k.left) s.a -= 2.2 * dt;
      if (k.right) s.a += 2.2 * dt;
      s.x = Math.max(8, Math.min(W - 8, s.x + Math.cos(s.a) * s.v * dt));
      s.y = Math.max(8, Math.min(H - 8, s.y + Math.sin(s.a) * s.v * dt));
      if (!noPressure) s.battery = Math.max(0, s.battery - Math.abs(s.v) * dt * 0.0016);
      setFx('fly', Math.min(1, Math.abs(s.v) / 50));
      if (!reducedMotion && Math.abs(s.v) > 8 && s.dust.length < 120)
        s.dust.push({
          x: s.x - Math.cos(s.a) * 10,
          y: s.y - Math.sin(s.a) * 10,
          vx: -Math.cos(s.a) * 30 + (Math.random() - 0.5) * 20,
          vy: -Math.sin(s.a) * 30 + (Math.random() - 0.5) * 20,
          life: 0.5,
        });
      s.dust = s.dust.filter((d) => (d.life -= dt) > 0);
      s.dust.forEach((d) => {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      });
      STOPS.forEach((p, i) => {
        if (Math.hypot(p.x - s.x, p.y - s.y) < 18) s.visited[i] = true;
      });
      const n = s.visited.filter(Boolean).length;
      const far = Math.hypot(s.x - LM.x, s.y - LM.y) > WALK_R;
      const home = Math.hypot(s.x - LM.x, s.y - LM.y) < 24;
      let msg = far
        ? t('ix.lrv.tooFar')
        : s.battery <= 0
          ? t('ix.lrv.empty')
          : n === 3
            ? t('ix.lrv.return')
            : '';
      if (n === 3 && home && s.battery > 0) {
        msg = '';
        finish();
      }
      setHud((h) =>
        h.stops !== n || h.msg !== msg || Math.abs(h.battery - s.battery) > 0.01
          ? { battery: s.battery, stops: n, msg }
          : h,
      );
      draw();
      raf = requestAnimationFrame(loop);
    };
    const draw = () => {
      const ctx = canvas.current?.getContext('2d');
      if (!ctx) return;
      const s = st.current;
      ctx.fillStyle = '#1d1e22';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(94,242,255,0.35)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(LM.x, LM.y, WALK_R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#d4a64a';
      ctx.fillRect(LM.x - 10, LM.y - 10, 20, 20);
      STOPS.forEach((p, i) => {
        ctx.strokeStyle = s.visited[i] ? '#7cffb2' : '#ffb547';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.fillStyle = 'rgba(185,187,194,0.6)';
      s.dust.forEach((d) => ctx.fillRect(d.x, d.y, 2, 2));
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.a);
      ctx.fillStyle = '#e8eef7';
      ctx.fillRect(-10, -6, 20, 12);
      ctx.fillStyle = '#5ef2ff';
      ctx.fillRect(6, -3, 4, 6);
      ctx.restore();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, done, noPressure, reducedMotion, setFx, t, finish]);

  useEffect(() => {
    const map: Record<string, string> = {
      ArrowUp: 'up',
      w: 'up',
      ArrowDown: 'down',
      s: 'down',
      ArrowLeft: 'left',
      a: 'left',
      ArrowRight: 'right',
      d: 'right',
      ' ': 'brake',
    };
    const el = canvas.current?.parentElement;
    if (!el) return;
    const down = (e: KeyboardEvent) => {
      const k = map[e.key];
      if (k) {
        e.preventDefault();
        e.stopPropagation();
        press(k, true);
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = map[e.key];
      if (k) press(k, false);
    };
    el.addEventListener('keydown', down);
    el.addEventListener('keyup', up);
    return () => {
      el.removeEventListener('keydown', down);
      el.removeEventListener('keyup', up);
    };
  }, [press]);

  const hold = (k: string) => ({
    onPointerDown: () => press(k, true),
    onPointerUp: () => press(k, false),
    onPointerLeave: () => press(k, false),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') press(k, true);
    },
    onKeyUp: () => press(k, false),
  });

  return (
    <Shell
      title={t('ix.lrv.title')}
      done={done}
      successText={t('ix.lrv.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => finish()}
      live={`${t('ix.lrv.stops', { n: hud.stops })}. ${hud.msg}`}
    >
      <div
        tabIndex={0}
        className="rounded-card focus-visible:outline-2"
        aria-label={t('ix.keysHint')}
      >
        <canvas
          ref={canvas}
          width={W}
          height={H}
          className="ix-stage aspect-[3/2] w-full"
          role="img"
          aria-label={t('ix.lrv.map')}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[0.875rem]">
        <span>{t('ix.lrv.stops', { n: hud.stops })}</span>
        <label className="flex items-center gap-2">
          {t('ix.lrv.battery')}
          <meter min={0} max={1} low={0.25} value={hud.battery} className="w-28" />
        </label>
        <span className="text-ink-dim">◌ {t('ix.lrv.walkback')}</span>
      </div>
      {hud.msg && <p className="mt-2 text-amber">{hud.msg}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {(['up', 'left', 'right', 'down', 'brake'] as const).map((k) => (
          <button key={k} type="button" className="btn btn-ghost btn-sm" {...hold(k)}>
            {t(`ix.lrv.${k}`)}
          </button>
        ))}
      </div>
      <Toggle checked={noPressure} onChange={setNoPressure} label={t('interaction.noPressure')} />
    </Shell>
  );
}
