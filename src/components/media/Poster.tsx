import { publicUrl } from '../../lib/assets';
import { cx } from '../../lib/cx';

export interface PosterProps {
  name: string; // id de máquina o 'scene-<clave>'
  alt: string;
  className?: string;
  eager?: boolean;
}

/** Póster SVG estático (modo sin WebGL y carga). Siempre con tamaño para no mover el diseño. */
export function Poster({ name, alt, className, eager }: PosterProps) {
  return (
    <img
      src={publicUrl(`posters/${name}.svg`)}
      alt={alt}
      width={800}
      height={500}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cx('block h-auto w-full rounded-card border border-line bg-void', className)}
    />
  );
}
