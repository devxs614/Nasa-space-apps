import type { ReactNode } from 'react';
import { BadgeCheck, Box, Clock, Sparkles, Waves, Info, FastForward } from 'lucide-react';
import { cx } from '../../lib/cx';

export type BadgeTone =
  | 'verified'
  | 'approx'
  | 'fiction'
  | 'realtime'
  | 'compression'
  | 'info'
  | 'render'
  | 'sonification';

export interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}

const ICON: Record<BadgeTone, ReactNode> = {
  verified: <BadgeCheck size={14} strokeWidth={1.75} aria-hidden="true" />,
  approx: <span aria-hidden="true">≈</span>,
  fiction: <Sparkles size={14} strokeWidth={1.75} aria-hidden="true" />,
  realtime: <Clock size={14} strokeWidth={1.75} aria-hidden="true" />,
  compression: <FastForward size={14} strokeWidth={1.75} aria-hidden="true" />,
  info: <Info size={14} strokeWidth={1.75} aria-hidden="true" />,
  render: <Box size={14} strokeWidth={1.75} aria-hidden="true" />,
  sonification: <Waves size={14} strokeWidth={1.75} aria-hidden="true" />,
};
const TONE: Record<BadgeTone, string> = {
  verified: 'border-phosphor/50 text-phosphor',
  approx: 'border-amber/50 text-amber',
  fiction: 'border-amber/40 text-[#ffd59a]',
  realtime: 'border-signal/50 text-signal',
  compression: 'border-amber/50 text-amber',
  info: 'border-line-strong text-ink-dim',
  render: 'border-line-strong text-ink-dim',
  sonification: 'border-signal/40 text-signal',
};

/** Insignia: siempre icono más texto (WCAG 1.4.1). */
export function Badge({ tone, children, className }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border bg-void/70 px-2 py-0.5 font-mono text-[0.8125rem] leading-5 whitespace-nowrap',
        TONE[tone],
        className,
      )}
    >
      {ICON[tone]}
      {children}
    </span>
  );
}
