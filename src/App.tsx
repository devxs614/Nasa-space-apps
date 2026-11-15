import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { RouteFallback } from './components/layout/RouteFallback';

// La Travesía también va en su propio fragmento: las rutas secundarias no la descargan y, en la
// portada, `index.html` la precarga en paralelo con el fragmento de entrada (ver vite.config.ts).
const JourneyPage = lazy(() =>
  import('./routes/JourneyPage').then((m) => ({ default: m.JourneyPage })),
);
const AtlasPage = lazy(() => import('./routes/AtlasPage').then((m) => ({ default: m.AtlasPage })));
const CatalogPage = lazy(() =>
  import('./routes/CatalogPage').then((m) => ({ default: m.CatalogPage })),
);
const ChapterPage = lazy(() =>
  import('./routes/ChapterPage').then((m) => ({ default: m.ChapterPage })),
);
const TimelinePage = lazy(() =>
  import('./routes/TimelinePage').then((m) => ({ default: m.TimelinePage })),
);
const PassportPage = lazy(() =>
  import('./routes/PassportPage').then((m) => ({ default: m.PassportPage })),
);
const SourcesPage = lazy(() =>
  import('./routes/SourcesPage').then((m) => ({ default: m.SourcesPage })),
);
const AboutPage = lazy(() => import('./routes/AboutPage').then((m) => ({ default: m.AboutPage })));
const ReadingModePage = lazy(() =>
  import('./routes/ReadingModePage').then((m) => ({ default: m.ReadingModePage })),
);
const NotFoundPage = lazy(() =>
  import('./routes/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

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

function Lazy({ el }: { el: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{el}</Suspense>;
}
