import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { Vector3, type PerspectiveCamera } from 'three';
import { useJourneyStore } from '../state/useJourneyStore';
import { useAppStore } from '../state/useAppStore';
import { resolveShot } from './cameraShots';

/** Planos de cámara amortiguados (Parte 9.12). Los atlas desactivan el rig y usan OrbitControls. */
export function CameraRig() {
  const target = useRef(new Vector3());
  const lastKey = useRef('');
  const right = useRef(new Vector3()).current;
  const lookAt = useRef(new Vector3()).current;
  useFrame((state, delta) => {
    const js = useJourneyStore.getState();
    if (js.sceneKey === 'atlas-moon' || js.sceneKey === 'atlas-mars') return;
    const reduced = useAppStore.getState().reducedMotion;
    const shot = resolveShot(js);
    const cam = state.camera as PerspectiveCamera;
    const key = `${js.sceneKey}|${js.chapterId ?? ''}|${js.beat ?? js.section ?? ''}`;
    const cut = reduced && key !== lastKey.current;
    lastKey.current = key;
    if (cut || reduced) {
      // Movimiento reducido: corte directo (el fundido lo hace el DOM).
      cam.position.copy(shot.position);
      target.current.copy(shot.target);
    } else {
      const t = shot.smoothTime ?? 0.35;
      const dt = Math.min(delta, 0.1);
      easing.damp3(cam.position, shot.position, t, dt);
      easing.damp3(target.current, shot.target, t, dt);
      if (shot.drift && !js.paused) {
        const e = state.clock.elapsedTime;
        cam.position.x += Math.sin(e * 0.21) * 0.004 * cam.position.length() * 0.05;
        cam.position.y += Math.cos(e * 0.17) * 0.004 * cam.position.length() * 0.05;
      }
    }
    // Encuadre: en pantallas anchas el sujeto queda a la derecha del texto.
    const aspect = state.size.width / Math.max(1, state.size.height);
    if (aspect > 1.15 && shot.type !== 'trajectory') {
      right.subVectors(cam.position, target.current).cross(cam.up).normalize();
      const dist = cam.position.distanceTo(target.current);
      lookAt
        .copy(target.current)
        .addScaledVector(right, dist * 0.2 * Math.min(1, (aspect - 1.15) * 2));
      cam.lookAt(lookAt);
    } else cam.lookAt(target.current);
    if (Math.abs(cam.fov - shot.fov) > 0.01) {
      if (reduced) cam.fov = shot.fov;
      else easing.damp(cam, 'fov', shot.fov, 0.35, Math.min(delta, 0.1));
      cam.updateProjectionMatrix();
    }
    if (
      cam.position.distanceTo(shot.position) > 0.001 ||
      target.current.distanceTo(shot.target) > 0.001
    )
      state.invalidate();
  });
  return null;
}
