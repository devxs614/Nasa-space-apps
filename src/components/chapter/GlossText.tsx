import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GLOSSARY_MATCH, type GlossaryId } from '../../data/glossary';
import type { Locale } from '../../data/types';
import { Popover } from '../ui/Popover';

const cache = new Map<Locale, { re: RegExp; byWord: Map<string, GlossaryId> }>();
function matcher(locale: Locale) {
  let m = cache.get(locale);
  if (m) return m;
  const byWord = new Map<string, GlossaryId>();
  for (const [id, forms] of Object.entries(GLOSSARY_MATCH) as [
    GlossaryId,
    { es: string[]; en: string[] },
  ][]) {
    forms[locale].forEach((w) => byWord.set(w.toLowerCase(), id));
  }
  const words = [...byWord.keys()]
    .sort((a, b) => b.length - a.length)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  m = {
    re: new RegExp(`(?<![\\p{L}\\p{N}])(${words.join('|')})(?![\\p{L}\\p{N}])`, 'giu'),
    byWord,
  };
  cache.set(locale, m);
  return m;
}

function GlossTerm({ id, children }: { id: GlossaryId; children: string }) {
  const { t } = useTranslation('glossary');
  return (
    <Popover title={t(`${id}.term`)} trigger={children} triggerClassName="gloss">
      <p className="font-bold text-signal">{t(`${id}.term`)}</p>
      <p className="mt-1">{t(`${id}.def`)}</p>
    </Popover>
  );
}

export interface GlossTextProps {
  text: string;
  locale: Locale;
  enabled?: boolean;
}

/** Subraya con puntos la primera aparición de cada término del glosario (Parte 17.5). */
export function GlossText({ text, locale, enabled = true }: GlossTextProps) {
  const parts = useMemo(() => {
    if (!enabled) return [text];
    const { re, byWord } = matcher(locale);
    const seen = new Set<GlossaryId>();
    const out: (string | { id: GlossaryId; word: string })[] = [];
    let last = 0;
    for (const match of text.matchAll(re)) {
      const word = match[0];
      const id = byWord.get(word.toLowerCase());
      if (!id || seen.has(id) || match.index === undefined) continue;
      seen.add(id);
      out.push(text.slice(last, match.index), { id, word });
      last = match.index + word.length;
    }
    out.push(text.slice(last));
    return out;
  }, [text, locale, enabled]);
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <Fragment key={i}>{p}</Fragment>
        ) : (
          <GlossTerm key={i} id={p.id}>
            {p.word}
          </GlossTerm>
        ),
      )}
    </>
  );
}
