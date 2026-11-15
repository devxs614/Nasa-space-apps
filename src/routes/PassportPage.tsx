import { useTranslation } from 'react-i18next';
import { PageShell } from '../components/layout/PageShell';

export function PassportPage() {
  const { t } = useTranslation('ui');
  return <PageShell title={t('routes.passport')} />;
}
