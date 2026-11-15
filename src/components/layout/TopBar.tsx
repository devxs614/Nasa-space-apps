import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Menu, Pause, Play, Settings, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useUiStore } from '../../state/useUiStore';
import { MissionClock } from '../hud/MissionClock';
import { cx } from '../../lib/cx';
import { AudioEngine } from '../../audio/AudioEngine';
import { MACHINES_BY_ID } from '../../data/machines';

export function TopBar() {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const soundOn = useAppStore((s) => s.soundOn);
  const classroom = useAppStore((s) => s.classroomMode);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const paused = useJourneyStore((s) => s.paused);
  const setPaused = useJourneyStore((s) => s.setPaused);
  const chapterId = useJourneyStore((s) => s.chapterId);
  const openSettings = useUiStore((s) => s.openSettings);
  const setIndexOpen = useUiStore((s) => s.setIndexOpen);
  const [hidden, setHidden] = useState(false);
  const [needsResume, setNeedsResume] = useState(() => soundOn && !AudioEngine.ready);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const focusInside = ref.current?.contains(document.activeElement) ?? false;
      if (classroom || focusInside || y < 80) setHidden(false);
      else if (Math.abs(y - last) > 6) setHidden(y > last);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [classroom]);

  useEffect(() => {
    if (!soundOn) {
      setNeedsResume(false);
      return;
    }
    if (AudioEngine.ready) return;
    setNeedsResume(true);
    const resume = () => {
      void AudioEngine.init().then((ok) => {
        if (ok) AudioEngine.setEnabled(true);
        setNeedsResume(false);
      });
    };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
  }, [soundOn]);

  const toggleSound = () => {
    if (soundOn && !needsResume) {
      updateSettings({ soundOn: false });
      return;
    }
    void AudioEngine.init().then((ok) => {
      if (!ok) return;
      updateSettings({ soundOn: true });
      AudioEngine.setEnabled(true);
      setNeedsResume(false);
    });
  };

  const chapter = chapterId ? MACHINES_BY_ID[chapterId] : null;
  const soundLabel = needsResume
    ? t('top.soundResume')
    : soundOn
      ? t('top.soundOn')
      : t('top.soundOff');

  return (
    <header
      ref={ref}
      onFocus={() => setHidden(false)}
      className={cx(
        'no-print fixed inset-x-0 top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-void/70 px-3 backdrop-blur-md transition-transform duration-300 sm:px-5',
        hidden && '-translate-y-full',
      )}
    >
      <Link
        to="/"
        className="font-heading text-[0.95rem] font-extrabold tracking-[0.06em] text-ink no-underline sm:text-base"
        aria-label={t('top.home')}
      >
        {t('brand')}
      </Link>
      {chapter && (
        <span className="hidden truncate border-l border-line pl-3 font-mono text-[0.8125rem] text-ink-dim lg:inline">
          {String(chapter.order).padStart(2, '0')} · {chapter.name[locale]}
        </span>
      )}
      <MissionClock mode="utc" className="ml-auto hidden font-mono text-[0.8125rem] md:inline" />
      <div className="ml-auto flex items-center gap-1 md:ml-3">
        <button
          type="button"
          className="btn btn-subtle btn-sm font-mono"
          onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
          aria-label={t('top.switchTo')}
          lang={locale === 'es' ? 'en' : 'es'}
        >
          {t('top.switchShort')}
        </button>
        <button
          type="button"
          className="btn btn-subtle btn-icon"
          onClick={toggleSound}
          aria-pressed={soundOn && !needsResume}
          aria-label={soundLabel}
          title={soundLabel}
        >
          {soundOn && !needsResume ? (
            <Volume2 size={20} strokeWidth={1.5} />
          ) : (
            <VolumeX size={20} strokeWidth={1.5} />
          )}
        </button>
        <button
          type="button"
          className="btn btn-subtle btn-icon"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
          aria-label={paused ? t('top.resume') : t('top.pause')}
          title={paused ? t('top.resume') : t('top.pause')}
        >
          {paused ? <Play size={20} strokeWidth={1.5} /> : <Pause size={20} strokeWidth={1.5} />}
        </button>
        <button
          type="button"
          className="btn btn-subtle btn-icon"
          onClick={() => openSettings()}
          aria-label={t('top.settings')}
          title={t('top.settings')}
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="btn btn-subtle btn-icon"
          onClick={() => setIndexOpen(true)}
          aria-label={t('top.menu')}
          title={t('top.menu')}
          aria-keyshortcuts="M"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
