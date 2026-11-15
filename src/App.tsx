import { Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { RouteFallback } from './components/layout/RouteFallback';
import { lazyPage } from './lib/loadable';

// Cada página va en su propio fragmento (La Travesía también): las rutas secundarias no la
// descargan y, en la portada, `index.html` la precarga en paralelo con el fragmento de entrada
// (ver vite.config.ts). Se cargan con `lazyPage`, no con `React.lazy` (ver src/lib/loadable.tsx).
const JourneyPage = lazyPage(() => import('./routes/JourneyPage').then((m) => m.JourneyPage));
const AtlasPage = lazyPage(() => import('./routes/AtlasPage').then((m) => m.AtlasPage));
const CatalogPage = lazyPage(() => import('./routes/CatalogPage').then((m) => m.CatalogPage));
const ChapterPage = lazyPage(() => import('./routes/ChapterPage').then((m) => m.ChapterPage));
const TimelinePage = lazyPage(() => import('./routes/TimelinePage').then((m) => m.TimelinePage));
const PassportPage = lazyPage(() => import('./routes/PassportPage').then((m) => m.PassportPage));
const SourcesPage = lazyPage(() => import('./routes/SourcesPage').then((m) => m.SourcesPage));
const AboutPage = lazyPage(() => import('./routes/AboutPage').then((m) => m.AboutPage));
const ReadingModePage = lazyPage(() =>
  import('./routes/ReadingModePage').then((m) => m.ReadingModePage),
);
const NotFoundPage = lazyPage(() => import('./routes/NotFoundPage').then((m) => m.NotFoundPage));

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Lazy el={<JourneyPage />} />} />
          <Route
            path="atlas/luna"
            element={
              <Suspense fallback={<RouteFallback />}>
                <AtlasPage body="moon" />
              </Suspense>
            }
          />
          <Route
            path="atlas/marte"
            element={
              <Suspense fallback={<RouteFallback />}>
                <AtlasPage body="mars" />
              </Suspense>
            }
          />
          <Route path="maquinas" element={<Lazy el={<CatalogPage />} />} />
          <Route path="maquinas/:id" element={<Lazy el={<ChapterPage />} />} />
          <Route path="linea-de-tiempo" element={<Lazy el={<TimelinePage />} />} />
          <Route path="pasaporte" element={<Lazy el={<PassportPage />} />} />
          <Route path="fuentes" element={<Lazy el={<SourcesPage />} />} />
          <Route path="acerca" element={<Lazy el={<AboutPage />} />} />
          <Route path="lectura" element={<Lazy el={<ReadingModePage />} />} />
          <Route path="*" element={<Lazy el={<NotFoundPage />} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/** Red de seguridad: si algo dentro de la página suspende sin su propio límite, se ve el aviso de carga. */
function Lazy({ el }: { el: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{el}</Suspense>;
}
