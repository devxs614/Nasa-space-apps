import { useEffect, useMemo, useState } from 'react';
import { lightTime, type LightTarget, type LightTimeResult } from '../lib/astro';

/** atIso fija la fecha (interacciones históricas, como Sojourner en 1997); sin ella, se actualiza cada segundo. */
export function useLightTime(target: LightTarget, atIso?: string): LightTimeResult {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (atIso) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [atIso]);
  return useMemo(
    () => lightTime(target, atIso ? new Date(atIso) : new Date(now)),
    [target, atIso, now],
  );
}
