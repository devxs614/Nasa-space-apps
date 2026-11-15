import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageShell } from '../components/layout/PageShell';

export function NotFoundPage() {
  const { t } = useTranslation('ui');
  return (
    <PageShell title={t('notFound.title')} intro={<p>{t('notFound.body')}</p>}>
      <Link to="/" className="btn btn-primary">
        {t('notFound.home')}
      </Link>
    </PageShell>
  );
}
