import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StorySection } from './Section';
import { VoiceLine } from '../chapter/VoiceLine';
import { EPILOGUE_2026 } from '../../data/machines';
import { useAppStore } from '../../state/useAppStore';
import { Badge } from '../ui/Badge';

const PostcardMaker = lazy(() =>
  import('../passport/PostcardMaker').then((m) => ({ default: m.PostcardMaker })),
);

/** Epílogo "El relevo" (Partes 8.8 y 12.7). */
export function Epilogue() {
  const { t } = useTranslation(['ui', 'chapters']);
  const locale = useAppStore((s) => s.locale);
  const block = 'flex min-h-[90svh] max-w-[680px] flex-col justify-center gap-4 py-16';
  return (
    <StorySection id="relevo" section="epilogue" heightSvh={600} labelledBy="epilogue-title">
      <div className={block}>
        <h2
          id="epilogue-title"
          className="font-heading text-[length:var(--fs-display-l)] leading-[0.95] font-black uppercase"
        >
          {t('chapters:epilogue.title')}
        </h2>
        <VoiceLine speaker="lumi" text={t('chapters:epilogue.1')} />
      </div>
      <div className={block}>
        <h3 className="font-heading text-[length:var(--fs-h2)] font-bold">
          {t('chapters:epilogue.chainTitle')}
        </h3>
        <VoiceLine speaker="lumi" text={t('chapters:epilogue.2')} />
        <p className="sr-only">{t('chapters:epilogue.sceneAlt.chain')}</p>
      </div>
      <div className={block}>
        <h3 className="font-heading text-[length:var(--fs-h2)] font-bold">
          {t('chapters:epilogue.yearTitle')}
        </h3>
        {EPILOGUE_2026.map((e) => (
          <VoiceLine
            key={e.id}
            speaker="log"
            text={e.text[locale]}
            sourceIds={e.sourceIds}
            extra={
              'plan' in e && e.plan ? (
                <Badge tone="info" className="mt-2">
                  {t('badge.plan')}
                </Badge>
              ) : undefined
            }
          />
        ))}
        <VoiceLine speaker="lumi" text={t('chapters:epilogue.4')} />
      </div>
      <div className={block}>
        <h3 className="font-heading text-[length:var(--fs-h2)] font-bold">
          {t('chapters:epilogue.youTitle')}
        </h3>
        <VoiceLine speaker="lumi" text={t('chapters:epilogue.5')} />
        <Suspense fallback={null}>
          <PostcardMaker />
        </Suspense>
      </div>
      <div className={block}>
        <h3 className="font-heading text-[length:var(--fs-h2)] font-bold">
          {t('chapters:epilogue.creditsTitle')}
        </h3>
        <p className="text-ink-dim">{t('ui:footer.disclaimer')}</p>
      </div>
    </StorySection>
  );
}
