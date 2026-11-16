import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Dialog } from '../ui/Dialog';
import { Tabs } from '../ui/Tabs';
import { Toggle } from '../ui/Toggle';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import { useAppStore, type Quality, type TextScale } from '../../state/useAppStore';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useUiStore, type SettingsTab } from '../../state/useUiStore';
import { AudioEngine, loadAudioPrefs, type AudioPrefs } from '../../audio/AudioEngine';
import { useVoiceAvailable, useVoiceQuality } from '../../hooks/useVoiceAvailable';
import { isPersistent } from '../../lib/storage';
import { useToast } from '../ui/Toast';
import { cx } from '../../lib/cx';

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="py-3">
      <legend className="mb-2 font-bold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={String(o.value)}
            className={cx(
              'btn btn-sm cursor-pointer',
              value === o.value ? 'btn-ghost border-signal text-signal' : 'btn-subtle border-line',
            )}
          >
            <input
              type="radio"
              className="sr-only"
              name={label}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SettingsPanel() {
  const { t } = useTranslation('ui');
  const open = useUiStore((s) => s.settingsOpen);
  const tab = useUiStore((s) => s.settingsTab);
  const close = useUiStore((s) => s.closeSettings);
  const openSettings = useUiStore((s) => s.openSettings);
  const st = useAppStore();
  const paused = useJourneyStore((s) => s.paused);
  const setPaused = useJourneyStore((s) => s.setPaused);
  const [prefs, setPrefs] = useState<AudioPrefs>(() => loadAudioPrefs());
  const [confirmReset, setConfirmReset] = useState(false);
  const voice = useVoiceAvailable(st.locale);
  const voiceQuality = useVoiceQuality(st.locale);
  const { push } = useToast();

  const updatePrefs = (p: Partial<AudioPrefs>) => {
    const next = { ...prefs, ...p };
    setPrefs(next);
    AudioEngine.setPrefs(next);
  };
  const pct = (v: number) => `${Math.round(v * 100)} %`;
  const qualityLabel = (q: Quality) => t(`settings.quality${q[0]?.toUpperCase()}${q.slice(1)}`);

  const toggleSound = (on: boolean) => {
    if (!on) {
      st.updateSettings({ soundOn: false });
      AudioEngine.setEnabled(false);
      return;
    }
    void AudioEngine.init().then((ok) => {
      if (!ok) return;
      st.updateSettings({ soundOn: true });
      AudioEngine.setEnabled(true);
    });
  };

  const tabs = [
    {
      id: 'language',
      label: t('settings.tabs.language'),
      panel: (
        <div>
          <Segmented
            label={t('settings.language')}
            value={st.locale}
            options={[
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'English' },
            ]}
            onChange={(l) => st.setLocale(l)}
          />
          <p className="text-[0.9375rem] text-ink-dim">{t('settings.languageHint')}</p>
        </div>
      ),
    },
    {
      id: 'motion',
      label: t('settings.tabs.motion'),
      panel: (
        <div className="divide-y divide-line">
          <Toggle
            checked={st.reducedMotion}
            onChange={(v) =>
              st.updateSettings({ reducedMotion: v, ...(v ? { instantSignal: true } : {}) })
            }
            label={t('settings.reducedMotion')}
            description={t('settings.reducedMotionDesc')}
          />
          <Toggle
            checked={paused}
            onChange={setPaused}
            label={t('settings.pause')}
            description={t('settings.pauseDesc')}
          />
          <Toggle
            checked={st.instantSignal}
            onChange={(v) => st.updateSettings({ instantSignal: v })}
            label={t('settings.instantSignal')}
            description={t('settings.instantSignalDesc')}
          />
          <Toggle
            checked={st.hotkeysOn}
            onChange={(v) => st.updateSettings({ hotkeysOn: v })}
            label={t('settings.hotkeys')}
            description={t('settings.hotkeysDesc')}
          />
        </div>
      ),
    },
    {
      id: 'visual',
      label: t('settings.tabs.visual'),
      panel: (
        <div className="divide-y divide-line">
          <Segmented<'auto' | Quality>
            label={t('settings.quality')}
            value={st.autoQuality ? 'auto' : st.quality}
            options={[
              { value: 'auto', label: t('settings.qualityAuto') },
              { value: 'low', label: t('settings.qualityLow') },
              { value: 'medium', label: t('settings.qualityMedium') },
              { value: 'high', label: t('settings.qualityHigh') },
            ]}
            onChange={(v) =>
              v === 'auto' ? st.setQuality(st.quality, true) : st.setQuality(v, false)
            }
          />
          <p className="pb-3 font-mono text-[0.8125rem] text-ink-dim">
            {t('settings.qualityNow', { q: qualityLabel(st.quality) })}
          </p>
          <Toggle
            checked={st.liteMode}
            onChange={st.setLiteMode}
            label={t('settings.lite')}
            description={t('settings.liteDesc')}
          />
          <Toggle
            checked={st.highContrast}
            onChange={(v) => st.updateSettings({ highContrast: v })}
            label={t('settings.contrast')}
            description={t('settings.contrastDesc')}
          />
          <Toggle
            checked={st.legibleFont}
            onChange={(v) => st.updateSettings({ legibleFont: v })}
            label={t('settings.legible')}
            description={t('settings.legibleDesc')}
          />
          <Segmented<TextScale>
            label={t('settings.textSize')}
            value={st.textScale}
            options={[
              { value: 1, label: '100 %' },
              { value: 1.15, label: '115 %' },
              { value: 1.3, label: '130 %' },
            ]}
            onChange={(v) => st.updateSettings({ textScale: v })}
          />
        </div>
      ),
    },
    {
      id: 'sound',
      label: t('settings.tabs.sound'),
      panel: (
        <div className="divide-y divide-line">
          <Toggle
            checked={st.soundOn}
            onChange={toggleSound}
            label={t('settings.sound')}
            description={t('settings.soundDesc')}
          />
          <div className="py-2">
            <Slider
              label={t('settings.ambience')}
              value={prefs.ambience}
              min={0}
              max={1}
              step={0.05}
              format={pct}
              onChange={(v) => updatePrefs({ ambience: v })}
            />
            <Slider
              label={t('settings.sfx')}
              value={prefs.sfx}
              min={0}
              max={1}
              step={0.05}
              format={pct}
              onChange={(v) => updatePrefs({ sfx: v })}
            />
            <Slider
              label={t('settings.voiceVol')}
              value={prefs.voice}
              min={0}
              max={1}
              step={0.05}
              format={pct}
              onChange={(v) => updatePrefs({ voice: v })}
            />
          </div>
          <Toggle
            checked={st.narrationOn}
            onChange={(v) => st.updateSettings({ narrationOn: v })}
            label={t('settings.narration')}
            description={voice ? t('settings.narrationDesc') : t('settings.noVoice')}
            disabled={!voice}
          />
          {voiceQuality === 'basic' && (
            <p className="text-[0.9375rem] text-ink-dim">{t('settings.edgeVoice')}</p>
          )}
          <Segmented<0.8 | 1 | 1.2>
            label={t('settings.narrationRate')}
            value={prefs.narrationRate}
            options={[
              { value: 0.8, label: '0,8×' },
              { value: 1, label: '1×' },
              { value: 1.2, label: '1,2×' },
            ]}
            onChange={(v) => updatePrefs({ narrationRate: v })}
          />
          <p className="pt-3 text-[0.9375rem] text-ink-dim">{t('settings.mobileHint')}</p>
        </div>
      ),
    },
    {
      id: 'experience',
      label: t('settings.tabs.experience'),
      panel: (
        <div className="divide-y divide-line">
          <Toggle
            checked={st.proMode}
            onChange={(v) => st.updateSettings({ proMode: v })}
            label={t('settings.pro')}
            description={t('settings.proDesc')}
          />
          <Toggle
            checked={st.classroomMode}
            onChange={(v) =>
              st.updateSettings({ classroomMode: v, ...(v ? { soundOn: false } : {}) })
            }
            label={t('settings.classroom')}
            description={t('settings.classroomDesc')}
          />
        </div>
      ),
    },
    {
      id: 'progress',
      label: t('settings.tabs.progress'),
      panel: (
        <div>
          <p className="font-bold">{t('settings.reset')}</p>
          <p className="mt-1 text-[0.9375rem] text-ink-dim">{t('settings.resetDesc')}</p>
          {!isPersistent() && (
            <p className="mt-2 text-[0.9375rem] text-amber">{t('settings.memoryOnly')}</p>
          )}
          {confirmReset ? (
            <div
              className="mt-3 rounded-card border border-alert/60 p-3"
              role="alertdialog"
              aria-label={t('settings.reset')}
            >
              <p>{t('settings.resetConfirm')}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    st.resetProgress();
                    setConfirmReset(false);
                    push({ title: t('settings.resetDone'), tone: 'info' });
                  }}
                >
                  {t('common.yes')}
                </Button>
                <Button onClick={() => setConfirmReset(false)}>{t('common.noThanks')}</Button>
              </div>
            </div>
          ) : (
            <Button className="mt-3" onClick={() => setConfirmReset(true)}>
              {t('settings.reset')}
            </Button>
          )}
        </div>
      ),
    },
    {
      id: 'data',
      label: t('settings.tabs.data'),
      panel: (
        <div className="space-y-3">
          <p className="text-ink-dim">{t('settings.dataLinks')}</p>
          <p>
            <Link to="/fuentes" onClick={close}>
              {t('settings.toSources')}
            </Link>
          </p>
          <p>
            <Link to="/acerca#ia" onClick={close}>
              {t('settings.toAi')}
            </Link>
          </p>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onClose={close} title={t('settings.title')} wide>
      <Tabs
        tabs={tabs}
        active={tab}
        onChange={(id) => openSettings(id as SettingsTab)}
        label={t('settings.title')}
      />
    </Dialog>
  );
}
