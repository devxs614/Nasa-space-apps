import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Machine } from '../../data/types';
import { BeatShell } from './BeatShell';
import { ScriptLines } from './ScriptLines';
import { FactCard } from './FactCard';
import { useAppStore } from '../../state/useAppStore';

gsap.registerPlugin(SplitText);

/** "Quién soy": nombre gigante con SplitText, tipo, pieza clave y ficha técnica (Parte 8.2). */
export function BeatIdentity({ machine }: { machine: Machine }) {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  const reduced = useAppStore((s) => s.reducedMotion);
  const title = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = title.current;
    if (!el || reduced) return;
    const split = new SplitText(el, { type: 'chars', charsClass: 'inline-block' });
    const tween = gsap.from(split.chars, {
      yPercent: 120,
      rotateX: -80,
      opacity: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.03,
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, [reduced, locale]);

  const sheet = machine.facts.filter((f) => !f.pending && typeof f.value === 'number').slice(0, 3);
  return (
    <BeatShell machine={machine} beat="identity" wide>
      <p
        ref={title}
        aria-hidden="true"
        className="font-heading text-[clamp(2.4rem,7vw,6rem)] leading-none font-black break-words uppercase"
        style={{ perspective: 600 }}
      >
        {(machine.shortName ?? machine.name)[locale]}
      </p>
      <p className="font-mono text-[0.875rem] text-ink-dim">
        {t(`common:types.${machine.type}`)} · {machine.body[locale]} · {t('beat.keyPart')}:{' '}
        <span className="text-signal">{machine.keyPart[locale]}</span>
      </p>
      <div className="max-w-[600px] space-y-4">
        <ScriptLines machine={machine} beat="identity" />
      </div>
      {sheet.length > 0 && (
        <section aria-label={t('beat.factSheet')} className="grid gap-3 sm:grid-cols-3">
          {sheet.map((f) => (
            <FactCard key={f.id} fact={f} showText={false} />
          ))}
        </section>
      )}
    </BeatShell>
  );
}
