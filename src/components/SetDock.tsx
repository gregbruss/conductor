import { useMemo } from 'react';
import type { CrateVoice } from '../types';
import type { NavLevel } from '../hooks/useTreeNav';
import { CRATE_ROLES } from '../hooks/useTreeNav';

interface Props {
  crate: CrateVoice[];
  stagedVoiceNames: Set<string>;
  crateIsOpen: boolean;
  crateRoleIndex: number;
  crateVoiceIndex: number;
  navLevel: NavLevel;
  crateHighlighted: boolean;
  onAddVoice: (code: string, label: string) => void;
  onRemoveVoice: (name: string) => void;
}

export default function SetDock({
  crate,
  stagedVoiceNames,
  crateIsOpen,
  crateRoleIndex,
  crateVoiceIndex,
  navLevel,
  crateHighlighted,
  onAddVoice,
  onRemoveVoice,
}: Props) {
  const isActive = crateHighlighted || crateIsOpen;
  const inVoiceLevel = navLevel === 'crate-role';

  const crateByRole = useMemo(() => {
    const map: Record<string, CrateVoice[]> = {};
    for (const role of CRATE_ROLES) map[role] = [];
    for (const voice of crate) {
      if (map[voice.role]) map[voice.role].push(voice);
    }
    return map;
  }, [crate]);

  // Count staged per role
  const stagedCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const role of CRATE_ROLES) {
      counts[role] = (crateByRole[role] || []).filter((v) => stagedVoiceNames.has(v.name)).length;
    }
    return counts;
  }, [crateByRole, stagedVoiceNames]);

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
        <div className="mt-3" style={{ animation: 'crateSlideUp 0.15s ease-out' }}>
          <style>{`
            @keyframes crateSlideUp {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Role columns */}
          <div className="flex gap-1 overflow-x-auto">
            {CRATE_ROLES.map((role, roleIdx) => {
              const voices = crateByRole[role] || [];
              if (voices.length === 0) return null;

              const isSelectedRole = crateRoleIndex === roleIdx;
              const roleHighlighted = navLevel === 'crate' && isSelectedRole;
              const staged = stagedCount[role] || 0;

              return (
                <div
                  key={role}
                  className="flex-1 min-w-[100px]"
                  style={{
                    border: roleHighlighted
                      ? '2px solid rgba(136,255,136,0.4)'
                      : isSelectedRole && inVoiceLevel
                        ? '1px solid rgba(136,255,136,0.2)'
                        : '1px solid rgba(255,255,255,0.06)',
                    background: roleHighlighted
                      ? 'rgba(136,255,136,0.06)'
                      : isSelectedRole && inVoiceLevel
                        ? 'rgba(136,255,136,0.03)'
                        : 'transparent',
                  }}
                >
                  {/* Role header */}
                  <div
                    className="px-2 py-1.5 text-[9px] uppercase tracking-[0.18em]"
                    style={{
                      color: roleHighlighted || (isSelectedRole && inVoiceLevel) ? '#88ff88' : 'rgba(255,255,255,0.35)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {role}{staged > 0 ? ` · ${staged}` : ''}
                  </div>

                  {/* Voice list */}
                  <div className="py-1">
                    {voices.map((voice, voiceIdx) => {
                      const isStaged = stagedVoiceNames.has(voice.name);
                      const voiceHighlighted = inVoiceLevel && isSelectedRole && crateVoiceIndex === voiceIdx;

                      return (
                        <button
                          key={voice.id}
                          type="button"
                          onClick={() => {
                            if (isStaged) onRemoveVoice(voice.name);
                            else onAddVoice(voice.code, voice.name);
                          }}
                          className="w-full text-left px-2 py-1 text-[10px] cursor-pointer transition-colors"
                          style={{
                            color: voiceHighlighted
                              ? '#88ff88'
                              : isStaged
                                ? 'rgba(255,255,255,0.35)'
                                : 'rgba(255,255,255,0.7)',
                            background: voiceHighlighted
                              ? 'rgba(136,255,136,0.12)'
                              : 'transparent',
                            borderLeft: voiceHighlighted
                              ? '2px solid #88ff88'
                              : '2px solid transparent',
                          }}
                        >
                          {voice.name}{isStaged ? ' ✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Closed state: compact row of staged voice names */
        <div className="mt-2 flex flex-wrap gap-2">
          {crate.filter((v) => stagedVoiceNames.has(v.name)).map((voice) => (
            <span key={voice.id} className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {voice.name} ✓
            </span>
          ))}
          {crate.filter((v) => stagedVoiceNames.has(v.name)).length === 0 && (
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              enter to browse
            </span>
          )}
        </div>
      )}
    </div>
  );
}
