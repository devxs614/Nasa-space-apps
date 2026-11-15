import { useTranslation } from 'react-i18next';
import { ArrowDown } from 'lucide-react';
import type { Machine } from '../../data/types';
import { BeatShell } from './BeatShell';
import { ScriptLines } from './ScriptLines';
import { AulaQuestions, ProPanel, TodayAndLegacy } from './ChapterExtras';
import { useAppStore } from '../../state/useAppStore';
import { nextMachine } from '../../data/machines';
import { PatchButton } from './PatchButton';
import { scrollToEl } from '../../hooks/useLenis';
import { NasaImage } from '../media/NasaImage';

/** "Legado": dónde está hoy, cadena de herencia, parche, Modo Pro y preguntas de aula. */
export function BeatLegacy({ machine, standalone }: { machine: Machine; standalone?: boolean }) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const classroom = useAppStore((s) => s.classroomMode);
  const next = nextMachine(machine.id);
  return (
    <BeatShell machine={machine} beat="legacy" wide>
      <div className="max-w-[600px] space-y-4">
        <ScriptLines machine={machine} beat="legacy" />
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <TodayAndLegacy machine={machine} />
        {machine.imageQueries[0] && (
          <NasaImage
            query={machine.imageQueries[0]}
            alt={machine.today.text[locale]}
            poster={machine.id}
          />
        )}
      </div>
      <PatchButton machine={machine} />
      <ProPanel machine={machine} />
      {classroom && <AulaQuestions machine={machine} />}
      {!standalone && (
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            const el = document.getElementById(next ? next.id : 'relevo');
            if (el) scrollToEl(el);
          }}
        >
          <ArrowDown size={18} aria-hidden="true" />
          {next ? t('beat.nextChapter', { name: next.name[locale] }) : t('beat.toEpilogue')}
        </button>
      )}
    </BeatShell>
  );
}
