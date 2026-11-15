import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

interface ChunkLike {
  type: string;
  fileName: string;
  facadeModuleId?: string | null;
  imports?: string[];
}

/** Página de cada ruta (primer tramo de la URL). `maquinas/*` es el capítulo individual. */
const ROUTE_PAGES: Record<string, string> = {
  '': 'src/routes/JourneyPage.tsx',
  lectura: 'src/routes/ReadingModePage.tsx',
  maquinas: 'src/routes/CatalogPage.tsx',
  'maquinas/*': 'src/routes/ChapterPage.tsx',
  atlas: 'src/routes/AtlasPage.tsx',
  'linea-de-tiempo': 'src/routes/TimelinePage.tsx',
  pasaporte: 'src/routes/PassportPage.tsx',
  fuentes: 'src/routes/SourcesPage.tsx',
  acerca: 'src/routes/AboutPage.tsx',
};
const LOCALE_MODULES = { es: 'src/i18n/locales/es.ts', en: 'src/i18n/locales/en.ts' };

/**
 * Precarga según idioma y ruta (Parte 17.7). Los textos de cada idioma y cada página viven en
 * fragmentos propios; como sus nombres llevan hash, este plugin escribe en `index.html` un script
 * mínimo que decide qué fragmentos precargar en paralelo con el de entrada:
 * - el idioma: `?lang`, luego el guardado en este navegador y, si no hay, el del navegador;
 * - la página de la ruta que se abre (La Travesía en la portada, la lectura en `/lectura`…).
 * Si el script acierta, no hay viaje de red extra; si falla, la app carga igual, un poco más tarde.
 */
function preloadHints(): Plugin {
  let base = '/';
  return {
    name: 'ultima-senal:preload-hints',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const chunks = (Object.values(ctx.bundle) as ChunkLike[]).filter((c) => c.type === 'chunk');
        const byFile = new Map(chunks.map((c) => [c.fileName, c]));
        const inHtml = new Set([...html.matchAll(/assets\/[\w.-]+\.js/g)].map((m) => m[0]));
        // Todos los archivos se guardan una vez; idiomas y rutas los citan por su índice.
        const files: string[] = [];
        const closure = (suffix: string): number[] => {
          const entry = chunks.find((c) =>
            c.facadeModuleId?.replaceAll('\\', '/').endsWith(suffix),
          );
          const out: string[] = [];
          const visit = (file: string) => {
            if (inHtml.has(file) || out.includes(file)) return;
            out.push(file);
            byFile.get(file)?.imports?.forEach(visit);
          };
          if (entry) visit(entry.fileName);
          return out.map((file) => {
            if (!files.includes(file)) files.push(file);
            return files.indexOf(file);
          });
        };
        const map = (o: Record<string, string>) =>
          Object.fromEntries(Object.entries(o).map(([k, v]) => [k, closure(v)]));
        const langs = map(LOCALE_MODULES);
        const routes = map(ROUTE_PAGES);
        const code =
          `(function(){try{var b=${JSON.stringify(base)},F=${JSON.stringify(files)},L=${JSON.stringify(langs)},R=${JSON.stringify(routes)},d=document,l,` +
          `q=new URLSearchParams(location.search).get('lang');if(q==='es'||q==='en')l=q;` +
          `if(!l)try{var s=JSON.parse(localStorage.getItem('ultima-senal:app')||'null');l=s&&s.state&&s.state.locale}catch(e){}` +
          `if(l!=='es'&&l!=='en'){l='en';var n=navigator.languages||[navigator.language||''];` +
          `for(var i=0;i<n.length;i++){var c=String(n[i]||'').toLowerCase().slice(0,2);if(c==='es'||c==='en'){l=c;break}}}` +
          `var p=location.pathname;if(p.indexOf(b)===0)p=p.slice(b.length);` +
          `var g=p.split('/').filter(Boolean);if(!g.length||g[0]==='index.html')g=[''];` +
          `var x=L[l].concat(R[g[0]==='maquinas'&&g[1]?'maquinas/*':g[0]]||[]),u={};` +
          `for(var j=0;j<x.length;j++){if(u[x[j]])continue;u[x[j]]=1;var k=d.createElement('link');k.rel='modulepreload';k.crossOrigin='anonymous';k.href=b+F[x[j]];d.head.appendChild(k)}` +
          `}catch(e){}})();`;
        return { html, tags: [{ tag: 'script', children: code, injectTo: 'head' }] };
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadHints()],
  base: process.env.BASE_PATH ?? '/',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, open: !process.env.CI && !process.env.NO_OPEN },
  build: { target: 'es2022', sourcemap: false, chunkSizeWarningLimit: 1200 },
  assetsInclude: ['**/*.glb', '**/*.ktx2', '**/*.hdr'],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
