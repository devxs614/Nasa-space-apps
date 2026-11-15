import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Group, type Mesh, type MeshBasicMaterial } from 'three';
import { Antenna, Box, Cyl, Dish, KeyPart, Rtg, SolarPanelRect, Strut } from '../parts';
import { useMat } from '../parts/mat';
import { useJourneyStore } from '../../../state/useJourneyStore';
import { useAppStore } from '../../../state/useAppStore';

/** NEAR Shoemaker: prisma octogonal de 1,7 m, cuatro paneles en abanico y antena de 1,5 m (pieza clave). */
export function NearModel() {
  return (
    <group>
      <mesh material={useMat('foil')} position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 1.7, 8]} />
      </mesh>
      {[0, 90, 180, 270].map((d, i) => (
        <SolarPanelRect
          key={i}
          w={1.2}
          h={1.8}
          position={[Math.cos((d * Math.PI) / 180) * 1.5, 1.6, Math.sin((d * Math.PI) / 180) * 1.5]}
          rotation={[0, -(d * Math.PI) / 180, (d % 180 === 0 ? 1 : -1) * 0.25]}
        />
      ))}
      <KeyPart>
        <Dish d={1.5} position={[0, 1.72, 0]} />
      </KeyPart>
      <Box w={0.3} h={0.25} d={0.3} position={[0.3, -0.1, 0.2]} mat="metal" />
      <Cyl r={0.12} h={0.3} position={[-0.3, -0.1, -0.1]} mat="dark" />
    </group>
  );
}

/** Dawn: caja de 1,6 × 1,3 × 1,8 m, alas de casi 20 m y tres motores iónicos (pieza clave). */
export function DawnModel() {
  const glow = useRef<Mesh>(null);
  const wings = useRef<Group>(null);
  useFrame((state) => {
    const js = useJourneyStore.getState();
    const reduced = useAppStore.getState().reducedMotion;
    const ion = js.fx.ion ?? 1;
    if (glow.current) {
      const m = glow.current.material as MeshBasicMaterial;
      m.opacity =
        ion * (reduced || js.paused ? 0.8 : 0.65 + 0.25 * Math.sin(state.clock.elapsedTime * 3));
    }
    if (wings.current && !reduced && !js.paused)
      wings.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.15;
  });
  return (
    <group>
      <Box w={1.6} h={1.8} d={1.3} position={[0, 0.9, 0]} mat="foil" />
      <group ref={wings} position={[0, 1.0, 0]}>
        <SolarPanelRect w={8.3} h={1.6} position={[-5.0, 0, 0]} rotation={[0, 0, 0]} />
        <SolarPanelRect w={8.3} h={1.6} position={[5.0, 0, 0]} rotation={[0, 0, 0]} />
        <Strut from={[-0.8, 0, 0]} to={[-0.85, 0, 0]} r={0.05} />
      </group>
      <Dish d={1.5} position={[0, 1.85, 0.2]} rotation={[0.2, 0, 0]} />
      <KeyPart>
        {[-0.45, 0, 0.45].map((x, i) => (
          <Cyl key={i} r={0.17} rTop={0.12} h={0.25} position={[x, -0.12, 0]} mat="dark" />
        ))}
      </KeyPart>
      <mesh ref={glow} position={[0, -0.6, 0]}>
        <coneGeometry args={[0.18, 0.9, 16, 1, true]} />
        <meshBasicMaterial
          color="#6fb6ff"
          transparent
          opacity={0.8}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Kepler: fotómetro de 4,7 × 2,7 m con parasol inclinado (pieza clave) y panel curvo. */
export function KeplerModel() {
  return (
    <group>
      <Cyl r={1.35} h={3.6} position={[0, 1.8, 0]} mat="mylar" />
      <KeyPart>
        <mesh material={useMat('dark')} position={[0, 4.0, 0]} rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[1.38, 1.38, 1.1, 32, 1, true]} />
        </mesh>
        <Cyl r={1.25} h={0.05} position={[0, 3.55, 0]} mat="glass" />
      </KeyPart>
      <mesh material={useMat('cells')} position={[0, 1.6, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 3.0, 24, 1, true, -Math.PI / 3, (Math.PI * 2) / 3]} />
      </mesh>
      <Box w={1.6} h={0.6} d={1.6} position={[0, -0.25, 0]} mat="foil" />
      <Dish d={0.8} position={[0.9, -0.4, 0.6]} rotation={[2.4, 0, 0.3]} />
    </group>
  );
}

/** Pioneer 10 y 11: antena de 2,74 m (pieza clave), compartimento hexagonal, dos RTG y placa. */
export function PioneerModel() {
  const spin = useRef<Group>(null);
  useFrame((_, delta) => {
    const js = useJourneyStore.getState();
    if (spin.current && !js.paused && !useAppStore.getState().reducedMotion)
      spin.current.rotation.y += delta * 0.4;
  });
  return (
    <group ref={spin}>
      <KeyPart>
        <Dish d={2.74} depth={0.4} position={[0, 0.6, 0]} />
        <Box
          w={0.23}
          h={0.15}
          d={0.01}
          position={[0.35, 0.35, 0.3]}
          rotation={[0, 0.3, 0]}
          mat="foil"
        />
      </KeyPart>
      <mesh material={useMat('foil')} position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.35, 6]} />
      </mesh>
      <Strut from={[0.4, 0.25, 0]} to={[2.2, 0.15, 0.4]} r={0.025} />
      <Strut from={[-0.3, 0.25, 0.3]} to={[-1.6, 0.15, 1.4]} r={0.025} />
      <Rtg h={0.5} d={0.2} position={[2.3, 0.15, 0.45]} rotation={[0, 0, Math.PI / 2]} fins={6} />
      <Rtg h={0.5} d={0.2} position={[-1.7, 0.15, 1.5]} rotation={[0, 0, Math.PI / 2]} fins={6} />
      <Strut from={[-0.2, 0.25, -0.4]} to={[-1.2, 0.2, -5.6]} r={0.012} />
      <Antenna len={0.4} position={[0, 1.2, 0]} />
    </group>
  );
}
