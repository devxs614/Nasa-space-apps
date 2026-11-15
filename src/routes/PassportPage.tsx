import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Download, RotateCcw } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { Patch, patchState } from '../components/passport/Patch';
import { rankKey } from '../components/passport/ranks';
import { PostcardMaker } from '../components/passport/PostcardMaker';
import { Dialog } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../state/useAppStore';
import { MACHINES } from '../data/machines';
import { ACTS } from '../data/acts';
import { isPersistent } from '../lib/storage';
import { downloadCanvas, makeCanvas, paintStars, svgToImage } from '../lib/exportImage';
import { formatDate } from '../lib/format';
import { useToast } from '../components/ui/Toast';

const CONSTELLATIONS: Record<string, [number, number][]> = {
  moon: [
    [10, 60],
    [30, 30],
    [55, 45],
    [80, 20],
  ],
  mars: [
    [8, 70],
    [22, 40],
    [38, 55],
    [50, 25],
    [64, 50],
    [78, 30],
    [92, 62],
  ],
  'small-bodies': [
    [25, 60],
    [75, 35],
  ],
  'deep-space': [
    [20, 30],
    [80, 65],
  ],
};

/** Pasaporte (Partes 8.12 y 14.8): parches, rango, quizzes, constelaciones y descarga en PNG. */
export function PassportPage() {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  const progress = useAppStore((s) => s.progress);
  const patches = useAppStore((s) => s.patches);
  const postcard = useAppStore((s) => s.postcard);
  const reset = useAppStore((s) => s.resetProgress);
  const [confirm, setConfirm] = useState(false);
  const [showPostcard, setShowPostcard] = useState(false);
  const grid = useRef<HTMLUListElement>(null);
  const { push } = useToast();
  const quizSum = MACHINES.reduce((a, m) => a + (progress[m.id]?.bestQuiz ?? 0), 0);
  const rank = t(rankKey(patches.length));

  const download = async () => {
    await document.fonts.ready;
    const made = makeCanvas(1200, 1500);
    if (!made) return;
    const { canvas, ctx } = made;
    paintStars(ctx, 1200, 1500, 2026);
    ctx.fillStyle = '#e8eef7';
    ctx.font = '800 54px "Unbounded Variable", sans-serif';
    ctx.fillText(t('passport.imageTitle'), 70, 130);
    ctx.font = '400 30px "Atkinson Hyperlegible Next Variable", sans-serif';
    ctx.fillStyle = '#5ef2ff';
    ctx.fillText(`${t('passport.rank')}: ${rank}`, 70, 190);
    ctx.fillStyle = '#ffb547';
    ctx.fillText(
      `${t('passport.count', { n: patches.length })} · ${t('passport.quiz', { n: quizSum })}`,
      70,
      240,
    );
    const svgs = grid.current?.querySelectorAll('svg[data-export]') ?? [];
    let i = 0;
    for (const svg of Array.from(svgs)) {
      const img = await svgToImage(svg as SVGSVGElement).catch(() => null);
      const col = i % 5;
      const row = Math.floor(i / 5);
      if (img) ctx.drawImage(img, 70 + col * 215, 320 + row * 300, 190, 190);
      const m = MACHINES[i];
      if (m) {
        ctx.fillStyle = '#9aa7bd';
        ctx.font = '400 18px "Atkinson Hyperlegible Next Variable", sans-serif';
        ctx.fillText((m.shortName ?? m.name)[locale].slice(0, 18), 70 + col * 215, 540 + row * 300);
      }
      i++;
    }
    ctx.fillStyle = '#9aa7bd';
    ctx.font = '400 20px "Atkinson Hyperlegible Next Variable", sans-serif';
    ctx.fillText(formatDate(new Date().toISOString().slice(0, 10), locale), 70, 1420);
    ctx.fillText(t('postcard.footer'), 70, 1455);
    await downloadCanvas(canvas, 'ultima-senal-pasaporte.png');
  };

  return (
    <PageShell title={t('passport.title')} intro={<p>{t('passport.intro')}</p>} wide>
      {!isPersistent() && <p className="mb-4 text-amber">{t('passport.memoryOnly')}</p>}
      <div className="mb-8 flex flex-wrap items-center gap-6">
        <div className="panel-solid hud-corners px-5 py-3">
          <p className="font-mono text-[0.8125rem] text-ink-dim uppercase">{t('passport.rank')}</p>
          <p className="font-heading text-[length:var(--fs-h3)] font-bold text-signal">{rank}</p>
        </div>
        <p className="font-mono">{t('passport.count', { n: patches.length })}</p>
        <p className="font-mono">{t('passport.quiz', { n: quizSum })}</p>
      </div>
      <ul ref={grid} className="grid grid-cols-3 gap-4 sm:gap-6 lg:grid-cols-5">
        {MACHINES.map((m) => {
          const p = progress[m.id];
          const state = patchState(Boolean(p?.completed), p?.bestQuiz ?? 0);
          return (
            <li
              key={m.id}
              className="flex flex-col items-center text-center"
              data-patch={m.id}
              data-state={state}
            >
              <Patch machine={m} state={state} className="h-auto w-full max-w-[180px]" />
              <span className="hidden">
                <Patch machine={m} state={state} withText={false} size={190} />
              </span>
              <Link to={`/maquinas/${m.id}`} className="mt-2 text-[0.9375rem]">
                {(m.shortName ?? m.name)[locale]}
                <span className="sr-only"> · {t('passport.goTo', { n: m.order })}</span>
              </Link>
              <span className="font-mono text-[0.8125rem] text-ink-dim">
                {t(`passport.state.${state}`)}
              </span>
            </li>
          );
        })}
      </ul>
      <section className="mt-12" aria-labelledby="const-title">
        <h2 id="const-title" className="font-heading text-[length:var(--fs-h2)] font-bold">
          {t('passport.constellations')}
        </h2>
        <p className="mt-2 text-ink-dim">{t('passport.constellationHint')}</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACTS.map((a) => {
            const lit = a.machines.every((id) => progress[id]?.completed);
            const pts = CONSTELLATIONS[a.world] ?? [];
            return (
              <li key={a.world} className="panel-solid p-3" data-act={a.world}>
                <svg
                  viewBox="0 0 100 80"
                  className="w-full"
                  role="img"
                  aria-label={`${t(`common:worldsAct.${a.world}`)} · ${lit ? t('passport.state.earned') : t('passport.state.locked')}`}
                >
                  <polyline
                    points={pts.map((p) => p.join(',')).join(' ')}
                    fill="none"
                    stroke={lit ? 'var(--accent)' : '#334'}
                    strokeWidth="0.8"
                  />
                  {pts.map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={lit ? 2.4 : 1.6}
                      fill={lit ? '#fff' : '#556'}
                    />
                  ))}
                </svg>
                <p className="mt-1 font-mono text-[0.8125rem]">
                  {t(`common:worldsAct.${a.world}`)} · {t(`common:worlds.${a.world}`)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button
          variant="primary"
          icon={<Download size={18} aria-hidden="true" />}
          onClick={() => void download()}
        >
          {t('passport.download')}
        </Button>
        <Button icon={<RotateCcw size={18} aria-hidden="true" />} onClick={() => setConfirm(true)}>
          {t('passport.reset')}
        </Button>
        {postcard && (
          <Button onClick={() => setShowPostcard(true)}>{t('passport.seePostcard')}</Button>
        )}
      </div>
      <Dialog open={confirm} onClose={() => setConfirm(false)} title={t('passport.reset')}>
        <p>{t('settings.resetConfirm')}</p>
        <div className="mt-4 flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              reset();
              setConfirm(false);
              push({ title: t('settings.resetDone'), tone: 'info' });
            }}
          >
            {t('common.yes')}
          </Button>
          <Button onClick={() => setConfirm(false)}>{t('common.noThanks')}</Button>
        </div>
      </Dialog>
      <Dialog
        open={showPostcard}
        onClose={() => setShowPostcard(false)}
        title={t('passport.seePostcard')}
        wide
      >
        <PostcardMaker />
      </Dialog>
    </PageShell>
  );
}
