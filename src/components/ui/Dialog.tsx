import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { cx } from '../../lib/cx';
import { scrollBridge } from '../../lib/scrollBridge';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
  full?: boolean;
  className?: string;
}

/** `<dialog>` nativo con showModal(): foco atrapado, Esc cierra y el foco vuelve al disparador. */
export function Dialog({ open, onClose, title, children, wide, full, className }: DialogProps) {
  const { t } = useTranslation('ui');
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  // Cierres pedidos por el estado (`open` pasó a false) cuyo evento `close` todavía no ha llegado.
  const closedByState = useRef(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      // Si se reabre antes de que llegue el `close` anterior, el foco vuelve al disparador original.
      if (closedByState.current === 0)
        returnTo.current = document.activeElement as HTMLElement | null;
      d.showModal();
    } else if (!open && d.open) {
      closedByState.current += 1;
      d.close();
    }
  }, [open]);

  // Con un diálogo abierto, la página de detrás no se desplaza (el scroll inercial se detiene).
  useEffect(() => {
    if (!open) return;
    scrollBridge.stop();
    return () => {
      // El Modo Demo también detiene el scroll: si sigue activo, no se reanuda aquí.
      if (document.documentElement.dataset.demo !== 'true') scrollBridge.start();
    };
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCloseEvt = () => {
      const byState = closedByState.current > 0;
      if (byState) closedByState.current -= 1;
      // `close` llega en una tarea aparte: si el diálogo ya se reabrió (Esc y M seguidas), es un
      // cierre antiguo y no debe cerrar el diálogo nuevo.
      if (d.open) return;
      if (!byState) onClose();
      const el = returnTo.current;
      if (el && document.contains(el)) el.focus();
    };
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    d.addEventListener('close', onCloseEvt);
    d.addEventListener('cancel', onCancel);
    return () => {
      d.removeEventListener('close', onCloseEvt);
      d.removeEventListener('cancel', onCancel);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cx(
        'panel-solid m-auto max-h-[92dvh] w-[calc(100%-24px)] overflow-hidden p-0 text-ink backdrop:bg-black/70',
        full ? 'max-w-[1200px]' : wide ? 'max-w-3xl' : 'max-w-xl',
        className,
      )}
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
            <h2 className="font-heading text-[length:var(--fs-h3)] font-bold">{title}</h2>
            <button
              type="button"
              className="btn btn-subtle btn-icon"
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <X size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </header>
          {/* `data-lenis-prevent`: la rueda desplaza este panel y no la página (Lenis no la captura). */}
          <div
            className="scroll-area min-h-0 flex-1 px-5 py-4"
            data-lenis-prevent=""
            data-dialog-body=""
          >
            {children}
          </div>
        </div>
      )}
    </dialog>
  );
}
