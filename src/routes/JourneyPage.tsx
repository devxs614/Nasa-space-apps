import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function JourneyPage() {
  const { t } = useTranslation('ui');
  useDocumentTitle(null);
  return (
    <section className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-[length:var(--fs-display-xl)] font-black uppercase">
        {t('brand')}
      </h1>
      <p className="mt-4 text-ink-dim">{t('tagline')}</p>
    </section>
  );
}
