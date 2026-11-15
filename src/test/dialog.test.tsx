import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { Dialog } from '../components/ui/Dialog';

/**
 * En el navegador, `close()` dispara el evento `close` en una tarea aparte. Aquí se imita con un
 * temporizador para reproducir la carrera "Esc y, enseguida, M" del índice de capítulos.
 */
const proto = HTMLDialogElement.prototype;
const original = { showModal: proto.showModal, close: proto.close };

beforeEach(() => {
  vi.useFakeTimers();
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    setTimeout(() => this.dispatchEvent(new Event('close')), 0);
  };
});
afterEach(() => {
  vi.useRealTimers();
  proto.showModal = original.showModal;
  proto.close = original.close;
});

const flush = () => act(() => void vi.runAllTimers());

function setup(onClose = vi.fn()) {
  const ui = (open: boolean) => (
    <>
      <button type="button">Índice</button>
      <Dialog open={open} onClose={onClose} title="Índice de capítulos">
        <p>Contenido</p>
      </Dialog>
    </>
  );
  const view = render(ui(false));
  const trigger = view.getByRole('button', { name: 'Índice' });
  const dialog = view.container.querySelector('dialog')!;
  return { onClose, trigger, dialog, set: (open: boolean) => view.rerender(ui(open)) };
}

describe('Dialog', () => {
  it('al cerrarse devuelve el foco al disparador sin volver a llamar a onClose', () => {
    const { onClose, trigger, dialog, set } = setup();
    trigger.focus();
    set(true);
    expect(dialog.open).toBe(true);
    set(false);
    flush();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('si se reabre antes de que llegue el evento close, el diálogo sigue abierto', () => {
    const { onClose, trigger, dialog, set } = setup();
    trigger.focus();
    set(true);
    set(false); // Esc: el estado ya es "cerrado" y el evento close queda en cola
    set(true); // M: se reabre antes de que llegue ese evento
    flush();
    expect(dialog.open).toBe(true);
    expect(dialog).toHaveTextContent('Contenido');
    expect(onClose).not.toHaveBeenCalled();
    // El siguiente cierre sigue devolviendo el foco al disparador original.
    set(false);
    flush();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('un cierre nativo que no pasó por el estado avisa con onClose', () => {
    const { onClose, dialog, set } = setup();
    set(true);
    dialog.close();
    flush();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Esc (evento cancel) pide el cierre sin cerrar por su cuenta', () => {
    const { onClose, dialog, set } = setup();
    set(true);
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog.open).toBe(true);
  });
});
