import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, type Group, type InstancedMesh } from 'three';
import {
  Antenna,
  Box,
  Cyl,
  Dish,
  FoilBox,
  KeyPart,
  Leg,
  RobotArm,
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

/** Surveyor: marco tubular de unos 3 m con tres patas y pala muestreadora (pieza clave). */
export function SurveyorModel() {
  const arm = useRef<Group>(null);
  useFrame((state) => {
    const dig = useJourneyStore.getState().fx.dig ?? 0;
    if (arm.current)
      arm.current.rotation.z =
        -0.15 - dig * 0.5 * (0.6 + 0.4 * Math.sin(state.clock.elapsedTime * 4));
  });
  const corners = [90, 210, 330].map((d) => ring(0.75, d, 1.05));
  return (
    <group>
      {corners.map((c, i) => (
        <Strut key={i} from={c} to={corners[(i + 1) % 3]!} r={0.035} />
      ))}
      {corners.map((c, i) => (
        <Strut key={`m${i}`} from={c} to={[0, 2.2, 0]} r={0.025} />
      ))}
      {[90, 210, 330].map((d, i) => (
        <Leg key={i} top={ring(0.75, d, 1.05)} foot={ring(2.1, d, 0.02)} padR={0.2} />
      ))}
      <Strut from={[0, 1.05, 0]} to={[0, 3, 0]} r={0.035} />
      <SolarPanelRect w={0.9} h={0.75} position={[0.35, 3.0, 0]} rotation={[0, 0, -0.5]} />
      <Box w={0.9} h={0.03} d={0.9} position={[-0.4, 2.85, 0]} rotation={[0, 0, 0.7]} mat="mylar" />
      <Box w={0.5} h={0.35} d={0.4} position={[0.45, 1.25, 0.35]} />
      <Box w={0.5} h={0.35} d={0.4} position={[-0.5, 1.25, 0.2]} />
      <Box
        w={0.18}
        h={0.14}
        d={0.03}
        position={[0.1, 1.65, 0.62]}
        rotation={[0.6, 0, 0]}
        mat="mylar"
      />
      {[90, 210, 330].map((d, i) => (
        <Cyl key={i} r={0.07} h={0.18} rTop={0.04} position={ring(0.55, d, 0.9)} mat="dark" />
      ))}
      <KeyPart>
        <group ref={arm} position={[-0.3, 1.0, -0.55]}>
          <RobotArm
            segments={[0.8, 0.55]}
            angles={[-0.4, -0.9]}
            tool="scoop"
            rotation={[0, Math.PI * 0.75, 0]}
          />
        </group>
        <Cyl r={0.11} h={0.5} position={[0.1, 1.35, 0.6]} mat="white" />
      </KeyPart>
    </group>
  );
}

/** Etapa de descenso Apollo: prisma octogonal de 4,2 m a 1,5 m del suelo; discos a 9,4 m. */
export function ApolloDescentModel({ plaque = true }: { plaque?: boolean }) {
  const legDeg = [45, 135, 225, 315];
  return (
    <group>
      <mesh
        material={useMat('foil')}
        position={[0, 2.35, 0]}
        rotation={[0, Math.PI / 8, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[2.27, 2.27, 1.7, 8]} />
      </mesh>
      {[0, 2, 4, 6].map((i) => (
        <FoilBox
          key={i}
          w={1.4}
          h={1.5}
          d={0.05}
          mat="foilDark"
          position={ring(2.12, i * 45 + 22.5, 2.35)}
          rotation={[0, -((i * 45 + 22.5) * Math.PI) / 180 + Math.PI / 2, 0]}
        />
      ))}
      <Cyl r={0.55} rTop={0.3} h={1.0} position={[0, 1.0, 0]} mat="dark" />
      <KeyPart>
        {legDeg.map((d, i) => (
          <Leg
            key={i}
            top={ring(1.9, d, 2.0)}
            foot={ring(4.7, d, 0.02)}
            padR={0.45}
            r={0.07}
            mat="foil"
          />
        ))}
        {plaque && (
          <Box
            w={0.23}
            h={0.19}
            d={0.02}
            mat="mylar"
            position={ring(3.0, 45, 1.25)}
            rotation={[0, -Math.PI / 4, -0.55]}
          />
        )}
      </KeyPart>
      {/* Escalera y porche en la pata delantera */}
      {Array.from({ length: 8 }, (_, i) => (
        <Strut
          key={i}
          from={
            [...ring(2.25 + i * 0.27, 45, 2.0 - i * 0.24)].map((x, k) =>
              k === 2 ? x - 0.2 : x,
            ) as [number, number, number]
          }
          to={
            [...ring(2.25 + i * 0.27, 45, 2.0 - i * 0.24)].map((x, k) =>
              k === 0 ? x - 0.2 : x,
            ) as [number, number, number]
          }
          r={0.015}
        />
      ))}
      <Box
        w={0.8}
        h={0.05}
        d={0.6}
        position={ring(1.95, 45, 3.2)}
        rotation={[0, -Math.PI / 4, 0]}
        mat="foil"
      />
      {[135, 225, 315].map((d, i) => (
        <Strut key={i} from={ring(4.7, d, 0.05)} to={ring(4.7, d, -0.9)} r={0.01} />
      ))}
      {[0, 90, 180, 270].map((d, i) => (
        <Box key={i} w={0.25} h={0.15} d={0.25} position={ring(1.4, d, 3.25)} mat="dark" />
      ))}
    </group>
  );
}

/** Etapa de ascenso holográfica (siempre holograma; Parte 10.4). */
export function ApolloAscentModel() {
  return (
    <group>
      <mesh material={useMat('white')} position={[0, 0.9, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 1.8, 6]} />
      </mesh>
      <mesh material={useMat('white')} position={[0.4, 1.9, 0.6]} rotation={[0.3, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.9]} />
      </mesh>
      <Dish d={0.8} position={[-0.9, 2.1, -0.4]} rotation={[0.4, 0, 0.6]} />
      <Cyl r={0.35} h={0.6} position={[0, 2.1, 0]} />
    </group>
  );
}

/** ALSEP: estación central, RTG, sismómetro bajo manta y retrorreflector (pieza clave). */
export function AlsepModel() {
  const prism = useMat('glass');
  const holder = useMemo(() => new Object3D(), []);
  const inst = useRef<InstancedMesh>(null);
  const placed = useRef(false);
  useFrame(() => {
    if (!inst.current || placed.current) return;
    let k = 0;
    for (let i = 0; i < 10; i++)
      for (let j = 0; j < 10; j++) {
        holder.position.set(-0.27 + i * 0.06, 0, -0.27 + j * 0.06);
        holder.rotation.set(0, 0, 0);
        holder.updateMatrix();
        inst.current.setMatrixAt(k++, holder.matrix);
      }
    inst.current.instanceMatrix.needsUpdate = true;
    placed.current = true;
  });
  return (
    <group>
      <Box w={0.6} h={0.35} d={0.45} position={[0, 0.25, 0]} />
      <SolarPanelRect w={0.75} h={0.6} position={[0, 0.75, 0]} />
      {[
        [-0.3, -0.25],
        [0.3, -0.25],
        [-0.3, 0.25],
        [0.3, 0.25],
      ].map(([x, z], i) => (
        <Strut key={i} from={[x!, 0.42, z!]} to={[x!, 0.75, z!]} r={0.01} />
      ))}
      <Antenna len={0.58} kind="helix" position={[0.15, 0.42, -0.1]} rotation={[0, 0, -0.6]} />
      <Rtg h={0.46} d={0.2} position={[-2.6, 0.3, 1.2]} />
      <KeyPart>
        <group position={[2.0, 0, 1.4]}>
          <mesh material={useMat('mylar')} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.75, 24]} />
          </mesh>
          <Cyl r={0.15} h={0.3} position={[0, 0.17, 0]} mat="mylar" />
        </group>
        <group position={[-1.2, 0.25, -2.4]} rotation={[-0.5, 0.3, 0]}>
          <Box w={0.65} h={0.06} d={0.65} mat="metal" />
          <instancedMesh
            ref={inst}
            args={[undefined, undefined, 100]}
            material={prism}
            position={[0, 0.04, 0]}
          >
            <cylinderGeometry args={[0.025, 0.025, 0.02, 6]} />
          </instancedMesh>
          <Strut from={[0, -0.03, 0.2]} to={[0, -0.3, 0.3]} r={0.02} />
        </group>
      </KeyPart>
      <group position={[1.2, 0, -1.5]}>
        <Strut from={[0, 0, 0]} to={[0, 0.5, 0]} r={0.02} />
        {[0, 120, 240].map((d, i) => (
          <Strut key={i} from={[0, 0.5, 0]} to={ring(0.5, d, 0.55)} r={0.012} />
        ))}
      </group>
      <Strut from={[0, 0.05, 0]} to={[-2.6, 0.05, 1.2]} r={0.006} mat="dark" />
      <Strut from={[0, 0.05, 0]} to={[2.0, 0.05, 1.4]} r={0.006} mat="dark" />
      <Strut from={[0, 0.05, 0]} to={[1.2, 0.05, -1.5]} r={0.006} mat="dark" />
    </group>
  );
}

/** LRV: chasis de 3,1 m, 2,3 m entre ejes y ruedas de malla (pieza clave). */
export function LrvModel() {
  const wheels = useRef<Group>(null);
  useFrame((_, delta) => {
    const drive = useJourneyStore.getState().fx.fly ?? 0;
    if (!wheels.current || drive === 0) return;
    wheels.current.children.forEach((w) => {
      w.rotation.x += delta * 6 * drive;
    });
  });
  const wx = 0.92;
  const wz = 1.15;
  return (
    <group>
      <Box w={1.5} h={0.12} d={3.1} position={[0, 0.62, 0]} mat="metal" />
      <KeyPart>
        <group ref={wheels}>
          {[
            [-wx, wz],
            [wx, wz],
            [-wx, -wz],
            [wx, -wz],
          ].map(([x, z], i) => (
            <Wheel
              key={i}
              r={0.41}
              w={0.23}
              style="mesh"
              position={[x!, 0.41, z!]}
              name={`wheel_${i}`}
            />
          ))}
        </group>
      </KeyPart>
      {[
        [-wx, wz],
        [wx, wz],
        [-wx, -wz],
        [wx, -wz],
      ].map(([x, z], i) => (
        <Box
          key={i}
          w={0.3}
          h={0.04}
          d={0.75}
          position={[x! * 1.02, 0.86, z!]}
          rotation={[0, 0, x! > 0 ? -0.2 : 0.2]}
          mat="mylar"
        />
      ))}
      {[-0.35, 0.35].map((x, i) => (
        <group key={i} position={[x, 0.7, -0.2]}>
          <Box w={0.5} h={0.06} d={0.5} mat="dark" />
          <Box w={0.5} h={0.5} d={0.05} position={[0, 0.25, -0.25]} mat="dark" />
        </group>
      ))}
      <Box w={0.25} h={0.4} d={0.2} position={[0, 0.9, 0.35]} mat="dark" />
      <Strut from={[0, 1.1, 0.35]} to={[0, 1.22, 0.25]} r={0.015} />
      <Box w={0.2} h={0.03} d={0.03} position={[0, 1.22, 0.25]} mat="dark" />
      <Strut from={[0.45, 0.7, 1.3]} to={[0.45, 1.5, 1.3]} r={0.02} />
      <Dish d={0.9} depth={0.15} position={[0.45, 1.5, 1.3]} rotation={[-0.6, 0, 0]} mat="mylar" />
      <Antenna len={0.6} position={[-0.45, 0.7, 1.3]} />
      <Cyl
        r={0.07}
        h={0.25}
        position={[-0.2, 1.05, 1.45]}
        rotation={[Math.PI / 2, 0, 0]}
        mat="dark"
      />
      <Strut from={[-0.2, 0.7, 1.4]} to={[-0.2, 1.0, 1.45]} r={0.015} />
      <Box w={1.1} h={0.25} d={0.4} position={[0, 0.78, -1.35]} mat="metal" />
    </group>
  );
}
