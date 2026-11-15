# Plan de construcción — ÚLTIMA SEÑAL / LAST SIGNAL

Fuente de verdad: el prompt maestro (Partes 1–21). Orden de prioridad: Parte 4 > Parte 11 > Parte 12 > resto.
El proyecto vive en la raíz del repositorio (no en `ultima-senal/`); ver `DECISIONS.md`.

## Fases

| Fase | Contenido | Archivos principales |
| --- | --- | --- |
| 0 | Proyecto, versiones fijadas, configuración, estilos base, i18n, stores, rutas vacías con título, Vitest y Playwright triviales, documentos | `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`, `src/styles/*`, `src/i18n/index.ts`, `src/state/*`, `src/App.tsx`, `src/routes/*` |
| 1 | Datos verificados, librerías con pruebas, guiones ES/EN, interfaz base, ajustes, primitivas, modo lectura | `src/data/*`, `src/lib/*`, `src/i18n/{es,en}/*.json`, `src/components/{layout,ui,settings,chapter}/*`, `src/routes/ReadingModePage.tsx`, `src/test/*` |
| 2 | Motor 3D (Canvas único, calidad, estrellas, director de escenas, cámara), Lenis + ScrollTrigger, La Travesía con prólogo, actos y 15 capítulos, riel de progreso, mundos procedurales, sin WebGL → lectura | `src/three/*`, `src/hooks/useLenis.ts`, `src/hooks/useBeatTrigger.ts`, `src/routes/JourneyPage.tsx`, `src/components/layout/ProgressRail.tsx` |
| 3 | 15 modelos procedurales con revelado holográfico, siete momentos, voces, datos, la señal completa, parches | `src/three/machines/*`, `src/components/chapter/*`, `src/components/hud/*`, `src/components/passport/*` |
| 4 | 15 mini-experiencias con alternativa accesible y "Saltar"/"Ver resultado" | `src/components/interactions/*` |
| 5 | Epílogo y postal, pasaporte, catálogo, capítulo individual, fuentes, acerca, 404, Modo Aula, Modo Demo, despliegue | `src/routes/*`, `src/components/demo/*`, `.github/workflows/pages.yml`, `vercel.json` |
| 6 | Quiz (45 preguntas), atlas de Luna y Marte, línea de tiempo | `src/components/quiz/*`, `src/routes/AtlasPage.tsx`, `src/routes/TimelinePage.tsx` |
| 7 | Audio: motor, efectos, ambientes, sonificaciones, narración | `src/audio/*` |
| 8 | Pulido visual, NASA Image Library, modo ligero, presupuesto | `src/lib/nasaImages.ts`, `src/components/media/*` |
| 9 | QA final, revisión de contenido, paquete de entrega | `e2e/*`, `README.md`, `AI_DISCLOSURE.md` |

Al cerrar cada fase: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` (y desde la fase 5 `npm run test:e2e`),
actualizar `PROGRESS.md`, commit `fase N: resumen` y `git push`.

## Riesgos

- **Volumen de contenido**: 15 capítulos × 7 momentos × 2 idiomas, 45 preguntas y glosario. Mitigación: guiones como datos
  (`src/data/script.ts`) + JSON por idioma, prueba de paridad automática.
- **Datos que la Parte 11 no publica** (fechas de lanzamiento de Apollo/Opportunity/Ingenuity, varias coordenadas):
  se omiten en la interfaz, quedan como `TODO(verificar)` y en `PROGRESS.md`.
- **Rendimiento WebGL en móviles y en CI**: un solo Canvas cargado en diferido, calidad adaptativa, modo ligero,
  pruebas e2e con SwiftShader y movimiento reducido.
- **Tamaño del JS inicial** (≤ 500 KB gzip): el Canvas, el posprocesado, las interacciones y las páginas secundarias se
  cargan con `import()`.
- **Scroll con pin en 15 capítulos** (ScrollTrigger + Lenis): alturas recalculadas al cambiar idioma, texto o exprés; con
  movimiento reducido se usa scroll nativo sin pin.
- **Accesibilidad del 3D**: todo el contenido vive en el DOM; el Canvas es `aria-hidden`; descripciones de escena.
