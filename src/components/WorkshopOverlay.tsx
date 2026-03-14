import { useMemo, useState } from 'react';
import type { CrateVoice, VoiceRole } from '../types';
import type { NavLevel } from '../hooks/useTreeNav';
import { CRATE_ROLES } from '../hooks/useTreeNav';
import { generateRowGrid } from './Punchcard';
import { createBlankWorkshopVoice } from '../lib/workshopSeeds';

interface Props {
  crate: CrateVoice[];
  stagedVoiceNames: Set<string>;
  previewingId: string | null;
  navLevel: NavLevel;
  workshopTabIndex: number;
  onClose: () => void;
  onPreview: (voice: CrateVoice) => void;
  onAddToStage: (voice: CrateVoice) => void;
  onRemoveFromCrate: (voiceId: string) => void;
  onAddToCrate: (voice: CrateVoice) => void;
  onUpdateCrateVoice: (voiceId: string, code: string) => void;
}

function PulsePreview({ code }: { code: string }) {
  const grid = generateRowGrid(code);
  return (
    <div className="flex gap-[2px]">
      {grid.map((active, index) => (
        <div
          key={index}
          className="h-2 flex-1"
          style={{ background: active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.05)' }}
        />
      ))}
    </div>
  );
}

export default function WorkshopOverlay({
  crate,
  stagedVoiceNames,
  previewingId,
  navLevel,
  workshopTabIndex,
  onClose,
  onPreview,
  onAddToStage,
  onRemoveFromCrate,
  onAddToCrate,
  onUpdateCrateVoice,
}: Props) {
  const [selectedRole, setSelectedRole] = useState<VoiceRole>('kick');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');

  const crateByRole = useMemo(() => {
    const map: Record<string, CrateVoice[]> = {};
    for (const role of CRATE_ROLES) map[role] = [];
    for (const voice of crate) {
      if (map[voice.role]) map[voice.role].push(voice);
    }
    return map;
  }, [crate]);

  const roleVoices = crateByRole[selectedRole] || [];

  const startEditing = (voice: CrateVoice) => {
    setEditingId(voice.id);
    setEditCode(voice.code);
  };

  const saveEdit = () => {
    if (editingId && editCode.trim()) {
      onUpdateCrateVoice(editingId, editCode);
    }
    setEditingId(null);
    setEditCode('');
  };

  const addNewVoice = () => {
    const blank = createBlankWorkshopVoice(selectedRole);
    onAddToCrate(blank);
    startEditing(blank);
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.15)' }}>
        <div className="text-sm font-bold tracking-[0.18em] text-white">WORKSHOP</div>
        <div className="flex items-center gap-3 text-[10px]">
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>esc to close</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
          >
            close
          </button>
        </div>
      </div>

      <div className="flex" style={{ minHeight: '300px' }}>
        {/* Left: role list */}
        <div className="shrink-0 w-[120px]" style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          {CRATE_ROLES.map((role, idx) => {
            const isSelected = selectedRole === role;
            const count = (crateByRole[role] || []).length;
            const isHighlighted = navLevel === 'workshop' && workshopTabIndex === idx;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className="w-full text-left px-3 py-2 text-[11px] cursor-pointer transition-colors"
                style={{
                  color: isHighlighted || isSelected ? '#88ff88' : 'rgba(255,255,255,0.4)',
                  background: isHighlighted
                    ? 'rgba(136,255,136,0.08)'
                    : isSelected
                      ? 'rgba(255,255,255,0.03)'
                      : 'transparent',
                  borderLeft: isHighlighted
                    ? '3px solid #88ff88'
                    : isSelected
                      ? '3px solid rgba(136,255,136,0.3)'
                      : '3px solid transparent',
                }}
              >
                {role}
                <span className="ml-2" style={{ color: 'rgba(255,255,255,0.2)' }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Right: voices for selected role */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {selectedRole} · {roleVoices.length} voices
            </div>
            <button
              type="button"
              onClick={addNewVoice}
              className="px-3 py-1 text-[10px] cursor-pointer"
              style={{ border: '1px solid rgba(136,255,136,0.25)', color: '#88ff88' }}
            >
              + new {selectedRole}
            </button>
          </div>

          <div className="space-y-2">
            {roleVoices.map((voice, idx) => {
              const isStaged = stagedVoiceNames.has(voice.name);
              const isPreviewing = previewingId === voice.id;
              const isEditing = editingId === voice.id;
              const cardHighlighted = navLevel === 'workshop' && workshopTabIndex === CRATE_ROLES.length + idx;

              return (
                <div
                  key={voice.id}
                  style={{
                    border: cardHighlighted
                      ? '2px solid rgba(136,255,136,0.4)'
                      : isEditing
                        ? '1px solid rgba(136,255,136,0.2)'
                        : '1px solid rgba(255,255,255,0.08)',
                    background: cardHighlighted
                      ? 'rgba(136,255,136,0.06)'
                      : isEditing
                        ? 'rgba(136,255,136,0.03)'
                        : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {/* Voice header */}
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className="text-[12px] text-white">{voice.name}</span>
                    {isStaged && <span className="text-[9px]" style={{ color: 'rgba(136,255,136,0.5)' }}>staged</span>}
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={() => onPreview(voice)}
                      className="px-2 py-0.5 text-[10px] cursor-pointer"
                      style={{
                        border: `1px solid ${isPreviewing ? 'rgba(136,255,136,0.2)' : 'rgba(255,255,255,0.08)'}`,
                        color: isPreviewing ? '#88ff88' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {isPreviewing ? '■ stop' : '▶'}
                    </button>
                    <button
                      type="button"
                      onClick={() => isEditing ? saveEdit() : startEditing(voice)}
                      className="px-2 py-0.5 text-[10px] cursor-pointer"
                      style={{ border: '1px solid rgba(255,255,255,0.08)', color: isEditing ? '#88ff88' : 'rgba(255,255,255,0.6)' }}
                    >
                      {isEditing ? 'save' : 'edit'}
                    </button>
                    {!isStaged && (
                      <button
                        type="button"
                        onClick={() => onAddToStage(voice)}
                        className="px-2 py-0.5 text-[10px] cursor-pointer"
                        style={{ border: '1px solid rgba(136,255,136,0.15)', color: '#88ff88' }}
                      >
                        stage
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveFromCrate(voice.id)}
                      className="px-2 py-0.5 text-[10px] cursor-pointer"
                      style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Pulse preview (always visible) */}
                  <div className="px-3 pb-2">
                    <PulsePreview code={isEditing ? editCode : voice.code} />
                  </div>

                  {/* Code editor (when editing) */}
                  {isEditing && (
                    <div className="px-3 pb-3">
                      <textarea
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            saveEdit();
                          }
                        }}
                        className="w-full min-h-[100px] resize-y bg-transparent outline-none text-sm leading-relaxed"
                        style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px' }}
                        spellCheck={false}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
