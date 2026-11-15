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
