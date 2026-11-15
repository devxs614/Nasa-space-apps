import { createContext, useContext } from 'react';
import type { Material } from 'three';
import {
  freeHologramMaterial,
  hologramMaterial,
  realMaterials,
  type MatKind,
} from '../../materials';

export type RenderMode = 'real' | 'holo' | 'holoFree';
export const ModeContext = createContext<RenderMode>('real');
/** Segmentos de cilindros y esferas según calidad (Parte 10.1.3). */
export const DetailContext = createContext<number>(16);

export function useMat(kind: MatKind): Material {
  const mode = useContext(ModeContext);
  if (mode === 'holo') return hologramMaterial();
  if (mode === 'holoFree') return freeHologramMaterial();
  return realMaterials()[kind];
}
export function useSeg(): number {
  return useContext(DetailContext);
}

/** Variantes de pose para la "Última señal" (panel caído de Phoenix, pala rota de Ingenuity). */
export const FlagsContext = createContext<{ broken?: boolean; collapsed?: boolean }>({});
