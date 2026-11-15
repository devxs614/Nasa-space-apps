import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { Machine } from '../../data/types';
import { GLYPHS } from './glyphs';
import { useAppStore } from '../../state/useAppStore';
import { formatDate } from '../../lib/format';
import { cx } from '../../lib/cx';

export type PatchState = 'locked' | 'earned' | 'gold';

const SHAPES: Record<Machine['world'], string> = {
  moon: 'M100 8 A92 92 0 1 1 99.99 8 Z',
  mars: 'M100 8 L180 28 Q186 112 100 192 Q14 112 20 28 Z',
  'small-bodies': 'M100 8 L179.7 54 L179.7 146 L100 192 L20.3 146 L20.3 54 Z',
  'deep-space':
    'M100 8 Q108 8 116 16 L184 84 Q192 100 184 116 L116 184 Q100 192 84 184 L16 116 Q8 100 16 84 L84 16 Q92 8 100 8 Z',
};

export interface PatchProps {
  machine: Machine;
  state: PatchState;
  size?: number;
  withText?: boolean;
  animate?: boolean;
  className?: string;
}

/** Parche: emblema geométrico original dibujado con SVG (Parte 14.5). No imita parches reales. */
export function Patch({
  machine,
  state,
  size = 160,
  withText = true,
  animate,
  className,
}: PatchProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const date = useAppStore((s) => s.patchDates[machine.id]);
  const uid = useId().replace(/:/g, '');
  const [bg, border, glyph] = machine.patch.colors;
  const shape = SHAPES[machine.world];
  const year =
    (machine.arrival ?? machine.launch)?.date.slice(0, 4) ?? machine.lastSignal.date.slice(0, 4);
  const label = (machine.shortName ?? machine.name)[locale].toUpperCase();
  const locked = state === 'locked';
  const desc = locked
    ? t('passport.locked', { n: machine.order })
    : date
      ? t('passport.earnedOn', { date: formatDate(date.slice(0, 10), locale) })
      : t('passport.earned');
  return (
    <svg
      role="img"
      aria-labelledby={`${uid}-t ${uid}-d`}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cx(animate && 'patch-stitch', className)}
      style={locked ? { filter: 'grayscale(1)', opacity: 0.35 } : undefined}
      data-export={withText ? undefined : ''}
    >
      <title id={`${uid}-t`}>{t('passport.patchOf', { name: machine.name[locale] })}</title>
      <desc id={`${uid}-d`}>{desc}</desc>
      <defs>
        <radialGradient id={`${uid}-g`}>
          <stop offset="0" stopColor={bg} />
          <stop offset="1" stopColor={border} stopOpacity="0.12" />
        </radialGradient>
        <path id={`${uid}-arc`} d="M30 100 A70 70 0 0 0 170 100" />
      </defs>
      {state === 'gold' && (
        <path
          d={shape}
          transform="translate(100 100) scale(1.0) translate(-100 -100)"
          fill="none"
          stroke="#ffb547"
          strokeWidth="6"
        />
      )}
      <path
        d={shape}
        fill={border}
        transform="translate(100 100) scale(0.96) translate(-100 -100)"
      />
      <path d={shape} fill={bg} transform="translate(100 100) scale(0.88) translate(-100 -100)" />
      <path
        d={shape}
        fill={`url(#${uid}-g)`}
        transform="translate(100 100) scale(0.88) translate(-100 -100)"
      />
      <path
        className="patch-seam"
        d={shape}
        fill="none"
        stroke={border}
        strokeWidth="1.5"
        strokeDasharray="3 4"
        opacity="0.7"
        transform="translate(100 100) scale(0.8) translate(-100 -100)"
      />
      <g transform="translate(50 42)">
        <path
          className="patch-glyph"
          pathLength={1}
          d={GLYPHS[machine.patch.glyph]}
          fill="none"
          stroke={glyph}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {withText &&
        (machine.world === 'moon' ? (
          <text
            fill={glyph}
            fontFamily="var(--font-display)"
            fontSize="11"
            letterSpacing="2.2"
            textAnchor="middle"
          >
            <textPath href={`#${uid}-arc`} startOffset="50%">
              {label} · {year}
            </textPath>
          </text>
        ) : (
          <g>
            <rect x="40" y="150" width="120" height="18" rx="4" fill={border} opacity="0.9" />
            <text
              x="100"
              y="163"
              fill={bg}
              fontFamily="var(--font-display)"
              fontSize="10"
              letterSpacing="1.6"
              textAnchor="middle"
            >
              {label.slice(0, 14)} · {year}
            </text>
          </g>
        ))}
      {state === 'gold' && (
        <path d="M100 2 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#ffb547" />
      )}
      {locked && (
        <g transform="translate(150 150)" fill="none" stroke="#e8eef7" strokeWidth="3">
          <rect x="-12" y="-4" width="24" height="18" rx="3" fill="#0b0f1a" />
          <path d="M-7 -4 v-6 a7 7 0 0 1 14 0 v6" />
        </g>
      )}
    </svg>
  );
}

export function patchState(completed: boolean, bestQuiz: number): PatchState {
  if (!completed) return 'locked';
  return bestQuiz >= 3 ? 'gold' : 'earned';
}
