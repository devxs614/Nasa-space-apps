import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Color, type Group, type Mesh, type MeshBasicMaterial } from 'three';
import type { MachineId } from '../../data/types';
import { SurfaceDiorama } from '../surface/SurfaceDiorama';
import { MachineModel } from '../machines/MachineModel';
import { ApolloAscentModel } from '../machines/models/moon';
import { PathfinderLander } from '../machines/models/mars';
import { PerseveranceSilhouette } from '../machines/models/mars2';
import { ModeContext } from '../machines/parts/mat';
import { surfaceVariant } from '../../lib/scenes';
import { useJourneyStore } from '../../state/useJourneyStore';
import { descentOffset } from '../cameraShots';
import { DUST_COLORS } from '../materials';
import { dustAmount, lastSignalDim, revealTarget, smooth } from './useReveal';
import { SignalPulse } from '../effects/SignalPulse';
import { FRAME } from '../layout';
import { Vector3 } from 'three';

const AIRBAG = new Set<MachineId>(['sojourner', 'spirit', 'opportunity']);
const THRUST = new Set<MachineId>(['surveyor', 'apollo-lm', 'viking', 'phoenix', 'insight']);

/** Diorama de superficie con la máquina en el origen (Partes 8.5 y 9.9). */
export function SurfaceScene({ world }: { world: 'moon' | 'mars' }) {
  const chapterId = useJourneyStore((s) => s.chapterId);
  const beat = useJourneyStore((s) => s.beat);
  const id: MachineId = chapterId ?? (world === 'moon' ? 'surveyor' : 'viking');
  const variant = surfaceVariant(id);
  const holder = useRef<Group>(null);
  const bag = useRef<Group>(null);
  const flame = useRef<Mesh>(null);
  const ascent = useRef<Group>(null);
  const F = FRAME[id];
  const pulseFrom = useMemo(() => new Vector3(-40, 60, -80), []);
  const pulseTo = useMemo(() => new Vector3(0, F * 0.6, 0), [F]);

  useFrame((state) => {
    const js = useJourneyStore.getState();
    const p = js.chapterId === id && js.beat === 'arrival' ? js.beatProgress : 1;
    const arriving = js.chapterId === id && js.beat === 'arrival';
    if (holder.current) {
      let y =
        arriving && !AIRBAG.has(id) && id !== 'lrv' && id !== 'alsep' ? descentOffset(id, p) : 0;
      if (id === 'ingenuity') {
        const fly = js.fx.fly ?? 0;
        y = arriving
          ? smooth(0.35, 0.7, p) * 3 * (1 - smooth(0.85, 1, p))
          : fly > 0.5
            ? 1.2 + Math.sin(state.clock.elapsedTime) * 0.1
            : 0;
      }
      holder.current.position.y = y;
      holder.current.visible = !(arriving && AIRBAG.has(id) && p < 0.72);
    }
    if (bag.current) {
      const show = arriving && AIRBAG.has(id) && p < 0.72;
      bag.current.visible = show;
      if (show) {
        const k = p / 0.72;
        const bounce = Math.abs(Math.sin(k * Math.PI * 5)) * (1 - k) * 6;
        bag.current.position.set((1 - k) * -10, 0.7 + bounce, (1 - k) * 6);
        bag.current.rotation.set(k * 8, k * 5, 0);
      }
    }
    if (flame.current) {
      const on = arriving && THRUST.has(id) && p < 0.86;
      flame.current.visible = on;
      (flame.current.material as MeshBasicMaterial).opacity = on
        ? 0.5 + 0.3 * Math.sin(state.clock.elapsedTime * 30)
        : 0;
    }
    if (ascent.current) {
      const lift =
        js.chapterId === 'apollo-lm'
          ? js.beat === 'lastSignal'
            ? smooth(0.1, 0.8, js.beatProgress)
            : (js.fx.liftoff ?? 0)
          : 0;
      ascent.current.position.y = 3.2 + lift * 40;
      ascent.current.visible =
        lift < 0.98 && (js.beat === 'work' || js.beat === 'lastSignal' || js.beat === 'identity');
    }
  });

  const brokenIngenuity = id === 'ingenuity' && beat === 'lastSignal';
  const collapsedPhoenix = id === 'phoenix' && beat === 'lastSignal';

  return (
    <group>
      <SurfaceDiorama world={world} variant={variant} dim={() => lastSignalDim(id)} />
      <group ref={holder}>
        <MachineModel
          key={id}
          id={id}
          reveal={() => revealTarget(id)}
          dust={() => dustAmount(id)}
          dustColor={
            id === 'phoenix'
              ? DUST_COLORS.frost
              : world === 'moon'
                ? DUST_COLORS.moon
                : DUST_COLORS.mars
          }
          highlightKey={beat === 'identity'}
          turntable={beat === 'identity'}
          flags={
            brokenIngenuity || collapsedPhoenix
              ? { broken: brokenIngenuity, collapsed: collapsedPhoenix }
              : undefined
          }
        />
        <mesh ref={flame} position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]} visible={false}>
          <coneGeometry args={[F * 0.08, F * 0.35, 12, 1, true]} />
          <meshBasicMaterial
            color="#ffd28a"
            transparent
            opacity={0}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
      <group ref={bag} visible={false}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.55, Math.sin(a * 2) * 0.35, Math.sin(a) * 0.55]}
            >
              <sphereGeometry args={[0.45, 14, 10]} />
              <meshStandardMaterial color={new Color('#e8e4da')} roughness={0.7} />
            </mesh>
          );
        })}
      </group>
      {id === 'apollo-lm' && (
        <group ref={ascent} position={[0, 3.2, 0]}>
          <ModeContext.Provider value="holoFree">
            <ApolloAscentModel />
          </ModeContext.Provider>
        </group>
      )}
      {id === 'sojourner' && (
        <group position={[-1.6, 0, -1.4]}>
          <ModeContext.Provider value="real">
            <PathfinderLander />
          </ModeContext.Provider>
        </group>
      )}
      {id === 'ingenuity' && (
        <group position={[7, 0, -9]} rotation={[0, -0.6, 0]}>
          <ModeContext.Provider value="holoFree">
            <PerseveranceSilhouette />
          </ModeContext.Provider>
        </group>
      )}
      {brokenIngenuity && (
        <mesh position={[-15, 0.02, 0.5]} rotation={[0, 0.4, 0.05]}>
          <boxGeometry args={[0.6, 0.012, 0.08]} />
          <meshStandardMaterial color="#1c1c1f" roughness={0.35} />
        </mesh>
      )}
      <SignalPulse from={pulseFrom} to={pulseTo} lift={10} radius={0.08} />
    </group>
  );
}
