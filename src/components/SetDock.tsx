import type { CrateVoice } from '../types';
import type { NavLevel } from '../hooks/useTreeNav';

interface Props {
  crate: CrateVoice[];
  stagedVoiceNames: Set<string>;
  crateIsOpen: boolean;
  crateNavIndex: number;
  crateHighlighted: boolean;
  onAddVoice: (code: string, label: string) => void;
  onRemoveVoice: (name: string) => void;
}

export default function SetDock({
  crate,
  stagedVoiceNames,
  crateIsOpen,
  crateNavIndex,
  crateHighlighted,
  onAddVoice,
  onRemoveVoice,
}: Props) {
  const isActive = crateHighlighted || crateIsOpen;

  return (
    <div
      className="shrink-0 px-4 py-3"
      style={{
        borderTop: isActive ? '2px solid rgba(136,255,136,0.35)' : '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(0,0,0,0.3)',
      }}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: isActive ? '#88ff88' : 'rgba(255,255,255,0.5)' }}>
        crate
      </div>

      {crateIsOpen ? (
        <div
          className="mt-3"
          style={{ animation: 'crateSlideUp 0.2s ease-out' }}
        >
          <style>{`
            @keyframes crateSlideUp {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {crate.map((voice, index) => {
              const staged = stagedVoiceNames.has(voice.name);
              const active = crateNavIndex === index;
              return (
                <button
                  key={voice.id}
                  onClick={() => {
                    if (staged) onRemoveVoice(voice.name);
                    else onAddVoice(voice.code, voice.name);
                  }}
                  className="px-3 py-3 text-left text-[11px] cursor-pointer transition-all"
                  style={{
                    border: active
                      ? '2px solid rgba(136,255,136,0.5)'
                      : `1px solid ${staged ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.1)'}`,
                    color: active ? '#88ff88' : staged ? 'rgba(255,255,255,0.45)' : '#ffffff',
                    background: active
                      ? 'rgba(136,255,136,0.1)'
                      : staged ? 'rgba(136,255,136,0.04)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  {voice.name}{staged ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            ←→↑↓ navigate · enter stage/unstage · esc close
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {crate.map((voice) => {
            const staged = stagedVoiceNames.has(voice.name);
            return (
              <button
                key={voice.id}
                onClick={() => {
                  if (staged) onRemoveVoice(voice.name);
                  else onAddVoice(voice.code, voice.name);
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
      )}
    </div>
  );
}
