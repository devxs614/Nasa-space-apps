import { useTranslation } from 'react-i18next';
import { PageShell } from '../components/layout/PageShell';

export function ChapterPage() {
  const { t } = useTranslation('ui');
  return <PageShell title={t('routes.catalog')} />;
}
