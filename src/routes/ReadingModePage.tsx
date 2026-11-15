import { useTranslation } from 'react-i18next';
import { PageShell } from '../components/layout/PageShell';

export function ReadingModePage() {
  const { t } = useTranslation('ui');
  return <PageShell title={t('routes.reading')} />;
}
