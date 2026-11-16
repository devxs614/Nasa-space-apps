import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, Sphere, type Group, type PerspectiveCamera } from 'three';
import { MachineModel } from '../machines/MachineModel';
import { useJourneyStore } from '../../state/useJourneyStore';
import { fitRadius, localBounds, maxNdc } from '../fitToView';

/** Cámara del visor con zoom 1 (ver `showcase` en cameraShots.ts). */
const VIEW_DISTANCE = 6.2;
const VIEW_FOV = 38;
/** Radio máximo de la máquina sobre el pedestal, que mide 1,7. */
const MAX_RADIUS = 1.45;

/**
 * Encuadra la máquina por su volumen real: la escala para que su esfera envolvente quepa entera
 * en pantalla (también en pantallas estrechas), la centra y la apoya en el pedestal.
 */
function fitToPedestal(group: Group, aspect: number): boolean {
  const box = localBounds(group);
  if (box.isEmpty()) return false;
  const sphere = box.getBoundingSphere(new Sphere());
  if (sphere.radius <= 0) return false;
  const k = Math.min(MAX_RADIUS, fitRadius(aspect, VIEW_FOV, VIEW_DISTANCE)) / sphere.radius;
  group.scale.setScalar(k);
  group.position.set(-sphere.center.x * k, -box.min.y * k, -sphere.center.z * k);
  return true;
}

/** Pedestal holográfico con una máquina encuadrada por su tamaño real (Parte 9.2). */
export function ShowcaseScene() {
  const id = useJourneyStore((s) => s.showcaseId);
  const g = useRef<Group>(null);
  const fit = useRef<Group>(null);
  const fitted = useRef(false);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));

  // Antes del primer fotograma de cada máquina y cada vez que cambia la forma del lienzo.
  useLayoutEffect(() => {
    fitted.current = fit.current ? fitToPedestal(fit.current, aspect) : false;
    invalidate();
  }, [id, aspect, invalidate]);

  useFrame((_, delta) => {
    const js = useJourneyStore.getState();
    if (!g.current) return;
    if (!fitted.current && fit.current) fitted.current = fitToPedestal(fit.current, aspect);
    const target = js.showcaseView.yaw;
    g.current.rotation.y += (target - g.current.rotation.y) * Math.min(1, delta * 6);
  });

  // Solo para pruebas y depuración: cuánto ocupa la máquina en pantalla (1 = toca el borde).
  useEffect(() => {
    if (!import.meta.env.DEV && !new URLSearchParams(window.location.search).has('debug')) return;
    const w = window as unknown as { __viewerDebug?: { fit: () => number } };
    w.__viewerDebug = {
      fit: () => {
        const f = fit.current;
        if (!f) return Number.POSITIVE_INFINITY;
        camera.updateMatrixWorld();
        return maxNdc(localBounds(f), f.matrixWorld, camera as PerspectiveCamera);
      },
    };
    return () => {
      delete w.__viewerDebug;
    };
  }, [camera]);

  if (!id) return null;
  return (
    <group>
      <directionalLight position={[5, 6, 4]} intensity={2.2} />
      <directionalLight position={[-6, 3, -2]} intensity={0.8} color="#9fc4ff" />
      <directionalLight position={[0, 4, -6]} intensity={1.2} color="#5ef2ff" />
      <ambientLight intensity={0.15} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[1.6, 1.75, 64]} />
        <meshBasicMaterial color="#5ef2ff" transparent opacity={0.7} blending={AdditiveBlending} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[1.7, 1.9, 0.2, 64]} />
        <meshStandardMaterial color="#0b0f1a" metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={g}>
        <group ref={fit}>
          <MachineModel key={id} id={id} reveal={() => 1} />
        </group>
      </group>
    </group>
  );
}
