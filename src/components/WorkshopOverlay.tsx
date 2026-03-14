import { useEffect, useMemo, useState } from 'react';
import type { CrateVoice, VoiceRole } from '../types';
import type { NavLevel } from '../hooks/useTreeNav';
import { VOICE_LIBRARY } from '../lib/voiceLibrary';
import { createBlankWorkshopVoice } from '../lib/workshopSeeds';
import { generateRowGrid } from './Punchcard';
import { CodeDisplay } from './InteractiveCode';

const FILTERED_ROLES: VoiceRole[] = ['kick', 'hats', 'bass', 'pad', 'texture', 'fx'];

interface Props {
  role: VoiceRole | 'all';
  seedVoice: CrateVoice | null;
  crate: CrateVoice[];
  previewingId: string | null;
  navLevel: NavLevel;
  workshopTabIndex: number;
  onClose: () => void;
  onChangeRole: (role: VoiceRole) => void;
  onPreview: (voice: CrateVoice) => void;
  onSaveToCrate: (voice: CrateVoice) => void;
  onAddToStage: (voice: CrateVoice) => void;
}

function PulsePreview({ code }: { code: string }) {
  const grid = generateRowGrid(code);
  return (
    <div className="flex gap-[2px]">
      {grid.map((active, index) => (
        <div
          key={index}
          className="h-3 flex-1"
          style={{ background: active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.05)' }}
        />
      ))}
    </div>
  );
}

function dedupeVoices(voices: CrateVoice[]): CrateVoice[] {
  const seen = new Set<string>();
  return voices.filter((voice) => {
    const key = `${voice.role}:${voice.name}:${voice.code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function shuffle<T>(items: T[], seed: number): T[] {
  const values = [...items];
  let cursor = seed || 1;
  for (let i = values.length - 1; i > 0; i -= 1) {
    cursor = (cursor * 1664525 + 1013904223) % 4294967296;
    const j = cursor % (i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

export default function WorkshopOverlay({
  role,
  seedVoice,
  crate,
  previewingId,
  navLevel,
  workshopTabIndex,
  onClose,
  onChangeRole,
  onPreview,
  onSaveToCrate,
  onAddToStage,
}: Props) {
  const [batch, setBatch] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeRole = role === 'all' ? 'bass' : role;

  const pool = useMemo(() => {
    const libraryVoices = VOICE_LIBRARY
      .filter((voice) => voice.role === activeRole)
      .map((voice) => ({
        ...voice,
        savedAt: Date.now(),
        isFavorite: false,
      }));

    const crateVoices = crate.filter((voice) => voice.role === activeRole);
    const combined = dedupeVoices([
      ...(seedVoice && seedVoice.role === activeRole ? [seedVoice] : []),
      ...crateVoices,
      ...libraryVoices,
    ]);

    return shuffle(combined, batch + 1);
  }, [activeRole, batch, crate, seedVoice]);

  const visibleVoices = useMemo(() => (
    pool.slice(0, Math.max(4, Math.min(6, pool.length)))
  ), [pool]);

  // Collapse expanded card when role changes
  useEffect(() => {
    setExpandedId(null);
  }, [activeRole]);

  // Sync keyboard highlight with role tabs — when tabbing across roles, update the active role
  useEffect(() => {
    if (navLevel === 'workshop' && workshopTabIndex < FILTERED_ROLES.length) {
      const tabRole = FILTERED_ROLES[workshopTabIndex];
      if (tabRole && tabRole !== activeRole) {
        onChangeRole(tabRole);
      }
    }
  }, [navLevel, workshopTabIndex, activeRole, onChangeRole]);

  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.15)' }}>
        <div className="text-sm font-bold tracking-[0.18em] text-white">WORKSHOP</div>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 text-[11px] cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
        >
          close (esc)
        </button>
      </div>

      <div className="px-4 py-3 flex flex-wrap items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {FILTERED_ROLES.map((voiceRole, idx) => {
          const isKeyHighlighted = navLevel === 'workshop' && workshopTabIndex === idx;
          const isActive = activeRole === voiceRole;
          return (
            <button
              key={voiceRole}
              type="button"
              onClick={() => onChangeRole(voiceRole)}
              className="px-2.5 py-1 text-[10px] cursor-pointer"
              style={{
                border: isKeyHighlighted
                  ? '2px solid rgba(136,255,136,0.5)'
                  : `1px solid ${isActive ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.06)'}`,
                color: isKeyHighlighted || isActive ? '#88ff88' : 'rgba(255,255,255,0.35)',
                background: isKeyHighlighted ? 'rgba(136,255,136,0.08)' : 'transparent',
              }}
            >
              {voiceRole}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleVoices.map((voice, idx) => {
            const isHighlighted = navLevel === 'workshop' && workshopTabIndex === FILTERED_ROLES.length + idx;
            const isExpanded = expandedId === voice.id;
            const isPreviewing = previewingId === voice.id;

            return (
              <div
                key={voice.id}
                className={isExpanded ? 'md:col-span-2 xl:col-span-3' : ''}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : voice.id)}
                  className="w-full text-left p-3 cursor-pointer transition-all"
                  style={{
                    border: isHighlighted
                      ? '2px solid rgba(136,255,136,0.5)'
                      : isExpanded
                        ? '1px solid rgba(136,255,136,0.2)'
                        : '1px solid rgba(255,255,255,0.08)',
                    background: isHighlighted
                      ? 'rgba(136,255,136,0.06)'
                      : isExpanded
                        ? 'rgba(136,255,136,0.03)'
                        : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white">{voice.name}</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(voice);
                        }}
                        className="px-2.5 py-1 text-[10px] cursor-pointer"
                        style={{
                          border: `1px solid ${isPreviewing ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.08)'}`,
                          color: isPreviewing ? '#88ff88' : '#ffffff',
                        }}
                      >
                        {isPreviewing ? '■ stop' : '▶ preview'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToStage(voice);
                        }}
                        className="px-2.5 py-1 text-[10px] cursor-pointer"
                        style={{ border: '1px solid rgba(136,255,136,0.15)', color: '#88ff88' }}
                      >
                        stage
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <PulsePreview code={voice.code} />
                  </div>
                </button>

                {isExpanded && (
                  <div
                    className="p-3 mt-[-1px]"
                    style={{
                      border: '1px solid rgba(136,255,136,0.2)',
                      borderTop: 'none',
                      background: 'rgba(0,0,0,0.15)',
                    }}
                  >
                    <CodeDisplay
                      code={voice.code}
                      onSoundChange={() => {}}
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSaveToCrate(voice)}
                        className="px-2.5 py-1 text-[10px] cursor-pointer"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}
                      >
                        + crate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              setExpandedId(null);
              setBatch((value) => value + 1);
            }}
            className="px-4 py-2 text-[11px] cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
          >
            ↻ more
          </button>
        </div>
      </div>
    </div>
  );
}
