import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAppStore } from '../state/useAppStore';
import { useUiStore } from '../state/useUiStore';
import { AudioEngine } from '../audio/AudioEngine';

export const SEND_SIGNAL_EVENT = 'ultima:send-signal';

function isTyping(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.closest('[data-keys="own"]')) return true;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

/** Salta al momento siguiente o anterior de La Travesía. */
export function jumpBeat(dir: 1 | -1): void {
  const beats = [...document.querySelectorAll<HTMLElement>('[data-beat], [data-section]')];
  const y = window.scrollY + 80;
  const tops = beats.map((b) => b.getBoundingClientRect().top + window.scrollY);
  let target: HTMLElement | undefined;
  if (dir === 1) target = beats.find((_, i) => (tops[i] ?? 0) > y + 4);
  else
    for (let i = tops.length - 1; i >= 0; i--) {
      if ((tops[i] ?? 0) < y - 8) {
        target = beats[i];
        break;
      }
    }
  if (!target) return;
  const reduced = useAppStore.getState().reducedMotion;
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY,
    behavior: reduced ? 'auto' : 'smooth',
  });
}

/** Atajos de teclado (Parte 8.6). Nunca con el foco en un campo de texto. */
export function useHotkeys(): void {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const app = useAppStore.getState();
      if (!app.hotkeysOn || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;
      const ui = useUiStore.getState();
      if (ui.settingsOpen || ui.indexOpen) return;
      const onJourney = pathname === '/' || pathname === '';
      const k = e.key.toLowerCase();
      if (k === 'm') {
        e.preventDefault();
        ui.setIndexOpen(true);
      } else if (k === 's') {
        e.preventDefault();
        if (app.soundOn) {
          app.updateSettings({ soundOn: false });
          AudioEngine.setEnabled(false);
        } else {
          void AudioEngine.init().then((ok) => {
            if (!ok) return;
            app.updateSettings({ soundOn: true });
            AudioEngine.setEnabled(true);
          });
        }
      } else if (k === 'l') {
        e.preventDefault();
        app.setLocale(app.locale === 'es' ? 'en' : 'es');
      } else if (k === 'r') {
        e.preventDefault();
        void navigate('/lectura');
      } else if (onJourney && (k === 'j' || e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
        e.preventDefault();
        jumpBeat(1);
      } else if (onJourney && (k === 'k' || e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        jumpBeat(-1);
      } else if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) {
        const ev = new CustomEvent(SEND_SIGNAL_EVENT, { cancelable: true });
        window.dispatchEvent(ev);
        if (ev.defaultPrevented) e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, pathname]);
}
