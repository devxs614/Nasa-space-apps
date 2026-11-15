import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '../state/useAppStore';

/** Panel ?debug=1: FPS, llamadas de dibujo, triángulos, geometrías y texturas (Parte 17.7). Escribe en un <pre> del DOM. */
export function DebugPanel({ target }: { target: string }) {
  const frames = useRef({ n: 0, t: 0 });
  useFrame((state, delta) => {
    frames.current.n++;
    frames.current.t += delta;
    if (frames.current.t < 0.5) return;
    const el = document.getElementById(target);
    if (!el) return;
    const fps = frames.current.n / frames.current.t;
    frames.current = { n: 0, t: 0 };
    const i = state.gl.info;
    const a = useAppStore.getState();
    el.textContent = `FPS ${fps.toFixed(0)}\ncalls ${i.render.calls}\ntris ${i.render.triangles}\ngeo ${i.memory.geometries}\ntex ${i.memory.textures}\nq ${a.quality}${a.liteMode ? ' lite' : ''}`;
  });
  return null;
}
