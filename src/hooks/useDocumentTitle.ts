import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** document.title por ruta: "Opportunity · ÚLTIMA SEÑAL" (WCAG 2.4.2). */
export function useDocumentTitle(title: string | null): void {
  const { t } = useTranslation('ui');
  const brand = t('brand');
  useEffect(() => {
    document.title = title ? `${title} · ${brand}` : `${brand} · ${t('tagline')}`;
  }, [title, brand, t]);
}
