import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
} from 'three';
import { Planet } from '../worlds/Planet';
import { MachineModel } from '../machines/MachineModel';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useAppStore } from '../../state/useAppStore';
import { MACHINES } from '../../data/machines';
import { latLonToVector3 } from '../../lib/coords';
import { smooth } from './useReveal';
import { FRAME } from '../layout';
import type { World } from '../../data/types';

const WORLD_DIR: Record<World, Vector3> = {
  moon: new Vector3(1, 0.2, 0.3).normalize(),
  mars: new Vector3(-0.6, 0.3, 0.75).normalize(),
  'small-bodies': new Vector3(-0.8, -0.2, -0.5).normalize(),
  'deep-space': new Vector3(0.3, 0.8, -0.5).normalize(),
};

/** Prólogo: Tierra nocturna, antenas genéricas, 15 puntos fantasma y LUMI (Parte 8.3). */
export function PrologueScene() {
  const ghosts = useRef<Group>(null);
  const antennas = useRef<Group>(null);
  const lumi = useRef<Mesh>(null);
  const trail = useRef<Mesh>(null);
  const points = useMemo(
    () =>
      MACHINES.map((m, i) => {
        const base = WORLD_DIR[m.world];
        const jitter = new Vector3(
          Math.sin(i * 7.1),
          Math.cos(i * 3.3),
          Math.sin(i * 1.9),
        ).multiplyScalar(0.18);
        return base
          .clone()
          .add(jitter)
          .normalize()
          .multiplyScalar(9 + (i % 3) * 0.8);
      }),
    [],
  );
  const lines = useMemo(
    () =>
      points.map((p) =>
        new BufferGeometry().setFromPoints([p.clone().normalize().multiplyScalar(5.1), p]),
      ),
    [points],
  );
  useEffect(() => () => lines.forEach((l) => l.dispose()), [lines]);
  // Puntos genéricos de antenas (posición exacta de la Red de Espacio Profundo pendiente de verificar).
  const antennaPos = useMemo(
    () => [-120, 0, 120].map((lon, i) => latLonToVector3([35, 40, -35][i]!, lon, 5.03)),
    [],
  );

  useFrame((state) => {
    const js = useJourneyStore.getState();
    const p = js.section === 'prologue' ? js.sectionProgress : 0;
    const reduced = useAppStore.getState().reducedMotion;
    if (antennas.current) antennas.current.visible = p > 0.14;
    if (ghosts.current) {
      ghosts.current.visible = p > 0.28;
      ghosts.current.children.forEach((c, i) => {
        c.visible = p > 0.28 + (i / 15) * 0.12;
      });
    }
    if (lumi.current) {
      const k = smooth(0.48, 0.62, p) * (1 - smooth(0.86, 0.95, p));
      lumi.current.visible = k > 0.01;
      lumi.current.position.set(-4 + k * 2, 3 - k * 0.5, 6 + k * 10);
      const s = 0.25 + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 2) * 0.04);
      lumi.current.scale.setScalar(s);
    }
    if (trail.current) {
      const k = smooth(0.86, 1, p);
      trail.current.visible = k > 0.01;
      (trail.current.material as MeshBasicMaterial).opacity = k * 0.6;
      trail.current.scale.set(1, 1, 1 + k * 30);
    }
  });

  return (
    <group>
      <directionalLight position={[-30, 10, 20]} intensity={0.5} color="#9fc4ff" />
      <Planet
        kind="earth"
        sunDir={[-1, 0.1, -0.4]}
        atmosphere={{ color: '#6fb6ff', intensity: 1.2 }}
        spin={0.02}
      />
      <group ref={antennas}>
        {antennaPos.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <meshBasicMaterial color="#5ef2ff" />
          </mesh>
        ))}
      </group>
      <group ref={ghosts}>
        {points.map((p, i) => (
          <group key={i}>
            <mesh position={p}>
              <sphereGeometry args={[0.1, 12, 8]} />
              <meshBasicMaterial color="#5ef2ff" transparent opacity={0.85} />
            </mesh>
            <lineSegments geometry={lines[i]}>
              <lineDashedMaterial
                color="#5ef2ff"
                transparent
                opacity={0.4}
                dashSize={0.15}
                gapSize={0.15}
              />
            </lineSegments>
          </group>
        ))}
      </group>
      <mesh ref={lumi} visible={false}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshBasicMaterial color="#5ef2ff" />
      </mesh>
      <mesh ref={trail} position={[20, 4, 2]} rotation={[0, Math.PI / 2.4, 0]} visible={false}>
        <boxGeometry args={[0.05, 0.05, 1]} />
        <meshBasicMaterial color="#5ef2ff" transparent opacity={0} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
}

/** Epílogo: cadena de luz entre siluetas holográficas de todas las máquinas (Parte 8.8). */
export function EpilogueScene() {
  const spark = useRef<Mesh>(null);
  const xs = MACHINES.map((_, i) => -14 + i * 2);
  useFrame(() => {
    const js = useJourneyStore.getState();
    const p = js.section === 'epilogue' ? js.sectionProgress : 0;
    if (spark.current) {
      const k = Math.min(1, p / 0.45);
      spark.current.position.set(-14 + k * 28, 1.4 + Math.sin(k * Math.PI * 7) * 0.3, 0);
      spark.current.visible = p < 0.5;
    }
  });
  return (
    <group>
      <ambientLight intensity={0.2} />
      {MACHINES.map((m, i) => (
        <group key={m.id} position={[xs[i]!, 0, Math.sin(i * 0.7) * 1.5 - 1]}>
          <MachineModel id={m.id} reveal={() => 0} holoOnly scale={1.6 / FRAME[m.id]} />
        </group>
      ))}
      <mesh ref={spark}>
        <sphereGeometry args={[0.16, 16, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <group position={[8, 6, -14]}>
        <Planet
          kind="earth"
          radius={2.2}
          sunDir={[-1, 0.2, 0.6]}
          atmosphere={{ color: '#6fb6ff', intensity: 1.2 }}
        />
        <Planet kind="moon" radius={0.6} position={[-5, 1.5, 2]} sunDir={[-1, 0.2, 0.6]} />
      </group>
    </group>
  );
}

/** Campo de estrellas a la deriva para páginas de texto. */
export function IdleScene() {
  const g = useRef<Group>(null);
  useFrame((_, delta) => {
    const js = useJourneyStore.getState();
    if (g.current && !js.paused && !useAppStore.getState().reducedMotion)
      g.current.rotation.y += delta * 0.01;
  });
  return <group ref={g} />;
}
