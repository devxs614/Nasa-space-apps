import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineDashedMaterial,
  QuadraticBezierCurve3,
  Vector3,
  Line,
} from 'three';

export interface TrajectoryProps {
  from: Vector3;
  to: Vector3;
  lift?: number;
  /** 0..1: fracción dibujada (scrub del momento "El viaje"). */
  progress: () => number;
  color?: string;
  dashed?: boolean;
}

/** Arco de trayectoria que se dibuja con el scroll (Parte 8.2, momento 3). */
export function Trajectory({
  from,
  to,
  lift = 6,
  progress,
  color = '#a8d8ff',
  dashed,
}: TrajectoryProps) {
  const line = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    mid.add(new Vector3(0, lift, 0));
    const pts = new QuadraticBezierCurve3(from, mid, to).getPoints(160);
    const g = new BufferGeometry().setFromPoints(pts);
    const m = dashed
      ? new LineDashedMaterial({
          color: new Color(color),
          dashSize: 0.3,
          gapSize: 0.25,
          transparent: true,
          opacity: 0.8,
        })
      : new LineBasicMaterial({
          color: new Color(color),
          transparent: true,
          opacity: 0.9,
          blending: AdditiveBlending,
          depthWrite: false,
        });
    const l = new Line(g, m);
    if (dashed) l.computeLineDistances();
    return l;
  }, [from, to, lift, color, dashed]);
  useEffect(
    () => () => {
      line.geometry.dispose();
      line.material.dispose();
    },
    [line],
  );
  useFrame(() => {
    const n = Math.round(Math.min(1, Math.max(0, progress())) * 161);
    line.geometry.setDrawRange(0, n);
  });
  return <primitive object={line} />;
}
