import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { RotateCcw, X } from 'lucide-react';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useAppStore } from '../../state/useAppStore';
import { useUiStore } from '../../state/useUiStore';
import { getLenis } from '../../hooks/useLenis';
import { refreshScroll } from '../../hooks/useScrollProgress';
import { hasWebGL2 } from '../../lib/device';
import { lightTime } from '../../lib/astro';
import { formatDate, formatLightTime } from '../../lib/format';
import { factValue } from '../../lib/resolve';
import { MACHINES_BY_ID, getFact } from '../../data/machines';
import { Poster } from '../media/Poster';
import { Badge } from '../ui/Badge';
import { playSfx } from '../../audio/play';
import {
  DEMO_STEPS,
  DEMO_TOTAL_MS,
  demoFrame,
  type DemoSignalPhase,
  type DemoStepKey,
} from './demoScript';

type DemoState = 'running' | 'done';

/** Dato real que acompaña a cada subtítulo; sale de los datos, nunca del texto. */
function useStepChips(): Record<DemoStepKey, { label: string; value: string } | null> {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  return useMemo(() => {
    const moon = lightTime('moon').seconds ?? 0;
    const pioneer = lightTime('pioneer10').seconds ?? 0;
    const flight = getFact(MACHINES_BY_ID.ingenuity, 'firstFlight');
    return {
      s1: null,
      s2: { label: t('signal.lightLabel'), value: formatLightTime(moon, locale) },
      s3: {
        label: t('signal.silent'),
        value: formatDate(MACHINES_BY_ID.opportunity.lastSignal.date, locale),
      },
      s4: flight ? { label: flight.label[locale], value: factValue(flight, locale) } : null,
      s5: { label: t('signal.lightLabel'), value: formatLightTime(pioneer, locale) },
    };
  }, [t, locale]);
}

/**
 * Modo Demo (Parte 3.3): recorrido automático de 30 s por los cinco momentos estrella, con
 * subtítulos en inglés. Conduce el store directamente; el contenido de la página queda oculto.
 */
export function DemoMode() {
  const demo = useJourneyStore((s) => s.demo);
  if (!demo) return null;
  return <DemoRunner />;
}

function DemoRunner() {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const threeFailed = useUiStore((s) => s.threeFailed);
  const [webgl] = useState(() => hasWebGL2());
  const [state, setState] = useState<DemoState>('running');
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const exitBtn = useRef<HTMLButtonElement>(null);
  const chips = useStepChips();
  const onJourney = pathname === '/' || pathname === '';

  // La demo usa las escenas de La Travesía: si empieza en otra ruta, vuelve a la portada.
  useEffect(() => {
    if (webgl && !onJourney) void navigate('/');
  }, [webgl, onJourney, navigate]);

  // Mientras dura la demo, la página no se desplaza y su contenido queda oculto.
  useEffect(() => {
    const h = document.documentElement;
    h.dataset.demo = 'true';
    const prevOverflow = h.style.overflow;
    h.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    getLenis()?.stop();
    exitBtn.current?.focus({ preventScroll: true });
    return () => {
      delete h.dataset.demo;
      h.style.overflow = prevOverflow;
      getLenis()?.start();
      window.scrollTo(0, 0);
      refreshScroll();
    };
  }, []);

  const exit = useCallback(() => useJourneyStore.getState().setDemo(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exit]);

  // Línea de tiempo: un único bucle por reproducción, basado en el reloj real.
  useEffect(() => {
    const moonMs = (lightTime('moon').seconds ?? 1.28) * 1000;
    const start = performance.now();
    let raf = 0;
    let phase: DemoSignalPhase = 'idle';
    let lastStep = -1;
    let finished = false;
    let steady = 0;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearInterval(steady);
      setState('done');
    };
    const advance = () => {
      if (finished) return;
      const ms = performance.now() - start;
      const f = demoFrame(ms, moonMs);
      const js = useJourneyStore.getState();
      js.demoDrive(f);
      if (f.signal !== phase) {
        phase = f.signal;
        if (phase === 'traveling') {
          js.setSignal({
            status: 'traveling',
            target: 'apollo-lm',
            etaMs: moonMs,
            startedAt: performance.now(),
          });
          playSfx('send');
        } else if (phase === 'arrived') {
          js.setSignal({ status: 'arrived' });
          playSfx('arrive');
        }
      }
      if (f.step !== lastStep) {
        lastStep = f.step;
        setStep(f.step);
      }
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, ms / DEMO_TOTAL_MS)})`;
      if (ms >= DEMO_TOTAL_MS) finish();
    };
    const loop = () => {
      advance();
      if (!finished) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // Si el navegador limita los fotogramas (pestaña en segundo plano), la demo avanza y termina a su hora.
    steady = window.setInterval(advance, 200);
    return () => {
      finished = true;
      cancelAnimationFrame(raf);
      window.clearInterval(steady);
    };
  }, [run]);

  const replay = () => {
    setState('running');
    setStep(0);
    setRun((n) => n + 1);
  };

  const current = DEMO_STEPS[step] ?? DEMO_STEPS[0]!;
  const chip = chips[current.key];
  const machine = current.machineId ? MACHINES_BY_ID[current.machineId] : null;
  const showPoster = !webgl || threeFailed || !onJourney;

  return (
    <div
      role="region"
      aria-label={t('demo.label')}
      data-demo-state={state}
      data-demo-step={step + 1}
      className="fixed inset-0 z-40 flex flex-col justify-between"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(5_6_10/0.7),transparent_22%,transparent_52%,rgb(5_6_10/0.92))]"
      />
      {showPoster && (
        <div className="absolute inset-0 flex items-center justify-center bg-void p-6">
          <Poster name={current.poster} alt="" eager className="max-h-[60svh] w-auto max-w-full" />
        </div>
      )}
      <div className="relative flex items-start justify-between gap-4 p-4 sm:p-8">
        <p className="font-heading text-[1.1rem] font-extrabold tracking-[0.08em] sm:text-[1.4rem]">
          <span lang="en">{t('demo.title')}</span>
          <span className="mt-1 block font-mono text-[0.8125rem] font-normal tracking-[0.25em] text-signal uppercase">
            {t('demo.label')}
          </span>
        </p>
        <button
          ref={exitBtn}
          type="button"
          className="btn btn-subtle btn-sm bg-void/60"
          onClick={exit}
          aria-keyshortcuts="Escape"
        >
          <X size={16} aria-hidden="true" />
          {t('demo.exit')}
        </button>
      </div>

      {state === 'done' ? (
        <div className="relative m-auto flex max-w-[640px] flex-col items-center gap-5 p-6 text-center">
          <p className="font-mono text-[0.8125rem] tracking-[0.3em] text-signal uppercase">
            {t('demo.done')}
          </p>
          <p className="font-heading text-[length:var(--fs-h1)] leading-none font-black uppercase">
            {t('brand')}
          </p>
          <p className="font-story text-[1.4rem] text-ink-dim italic">{t('tagline')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn btn-primary btn-lg" onClick={exit}>
              {t('demo.start')}
            </button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={replay}>
              <RotateCcw size={18} aria-hidden="true" />
              {t('demo.replay')}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-[1100px] p-4 pb-8 sm:p-8 sm:pb-12">
          <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[0.8125rem] tracking-wider uppercase">
            <span className="text-accent">
              {step + 1} / {DEMO_STEPS.length}
            </span>
            {machine && <span className="text-ink">{machine.name[locale]}</span>}
            {chip && (
              <span className="rounded-chip border border-line-strong bg-void/70 px-2 py-0.5 normal-case">
                <span className="text-ink-dim">{chip.label}: </span>
                <span className="text-amber tabular">{chip.value}</span>
              </span>
            )}
            <Badge tone="render">{t('badge.render3d')}</Badge>
          </div>
          <p
            key={current.key}
            lang="en"
            aria-live="polite"
            data-testid="demo-subtitle"
            className="demo-subtitle font-heading text-[clamp(1.25rem,3.2vw,2.4rem)] leading-tight font-bold text-balance"
          >
            {t(`demo.${current.key}`)}
          </p>
          <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-white/15" aria-hidden="true">
            <div ref={bar} className="h-full origin-left scale-x-0 bg-signal" />
          </div>
        </div>
      )}
    </div>
  );
}
