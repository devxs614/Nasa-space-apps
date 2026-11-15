import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';

export interface PopoverProps {
  /** Contenido del botón disparador. */
  trigger: ReactNode;
  triggerLabel?: string;
  triggerClassName?: string;
  title: string;
  children: ReactNode;
  placement?: 'top' | 'bottom';
}

/**
 * Popover no modal: se abre con clic o Enter, se cierra con Esc o clic fuera y devuelve el foco
 * al disparador. Posición calculada con getBoundingClientRect (ver DECISIONS.md).
 */
export function Popover({
  trigger,
  triggerLabel,
  triggerClassName,
  title,
  children,
  placement = 'bottom',
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; up: boolean }>({
    left: 0,
    top: 0,
    up: false,
  });
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  const close = useCallback((focus = true) => {
    setOpen(false);
    if (focus) btn.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const w = Math.min(360, window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12));
    const up = placement === 'top' || r.bottom > window.innerHeight * 0.62;
    setPos({ left, top: up ? r.top - 8 : r.bottom + 8, up });
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !btn.current?.contains(t)) close(false);
    };
    const onScroll = () => close(false);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={triggerLabel}
        onClick={() => (open ? close() : setOpen(true))}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open &&
        createPortal(
          <div
            ref={panel}
            id={id}
            role="dialog"
            aria-label={title}
            tabIndex={-1}
            style={{
              left: pos.left,
              top: pos.top,
              transform: pos.up ? 'translateY(-100%)' : undefined,
              width: 'min(360px, calc(100vw - 24px))',
            }}
            className={cx(
              'panel-solid fixed z-[45] p-4 text-left text-[0.9375rem] shadow-2xl outline-none',
            )}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
