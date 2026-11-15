import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { NoToneMapping, SRGBColorSpace } from 'three';
import { useAppStore, type Quality } from '../state/useAppStore';
import { useJourneyStore } from '../state/useJourneyStore';
import { useUiStore } from '../state/useUiStore';
import { Starfield } from './environment/Starfield';
import { SceneDirector } from './SceneDirector';
import { CameraRig } from './CameraRig';
import { QUALITY, estimateGpuTier, tierToQuality } from './quality';
import { shouldStartLite } from '../lib/device';
import { DebugPanel } from './DebugPanel';

const PostFX = lazy(() => import('./PostFX'));
const ORDER: Quality[] = ['low', 'medium', 'high'];

class ThreeBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(err: unknown) {
    console.error('3D', err);
    this.props.onError();
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useTabVisible(): boolean {
  const [v, setV] = useState(() => !document.hidden);
  useEffect(() => {
    const on = () => setV(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return v;
}

/** Lienzo 3D único y persistente detrás del DOM (Partes 6.1 y 9.1). */
export default function Experience() {
  const quality = useAppStore((s) => s.quality);
  const liteMode = useAppStore((s) => s.liteMode);
  const setQuality = useAppStore((s) => s.setQuality);
  const paused = useJourneyStore((s) => s.paused);
  const interactive = useJourneyStore((s) => s.canvasInteractive);
  const setThreeFailed = useUiStore((s) => s.setThreeFailed);
  const registerLoss = useUiStore((s) => s.registerContextLoss);
  const [mountKey, setMountKey] = useState(0);
  const tabVisible = useTabVisible();
  const changes = useRef(0);
  const raisedOnce = useRef(false);

  // Calidad inicial sin peticiones externas; modo ligero automático si el equipo es modesto (Parte 17.8).
  useEffect(() => {
    const app = useAppStore.getState();
    const tier = estimateGpuTier();
    if (app.autoQuality) app.setQuality(tierToQuality(tier), true);
    if (!app.liteDecided && shouldStartLite(tier)) {
      app.setLiteMode(true);
      useUiStore.getState().setLiteBanner(true);
    }
  }, []);

  const lower = useCallback(() => {
    if (!useAppStore.getState().autoQuality) return;
    const i = ORDER.indexOf(useAppStore.getState().quality);
    if (i > 0) {
      setQuality(ORDER[i - 1]!, true);
      changes.current++;
    }
  }, [setQuality]);
  const raise = useCallback(() => {
    if (!useAppStore.getState().autoQuality || raisedOnce.current) return;
    const i = ORDER.indexOf(useAppStore.getState().quality);
    if (i < 2) {
      raisedOnce.current = true;
      setQuality(ORDER[i + 1]!, true);
      changes.current++;
    }
  }, [setQuality]);
  const fallback = useCallback(() => {
    if (useAppStore.getState().autoQuality) setQuality('low', true);
  }, [setQuality]);

  // Algunos navegadores no notifican el ResizeObserver inicial en pestañas en segundo plano.
  useEffect(() => {
    const t = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
    return () => window.clearTimeout(t);
  }, [mountKey]);

  const effective: Quality = liteMode ? 'low' : quality;
  const debug = new URLSearchParams(window.location.search).get('debug') === '1';

  return (
    <div
      aria-hidden="true"
      data-lenis-prevent={interactive ? '' : undefined}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
    >
      <ThreeBoundary key={mountKey} onError={() => setThreeFailed(true)}>
        <Canvas
          key={mountKey}
          dpr={[1, QUALITY[effective].dpr]}
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            alpha: false,
            stencil: false,
          }}
          camera={{ fov: 40, near: 0.05, far: 6000, position: [0, 0, 14] }}
          shadows={QUALITY[effective].shadows > 0}
          frameloop={!tabVisible ? 'never' : liteMode || paused ? 'demand' : 'always'}
          onCreated={({ gl }) => {
            gl.localClippingEnabled = true;
            gl.toneMapping = NoToneMapping;
            gl.outputColorSpace = SRGBColorSpace;
            const c = gl.domElement;
            c.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              registerLoss();
              if (useAppStore.getState().autoQuality)
                useAppStore.getState().setQuality('low', true);
              if (useUiStore.getState().contextLosses <= 1)
                window.setTimeout(() => setMountKey((k) => k + 1), 300);
              else setThreeFailed(true);
            });
          }}
          style={{ position: 'fixed', inset: 0 }}
        >
          <color attach="background" args={['#05060a']} />
          <PerformanceMonitor
            onDecline={lower}
            onIncline={raise}
            flipflops={3}
            onFallback={fallback}
          />
          <AdaptiveDpr pixelated={false} />
          <Suspense fallback={null}>
            <Starfield />
            <SceneDirector />
            <CameraRig />
          </Suspense>
          {effective !== 'low' && (
            <Suspense fallback={null}>
              <PostFX quality={effective} />
            </Suspense>
          )}
          {debug && <DebugPanel target="debug-panel" />}
        </Canvas>
      </ThreeBoundary>
      {debug && (
        <pre
          id="debug-panel"
          className="fixed right-2 bottom-16 z-50 rounded bg-black/80 p-2 font-mono text-[11px] text-phosphor"
        />
      )}
    </div>
  );
}
