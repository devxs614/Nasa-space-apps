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

/** Envuelve todas las rutas (Parte 16.2). */
export function AppShell() {
  useHtmlAttributes();
  useHotkeys();
  useQueryModes();
  useSceneSync();
  return (
    <>
      <SkipLink />
      <ExperienceSlot />
      <StaticTransition />
      <div className="overlay-grain" aria-hidden="true" />
      <TopBar />
      <main id="contenido" tabIndex={-1} className="relative z-10 outline-none">
        <Outlet />
      </main>
      <Footer />
      <SettingsPanel />
      <ChapterIndex />
      <Toaster />
      <LiveRegion />
    </>
  );
}
