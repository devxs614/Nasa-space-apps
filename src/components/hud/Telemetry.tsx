import { useTranslation } from 'react-i18next';
import type { Machine } from '../../data/types';
import { useAppStore } from '../../state/useAppStore';
import { formatLatLon } from '../../lib/format';

/** Filas de telemetría con datos reales del sitio (Parte 16.3). */
export function Telemetry({ machine }: { machine: Machine }) {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  const site = machine.sites.find((s) => !s.hideCoords);
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-[0.8125rem] tabular">
      <dt className="text-ink-dim">{t('common:types.' + machine.type)}</dt>
      <dd>{machine.body[locale]}</dd>
      {site && (
        <>
          <dt className="text-ink-dim">{site.label[locale]}</dt>
          <dd>
            {formatLatLon(site.lat, site.lon, locale)}
            {site.approx ? ` · ≈ ${t('badge.approxPosition')}` : ''}
          </dd>
        </>
      )}
    </dl>
  );
}
