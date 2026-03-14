import type { CrateVoice } from '../types';

interface Props {
  crate: CrateVoice[];
  stagedVoiceNames: Set<string>;
  workshopOpen: boolean;
  onAddVoice: (code: string, label: string) => void;
  onRemoveVoice: (name: string) => void;
  onToggleWorkshop: () => void;
}

export default function SetDock({
  crate,
  stagedVoiceNames,
  workshopOpen,
  onAddVoice,
  onRemoveVoice,
  onToggleWorkshop,
}: Props) {
  return (
    <div
      className="shrink-0 px-4 py-3"
      style={{ borderTop: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.3)' }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          crate
        </div>
        <button
          onClick={onToggleWorkshop}
          className="px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] cursor-pointer transition-all"
          style={{
            border: `1px solid ${workshopOpen ? 'rgba(255,255,255,0.2)' : 'rgba(136,255,136,0.25)'}`,
            color: workshopOpen ? '#ffffff' : '#88ff88',
            background: workshopOpen ? 'rgba(255,255,255,0.06)' : 'rgba(136,255,136,0.06)',
          }}
        >
          {workshopOpen ? '✕ CLOSE' : '+ WORKSHOP'}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {crate.map((voice) => {
          const staged = stagedVoiceNames.has(voice.name);
          return (
            <button
              key={voice.id}
              onClick={() => {
                if (staged) {
                  onRemoveVoice(voice.name);
                } else {
                  onAddVoice(voice.code, voice.name);
                }
              }}
              className="px-3 py-2 text-left text-[11px] cursor-pointer transition-all"
              style={{
                border: `1px solid ${staged ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.1)'}`,
                color: staged ? 'rgba(255,255,255,0.45)' : '#ffffff',
                background: staged ? 'rgba(136,255,136,0.04)' : 'rgba(255,255,255,0.03)',
              }}
            >
              {voice.name}{staged ? ' ✓' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
