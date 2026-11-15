import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Send } from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { MACHINES_BY_ID } from '../../data/machines';
import { Patch, patchState } from './Patch';
import { VoiceLine } from '../chapter/VoiceLine';
import {
  downloadCanvas,
  loadImage,
  makeCanvas,
  paintStars,
  svgToImage,
  wrapText,
} from '../../lib/exportImage';
import { formatDate } from '../../lib/format';
import { announce } from '../layout/LiveRegion';

const MAX = 280;

/** "Tú eres la próxima señal": postal de 1200×630 generada en el navegador (Partes 8.8 y 14.8). */
export function PostcardMaker() {
  const { t } = useTranslation(['ui', 'chapters']);
  const locale = useAppStore((s) => s.locale);
  const patches = useAppStore((s) => s.patches);
  const progress = useAppStore((s) => s.progress);
  const saved = useAppStore((s) => s.postcard);
  const savePostcard = useAppStore((s) => s.savePostcard);
  const drawing = useJourneyStore((s) => s.plaqueDrawing);
  const [msg, setMsg] = useState(saved?.message ?? '');
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hidden = useRef<HTMLDivElement>(null);
  const id = useId();

  const create = async () => {
    if (!msg.trim()) {
      setError(true);
      return;
    }
    setError(false);
    savePostcard(msg.trim());
    await document.fonts.ready;
    const made = makeCanvas(1200, 630);
    if (!made) return;
    const { canvas, ctx } = made;
    paintStars(ctx, 1200, 630);
    ctx.strokeStyle = 'rgba(94,242,255,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, 1152, 582);
    ctx.fillStyle = '#5ef2ff';
    ctx.font = '600 18px "JetBrains Mono Variable", monospace';
    ctx.fillText(t('postcard.title').toUpperCase(), 60, 80);
    ctx.fillStyle = '#9aa7bd';
    ctx.font = '400 20px "Atkinson Hyperlegible Next Variable", sans-serif';
    ctx.fillText(t('postcard.to'), 60, 130);
    ctx.fillStyle = '#e8eef7';
    ctx.font = 'italic 400 34px "Fraunces Variable", Georgia, serif';
    wrapText(ctx, `“${msg.trim()}”`, drawing ? 700 : 1060)
      .slice(0, 7)
      .forEach((l, i) => ctx.fillText(l, 60, 190 + i * 46));
    ctx.fillStyle = '#ffb547';
    ctx.font = '400 20px "JetBrains Mono Variable", monospace';
    ctx.fillText(
      t('postcard.from', { date: formatDate(new Date().toISOString().slice(0, 10), locale) }),
      60,
      540,
    );
    if (drawing) {
      try {
        const img = await loadImage(drawing);
        ctx.drawImage(img, 800, 150, 340, 208);
      } catch {
        /* sin dibujo */
      }
    }
    const svgs = hidden.current?.querySelectorAll('svg') ?? [];
    let x = 60;
    for (const svg of Array.from(svgs).slice(0, 15)) {
      try {
        const img = await svgToImage(svg);
        ctx.drawImage(img, x, 440, 56, 56);
        x += 62;
      } catch {
        /* parche omitido */
      }
    }
    ctx.fillStyle = '#9aa7bd';
    ctx.font = '400 14px "Atkinson Hyperlegible Next Variable", sans-serif';
    ctx.fillText(t('postcard.footer'), 60, 590);
    canvasRef.current = canvas;
    setPreview(canvas.toDataURL('image/png'));
    announce(t('chapters:epilogue.6'));
  };

  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block font-bold">
        {t('postcard.label')}
      </label>
      <textarea
        id={id}
        value={msg}
        maxLength={MAX}
        rows={4}
        placeholder={t('postcard.placeholder')}
        aria-invalid={error || undefined}
        aria-describedby={`${id}-c ${id}-e`}
        onChange={(e) => {
          setMsg(e.target.value);
          if (e.target.value.trim()) setError(false);
        }}
        className="w-full rounded-card border border-line-strong bg-deep p-3 text-ink"
      />
      <p id={`${id}-c`} className="font-mono text-[0.8125rem] text-ink-dim" aria-live="off">
        {t('postcard.counter', { n: msg.length })}
      </p>
      <p id={`${id}-e`} className="text-alert" role={error ? 'alert' : undefined}>
        {error ? t('postcard.empty') : ''}
      </p>
      <button type="button" className="btn btn-primary" onClick={() => void create()}>
        <Send size={18} aria-hidden="true" />
        {t('postcard.create')}
      </button>
      <p className="text-[0.9375rem] text-ink-dim">{t('postcard.privacy')}</p>
      {preview && (
        <div className="space-y-3">
          <img
            src={preview}
            alt={t('postcard.preview')}
            width={1200}
            height={630}
            className="h-auto w-full rounded-card border border-line"
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() =>
              canvasRef.current && void downloadCanvas(canvasRef.current, 'ultima-senal-postal.png')
            }
          >
            <Download size={18} aria-hidden="true" />
            {t('postcard.download')}
          </button>
          <VoiceLine speaker="lumi" text={t('chapters:epilogue.6')} />
        </div>
      )}
      <div ref={hidden} aria-hidden="true" className="hidden">
        {patches.map((pid) => (
          <Patch
            key={pid}
            machine={MACHINES_BY_ID[pid]}
            state={patchState(true, progress[pid]?.bestQuiz ?? 0)}
            withText={false}
            size={56}
          />
        ))}
      </div>
    </div>
  );
}
