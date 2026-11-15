import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3, type PerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Planet } from '../worlds/Planet';
import { GhostMarker } from '../markers/GhostMarker';
import { SITE_BY_ID, sitesOn } from '../../data/sites';
import type { SiteKind } from '../../data/types';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useAppStore } from '../../state/useAppStore';
import { latLonToVector3 } from '../../lib/coords';
import { GLOBE_R } from '../layout';

/** Entre 1,6 y 4 radios del globo (Parte 8.9). */
const MIN_DIST = GLOBE_R * 1.6;
const MAX_DIST = GLOBE_R * 4;
const HOME_DIST = 14;
/** Ancho del panel lateral del DOM en escritorio: el globo se centra en el espacio que queda. */
const PANEL_W = 420;

export const ATLAS_COLORS: Record<SiteKind, string> = {
  lander: '#5ef2ff',
  'rover-end': '#5ef2ff',
  instrument: '#5ef2ff',
  retroreflector: '#7cffb2',
  impact: '#ffb547',
};

const MARS_ATMOSPHERE = { color: '#e8a27c', intensity: 0.6 };
const SUN: [number, number, number] = [1, 0.3, 0.5];
const SUN_OPPOSITE: [number, number, number] = [-1, 0.3, -0.5];

/** Atlas interactivo: globo grande con OrbitControls (Parte 8.9). La lista del DOM es la alternativa accesible. */
export function AtlasScene({ body }: { body: 'moon' | 'mars' }) {
  const hidden = useJourneyStore((s) => s.atlasHidden);
  const selected = useJourneyStore((s) => s.atlasSiteId);
  const dayNight = useJourneyStore((s) => s.atlasDayNight);
  const command = useJourneyStore((s) => s.atlasCommand);
  const setSite = useJourneyStore((s) => s.setAtlasSite);
  const reduced = useAppStore((s) => s.reducedMotion);
  const sites = useMemo(
    () => sitesOn(body).filter((s) => !hidden.includes(s.kind)),
    [body, hidden],
  );
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const flyTo = useRef<Vector3 | null>(null);
  const home = useMemo(
    () => (body === 'moon' ? new Vector3(HOME_DIST, 3, 0) : new Vector3(0, 3, HOME_DIST)),
    [body],
  );

  useEffect(() => {
    camera.position.copy(home);
    camera.lookAt(0, 0, 0);
    return () => {
      document.body.style.cursor = '';
    };
  }, [camera, home]);

  // En escritorio, el panel de sitios ocupa la derecha: se desplaza la proyección para centrar el globo.
  useEffect(() => {
    const shift = size.width >= 1024 ? PANEL_W / 2 : 0;
    if (shift) camera.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);
    else camera.clearViewOffset();
    invalidate();
    return () => camera.clearViewOffset();
  }, [camera, size.width, size.height, invalidate]);

  useEffect(() => {
    const s = selected ? SITE_BY_ID.get(selected) : null;
    if (!s) return;
    const dist = camera.position.length();
    flyTo.current = latLonToVector3(s.lat, s.lon, 1)
      .normalize()
      .multiplyScalar(Math.max(MIN_DIST + 0.5, Math.min(dist, 12)));
    invalidate();
  }, [selected, camera, invalidate]);

  // Botones equivalentes al arrastre y al pellizco (WCAG 2.5.1 y 2.5.7).
  useEffect(() => {
    if (!command) return;
    const dist = camera.position.length();
    const dir = camera.position.clone().normalize();
    switch (command.type) {
      case 'near-side':
        // El punto bajo la Tierra es latitud 0°, longitud 0°.
        flyTo.current = latLonToVector3(0, 0, HOME_DIST);
        break;
      case 'reset':
        flyTo.current = home.clone();
        break;
      case 'zoom-in':
        flyTo.current = dir.multiplyScalar(Math.max(MIN_DIST, dist * 0.8));
        break;
      case 'zoom-out':
        flyTo.current = dir.multiplyScalar(Math.min(MAX_DIST, dist * 1.25));
        break;
    }
    invalidate();
  }, [command, camera, home, invalidate]);

  useFrame((state, delta) => {
    const target = flyTo.current;
    if (!target) return;
    if (useAppStore.getState().reducedMotion) camera.position.copy(target);
    else {
      // Interpola el ángulo y la distancia por separado para no atravesar el globo.
      const k = 1 - Math.exp(-Math.min(delta, 0.1) * 3.5);
      const from = camera.position.length();
      const to = target.length();
      camera.position.lerp(target, k).setLength(from + (to - from) * k);
    }
    camera.lookAt(0, 0, 0);
    controls.current?.update();
    if (camera.position.distanceTo(target) < 0.02) flyTo.current = null;
    state.invalidate();
  });

  const pick = (id: string, lat: number, lon: number) => {
    // Las balizas del lado oculto no se pueden pulsar a través del globo.
    const dir = latLonToVector3(lat, lon, 1);
    const cam = camera.position;
    if (dir.dot(cam.clone().normalize()) < GLOBE_R / cam.length()) return;
    setSite(id);
  };

  const spinSun = body === 'mars' && dayNight;
  return (
    <group>
      <directionalLight position={[40, 10, 20]} intensity={1} />
      <Planet
        kind={body}
        sunDir={spinSun && reduced ? SUN_OPPOSITE : SUN}
        sunSpin={spinSun && !reduced ? 0.5 : 0}
        atmosphere={body === 'mars' ? MARS_ATMOSPHERE : undefined}
      >
        {sites.map((s) => (
          <GhostMarker
            key={s.id}
            lat={s.lat}
            lon={s.lon}
            active={s.id === selected}
            color={ATLAS_COLORS[s.kind]}
            onSelect={() => pick(s.id, s.lat, s.lon)}
          />
        ))}
      </Planet>
      <OrbitControls
        ref={controls}
        enablePan={false}
        enableDamping
        minDistance={MIN_DIST}
        maxDistance={MAX_DIST}
        onStart={() => {
          flyTo.current = null;
        }}
        makeDefault
      />
    </group>
  );
}
