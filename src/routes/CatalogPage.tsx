import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Box, RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { Card3D } from '../components/ui/Card3D';
import { Poster } from '../components/media/Poster';
import { Badge } from '../components/ui/Badge';
import { Patch, patchState } from '../components/passport/Patch';
import { MACHINES } from '../data/machines';
import { EXTRAS } from '../data/extras';
import { WORLDS } from '../data/ids';
import type { Machine, MachineType, Status, World } from '../data/types';
import { useAppStore } from '../state/useAppStore';
import { useJourneyStore } from '../state/useJourneyStore';
import { hasWebGL2 } from '../lib/device';
import { announce } from '../components/layout/LiveRegion';
import { formatNumber, yearOf } from '../lib/format';

const TYPES: MachineType[] = [
  'lander',
  'rover',
  'instrument',
  'orbiter',
  'helicopter',
  'telescope',
  'probe',
];
const STATUSES: Status[] = ['silent-surface', 'silent-orbit', 'drifting', 'still-useful'];
const DECADES = [1960, 1970, 1990, 2000, 2010, 2020];
const startYear = (m: Machine) => yearOf((m.launch ?? m.arrival ?? m.lastSignal).date);

function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | 'all';
  options: { v: T; l: string }[];
  onChange: (v: T | 'all') => void;
}) {
  const { t } = useTranslation('ui');
  return (
    <label className="flex flex-col gap-1 text-[0.9375rem]">
      <span className="font-bold">{label}</span>
      <select
        className="min-h-11 rounded-chip border border-line-strong bg-deep px-2 text-ink"
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const o = options.find((x) => String(x.v) === raw);
          onChange(o ? o.v : 'all');
        }}
      >
        <option value="all">{t('catalog.all')}</option>
        {options.map((o) => (
          <option key={String(o.v)} value={String(o.v)}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Visor 3D: el lienzo global cambia a la escena "showcase" (Parte 8.10). Botones equivalentes al arrastre (Parte 17.3). */
function Viewer({ machine, onClose }: { machine: Machine; onClose: () => void }) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const view = useJourneyStore((s) => s.showcaseView);
  const setView = useJourneyStore((s) => s.setShowcaseView);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') rotate(-1);
      if (e.key === 'ArrowRight') rotate(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const describe = (yaw: number, zoom: number) => {
    const deg = Math.round(((((yaw * 180) / Math.PI) % 360) + 360) % 360);
    const name =
      deg === 0
        ? t('catalog.viewFront')
        : deg === 90 || deg === 270
          ? t('catalog.viewSide')
          : deg === 180
            ? t('catalog.viewBack')
            : t('catalog.viewOther', { deg });
    announce(`${name} · ${t('catalog.zoomed', { z: formatNumber(zoom, locale, 1) })}`);
  };
  const rotate = (dir: number) => {
    const yaw = view.yaw + (dir * Math.PI) / 2;
    setView({ yaw });
    describe(yaw, view.zoom);
  };
  const zoom = (k: number) => {
    const z = Math.max(0.6, Math.min(2.2, view.zoom * k));
    setView({ zoom: z });
    describe(view.yaw, z);
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('catalog.viewer', { name: machine.name[locale] })}
      className="fixed inset-x-0 bottom-0 z-30 p-3 sm:p-6"
      data-keys="own"
    >
      <div className="panel mx-auto flex max-w-3xl flex-wrap items-center gap-2 p-3">
        <p className="mr-auto font-bold">{machine.name[locale]}</p>
        <Badge tone="render">{t('badge.render3d')}</Badge>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => rotate(-1)}
          aria-label={t('catalog.rotateLeft')}
        >
          <RotateCcw size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => rotate(1)}
          aria-label={t('catalog.rotateRight')}
        >
          <RotateCw size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => zoom(1.2)}
          aria-label={t('catalog.zoomIn')}
        >
          <ZoomIn size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => zoom(1 / 1.2)}
          aria-label={t('catalog.zoomOut')}
        >
          <ZoomOut size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => {
            setView({ yaw: 0, zoom: 1 });
            describe(0, 1);
          }}
          aria-label={t('catalog.resetView')}
        >
          <Maximize size={18} aria-hidden="true" />
        </button>
        <button ref={closeBtn} type="button" className="btn btn-primary" onClick={onClose}>
          <X size={18} aria-hidden="true" />
          {t('catalog.close')}
        </button>
      </div>
    </div>
  );
}

/** Catálogo (Parte 8.10): rejilla de tarjetas 3D, filtros, buscador bilingüe y visor 3D. */
export function CatalogPage() {
  const { t } = useTranslation(['ui', 'common']);
  const locale = useAppStore((s) => s.locale);
  const progress = useAppStore((s) => s.progress);
  const setShowcase = useJourneyStore((s) => s.setShowcase);
  const setScene = useJourneyStore((s) => s.setScene);
  const [q, setQ] = useState('');
  const [world, setWorld] = useState<World | 'all'>('all');
  const [type, setType] = useState<MachineType | 'all'>('all');
  const [decade, setDecade] = useState<number | 'all'>('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [viewing, setViewing] = useState<Machine | null>(null);
  const webgl = useMemo(() => hasWebGL2(), []);

  useEffect(() => () => setShowcase(null), [setShowcase]);
  const open = (m: Machine) => {
    setViewing(m);
    setShowcase(m.id);
    setScene('showcase');
  };
  const close = () => {
    setViewing(null);
    setShowcase(null);
    setScene('idle');
  };

  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  const match = (names: string[]) => !q || names.some((n) => norm(n).includes(norm(q)));
  const machines = MACHINES.filter(
    (m) =>
      match([m.name.es, m.name.en]) &&
      (world === 'all' || m.world === world) &&
      (type === 'all' || m.type === type) &&
      (status === 'all' || m.status === status) &&
      (decade === 'all' || Math.floor(startYear(m) / 10) * 10 === decade),
  );
  const extras = EXTRAS.filter(
    (e) =>
      match([e.name.es, e.name.en]) &&
      (world === 'all' || e.world === world) &&
      (type === 'all' || e.type === type) &&
      (status === 'all' || e.status === status) &&
      (decade === 'all' || Math.floor(e.launchYear / 10) * 10 === decade),
  );

  return (
    <PageShell title={t('catalog.title')} intro={<p>{t('catalog.intro')}</p>} wide>
      <div inert={viewing ? true : undefined} className={viewing ? 'invisible' : undefined}>
        <form
          role="search"
          className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex flex-col gap-1 text-[0.9375rem]">
            <span className="font-bold">{t('catalog.search')}</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="min-h-11 rounded-chip border border-line-strong bg-deep px-2 text-ink"
            />
          </label>
          <Select
            label={t('catalog.world')}
            value={world}
            onChange={setWorld}
            options={WORLDS.map((w) => ({ v: w, l: t(`common:worlds.${w}`) }))}
          />
          <Select
            label={t('catalog.type')}
            value={type}
            onChange={setType}
            options={TYPES.map((x) => ({ v: x, l: t(`common:types.${x}`) }))}
          />
          <Select
            label={t('catalog.decade')}
            value={decade}
            onChange={setDecade}
            options={DECADES.map((d) => ({ v: d, l: `${d}s` }))}
          />
          <Select
            label={t('catalog.status')}
            value={status}
            onChange={setStatus}
            options={STATUSES.map((x) => ({ v: x, l: t(`common:status.${x}`) }))}
          />
        </form>
        <p className="mb-4 font-mono text-[0.875rem] text-ink-dim" aria-live="polite">
          {t('catalog.results', { n: machines.length + extras.length })}
        </p>
        {machines.length + extras.length === 0 && <p>{t('catalog.none')}</p>}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {machines.map((m) => {
            const p = progress[m.id];
            return (
              <li key={m.id}>
                <Card3D className="flex h-full flex-col p-4">
                  <Poster name={m.id} alt="" />
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-[1.25rem] font-bold">{m.name[locale]}</h2>
                      <p className="text-[0.9375rem] text-ink-dim">
                        {t(`common:worlds.${m.world}`)} · {t(`common:types.${m.type}`)}
                      </p>
                      <p className="font-mono text-[0.8125rem] text-ink-dim">
                        {m.launch
                          ? t('catalog.years', {
                              launch: yearOf(m.launch.date),
                              last: yearOf(m.lastSignal.date),
                            })
                          : t('catalog.arrivalYears', {
                              arrival: yearOf(m.arrival?.date ?? m.lastSignal.date),
                              last: yearOf(m.lastSignal.date),
                            })}
                      </p>
                    </div>
                    <Patch
                      machine={m}
                      state={patchState(Boolean(p?.completed), p?.bestQuiz ?? 0)}
                      size={56}
                      withText={false}
                    />
                  </div>
                  <Badge tone="info" className="mt-2 self-start">
                    {t(`common:status.${m.status}`)}
                  </Badge>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Link to={`/maquinas/${m.id}`} className="btn btn-ghost btn-sm">
                      {t('catalog.open')}
                      <span className="sr-only">: {m.name[locale]}</span>
                    </Link>
                    {webgl && (
                      <button
                        type="button"
                        className="btn btn-subtle btn-sm border-line"
                        onClick={() => open(m)}
                      >
                        <Box size={16} aria-hidden="true" />
                        {t('catalog.view3d')}
                        <span className="sr-only">: {m.name[locale]}</span>
                      </button>
                    )}
                  </div>
                </Card3D>
              </li>
            );
          })}
          {extras.map((e) => (
            <li key={e.id}>
              <Card3D className="h-full p-4">
                <Badge tone="info">{t('badge.extra')}</Badge>
                <h2 className="mt-2 font-heading text-[1.25rem] font-bold">{e.name[locale]}</h2>
                <p className="text-[0.9375rem] text-ink-dim">
                  {t(`common:worlds.${e.world}`)} · {t(`common:types.${e.type}`)} · {e.launchYear}–
                  {e.lastYear}
                </p>
                <p className="mt-2 text-[0.9375rem]">{e.text[locale]}</p>
              </Card3D>
            </li>
          ))}
        </ul>
      </div>
      {viewing && <Viewer machine={viewing} onClose={close} />}
    </PageShell>
  );
}
