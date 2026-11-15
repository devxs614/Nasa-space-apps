import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Feather, RefreshCw } from 'lucide-react';
import { useUiStore } from '../../state/useUiStore';
import { useAppStore } from '../../state/useAppStore';
import { useToast } from '../ui/Toast';

/** Avisos del 3D (Partes 17.8 y 17.9): modo ligero automático, pregunta por FPS bajos y reintento tras un fallo. */
export function ThreeNotices() {
  const { t } = useTranslation('ui');
  const liteBanner = useUiStore((s) => s.liteBanner);
  const liteAsk = useUiStore((s) => s.liteAsk);
  const failed = useUiStore((s) => s.threeFailed);
  const losses = useUiStore((s) => s.contextLosses);
  const setLiteBanner = useUiStore((s) => s.setLiteBanner);
  const setLiteAsk = useUiStore((s) => s.setLiteAsk);
  const setThreeFailed = useUiStore((s) => s.setThreeFailed);
  const setLiteMode = useAppStore((s) => s.setLiteMode);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const { push } = useToast();

  useEffect(() => {
    if (!liteBanner) return;
    push({ title: t('three.liteStarted'), tone: 'info' });
    setLiteBanner(false);
  }, [liteBanner, push, setLiteBanner, t]);

  if (!liteAsk && !failed) return null;
  const askLite = liteAsk || (failed && losses >= 2);
  return (
    <div
      role="region"
      aria-label={t('settings.lite')}
      className="no-print fixed inset-x-3 top-16 z-30 mx-auto max-w-xl"
    >
      <div
        className="panel-solid flex flex-wrap items-center gap-3 p-3 shadow-xl"
        aria-live="polite"
      >
        <p className="mr-auto">
          {failed ? (losses >= 2 ? t('three.lostTwice') : t('three.failed')) : t('three.liteAsk')}
        </p>
        {failed && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setThreeFailed(false)}
          >
            <RefreshCw size={16} aria-hidden="true" />
            {t('three.retry')}
          </button>
        )}
        {askLite && (
          <>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setLiteMode(true);
                setLiteAsk(false);
                if (failed) setThreeFailed(false);
              }}
            >
              <Feather size={16} aria-hidden="true" />
              {t('common.yes')}
            </button>
            <button
              type="button"
              className="btn btn-subtle btn-sm"
              onClick={() => {
                updateSettings({ liteDecided: true });
                setLiteAsk(false);
              }}
            >
              {t('common.noThanks')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
