import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import i18n from '../i18n';
import { InteractionShell } from '../components/interactions/InteractionShell';
import { Shell, useDone } from '../components/interactions/Shell';
import { META } from '../components/interactions/meta';
import type { InteractionProps } from '../components/interactions/types';
import { activeLoops } from '../audio/scope';
import { useAppStore } from '../state/useAppStore';

let mounts = 0;
let lastApi: InteractionProps['api'] | null = null;

/** Actividad de prueba con el contrato v2: un botón para ganar y otro para fallar. */
function Fake({ api }: InteractionProps) {
  mounts += 1;
  lastApi = api;
  return (
    <div>
      <button type="button" onClick={() => api.succeed({ detail: 'bien hecho' })}>
        ganar
      </button>
      <button type="button" onClick={() => api.fail('ixm.near.fail', { speed: '19,0' })}>
        fallar
      </button>
      <button type="button" onClick={() => api.setStep(2)}>
        paso dos
      </button>
    </div>
  );
}

/** Actividad con el contrato anterior: termina con `useDone` y el `Shell` de compatibilidad. */
function Old({ onComplete }: InteractionProps) {
  const { done, finish } = useDone(onComplete);
  return (
    <Shell done={done} successText="dato real">
      <button type="button" onClick={() => finish()}>
        terminar
      </button>
    </Shell>
  );
}

function setup(Interaction = Fake, onDone = vi.fn()) {
  render(
    <InteractionShell
      machineId="near"
      active
      reducedMotion={false}
      meta={META.near}
      Interaction={Interaction}
      onDone={onDone}
    />,
  );
  return onDone;
}
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));

beforeEach(async () => {
  await i18n.changeLanguage('es');
  useAppStore.setState({ locale: 'es', hotkeysOn: true });
  mounts = 0;
  lastApi = null;
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('InteractionShell', () => {
  it('muestra el objetivo y "Cómo se juega" antes de empezar, sin montar la actividad', () => {
    setup();
    expect(screen.getByText('Toca Eros a 7 km/h o menos.')).toBeInTheDocument();
    expect(screen.getByText('Cómo se juega')).toBeInTheDocument();
    expect(screen.getByText('Ratón')).toBeInTheDocument();
    expect(screen.getByText('Teclado')).toBeInTheDocument();
    expect(mounts).toBe(0);
  });

  it('al empezar muestra el paso, y la pista aparece a los 6 s y se va al actuar', () => {
    setup();
    click('Empezar');
    expect(screen.getAllByText(/Paso 1 de 2 · Mira la velocidad/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^Pista:/)).toBeNull();
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getAllByText(/^Pista: Mantén pulsado el botón cian/).length).toBeGreaterThan(0);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'ganar' }));
    expect(screen.queryByText(/^Pista:/)).toBeNull();
    click('paso dos');
    expect(
      screen.getAllByText(/Paso 2 de 2 · Mantén la velocidad en la zona verde/).length,
    ).toBeGreaterThan(0);
  });

  it('tras fallar, "Intentar de nuevo" vuelve a la tarjeta inicial y monta la actividad desde cero', () => {
    setup();
    click('Empezar');
    click('fallar');
    expect(screen.getByText('Esta vez no')).toBeInTheDocument();
    expect(screen.getAllByText(/Tocaste a 19,0 km\/h: demasiado rápido/).length).toBeGreaterThan(0);
    click('Intentar de nuevo');
    expect(screen.getByText('Cómo se juega')).toBeInTheDocument();
    click('Empezar');
    expect(mounts).toBeGreaterThanOrEqual(2);
  });

  it('un solo final por intento: después de fallar no se puede ganar', () => {
    const onDone = setup();
    click('Empezar');
    click('fallar');
    act(() => lastApi?.succeed({ detail: 'tarde' }));
    expect(screen.queryByText('Misión cumplida')).toBeNull();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('"Reiniciar" deja la actividad como recién cargada: sin temporizadores ni sonidos', () => {
    setup();
    click('Empezar');
    const dispose = vi.spyOn(lastApi!.sound, 'dispose');
    expect(vi.getTimerCount()).toBeGreaterThan(0); // el contador de la pista
    click('Reiniciar');
    expect(dispose).toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(200); // vacía las tareas internas de React
    });
    expect(vi.getTimerCount()).toBe(0);
    expect(activeLoops()).toBe(0);
    expect(screen.getByText('Cómo se juega')).toBeInTheDocument();
  });

  it('la tecla R reinicia con el foco dentro de la actividad', () => {
    setup();
    click('Empezar');
    fireEvent.keyDown(screen.getByRole('button', { name: 'ganar' }), { key: 'r' });
    expect(screen.getByText('Cómo se juega')).toBeInTheDocument();
  });

  it('ganar muestra "Misión cumplida", avisa una vez y ofrece jugar de nuevo', () => {
    const onDone = setup();
    click('Empezar');
    click('ganar');
    expect(screen.getByText('Misión cumplida')).toBeInTheDocument();
    expect(screen.getByText('bien hecho')).toBeInTheDocument();
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledWith('success');
    expect(screen.getByRole('button', { name: 'Jugar de nuevo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seguir con la historia' })).toBeInTheDocument();
  });

  it('"Saltar" deja seguir el relato sin terminar la actividad', () => {
    const onDone = setup();
    click('Saltar');
    expect(onDone).toHaveBeenCalledWith('skip');
  });

  it('una actividad con el contrato anterior termina en el panel de resultado', () => {
    const onDone = setup(Old);
    click('Empezar');
    click('terminar');
    expect(screen.getByText('Misión cumplida')).toBeInTheDocument();
    expect(screen.getByText('dato real')).toBeInTheDocument();
    expect(onDone).toHaveBeenCalledWith('success');
  });

  it('las 15 actividades tienen objetivo, controles, pasos y pistas en los dos idiomas', async () => {
    for (const lng of ['es', 'en'] as const) {
      await i18n.changeLanguage(lng);
      for (const meta of Object.values(META)) {
        const keys = [
          meta.titleKey,
          meta.goalKey,
          meta.realKey,
          ...Object.values(meta.controls),
          ...meta.stepKeys,
          ...meta.hintKeys,
        ];
        expect(meta.stepKeys).toHaveLength(meta.steps);
        for (const key of keys) expect(i18n.exists(key, { ns: 'ui' }), `${lng} ${key}`).toBe(true);
      }
    }
  });
});
