import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  Color,
  Quaternion,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
} from 'three';
import { latLonToVector3 } from '../../lib/coords';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';

export interface GhostMarkerProps {
  lat: number;
  lon: number;
  radius?: number;
  active?: boolean;
  dim?: boolean;
  color?: string;
  onSelect?: () => void;
}

const UP = new Vector3(0, 1, 0);

/** Pin holográfico con haz de luz vertical sobre un globo (Parte 7.7). */
export function GhostMarker({
  lat,
  lon,
  radius = 5,
  active,
  dim,
  color = '#5ef2ff',
  onSelect,
}: GhostMarkerProps) {
  const reduced = useAppStore((s) => s.reducedMotion);
  const g = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const { position, quaternion } = useMemo(() => {
    const p = latLonToVector3(lat, lon, radius * 1.002);
    const q = new Quaternion().setFromUnitVectors(UP, p.clone().normalize());
    return { position: p, quaternion: q };
  }, [lat, lon, radius]);
  const col = useMemo(() => new Color(color), [color]);
  const h = active ? 1.6 : 0.8;

  useFrame((state) => {
    if (!ring.current) return;
    const paused = useJourneyStore.getState().paused;
    const t = reduced || paused ? 0.5 : (state.clock.elapsedTime * (active ? 1.2 : 0.6)) % 1;
    ring.current.scale.setScalar(0.6 + t * 1.6);
    (ring.current.material as MeshBasicMaterial).opacity = (1 - t) * (dim ? 0.25 : 0.8);
  });

  const opacity = dim ? 0.25 : 1;
  return (
    <group ref={g} position={position} quaternion={quaternion}>
      {onSelect && (
        <mesh
          position={[0, h * 0.55, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = '';
          }}
        >
          <sphereGeometry args={[Math.max(0.42, h * 0.6), 10, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.03, h, 8, 1, true]} />
        <meshBasicMaterial
          color={col}
          transparent
          opacity={0.55 * opacity}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, h, 0]}>
        <sphereGeometry args={[active ? 0.09 : 0.06, 12, 8]} />
        <meshBasicMaterial color={col} transparent opacity={opacity} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.12, 0.16, 32]} />
        <meshBasicMaterial
          color={col}
          transparent
          opacity={0.6}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
