import { useTranslation } from 'react-i18next';
import { Award, Check } from 'lucide-react';
import type { Machine } from '../../data/types';
import { useAppStore } from '../../state/useAppStore';
import { announce } from '../layout/LiveRegion';
import { useToast } from '../ui/Toast';
import { playSfx } from '../../audio/play';
import { Link } from 'react-router';
import { useState } from 'react';
import { Patch, patchState } from '../passport/Patch';

/** "Recibir parche" (Parte 14.6): aparece aunque no se haya enviado la señal. */
export function PatchButton({ machine }: { machine: Machine }) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const done = useAppStore((s) => s.progress[machine.id]?.completed ?? false);
  const best = useAppStore((s) => s.progress[machine.id]?.bestQuiz ?? 0);
  const [justEarned, setJustEarned] = useState(false);
  const complete = useAppStore((s) => s.completeChapter);
  const { push } = useToast();
  if (done)
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Patch machine={machine} state={patchState(true, best)} size={120} animate={justEarned} />
        <p className="flex flex-wrap items-center gap-2 text-phosphor">
          <Check size={18} aria-hidden="true" />
          {t('beat.patchEarned')}
          <Link to="/pasaporte" className="ml-2">
            {t('beat.seePassport')}
          </Link>
        </p>
      </div>
    );
  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => {
        complete(machine.id);
        setJustEarned(true);
        playSfx('stitch');
        const body = t('beat.patchEarnedBody', { name: machine.name[locale] });
        push({ title: t('beat.patchEarned'), body, tone: 'success' });
        announce(`${t('beat.patchEarned')}. ${body}`);
      }}
    >
      <Award size={18} aria-hidden="true" />
      {t('beat.receivePatch')}
    </button>
  );
}
