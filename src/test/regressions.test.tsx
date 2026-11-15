import { describe, expect, it, vi } from 'vitest';
import { Profiler, useEffect, useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { lazyPage } from '../lib/loadable';
import { MissionClock } from '../components/hud/MissionClock';

/*
 * Regresión de la portada atascada en "Sintonizando…" (DECISIONS.md, 2026-11-15). Con `React.lazy`,
 * lo que llega en diferido se monta en un render de baja prioridad que cualquier actualización
 * reinicia: si montar la página tarda más que el intervalo entre actualizaciones (el reloj UTC, cada
 * segundo), no termina nunca. Con este mismo montaje caro, `React.lazy` no aparece en 4 s.
 */

function Slow() {
  const end = performance.now() + 25;
  while (performance.now() < end) {
    // render caro, como La Travesía en un equipo lento
  }
  return <i />;
}

function HeavyPage() {
  return (
    <div>
      {Array.from({ length: 30 }, (_, i) => (
        <Slow key={i} />
      ))}
      <p>montada</p>
    </div>
  );
}

/** Actualiza React cada 100 ms, más a menudo de lo que tarda en montarse la página. */
function Ticker() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((x) => x + 1), 100);
    return () => clearInterval(id);
  }, []);
  return <span>{n}</span>;
}

describe('portada en equipos lentos', () => {
  it('una página en diferido se monta aunque React se actualice sin parar', async () => {
    const Page = lazyPage(() => Promise.resolve(HeavyPage));
    render(
      <>
        <Ticker />
        <Page />
      </>,
    );
    await waitFor(() => expect(screen.getByText('montada')).toBeInTheDocument(), {
      timeout: 4000,
    });
  }, 10_000);

  it('el reloj UTC no actualiza React cada segundo', () => {
    vi.useFakeTimers();
    try {
      let commits = 0;
      const { container } = render(
        <Profiler id="clock" onRender={() => (commits += 1)}>
          <MissionClock mode="utc" />
        </Profiler>,
      );
      const before = commits;
      const first = container.textContent;
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(commits).toBe(before);
      expect(container.textContent).not.toBe(first); // la hora sí avanza, escrita en el DOM
    } finally {
      vi.useRealTimers();
    }
  });
});

const domSources = import.meta.glob<string>(
  ['../App.tsx', '../components/**/*.tsx', '../routes/**/*.tsx', '../lib/**/*.{ts,tsx}'],
  { query: '?raw', import: 'default', eager: true },
);

describe('carga en diferido', () => {
  it('el árbol del DOM no usa React.lazy (solo lazyPage y loadable)', () => {
    const offenders = Object.entries(domSources)
      .filter(([, src]) => /import\s*{[^}]*\blazy\b[^}]*}\s*from\s*'react'/.test(src))
      .map(([name]) => name);
    expect(Object.keys(domSources).length).toBeGreaterThan(40);
    expect(offenders).toEqual([]);
  });
});
