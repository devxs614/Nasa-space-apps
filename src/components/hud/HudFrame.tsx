/** Cuatro escuadras que enmarcan la vista en los capítulos, con una mira tenue (decorativo; oculto < 480 px). */
export function HudFrame({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-4 z-[5] hidden min-[480px]:block lg:inset-8"
    >
      <div
        className="hud-corners absolute inset-0"
        style={{ ['--c' as string]: 'var(--line-strong)' }}
      />
      <svg
        className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 opacity-30"
        viewBox="0 0 32 32"
      >
        <path
          d="M16 4v8M16 20v8M4 16h8M20 16h8"
          stroke="var(--signal)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
}
