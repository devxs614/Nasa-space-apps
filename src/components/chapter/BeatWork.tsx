import { useState } from 'react';
import type { Machine } from '../../data/types';
import { BeatShell } from './BeatShell';
import { ScriptLines } from './ScriptLines';
import { DiscoveryCards } from './DiscoveryCards';
import { InteractionSlot } from './InteractionSlot';
import { useJourneyStore } from '../../state/useJourneyStore';

/** "El trabajo": mini-experiencia propia y tarjetas de descubrimiento (Parte 13). */
export function BeatWork({ machine }: { machine: Machine }) {
  const [revealed, setRevealed] = useState(false);
  const active = useJourneyStore((s) => s.chapterId === machine.id && s.beat === 'work');
  return (
    <BeatShell machine={machine} beat="work" wide>
      <div className="max-w-[600px]">
        <ScriptLines machine={machine} beat="work" />
      </div>
      <InteractionSlot machine={machine} active={active} onDone={() => setRevealed(true)} />
      <DiscoveryCards machine={machine} revealed={revealed} onReveal={() => setRevealed(true)} />
    </BeatShell>
  );
}
