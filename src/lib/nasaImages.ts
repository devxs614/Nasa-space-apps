/** Cliente de images-api.nasa.gov (sin clave), con caché y tiempo límite (Partes 6.7 y 16.7). */
export interface NasaImageItem {
  nasaId: string;
  title: string;
  date: string;
  credit: string;
  src: string;
  page: string;
}

const API = 'https://images-api.nasa.gov/search';
const cache = new Map<string, Promise<NasaImageItem | null>>();
const THIRD_PARTY = /©|copyright|courtesy of (?!nasa)/i;

interface ApiItem {
  data?: {
    nasa_id?: string;
    title?: string;
    date_created?: string;
    center?: string;
    photographer?: string;
    secondary_creator?: string;
    description?: string;
    media_type?: string;
  }[];
  links?: { href?: string; render?: string }[];
}

export function fetchNasaImage(query: string, timeoutMs = 4000): Promise<NasaImageItem | null> {
  let p = cache.get(query);
  if (p) return p;
  p = (async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const url = `${API}?q=${encodeURIComponent(query)}&media_type=image&page_size=12`;
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) return null;
      const json = (await res.json()) as { collection?: { items?: ApiItem[] } };
      for (const it of json.collection?.items ?? []) {
        const d = it.data?.[0];
        const href = it.links?.find((l) => l.render === 'image' || l.href)?.href;
        if (!d?.nasa_id || !href) continue;
        const who = `${d.photographer ?? ''} ${d.secondary_creator ?? ''} ${d.description ?? ''}`;
        if (THIRD_PARTY.test(who)) continue; // derechos de terceros: se descarta
        return {
          nasaId: d.nasa_id,
          title: d.title ?? d.nasa_id,
          date: (d.date_created ?? '').slice(0, 10),
          credit: ['NASA', d.center, d.photographer].filter(Boolean).join(' · '),
          src: href.replace('~thumb', '~medium'),
          page: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`,
        };
      }
      return null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  })();
  cache.set(query, p);
  return p;
}
