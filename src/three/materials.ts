import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Plane,
  RepeatWrapping,
  ShaderMaterial,
  Vector3,
  type Material,
} from 'three';
import { HOLOGRAM_FRAG, HOLOGRAM_VERT } from './shaders/hologram.glsl';
import { createRng } from '../lib/rng';

/** Planos de recorte del revelado holográfico (Parte 9.6): el real se ve por debajo del frente y el holograma por encima. */
export const REAL_PLANE = new Plane(new Vector3(0, -1, 0), 1e6);
export const HOLO_PLANE = new Plane(new Vector3(0, 1, 0), 1e6);

export type MatKind =
  | 'foil'
  | 'foilDark'
  | 'mylar'
  | 'white'
  | 'cells'
  | 'rtg'
  | 'carbon'
  | 'metal'
  | 'dark'
  | 'copper'
  | 'glass'
  | 'emissiveBlue'
  | 'emissiveWarm';

function wrinkleTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const r = createRng(11);
  ctx.fillStyle = 'rgb(128,128,255)';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 90; i++) {
    ctx.strokeStyle = `rgba(${100 + r() * 60},${100 + r() * 60},255,0.5)`;
    ctx.lineWidth = 1 + r() * 2;
    ctx.beginPath();
    ctx.moveTo(r() * 128, r() * 128);
    ctx.lineTo(r() * 128, r() * 128);
    ctx.stroke();
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

function cellsTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#141c33';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#8e9aaf';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 128; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 128);
    ctx.moveTo(0, i);
    ctx.lineTo(128, i);
    ctx.stroke();
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

let real: Record<MatKind, Material> | null = null;
export const BASE_COLORS = new Map<Material, Color>();

/** Materiales de la Parte 7.5, creados una sola vez y compartidos. */
export function realMaterials(): Record<MatKind, Material> {
  if (real) return real;
  const clip = { clippingPlanes: [REAL_PLANE] };
  const wrinkles = wrinkleTexture();
  const cells = cellsTexture();
  real = {
    foil: new MeshPhysicalMaterial({
      color: '#d4a64a',
      metalness: 1,
      roughness: 0.32,
      clearcoat: 0.2,
      normalMap: wrinkles,
      ...clip,
    }),
    foilDark: new MeshPhysicalMaterial({
      color: '#2a2622',
      metalness: 0.8,
      roughness: 0.4,
      normalMap: wrinkles,
      ...clip,
    }),
    mylar: new MeshStandardMaterial({ color: '#d9dde3', metalness: 1, roughness: 0.18, ...clip }),
    white: new MeshStandardMaterial({ color: '#eceae4', roughness: 0.6, ...clip }),
    cells: new MeshStandardMaterial({
      color: '#ffffff',
      map: cells,
      metalness: 0.3,
      roughness: 0.25,
      ...clip,
    }),
    rtg: new MeshStandardMaterial({
      color: '#3b3f45',
      metalness: 0.7,
      roughness: 0.45,
      emissive: '#3a1408',
      emissiveIntensity: 0.4,
      ...clip,
    }),
    carbon: new MeshStandardMaterial({ color: '#1c1c1f', roughness: 0.35, ...clip }),
    metal: new MeshStandardMaterial({
      color: '#9aa3ad',
      metalness: 0.85,
      roughness: 0.35,
      ...clip,
    }),
    dark: new MeshStandardMaterial({ color: '#23262b', metalness: 0.4, roughness: 0.6, ...clip }),
    copper: new MeshStandardMaterial({
      color: '#b87333',
      metalness: 0.9,
      roughness: 0.35,
      ...clip,
    }),
    glass: new MeshStandardMaterial({ color: '#203040', metalness: 0.6, roughness: 0.1, ...clip }),
    emissiveBlue: new MeshBasicMaterial({ color: '#7fb7ff', ...clip }),
    emissiveWarm: new MeshBasicMaterial({ color: '#ffd28a', ...clip }),
  };
  Object.values(real).forEach((m) => {
    const c = (m as MeshStandardMaterial).color;
    if (c) BASE_COLORS.set(m, c.clone());
  });
  return real;
}

export function makeHologramMaterial(clipped: boolean, color = '#5ef2ff'): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: HOLOGRAM_VERT,
    fragmentShader: HOLOGRAM_FRAG,
    uniforms: {
      uColor: { value: new Color(color) },
      uTime: { value: 0 },
      uGlitch: { value: 1 },
      uOpacity: { value: 0.35 },
      uRevealY: { value: -1e6 },
      uFlicker: { value: 1 },
      uScan: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
    clipping: clipped,
    clippingPlanes: clipped ? [HOLO_PLANE] : null,
  });
}

let holo: ShaderMaterial | null = null;
/** Holograma compartido con recorte (máquina activa). */
export function hologramMaterial(): ShaderMaterial {
  holo ??= makeHologramMaterial(true);
  return holo;
}
let holoFree: ShaderMaterial | null = null;
/** Holograma sin recorte (siluetas del epílogo, marcadores, Perseverance). */
export function freeHologramMaterial(): ShaderMaterial {
  holoFree ??= makeHologramMaterial(false);
  return holoFree;
}

let outline: ShaderMaterial | null = null;
/** Contorno cian por casco invertido para la pieza clave. */
export function outlineMaterial(): ShaderMaterial {
  outline ??= new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color('#5ef2ff') },
      uThickness: { value: 0.012 },
      uPulse: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform float uThickness;
      void main() {
        vec3 p = position + normal * uThickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uPulse;
      void main() { gl_FragColor = vec4(uColor * (0.7 + 0.3 * uPulse), 1.0); }`,
    side: BackSide,
  });
  return outline;
}

export const DUST_COLORS = {
  moon: new Color('#8e8f94'),
  mars: new Color('#c7895b'),
  frost: new Color('#e8eef7'),
};

/** Mezcla el color de los materiales reales hacia el polvo (0..1). */
export function applyDust(amount: number, dust: Color): void {
  const mats = realMaterials();
  for (const m of Object.values(mats)) {
    const base = BASE_COLORS.get(m);
    const c = (m as MeshStandardMaterial).color;
    if (base && c) c.copy(base).lerp(dust, Math.min(1, Math.max(0, amount)) * 0.85);
  }
}

export function setRevealY(y: number): void {
  REAL_PLANE.constant = y; // conserva y < constante
  HOLO_PLANE.constant = -y; // conserva y > constante
  hologramMaterial().uniforms.uRevealY!.value = y;
}
