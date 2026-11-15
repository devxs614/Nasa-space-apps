import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLenis, scrollToEl } from '../hooks/useLenis';
import { refreshScroll } from '../hooks/useScrollProgress';
import { useAppStore } from '../state/useAppStore';
import { useJourneyStore } from '../state/useJourneyStore';
import { Prologue } from '../components/journey/Prologue';
import { ActCover } from '../components/journey/ActCover';
import { Epilogue } from '../components/journey/Epilogue';
import { ChapterSection } from '../components/chapter/ChapterSection';
import { ProgressRail } from '../components/layout/ProgressRail';
import { ACTS } from '../data/acts';
import { MACHINES_BY_ID } from '../data/machines';

/** La Travesía: prólogo, cuatro actos, quince capítulos y epílogo (Parte 8.1). */
export function JourneyPage() {
  const reduced = useAppStore((s) => s.reducedMotion);
  const locale = useAppStore((s) => s.locale);
  const textScale = useAppStore((s) => s.textScale);
  const classroom = useAppStore((s) => s.classroomMode);
  const express = useJourneyStore((s) => s.express);
  const chapterId = useJourneyStore((s) => s.chapterId);
  const { hash } = useLocation();
  useDocumentTitle(chapterId ? MACHINES_BY_ID[chapterId].name[locale] : null);
  useLenis(!reduced);

  useEffect(() => {
    refreshScroll();
  }, [locale, textScale, express, classroom, reduced]);

  useEffect(() => {
    if (!hash) {
      useJourneyStore.getState().setSection('prologue', 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) scrollToEl(el, true);
    }, 120);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <div className="relative">
      <ProgressRail />
      <Prologue />
      {ACTS.map((act) => (
        <div key={act.world}>
          <ActCover act={act} />
          {act.machines.map((id) => (
            <ChapterSection key={id} machine={MACHINES_BY_ID[id]} />
          ))}
        </div>
      ))}
      <Epilogue />
    </div>
  );
}
