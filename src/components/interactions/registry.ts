import type { ComponentType } from 'react';
import type { MachineId } from '../../data/types';
import type { InteractionProps } from './types';

type Loader = () => Promise<{ default: ComponentType<InteractionProps> }>;

/** Una mini-experiencia por capítulo, cargada en diferido (Parte 13.1). */
export const INTERACTIONS: Record<MachineId, Loader> = {
  surveyor: () => import('./SurveyorInteraction').then((m) => ({ default: m.SurveyorInteraction })),
  'apollo-lm': () => import('./ApolloInteraction').then((m) => ({ default: m.ApolloInteraction })),
  alsep: () => import('./AlsepInteraction').then((m) => ({ default: m.AlsepInteraction })),
  lrv: () => import('./LrvInteraction').then((m) => ({ default: m.LrvInteraction })),
  viking: () => import('./VikingInteraction').then((m) => ({ default: m.VikingInteraction })),
  sojourner: () =>
    import('./SojournerInteraction').then((m) => ({ default: m.SojournerInteraction })),
  spirit: () => import('./SpiritInteraction').then((m) => ({ default: m.SpiritInteraction })),
  opportunity: () =>
    import('./OpportunityInteraction').then((m) => ({ default: m.OpportunityInteraction })),
  phoenix: () => import('./PhoenixInteraction').then((m) => ({ default: m.PhoenixInteraction })),
  insight: () => import('./InsightInteraction').then((m) => ({ default: m.InsightInteraction })),
  ingenuity: () =>
    import('./IngenuityInteraction').then((m) => ({ default: m.IngenuityInteraction })),
  near: () => import('./NearInteraction').then((m) => ({ default: m.NearInteraction })),
  dawn: () => import('./DawnInteraction').then((m) => ({ default: m.DawnInteraction })),
  kepler: () => import('./KeplerInteraction').then((m) => ({ default: m.KeplerInteraction })),
  pioneer: () => import('./PioneerInteraction').then((m) => ({ default: m.PioneerInteraction })),
};
