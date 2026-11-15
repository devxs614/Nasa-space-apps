import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BackSide,
  type DirectionalLight,
  BufferAttribute,
  CanvasTexture,
  Color,
  DynamicDrawUsage,
  FogExp2,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  BufferGeometry,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three';
import { useThree } from '@react-three/fiber';
import { createNoise2D, fbm2 } from '../../lib/noise';
import { createRng } from '../../lib/rng';
import { useQuality } from '../quality';
import type { SurfaceVariant } from '../../lib/scenes';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useAppStore } from '../../state/useAppStore';

const PALETTE: Record<'moon' | 'mars' | 'arctic', [string, string]> = {
  moon: ['#5a5b60', '#a9abb2'],
  mars: ['#6e3520', '#c27a4c'],
  arctic: ['#8f6a52', '#d9c7b8'],
};

function heightFn(variant: SurfaceVariant, seed: number) {
  const n = createNoise2D(seed);
  const r = createRng(seed + 7);
  const craters = Array.from(
    { length: variant === 'lunar' ? 34 : variant === 'crater' ? 6 : 10 },
    () => ({
      x: (r() - 0.5) * 190,
      z: (r() - 0.5) * 190,
      rad: 2 + r() ** 2 * (variant === 'lunar' ? 16 : 9),
    }),
  );
  if (variant === 'crater') craters.push({ x: -40, z: -70, rad: 45 });
  return (x: number, z: number) => {
    let h = fbm2(n, x * 0.012, z * 0.012, 5) * 1.5;
    if (variant === 'hills')
      h += Math.max(0, n(x * 0.008 + 3, z * 0.008)) * 9 * Math.min(1, Math.hypot(x, z) / 40);
    if (variant === 'dunes')
      h +=
        (Math.sin(x * 0.09 + n(x * 0.02, z * 0.02) * 2.5) * 0.5 + 0.5) ** 2 *
        3.2 *
        Math.min(1, Math.hypot(x, z) / 18);
    if (variant === 'arctic') h *= 0.4;
    for (const c of craters) {
      const d = Math.hypot(x - c.x, z - c.z) / c.rad;
      if (d < 1.6)
        h +=
          (d < 1 ? (d * d - 1) * 0.35 : 0) * c.rad * 0.4 +
          Math.exp(-((d - 1) ** 2) * 18) * c.rad * 0.12;
    }
    const center = Math.hypot(x, z);
    const flat = Math.min(1, Math.max(0, (center - 5) / 6));
    return h * flat;
  };
}

/** Diorama de superficie: terreno, rocas, polvo y cielo (Parte 9.9). 1 unidad = 1 m. */
export function SurfaceDiorama({
  world,
  variant,
  dim,
}: {
  world: 'moon' | 'mars';
  variant: SurfaceVariant;
  dim?: () => number;
}) {
  const q = useQuality();
  const reduced = useAppStore((s) => s.reducedMotion);
  const scene = useThree((s) => s.scene);
  const seed = world === 'moon' ? 1969 : variant.length * 31 + 1976;
  const height = useMemo(() => heightFn(variant, seed), [variant, seed]);

  const terrain = useMemo(() => {
    const g = new PlaneGeometry(200, 200, q.terrainSegments, q.terrainSegments);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const pal = PALETTE[variant === 'arctic' ? 'arctic' : world];
    const lo = new Color(pal[0]);
    const hi = new Color(pal[1]);
    const n = createNoise2D(seed + 3);
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = height(x, z);
      pos.setY(i, h);
      let t = 0.5 + n(x * 0.05, z * 0.05) * 0.25 + h * 0.04;
      if (variant === 'arctic') {
        const cell = Math.abs(
          Math.sin(x * 0.45 + n(x * 0.1, z * 0.1)) * Math.sin(z * 0.45 + n(z * 0.1, x * 0.1)),
        );
        t -= cell < 0.08 ? 0.35 : 0;
      }
      c.copy(lo).lerp(hi, Math.min(1, Math.max(0, t)));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [q.terrainSegments, height, world, variant, seed]);

  const terrainMat = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.97, metalness: 0 }),
    [],
  );

  const rocks = useMemo(() => {
    const geo = new IcosahedronGeometry(1, 1);
    const p = geo.attributes.position as BufferAttribute;
    const n = createNoise2D(seed + 9);
    for (let i = 0; i < p.count; i++) {
      const s = 1 + n(p.getX(i) * 1.7, p.getZ(i) * 1.7 + p.getY(i)) * 0.28;
      p.setXYZ(i, p.getX(i) * s, p.getY(i) * s * 0.7, p.getZ(i) * s);
    }
    geo.computeVertexNormals();
    const mat = new MeshStandardMaterial({
      color: world === 'moon' ? '#77787d' : '#7a4630',
      roughness: 0.95,
    });
    const count =
      variant === 'dunes'
        ? Math.round(q.rocks * 0.3)
        : variant === 'rocky'
          ? Math.round(q.rocks * 1.4)
          : q.rocks;
    const mesh = new InstancedMesh(geo, mat, count);
    const r = createRng(seed + 11);
    const m4 = new Matrix4();
    const qn = new Quaternion();
    const v = new Vector3();
    const s = new Vector3();
    for (let i = 0; i < count; i++) {
      let x = (r() - 0.5) * 180;
      let z = (r() - 0.5) * 180;
      while (Math.hypot(x, z) < 5 + r() * 6) {
        x = (r() - 0.5) * 180;
        z = (r() - 0.5) * 180;
      }
      const size = 0.08 + r() ** 4 * (variant === 'rocky' ? 1.4 : 0.9);
      v.set(x, height(x, z) + size * 0.25, z);
      qn.setFromAxisAngle(new Vector3(r(), r(), r()).normalize(), r() * Math.PI);
      s.set(size * (0.8 + r() * 0.5), size, size * (0.8 + r() * 0.5));
      mesh.setMatrixAt(i, m4.compose(v, qn, s));
    }
    mesh.castShadow = q.shadows > 0;
    mesh.receiveShadow = q.shadows > 0;
    return mesh;
  }, [q.rocks, q.shadows, seed, height, world, variant]);

  const dust = useMemo(() => {
    if (q.dust === 0) return null;
    const r = createRng(seed + 21);
    const pos = new Float32Array(q.dust * 3);
    for (let i = 0; i < q.dust; i++)
      pos.set([(r() - 0.5) * 60, r() * (world === 'mars' ? 12 : 1.5), (r() - 0.5) * 60], i * 3);
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3).setUsage(DynamicDrawUsage));
    const m = new PointsMaterial({
      color: world === 'mars' ? '#d9a27c' : '#b9bbc2',
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    return new Points(g, m);
  }, [q.dust, seed, world]);

  const sky = useMemo(
    () =>
      world === 'mars'
        ? new ShaderMaterial({
            uniforms: {
              uTop: { value: new Color('#3b2a24') },
              uHorizon: { value: new Color('#c99f7f') },
              uDark: { value: 0 },
            },
            vertexShader:
              'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
            fragmentShader:
              'uniform vec3 uTop; uniform vec3 uHorizon; uniform float uDark; varying vec3 vP; void main(){ float t = smoothstep(-0.05, 0.6, vP.y); vec3 c = mix(uHorizon, uTop, t); gl_FragColor = vec4(mix(c, c*0.18, uDark), 1.0); }',
            side: BackSide,
            depthWrite: false,
          })
        : null,
    [world],
  );

  const shadowTex = useMemo(() => {
    if (q.shadows > 0 || typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(0,0,0,0.65)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new CanvasTexture(c);
  }, [q.shadows]);

  useEffect(() => {
    if (world !== 'mars') return;
    const prev = scene.fog;
    scene.fog = new FogExp2('#c79f86', variant === 'arctic' ? 0.009 : 0.012);
    return () => {
      scene.fog = prev;
    };
  }, [scene, world, variant]);

  useEffect(
    () => () => {
      terrain.dispose();
      terrainMat.dispose();
      rocks.geometry.dispose();
      rocks.material.dispose();
      rocks.dispose();
      dust?.geometry.dispose();
      dust?.material?.dispose();
      sky?.dispose();
      shadowTex?.dispose();
    },
    [terrain, terrainMat, rocks, dust, sky, shadowTex],
  );

  const dustT = useRef(0);
  const sun = useRef<DirectionalLight>(null);
  useFrame((_, delta) => {
    const js = useJourneyStore.getState();
    if (sun.current)
      sun.current.intensity = (world === 'moon' ? 3.2 : 2.2) * (1 - 0.85 * (dim?.() ?? 0));
    const storm = js.fx.storm ?? 0;
    if (sky) sky.uniforms.uDark!.value = storm * 0.9;
    if (scene.fog instanceof FogExp2)
      scene.fog.density = (variant === 'arctic' ? 0.009 : 0.012) + storm * 0.07;
    if (dust && world === 'mars' && !reduced && !js.paused) {
      dustT.current += delta;
      dust.position.x = Math.sin(dustT.current * 0.05) * 3 + storm * dustT.current * 0.3;
      dust.position.z = Math.cos(dustT.current * 0.04) * 2;
    }
  });

  const sunEl = world === 'moon' ? 12 : 28;
  const sunPos: [number, number, number] = [
    Math.cos((sunEl * Math.PI) / 180) * 60,
    Math.sin((sunEl * Math.PI) / 180) * 60,
    25,
  ];

  return (
    <group>
      {sky && (
        <mesh material={sky} renderOrder={-5}>
          <sphereGeometry args={[400, 32, 16]} />
        </mesh>
      )}
      {world === 'moon' && (
        <mesh position={[-90, 70, -160]}>
          <sphereGeometry args={[5, 32, 16]} />
          <meshBasicMaterial color="#6fa8ff" />
        </mesh>
      )}
      <directionalLight
        ref={sun}
        position={sunPos}
        intensity={world === 'moon' ? 3.2 : 2.2}
        color={world === 'moon' ? '#fff6e8' : '#ffd9b0'}
        castShadow={q.shadows > 0}
        shadow-mapSize={[q.shadows || 512, q.shadows || 512]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-far={140}
        shadow-bias={-0.0004}
      />
      {world === 'moon' ? (
        <ambientLight intensity={0.06} />
      ) : (
        <hemisphereLight args={['#e8b88f', '#3a2016', 0.55]} />
      )}
      <mesh geometry={terrain} material={terrainMat} receiveShadow={q.shadows > 0} />
      <primitive object={rocks} />
      {dust && <primitive object={dust} />}
      {shadowTex && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[6, 6]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
