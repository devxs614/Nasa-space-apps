import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  Color,
  QuadraticBezierCurve3,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
  type Mesh,
  type MeshBasicMaterial,
} from 'three';
import { useJourneyStore } from '../../state/useJourneyStore';

export interface SignalPulseProps {
  from: Vector3;
  to: Vector3;
  lift?: number;
  radius?: number;
  color?: string;
}

/** Pulso de luz que viaja de la Tierra a la máquina (Parte 9.10). */
export function SignalPulse({
  from,
  to,
  lift = 4,
  radius = 0.04,
  color = '#5ef2ff',
}: SignalPulseProps) {
  const tube = useRef<Mesh>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);
  const geo = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    mid.add(mid.clone().normalize().multiplyScalar(lift)).add(new Vector3(0, lift * 0.5, 0));
    return new TubeGeometry(new QuadraticBezierCurve3(from, mid, to), 96, radius, 8, false);
  }, [from, to, lift, radius]);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uProgress: { value: 0 },
          uColor: { value: new Color(color) },
          uShow: { value: 0 },
        },
        vertexShader:
          'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'uniform float uProgress; uniform vec3 uColor; uniform float uShow; varying vec2 vUv; void main(){ float d = vUv.x - uProgress; float head = exp(-d*d*900.0); float trail = smoothstep(-0.25, 0.0, d) * step(d, 0.0) * 0.5; float a = (head + trail + 0.06) * uShow; gl_FragColor = vec4(uColor * (1.0 + head * 2.0), a); }',
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [color],
  );
  useEffect(() => () => geo.dispose(), [geo]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame((state) => {
    const sig = useJourneyStore.getState().signal;
    const now = performance.now();
    let p = 0;
    let show = 0;
    if (sig.status === 'traveling') {
      p = Math.min(1, (now - sig.startedAt) / Math.max(1, sig.etaMs));
      show = 1;
    } else if (sig.status === 'arrived') {
      const since = (now - sig.startedAt - sig.etaMs) / 1000;
      p = 1;
      show = Math.max(0, 1 - since * 0.8);
    }
    mat.uniforms.uProgress!.value = p;
    mat.uniforms.uShow!.value = show;
    if (tube.current) tube.current.visible = show > 0.001;
    const e = state.clock.elapsedTime;
    if (ringA.current) {
      const a = sig.status === 'traveling' ? (e * 1.5) % 1 : 0;
      ringA.current.scale.setScalar(0.4 + a * 2.5);
      (ringA.current.material as MeshBasicMaterial).opacity =
        sig.status === 'traveling' ? 1 - a : 0;
    }
    if (ringB.current) {
      const since = sig.status === 'arrived' ? (now - sig.startedAt - sig.etaMs) / 1000 : 9;
      const a = Math.min(1, since / 1.2);
      ringB.current.scale.setScalar(0.3 + a * 4);
      (ringB.current.material as MeshBasicMaterial).opacity = since < 1.2 ? (1 - a) * 1.2 : 0;
    }
    if (sig.status === 'traveling' || (sig.status === 'arrived' && show > 0)) state.invalidate();
  });

  return (
    <group>
      <mesh ref={tube} geometry={geo} material={mat} renderOrder={5} />
      <mesh ref={ringA} position={from}>
        <ringGeometry args={[0.3, 0.38, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ringB} position={to}>
        <sphereGeometry args={[0.25, 24, 12]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
