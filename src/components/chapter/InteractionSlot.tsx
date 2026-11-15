import { Component, lazy, Suspense, useMemo, type ComponentType, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Machine, MachineId } from '../../data/types';
import type { InteractionProps } from '../interactions/types';
import { Poster } from '../media/Poster';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { INTERACTIONS } from '../interactions/registry';

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

const cache = new Map<MachineId, ComponentType<InteractionProps>>();
function lazyFor(id: MachineId) {
  let c = cache.get(id);
  if (!c) {
    c = lazy(INTERACTIONS[id]);
    cache.set(id, c);
  }
  return c;
}

/** Carga la interacción con React.lazy y Suspense, con póster mientras carga y límite de error (Parte 16.4). */
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
  const Interaction = useMemo(() => lazyFor(machine.id), [machine.id]);
  const loading = (
    <div className="space-y-2" role="status">
      <Poster name={machine.id} alt="" className="max-w-[420px] opacity-60" />
      <p className="text-ink-dim">{t('interaction.preparing')}</p>
    </div>
  );
  return (
    <SlotBoundary
      fallback={
        <p className="rounded-card border border-line p-4 text-ink-dim">
          {t('interaction.loadFailed')}
        </p>
      }
    >
      <Suspense fallback={loading}>
        <Interaction
          machineId={machine.id}
          active={active}
          reducedMotion={reduced}
          express={express}
          onComplete={() => onDone()}
          onSkip={() => onDone()}
        />
      </Suspense>
    </SlotBoundary>
  );
}
