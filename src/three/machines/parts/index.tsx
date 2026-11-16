import { useContext, useMemo, type ReactNode } from 'react';
import {
  LatheGeometry,
  Quaternion,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three';
import type { MatKind } from '../../materials';
import { ModeContext, useMat, useSeg } from './mat';
import { flippedFaces } from '../../fitToView';

type V3 = [number, number, number];
const UP = new Vector3(0, 1, 0);

/** Cilindro orientado entre dos puntos. */
export function Strut({
  from,
  to,
  r = 0.03,
  mat = 'metal',
  name,
}: {
  from: V3;
  to: V3;
  r?: number;
  mat?: MatKind;
  name?: string;
}) {
  const m = useMat(mat);
  const seg = Math.max(6, Math.round(useSeg() / 2));
  const { pos, quat, len } = useMemo(() => {
    const a = new Vector3(...from);
    const b = new Vector3(...to);
    const d = b.clone().sub(a);
    return {
      pos: a.clone().add(b).multiplyScalar(0.5),
      quat: new Quaternion().setFromUnitVectors(UP, d.clone().normalize()),
      len: d.length(),
    };
  }, [from, to]);
  return (
    <mesh name={name} position={pos} quaternion={quat} material={m} castShadow>
      <cylinderGeometry args={[r, r, len, seg]} />
    </mesh>
  );
}

/** Pata: puntal principal, dos secundarios y disco de apoyo. */
export function Leg({
  top,
  foot,
  padR = 0.15,
  r = 0.035,
  mat = 'metal',
}: {
  top: V3;
  foot: V3;
  padR?: number;
  r?: number;
  mat?: MatKind;
}) {
  const pad = useMat('metal');
  const seg = useSeg();
  const side: V3 = [top[0] * 0.6, top[1] * 0.75, top[2] * 0.6];
  const side2: V3 = [top[0] * 0.75 + top[2] * 0.25, top[1] * 0.85, top[2] * 0.75 - top[0] * 0.25];
  return (
    <group>
      <Strut from={top} to={foot} r={r} mat={mat} />
      <Strut from={side} to={[foot[0], foot[1] + padR * 0.4, foot[2]]} r={r * 0.6} mat={mat} />
      <Strut from={side2} to={[foot[0], foot[1] + padR * 0.4, foot[2]]} r={r * 0.6} mat={mat} />
      <mesh position={[foot[0], foot[1] + 0.02, foot[2]]} material={pad} castShadow>
        <cylinderGeometry args={[padR, padR * 1.1, 0.05, seg]} />
      </mesh>
    </group>
  );
}

/** Rueda con eje a lo largo de X: estilo malla (LRV) o con tacos (rovers marcianos). */
export function Wheel({
  r,
  w,
  style = 'cleat',
  name,
  position,
}: {
  r: number;
  w: number;
  style?: 'mesh' | 'cleat';
  name?: string;
  position?: V3;
}) {
  const rim = useMat(style === 'mesh' ? 'mylar' : 'metal');
  const tread = useMat(style === 'mesh' ? 'metal' : 'dark');
  const seg = useSeg();
  return (
    <group name={name} position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={rim} castShadow>
        <cylinderGeometry args={[r * 0.98, r * 0.98, w, seg, 1, style === 'mesh']} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} material={tread}>
        <torusGeometry args={[r, r * 0.06, 6, seg]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={tread}>
        <cylinderGeometry args={[r * 0.25, r * 0.25, w * 1.05, 8]} />
      </mesh>
    </group>
  );
}

/** Suspensión rocker-bogie con tres ruedas por lado. */
export function RockerBogie({
  track,
  wheelbase,
  wheelR,
  wheelW = wheelR * 0.8,
  y = wheelR,
  name,
}: {
  track: number;
  wheelbase: number;
  wheelR: number;
  wheelW?: number;
  y?: number;
  name?: string;
}) {
  const zs = [wheelbase / 2, 0, -wheelbase / 2];
  const sides = [-track / 2, track / 2];
  return (
    <group name={name}>
      {sides.map((x, si) => (
        <group key={si}>
          {zs.map((z, zi) => (
            <Wheel
              key={zi}
              r={wheelR}
              w={wheelW}
              position={[x, y, z]}
              name={`wheel_${si ? 'r' : 'l'}${['f', 'm', 'b'][zi]}`}
            />
          ))}
          <Strut
            from={[x, y + wheelR * 1.6, zs[0]!]}
            to={[x, y + wheelR * 2.2, 0]}
            r={wheelR * 0.12}
          />
          <Strut
            from={[x, y + wheelR * 2.2, 0]}
            to={[x, y + wheelR * 1.5, zs[2]!]}
            r={wheelR * 0.12}
          />
          <Strut from={[x, y + wheelR * 1.6, zs[0]!]} to={[x, y, zs[0]!]} r={wheelR * 0.1} />
          <Strut from={[x, y + wheelR * 1.5, zs[2]!]} to={[x, y, zs[2]!]} r={wheelR * 0.1} />
          <Strut from={[x, y + wheelR * 1.3, -wheelbase * 0.1]} to={[x, y, 0]} r={wheelR * 0.1} />
        </group>
      ))}
    </group>
  );
}

export function SolarPanelRect({
  w,
  h,
  position,
  rotation,
  name,
}: {
  w: number;
  h: number;
  position?: V3;
  rotation?: V3;
  name?: string;
}) {
  const cells = useMat('cells');
  const frame = useMat('metal');
  return (
    <group name={name} position={position} rotation={rotation}>
      <mesh material={cells} castShadow receiveShadow>
        <boxGeometry args={[w, 0.02, h]} />
      </mesh>
      <mesh material={frame} position={[0, -0.015, 0]}>
        <boxGeometry args={[w * 1.02, 0.01, h * 1.02]} />
      </mesh>
    </group>
  );
}

export function SolarPanelDecagon({
  r,
  position,
  rotation,
  name,
}: {
  r: number;
  position?: V3;
  rotation?: V3;
  name?: string;
}) {
  const cells = useMat('cells');
  const frame = useMat('white');
  return (
    <group name={name} position={position} rotation={rotation}>
      <mesh material={cells} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <circleGeometry args={[r, 10]} />
      </mesh>
      <mesh material={frame} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[r * 1.01, 10]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          material={frame}
          rotation={[0, (i * Math.PI) / 5, 0]}
          position={[0, 0.005, 0]}
        >
          <boxGeometry args={[r * 2, 0.012, 0.012]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * La otra cara de una superficie abierta (plato, parasol, panel curvo). El material sólido solo
 * dibuja una cara, así que por detrás la pieza desaparecía; el holograma ya dibuja las dos.
 */
export function BackFaces({
  geometry,
  material,
}: {
  geometry: BufferGeometry;
  material: Material;
}) {
  const mode = useContext(ModeContext);
  const back = useMemo(() => (mode === 'real' ? flippedFaces(geometry) : null), [geometry, mode]);
  return back ? <mesh geometry={back} material={material} userData={{ backFaces: true }} /> : null;
}

/** Antena parabólica (perfil de parábola) con alimentador central; apunta a +Y. */
export function Dish({
  d,
  depth = d * 0.18,
  position,
  rotation,
  name,
  mat = 'white',
}: {
  d: number;
  depth?: number;
  position?: V3;
  rotation?: V3;
  name?: string;
  mat?: MatKind;
}) {
  const m = useMat(mat);
  const feed = useMat('metal');
  const seg = useSeg();
  const geo = useMemo(() => {
    const pts: Vector2[] = [];
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * (d / 2);
      pts.push(new Vector2(x, (x * x * depth) / ((d / 2) * (d / 2))));
    }
    return new LatheGeometry(pts, seg);
  }, [d, depth, seg]);
  return (
    <group name={name} position={position} rotation={rotation}>
      <mesh geometry={geo} material={m} castShadow />
      <BackFaces geometry={geo} material={m} />
      {/* Aro en el borde: de canto, el plato se sigue leyendo. */}
      <mesh material={m} position={[0, depth, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[d / 2, d * 0.014, 6, seg]} />
      </mesh>
      <Strut from={[0, 0, 0]} to={[0, depth * 2.2, 0]} r={d * 0.012} />
      <mesh material={feed} position={[0, depth * 2.2, 0]}>
        <cylinderGeometry args={[d * 0.04, d * 0.02, d * 0.06, 8]} />
      </mesh>
    </group>
  );
}

/** Generador de radioisótopos con aletas radiales. */
export function Rtg({
  h,
  d,
  fins = 8,
  position,
  rotation,
  name,
}: {
  h: number;
  d: number;
  fins?: number;
  position?: V3;
  rotation?: V3;
  name?: string;
}) {
  const m = useMat('rtg');
  const seg = useSeg();
  return (
    <group name={name} position={position} rotation={rotation}>
      <mesh material={m} castShadow>
        <cylinderGeometry args={[d / 2, d / 2, h, seg]} />
      </mesh>
      {Array.from({ length: fins }, (_, i) => (
        <mesh key={i} material={m} rotation={[0, (i / fins) * Math.PI * 2, 0]} position={[0, 0, 0]}>
          <boxGeometry args={[d * 1.7, h * 0.92, 0.012]} />
        </mesh>
      ))}
    </group>
  );
}

export function FoilBox({
  w,
  h,
  d,
  position,
  rotation,
  name,
  mat = 'foil',
}: {
  w: number;
  h: number;
  d: number;
  position?: V3;
  rotation?: V3;
  name?: string;
  mat?: MatKind;
}) {
  const m = useMat(mat);
  return (
    <mesh name={name} position={position} rotation={rotation} material={m} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
    </mesh>
  );
}

export function Box({
  w,
  h,
  d,
  position,
  rotation,
  name,
  mat = 'white',
}: {
  w: number;
  h: number;
  d: number;
  position?: V3;
  rotation?: V3;
  name?: string;
  mat?: MatKind;
}) {
  return (
    <FoilBox w={w} h={h} d={d} position={position} rotation={rotation} name={name} mat={mat} />
  );
}

export function Cyl({
  r,
  h,
  position,
  rotation,
  name,
  mat = 'white',
  rTop,
  seg,
}: {
  r: number;
  h: number;
  position?: V3;
  rotation?: V3;
  name?: string;
  mat?: MatKind;
  rTop?: number;
  seg?: number;
}) {
  const m = useMat(mat);
  const s = useSeg();
  return (
    <mesh name={name} position={position} rotation={rotation} material={m} castShadow>
      <cylinderGeometry args={[rTop ?? r, r, h, seg ?? s]} />
    </mesh>
  );
}

/** Mástil con cabezal de cámaras (dos "ojos"). */
export function Mast({
  h,
  head = 0.12,
  position,
  name,
}: {
  h: number;
  head?: number;
  position?: V3;
  name?: string;
}) {
  const eye = useMat('glass');
  return (
    <group name={name} position={position}>
      <Strut from={[0, 0, 0]} to={[0, h, 0]} r={head * 0.18} mat="white" />
      <Box w={head * 2.2} h={head * 0.8} d={head} position={[0, h + head * 0.3, 0]} />
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          material={eye}
          position={[s * head * 0.6, h + head * 0.3, head * 0.52]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[head * 0.16, head * 0.16, 0.02, 12]} />
        </mesh>
      ))}
    </group>
  );
}

/** Brazo articulado con herramienta final. */
export function RobotArm({
  segments,
  angles,
  tool = 'scoop',
  position,
  rotation,
  name,
}: {
  segments: number[];
  angles: number[];
  tool?: 'scoop' | 'grapple' | 'turret';
  position?: V3;
  rotation?: V3;
  name?: string;
}) {
  // Cadena 2D en el plano XY local; cada ángulo en radianes respecto al anterior.
  const pts: V3[] = [[0, 0, 0]];
  let a = 0;
  let x = 0;
  let y = 0;
  segments.forEach((len, i) => {
    a += angles[i] ?? 0;
    x += Math.cos(a) * len;
    y += Math.sin(a) * len;
    pts.push([x, y, 0]);
  });
  const end = pts[pts.length - 1]!;
  const r = 0.03 * Math.max(1, segments[0]! / 1.2);
  return (
    <ArmBody
      pts={pts}
      end={end}
      r={r}
      tool={tool}
      position={position}
      rotation={rotation}
      name={name}
    />
  );
}

function ArmBody({
  pts,
  end,
  r,
  tool,
  position,
  rotation,
  name,
}: {
  pts: V3[];
  end: V3;
  r: number;
  tool: 'scoop' | 'grapple' | 'turret';
  position?: V3;
  rotation?: V3;
  name?: string;
}) {
  const joint = useMat('metal');
  return (
    <group name={name} position={position} rotation={rotation}>
      {pts.slice(1).map((p, i) => (
        <group key={i}>
          <Strut from={pts[i]!} to={p} r={r} mat="white" />
          <mesh position={pts[i]} material={joint}>
            <sphereGeometry args={[r * 1.4, 10, 8]} />
          </mesh>
        </group>
      ))}
      {tool === 'scoop' && (
        <Box
          w={r * 6}
          h={r * 2.5}
          d={r * 4}
          position={[end[0] + r * 2, end[1] - r, 0]}
          mat="metal"
        />
      )}
      {tool === 'turret' && <Cyl r={r * 3} h={r * 3} position={end} mat="metal" />}
      {tool === 'grapple' && (
        <Cyl r={r * 1.5} h={r * 6} position={[end[0], end[1] - r * 3, 0]} mat="dark" />
      )}
    </group>
  );
}

/** Antena de varilla o helicoidal. */
export function Antenna({
  len,
  kind = 'rod',
  position,
  rotation,
  name,
}: {
  len: number;
  kind?: 'rod' | 'helix';
  position?: V3;
  rotation?: V3;
  name?: string;
}) {
  const m = useMat('metal');
  if (kind === 'helix')
    return (
      <group name={name} position={position} rotation={rotation}>
        <Strut from={[0, 0, 0]} to={[0, len, 0]} r={0.008} />
        {Array.from({ length: 7 }, (_, i) => (
          <mesh
            key={i}
            material={m}
            position={[0, (i + 0.5) * (len / 7), 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[len * 0.09, 0.006, 4, 16]} />
          </mesh>
        ))}
      </group>
    );
  return (
    <group name={name} position={position} rotation={rotation}>
      <Strut from={[0, 0, 0]} to={[0, len, 0]} r={0.006} />
    </group>
  );
}

/** Marca el subárbol de la pieza clave (Parte 10.1.7). */
export function KeyPart({ children }: { children: ReactNode }) {
  return <group name="keyPart">{children}</group>;
}
