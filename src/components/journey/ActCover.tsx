import { useTranslation } from 'react-i18next';
import type { Act } from '../../data/acts';
import { StorySection } from './Section';
import { VoiceLine } from '../chapter/VoiceLine';
import { MACHINES_BY_ID } from '../../data/machines';
import { useAppStore } from '../../state/useAppStore';
import { scrollToEl } from '../../hooks/useLenis';
import type { SectionId } from '../../state/useJourneyStore';

/** Portada de acto (Parte 8.4): título, años, frase de LUMI y mini-mapa con sus capítulos. */
export function ActCover({ act }: { act: Act }) {
  const { t } = useTranslation(['ui', 'chapters', 'common']);
  const locale = useAppStore((s) => s.locale);
  return (
    <StorySection
      id={act.anchor}
      section={`act-${act.world}` as SectionId}
      heightSvh={120}
      labelledBy={`act-${act.world}`}
    >
      <div
        className="flex min-h-svh max-w-[900px] flex-col justify-center gap-5 py-20"
        data-act-cover={act.world}
      >
        <p className="font-mono text-[0.8125rem] tracking-[0.3em] text-accent uppercase">
          {t('act.kicker', { n: act.numeral })} · {act.years[0]}–{act.years[1]}
        </p>
        <h2
          id={`act-${act.world}`}
          className="font-heading text-[length:var(--fs-display-l)] leading-[0.95] font-black uppercase"
        >
          {t(`chapters:acts.${act.world}.title`)}
        </h2>
        <VoiceLine
          speaker="lumi"
          text={t(`chapters:acts.${act.world}.lumi`)}
          className="max-w-[600px]"
        />
        <nav aria-label={t('act.chapters')}>
          <ol className="flex flex-wrap gap-2">
            {act.machines.map((id) => {
              const m = MACHINES_BY_ID[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    className="btn btn-subtle btn-sm border-line"
                    onClick={() => {
                      const el = document.getElementById(id);
                      if (el) scrollToEl(el);
                    }}
                  >
                    <span className="font-mono text-ink-dim">
                      {String(m.order).padStart(2, '0')}
                    </span>
                    {m.name[locale]}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <p className="sr-only">{t(`chapters:acts.${act.world}.sceneAlt`)}</p>
      </div>
    </StorySection>
  );
}
