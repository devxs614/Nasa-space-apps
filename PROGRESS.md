# Progreso

## Fase actual: 9 — QA final y entrega (código congelado: a partir de aquí, solo correcciones)

## Hecho
- [x] Fase 9 (corrección de rendimiento): un fragmento por idioma (la primera carga solo descarga el idioma activo y el otro llega en segundo plano), La Travesía en su propio fragmento con Lenis y ScrollTrigger, y precarga en `index.html` del idioma y de la página de la ruta que se abre; pruebas `e2e/locales.spec.ts` e `i18n.test.ts`.
- [x] Fase 9: humo completo de la Parte 19.6 (tecla M e índice, cambio a inglés con `lang="en"`, parche "Conseguido" en el pasaporte), axe en diez rutas (se añade `/atlas/marte`), prueba de cadenas literales en JSX (Parte 19.4), sin `TODO` en la compilación ni logotipos de NASA.
- [x] Fase 9: rendimiento de `/lectura` (los capítulos 3–15 se montan en una transición de React y los capítulos fuera de pantalla usan `content-visibility`), `<main>` con altura mínima de pantalla (CLS 0), `robots.txt`; Lighthouse en la tabla de abajo.
- [x] Fase 9: paquete de entrega de la Parte 20: `SUBMISSION.md` (textos del formulario en inglés), subtítulos `docs/video/last-signal-30s.srt` y README con controles de calidad y enlaces.
- [x] Fase 8: avisos del 3D (toast al activar solo el modo ligero; pregunta "¿Cambiar a modo ligero?" si los FPS bajan de 24 durante 5 s en calidad baja, una vez por visita; "Reintentar 3D" tras un fallo y modo ligero tras dos pérdidas de contexto) y póster fijo de la escena cuando el 3D falla.
- [x] Fase 8: imagen para redes `og-image.png` (1200×630) y versiones de lectura estáticas sin JavaScript `lectura-es.html` y `lectura-en.html` (enlazadas desde `noscript`, axe sin infracciones) generadas con `npm run prerender`; pruebas de unidad de los avisos y e2e de la lectura estática.
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
- [x] Fase 2: lienzo único en diferido con calidad adaptativa (PerformanceMonitor, AdaptiveDpr), estrellas con shader, director de escenas y rig de cámara amortiguado.
- [x] Fase 2: mundos procedurales (Tierra nocturna, Luna, Marte con atmósfera, Eros, Vesta, Ceres), dioramas de superficie con 6 variantes, Kepler y sistema exterior en escala logarítmica, prólogo y epílogo.
- [x] Fase 2: 15 modelos procedurales con revelado holográfico por planos de recorte, polvo, pieza clave con contorno y GLB opcional.
- [x] Fase 7: 15 efectos sintetizados con Web Audio (envolventes sin clics, máximo 8 voces), ambientes generativos por acto con fundido de 2,5 s (mitad de osciladores en calidad baja), silencio y línea plana en "Última señal", sonificaciones (sismos de ALSEP e InSight, curva de luz de Kepler, rotor de Ingenuity, motor iónico de Dawn, odómetro de Opportunity) y narración automática por momento tras un gesto; pruebas de que nada suena antes del gesto y de que el interruptor silencia en menos de 300 ms.
- [x] Fase 6: quiz "¿Te acuerdas?" al final de cada capítulo (45 preguntas, barajado por intento, parche dorado con 3 de 3, Modo Aula sin puntuación); atlas de la Luna y de Marte con capas, `SiteList` accesible y ficha del sitio; `/linea-de-tiempo` con barras reales, duración planeada, llegada, filtro por mundo, orden por duración y lista vertical en móvil o con movimiento reducido.
- [x] Fase 5: /fuentes (105 fuentes agrupadas por máquina, buscador, aviso legal y nota de estimaciones) y /acerca (reto, código visual de hecho y ficción con un ejemplo de cada tipo, equipo, declaración de IA, créditos y privacidad).
- [x] Fase 5: Modo Demo (`?demo=1` o botón de la portada): 30 s por los cinco momentos estrella con subtítulos en inglés, dato real por paso, `data-demo-state`, salir con Esc y repetir; pruebas de unidad y e2e.
- [x] Fase 5: postal del epílogo en PNG, /pasaporte (parches, rango, quizzes, constelaciones, descarga, reinicio) y /maquinas (filtros, búsqueda bilingüe, fichas extra y visor 3D con botones).
- [x] Fase 4: las 15 mini-experiencias de la Parte 13 con "Saltar", "Ver resultado" (exprés), modo sin presión, controles de ratón, táctil y teclado, resumen `aria-live` y etiqueta de simulación ilustrativa; una prueba e2e por acto.
- [x] Fase 4: cliente de images-api.nasa.gov con caché, tiempo límite y descarte de derechos de terceros; `NasaImage` con póster de respaldo.
- [x] Fase 3: señal completa (mantener 1,2 s o pulsar, Enter/Espacio, envío automático de LUMI al 60 %), tiempo de luz con compresión, variantes de Luna (tiempo real), Kepler (transmisor apagado), Ceres (rango) y Pioneer (fecha de llegada del saludo).
- [x] Fase 3: HUD (HoldButton, SignalMeter, LightTimeCounter con fórmula en Modo Pro, MissionClock, Telemetry, HudFrame, osciloscopio plano), respuesta archivada con aviso `aria-live`.
- [x] Fase 3: parches SVG originales (4 formas, 15 glifos, estados bloqueado/conseguido/dorado, bordado), "Recibir parche" y riel con check.
- [x] Fase 2: Lenis + ScrollTrigger, prólogo, portadas de acto, 15 capítulos con sus 7 momentos, riel de progreso, enlaces profundos, estática entre escenas, redirección a `/lectura` sin WebGL 2.

## Pendiente
- [ ] Revisión manual de la Parte 19.8 en dispositivos reales (Chrome, Edge, Firefox, Safari 17+ en macOS e iOS, Android de gama media) y con lector de pantalla (VoiceOver, NVDA).
- [ ] Lectura completa de la versión inglesa por una persona con inglés fluido (Parte 19.9).
- [ ] Vídeo de 30 s (o 7 diapositivas) con subtítulos en inglés, subido con enlace público, y enlace en README.md y en el formulario.
- [ ] Formulario de entrega con los textos de `SUBMISSION.md`; probar todos los enlaces en una ventana privada.
- [ ] Equipo humano: nombre del equipo e integrantes en README.md y CREDITS.md (la página Acerca de enlaza a los contribuidores del repositorio), y enlace del vídeo de 30 s.

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
- Fase 2: `index-*.js` ≈ 199 KB inicial · `Experience-*.js` ≈ 176 KB (diferido) · `PostFX-*.js` ≈ 25 KB (diferido).
- Fase 5: JS inicial (entrada + precargas) 287 KB · `index-*.js` 161 KB · `Experience-*.js` 177 KB (diferido) · `PostFX-*.js` 25 KB (diferido) · CSS 15,6 KB. Límite: 500 KB.
- Fase 8: JS inicial (entrada + precargas) 293 KB · `Experience-*.js` 170 KB + `three.core-*.js` 98 KB (diferidos) · `PostFX-*.js` 23 KB (diferido) · CSS 16 KB. Lectura estática: 647 KB (ES) y 642 KB (EN) sin comprimir, con el CSS en línea.
- Fase 9 (idiomas en diferido): JS inicial (entrada + precargas del idioma y de la ruta) 266 KB en la portada, 264 KB en un capítulo suelto, 199 KB en `/lectura` y 192 KB en `/fuentes` · entrada `index-*.js` 138 KB · textos `es-*.js` 31 KB y `en-*.js` 30 KB · `ChapterSection-*.js` 64 KB · `Experience-*.js` 177 KB + `three.core-*.js` 102 KB (diferidos) · `PostFX-*.js` 25 KB (diferido).

## Lighthouse (fase 9, compilación de producción en local)
| Ruta | Rendimiento | Accesibilidad | Buenas prácticas | SEO | Notas |
| --- | --- | --- | --- | --- | --- |
| `/` (escritorio) | 51 | 100 | 100 | 92 → 100 con `robots.txt` | 3D por software (SwiftShader) en Chromium sin GPU; FCP 1,3 s, LCP 2,6 s, TBT 800 ms, CLS 0 |
| `/lectura` (móvil) | 77 | 100 | 100 | 100 | Antes de la fase 9: 18 (TBT 2.080 ms, CLS 0,38). Ahora FCP 3,5 s, LCP 4,0 s, TBT 160 ms, CLS 0 |

- Metas de la Parte 19.7: rendimiento 70+ en `/` y 90+ en `/lectura` móvil. `/lectura` queda en 77 por el JS inicial
  (≈ 293 KB gzip con los textos de los dos idiomas) en la red 4G lenta simulada. Después de esa medición, el idioma activo se carga
  solo y `/lectura` baja a 199 KB de JS inicial: la tabla es anterior a ese cambio y hay que repetirla en la URL publicada.
  La cifra de `/` se midió sin GPU; en un equipo con GPU el 3D no ocupa el hilo principal. Repetir en la URL publicada.
- Panel `?debug=1` (calidad baja, Chromium sin GPU): La Travesía en Opportunity 63 llamadas y 46.082 triángulos;
  en Pioneer 8 llamadas y 44.018 triángulos; atlas de Marte 34 llamadas; capítulo de Apollo 72 llamadas. Máximo 72 de
  las 150 permitidas por fotograma.
- Despliegue de la fase 9 en GitHub Pages correcto: portada, rutas profundas (servidas por `404.html`), `lectura-es.html`,
  `lectura-en.html`, `og-image.png` y `robots.txt` responden bajo `/Nasa-space-apps/`.

## Problemas conocidos
- InSight: el corte del interior es una ilustración aproximada; la Parte 11 no publica el radio de Marte, así que no se dibuja a escala. TODO(verificar).
- Pruebas e2e en local: usar `NO_OPEN=1 npx playwright test --workers=3`. Sin `NO_OPEN`, `vite preview` abre una pestaña del navegador del sistema, y con muchos procesos el 3D por software (SwiftShader) agota los tiempos de espera.
- Solo en desarrollo (StrictMode): React registra un aviso de desmontaje del lienzo de R3F al montar dos veces los efectos. En la compilación de producción no aparece ningún error en consola.
