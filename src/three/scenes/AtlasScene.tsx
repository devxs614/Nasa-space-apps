import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Planet } from '../worlds/Planet';
import { GhostMarker } from '../markers/GhostMarker';
import { sitesOn } from '../../data/sites';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useAppStore } from '../../state/useAppStore';
import { latLonToVector3 } from '../../lib/coords';
import { SITE_BY_ID } from '../../data/sites';

/** Atlas interactivo: globo grande con OrbitControls (Parte 8.9). La lista del DOM es la alternativa accesible. */
export function AtlasScene({ body }: { body: 'moon' | 'mars' }) {
  const sites = useMemo(() => sitesOn(body), [body]);
  const selected = useJourneyStore((s) => s.atlasSiteId);
  const setSite = useJourneyStore((s) => s.setAtlasSite);
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const flyTo = useRef<Vector3 | null>(null);

  useEffect(() => {
    camera.position.set(body === 'moon' ? 14 : 0, 3, body === 'moon' ? 0 : 14);
    camera.lookAt(0, 0, 0);
  }, [camera, body]);

  useEffect(() => {
    const s = selected ? SITE_BY_ID.get(selected) : null;
    if (!s) return;
    const dist = camera.position.length();
    flyTo.current = latLonToVector3(s.lat, s.lon, 1)
      .normalize()
      .multiplyScalar(Math.max(8.5, Math.min(dist, 12)));
  }, [selected, camera]);

  useFrame((state, delta) => {
    const target = flyTo.current;
    if (!target) return;
    const reduced = useAppStore.getState().reducedMotion;
    if (reduced) camera.position.copy(target);
    else camera.position.lerp(target, 1 - Math.exp(-delta * 3));
    camera.lookAt(0, 0, 0);
    controls.current?.update();
    if (camera.position.distanceTo(target) < 0.01) flyTo.current = null;
    state.invalidate();
  });

  return (
    <group>
      <directionalLight position={[40, 10, 20]} intensity={1} />
      <Planet
        kind={body}
        sunDir={[1, 0.3, 0.5]}
        atmosphere={body === 'mars' ? { color: '#e8a27c', intensity: 0.6 } : undefined}
      >
        {sites.map((s) => (
          <GhostMarker
            key={s.id}
            lat={s.lat}
            lon={s.lon}
            active={s.id === selected}
            color={
              s.kind === 'retroreflector' ? '#7cffb2' : s.kind === 'impact' ? '#ffb547' : '#5ef2ff'
            }
            onSelect={() => setSite(s.id)}
          />
        ))}
      </Planet>
      <OrbitControls
        ref={controls}
        enablePan={false}
        enableDamping
        minDistance={8}
        maxDistance={20}
        makeDefault
      />
    </group>
  );
}
