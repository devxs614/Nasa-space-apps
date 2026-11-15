import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';

/** Marcador temporal hasta la fase 4. */
export function PlaceholderInteraction({ onSkip }: InteractionProps) {
  const { t } = useTranslation('ui');
  return (
    <div className="rounded-card border border-line p-4">
      <button type="button" className="btn btn-ghost" onClick={onSkip}>
        {t('interaction.skip')}
      </button>
    </div>
  );
}
