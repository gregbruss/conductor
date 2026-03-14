import { useEffect, useMemo, useState } from 'react';
import type { CrateVoice, VoiceRole } from '../types';
import { VOICE_LIBRARY, VOICE_ROLES } from '../lib/voiceLibrary';
import { createBlankWorkshopVoice } from '../lib/workshopSeeds';
import { generateRowGrid } from './Punchcard';
import { CodeDisplay, SliderRow, updateSoundInCode, updateSliderInCode } from './InteractiveCode';

type WorkshopRole = VoiceRole | 'all';

interface Props {
  role: WorkshopRole;
  seedVoice: CrateVoice | null;
  crate: CrateVoice[];
  previewingId: string | null;
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

function CandidateCard({
  voice,
  previewing,
  onPreview,
  onStage,
  onSelect,
  onSaveToCrate,
}: {
  voice: CrateVoice;
  previewing: boolean;
  onPreview: () => void;
  onStage: () => void;
  onSelect: () => void;
  onSaveToCrate: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-left p-3 cursor-pointer transition-all"
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div className="text-sm text-white">{voice.name}</div>
      <div className="mt-3">
        <PulsePreview code={voice.code} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPreview();
          }}
          className="px-2.5 py-1 text-[10px] cursor-pointer"
          style={{
            border: `1px solid ${previewing ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.08)'}`,
            color: previewing ? '#88ff88' : '#ffffff',
          }}
        >
          {previewing ? '▶ previewing' : '▶ preview'}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onStage();
          }}
          className="px-2.5 py-1 text-[10px] cursor-pointer"
          style={{ border: '1px solid rgba(136,255,136,0.15)', color: '#88ff88' }}
        >
          stage
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSaveToCrate();
          }}
          className="px-2.5 py-1 text-[10px] cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}
        >
          + crate
        </button>
      </div>
    </button>
  );
}

export default function WorkshopOverlay({
  role,
  seedVoice,
  crate,
  previewingId,
  onClose,
  onChangeRole,
  onPreview,
  onSaveToCrate,
  onAddToStage,
}: Props) {
  const [batch, setBatch] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, CrateVoice>>({});

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

  useEffect(() => {
    if (seedVoice && seedVoice.role === activeRole) {
      const cloned = { ...seedVoice, id: `seed-${Date.now()}`, tags: [...seedVoice.tags] };
      setDrafts((current) => ({ ...current, [cloned.id]: cloned }));
      setSelectedId(cloned.id);
      return;
    }

    if (visibleVoices.length === 0) {
      const blank = createBlankWorkshopVoice(activeRole);
      setDrafts((current) => ({ ...current, [blank.id]: blank }));
      setSelectedId(blank.id);
      return;
    }

    setSelectedId(null);
  }, [activeRole, seedVoice, visibleVoices]);

  const selectedVoice = useMemo(() => {
    if (!selectedId) return null;
    return drafts[selectedId] ?? visibleVoices.find((voice) => voice.id === selectedId) ?? null;
  }, [drafts, selectedId, visibleVoices]);

  const candidateTabs = selectedVoice
    ? visibleVoices.map((voice) => drafts[voice.id] ?? voice)
    : [];

  const selectCandidate = (voice: CrateVoice) => {
    setDrafts((current) => ({
      ...current,
      [voice.id]: current[voice.id] ?? { ...voice, tags: [...voice.tags] },
    }));
    setSelectedId(voice.id);
  };

  const selectedIsEdited = !!(selectedVoice && visibleVoices.find((voice) => voice.id === selectedVoice.id)?.code !== selectedVoice.code);

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
          close
        </button>
      </div>

      <div className="px-4 py-3 flex flex-wrap items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {VOICE_ROLES.filter(({ role: voiceRole }) => ['kick', 'hats', 'bass', 'pad', 'texture', 'fx'].includes(voiceRole)).map(({ role: voiceRole }) => (
          <button
            key={voiceRole}
            type="button"
            onClick={() => onChangeRole(voiceRole)}
            className="px-2.5 py-1 text-[10px] cursor-pointer"
            style={{
              border: `1px solid ${activeRole === voiceRole ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.06)'}`,
              color: activeRole === voiceRole ? '#88ff88' : 'rgba(255,255,255,0.35)',
            }}
          >
            {voiceRole}
          </button>
        ))}
      </div>

      {!selectedVoice ? (
        <div className="p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleVoices.map((voice) => (
              <CandidateCard
                key={voice.id}
                voice={voice}
                previewing={previewingId === voice.id}
                onPreview={() => onPreview(voice)}
                onStage={() => onAddToStage(voice)}
                onSelect={() => selectCandidate(voice)}
                onSaveToCrate={() => onSaveToCrate(voice)}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                setBatch((value) => value + 1);
              }}
              className="px-4 py-2 text-[11px] cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
            >
              ↻ more
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {candidateTabs.map((voice) => {
              const active = voice.id === selectedVoice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => selectCandidate(voice)}
                  className="px-2.5 py-1 text-[10px] cursor-pointer"
                  style={{
                    border: `1px solid ${active ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.06)'}`,
                    color: active ? '#88ff88' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {voice.name}
                </button>
              );
            })}
          </div>

          <div className="p-4" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-white">
                {selectedVoice.name}{selectedIsEdited ? ' (edited)' : ''}
              </div>
              <button
                type="button"
                onClick={() => onPreview(selectedVoice)}
                className="px-3 py-1 text-[10px] cursor-pointer"
                style={{
                  border: `1px solid ${previewingId === selectedVoice.id ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.08)'}`,
                  color: previewingId === selectedVoice.id ? '#88ff88' : '#ffffff',
                }}
              >
                {previewingId === selectedVoice.id ? '▶ previewing' : '▶ preview'}
              </button>
            </div>

            <div className="mt-4">
              <div
                className="p-3"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <CodeDisplay
                  code={selectedVoice.code}
                  onSoundChange={(nextSound) => {
                    setDrafts((current) => ({
                      ...current,
                      [selectedVoice.id]: {
                        ...selectedVoice,
                        code: updateSoundInCode(selectedVoice.code, nextSound),
                      },
                    }));
                  }}
                />
              </div>
            </div>

            <div className="mt-4">
              <textarea
                value={selectedVoice.code}
                onChange={(event) => {
                  const nextCode = event.target.value;
                  setDrafts((current) => ({
                    ...current,
                    [selectedVoice.id]: {
                      ...selectedVoice,
                      code: nextCode,
                    },
                  }));
                }}
                className="w-full min-h-[150px] resize-y bg-transparent outline-none text-sm leading-relaxed"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff', padding: '10px 12px' }}
                spellCheck={false}
              />
            </div>

            <div className="mt-4">
              <PulsePreview code={selectedVoice.code} />
            </div>

            <div className="mt-4">
              <SliderRow
                code={selectedVoice.code}
                onSliderChange={(sliderIndex, value) => {
                  setDrafts((current) => ({
                    ...current,
                    [selectedVoice.id]: {
                      ...selectedVoice,
                      code: updateSliderInCode(selectedVoice.code, sliderIndex, value),
                    },
                  }));
                }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setBatch((value) => value + 1)}
                className="px-3 py-1.5 text-[10px] cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
              >
                ↻ more
              </button>
              <button
                type="button"
                onClick={() => onSaveToCrate(selectedVoice)}
                className="px-3 py-1.5 text-[10px] cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
              >
                + crate
              </button>
              <button
                type="button"
                onClick={() => onAddToStage(selectedVoice)}
                className="px-3 py-1.5 text-[10px] cursor-pointer"
                style={{ border: '1px solid rgba(136,255,136,0.15)', color: '#88ff88' }}
              >
                stage this →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
