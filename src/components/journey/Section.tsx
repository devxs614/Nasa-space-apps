import { useRef, type ReactNode } from 'react';
import { useJourneyStore, type SectionId } from '../../state/useJourneyStore';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { cx } from '../../lib/cx';

/** Sección no-capítulo (prólogo, portadas de acto, epílogo) que informa su progreso al store. */
export function StorySection({
  id,
  section,
  heightSvh,
  labelledBy,
  children,
  className,
}: {
  id: string;
  section: SectionId;
  heightSvh: number;
  labelledBy: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const setSection = useJourneyStore((s) => s.setSection);
  useScrollProgress(ref, (p) => setSection(section, p), [section]);
  return (
    <section
      ref={ref}
      id={id}
      data-section={section}
      aria-labelledby={labelledBy}
      className={cx('relative px-4 sm:px-10 lg:pl-28', className)}
      style={{ minHeight: `${heightSvh}svh` }}
    >
      {children}
    </section>
  );
}
