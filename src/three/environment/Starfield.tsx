import { useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from 'three';
import { STARFIELD_FRAG, STARFIELD_VERT } from '../shaders/starfield.glsl';
import { createRng } from '../../lib/rng';
import { useQuality } from '../quality';
import { useAppStore } from '../../state/useAppStore';
import { assetExists, publicUrl } from '../../lib/assets';

function tempColor(t: number): [number, number, number] {
  // de azul blanquecino (t=0) a ámbar (t=1)
  return [0.78 + 0.22 * t, 0.86 - 0.06 * t, 1 - 0.42 * t];
}

/** Campo de estrellas generado una vez con semilla (Parte 9.5). */
export function Starfield() {
  const { stars } = useQuality();
  const reduced = useAppStore((s) => s.reducedMotion);
  const dpr = useThree((s) => s.viewport.dpr);
  const [milky, setMilky] = useState<Texture | null>(null);

  const geometry = useMemo(() => {
    const r = createRng(1966);
    const pos = new Float32Array(stars * 3);
    const size = new Float32Array(stars);
    const phase = new Float32Array(stars);
    const color = new Float32Array(stars * 3);
    for (let i = 0; i < stars; i++) {
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const R = 1500;
      pos.set([R * s * Math.cos(th), R * u, R * s * Math.sin(th)], i * 3);
      size[i] = 1.2 + 5.5 * r() ** 6;
      phase[i] = r();
      color.set(tempColor(r() ** 2), i * 3);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aSize', new BufferAttribute(size, 1));
    g.setAttribute('aPhase', new BufferAttribute(phase, 1));
    g.setAttribute('aColor', new BufferAttribute(color, 3));
    return g;
  }, [stars]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: STARFIELD_VERT,
        fragmentShader: STARFIELD_FRAG,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    let alive = true;
    const url = publicUrl('textures/starmap_4k.jpg');
    void assetExists(url).then((ok) => {
      if (!ok || !alive) return;
      new TextureLoader().load(url, (t) => {
        t.colorSpace = SRGBColorSpace;
        if (alive) setMilky(t);
      });
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => () => milky?.dispose(), [milky]);

  useFrame((state) => {
    material.uniforms.uPixelRatio!.value = dpr;
    if (!reduced) material.uniforms.uTime!.value = state.clock.elapsedTime;
  });

  return (
    <group>
      <points geometry={geometry} material={material} frustumCulled={false} renderOrder={-10} />
      {milky && (
        <mesh renderOrder={-11}>
          <sphereGeometry args={[2000, 48, 24]} />
          <meshBasicMaterial
            map={milky}
            side={BackSide}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
