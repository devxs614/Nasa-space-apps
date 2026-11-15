import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { X } from 'lucide-react';
import { cx } from '../../lib/cx';

export interface ToastItem {
  id: number;
  title: string;
  body?: string;
  tone: 'info' | 'success' | 'error';
}
interface ToastState {
  items: ToastItem[];
  push: (t: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: number) => void;
}
let nextId = 1;
export const useToastStore = create<ToastState>()((set) => ({
  items: [],
  push: (t) => set((s) => ({ items: [...s.items, { ...t, id: nextId++ }].slice(-3) })),
  dismiss: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}));

export function useToast() {
  const push = useToastStore((s) => s.push);
  return { push };
}

function ToastCard({ item }: { item: ToastItem }) {
  const { t } = useTranslation('ui');
  const dismiss = useToastStore((s) => s.dismiss);
  const [hold, setHold] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hold) return;
    const id = window.setTimeout(() => dismiss(item.id), 5000);
    return () => window.clearTimeout(id);
  }, [hold, dismiss, item.id]);
  return (
    <div
      ref={ref}
      role={item.tone === 'error' ? 'alert' : 'status'}
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
      className={cx(
        'panel-solid pointer-events-auto flex items-start gap-3 px-4 py-3 shadow-xl',
        item.tone === 'success' && 'border-phosphor/60',
        item.tone === 'error' && 'border-alert/70',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="font-bold">{item.title}</p>
        {item.body && <p className="mt-0.5 text-[0.9375rem] text-ink-dim">{item.body}</p>}
      </div>
      <button
        type="button"
        className="btn btn-subtle btn-icon -my-1"
        onClick={() => dismiss(item.id)}
        aria-label={t('toast.dismiss')}
      >
        <X size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Región de avisos (z-40). Máximo 3 visibles; se pausan con el ratón o el foco. */
export function Toaster() {
  const { t } = useTranslation('ui');
  const items = useToastStore((s) => s.items);
  return (
    <section
      aria-label={t('toast.region')}
      className="no-print pointer-events-none fixed right-3 bottom-20 z-40 flex w-[min(380px,calc(100vw-24px))] flex-col gap-2 sm:bottom-6"
    >
      {items.map((it) => (
        <ToastCard key={it.id} item={it} />
      ))}
    </section>
  );
}
