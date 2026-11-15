import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InteractionProps } from './types';
import { Shell, useDone } from './Shell';
import { Slider } from '../ui/Slider';
import { useJourneyStore } from '../../state/useJourneyStore';
import { SourceBadge } from '../ui/SourceBadge';

/** 9. Phoenix — "Lo que desapareció": el hielo se sublima en cuatro días. */
export function PhoenixInteraction({ express, onComplete, onSkip }: InteractionProps) {
  const { t } = useTranslation('ui');
  const setFx = useJourneyStore((s) => s.setFx);
  const { done, finish } = useDone(onComplete);
  const [dug, setDug] = useState(false);
  const [day, setDay] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  useEffect(() => () => setFx('dig', 0), [setFx]);
  const clumps = [18, 30, 44, 57, 70];
  return (
    <Shell
      title={t('ix.phoenix.title')}
      done={done}
      successText={t('ix.phoenix.success')}
      express={express}
      onSkip={onSkip}
      onSeeResult={() => {
        setDug(true);
        setDay(4);
        setAnswer('sublimated');
        finish();
      }}
      illustrative={false}
      live={
        answer ? t(answer === 'sublimated' ? 'ix.phoenix.right' : 'ix.phoenix.wrong') : undefined
      }
    >
      <button
        type="button"
        className="btn btn-primary"
        disabled={dug}
        onClick={() => {
          setDug(true);
          setFx('dig', 1);
          window.setTimeout(() => setFx('dig', 0), 2000);
        }}
      >
        {t('ix.phoenix.dig')}
      </button>
      {dug && (
        <>
          <div className="ix-stage mt-3 h-28" aria-hidden="true">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-full w-full">
              <rect width="100" height="30" fill="#8f6a52" />
              <rect x="12" y="10" width="70" height="12" fill="#4a2f22" />
              {clumps.map((x) => (
                <circle
                  key={x}
                  cx={x}
                  cy="18"
                  r="2.2"
                  fill="#f2f0e6"
                  opacity={Math.max(0, 1 - day / 4)}
                />
              ))}
            </svg>
          </div>
          <Slider
            label={t('ix.phoenix.time')}
            value={day}
            min={0}
            max={4}
            step={1}
            format={(v) => t('ix.phoenix.day', { n: v })}
            onChange={setDay}
          />
          {day === 4 && (
            <fieldset className="mt-2">
              <legend className="mb-2 font-bold">{t('ix.phoenix.question')}</legend>
              <div className="flex flex-wrap gap-2">
                {(['melted', 'sublimated', 'wind'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-pressed={answer === k}
                    onClick={() => {
                      setAnswer(k);
                      finish(k);
                    }}
                  >
                    {t(`ix.phoenix.${k}`)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {answer && (
            <p className="mt-3">
              {t(answer === 'sublimated' ? 'ix.phoenix.right' : 'ix.phoenix.wrong')}{' '}
              <SourceBadge sourceIds={['nasa-phoenix']} />
            </p>
          )}
        </>
      )}
    </Shell>
  );
}
