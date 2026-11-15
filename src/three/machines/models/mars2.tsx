import { useContext, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Group, type Mesh } from 'three';
import {
  Antenna,
  Box,
  Cyl,
  KeyPart,
  Leg,
  Mast,
  RobotArm,
  SolarPanelDecagon,
  SolarPanelRect,
  Strut,
} from '../parts';
import { FlagsContext, useMat } from '../parts/mat';
import { useJourneyStore } from '../../../state/useJourneyStore';
import { useAppStore } from '../../../state/useAppStore';

const ring = (r: number, deg: number, y: number): [number, number, number] => [
  r * Math.cos((deg * Math.PI) / 180),
  y,
  r * Math.sin((deg * Math.PI) / 180),
];

/** Phoenix: plataforma de 1,5 m, paneles decagonales de 1,8 m y brazo de 2,35 m (pieza clave). */
export function PhoenixModel({ collapsed: forced = false }: { collapsed?: boolean }) {
  const flags = useContext(FlagsContext);
  const collapsed = forced || Boolean(flags.collapsed);
  return (
    <group>
      <mesh material={useMat('white')} position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.25, 12]} />
      </mesh>
      {[90, 210, 330].map((d, i) => (
        <Leg key={i} top={ring(0.6, d, 0.85)} foot={ring(1.0, d, 0.02)} padR={0.14} />
      ))}
      <SolarPanelDecagon
        r={0.9}
        position={[-1.65, 1.0, 0]}
        rotation={[0, 0, collapsed ? 0.55 : 0.02]}
      />
      <SolarPanelDecagon r={0.9} position={[1.65, 1.0, 0]} rotation={[0, 0, -0.02]} />
      <KeyPart>
        <RobotArm
          segments={[1.1, 1.0]}
          angles={[0.15, -1.3]}
          tool="scoop"
          position={[0.3, 1.0, 0.6]}
          rotation={[0, -1.2, 0]}
        />
      </KeyPart>
      <Mast h={0.9} head={0.1} position={[-0.3, 1.05, 0.2]} />
      <Strut from={[0.4, 1.05, -0.4]} to={[0.4, 2.0, -0.4]} r={0.015} />
      <Box w={0.12} h={0.04} d={0.04} position={[0.4, 2.0, -0.4]} mat="metal" />
      <Box w={0.18} h={0.12} d={0.35} position={[-0.1, 1.15, -0.35]} mat="metal" />
    </group>
  );
}

/** InSight: plataforma de 1,56 m, paneles de 2,15 m y sismómetro SEIS bajo su cúpula (pieza clave). */
export function InsightModel() {
  return (
    <group>
      <mesh material={useMat('white')} position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.78, 0.78, 0.28, 12]} />
      </mesh>
      {[90, 210, 330].map((d, i) => (
        <Leg key={i} top={ring(0.62, d, 0.85)} foot={ring(1.05, d, 0.02)} padR={0.14} />
      ))}
      <SolarPanelDecagon r={1.075} position={[-1.85, 1.0, 0]} />
      <SolarPanelDecagon r={1.075} position={[1.85, 1.0, 0]} />
      <RobotArm
        segments={[0.9, 0.8]}
        angles={[0.4, -1.9]}
        tool="grapple"
        position={[0, 1.0, 0.7]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <KeyPart>
        <mesh material={useMat('copper')} position={[0, 0, 1.75]} castShadow>
          <sphereGeometry args={[0.36, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={useMat('mylar')} position={[0, 0.01, 1.75]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.36, 0.5, 24]} />
        </mesh>
      </KeyPart>
      <Box w={0.3} h={0.3} d={0.25} position={[0.8, 0.15, 1.6]} mat="metal" />
      <Strut from={[0.8, 0.3, 1.6]} to={[0.8, 0.0, 1.85]} r={0.02} />
    </group>
  );
}

/** Ingenuity: fuselaje de 13,6 × 19,5 cm y rotores coaxiales de 1,2 m (pieza clave). */
export function IngenuityModel({ broken: forced = false }: { broken?: boolean }) {
  const flags = useContext(FlagsContext);
  const broken = forced || Boolean(flags.broken);
  const upper = useRef<Group>(null);
  const lower = useRef<Group>(null);
  const disc = useRef<Mesh>(null);
  useFrame((_, delta) => {
    const js = useJourneyStore.getState();
    const reduced = useAppStore.getState().reducedMotion;
    if (js.paused || broken) return;
    const spin = (js.fx.fly ?? 0.15) * (reduced ? 2 : 40);
    if (upper.current) upper.current.rotation.y += delta * spin;
    if (lower.current) lower.current.rotation.y -= delta * spin;
    if (disc.current) disc.current.visible = spin > 12;
  });
  const carbon = useMat('carbon');
  const blade = (rot: number, y: number) => (
    <mesh material={carbon} rotation={[0, rot, 0]} position={[0, y, 0]} castShadow>
      <boxGeometry args={[1.2, 0.012, 0.08]} />
    </mesh>
  );
  return (
    <group>
      <Box w={0.195} h={0.136} d={0.136} position={[0, 0.3, 0]} />
      {[45, 135, 225, 315].map((d, i) => (
        <Strut key={i} from={ring(0.06, d, 0.25)} to={ring(0.33, d, 0.0)} r={0.008} mat="carbon" />
      ))}
      <Strut from={[0, 0.36, 0]} to={[0, 0.8, 0]} r={0.012} mat="metal" />
      <SolarPanelRect w={0.42} h={0.17} position={[0, 0.82, 0]} />
      <KeyPart>
        <group ref={lower} position={[0, 0.5, 0]}>
          {blade(0, 0)}
          {!broken && blade(Math.PI, 0.001)}
        </group>
        <group ref={upper} position={[0, 0.62, 0]}>
          {blade(Math.PI / 2, 0)}
        </group>
        <mesh ref={disc} position={[0, 0.56, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <ringGeometry args={[0.05, 0.6, 48]} />
          <meshBasicMaterial
            color="#9fb3c8"
            transparent
            opacity={0.12}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </KeyPart>
      <Antenna len={0.1} position={[0.08, 0.37, 0]} />
      <Cyl
        r={0.02}
        h={0.03}
        position={[0, 0.22, 0.07]}
        rotation={[Math.PI / 2, 0, 0]}
        mat="glass"
      />
    </group>
  );
}

/** Silueta holográfica de Perseverance (sin detalle; máquina activa, no protagonista). */
export function PerseveranceSilhouette() {
  return (
    <group>
      <Box w={1.1} h={0.45} d={2.4} position={[0, 0.85, 0]} />
      <Mast h={1.2} head={0.18} position={[0.4, 1.05, 0.9]} />
      {[-0.65, 0.65].flatMap((x) =>
        [-0.85, 0, 0.85].map((z) => (
          <Cyl
            key={`${x}${z}`}
            r={0.26}
            h={0.25}
            position={[x * 1.1, 0.26, z]}
            rotation={[0, 0, Math.PI / 2]}
          />
        )),
      )}
      <Box w={0.6} h={0.5} d={0.5} position={[0, 1.1, -1.0]} />
    </group>
  );
}
