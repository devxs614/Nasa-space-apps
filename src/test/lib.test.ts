import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRng, shuffle } from '../lib/rng';
import { __resetStorageProbe, readJSON, safeStorage, writeJSON } from '../lib/storage';

describe('rng', () => {
  it('misma semilla, misma secuencia', () => {
    const a = createRng(42);
    const b = createRng(42);
    const sa = Array.from({ length: 5 }, a);
    const sb = Array.from({ length: 5 }, b);
    expect(sa).toEqual(sb);
    expect(sa.every((x) => x >= 0 && x < 1)).toBe(true);
  });
  it('baraja sin perder elementos', () => {
    const out = shuffle(['a', 'b', 'c', 'd'], createRng(7));
    expect([...out].sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    __resetStorageProbe();
  });
  it('guarda y lee JSON', () => {
    writeJSON('k', { a: 1 });
    expect(readJSON('k', null)).toEqual({ a: 1 });
  });
  it('sigue funcionando en memoria si localStorage lanza', () => {
    __resetStorageProbe();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    safeStorage.setItem('x', '1');
    expect(safeStorage.getItem('x')).toBe('1');
  });
});
