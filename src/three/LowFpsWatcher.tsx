import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '../state/useAppStore';
import { useUiStore } from '../state/useUiStore';

let asked = false;

/**
 * Si en calidad baja los FPS siguen por debajo de 24 durante 5 s, pregunta (sin activarlo solo) si se quiere
 * cambiar a modo ligero (Parte 17.8). Una vez por visita.
 */
export function LowFpsWatcher() {
  const slow = useRef(0);
  const win = useRef({ n: 0, t: 0 });
  useFrame((_, delta) => {
    if (asked) return;
    const app = useAppStore.getState();
    if (app.quality !== 'low' || app.liteMode || app.liteDecided || document.hidden) {
      slow.current = 0;
      return;
    }
    win.current.n++;
    win.current.t += delta;
    if (win.current.t < 1) return;
    const fps = win.current.n / win.current.t;
    slow.current = fps < 24 ? slow.current + win.current.t : 0;
    win.current = { n: 0, t: 0 };
    if (slow.current >= 5) {
      asked = true;
      useUiStore.getState().setLiteAsk(true);
    }
  });
  return null;
}
