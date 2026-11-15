import { useEffect, useState } from 'react';
import { create } from 'zustand';

interface AnnounceState {
  message: string;
  seq: number;
  say: (msg: string) => void;
}
export const useAnnounce = create<AnnounceState>()((set) => ({
  message: '',
  seq: 0,
  say: (message) => set((s) => ({ message, seq: s.seq + 1 })),
}));

/** Anuncia un mensaje a lectores de pantalla (aria-live="polite"), con retardo opcional. */
export function announce(msg: string, delayMs = 0): void {
  if (delayMs > 0) window.setTimeout(() => useAnnounce.getState().say(msg), delayMs);
  else useAnnounce.getState().say(msg);
}

/** Región de avisos para lectores de pantalla (z-40, sin eventos de puntero). */
export function LiveRegion() {
  const { message, seq } = useAnnounce();
  const [text, setText] = useState('');
  useEffect(() => {
    setText('');
    const id = window.setTimeout(() => setText(message), 60);
    return () => window.clearTimeout(id);
  }, [message, seq]);
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>
  );
}
