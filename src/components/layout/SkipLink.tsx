import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export function SkipLink() {
  const { t } = useTranslation('ui');
  const cls =
    'btn btn-primary fixed top-2 left-2 z-[60] -translate-y-24 focus:translate-y-0 focus-visible:translate-y-0';
  return (
    <div className="no-print">
      <a href="#contenido" className={cls}>
        {t('skip.content')}
      </a>
      <Link to="/lectura" className={cls}>
        {t('skip.reading')}
      </Link>
    </div>
  );
}
