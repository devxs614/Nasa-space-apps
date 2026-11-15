import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArrowDown, Map, LayoutGrid, Play } from 'lucide-react';
import { StorySection } from './Section';
import { VoiceLine } from '../chapter/VoiceLine';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useAppStore } from '../../state/useAppStore';
import { census } from '../../data/acts';
import { MACHINES } from '../../data/machines';
import { lightTime } from '../../lib/astro';
import { formatLightTime } from '../../lib/format';
import { scrollToEl } from '../../hooks/useLenis';
import { refreshScroll } from '../../hooks/useScrollProgress';
import { announce } from '../layout/LiveRegion';
import { LumiAvatar } from '../lumi/LumiAvatar';

/** Prólogo "Silencio" (Partes 8.3 y 12.2): portada, antenas, censo, LUMI, elegir viaje y despegue. */
export function Prologue() {
  const { t } = useTranslation(['ui', 'chapters']);
  const locale = useAppStore((s) => s.locale);
  const progress = useAppStore((s) => s.progress);
  const express = useJourneyStore((s) => s.express);
  const setExpress = useJourneyStore((s) => s.setExpress);
  const setDemo = useJourneyStore((s) => s.setDemo);
  const c = census();
  const moonLight = formatLightTime(lightTime('moon').seconds ?? 0, locale);
  const resume = useMemo(
    () => [...MACHINES].reverse().find((m) => progress[m.id]?.visited),
    [progress],
  );

  const choose = (exp: boolean) => {
    setExpress(exp);
    announce(exp ? t('prologue.expressOn') : t('prologue.fullOn'));
    refreshScroll();
    const el = document.getElementById('luna');
    if (el) window.setTimeout(() => scrollToEl(el), 60);
  };

  const block = 'flex min-h-[85svh] max-w-[640px] flex-col justify-center gap-4 py-16';
  return (
    <StorySection id="prologo" section="prologue" heightSvh={500} labelledBy="prologue-title">
      <div className="flex min-h-svh flex-col justify-center gap-6 pt-20 pb-16">
        <p className="font-mono text-[0.8125rem] tracking-[0.3em] text-signal uppercase">
          {t('ui:brandOther')}
        </p>
        <h1
          id="prologue-title"
          className="font-heading text-[length:var(--fs-display-xl)] leading-[0.92] font-black tracking-[-0.03em] uppercase"
        >
          {t('ui:brand')}
        </h1>
        <p className="font-story text-[1.5rem] text-ink-dim italic">{t('ui:tagline')}</p>
        <p className="reading-col text-[1.15rem]">{t('ui:concept')}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => setDemo(true)}>
            <Play size={18} aria-hidden="true" />
            {t('prologue.demo')}
          </button>
          {resume && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const el = document.getElementById(resume.id);
                if (el) scrollToEl(el);
              }}
            >
              {t('prologue.continue', { name: resume.name[locale] })}
            </button>
          )}
        </div>
        <p className="mt-8 flex items-center gap-2 font-mono text-[0.8125rem] text-ink-dim">
          <ArrowDown size={16} aria-hidden="true" />
          {t('prologue.scrollHint')}
        </p>
      </div>
      <div className={block}>
        <VoiceLine speaker="lumi" lumiFull text={t('chapters:prologue.1')} />
        <VoiceLine speaker="lumi" text={t('chapters:prologue.2')} />
        <VoiceLine speaker="note" text={t('chapters:prologue.antennas')} />
      </div>
      <div className={block}>
        <VoiceLine speaker="lumi" text={t('chapters:prologue.3')} />
        <VoiceLine speaker="log" text={t('chapters:prologue.census', c)} />
      </div>
      <div className={block}>
        <div className="flex items-center gap-3">
          <LumiAvatar size={64} />
          <h2 className="font-heading text-[length:var(--fs-h2)] font-bold">
            {t('chapters:prologue.voicesTitle')}
          </h2>
        </div>
        <VoiceLine speaker="lumi" text={t('chapters:prologue.5')} />
        <VoiceLine speaker="machine" text={t('chapters:prologue.exampleMachine')} />
        <VoiceLine speaker="lumi" text={t('chapters:prologue.exampleLumi')} />
        <VoiceLine speaker="log" text={t('chapters:prologue.exampleLog')} />
        <VoiceLine speaker="you" text={t('chapters:prologue.exampleYou')} />
        <VoiceLine speaker="lumi" text={t('chapters:prologue.6')} />
      </div>
      <div className={block}>
        <h2 className="font-heading text-[length:var(--fs-h2)] font-bold">
          {t('prologue.chooseTitle')}
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            aria-pressed={!express}
            onClick={() => choose(false)}
          >
            {t('prologue.full')}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-lg"
            aria-pressed={express}
            onClick={() => choose(true)}
          >
            {t('prologue.express')}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/atlas/luna" className="btn btn-subtle">
            <Map size={18} aria-hidden="true" />
            {t('prologue.toAtlas')}
          </Link>
          <Link to="/maquinas" className="btn btn-subtle">
            <LayoutGrid size={18} aria-hidden="true" />
            {t('prologue.toCatalog')}
          </Link>
        </div>
      </div>
      <div className={block}>
        <VoiceLine speaker="lumi" text={t('chapters:prologue.8')} />
        <p className="font-mono text-[0.875rem] text-ink-dim">
          {t('prologue.lightToMoon')}: <span className="text-amber">{moonLight}</span> ·{' '}
          {t('badge.estimate')}
        </p>
      </div>
    </StorySection>
  );
}
