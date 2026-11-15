import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { X } from 'lucide-react';
import type { Site } from '../../data/types';
import { APOLLO_LANDINGS, MACHINES_BY_ID } from '../../data/machines';
import { EXTRAS } from '../../data/extras';
import { sitesFor } from '../../data/sites';
import { useAppStore } from '../../state/useAppStore';
import { formatDate, formatLatLon } from '../../lib/format';
import { SourceBadge } from '../ui/SourceBadge';
import { Badge } from '../ui/Badge';
import { NasaImage } from '../media/NasaImage';

/** Ficha del sitio elegido en el atlas (Parte 8.9): nombre, fechas, coordenadas, estado, foto y capítulo. */
export function SiteDetail({ site, onClose }: { site: Site; onClose: () => void }) {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  const machine = site.machineId ? MACHINES_BY_ID[site.machineId] : null;
  const extra = machine ? null : EXTRAS.find((e) => e.id === site.id);
  // Fechas por sitio: la tabla de alunizajes Apollo, o las de la máquina si solo tiene un sitio.
  const apollo = APOLLO_LANDINGS.find((a) => a.site === site.id);
  const single = machine && sitesFor(machine.id).length === 1 ? machine : null;
  const arrival = apollo?.date ?? single?.arrival?.date ?? null;
  const lastSignal = single && !single.lastSignal.noteOnly ? single.lastSignal.date : null;

  return (
    <div className="space-y-3" data-site-detail={site.id}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-[1.15rem] font-bold">{site.label[locale]}</h3>
        <button
          type="button"
          className="btn btn-subtle btn-icon -mt-2 -mr-2 shrink-0"
          onClick={onClose}
          aria-label={t('atlas.close')}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[0.9375rem]">
        <dt className="text-ink-dim">{t('atlas.kind')}</dt>
        <dd>{t(`common:siteKind.${site.kind}`)}</dd>
        {machine && (
          <>
            <dt className="text-ink-dim">{t('atlas.machine')}</dt>
            <dd>{machine.name[locale]}</dd>
            <dt className="text-ink-dim">{t('atlas.status')}</dt>
            <dd>{t(`common:status.${machine.status}`)}</dd>
          </>
        )}
        {arrival && (
          <>
            <dt className="text-ink-dim">{t('atlas.arrival')}</dt>
            <dd>{formatDate(arrival, locale)}</dd>
          </>
        )}
        {lastSignal && (
          <>
            <dt className="text-ink-dim">{t('atlas.lastSignal')}</dt>
            <dd>{formatDate(lastSignal, locale)}</dd>
          </>
        )}
        <dt className="text-ink-dim">{t('atlas.coords')}</dt>
        <dd className="font-mono tabular">
          {site.hideCoords ? (
            <span className="font-reading">{t('atlas.coordsHidden')}</span>
          ) : (
            formatLatLon(site.lat, site.lon, locale)
          )}
        </dd>
      </dl>
      <div className="flex flex-wrap items-center gap-2">
        {site.approx && <Badge tone="approx">{t('badge.approxPosition')}</Badge>}
        <SourceBadge sourceIds={site.sourceIds} />
      </div>
      {extra && (
        <>
          <Badge tone="info">{t('badge.extra')}</Badge>
          <p className="text-[0.9375rem]">{extra.text[locale]}</p>
        </>
      )}
      {machine && (
        <>
          {machine.imageQueries[0] && (
            <NasaImage
              query={machine.imageQueries[0]}
              alt={machine.today.text[locale]}
              poster={machine.id}
            />
          )}
          <Link to={`/maquinas/${machine.id}`} className="btn btn-primary">
            {t('atlas.goToChapter', { name: (machine.shortName ?? machine.name)[locale] })}
          </Link>
        </>
      )}
    </div>
  );
}
