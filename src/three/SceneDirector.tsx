import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useJourneyStore } from '../state/useJourneyStore';
import { OrbitScene } from './scenes/OrbitScene';
import { SurfaceScene } from './scenes/SurfaceScene';
import { ErosScene, KeplerScene, OuterSystemScene, VestaCeresScene } from './scenes/SpaceScenes';
import { EpilogueScene, IdleScene, PrologueScene } from './scenes/StoryScenes';
import { AtlasScene } from './scenes/AtlasScene';
import { ShowcaseScene } from './scenes/ShowcaseScene';

/** Elige la escena según el store (Parte 6.5). Una sola escena montada a la vez; se libera al cambiar. */
export function SceneDirector() {
  const sceneKey = useJourneyStore((s) => s.sceneKey);
  const beat = useJourneyStore((s) => s.beat);
  const chapterId = useJourneyStore((s) => s.chapterId);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [sceneKey, beat, chapterId, invalidate]);

  switch (sceneKey) {
    case 'prologue':
      return <PrologueScene />;
    case 'moon-orbit':
      return <OrbitScene key="moon" body="moon" />;
    case 'mars-orbit':
      return <OrbitScene key="mars" body="mars" />;
    case 'moon-surface':
      return <SurfaceScene key={`moon-${chapterId ?? ''}`} world="moon" />;
    case 'mars-surface':
      return <SurfaceScene key={`mars-${chapterId ?? ''}`} world="mars" />;
    case 'eros':
      return <ErosScene />;
    case 'vesta-ceres':
      return <VestaCeresScene />;
    case 'kepler':
      return <KeplerScene />;
    case 'outer-system':
      return <OuterSystemScene />;
    case 'epilogue':
      return <EpilogueScene />;
    case 'atlas-moon':
      return <AtlasScene key="am" body="moon" />;
    case 'atlas-mars':
      return <AtlasScene key="amr" body="mars" />;
    case 'showcase':
      return <ShowcaseScene />;
    default:
      return <IdleScene />;
  }
}
