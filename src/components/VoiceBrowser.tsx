import { useState } from 'react';
import { VOICE_ROLES, VOICE_LIBRARY, getPresetsByRole } from '../lib/voiceLibrary';
import type { VoicePreset } from '../lib/voiceLibrary';
import type { VoiceRole, CrateVoice } from '../types';

interface Props {
  crate: CrateVoice[];
  onAddVoice: (code: string, label: string) => void;
  onPreview?: (code: string) => void;
  disabled?: boolean;
}

type Tab = 'library' | 'crate';

export default function VoiceBrowser({ crate, onAddVoice, disabled }: Props) {
  const [tab, setTab] = useState<Tab>('library');
  const [expandedRole, setExpandedRole] = useState<VoiceRole | null>(null);

  const crateByRole = (role: VoiceRole) => crate.filter(v => v.role === role);

  const renderPreset = (preset: VoicePreset | CrateVoice, isCrate = false) => (
    <button
      key={preset.id}
      onClick={() => onAddVoice(preset.code, preset.name)}
      disabled={disabled}
      className="w-full text-left px-2 py-1.5 transition-all
        hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-30 cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white">
          {isCrate && (preset as CrateVoice).isFavorite ? '\u2605 ' : '\u266B '}
          {preset.name}
        </span>
      </div>
      <div className="text-[9px] mt-0.5" style={{ color: '#6666aa' }}>
        {preset.description}
      </div>
      <div className="flex gap-1 mt-1">
        {preset.tags.map(t => (
          <span key={t} className="text-[8px] px-1" style={{ color: '#444488', border: '1px solid rgba(255,255,255,0.04)' }}>
            {t}
          </span>
        ))}
      </div>
    </button>
  );

  return (
    <div>
      {/* Header */}
      <div className="px-2 py-1.5 text-[10px] font-bold tracking-wider"
        style={{ color: '#8888cc', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        + ADD VOICE
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setTab('library')}
          className="flex-1 py-1 text-[10px] cursor-pointer transition-all"
          style={{
            color: tab === 'library' ? '#ffffff' : '#6666aa',
            background: tab === 'library' ? 'rgba(255,255,255,0.04)' : 'transparent',
          }}
        >
          LIBRARY
        </button>
        <button
          onClick={() => setTab('crate')}
          className="flex-1 py-1 text-[10px] cursor-pointer transition-all"
          style={{
            color: tab === 'crate' ? '#ffffff' : '#6666aa',
            background: tab === 'crate' ? 'rgba(255,255,255,0.04)' : 'transparent',
          }}
        >
          MY CRATE {crate.length > 0 && `(${crate.length})`}
        </button>
      </div>

      {/* Role list */}
      <div className="max-h-[50vh] overflow-auto">
        {tab === 'library' ? (
          VOICE_ROLES.map(({ role, label, icon }) => {
            const presets = getPresetsByRole(role);
            const isExpanded = expandedRole === role;
            return (
              <div key={role}>
                <button
                  onClick={() => setExpandedRole(isExpanded ? null : role)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] cursor-pointer
                    transition-all hover:bg-[rgba(255,255,255,0.04)]"
                  style={{ color: isExpanded ? '#ffffff' : '#aaaaff' }}
                >
                  <span className="w-3 text-center" style={{ color: '#6666aa' }}>{icon}</span>
                  <span>{isExpanded ? '\u25BE' : '\u25B8'} {label.toLowerCase()}</span>
                  <span className="ml-auto text-[9px]" style={{ color: '#444488' }}>
                    ({presets.length})
                  </span>
                </button>
                {isExpanded && (
                  <div className="pl-4" style={{ borderLeft: '1px solid rgba(136,255,136,0.1)' }}>
                    {presets.map(p => renderPreset(p))}
                  </div>
                )}
              </div>
            );
          })
        ) : crate.length === 0 ? (
          <div className="px-3 py-4 text-[10px] text-center" style={{ color: '#444488' }}>
            no saved voices yet
            <br />
            <span className="text-[9px]">select a lane and click "save to crate"</span>
          </div>
        ) : (
          VOICE_ROLES.map(({ role, label, icon }) => {
            const voices = crateByRole(role);
            if (voices.length === 0) return null;
            const isExpanded = expandedRole === role;
            return (
              <div key={role}>
                <button
                  onClick={() => setExpandedRole(isExpanded ? null : role)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] cursor-pointer
                    transition-all hover:bg-[rgba(255,255,255,0.04)]"
                  style={{ color: isExpanded ? '#ffffff' : '#aaaaff' }}
                >
                  <span className="w-3 text-center" style={{ color: '#6666aa' }}>{icon}</span>
                  <span>{isExpanded ? '\u25BE' : '\u25B8'} {label.toLowerCase()}</span>
                  <span className="ml-auto text-[9px]" style={{ color: '#444488' }}>
                    ({voices.length})
                  </span>
                </button>
                {isExpanded && (
                  <div className="pl-4" style={{ borderLeft: '1px solid rgba(136,255,136,0.1)' }}>
                    {voices.map(v => renderPreset(v, true))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
