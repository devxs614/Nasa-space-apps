import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Box3,
  Color,
  Mesh,
  Vector3,
  type BufferGeometry,
  type Group,
  type Object3D,
  type ShaderMaterial,
} from 'three';
import type { MachineId } from '../../data/types';
import { MODELS } from './registry';
import { DetailContext, FlagsContext, ModeContext } from './parts/mat';
import {
  applyDust,
  freeHologramMaterial,
  hologramMaterial,
  outlineMaterial,
  setRevealY,
} from '../materials';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useQuality } from '../quality';
import { assetExists, publicUrl } from '../../lib/assets';
import { FRAME } from '../layout';

export interface MachineModelProps {
  id: MachineId;
  /** Revelado objetivo 0..1 (0 = holograma dormido, 1 = material real). */
  reveal: () => number;
  dust?: () => number;
  dustColor?: Color;
  highlightKey?: boolean;
  holoOnly?: boolean;
  turntable?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  flags?: { broken?: boolean; collapsed?: boolean };
  children?: ReactNode;
}

const NO_FLAGS = {};

/** Carga opcional del GLB de NASA 3D Resources, normalizado en tamaño y con la base en y = 0 (Parte 10.5). */
function useOptionalGlb(id: MachineId): Object3D | null {
  const [obj, setObj] = useState<Object3D | null>(null);
  const quality = useAppStore((s) => s.quality);
  useEffect(() => {
    if (quality === 'low') return;
    let alive = true;
    const path = `models/${id}.glb`;
    void assetExists(path).then(async (ok) => {
      if (!ok || !alive) return;
      const url = publicUrl(path);
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      new GLTFLoader().load(url, (g) => {
        if (!alive) return;
        const root = g.scene;
        const box = new Box3().setFromObject(root);
        const size = box.getSize(new Vector3());
        const s = FRAME[id] / Math.max(size.x, size.y, size.z, 1e-3);
        root.scale.setScalar(s);
        const b2 = new Box3().setFromObject(root);
        root.position.y -= b2.min.y;
        setObj(root);
      });
    });
    return () => {
      alive = false;
    };
  }, [id, quality]);
  return obj;
}

/** Máquina con tres estados (dormida, despertando, recordando) mediante el revelado de la Parte 9.6. */
export function MachineModel({
  id,
  reveal,
  dust,
  dustColor,
  highlightKey,
  holoOnly,
  turntable,
  position,
  rotation,
  scale = 1,
  flags,
  children,
}: MachineModelProps) {
  const Model = MODELS[id];
  const q = useQuality();
  const lite = useAppStore((s) => s.liteMode);
  const glb = useOptionalGlb(id);
  const root = useRef<Group>(null);
  const realG = useRef<Group>(null);
  const holoG = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const current = useRef(holoOnly ? 0 : -1);
  const box = useMemo(() => new Box3(), []);
  const boxReady = useRef(false);
  const detail = q.sphereSegments >= 192 ? 24 : q.sphereSegments >= 128 ? 16 : 10;

  useEffect(() => {
    boxReady.current = false;
  }, [id, glb]);

  // Contorno de la pieza clave (casco invertido) sobre las mallas bajo un grupo "keyPart".
  useEffect(() => {
    const g = realG.current;
    if (!g || !highlightKey) return;
    const added: Mesh<BufferGeometry, ShaderMaterial>[] = [];
    g.traverse((o) => {
      if (o.name !== 'keyPart') return;
      o.traverse((m) => {
        if (m instanceof Mesh && !m.userData.outline) {
          const out = new Mesh(m.geometry as BufferGeometry, outlineMaterial());
          out.userData.outline = true;
          out.raycast = () => undefined;
          m.add(out);
          added.push(out);
        }
      });
    });
    return () => added.forEach((o) => o.removeFromParent());
  }, [highlightKey, id, glb]);

  useEffect(
    () => () => {
      setRevealY(1e6);
      if (dust) applyDust(0, new Color());
    },
    [dust],
  );

  useFrame((state, delta) => {
    const r = root.current;
    const rg = realG.current;
    const hg = holoG.current;
    if (!r || !rg || !hg) return;
    const reduced = useAppStore.getState().reducedMotion;
    const paused = useJourneyStore.getState().paused;
    if (!boxReady.current) {
      r.updateWorldMatrix(true, true);
      box.setFromObject(rg);
      if (!box.isEmpty()) boxReady.current = true;
    }
    const target = holoOnly ? 0 : Math.min(1, Math.max(0, reveal()));
    if (reduced) current.current = target;
    else if (current.current < 0)
      current.current = 0; // al aparecer: holograma que despierta
    else {
      const step = delta / 1.6;
      current.current += Math.max(-step, Math.min(step, target - current.current));
    }
    const c = current.current;
    // Frente de revelado en coordenadas del mundo (planos compartidos: una sola máquina activa).
    if (!holoOnly && boxReady.current) {
      const h = box.max.y - box.min.y;
      setRevealY(c >= 0.999 ? 1e6 : c <= 0.001 ? -1e6 : box.min.y + c * h * 1.02 - 0.01);
    }
    rg.visible = !holoOnly && c > 0.001;
    hg.visible = c < 0.999;
    const holo = holoOnly ? freeHologramMaterial() : hologramMaterial();
    if (!paused) holo.uniforms.uTime!.value = state.clock.elapsedTime;
    if (!holoOnly) holo.uniforms.uOpacity!.value = c <= 0.001 ? 0.42 : 0.85;
    holo.uniforms.uFlicker!.value = reduced ? 0 : 1;
    holo.uniforms.uGlitch!.value = reduced ? 0 : 1;
    holo.uniforms.uScan!.value = lite ? 0 : 1;
    if (dust) applyDust(dust(), dustColor ?? new Color('#c7895b'));
    if (highlightKey) {
      const o = outlineMaterial();
      o.uniforms.uPulse!.value = reduced ? 1 : 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 3);
    }
    if (turntable && spin.current && !reduced && !paused) spin.current.rotation.y += delta * 0.18;
    if (c > 0.001 && c < 0.999) state.invalidate();
  });

  const body = glb ? <primitive object={glb} /> : <Model />;
  return (
    <group ref={root} position={position} rotation={rotation} scale={scale}>
      <group ref={spin}>
        <FlagsContext.Provider value={flags ?? NO_FLAGS}>
          <DetailContext.Provider value={detail}>
            <group ref={realG}>
              <ModeContext.Provider value="real">{body}</ModeContext.Provider>
            </group>
            <group ref={holoG}>
              <ModeContext.Provider value={holoOnly ? 'holoFree' : 'holo'}>
                {glb ? null : <Model />}
              </ModeContext.Provider>
            </group>
          </DetailContext.Provider>
        </FlagsContext.Provider>
      </group>
      {children}
    </group>
  );
}
