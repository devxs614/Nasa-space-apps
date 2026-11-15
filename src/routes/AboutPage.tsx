import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageShell } from '../components/layout/PageShell';
import { VoiceLine } from '../components/chapter/VoiceLine';
import { NasaImage } from '../components/media/NasaImage';
import { Poster } from '../components/media/Poster';
import { Badge } from '../components/ui/Badge';
import { REPO_URL } from '../components/layout/Footer';
import { MACHINES_BY_ID } from '../data/machines';
import { resolveRef } from '../lib/resolve';
import { useAppStore } from '../state/useAppStore';
import { useHashScroll } from '../hooks/useHashScroll';

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`about-${id}`}
      tabIndex={-1}
      className="scroll-mt-20 outline-none"
    >
      <h2 id={`about-${id}`} className="mb-3 font-heading text-[length:var(--fs-h2)] font-bold">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Example({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="rounded-card border border-line p-4">
      <p className="mb-3 text-[0.9375rem] text-ink-dim">{label}</p>
      {children}
    </li>
  );
}

/** Acerca de (Parte 8.12): el reto, el código visual de hecho y ficción, el equipo, la IA y los créditos. */
export function AboutPage() {
  const { t } = useTranslation(['ui', 'chapters']);
  const locale = useAppStore((s) => s.locale);
  useHashScroll();
  const opportunity = MACHINES_BY_ID.opportunity;
  const fact = resolveRef(MACHINES_BY_ID.ingenuity, 'facts.firstFlight', locale);
  const sections: [string, string][] = [
    ['reto', t('about.challenge')],
    ['codigo', t('about.code')],
    ['equipo', t('about.team')],
    ['ia', t('about.ai')],
    ['creditos', t('about.credits')],
    ['privacidad', t('about.privacy')],
  ];

  return (
    <PageShell title={t('about.title')} intro={<p>{t('about.intro')}</p>}>
      <nav aria-labelledby="about-toc" className="no-print mb-12">
        <h2
          id="about-toc"
          className="mb-2 font-mono text-[0.8125rem] tracking-[0.2em] text-ink-dim uppercase"
        >
          {t('about.contents')}
        </h2>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {sections.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="inline-flex min-h-11 items-center">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-16">
        <Block id="reto" title={t('about.challenge')}>
          <p className="reading-col">{t('about.challengeText')}</p>
          <p className="reading-col text-ink-dim">{t('footer.disclaimer')}</p>
          <p className="reading-col text-ink-dim">{t('about.nasaNote')}</p>
        </Block>

        <Block id="codigo" title={t('about.code')}>
          <p className="reading-col">{t('about.codeIntro')}</p>
          <ul className="grid gap-4 md:grid-cols-2">
            <Example label={t('about.examples.machine')}>
              <VoiceLine speaker="machine" text={t('chapters:prologue.exampleMachine')} />
            </Example>
            <Example label={t('about.examples.lumi')}>
              <VoiceLine speaker="lumi" lumiFull text={t('chapters:prologue.exampleLumi')} />
              <p className="mt-3 text-[0.9375rem] text-ink-dim">{t('about.lumiWho')}</p>
            </Example>
            <Example label={t('about.examples.log')}>
              {fact && (
                <VoiceLine
                  speaker="log"
                  text={fact.text}
                  sourceIds={fact.sourceIds}
                  approx={fact.approx}
                />
              )}
            </Example>
            <Example label={t('about.examples.photo')}>
              {opportunity.imageQueries[0] && (
                <NasaImage
                  query={opportunity.imageQueries[0]}
                  alt={opportunity.today.text[locale]}
                  poster={opportunity.id}
                />
              )}
            </Example>
            <Example label={t('about.examples.render')}>
              <Poster name="scene-mars" alt="" />
              <Badge tone="render" className="mt-3">
                {t('badge.render3d')}
              </Badge>
            </Example>
            <Example label={t('about.examples.sonification')}>
              <div className="flex flex-wrap gap-2">
                <Badge tone="sonification">{t('badge.sonification')}</Badge>
                <Badge tone="info">{t('badge.synthetic')}</Badge>
              </div>
            </Example>
          </ul>
        </Block>

        <Block id="equipo" title={t('about.team')}>
          <p className="reading-col">{t('about.teamText')}</p>
          <p>
            <a href={`${REPO_URL}/graphs/contributors`} target="_blank" rel="noopener noreferrer">
              {t('about.contributors')}
            </a>
          </p>
        </Block>

        <Block id="ia" title={t('about.ai')}>
          <p className="reading-col font-bold">{t('about.aiText')}</p>
          <p className="reading-col">{t('about.aiDetails')}</p>
          <p>
            <a
              href={`${REPO_URL}/blob/main/AI_DISCLOSURE.md`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('about.aiFile')}
            </a>
          </p>
        </Block>

        <Block id="creditos" title={t('about.credits')}>
          <p className="reading-col">{t('about.creditsText')}</p>
          <ul className="space-y-1">
            <li>
              <Link to="/fuentes">{t('settings.toSources')}</Link>
            </li>
            <li>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                {t('about.repoNewTab')}
              </a>
            </li>
          </ul>
        </Block>

        <Block id="privacidad" title={t('about.privacy')}>
          <p className="reading-col">{t('about.privacyText')}</p>
        </Block>
      </div>
    </PageShell>
  );
}
