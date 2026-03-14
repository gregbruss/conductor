import type { CrateVoice, VoiceRole } from '../types';
import { VOICE_ROLES } from '../lib/voiceLibrary';

type DockRole = VoiceRole | 'all';

interface Props {
  crate: CrateVoice[];
  activeRole: DockRole;
  focusedRole: VoiceRole | null;
  onChangeRole: (role: DockRole) => void;
  onAddVoice: (code: string, label: string) => void;
  onOpenWorkshop: () => void;
}

function roleLabel(role: DockRole): string {
  return role === 'all' ? 'all' : role;
}

export default function SetDock({
  crate,
  activeRole,
  focusedRole,
  onChangeRole,
  onAddVoice,
  onOpenWorkshop,
}: Props) {
  const visibleVoices = activeRole === 'all'
    ? crate
    : crate.filter((voice) => voice.role === activeRole);

  return (
    <div
      className="shrink-0"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,40,0.28)' }}
    >
      <div
        className="px-4 py-2 flex items-center justify-between gap-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-[10px] uppercase tracking-[0.2em] shrink-0"
            style={{ color: 'rgba(255,255,255,0.18)' }}>
            crate
          </span>
          <button
            onClick={() => onChangeRole('all')}
            className="px-2 py-0.5 text-[10px] cursor-pointer transition-all shrink-0"
            style={{
              color: activeRole === 'all' ? '#88ff88' : 'rgba(255,255,255,0.35)',
              border: `1px solid ${activeRole === 'all' ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            all
          </button>
          {VOICE_ROLES.map(({ role, icon }) => {
            const suggested = focusedRole === role && activeRole !== role;
            return (
              <button
                key={role}
                onClick={() => onChangeRole(role)}
                className="px-2 py-0.5 text-[10px] cursor-pointer transition-all shrink-0"
                style={{
                  color: activeRole === role ? '#88ff88' : suggested ? 'rgba(136,255,136,0.7)' : 'rgba(255,255,255,0.35)',
                  border: `1px solid ${
                    activeRole === role
                      ? 'rgba(136,255,136,0.18)'
                      : suggested
                        ? 'rgba(136,255,136,0.12)'
                        : 'rgba(255,255,255,0.06)'
                  }`,
                }}
              >
                <span className="mr-1 opacity-50">{icon}</span>
                {roleLabel(role)}
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenWorkshop}
          className="px-3 py-1 text-[10px] cursor-pointer transition-all shrink-0"
          style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          + workshop
        </button>
      </div>

      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {visibleVoices.length > 0 ? visibleVoices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onAddVoice(voice.code, voice.name)}
            className="shrink-0 px-3 py-2 text-left cursor-pointer transition-all min-w-44"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <div className="text-xs text-white">{voice.name}</div>
            <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {voice.role} · {voice.description}
            </div>
          </button>
        )) : (
          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            No crate voices in {roleLabel(activeRole)} yet. Open workshop to stock the crate.
          </div>
        )}
      </div>
    </div>
  );
}
