import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type Texture,
} from 'three';
import { PLANET_FRAG, PLANET_VERT } from '../shaders/planet.glsl';
import { ATMOSPHERE_FRAG, ATMOSPHERE_VERT } from '../shaders/atmosphere.glsl';
import { useQuality } from '../quality';
import { assetExists, publicUrl } from '../../lib/assets';
import { useJourneyStore } from '../../state/useJourneyStore';

const Y_AXIS = new Vector3(0, 1, 0);

export type PlanetKind = 'moon' | 'mars' | 'ceres' | 'vesta' | 'earth' | 'asteroid';
const KIND_INDEX: Record<PlanetKind, number> = {
  moon: 0,
  mars: 1,
  ceres: 2,
  vesta: 3,
  earth: 4,
  asteroid: 5,
};
const TEXTURE: Partial<Record<PlanetKind, string>> = {
  moon: 'textures/moon_color_2k.jpg',
  mars: 'textures/mars_color_2k.jpg',
  earth: 'textures/earth_night_2k.jpg',
};

export interface PlanetProps {
  kind: PlanetKind;
  radius?: number;
  sunDir?: [number, number, number];
  scale?: [number, number, number];
  position?: [number, number, number];
  rotationY?: number;
  spin?: number;
  /** Giro del Sol alrededor del eje del planeta (rad/s): mueve la línea de día y noche. */
  sunSpin?: number;
  atmosphere?: { color: string; intensity: number };
  children?: ReactNode;
}

/** Globo procedural con textura opcional (Parte 9.8). La Luna, Eros, Vesta y Ceres no llevan atmósfera. */
export function Planet({
  kind,
  radius = 5,
  sunDir = [1, 0.3, 0.6],
  scale,
  position,
  rotationY = 0,
  spin = 0,
  sunSpin = 0,
  atmosphere,
  children,
}: PlanetProps) {
  const { sphereSegments, octaves } = useQuality();
  const [map, setMap] = useState<Texture | null>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: PLANET_VERT,
        fragmentShader: PLANET_FRAG,
        uniforms: {
          uKind: { value: KIND_INDEX[kind] },
          uSunDir: { value: new Vector3(...sunDir).normalize() },
          uOctaves: { value: octaves },
          uMap: { value: null },
          uHasMap: { value: 0 },
          uStorm: { value: 0 },
          uTime: { value: 0 },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sunDir y octaves se actualizan abajo sin recrear
    [kind],
  );
  useEffect(() => {
    (material.uniforms.uSunDir!.value as Vector3).set(...sunDir).normalize();
    material.uniforms.uOctaves!.value = octaves;
    // `sunSpin` en las dependencias: al apagar el giro, el Sol vuelve a su sitio.
  }, [material, sunDir, octaves, sunSpin]);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    const path = TEXTURE[kind];
    if (!path) return;
    let alive = true;
    const url = publicUrl(path);
    void assetExists(url).then((ok) => {
      if (!ok || !alive) return;
      new TextureLoader().load(url, (t) => {
        t.colorSpace = SRGBColorSpace;
        if (alive) setMap(t);
      });
    });
    return () => {
      alive = false;
    };
  }, [kind]);
  useEffect(() => {
    material.uniforms.uMap!.value = map;
    material.uniforms.uHasMap!.value = map ? 1 : 0;
    return () => map?.dispose();
  }, [map, material]);

  const atmo = useMemo(
    () =>
      atmosphere
        ? new ShaderMaterial({
            vertexShader: ATMOSPHERE_VERT,
            fragmentShader: ATMOSPHERE_FRAG,
            uniforms: {
              uColor: { value: new Vector3() },
              uPower: { value: 3 },
              uIntensity: { value: atmosphere.intensity },
            },
            transparent: true,
            depthWrite: false,
            blending: AdditiveBlending,
          })
        : null,
    [atmosphere],
  );
  useEffect(() => {
    if (atmo && atmosphere) {
      const c = atmosphere.color.replace('#', '');
      (atmo.uniforms.uColor!.value as Vector3).set(
        parseInt(c.slice(0, 2), 16) / 255,
        parseInt(c.slice(2, 4), 16) / 255,
        parseInt(c.slice(4, 6), 16) / 255,
      );
    }
    return () => atmo?.dispose();
  }, [atmo, atmosphere]);

  useFrame((state, delta) => {
    const paused = useJourneyStore.getState().paused;
    if (kind === 'mars') material.uniforms.uStorm!.value = useJourneyStore.getState().fx.storm ?? 0;
    if (spin && !paused) material.uniforms.uTime!.value += delta * spin;
    if (sunSpin && !paused) {
      (material.uniforms.uSunDir!.value as Vector3).applyAxisAngle(Y_AXIS, delta * sunSpin);
      state.invalidate();
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh material={material}>
        <sphereGeometry args={[radius, sphereSegments, Math.round(sphereSegments / 2)]} />
      </mesh>
      {atmo && (
        <mesh material={atmo} scale={1.025}>
          <sphereGeometry args={[radius, 64, 32]} />
        </mesh>
      )}
      {children}
    </group>
  );
}
