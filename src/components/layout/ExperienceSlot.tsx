import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { hasWebGL2 } from '../../lib/device';
import { useUiStore } from '../../state/useUiStore';
import { useToast } from '../ui/Toast';

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
    if (failed) push({ title: t('three.fallbackOn'), body: t('three.failed'), tone: 'info' });
  }, [failed, push, t]);

  if (!webgl || reading || failed) return null;
  return (
    <Suspense fallback={null}>
      <Experience />
    </Suspense>
  );
}
