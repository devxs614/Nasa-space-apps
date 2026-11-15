import { Vector2 } from 'three';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import type { Quality } from '../state/useAppStore';
import { useAppStore } from '../state/useAppStore';

const CA_OFFSET = new Vector2(0.0006, 0.0004);

/** Posprocesado por calidad (Parte 9.11). Media: Bloom, Vignette y ToneMapping. Alta: completo. */
export default function PostFX({ quality }: { quality: Quality }) {
  const reduced = useAppStore((s) => s.reducedMotion);
  const high = quality === 'high';
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={0.9} luminanceThreshold={0.62} luminanceSmoothing={0.2} mipmapBlur />
      {high && !reduced ? (
        <ChromaticAberration offset={CA_OFFSET} radialModulation modulationOffset={0.45} />
      ) : (
        <></>
      )}
      {high ? <Noise opacity={0.035} premultiply /> : <></>}
      <Vignette offset={0.3} darkness={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
