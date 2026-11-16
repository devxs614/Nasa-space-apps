import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import {
  Antenna,
  Box,
  Cyl,
  Dish,
  KeyPart,
  Leg,
  Mast,
  RobotArm,
  RockerBogie,
  Rtg,
  SolarPanelRect,
  Strut,
  Wheel,
} from '../parts';
import { useMat } from '../parts/mat';
import { useJourneyStore } from '../../../state/useJourneyStore';

const ring = (r: number, deg: number, y: number): [number, number, number] => [
  r * Math.cos((deg * Math.PI) / 180),
  y,
  r * Math.sin((deg * Math.PI) / 180),
];

/** Viking: cuerpo hexagonal de 1,5 m sobre tres patas y brazo muestreador (pieza clave). */
export function VikingModel() {
  const arm = useRef<Group>(null);
  useFrame((state) => {
    const dig = useJourneyStore.getState().fx.dig ?? 0;
    if (arm.current)
      arm.current.scale.x = 0.6 + dig * (0.7 + 0.3 * Math.sin(state.clock.elapsedTime * 2));
  });
  return (
    <group>
      <mesh material={useMat('white')} position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.45, 6]} />
      </mesh>
      {[30, 150, 270].map((d, i) => (
        <Leg key={i} top={ring(0.7, d, 0.8)} foot={ring(1.4, d, 0.02)} padR={0.15} />
      ))}
      <Strut from={[0.2, 1.15, -0.3]} to={[0.2, 1.75, -0.3]} r={0.035} name="antenna-hga-mast" />
      <Dish d={0.76} position={[0.2, 1.75, -0.3]} rotation={[-0.8, 0, 0.3]} name="antenna-hga" />
      <Rtg h={0.4} d={0.28} position={[-0.45, 1.35, 0.25]} />
      <Rtg h={0.4} d={0.28} position={[0.45, 1.35, 0.25]} />
      {[-0.25, 0.25].map((x, i) => (
        <group key={i} position={[x, 1.3, 0.62]}>
          <Cyl r={0.08} h={0.35} mat="metal" />
          <Box w={0.02} h={0.18} d={0.02} position={[0, 0.05, 0.08]} mat="dark" />
        </group>
      ))}
      <Strut from={[-0.6, 1.1, -0.3]} to={[-0.75, 1.65, -0.35]} r={0.025} name="antenna-lga" />
      <Box w={0.12} h={0.06} d={0.06} position={[-0.75, 1.68, -0.35]} mat="metal" />
      <KeyPart>
        <group ref={arm} position={[0.5, 0.95, 0.3]} rotation={[0, -0.6, 0]}>
          <Box w={1.2} h={0.08} d={0.08} position={[0.6, 0, 0]} mat="metal" />
          <Box w={0.16} h={0.1} d={0.12} position={[1.22, -0.03, 0]} mat="metal" />
        </group>
      </KeyPart>
    </group>
  );
}

/** Sojourner: rover de 0,65 × 0,48 × 0,30 m con suspensión rocker-bogie (pieza clave). */
export function SojournerModel() {
  return (
    <group>
      <Box w={0.48} h={0.12} d={0.65} position={[0, 0.2, 0]} />
      <SolarPanelRect w={0.48} h={0.6} position={[0, 0.28, 0]} />
      <Box w={0.08} h={0.08} d={0.06} position={[0, 0.15, -0.36]} mat="metal" />
      <Antenna len={0.3} position={[0.18, 0.28, -0.25]} />
      <KeyPart>
        <RockerBogie track={0.46} wheelbase={0.5} wheelR={0.065} />
      </KeyPart>
    </group>
  );
}

/** Módulo Mars Pathfinder abierto (escenario): base con tres pétalos, bolsas desinfladas y rampa. */
export function PathfinderLander() {
  const white = useMat('white');
  const cells = useMat('cells');
  const mylar = useMat('mylar');
  return (
    <group>
      <mesh material={white} position={[0, 0.25, 0]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.3, 3]} />
      </mesh>
      {[0, 120, 240].map((d, i) => (
        <group key={i} rotation={[0, (d * Math.PI) / 180, 0]}>
          <mesh material={cells} position={[1.0, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.03, 3]} />
          </mesh>
          <mesh material={mylar} position={[1.5, 0.12, 0]}>
            <sphereGeometry args={[0.35, 12, 8]} />
          </mesh>
        </group>
      ))}
      <Box w={0.3} h={0.02} d={0.9} position={[0, 0.1, 1.2]} rotation={[0.35, 0, 0]} mat="metal" />
      <Mast h={0.8} head={0.1} position={[0, 0.4, 0]} />
      <Dish d={0.35} position={[0.25, 0.5, -0.1]} rotation={[0.6, 0, 0]} />
    </group>
  );
}

/** Modelo base MER (Spirit y Opportunity): 1,6 m de largo, 2,3 m con alas, mástil a 1,5 m. */
export function MerModel({ variant }: { variant: 'spirit' | 'opportunity' }) {
  const panels = (
    <group>
      <SolarPanelRect w={1.1} h={1.3} position={[0, 0.72, -0.05]} />
      <SolarPanelRect w={0.6} h={0.9} position={[-0.85, 0.72, 0.1]} rotation={[0, 0, 0.05]} />
      <SolarPanelRect w={0.6} h={0.9} position={[0.85, 0.72, 0.1]} rotation={[0, 0, -0.05]} />
      <SolarPanelRect w={0.9} h={0.35} position={[0, 0.72, -0.85]} />
    </group>
  );
  return (
    <group>
      <Box w={0.9} h={0.32} d={1.05} position={[0, 0.5, 0]} />
      {variant === 'opportunity' ? <KeyPart>{panels}</KeyPart> : panels}
      <Mast h={0.75} head={0.13} position={[0.3, 0.75, 0.45]} />
      <Cyl r={0.14} h={0.03} position={[-0.3, 0.86, 0.3]} rotation={[0.9, 0, 0]} mat="dark" />
      <Antenna len={0.6} position={[-0.35, 0.75, -0.4]} />
      <RobotArm
        segments={[0.35, 0.3]}
        angles={[-0.2, -2.6]}
        tool="turret"
        position={[0, 0.4, 0.55]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      {variant === 'spirit' ? (
        <group>
          <RockerBogie track={1.1} wheelbase={1.0} wheelR={0.125} wheelW={0.16} />
          <KeyPart>
            <Wheel r={0.135} w={0.18} position={[0.55, 0.125, 0.5]} />
          </KeyPart>
        </group>
      ) : (
        <RockerBogie track={1.1} wheelbase={1.0} wheelR={0.125} wheelW={0.16} />
      )}
    </group>
  );
}
