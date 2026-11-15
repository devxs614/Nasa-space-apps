import type { ComponentType } from 'react';
import type { MachineId } from '../../data/types';
import type { InteractionProps } from './types';

type Loader = () => Promise<{ default: ComponentType<InteractionProps> }>;
const placeholder: Loader = () =>
  import('./PlaceholderInteraction').then((m) => ({ default: m.PlaceholderInteraction }));

/** Una mini-experiencia por capítulo, cargada en diferido (Parte 13.1). */
export const INTERACTIONS: Record<MachineId, Loader> = {
  surveyor: placeholder,
  'apollo-lm': placeholder,
  alsep: placeholder,
  lrv: placeholder,
  viking: placeholder,
  sojourner: placeholder,
  spirit: placeholder,
  opportunity: placeholder,
  phoenix: placeholder,
  insight: placeholder,
  ingenuity: placeholder,
  near: placeholder,
  dawn: placeholder,
  kepler: placeholder,
  pioneer: placeholder,
};
