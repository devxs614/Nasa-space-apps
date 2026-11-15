import { useEffect, useId, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Eye, Maximize, SunMoon, ZoomIn, ZoomOut } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAppStore } from '../state/useAppStore';
import { useJourneyStore } from '../state/useJourneyStore';
import { useUiStore } from '../state/useUiStore';
import { SITE_BY_ID, sitesOn } from '../data/sites';
import type { Site } from '../data/types';
import { KIND_DOT, KIND_ORDER, SiteList } from '../components/atlas/SiteList';
import { SiteDetail } from '../components/atlas/SiteDetail';
import { Badge } from '../components/ui/Badge';
import { announce } from '../components/layout/LiveRegion';
import { cx } from '../lib/cx';

export interface AtlasPageProps {
  body: 'moon' | 'mars';
}

/**
 * Atlas de la Luna y de Marte (Parte 8.9): globo con balizas en coordenadas reales y, a su lado,
 * la lista de sitios que hace lo mismo con teclado. El globo es decorativo para lectores de pantalla.
 */
export function AtlasPage({ body }: AtlasPageProps) {
  const { t } = useTranslation(['ui', 'common']);
  const uid = useId();
  const locale = useAppStore((s) => s.locale);
  const hidden = useJourneyStore((s) => s.atlasHidden);
  const selectedId = useJourneyStore((s) => s.atlasSiteId);
  const dayNight = useJourneyStore((s) => s.atlasDayNight);
  const setSite = useJourneyStore((s) => s.setAtlasSite);
  const toggleKind = useJourneyStore((s) => s.toggleAtlasKind);
  const setDayNight = useJourneyStore((s) => s.setAtlasDayNight);
  const command = useJourneyStore((s) => s.sendAtlasCommand);
  const resetAtlas = useJourneyStore((s) => s.resetAtlas);
  const threeFailed = useUiStore((s) => s.threeFailed);
  const title = t(body === 'moon' ? 'routes.atlasMoon' : 'routes.atlasMars');
  useDocumentTitle(title);

  // Cada atlas empieza limpio: sin sitio elegido y con todas las capas.
  useEffect(() => {
    resetAtlas();
    window.scrollTo(0, 0);
    return () => resetAtlas();
  }, [body, resetAtlas]);

  const all = useMemo(() => sitesOn(body), [body]);
  const kinds = KIND_ORDER.filter((k) => all.some((s) => s.kind === k));
  const visible = all.filter((s) => !hidden.includes(s.kind));
  const selected = selectedId ? (SITE_BY_ID.get(selectedId) ?? null) : null;
  const shown = selected && selected.body === body && visible.includes(selected) ? selected : null;

  const panel = useRef<HTMLElement>(null);
  const select = (s: Site, via: 'focus' | 'click') => {
    if (s.id !== selectedId) {
      setSite(s.id);
      announce(t('atlas.announce', { name: s.label[locale] }));
    }
    // En móvil la lista tapa el globo: al pulsar, se sube hasta ver el globo girar y la ficha.
    if (via === 'click' && window.innerWidth < 1024 && panel.current) {
      const top = panel.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top - window.innerHeight * 0.5,
        behavior: useAppStore.getState().reducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  const iconBtn = 'btn btn-ghost btn-icon';
  return (
    <div data-atlas={body} className="relative px-4 pt-20 pb-10 lg:h-svh lg:min-h-[640px] lg:px-8">
      <header className="pointer-events-auto relative max-w-[440px]">
        <p className="mb-2 font-mono text-[0.8125rem] tracking-[0.2em] text-accent uppercase">
          {t(`common:worlds.${body}`)}
        </p>
        <h1 className="font-heading text-[length:var(--fs-h1)] leading-none font-bold">{title}</h1>
        <p className="mt-3 rounded-card bg-void/70 text-ink-dim">
          {t(body === 'moon' ? 'atlas.introMoon' : 'atlas.introMars')}
        </p>
        <div
          role="group"
          aria-label={t('atlas.controls')}
          className="no-print mt-4 flex flex-wrap items-center gap-2"
        >
          {body === 'moon' ? (
            <button type="button" className="btn btn-ghost" onClick={() => command('near-side')}>
              <Eye size={18} aria-hidden="true" />
              {t('atlas.nearSide')}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost"
              aria-pressed={dayNight}
              onClick={() => setDayNight(!dayNight)}
            >
              <SunMoon size={18} aria-hidden="true" />
              {t('atlas.dayNight')}
            </button>
          )}
          <button
            type="button"
            className={iconBtn}
            onClick={() => command('zoom-in')}
            aria-label={t('atlas.zoomIn')}
            title={t('atlas.zoomIn')}
          >
            <ZoomIn size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => command('zoom-out')}
            aria-label={t('atlas.zoomOut')}
            title={t('atlas.zoomOut')}
          >
            <ZoomOut size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => command('reset')}
            aria-label={t('atlas.reset')}
            title={t('atlas.reset')}
          >
            <Maximize size={18} aria-hidden="true" />
          </button>
        </div>
        {body === 'mars' && dayNight && (
          <p className="mt-2 rounded-card bg-void/70 text-[0.9375rem] text-ink-dim" role="status">
            {t('atlas.dayNightOn')}
          </p>
        )}
        <p className="mt-3 flex flex-wrap items-center gap-2 text-[0.9375rem] text-ink-dim">
          <Badge tone="render">{t('badge.render3d')}</Badge>
          <span className="rounded-chip bg-void/70 px-1">
            {threeFailed ? t('atlas.noWebgl') : t('atlas.dragHint')}
          </span>
        </p>
        <p className="mt-3">
          <Link to={body === 'moon' ? '/atlas/marte' : '/atlas/luna'} className="btn btn-subtle">
            {t(body === 'moon' ? 'atlas.toMars' : 'atlas.toMoon')}
          </Link>
        </p>
      </header>

      {/* En móvil, hueco para ver y girar el globo entre la cabecera y la lista. */}
      <div className="h-[46svh] lg:hidden" aria-hidden="true" />

      <aside
        ref={panel}
        aria-label={t('atlas.sites')}
        className="panel-solid pointer-events-auto relative flex flex-col gap-5 p-4 lg:absolute lg:top-20 lg:right-8 lg:bottom-8 lg:w-[380px] lg:overflow-y-auto"
      >
        <section aria-labelledby={`${uid}-detail`} aria-live="off">
          <h2
            id={`${uid}-detail`}
            className="mb-2 font-mono text-[0.8125rem] tracking-[0.2em] text-ink-dim uppercase"
          >
            {t('atlas.selected')}
          </h2>
          {shown ? (
            <SiteDetail key={shown.id} site={shown} onClose={() => setSite(null)} />
          ) : (
            <p className="text-[0.9375rem] text-ink-dim">{t('atlas.nothingSelected')}</p>
          )}
        </section>

        <fieldset>
          <legend className="mb-2 font-mono text-[0.8125rem] tracking-[0.2em] text-ink-dim uppercase">
            {t('atlas.layers')}
          </legend>
          <div className="flex flex-wrap gap-2">
            {kinds.map((k) => {
              const on = !hidden.includes(k);
              return (
                <label
                  key={k}
                  className={cx(
                    'flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 text-[0.9375rem]',
                    on ? 'border-line-strong text-ink' : 'border-line text-ink-dim',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleKind(k)}
                    className="h-4 w-4 accent-[var(--signal)]"
                  />
                  <span
                    aria-hidden="true"
                    className={cx('h-2.5 w-2.5 rounded-full', KIND_DOT[k])}
                  />
                  {t(`common:siteKinds.${k}`)}
                </label>
              );
            })}
          </div>
        </fieldset>

        <section aria-labelledby={`${uid}-sites`}>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id={`${uid}-sites`}
              className="font-mono text-[0.8125rem] tracking-[0.2em] text-ink-dim uppercase"
            >
              {t('atlas.sites')}
            </h2>
            <p className="font-mono text-[0.8125rem] text-ink-dim" aria-live="polite">
              {t('atlas.sitesCount', { n: visible.length })}
            </p>
          </div>
          <p className="mb-2 text-[0.9375rem] text-ink-dim">{t('atlas.listHint')}</p>
          <SiteList
            sites={visible}
            selectedId={shown?.id ?? null}
            onSelect={select}
            labelledBy={`${uid}-sites`}
          />
        </section>
      </aside>
    </div>
  );
}
