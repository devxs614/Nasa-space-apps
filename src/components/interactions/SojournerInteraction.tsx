import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { useLightTime } from '../../hooks/useLightTime';
import { formatLightTime } from '../../lib/format';
import { useAppStore } from '../../state/useAppStore';
import { cx } from '../../lib/cx';

type Cmd = 'forward' | 'left' | 'right' | 'measure';
type Dir = 'n' | 'e' | 's' | 'w';
const ROCKS = new Set(['2,1', '5,2', '1,4', '4,4', '6,5', '3,6']);
const LANDER = '0,7';
const TARGET = { x: 6, y: 1 };
const DIRS: Dir[] = ['n', 'e', 's', 'w'];
const STEP: Record<Dir, [number, number]> = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
const DELAY_MS = 4000;

/** 6. Sojourner — "Conduce con retraso": órdenes en cola con el retraso de la señal (1997-07-04, comprimido). */
export function SojournerInteraction({
  express,
  reducedMotion,
  onComplete,
  onSkip,
}: InteractionProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const { done, finish } = useDone(onComplete);
  const lt = useLightTime('mars', '1997-07-04T12:00:00Z');
  const [queue, setQueue] = useState<Cmd[]>([]);
  const [rover, setRover] = useState({ x: 1, y: 6, d: 'n' as Dir });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((x) => window.clearTimeout(x)), []);

  const run = () => {
    if (!queue.length || busy) return;
    setBusy(true);
    setMsg(t('ix.sojourner.waiting'));
    const cmds = [...queue];
    setQueue([]);
    let r = { ...rover };
    const stepMs = reducedMotion ? 50 : 450;
    timers.current.push(
      window.setTimeout(
        () => {
          setMsg('');
          let stopped = false;
          cmds.forEach((c, i) => {
            timers.current.push(
              window.setTimeout(() => {
                if (stopped) return;
                if (c === 'left' || c === 'right')
                  r = { ...r, d: DIRS[(DIRS.indexOf(r.d) + (c === 'left' ? 3 : 1)) % 4]! };
                else if (c === 'forward') {
                  const [dx, dy] = STEP[r.d];
                  const nx = r.x + dx;
                  const ny = r.y + dy;
                  if (
                    nx < 0 ||
                    ny < 0 ||
                    nx > 7 ||
                    ny > 7 ||
                    ROCKS.has(`${nx},${ny}`) ||
                    `${nx},${ny}` === LANDER
                  ) {
                    stopped = true;
                    setMsg(t('ix.sojourner.crash'));
                  } else r = { ...r, x: nx, y: ny };
                } else if (c === 'measure') {
                  const near = Math.abs(r.x - TARGET.x) + Math.abs(r.y - TARGET.y) <= 1;
                  setMsg(near ? t('ix.sojourner.measured') : t('ix.sojourner.notThere'));
                  if (near) finish();
                }
                setRover(r);
                if (i === cmds.length - 1 || stopped) setBusy(false);
              }, i * stepMs),
            );
          });
        },
        reducedMotion ? 300 : DELAY_MS,
      ),
    );
  };

  const cell = (x: number, y: number) => {
    const k = `${x},${y}`;
    if (rover.x === x && rover.y === y)
      return {
        label: t('ix.sojourner.rover'),
        cls: 'bg-signal text-void',
        icon: { n: '▲', e: '▶', s: '▼', w: '◀' }[rover.d],
      };
    if (x === TARGET.x && y === TARGET.y)
      return { label: t('ix.sojourner.target'), cls: 'bg-amber/80 text-void', icon: '◆' };
    if (k === LANDER)
      return { label: t('ix.sojourner.lander'), cls: 'bg-[#d4a64a] text-void', icon: '△' };
    if (ROCKS.has(k)) return { label: t('ix.sojourner.rock'), cls: 'bg-[#7a4630]', icon: '●' };
    return { label: '', cls: 'bg-[#3a2016]', icon: '' };
  };

  return (
    <Shell
      title={t('ix.sojourner.title')}
      done={done}
      successText={t('ix.sojourner.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setRover({ x: 6, y: 2, d: 'n' });
        finish();
      }}
      live={`${msg} ${t('ix.sojourner.position', { x: rover.x + 1, y: rover.y + 1, dir: t(`ix.sojourner.dirs.${rover.d}`) })}`}
    >
      <p className="mb-2 font-mono text-[0.875rem]">
        {t('ix.sojourner.delay', { time: formatLightTime(lt.seconds ?? 0, locale) })}
      </p>
      <div
        className="grid max-w-[360px] grid-cols-8 gap-0.5"
        role="img"
        aria-label={t('ix.sojourner.grid')}
      >
        {Array.from({ length: 64 }, (_, i) => {
          const c = cell(i % 8, Math.floor(i / 8));
          return (
            <span
              key={i}
              title={c.label}
              className={cx('flex aspect-square items-center justify-center text-[0.75rem]', c.cls)}
            >
              {c.icon}
            </span>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(['forward', 'left', 'right', 'measure'] as const).map((c) => (
          <button
            key={c}
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={busy}
            onClick={() => setQueue((q) => [...q, c].slice(0, 12))}
          >
            {t(`ix.sojourner.${c}`)}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={busy || !queue.length}
          onClick={run}
        >
          {t('ix.sojourner.send')}
        </button>
        <button
          type="button"
          className="btn btn-subtle btn-sm"
          disabled={busy}
          onClick={() => setQueue([])}
        >
          {t('ix.sojourner.clear')}
        </button>
      </div>
      <p className="mt-2 font-mono text-[0.8125rem]">
        {t('ix.sojourner.queue')}: {queue.map((q) => t(`ix.sojourner.${q}`)).join(' → ') || '—'}
      </p>
      {msg && <p className="mt-1 text-amber">{msg}</p>}
    </Shell>
  );
}
