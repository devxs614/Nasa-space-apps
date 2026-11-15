import { useTranslation } from 'react-i18next';

export function RouteFallback() {
  const { t } = useTranslation('ui');
  return (
    <div className="flex min-h-[60svh] items-center justify-center" role="status">
      <p className="font-mono text-sm tracking-widest text-ink-dim uppercase">
        {t('common.loading')}
      </p>
    </div>
  );
}
