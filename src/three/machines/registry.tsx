import type { ComponentType } from 'react';
import type { MachineId } from '../../data/types';
import { AlsepModel, ApolloDescentModel, LrvModel, SurveyorModel } from './models/moon';
import { MerModel, SojournerModel, VikingModel } from './models/mars';
import { IngenuityModel, InsightModel, PhoenixModel } from './models/mars2';
import { DawnModel, KeplerModel, NearModel, PioneerModel } from './models/space';

const Spirit = () => <MerModel variant="spirit" />;
const Opportunity = () => <MerModel variant="opportunity" />;
const Apollo = () => <ApolloDescentModel />;
const Phoenix = () => <PhoenixModel />;
const Ingenuity = () => <IngenuityModel />;

/** Un modelo procedural por máquina (Parte 10.3). */
export const MODELS: Record<MachineId, ComponentType> = {
  surveyor: SurveyorModel,
  'apollo-lm': Apollo,
  alsep: AlsepModel,
  lrv: LrvModel,
  viking: VikingModel,
  sojourner: SojournerModel,
  spirit: Spirit,
  opportunity: Opportunity,
  phoenix: Phoenix,
  insight: InsightModel,
  ingenuity: Ingenuity,
  near: NearModel,
  dawn: DawnModel,
  kepler: KeplerModel,
  pioneer: PioneerModel,
};
