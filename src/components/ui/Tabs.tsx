import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
}
export interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  label: string;
}

/** Pestañas WAI-ARIA: tabindex itinerante, flechas, Inicio y Fin. */
export function Tabs({ tabs, active, onChange, label }: TabsProps) {
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.id === active),
  );
  const go = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    const tab = tabs[n];
    if (!tab) return;
    onChange(tab.id);
    refs.current[n]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(index + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(index - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(tabs.length - 1);
    else return;
    e.preventDefault();
  };
  const current = tabs[index];
  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="-mx-1 mb-4 flex flex-wrap gap-1 border-b border-line pb-2"
      >
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${base}-tab-${t.id}`}
            aria-selected={i === index}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={i === index ? 0 : -1}
            onKeyDown={onKey}
            onClick={() => onChange(t.id)}
            className={cx(
              'btn btn-sm',
              i === index ? 'btn-ghost border-signal text-signal' : 'btn-subtle',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {current && (
        <div
          role="tabpanel"
          id={`${base}-panel-${current.id}`}
          aria-labelledby={`${base}-tab-${current.id}`}
          tabIndex={0}
        >
          {current.panel}
        </div>
      )}
    </div>
  );
}
