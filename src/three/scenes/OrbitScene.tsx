import { useMemo } from 'react';
import { Vector3 } from 'three';
import { Planet } from '../worlds/Planet';
import { GhostMarker } from '../markers/GhostMarker';
import { SignalPulse } from '../effects/SignalPulse';
import { Trajectory } from '../effects/Trajectory';
import { sitesOn } from '../../data/sites';
import { useJourneyStore } from '../../state/useJourneyStore';
import { GLOBE_R, earthDirection, nextOnSameWorld, siteDirection } from '../layout';
import { MACHINE_IDS } from '../../data/ids';
import { MACHINES_BY_ID } from '../../data/machines';

/** Globo de la Luna o de Marte con marcadores fantasma, arco de viaje y pulso de señal. */
export function OrbitScene({ body }: { body: 'moon' | 'mars' }) {
  const chapterId = useJourneyStore((s) => s.chapterId);
  const beat = useJourneyStore((s) => s.beat);
  const section = useJourneyStore((s) => s.section);
  const sectionStep = useJourneyStore((s) => (s.section ? Math.floor(s.sectionProgress * 10) : 0));
  const sites = useMemo(() => sitesOn(body), [body]);
  const next = chapterId ? nextOnSameWorld(chapterId) : null;
  const dir = useMemo(
    () => (chapterId ? siteDirection(chapterId) : new Vector3(1, 0, 0)),
    [chapterId],
  );
  const target = useMemo(() => dir.clone().multiplyScalar(GLOBE_R * 1.02), [dir]);
  const earth = useMemo(() => earthDirection(dir).multiplyScalar(45), [dir]);
  const sunDir: [number, number, number] = body === 'moon' ? [1, 0.25, 0.45] : [0.7, 0.3, 0.8];
  const worldMachines = MACHINE_IDS.filter((id) => MACHINES_BY_ID[id].world === body);

  return (
    <group>
      <directionalLight position={[sunDir[0] * 50, sunDir[1] * 50, sunDir[2] * 50]} intensity={1} />
      <Planet
        kind={body}
        sunDir={sunDir}
        atmosphere={body === 'mars' ? { color: '#e8a27c', intensity: 0.6 } : undefined}
      >
        {sites.map((s) => {
          const mine = s.machineId === chapterId;
          const isNext = next !== null && s.machineId === next && beat === 'legacy';
          // Portada de acto: los marcadores se encienden uno a uno.
          const order = s.machineId ? worldMachines.indexOf(s.machineId) : 99;
          const lit = section ? order < sectionStep : true;
          if (!lit) return null;
          return (
            <GhostMarker
              key={s.id}
              lat={s.lat}
              lon={s.lon}
              active={mine || isNext}
              dim={Boolean(chapterId) && !mine && !isNext}
              color={isNext ? '#ffb547' : '#5ef2ff'}
            />
          );
        })}
      </Planet>
      {chapterId && beat === 'journey' && (
        <Trajectory
          from={earth}
          to={target}
          lift={8}
          progress={() => useJourneyStore.getState().beatProgress}
        />
      )}
      {chapterId && (beat === 'wake' || beat === 'journey') && (
        <SignalPulse from={earth} to={target} lift={6} radius={0.05} />
      )}
    </group>
  );
}
