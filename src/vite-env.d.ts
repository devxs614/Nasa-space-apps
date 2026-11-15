/// <reference types="vite/client" />

/** Archivos opcionales presentes en public/textures y public/models al compilar (vite.config.ts). */
declare const __OPTIONAL_ASSETS__: readonly string[];

declare module '*.glb' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
