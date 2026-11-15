import { useTranslation } from 'react-i18next';
import { PageShell } from '../components/layout/PageShell';

export interface AtlasPageProps {
  body: 'moon' | 'mars';
}

export function AtlasPage({ body }: AtlasPageProps) {
  const { t } = useTranslation('ui');
  return <PageShell title={t(body === 'moon' ? 'routes.atlasMoon' : 'routes.atlasMars')} />;
}
