import { Component, useEffect, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Machine, MachineId } from '../../data/types';
import type { InteractionProps } from '../interactions/types';
import { Poster } from '../media/Poster';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { INTERACTIONS } from '../interactions/registry';
import { META } from '../interactions/meta';
import { InteractionShell } from '../interactions/InteractionShell';
import { loadable, type Loadable } from '../../lib/loadable';

class SlotBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(err: unknown) {
    console.error('interacción', err);
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const cache = new Map<MachineId, Loadable<InteractionProps>>();
function loadableFor(id: MachineId) {
  let c = cache.get(id);
  if (!c) {
    c = loadable(() => INTERACTIONS[id]().then((m) => m.default));
    cache.set(id, c);
  }
  return c;
}

function SlotLoading({ id }: { id: MachineId }) {
  const { t } = useTranslation('ui');
  return (
    <div className="space-y-2" role="status">
      <Poster name={id} alt="" className="max-w-[420px] opacity-60" />
      <p className="text-ink-dim">{t('interaction.preparing')}</p>
    </div>
  );
}

/**
 * Monta la mini-experiencia dentro del shell común (corrección A). El objetivo y "Cómo se juega" se
 * ven al instante; el código de la actividad llega en diferido (ver src/lib/loadable.tsx) y se
 * descarga en cuanto su momento entra en pantalla, con límite de error (Parte 16.4).
 */
export function InteractionSlot({
  machine,
  active,
  onDone,
}: {
  machine: Machine;
  active: boolean;
  onDone: () => void;
}) {
  const { t } = useTranslation('ui');
  const reduced = useAppStore((s) => s.reducedMotion);
  const express = useJourneyStore((s) => s.express);
  const id = machine.id;
  const Interaction = useMemo(() => {
    const Lazy = loadableFor(id);
    function Activity(props: InteractionProps) {
      return <Lazy {...props} fallback={<SlotLoading id={id} />} />;
    }
    return Activity;
  }, [id]);
  useEffect(() => {
    if (active)
      void loadableFor(id)
        .preload()
        .catch(() => undefined);
  }, [active, id]);
  return (
    <SlotBoundary
      fallback={
        <p className="rounded-card border border-line p-4 text-ink-dim">
          {t('interaction.loadFailed')}
        </p>
      }
    >
      <InteractionShell
        machineId={id}
        active={active}
        reducedMotion={reduced}
        express={express}
        meta={META[id]}
        Interaction={Interaction}
        onDone={() => onDone()}
      />
    </SlotBoundary>
  );
}
