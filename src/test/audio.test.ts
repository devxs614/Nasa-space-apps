import { afterEach, describe, expect, it, vi } from 'vitest';

class FakeParam {
  value = 0;
  calls: [string, ...number[]][] = [];
  setValueAtTime(v: number, t: number) {
    this.calls.push(['set', v, t]);
  }
  setTargetAtTime(v: number, t: number, tc: number) {
    this.calls.push(['target', v, t, tc]);
  }
  exponentialRampToValueAtTime(v: number, t: number) {
    this.calls.push(['exp', v, t]);
  }
  cancelScheduledValues() {}
  cancelAndHoldAtTime() {}
  setValueCurveAtTime() {}
}
class FakeNode {
  gain = new FakeParam();
  frequency = new FakeParam();
  Q = new FakeParam();
  threshold = new FakeParam();
  ratio = new FakeParam();
  delayTime = new FakeParam();
  connect<T>(n: T) {
    return n;
  }
  disconnect() {}
  start() {}
  stop() {}
}
let created = 0;
class FakeContext {
  currentTime = 1;
  state = 'running';
  sampleRate = 8000;
  destination = new FakeNode();
  constructor() {
    created++;
  }
  createGain() {
    return new FakeNode();
  }
  createDynamicsCompressor() {
    return new FakeNode();
  }
  createOscillator() {
    return new FakeNode();
  }
  createBiquadFilter() {
    return new FakeNode();
  }
  createDelay() {
    return new FakeNode();
  }
  createBuffer(_c: number, len: number) {
    return { getChannelData: () => new Float32Array(len) };
  }
  createBufferSource() {
    return new FakeNode();
  }
  resume() {
    return Promise.resolve();
  }
  suspend() {
    return Promise.resolve();
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  created = 0;
});

describe('audio', () => {
  it('no crea ningún AudioContext antes de un gesto (init)', async () => {
    vi.stubGlobal('AudioContext', FakeContext);
    const { AudioEngine } = await import('../audio/AudioEngine');
    const sfx = await import('../audio/sfx');
    sfx.tick();
    sfx.send();
    expect(created).toBe(0);
    expect(AudioEngine.context).toBeNull();
    await AudioEngine.init();
    expect(created).toBe(1);
  });
  it('el interruptor general silencia en menos de 300 ms', async () => {
    vi.stubGlobal('AudioContext', FakeContext);
    const { AudioEngine } = await import('../audio/AudioEngine');
    await AudioEngine.init();
    AudioEngine.setEnabled(true);
    const master = (AudioEngine as unknown as { master: FakeNode }).master;
    AudioEngine.setEnabled(false);
    const last = master.gain.calls.at(-1)!;
    expect(last[0]).toBe('target');
    expect(last[1]).toBe(0);
    // setTargetAtTime llega al 99 % en ~4,6 constantes de tiempo.
    expect((last[3] ?? 1) * 4.6).toBeLessThan(0.3);
    expect(AudioEngine.context).toBeNull();
  });
  it('playSfx no hace nada con el sonido apagado', async () => {
    vi.stubGlobal('AudioContext', FakeContext);
    const { useAppStore } = await import('../state/useAppStore');
    const { playSfx } = await import('../audio/play');
    useAppStore.setState({ soundOn: false });
    playSfx('send');
    await new Promise((r) => setTimeout(r, 20));
    expect(created).toBe(0);
  });
});
