import { useTranslation } from 'react-i18next';
import type { Fact } from '../../data/types';
import { Card3D } from '../ui/Card3D';
import { SourceBadge } from '../ui/SourceBadge';
import { factValue } from '../../lib/resolve';
import { useAppStore } from '../../state/useAppStore';

export interface FactCardProps {
  fact: Fact;
  showText?: boolean;
}

/** Tarjeta de dato verificado. Un dato `pending` nunca se renderiza (Parte 11). */
export function FactCard({ fact, showText = true }: FactCardProps) {
  const locale = useAppStore((s) => s.locale);
  useTranslation('ui');
  if (fact.pending) return null;
  return (
    <Card3D className="p-4">
      <dl>
        <dt className="font-mono text-[0.8125rem] tracking-wider text-ink-dim uppercase">
          {fact.label[locale]}
        </dt>
        <dd className="mt-1 font-mono text-[1.6rem] leading-tight text-amber tabular">
          {fact.approx && <span aria-hidden="true">≈ </span>}
          {factValue(fact, locale)}
        </dd>
        {showText && fact.text && (
          <dd className="mt-2 text-[0.9375rem] text-ink-dim">{fact.text[locale]}</dd>
        )}
      </dl>
      <SourceBadge sourceIds={fact.sourceIds} approx={fact.approx} className="mt-3" />
    </Card3D>
  );
}
