import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Machine } from '../../data/types';
import { BeatShell } from './BeatShell';
import { ScriptLines } from './ScriptLines';
import { HoldButton } from '../ui/HoldButton';
import { SignalMeter } from '../hud/SignalMeter';
import { LightTimeCounter } from '../hud/LightTimeCounter';
import { Telemetry } from '../hud/Telemetry';
import { ArchivedReply } from './ArchivedReply';
import { VoiceLine } from './VoiceLine';
import { useSignal } from '../../hooks/useSignal';
import { useAppStore } from '../../state/useAppStore';
import { lightTime } from '../../lib/astro';
import { formatLightTime } from '../../lib/format';
import { playSfx } from '../../audio/play';

/** "Despertar": LUMI, el botón de señal con su tiempo de luz y la respuesta archivada (Partes 8.2 y 14.2). */
export function BeatWake({ machine }: { machine: Machine }) {
  const { t } = useTranslation('ui');
  const locale = useAppStore((s) => s.locale);
  const instant = useAppStore((s) => s.instantSignal);
  const { status, send, setCharging } = useSignal(machine);
  const [progress, setProgress] = useState(0);
  const [auto, setAuto] = useState(false);
  const kepler = machine.lightTimeTarget === 'kepler';
  const arrived = status === 'arrived';

  const onScroll = useCallback(
    (p: number) => {
      // Si el visitante no envía la señal, LUMI la envía al 60 % del tramo (Parte 8.2).
      if (p >= 0.6 && status === 'idle') {
        setAuto(true);
        send(true);
      }
    },
    [status, send],
  );
  const onHold = useCallback(
    (p: number) => {
      setProgress(p);
      setCharging(p > 0);
      if (p > 0 && p < 0.05) playSfx('charge');
      if (p === 0) playSfx('chargeStop');
    },
    [setCharging],
  );

  const lt = lightTime(machine.lightTimeTarget);
  const name = machine.name[locale];
  const srLabel =
    lt.seconds === null
      ? t('signal.ariaOff', { name })
      : t('signal.aria', { name, time: formatLightTime(lt.seconds, locale) });
  // El botón dice siempre lo que hará o lo que está pasando (corrección D).
  const label =
    status === 'traveling'
      ? t('signal.traveling')
      : arrived
        ? t('signal.sent')
        : kepler
          ? t('signal.keplerPlay')
          : status === 'charging'
            ? t('signal.charging')
            : instant
              ? t('signal.press')
              : t('signal.hold');

  return (
    <BeatShell machine={machine} beat="wake" onProgress={onScroll}>
      <ScriptLines machine={machine} beat="wake" phase="before" />
      <div className="flex flex-wrap items-center gap-4">
        <HoldButton
          onSend={() => send(false)}
          label={label}
          srLabel={srLabel}
          instant={instant || kepler}
          disabled={status === 'traveling' || arrived}
          onProgress={onHold}
          listenSpace
        />
        <SignalMeter progress={progress} status={status} />
      </div>
      <LightTimeCounter machine={machine} />
      <div className="panel-solid p-3">
        <Telemetry machine={machine} />
      </div>
      {auto && status !== 'idle' && <VoiceLine speaker="lumi" text={t('signal.lumiAuto')} />}
      {arrived && (
        <>
          {kepler && <VoiceLine speaker="note" text={t('signal.keplerMemory')} />}
          <ArchivedReply machine={machine} />
          <ScriptLines machine={machine} beat="wake" phase="after" />
        </>
      )}
    </BeatShell>
  );
}
