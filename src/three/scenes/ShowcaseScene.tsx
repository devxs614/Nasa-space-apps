import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Group } from 'three';
import { MachineModel } from '../machines/MachineModel';
import { useJourneyStore } from '../../state/useJourneyStore';
import { FRAME } from '../layout';

/** Pedestal holográfico con una máquina normalizada a unas 3 unidades (Parte 9.2). */
export function ShowcaseScene() {
  const id = useJourneyStore((s) => s.showcaseId);
  const g = useRef<Group>(null);
  useFrame((_, delta) => {
    const js = useJourneyStore.getState();
    if (!g.current) return;
    const target = js.showcaseView.yaw;
    g.current.rotation.y += (target - g.current.rotation.y) * Math.min(1, delta * 6);
  });
  if (!id) return null;
  const s = 3 / FRAME[id];
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
        <MachineModel key={id} id={id} reveal={() => 1} scale={s} />
      </group>
    </group>
  );
}
