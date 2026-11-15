# Progreso

## Fase actual: 1 — Datos, textos y accesibilidad base

## Hecho
- [x] Proyecto Vite + React 19 + TypeScript 5.9 con las versiones fijadas de la Parte 5 (sin conflictos de dependencias).
- [x] Configuración de Vite, TypeScript estricto, ESLint plano con tipos, Prettier, Vitest y Playwright.
- [x] `index.html` con idioma, viewport, theme-color, Open Graph, `noscript` y precarga de fuentes.
- [x] Tokens, fuentes OFL autoalojadas y estilos globales (Partes 7 y 16.1).
- [x] i18n ES/EN con detección del navegador; stores `useAppStore` (persistido) y `useJourneyStore`.
- [x] Router con todas las rutas y `document.title` por ruta; `AppShell` con `TopBar`, `SkipLink` y `Footer`.
- [x] Datos de las 15 máquinas, sitios, fuentes y efemérides (adelantado de la fase 1).
- [x] Documentos: PLAN, PROGRESS, DECISIONS, SOURCES (generado), README, AI_DISCLOSURE, CREDITS.
- [x] Fase 1: guiones de los 15 capítulos ES/EN (`chapters.json`) como datos (`script.ts`) con `sceneAlt`, Modo Pro y Modo Aula.
- [x] Fase 1: glosario (38 términos), 45 preguntas del quiz, línea de tiempo derivada, actos, unidades.
- [x] Fase 1: `astro`, `signal`, `format`, `coords`, `storage`, `rng`, `device`, `resolve` con pruebas (tabla 14.3 al 0,5 %).
- [x] Fase 1: primitivas (Button, Toggle, Dialog, Popover, Tabs, Slider, Card3D, Badge, Toast), SourceBadge, FactCard, VoiceLine con glosario y "Escuchar".
- [x] Fase 1: SettingsPanel (7 pestañas), índice de capítulos (tecla M), atajos, avisos `aria-live`, `?aula`, `?lite`, `?lang`.
- [x] Fase 1: `/lectura` con los 15 capítulos, prólogo, actos, epílogo, datos y fuentes; pósters SVG generados.
- [x] Fase 1: axe sin infracciones graves en `/lectura`; prueba de paridad de idiomas en verde.

## Pendiente
- [ ] Fases 1–9.

## Datos por verificar
- machines.ts › apollo-lm, alsep, lrv — fecha de lanzamiento de las misiones Apollo (no está en la Parte 11; se omite).
- machines.ts › opportunity.launch — "julio de 2003" pendiente en la ficha NSSDCA (se omite).
- machines.ts › ingenuity.launch — lanzamiento de Perseverance no está en la Parte 11 (se omite).
- machines.ts › surveyor.facts.s7Lasers — láseres vistos por el Surveyor 7 (ficha NSSDCA del Surveyor 7).
- machines.ts › lrv.facts.tvCamera y lrv.facts.mapFix — Apollo Lunar Surface Journal.
- machines.ts › viking.facts.legInPhoto — pie de foto de NASA de la primera imagen.
- machines.ts › sojourner.facts.plannedWeek y sojourner.facts.distance — ficha NSSDCA de Mars Pathfinder.
- machines.ts › spirit.facts.naming — anuncio de NASA de junio de 2003.
- machines.ts › ingenuity.facts.airDensity — ficha de NASA de Ingenuity.
- sites.ts › lrrr-11, lrrr-14, lrv-15 — coordenadas propias (se muestran junto a su módulo como "posición aproximada").
- sites.ts › spirit, opportunity, ingenuity — coordenadas ≈ de la Parte 11.9 (se muestran como "posición aproximada").
- sites.ts › lunar-prospector — coordenadas del impacto en el cráter Shoemaker (marcador ilustrativo cerca del polo sur, sin cifras).
- Prólogo — ubicación de las antenas de la Red de Espacio Profundo (se muestran puntos genéricos).
- Guion de Phoenix — motivo del nombre; se usa la variante "Mi nombre es el de un ave legendaria".

## Tamaños del build (gzip)
- Fase 0: `index-*.js` 142,9 KB · `index-*.css` 11,3 KB.
- Fase 1: `index-*.js` 176,8 KB · `index-*.css` 13,7 KB.

## Problemas conocidos
- Ninguno.
