import { cx } from '../../lib/cx';

export interface LumiAvatarProps {
  state?: 'idle' | 'talking' | 'thinking' | 'surprised';
  size?: number;
  className?: string;
}

/** LUMI: una baliza que escucha (personaje original, decorativo). */
export function LumiAvatar({ state = 'idle', size = 48, className }: LumiAvatarProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      className={cx('shrink-0 text-signal', state === 'idle' && 'lumi-breathe', className)}
      style={
        state === 'surprised'
          ? { transform: 'scale(1.15)', transition: 'transform 320ms' }
          : undefined
      }
    >
      <circle cx="24" cy="28" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="28" r="3.5" fill="currentColor" />
      <path
        d="M15 13a13 13 0 0 1 18 0M10 8a20 20 0 0 1 28 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {state === 'talking' && (
        <circle
          cx="24"
          cy="28"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
          className="lumi-breathe"
        />
      )}
      {state === 'thinking' && (
        <g fill="currentColor">
          <circle cx="18" cy="44" r="1.5" />
          <circle cx="24" cy="44" r="1.5" />
          <circle cx="30" cy="44" r="1.5" />
        </g>
      )}
    </svg>
  );
}
