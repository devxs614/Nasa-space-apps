import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router';
import { SkipLink } from './SkipLink';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { ChapterIndex } from './ChapterIndex';
import { LiveRegion } from './LiveRegion';
import { SettingsPanel } from '../settings/SettingsPanel';
import { Toaster } from '../ui/Toast';
import { useHtmlAttributes } from '../../hooks/useHtmlAttributes';
import { useHotkeys } from '../../hooks/useHotkeys';
import { useQueryModes } from '../../hooks/useQueryModes';
import { useSceneSync } from '../../hooks/useSceneSync';
import { ExperienceSlot } from './ExperienceSlot';
import { StaticTransition } from './StaticTransition';
import { ThreeNotices } from './ThreeNotices';
import { DemoMode } from '../demo/DemoMode';
import { useJourneyStore } from '../../state/useJourneyStore';
import { cx } from '../../lib/cx';

const AudioBridge = lazy(() =>
  import('../../audio/AudioBridge').then((m) => ({ default: m.AudioBridge })),
);
/** Envuelve todas las rutas (Parte 16.2). */
export function AppShell() {
  useHtmlAttributes();
  useHotkeys();
  useQueryModes();
  useSceneSync();
  // En los atlas el lienzo recibe el puntero: el contenido solo lo captura en sus paneles.
  const canvasInteractive = useJourneyStore((s) => s.canvasInteractive);
  return (
    <>
      <SkipLink />
      <ExperienceSlot />
      <StaticTransition />
      <div className="overlay-grain" aria-hidden="true" />
      <TopBar />
      <main
        id="contenido"
        tabIndex={-1}
        className={cx(
          'relative z-10 min-h-svh outline-none',
          canvasInteractive && 'pointer-events-none',
        )}
      >
        <Outlet />
      </main>
      <Footer />
      <SettingsPanel />
      <ChapterIndex />
      <DemoMode />
      <ThreeNotices />
      <Toaster />
      <LiveRegion />
      <Suspense fallback={null}>
        <AudioBridge />
      </Suspense>
    </>
  );
}
