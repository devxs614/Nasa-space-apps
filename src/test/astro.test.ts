import { describe, expect, it } from 'vitest';
import { julianDay, lightTime, normalizeDeg180, solveKepler } from '../lib/astro';
import { signalPlayback } from '../lib/signal';
import { diffYMD, formatLightTime, formatLatLon } from '../lib/format';
import { latLonToVector3, normalizeLon, vector3ToLatLon } from '../lib/coords';

const noon = (d: string) => new Date(`${d}T12:00:00Z`);
const near = (value: number | null | undefined, expected: number, tol = 0.005) => {
  expect(value).not.toBeNull();
  expect(Math.abs((value as number) - expected) / expected).toBeLessThan(tol);
};

describe('astro', () => {
  it('día juliano de J2000', () => {
    expect(julianDay(new Date('2000-01-01T12:00:00Z'))).toBeCloseTo(2451545.0, 6);
  });
  it('resuelve la ecuación de Kepler', () => {
    for (const [M, e] of [
      [1, 0.1],
      [3, 0.9],
      [0.5, 0],
    ] as const) {
      const E = solveKepler(M, e);
      expect(Math.abs(E - e * Math.sin(E) - M)).toBeLessThan(1e-12);
    }
    expect(solveKepler(1, 0.1)).toBeCloseTo(1.0885977524, 9);
  });
  it('normaliza ángulos', () => {
    expect(normalizeDeg180(190)).toBeCloseTo(-170);
    expect(normalizeDeg180(-190)).toBeCloseTo(170);
  });
  it('Luna', () => {
    expect(lightTime('moon').seconds).toBeCloseTo(1.2842, 3);
  });
  it.each<[string, number]>([
    ['1976-07-20', 1140.6],
    ['1997-07-04', 638.3],
    ['2004-01-04', 570.2],
    ['2004-01-25', 665.3],
    ['2008-05-25', 918.2],
    ['2018-11-26', 486.1],
    ['2021-04-19', 960.5],
    ['2026-11-14', 658.7],
    ['2027-02-19', 338.3],
  ])('Marte el %s', (d, s) => near(lightTime('mars', noon(d)).seconds, s));
  it.each<[string, number]>([
    ['2001-02-12', 1060.6],
    ['2026-11-14', 1237.7],
  ])('Eros el %s', (d, s) => near(lightTime('eros', noon(d)).seconds, s));
  it('Ceres da un rango', () => {
    const r = lightTime('ceres').range;
    expect(r).toBeDefined();
    near(r![0], 873.26);
    near(r![1], 1888.23);
  });
  it('Pioneer en la fecha de referencia', () => {
    const t0 = new Date('2026-11-14T00:00:00Z');
    near(lightTime('pioneer10', t0).seconds, 70359.7);
    near(lightTime('pioneer11', t0).seconds, 59082.2);
  });
  it('Kepler está apagado', () => {
    const r = lightTime('kepler');
    expect(r.seconds).toBeNull();
    expect(r.method).toBe('off');
  });
});

describe('señal y formato', () => {
  it('compresión de tiempo', () => {
    expect(signalPlayback(1.2842)).toMatchObject({ realTime: true, compression: 1 });
    expect(signalPlayback(658.7)).toEqual({ durationMs: 3000, compression: 220, realTime: false });
    expect(signalPlayback(70359.7).compression).toBe(23453);
  });
  it('tiempo de luz legible', () => {
    expect(formatLightTime(1.2842, 'es')).toBe('1,28 s');
    expect(formatLightTime(1.2842, 'en')).toBe('1.28 s');
    expect(formatLightTime(658.7, 'es')).toBe('10 min 59 s');
    expect(formatLightTime(959.7, 'es')).toBe('16 min 0 s');
    expect(formatLightTime(70359.7, 'es')).toBe('19 h 33 min');
  });
  it('tiempo en silencio', () => {
    const ref = new Date('2026-11-14T00:00:00Z');
    expect(diffYMD('2018-06-10', ref)).toEqual({ years: 8, months: 5, days: 4 });
    expect(diffYMD('2018-11-15', ref)).toEqual({ years: 7, months: 11, days: 30 });
    expect(diffYMD('2003-01-23', ref)).toEqual({ years: 23, months: 9, days: 22 });
  });
  it('coordenadas en pantalla', () => {
    expect(formatLatLon(-3.01, -23.42, 'es')).toBe('3,01° S · 23,42° O');
    expect(formatLatLon(-3.01, -23.42, 'en')).toBe('3.01° S · 23.42° W');
  });
});

describe('coordenadas', () => {
  it('latLonToVector3 (Parte 9.4)', () => {
    const a = latLonToVector3(0, 0, 5);
    expect(a.x).toBeCloseTo(5);
    expect(a.y).toBeCloseTo(0);
    expect(a.z).toBeCloseTo(0);
    const b = latLonToVector3(90, 0, 5);
    expect(b.x).toBeCloseTo(0);
    expect(b.y).toBeCloseTo(5);
    expect(b.z).toBeCloseTo(0);
    const c = latLonToVector3(0, 90, 5);
    expect(c.x).toBeCloseTo(0);
    expect(c.y).toBeCloseTo(0);
    expect(c.z).toBeCloseTo(-5);
  });
  it('ida y vuelta lat/lon', () => {
    const v = latLonToVector3(22.483, -47.94, 5);
    const r = vector3ToLatLon(v);
    expect(r.lat).toBeCloseTo(22.483, 6);
    expect(r.lon).toBeCloseTo(-47.94, 6);
  });
  it('normalizeLon', () => {
    expect(normalizeLon(336.66)).toBeCloseTo(-23.34, 6);
  });
});
