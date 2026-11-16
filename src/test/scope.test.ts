import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class Param {
  setTargetAtTime = vi.fn();
}
class Node {
  gain = new Param();
  connect = vi.fn((n: unknown) => n);
  disconnect = vi.fn();
}
const ctx = { currentTime: 0, createGain: () => new Node() };
let enabled = true;
let voices = 0;

vi.mock('../audio/AudioEngine', () => ({
  AudioEngine: {
    get context() {
      return enabled ? ctx : null;
    },
    get rawContext() {
      return ctx;
    },
    out: () => new Node(),
    acquireVoice: () => {
      voices += 1;
      return true;
    },
    releaseVoice: () => {
      voices -= 1;
    },
  },
}));

const { createScope, activeLoops } = await import('../audio/scope');

/** Voz de prueba: una fuente con `stop` espiable. */
function voice(seconds?: number) {
  const stop = vi.fn();
  const fn = vi.fn(() => ({
    sources: [{ stop } as unknown as AudioScheduledSourceNode],
    nodes: [new Node() as unknown as AudioNode],
    seconds,
    params: { freq: new Param() as unknown as AudioParam },
  }));
  return { fn, stop };
}

beforeEach(() => {
  enabled = true;
  voices = 0;
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('alcance de sonido', () => {
  it('un bucle cuenta hasta que se para con su mango', () => {
    const scope = createScope('a');
    const v = voice();
    const handle = scope.loop(v.fn);
    expect(handle.playing).toBe(true);
    expect(activeLoops()).toBe(1);
    handle.stop();
    expect(v.stop).toHaveBeenCalledTimes(1);
    expect(handle.playing).toBe(false);
    expect(activeLoops()).toBe(0);
    handle.stop(); // parar dos veces no hace nada
    expect(v.stop).toHaveBeenCalledTimes(1);
    scope.dispose();
  });

  it('stopAll y dispose dejan cero bucles; tras dispose no suena nada', () => {
    const scope = createScope('b');
    const a = voice();
    const b = voice();
    scope.loop(a.fn);
    scope.loop(b.fn);
    expect(scope.activeLoops).toBe(2);
    scope.stopAll();
    expect(scope.activeLoops).toBe(0);
    expect(a.stop).toHaveBeenCalled();
    expect(b.stop).toHaveBeenCalled();
    scope.dispose();
    const c = voice();
    expect(scope.loop(c.fn).playing).toBe(false);
    expect(c.fn).not.toHaveBeenCalled();
  });

  it('un efecto corto se apaga solo en 1,5 s como mucho y libera su voz', () => {
    const scope = createScope('c');
    const v = voice(9); // aunque diga durar 9 s
    scope.play(v.fn);
    expect(voices).toBe(1);
    expect(scope.activeLoops).toBe(0); // un efecto no es un bucle
    vi.advanceTimersByTime(1700);
    expect(v.stop).toHaveBeenCalledTimes(1);
    expect(voices).toBe(0);
    scope.dispose();
  });

  it('stopLoops para los bucles y deja terminar el efecto del final', () => {
    const scope = createScope('d');
    const loop = voice();
    const shot = voice(0.3);
    scope.loop(loop.fn);
    scope.play(shot.fn);
    scope.stopLoops();
    expect(loop.stop).toHaveBeenCalled();
    expect(shot.stop).not.toHaveBeenCalled();
    scope.dispose();
  });

  it('un sonido con duración se retira solo al acabar', () => {
    const scope = createScope('e');
    scope.loop(voice(2).fn);
    expect(scope.activeLoops).toBe(1);
    vi.advanceTimersByTime(2200);
    expect(scope.activeLoops).toBe(0);
    scope.dispose();
  });

  it('con el sonido apagado no crea nada y el mango es inofensivo', () => {
    enabled = false;
    const scope = createScope('f');
    const v = voice();
    const handle = scope.loop(v.fn);
    scope.play(v.fn);
    expect(v.fn).not.toHaveBeenCalled();
    expect(handle.playing).toBe(false);
    handle.set('freq', 440);
    handle.stop();
    scope.dispose();
  });
});
