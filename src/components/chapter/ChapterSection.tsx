import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Machine } from '../../data/types';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { BEATS } from '../../state/useJourneyStore';
import { BeatWake } from './BeatWake';
import { BeatIdentity } from './BeatIdentity';
import { BeatJourney, BeatArrival } from './BeatTravel';
import { BeatWork } from './BeatWork';
import { BeatLastSignal } from './BeatLastSignal';
import { BeatLegacy } from './BeatLegacy';
import { announce } from '../layout/LiveRegion';
import { MACHINES } from '../../data/machines';

export interface ChapterSectionProps {
  machine: Machine;
  standalone?: boolean;
}

/** Un capítulo: `<section id>` con su encabezado y sus siete momentos (Parte 16.4). */
export function ChapterSection({ machine, standalone }: ChapterSectionProps) {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  const express = useJourneyStore((s) => s.express);
  const active = useJourneyStore((s) => s.chapterId === machine.id);
  const markVisited = useAppStore((s) => s.markVisited);
  const announced = useRef(false);

  useEffect(() => {
    if (!active) {
      announced.current = false;
      return;
    }
    markVisited(machine.id);
    if (!announced.current) {
      announced.current = true;
      announce(
        t('beat.announce', {
          n: machine.order,
          total: MACHINES.length,
          name: machine.name[locale],
        }),
        1000,
      );
    }
  }, [active, machine, markVisited, t, locale]);

  const beats = BEATS.filter((b) => !(express && (b === 'journey' || b === 'arrival')));
  const Tag = standalone ? 'div' : 'section';
  return (
    <Tag
      id={standalone ? undefined : machine.id}
      data-chapter={machine.id}
      aria-labelledby={`ch-${machine.id}`}
      className="relative"
    >
      <header className="px-4 pt-[16svh] sm:px-10 lg:pl-28 [&>*]:w-fit [&>*]:rounded-card [&>*]:bg-void/70 [&>*]:px-2">
        <p className="font-mono text-[0.8125rem] tracking-[0.2em] text-accent uppercase">
          {t('beat.chapterKicker', {
            n: machine.order,
            world: t(`common:worlds.${machine.world}`),
          })}{' '}
          · {t(`common:types.${machine.type}`)}
        </p>
        {standalone ? (
          <h1
            id={`ch-${machine.id}`}
            className="mt-2 max-w-[900px] font-heading text-[length:var(--fs-h1)] font-bold"
          >
            {machine.name[locale]}
          </h1>
        ) : (
          <h2
            id={`ch-${machine.id}`}
            className="mt-2 max-w-[900px] font-heading text-[length:var(--fs-h1)] font-bold"
          >
            {machine.name[locale]}
          </h2>
        )}
        <p className="mt-2 font-story text-[1.35rem] text-ink-dim italic">
          {machine.chapterTitle[locale]}
        </p>
      </header>
      {beats.map((b) => {
        switch (b) {
          case 'wake':
            return <BeatWake key={b} machine={machine} />;
          case 'identity':
            return <BeatIdentity key={b} machine={machine} />;
          case 'journey':
            return <BeatJourney key={b} machine={machine} />;
          case 'arrival':
            return <BeatArrival key={b} machine={machine} />;
          case 'work':
            return <BeatWork key={b} machine={machine} />;
          case 'lastSignal':
            return <BeatLastSignal key={b} machine={machine} />;
          case 'legacy':
            return <BeatLegacy key={b} machine={machine} standalone={standalone} />;
        }
      })}
    </Tag>
  );
}
