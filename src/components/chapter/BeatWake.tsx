import type { Machine } from '../../data/types';
import { BeatShell } from './BeatShell';
import { ScriptLines } from './ScriptLines';

export function BeatWake({ machine }: { machine: Machine }) {
  return (
    <BeatShell machine={machine} beat="wake">
      <ScriptLines machine={machine} beat="wake" phase="before" />
      <ScriptLines machine={machine} beat="wake" phase="after" />
    </BeatShell>
  );
}
