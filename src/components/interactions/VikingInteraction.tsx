import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { useJourneyStore } from '../../state/useJourneyStore';
import { SourceBadge } from '../ui/SourceBadge';

/** 5. Viking — "¿Vida o química?". Sin detalles inventados de los experimentos. */
export function VikingInteraction({ express, onComplete, onSkip }: InteractionProps) {
  const { t } = useTranslation('ui');
  const setFx = useJourneyStore((s) => s.setFx);
  const { done, finish } = useDone(onComplete);
  const [sampled, setSampled] = useState(false);
  const [tests, setTests] = useState<Record<string, boolean>>({});
  const [vote, setVote] = useState<'life' | 'chemistry' | null>(null);
  useEffect(() => () => setFx('dig', 0), [setFx]);
  const all = tests.feed && tests.heat && tests.organics;
  return (
    <Shell
      title={t('ix.viking.title')}
      done={done}
      successText={t('ix.viking.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setSampled(true);
        setTests({ feed: true, heat: true, organics: true });
        setVote('chemistry');
        finish();
      }}
      illustrative={false}
      live={
        vote
          ? t('ix.viking.explain')
          : all
            ? `${t('ix.viking.bio')}. ${t('ix.viking.noOrganics')}`
            : undefined
      }
    >
      <button
        type="button"
        className="btn btn-primary"
        disabled={sampled}
        onClick={() => {
          setSampled(true);
          setFx('dig', 1);
          window.setTimeout(() => setFx('dig', 0), 2500);
        }}
      >
        {t('ix.viking.sample')}
      </button>
      {sampled && (
        <div className="mt-3 space-y-3">
          <p>{t('ix.viking.sampled')}</p>
          <div className="flex flex-wrap gap-2">
            {(['feed', 'heat', 'organics'] as const).map((k) => (
              <button
                key={k}
                type="button"
                className="btn btn-ghost btn-sm"
                aria-pressed={Boolean(tests[k])}
                onClick={() => setTests((s) => ({ ...s, [k]: true }))}
              >
                {t(`ix.viking.${k}`)}
              </button>
            ))}
          </div>
          {(tests.feed || tests.heat) && <p className="voice-log">{t('ix.viking.bio')}</p>}
          {tests.organics && <p className="voice-log">{t('ix.viking.noOrganics')}</p>}
          {(tests.feed || tests.heat || tests.organics) && (
            <SourceBadge sourceIds={['nasa-viking1']} />
          )}
          {all && (
            <fieldset>
              <legend className="mb-2 font-bold">{t('ix.viking.vote')}</legend>
              <div className="flex gap-2">
                {(['life', 'chemistry'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="btn btn-ghost"
                    aria-pressed={vote === v}
                    onClick={() => {
                      setVote(v);
                      finish(v);
                    }}
                  >
                    {t(`ix.viking.${v}`)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {vote && (
            <p className="rounded-card border border-signal/40 p-3">{t('ix.viking.explain')}</p>
          )}
        </div>
      )}
    </Shell>
  );
}
