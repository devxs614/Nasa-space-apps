import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export const REPO_URL = 'https://github.com/devxs614/Nasa-space-apps';

export function Footer() {
  const { t } = useTranslation('ui');
  return (
    <footer className="relative z-10 border-t border-line bg-void/90 px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="reading-col text-[0.9375rem] text-ink-dim">{t('footer.disclaimer')}</p>
        <nav aria-label={t('footer.nav')} className="no-print mt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
            <li>
              <Link to="/fuentes">{t('footer.sources')}</Link>
            </li>
            <li>
              <Link to="/acerca#ia">{t('footer.ai')}</Link>
            </li>
            <li>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                {t('footer.repo')}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
