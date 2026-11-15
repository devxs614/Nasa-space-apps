import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { hasWebGL2 } from '../../lib/device';
import { useUiStore } from '../../state/useUiStore';
import { useToast } from '../ui/Toast';
import { useJourneyStore, type SceneKey } from '../../state/useJourneyStore';
import { publicUrl } from '../../lib/assets';

const POSTER: Partial<Record<SceneKey, string>> = {
  prologue: 'scene-prologue',
  epilogue: 'scene-epilogue',
  'moon-orbit': 'scene-moon',
  'moon-surface': 'scene-moon',
  'atlas-moon': 'scene-moon',
  'mars-orbit': 'scene-mars',
  'mars-surface': 'scene-mars',
  'atlas-mars': 'scene-mars',
  eros: 'scene-small-bodies',
  'vesta-ceres': 'scene-small-bodies',
  kepler: 'scene-deep-space',
  'outer-system': 'scene-deep-space',
};

/** Póster SVG de la escena cuando el 3D falla (Parte 6.7). Decorativo. */
function ScenePoster() {
  const scene = useJourneyStore((s) => s.sceneKey);
  const chapter = useJourneyStore((s) => s.chapterId);
  const name = chapter ?? POSTER[scene] ?? 'scene-idle';
  return (
    <img
      src={publicUrl(`posters/${name}.svg`)}
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-50"
    />
  );
}

const Experience = lazy(() => import('../../three/Experience'));

/** Monta el lienzo 3D (en diferido) salvo en /lectura o sin WebGL 2 (Parte 17.9). */
export function ExperienceSlot() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('ui');
  const failed = useUiStore((s) => s.threeFailed);
  const [webgl] = useState(() => hasWebGL2());
  const { push } = useToast();
  const reading = pathname.replace(/\/$/, '').endsWith('/lectura');

  useEffect(() => {
    if (!webgl && !reading) {
      push({ title: t('three.noWebgl'), tone: 'info' });
      void navigate('/lectura', { replace: true });
    }
  }, [webgl, reading, navigate, push, t]);

  useEffect(() => {
    if (failed) push({ title: t('three.fallbackOn'), tone: 'info' });
  }, [failed, push, t]);

  if (failed && !reading) return <ScenePoster />;
  if (!webgl || reading) return null;
  return (
    <Suspense fallback={null}>
      <Experience />
    </Suspense>
  );
}
