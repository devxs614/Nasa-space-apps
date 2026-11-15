import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  IcosahedronGeometry,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  Vector3,
  type Group,
} from 'three';
import { Planet } from '../worlds/Planet';
import { MachineModel } from '../machines/MachineModel';
import { SignalPulse } from '../effects/SignalPulse';
import { Trajectory } from '../effects/Trajectory';
import { createNoise2D } from '../../lib/noise';
import { createRng } from '../../lib/rng';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useAppStore } from '../../state/useAppStore';
import { useQuality } from '../quality';
import { revealTarget, smooth } from './useReveal';
import { CERES_POS, KEPLER_ORBIT_R, VESTA_POS, logR } from '../layout';
import { dawnPosition, keplerAngles, pioneerPosition } from '../cameraShots';

/** 433 Eros: eje mayor de 10 unidades, con la silla Himeros arriba (Parte 9.3). Nave a escala exagerada. */
export function ErosScene() {
  const beat = useJourneyStore((s) => (s.chapterId === 'near' ? s.beat : null));
  const craft = useRef<Group>(null);
  const geo = useMemo(() => {
    const g = new IcosahedronGeometry(1, 5);
    const p = g.attributes.position as BufferAttribute;
    const n = createNoise2D(433);
    const v = new Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const bump = 1 + n(v.x * 2.2 + v.z, v.y * 2.2) * 0.12 + n(v.x * 6, v.y * 6 + v.z) * 0.04;
      const saddle = Math.exp(-((v.x * 1.4) ** 2)) * Math.max(0, v.y) * 0.25;
      p.setXYZ(i, v.x * 5 * bump, (v.y * 1.65 - saddle) * bump, v.z * 1.65 * bump);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(
    () => new MeshStandardMaterial({ color: '#8a7460', roughness: 0.95, flatShading: true }),
    [],
  );
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  useFrame((state) => {
    const js = useJourneyStore.getState();
    const reduced = useAppStore.getState().reducedMotion;
    if (!craft.current) return;
    const p = js.chapterId === 'near' ? js.beatProgress : 0;
    if (js.beat === 'work' && js.chapterId === 'near') {
      const k = smooth(0.05, 0.9, Math.max(p, js.fx.dig ?? 0));
      craft.current.position.set(6 * (1 - k) + 0.2 * k, 3.2 + (1 - k) * 3, 0);
    } else if (js.beat === 'lastSignal' || js.beat === 'legacy') {
      craft.current.position.set(0.2, 1.6, 0);
    } else {
      const a = reduced || js.paused ? 0.6 : state.clock.elapsedTime * 0.15;
      craft.current.position.set(Math.cos(a) * 6, 2.4, Math.sin(a) * 6);
    }
  });
  return (
    <group>
      <directionalLight position={[30, 20, 15]} intensity={2.6} />
      <ambientLight intensity={0.05} />
      <mesh geometry={geo} material={mat} rotation={[0, 0, 0.1]} />
      <group ref={craft}>
        <MachineModel
          id="near"
          reveal={() => revealTarget('near')}
          scale={0.5}
          highlightKey={beat === 'identity'}
        />
      </group>
      {beat === 'wake' && (
        <SignalPulse
          from={new Vector3(-60, 30, 60)}
          to={new Vector3(6, 2.4, 0)}
          lift={8}
          radius={0.08}
        />
      )}
      {beat === 'journey' && (
        <Trajectory
          from={new Vector3(-40, 4, 40)}
          to={new Vector3(0, 2, 8)}
          lift={-6}
          dashed
          progress={() => useJourneyStore.getState().beatProgress}
        />
      )}
    </group>
  );
}

/** Ion trail: partículas azules detrás del motor (Parte 9.3). */
function IonTrail({ follow }: { follow: () => Vector3 }) {
  const { dust } = useQuality();
  const n = Math.max(200, Math.min(1200, dust / 2));
  const pts = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3));
    return new Points(
      g,
      new PointsMaterial({
        color: '#7fb7ff',
        size: 0.09,
        transparent: true,
        opacity: 0.7,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
  }, [n]);
  const r = useMemo(() => createRng(2007), []);
  const ages = useMemo(() => Float32Array.from({ length: n }, () => r() * 3), [n, r]);
  useEffect(
    () => () => {
      pts.geometry.dispose();
      pts.material.dispose();
    },
    [pts],
  );
  useFrame((_, delta) => {
    const js = useJourneyStore.getState();
    if (js.paused) return;
    const src = follow();
    const pos = pts.geometry.attributes.position as BufferAttribute;
    const ion = js.fx.ion ?? 1;
    for (let i = 0; i < n; i++) {
      ages[i] = (ages[i] ?? 0) + delta;
      if ((ages[i] ?? 0) > 3) ages[i] = 0;
      const a = ages[i] ?? 0;
      pos.setXYZ(
        i,
        src.x + (r() - 0.5) * 0.05 * a,
        src.y - 0.4 - a * 2.4 * ion,
        src.z + (r() - 0.5) * 0.05 * a,
      );
    }
    pos.needsUpdate = true;
  });
  return <primitive object={pts} />;
}

export function VestaCeresScene() {
  const beat = useJourneyStore((s) => (s.chapterId === 'dawn' ? s.beat : null));
  const craft = useRef<Group>(null);
  const tmp = useMemo(() => new Vector3(), []);
  useFrame(() => {
    const js = useJourneyStore.getState();
    if (!craft.current) return;
    dawnPosition(js.chapterId === 'dawn' ? js.beat : 'identity', js.beatProgress, tmp);
    craft.current.position.copy(tmp);
  });
  return (
    <group>
      <directionalLight position={[-60, 10, 30]} intensity={1.4} />
      <ambientLight intensity={0.04} />
      <Planet
        kind="vesta"
        radius={3}
        position={[VESTA_POS.x, VESTA_POS.y, VESTA_POS.z]}
        scale={[1, 0.82, 1]}
        sunDir={[-1, 0.2, 0.5]}
      />
      <Planet
        kind="ceres"
        radius={4}
        position={[CERES_POS.x, CERES_POS.y, CERES_POS.z]}
        sunDir={[-1, 0.2, 0.5]}
        rotationY={-1.1}
      />
      <group ref={craft}>
        <MachineModel
          id="dawn"
          reveal={() => revealTarget('dawn')}
          scale={0.22}
          highlightKey={beat === 'identity'}
          rotation={[0.3, 0.5, 0]}
        />
      </group>
      <IonTrail follow={() => craft.current?.position ?? tmp} />
      {beat === 'wake' && (
        <SignalPulse
          from={new Vector3(-70, 20, 50)}
          to={dawnPosition('wake', 0)}
          lift={6}
          radius={0.06}
        />
      )}
    </group>
  );
}

export function KeplerScene() {
  const beat = useJourneyStore((s) => (s.chapterId === 'kepler' ? s.beat : null));
  const earth = useRef<Group>(null);
  const craft = useRef<Group>(null);
  const ringGeo = useMemo(() => {
    const pts = Array.from(
      { length: 129 },
      (_, i) =>
        new Vector3(
          Math.cos((i / 128) * Math.PI * 2) * KEPLER_ORBIT_R,
          0,
          -Math.sin((i / 128) * Math.PI * 2) * KEPLER_ORBIT_R,
        ),
    );
    return new BufferGeometry().setFromPoints(pts);
  }, []);
  useEffect(() => () => ringGeo.dispose(), [ringGeo]);
  useFrame(() => {
    const js = useJourneyStore.getState();
    const { earth: e, kepler: k } = keplerAngles(
      js.chapterId === 'kepler' ? js.beat : null,
      js.beatProgress,
    );
    earth.current?.position.set(Math.cos(e) * KEPLER_ORBIT_R, 0, -Math.sin(e) * KEPLER_ORBIT_R);
    craft.current?.position.set(
      Math.cos(k) * (KEPLER_ORBIT_R + 0.4),
      0,
      -Math.sin(k) * (KEPLER_ORBIT_R + 0.4),
    );
  });
  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={140} decay={2} color="#fff1d6" />
      <ambientLight intensity={0.06} />
      <mesh>
        <sphereGeometry args={[1.2, 32, 16]} />
        <meshBasicMaterial color="#ffd27a" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.8, 32, 16]} />
        <meshBasicMaterial
          color="#ffb547"
          transparent
          opacity={0.18}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <lineLoop geometry={ringGeo}>
        <lineBasicMaterial color="#6fb6ff" transparent opacity={0.4} />
      </lineLoop>
      <group ref={earth}>
        <Planet
          kind="earth"
          radius={0.5}
          sunDir={[-1, 0, 0]}
          atmosphere={{ color: '#6fb6ff', intensity: 1.2 }}
        />
      </group>
      <group ref={craft}>
        <MachineModel
          id="kepler"
          reveal={() => revealTarget('kepler')}
          scale={0.12}
          highlightKey={beat === 'identity'}
          rotation={[-1.1, 0, 0.2]}
        />
        {(beat === 'arrival' || beat === 'work') && (
          <mesh position={[0.3, 3.5, -1.4]} rotation={[-0.4, 0, 0]}>
            <coneGeometry args={[1.6, 6, 32, 1, true]} />
            <meshBasicMaterial
              color="#a99bff"
              transparent
              opacity={0.08}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

export function OuterSystemScene() {
  const beat = useJourneyStore((s) => (s.chapterId === 'pioneer' ? s.beat : null));
  const rings = useMemo(
    () =>
      [0.39, 0.72, 1, 1.52, 5.2, 9.5, 19.2, 30.1].map((au) => {
        const r = logR(au);
        return new BufferGeometry().setFromPoints(
          Array.from(
            { length: 129 },
            (_, i) =>
              new Vector3(
                Math.cos((i / 128) * Math.PI * 2) * r,
                0,
                Math.sin((i / 128) * Math.PI * 2) * r,
              ),
          ),
        );
      }),
    [],
  );
  const scaleRings = useMemo(
    () =>
      [1, 10, 100].map((au) =>
        new BufferGeometry().setFromPoints(
          Array.from(
            { length: 129 },
            (_, i) =>
              new Vector3(
                Math.cos((i / 128) * Math.PI * 2) * logR(au),
                0,
                Math.sin((i / 128) * Math.PI * 2) * logR(au),
              ),
          ),
        ),
      ),
    [],
  );
  useEffect(() => () => [...rings, ...scaleRings].forEach((g) => g.dispose()), [rings, scaleRings]);
  const p10 = useMemo(() => pioneerPosition('pioneer10'), []);
  const p11 = useMemo(() => pioneerPosition('pioneer11'), []);
  const sun = useMemo(() => new Vector3(0, 0, 0), []);
  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={80} decay={2} />
      <ambientLight intensity={0.15} />
      <mesh>
        <sphereGeometry args={[0.35, 24, 12]} />
        <meshBasicMaterial color="#ffd27a" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.9, 24, 12]} />
        <meshBasicMaterial
          color="#ffb547"
          transparent
          opacity={0.2}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {rings.map((g, i) => (
        <lineLoop key={i} geometry={g}>
          <lineBasicMaterial color="#a99bff" transparent opacity={0.28} />
        </lineLoop>
      ))}
      {scaleRings.map((g, i) => (
        <lineLoop key={`s${i}`} geometry={g}>
          <lineDashedMaterial
            color="#5ef2ff"
            transparent
            opacity={0.35}
            dashSize={0.2}
            gapSize={0.2}
          />
        </lineLoop>
      ))}
      <mesh>
        <sphereGeometry args={[logR(120), 48, 24]} />
        <meshBasicMaterial
          color={new Color('#8a7cff')}
          transparent
          opacity={0.035}
          depthWrite={false}
        />
      </mesh>
      <Trajectory from={sun} to={p10} lift={0.6} progress={() => 1} color="#e8eef7" />
      <Trajectory from={sun} to={p11} lift={0.9} progress={() => 1} color="#e8eef7" />
      <group position={p10}>
        <MachineModel
          id="pioneer"
          reveal={() => revealTarget('pioneer')}
          scale={0.18}
          highlightKey={beat === 'identity'}
          rotation={[0.4, 0, 0.3]}
        />
      </group>
      <group position={p11}>
        <MachineModel id="pioneer" reveal={() => 1} holoOnly scale={0.14} />
      </group>
      {beat === 'wake' && (
        <SignalPulse from={new Vector3(logR(1), 0, 0)} to={p10} lift={1.5} radius={0.05} />
      )}
    </group>
  );
}
