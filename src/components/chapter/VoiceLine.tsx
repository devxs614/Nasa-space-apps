import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Volume2, Square, Info } from 'lucide-react';
import { LumiAvatar } from '../lumi/LumiAvatar';
import { SourceBadge } from '../ui/SourceBadge';
import { GlossText } from './GlossText';
import { speak, stopSpeaking } from '../../audio/narrator';
import { loadAudioPrefs } from '../../audio/AudioEngine';
import { useAppStore } from '../../state/useAppStore';
import { useVoiceAvailable } from '../../hooks/useVoiceAvailable';
import { cx } from '../../lib/cx';

export type VoiceSpeaker = 'lumi' | 'machine' | 'log' | 'you' | 'note';

export interface VoiceLineProps {
  speaker: VoiceSpeaker;
  text: string;
  who?: string;
  sourceIds?: readonly string[];
  approx?: boolean;
  lang?: string;
  extra?: ReactNode;
  className?: string;
  /** "LUMI · guía ficticia" en lugar de "LUMI" (portada). */
  lumiFull?: boolean;
}

function ListenButton({ text, speaker }: { text: string; speaker: 'lumi' | 'machine' | 'log' }) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const available = useVoiceAvailable(locale);
  const [on, setOn] = useState(false);
  if (!available) return null;
  return (
    <button
      type="button"
      className="btn btn-subtle btn-sm -my-1 gap-1 px-2"
      aria-pressed={on}
      onClick={() => {
        if (on) {
          stopSpeaking();
          setOn(false);
          return;
        }
        setOn(speak(text, speaker, locale, loadAudioPrefs().narrationRate, () => setOn(false)));
      }}
    >
      {on ? <Square size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
      <span>{on ? t('voice.stop') : t('voice.listen')}</span>
      <span className="sr-only">· {t('badge.synthetic')}</span>
    </button>
  );
}

/** Una línea de diálogo con el código visual de hecho y ficción (Parte 4.3). */
export function VoiceLine({
  speaker,
  text,
  who,
  sourceIds,
  approx,
  lang,
  extra,
  className,
  lumiFull,
}: VoiceLineProps) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const body = <GlossText text={text} locale={locale} enabled={!lang} />;

  if (speaker === 'lumi') {
    return (
      <div className={cx('panel flex gap-3 border-signal/40 p-4', className)}>
        <LumiAvatar size={40} />
        <div className="min-w-0 flex-1">
          <p className="mb-1 flex flex-wrap items-center gap-2 font-mono text-[0.8125rem] tracking-wider text-signal uppercase">
            <span>{lumiFull ? t('badge.lumi') : t('voice.lumi')}</span>
            <ListenButton text={text} speaker="lumi" />
          </p>
          <p lang={lang}>{body}</p>
          {extra}
        </div>
      </div>
    );
  }
  if (speaker === 'machine') {
    return (
      <figure className={cx('relative rounded-card bg-void/80 p-4 backdrop-blur-sm', className)}>
        <figcaption className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[0.8125rem] text-[#ffd59a]">
          <Sparkles size={14} aria-hidden="true" />
          <span>{t('badge.fiction')}</span>
          {who && <span className="text-ink-dim">· {who}</span>}
          <ListenButton text={text} speaker="machine" />
        </figcaption>
        <blockquote className="voice-machine" lang={lang}>
          <span className="quote-mark" aria-hidden="true">
            “
          </span>
          {body}
        </blockquote>
        {extra}
      </figure>
    );
  }
  if (speaker === 'log') {
    return (
      <div className={cx('panel-solid hud-corners p-4', className)}>
        <p className="mb-1 flex flex-wrap items-center gap-2 font-mono text-[0.8125rem] tracking-wider text-amber uppercase">
          <span>{t('voice.log')}</span>
          <ListenButton text={text} speaker="log" />
        </p>
        <p className="voice-log" lang={lang}>
          {body}
        </p>
        {sourceIds && sourceIds.length > 0 && (
          <SourceBadge sourceIds={sourceIds} approx={approx} className="mt-3" />
        )}
        {extra}
      </div>
    );
  }
  if (speaker === 'note') {
    return (
      <div
        className={cx(
          'flex gap-2 rounded-card border border-line px-4 py-3 text-[0.9375rem] text-ink-dim',
          className,
        )}
      >
        <Info size={16} className="mt-1 shrink-0" aria-hidden="true" />
        <p>
          <span className="sr-only">{t('voice.note')}: </span>
          {text}
        </p>
      </div>
    );
  }
  return (
    <p className={cx('text-right font-bold text-signal', className)}>
      <span className="sr-only">{t('voice.you')}: </span>
      {text}
    </p>
  );
}
