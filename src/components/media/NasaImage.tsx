import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';
import { fetchNasaImage, type NasaImageItem } from '../../lib/nasaImages';
import { Poster } from './Poster';
import { useAppStore } from '../../state/useAppStore';
import { formatDate } from '../../lib/format';
import { cx } from '../../lib/cx';

export interface NasaImageProps {
  query: string;
  alt: string;
  poster: string;
  className?: string;
}

/** Foto real de la NASA Image and Video Library con crédito; póster si tarda más de 6 s o falla (Parte 16.7). */
export function NasaImage({ query, alt, poster, className }: NasaImageProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const reduced = useAppStore((s) => s.reducedMotion);
  const [state, setState] = useState<{
    item: NasaImageItem | null;
    status: 'loading' | 'ok' | 'fallback';
  }>({ item: null, status: 'loading' });

  useEffect(() => {
    let alive = true;
    const giveUp = window.setTimeout(
      () =>
        alive && setState((s) => (s.status === 'loading' ? { item: null, status: 'fallback' } : s)),
      6000,
    );
    void fetchNasaImage(query).then((item) => {
      if (!alive) return;
      setState(item ? { item, status: 'ok' } : { item: null, status: 'fallback' });
    });
    return () => {
      alive = false;
      window.clearTimeout(giveUp);
    };
  }, [query]);

  if (state.status === 'loading')
    return (
      <div
        className={cx(
          'aspect-[8/5] w-full rounded-card border border-line',
          !reduced && 'skeleton',
          className,
        )}
        aria-hidden="true"
      />
    );
  if (state.status === 'fallback' || !state.item)
    return (
      <figure className={className}>
        <Poster name={poster} alt={alt} />
        <figcaption className="mt-1 font-mono text-[0.8125rem] text-ink-dim">
          {t('media.illustration')}
        </figcaption>
      </figure>
    );
  const it = state.item;
  return (
    <figure className={cx('overflow-hidden rounded-card border border-line', className)}>
      <img
        src={it.src}
        alt={alt}
        width={800}
        height={500}
        loading="lazy"
        decoding="async"
        className="aspect-[8/5] w-full bg-deep object-cover"
      />
      <figcaption className="p-2 text-[0.8125rem] text-ink-dim">
        <span className="flex items-center gap-1 font-mono text-ink">
          <Camera size={14} aria-hidden="true" />
          {t('badge.photo')} · {it.credit}
        </span>
        <span className="block">
          {it.title}
          {it.date && ` · ${formatDate(it.date, locale)}`} ·{' '}
          <a href={it.page} target="_blank" rel="noopener noreferrer">
            {t('media.credit', { id: it.nasaId })}
          </a>
        </span>
      </figcaption>
    </figure>
  );
}
