import { Outlet } from 'react-router';
import { SkipLink } from './SkipLink';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { useHtmlAttributes } from '../../hooks/useHtmlAttributes';

/** Envuelve todas las rutas (Parte 16.2). */
export function AppShell() {
  useHtmlAttributes();
  return (
    <>
      <SkipLink />
      <div className="overlay-grain" aria-hidden="true" />
      <TopBar />
      <main id="contenido" tabIndex={-1} className="relative z-10 outline-none">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
