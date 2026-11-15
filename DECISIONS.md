# Decisiones

## 2026-11-14 — El proyecto vive en la raíz del repositorio
- Contexto: la Parte 6.2 muestra el árbol bajo `ultima-senal/`, pero el repositorio `Nasa-space-apps` ya existe y está vacío.
- Decisión: crear la app directamente en la raíz del repositorio, con el mismo árbol interno.
- Por qué: GitHub Pages, Vercel y Netlify despliegan desde la raíz sin configuración extra.

## 2026-11-14 — Etiquetas y frases de los datos como `L10n` dentro de `src/data/`
- Contexto: la Parte 4.1 prohíbe cifras en los archivos de traducción, y muchos datos de la Parte 11 son frases con cifras.
- Opciones: (a) cifras sueltas en `value` y frases en i18n con interpolación; (b) frase completa bilingüe junto al dato.
- Decisión: `Fact` tiene `label: L10n` y `text?: L10n`; la clave del dato es `facts.<id>` (usada por `basis` en los quizzes).
- Por qué: cada cifra queda en un único lugar con su `sourceIds`, y la prueba de datos puede validarla.

## 2026-11-14 — Campos opcionales en `Machine`
- `launch` es opcional: la Parte 11 no publica las fechas de lanzamiento de Apollo 11/12/15, de Opportunity (pendiente) ni de
  Ingenuity/Perseverance. No se inventan; la línea de tiempo empieza en la llegada.
- `lastSignal.noteOnly`: Dawn no tiene fecha exacta de última señal; se muestra la nota ("no respondió el 31 de octubre y el 1 de noviembre de 2018").
- `planned.days` y `planned.start`: duración planeada para la barra fantasma de la línea de tiempo; se etiqueta como estimación.
- `status` y `keyPart` se añaden a `Machine` para el catálogo y el momento "Quién soy".
- Etapas de descenso Apollo y LRV no tenían radio propia: su "última señal" es una fecha de referencia explicada en `lastSignal.note`
  (despegue de la etapa de ascenso del Eagle, calculado como alunizaje + 21 h 36 min; alunizaje del Apollo 17 para el LRV).

## 2026-11-14 — Campos añadidos a los stores
- `useAppStore`: `liteDecided` (Parte 17.8 pide no reactivar el modo ligero si el visitante ya eligió), `patchDates`
  (el `<desc>` del parche dice "Conseguido el {fecha}"), `updateSettings` y `savePostcard`.
- `useJourneyStore`: `section`/`sectionProgress` (prólogo, portadas y epílogo no son capítulos), `express`, `demo`,
  `atlasSiteId` (sitio enfocado por la `SiteList`), `showcaseView` (botones de girar/acercar del visor), `fx`
  (valores que las mini-experiencias pasan a la escena 3D) y `plaqueDrawing` (dibujo de la placa para la postal).
- `useUiStore` (nuevo, no persistido): diálogos abiertos y avisos.

## 2026-11-14 — Selectores de Zustand con acciones declaradas como propiedades
- `@typescript-eslint/unbound-method` (configuración con tipos) marca métodos de interfaz extraídos por selectores.
  Las acciones se declaran como `setX: (v) => void`.

## 2026-11-14 — Sin comentario de cabecera de IA en el código
- Contexto: la Parte 4.7 pide un comentario en `src/main.tsx`; el equipo indicó no añadir marcas de generación por IA en el
  código ni en los commits.
- Decisión: la declaración de IA vive en `AI_DISCLOSURE.md`, el `README.md`, el campo `description` de `package.json`, la
  meta descripción de `index.html` y la página Acerca de (requisito de las reglas de Space Apps), pero no en comentarios de código.

## 2026-11-14 — Popover propio en lugar de la API nativa `popover`
- Contexto: la Parte 16.5 sugiere `popover="auto"`; jsdom no lo implementa y las pruebas de `SourceBadge` deben correr en Vitest.
- Decisión: `Popover` gestiona su estado, se posiciona con `getBoundingClientRect`, se cierra con Esc o clic fuera y devuelve el foco.
- Por qué: mismo comportamiento accesible en todos los navegadores y en las pruebas.

## 2026-11-14 — Guiones como datos
- `src/data/script.ts` describe, por capítulo y momento, quién habla y qué dato se interpola; el texto vive en `chapters.json`.
- Las líneas de la Bitácora usan `ref` (frase del dato con sus fuentes) o `k` + `vars` (plantilla con valores de `machines.ts`).
- Las tarjetas de "El trabajo" toman el título de i18n y el cuerpo del dato, con su `SourceBadge`.

## 2026-11-14 — Scroll sin `pin` de ScrollTrigger
- Contexto: la Parte 8.2 pide fijar los momentos con `pin: true`; 105 secciones fijadas con textos de altura variable rompen el
  reflujo a 320 px y el zoom al 200 %.
- Decisión: cada momento es un tramo de `min-height` en `svh`; el lienzo 3D es `fixed` y hace de capa fijada. ScrollTrigger (sin
  `pin`) informa el progreso con `start: 'top 55%'`/`end: 'bottom 55%'` y los textos entran con GSAP.
- Por qué: el texto nunca queda cortado, funciona igual con scroll nativo (movimiento reducido) y cuesta menos en móviles.

## 2026-11-14 — Sin `Html` de drei ni `useDetectGPU`
- `Html` de drei crea raíces de React DOM que, con React 19, provocaban un error de desmontaje que congelaba el lienzo. Las etiquetas
  de los marcadores se muestran en el DOM (lista del atlas, encabezados) y el panel `?debug=1` escribe en un `<pre>` normal.
- `useDetectGPU` descarga tablas de rendimiento desde un CDN; la Parte 1.4.6 prohíbe llamadas externas salvo la de imágenes de NASA.
  `estimateGpuTier()` estima el nivel con el renderer de WebGL, núcleos y memoria, sin red.

## 2026-11-14 — Una sola escena montada
- La Parte 9.15 permite mantener montadas las escenas orbitales del acto; se monta una sola escena a la vez y la transición la cubre
  la estática de 300 ms del DOM. Menos memoria en móviles; el cambio sigue siendo inmediato.

## 2026-11-14 — Puntos del riel de progreso de 24 px en móvil
- Quince puntos de 44 px no caben en 360 px de ancho. Se usan objetivos de 24×24 px (mínimo de WCAG 2.5.8) en móvil y 28 px en
  escritorio; el índice de capítulos (tecla M) ofrece objetivos de 44 px.

## 2026-11-15 — El Modo Demo conduce el store, no el scroll
- Contexto: la Parte 3.3 pide un recorrido automático de 30 s exactos por los cinco momentos estrella, grabable sin editar.
- Opciones: (a) desplazar la página con Lenis y dejar que ScrollTrigger mueva las escenas; (b) escribir el estado de la escena
  directamente desde una función pura del tiempo.
- Decisión: `demoFrame(ms)` devuelve capítulo, momento, progreso y efectos, y `demoDrive` los escribe en `useJourneyStore`.
  Mientras `demo` es verdadero, `setBeat` y `setSection` (el scroll) se ignoran, y el contenido de la página queda oculto.
- Por qué: la duración no depende de la altura de las secciones, del idioma ni del tamaño de texto; se puede probar con Vitest; y
  funciona igual con movimiento reducido. Un `setInterval` de respaldo hace avanzar la demo si el navegador limita los fotogramas.

## 2026-11-15 — El equipo en la página Acerca de
- Contexto: no hay nombres de integrantes en la especificación y no se inventan datos de personas.
- Decisión: la página describe al equipo de forma general y enlaza a los contribuidores del repositorio. `README.md` y `CREDITS.md`
  conservan el hueco `[Team name]` para que el equipo lo complete antes de entregar.


## 2026-11-15 — Línea de tiempo con desplazamiento horizontal nativo
- La Parte 8.11 sugiere una sección fijada con scroll horizontal. Se usa una región con desplazamiento horizontal nativo (rueda con
  Mayús, arrastre táctil y flechas izquierda/derecha con el foco), sin fijar la página.
- Por qué: no secuestra el scroll vertical, funciona con lectores de pantalla y en móvil o con movimiento reducido pasa a lista vertical.

## 2026-11-15 — Lectura estática generada y versionada en `public/`
- Contexto: la Parte 17.10 pide que la historia se pueda leer sin JavaScript; GitHub Pages solo sirve archivos estáticos.
- Decisión: `scripts/prerender.mjs` abre la app compilada con Playwright, toma `/lectura` en cada idioma, deja el CSS en línea (sin
  fuentes web), quita scripts y controles que necesitan JavaScript, y guarda `public/lectura-es.html` y `public/lectura-en.html`.
  Los archivos se versionan para que el despliegue no dependa de un navegador en CI; se regeneran con `npm run prerender` tras
  cambiar los textos.
- Nombre: no se llaman `lectura.html` porque `vite preview` y GitHub Pages resolverían la ruta `/lectura` de la app hacia ese archivo.
- El `noscript` de `index.html` usa `%BASE_URL%` para que los enlaces funcionen bajo la subruta del repositorio.

## 2026-11-15 — `/lectura` se monta en dos pasos
- Contexto: en móvil, montar los 15 capítulos (≈ 6.000 nodos) en una sola tarea bloqueaba el hilo 2 s (Lighthouse 18).
- Decisión: se montan el prólogo y los dos primeros capítulos; el resto y el epílogo llegan en una transición de React
  (`startTransition`), que cede el hilo cada pocos milisegundos. Los capítulos fuera de pantalla usan
  `content-visibility: auto` (desactivado al imprimir). El enlace `#lectura-<id>` se resuelve cuando ya está todo.
- Por qué: TBT de 2.080 a 160 ms sin quitar contenido; la página sigue completa para imprimir, buscar y leer en voz alta.

## 2026-11-15 — La prueba de la señal se ejecuta con `?lite=1`
- Contexto: con varias páginas dibujando 3D por software a la vez, el temporizador de la señal se retrasaba y la prueba
  "respuesta archivada en menos de 5 s" fallaba por la CPU de la máquina, no por la lógica.
- Decisión: esa prueba usa `?lite=1`, como prevé la Parte 19.6; el resto de pruebas de humo siguen con el 3D activo.

## 2026-11-15 — Un fragmento por idioma y precarga según la ruta
- Contexto: el JS inicial llevaba los textos de los dos idiomas y La Travesía aunque se abriera otra ruta (≈ 293 KB gzip),
  y `/lectura` en móvil se quedaba en 77 en Lighthouse.
- Decisión: cada idioma vive en su fragmento (`src/i18n/locales/es.ts` y `en.ts`). `main.tsx` espera los textos del idioma
  activo antes de pintar (`?lang`, luego el guardado y, en la primera visita, el del navegador) y el otro idioma se descarga
  cuando el navegador está libre, para que el cambio siga funcionando sin red. `setLocale` solo cambia `locale` cuando los
  textos ya están; si no se pueden descargar, la web sigue en el idioma actual.
- `JourneyPage` pasa a `React.lazy`. Lenis y ScrollTrigger se quedan en su fragmento: lo que está en el paquete inicial
  (el Modo Demo) los maneja a través de `src/lib/scrollBridge.ts`, sin importarlos.
- Un plugin de Vite (`preloadHints` en `vite.config.ts`) escribe en `index.html` un script mínimo que precarga, en paralelo
  con la entrada, el idioma y la página de la ruta que se abre. Si no acierta, la app carga igual, un poco más tarde.
- Resultado (gzip): portada 266 KB, capítulo suelto 264 KB, `/lectura` 199 KB y `/fuentes` 192 KB, frente a 293 KB en todas.
- Pruebas: `e2e/locales.spec.ts` (idioma guardado, `?lang`, cambio sin red, fallo de descarga y precargas) y `i18n.test.ts`.

## 2026-11-15 — Páginas en diferido sin `React.lazy`
- Contexto: al pasar La Travesía a `React.lazy` (commit 28badf4), en equipos lentos la portada se quedaba en "Sintonizando…".
  `React.lazy` monta lo que llega en un render de baja prioridad que cualquier actualización reinicia y que nunca caduca; el
  reloj UTC de la barra superior actualizaba React cada segundo, así que si montar La Travesía tardaba más de 1 s no terminaba.
  Con la CPU 4 veces más lenta tardaba ≈ 90 s; con 6 veces, no aparecía en 2 minutos.
- Decisión (be562ae): `src/lib/loadable.tsx` con `lazyPage` (rutas: aviso de carga y "Intentar de nuevo" si falla la descarga)
  y `loadable` (mini-experiencias, postal, lienzo 3D y puente de audio). El componente llega con una actualización normal,
  que React pinta de una vez. El reloj UTC escribe la hora en el DOM sin pasar por React y `formatDate` reutiliza sus
  `Intl.DateTimeFormat`.
- Resultado: 2,7 s con la CPU 4× más lenta, 5 s con 6× y ≈ 0,45 s sin freno.
- Prueba: `src/test/regressions.test.tsx` monta una página cara en diferido mientras otro componente actualiza React cada
  100 ms (con `React.lazy` no aparece en 4 s; con `lazyPage` sí), comprueba que el reloj UTC no hace commits de React y que
  ningún archivo del DOM vuelve a importar `lazy` de React. Una e2e con la CPU frenada no sirvió: según cuándo caigan los
  tics del reloj, la versión con el fallo a veces montaba en 7–9 s y otras no montaba en 60 s.
- Solo queda un `React.lazy`, el posprocesado, que vive dentro del árbol propio de React Three Fiber. `formatList` reutiliza también su `Intl.ListFormat`.
- Alternativas descartadas: volver a meter La Travesía en el fragmento de entrada (se pierde el ahorro en las demás rutas) y
  quitar solo el reloj (cualquier otra actualización, como un aviso o el scroll, reinicia igual un render lento).
- `e2e/slow-device.spec.ts` comprueba la versión corregida con la CPU seis veces más lenta (La Travesía, el 3D y las 15
  mini-experiencias montadas, al abrir la portada y al llegar desde otra página). Sirve para ver que el arreglo aguanta en
  un navegador real; el detector del fallo es la prueba de unidad de arriba.

## 2026-11-15 — Cierre atrasado del `<dialog>`
- Contexto: el evento `close` del `<dialog>` nativo llega en una tarea aparte. Con Esc y M seguidas, el `close` antiguo
  cerraba el índice recién reabierto. La prueba de humo lo tapaba con reintentos.
- Decisión: `Dialog` cuenta los cierres pedidos por el estado y descarta un `close` si el diálogo ya está abierto otra vez;
  el foco vuelve al disparador original. Pruebas en `src/test/dialog.test.tsx`; la prueba de humo ya no reintenta.

## 2026-11-15 — La versión inglesa, en inglés estadounidense de principio a fin
- Contexto: la interfaz formatea las fechas con `Intl` (`en` → "July 20, 1969"), pero el texto corrido de los datos y de los
  guiones decía "20 July 1969"; las horas UTC salían como "12:04 AM UTC" y varios recuentos decían "1 results".
- Decisión: los textos en inglés siguen el mismo estilo que la interfaz (mes, día y año, con coma tras el año en mitad de
  frase), `formatDate` usa el ciclo de 0 a 23 para las horas UTC, los recuentos usan los plurales de i18next (`count`) en los
  dos idiomas y las citas llevan el punto dentro de las comillas. Los números con millares se escriben "1,800" en inglés y
  "1.800" en español, también dentro de las mini-experiencias.
- Guardas: `src/test/english.test.ts` falla si aparece una fecha con el día delante, una hora con AM/PM o un recuento sin
  concordancia. El resto de la revisión (comas decimales, comillas españolas, ortografía británica, palabras en español) se
  hizo con un barrido puntual de los 2.017 textos y no encontró nada.
- Qué no cambia: ningún dato. Solo formato y puntuación; "poetic translation" se mantiene porque así lo dice el guion.

## 2026-11-15 — Texturas y modelos opcionales: lista hecha al compilar
- Contexto: la app preguntaba con `HEAD` si existían `textures/*.jpg` y `models/<id>.glb` (Anexo C). En calidad media o alta
  (equipos con GPU) cada archivo ausente dejaba un error 404 en la consola; Lighthouse en la web publicada bajaba a 96 en
  buenas prácticas. Con el 3D por software (calidad baja) no se pedían, y por eso las pruebas locales no lo veían.
- Decisión: `vite.config.ts` lee `public/textures` y `public/models` al compilar y define `__OPTIONAL_ASSETS__`.
  `assetExists(ruta)` responde `false` sin tocar la red si el archivo no está en esa lista; si está, lo confirma con `HEAD`.
- Por qué: cero peticiones fallidas, y si el equipo añade texturas con `npm run assets` se usan sin cambiar código
  (en desarrollo hay que reiniciar `npm run dev`). Prueba: `src/test/assets.test.ts`.

## 2026-11-15 — Rutas profundas con estado 200 en GitHub Pages
- Contexto: GitHub Pages no reescribe rutas. `/lectura`, `/maquinas/opportunity`… se servían desde `404.html`: la app
  cargaba, pero con estado HTTP 404, y Lighthouse, los rastreadores y las vistas previas de enlaces descartaban la página.
- Decisión: tras compilar, `scripts/spa-routes.mjs` copia `index.html` a cada ruta conocida, en dos formas (`ruta.html` y
  `ruta/index.html`), además de `404.html` para las rutas desconocidas. Los ids de las máquinas salen de `src/data/ids.ts`.
  El flujo de Pages lo ejecuta; Vercel y Netlify siguen con sus reescrituras.
- Nota: no choca con la lectura estática (`lectura-es.html`, `lectura-en.html`): `lectura.html` es la app, no un texto fijo.

