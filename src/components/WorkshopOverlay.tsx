import { useEffect, useMemo, useState } from 'react';
import type { CrateVoice, VoiceRole } from '../types';
import type { NavLevel } from '../hooks/useTreeNav';
import { CRATE_ROLES } from '../hooks/useTreeNav';
import { generateRowGrid } from './Punchcard';
import WorkshopCodeEditor from './WorkshopCodeEditor';
import { createBlankWorkshopVoice } from '../lib/workshopSeeds';

interface Props {
  crate: CrateVoice[];
  stagedVoiceNames: Set<string>;
  previewingId: string | null;
  navLevel: NavLevel;
  workshopTabIndex: number;
  initialRole?: VoiceRole;
  initialStageSeed?: {
    layerId: string;
    label: string;
    code: string;
    role: VoiceRole;
  } | null;
  onClose: () => void;
  onPreview: (voice: CrateVoice) => void;
  onStopPreview: () => void;
  onAddToStage: (voice: CrateVoice) => void;
  onApplyToLane: (layerId: string, code: string) => void;
  onRemoveFromCrate: (voiceId: string) => void;
  onAddToCrate: (voice: CrateVoice) => void;
  onUpdateCrateVoice: (voiceId: string, updates: { name: string; code: string }) => void;
}

type DraftState = {
  sourceId: string | null;
  sourceKind: 'crate' | 'new' | 'stage' | null;
  baselineName: string;
  baselineCode: string;
  name: string;
  code: string;
  stageLayerId: string | null;
};

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
} | null;

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

function buildDraftFromVoice(voice: CrateVoice): DraftState {
  return {
    sourceId: voice.id,
    sourceKind: 'crate',
    baselineName: voice.name,
    baselineCode: voice.code,
    name: voice.name,
    code: voice.code,
    stageLayerId: null,
  };
}

function buildDraftFromStageSeed(seed: NonNullable<Props['initialStageSeed']>): DraftState {
  return {
    sourceId: null,
    sourceKind: 'stage',
    baselineName: seed.label,
    baselineCode: seed.code,
    name: seed.label,
    code: seed.code,
    stageLayerId: seed.layerId,
  };
}

function buildEmptyDraft(): DraftState {
  return {
    sourceId: null,
    sourceKind: null,
    baselineName: '',
    baselineCode: '',
    name: '',
    code: '',
    stageLayerId: null,
  };
}

function ConfirmModal({
  state,
  onCancel,
}: {
  state: ConfirmState;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!state) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        state.onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [state, onCancel]);

  if (!state) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
    >
      <div
        className="w-full max-w-xl p-6"
        style={{ background: '#111127', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}
      >
        <div className="text-[15px] font-semibold text-white">{state.title}</div>
        <div className="mt-4 text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {state.message}
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[12px] cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
          >
            cancel
          </button>
          <button
            type="button"
            onClick={state.onConfirm}
            className="px-4 py-2 text-[12px] cursor-pointer"
            style={{ border: '1px solid rgba(136,255,136,0.2)', color: '#88ff88' }}
          >
            {state.confirmLabel ?? 'discard'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkshopOverlay({
  crate,
  stagedVoiceNames,
  previewingId,
  navLevel,
  workshopTabIndex,
  initialRole,
  initialStageSeed,
  onClose,
  onPreview,
  onStopPreview,
  onAddToStage,
  onApplyToLane,
  onRemoveFromCrate,
  onAddToCrate,
  onUpdateCrateVoice,
}: Props) {
  const [selectedRole, setSelectedRole] = useState<VoiceRole>(initialStageSeed?.role ?? initialRole ?? 'kick');
  const [draft, setDraft] = useState<DraftState>(() => (
    initialStageSeed ? buildDraftFromStageSeed(initialStageSeed) : { ...buildEmptyDraft() }
  ));
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const crateByRole = useMemo(() => {
    const map: Record<string, CrateVoice[]> = {};
    for (const role of CRATE_ROLES) map[role] = [];
    for (const voice of crate) {
      if (map[voice.role]) map[voice.role].push(voice);
    }
    return map;
  }, [crate]);

  const roleVoices = crateByRole[selectedRole] || [];
  const selectedVoice = draft.sourceKind === 'crate' && draft.sourceId
    ? crate.find((voice) => voice.id === draft.sourceId) ?? null
    : null;
  const isDirty = draft.name !== draft.baselineName || draft.code !== draft.baselineCode;
  const hasDraft = draft.name.trim().length > 0 || draft.code.trim().length > 0;

  const draftVoice: CrateVoice | null = hasDraft
    ? {
        id: draft.sourceId ?? `draft-${selectedRole}`,
        name: draft.name.trim() || `${selectedRole} sketch`,
        description: selectedVoice?.description ?? `${selectedRole} draft`,
        role: selectedRole,
        code: draft.code,
        tags: selectedVoice?.tags ?? [selectedRole, 'draft'],
        savedAt: selectedVoice?.savedAt ?? Date.now(),
        isFavorite: selectedVoice?.isFavorite ?? false,
      }
    : null;
  const isDraftPreviewing = previewingId === draftVoice?.id;

  useEffect(() => {
    if (!initialStageSeed) return;
    setSelectedRole(initialStageSeed.role);
    setDraft(buildDraftFromStageSeed(initialStageSeed));
  }, [initialStageSeed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (confirmState) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
        return;
      }
      if (event.key !== 'Escape' && event.key.toLowerCase() !== 'w') return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      handleClose();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [confirmState, draftVoice?.id]);

  const guardDiscard = (message: string, action: () => void) => {
    if (!isDirty) {
      action();
      return;
    }
    setConfirmState({
      title: 'Discard Changes?',
      message,
      onConfirm: () => {
        setConfirmState(null);
        action();
      },
    });
  };

  const loadVoice = (voice: CrateVoice) => {
    guardDiscard(`Load "${voice.name}" and discard current workshop edits?`, () => {
      setSelectedRole(voice.role);
      setDraft(buildDraftFromVoice(voice));
    });
  };

  const switchRole = (role: VoiceRole) => {
    if (role === selectedRole) return;
    guardDiscard(`Switch to ${role} and discard current workshop edits?`, () => {
      setSelectedRole(role);
      setDraft(buildEmptyDraft());
    });
  };

  const startNewVoice = () => {
    guardDiscard(`Start a new ${selectedRole} piece and discard current workshop edits?`, () => {
      const blank = createBlankWorkshopVoice(selectedRole);
      setDraft({
        sourceId: null,
        sourceKind: 'new',
        baselineName: '',
        baselineCode: '',
        name: blank.name,
        code: blank.code,
        stageLayerId: null,
      });
    });
  };

  const handleSave = () => {
    if (!draftVoice || !draftVoice.code.trim()) return;
    if (draft.sourceKind === 'crate' && draft.sourceId) {
      onUpdateCrateVoice(draft.sourceId, { name: draftVoice.name, code: draftVoice.code });
      setDraft((previous) => ({
        ...previous,
        baselineName: draftVoice.name,
        baselineCode: draftVoice.code,
        name: draftVoice.name,
      }));
      return;
    }

    const fresh = createBlankWorkshopVoice(selectedRole);
    const savedVoice: CrateVoice = {
      ...fresh,
      name: draftVoice.name,
      code: draftVoice.code,
    };
    onAddToCrate(savedVoice);
    setDraft(buildDraftFromVoice(savedVoice));
  };

  const handleClose = () => {
    guardDiscard('Close the workshop and discard current edits?', onClose);
  };

  const handleUpdate = () => {
    if (!draftVoice) return;
    if (draft.sourceKind === 'stage' && draft.stageLayerId) {
      onApplyToLane(draft.stageLayerId, draft.code);
      setDraft((previous) => ({
        ...previous,
        baselineName: previous.name,
        baselineCode: previous.code,
      }));
      return;
    }
    onPreview(draftVoice);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.15)' }}>
        <div className="text-sm font-bold tracking-[0.18em] text-white">WORKSHOP</div>
        <div className="flex items-center gap-3 text-[10px]">
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>esc to close</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-2 py-1 cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="shrink-0 w-[120px]" style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          {CRATE_ROLES.map((role, idx) => {
            const isSelected = selectedRole === role;
            const count = (crateByRole[role] || []).length;
            return (
              <button
                key={role}
                type="button"
                onClick={() => switchRole(role)}
                className="w-full text-left px-3 py-2 text-[11px] cursor-pointer transition-colors"
                style={{
                  color: isSelected ? '#88ff88' : 'rgba(255,255,255,0.4)',
                  background: isSelected ? 'rgba(136,255,136,0.08)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #88ff88' : '3px solid transparent',
                }}
              >
                {role}
                <span className="ml-2" style={{ color: 'rgba(255,255,255,0.2)' }}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 p-4 min-h-0 overflow-auto">
          <div className="mb-4 p-3" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {draft.sourceKind === 'crate'
                    ? `editing saved ${selectedRole}`
                    : draft.sourceKind === 'stage'
                      ? `editing staged ${selectedRole}`
                    : draft.sourceKind === 'new'
                      ? `new ${selectedRole}`
                      : `${selectedRole} workbench`}
                </div>
                {hasDraft && (
                  <span className="text-[10px]" style={{ color: isDirty ? '#88ff88' : 'rgba(255,255,255,0.22)' }}>
                    {draft.sourceKind === 'stage'
                      ? `live target: ${draft.baselineName}`
                      : isDraftPreviewing
                        ? `previewing: ${draftVoice?.name ?? 'draft'}`
                        : (isDirty ? 'unsaved changes' : 'saved')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startNewVoice}
                  className="px-3 py-1 text-[10px] cursor-pointer"
                  style={{ border: '1px solid rgba(136,255,136,0.25)', color: '#88ff88' }}
                >
                  + new {selectedRole}
                </button>
              </div>
            </div>

            <div className="mt-3">
              <input
                value={draft.name}
                onChange={(e) => setDraft((previous) => ({ ...previous, name: e.target.value }))}
                placeholder={`${selectedRole} name`}
                className="w-full bg-transparent outline-none text-[12px]"
                style={{
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '8px 10px',
                }}
              />
            </div>

            <div className="mt-3">
              <WorkshopCodeEditor
                code={draft.code}
                onChange={(nextCode) => setDraft((previous) => ({ ...previous, code: nextCode }))}
                placeholder={`Write ${selectedRole} code here...`}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={!draftVoice}
                  className="px-2.5 py-1 cursor-pointer"
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: !draftVoice ? 'rgba(255,255,255,0.2)' : '#ffffff',
                  }}
                >
                  {draft.sourceKind === 'stage' ? 'update live' : 'update'}
                </button>
                {draft.sourceKind !== 'stage' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!draftVoice) return;
                      if (isDraftPreviewing) onStopPreview();
                      else onPreview(draftVoice);
                    }}
                    disabled={!draftVoice}
                    className="px-2.5 py-1 cursor-pointer"
                    style={{
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: !draftVoice ? 'rgba(255,255,255,0.2)' : (isDraftPreviewing ? '#88ff88' : '#ffffff'),
                    }}
                  >
                    {isDraftPreviewing ? 'stop preview' : 'preview'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!draftVoice || !draftVoice.code.trim()}
                  className="px-2.5 py-1 cursor-pointer"
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: !draftVoice || !draftVoice.code.trim() ? 'rgba(255,255,255,0.2)' : '#ffffff',
                  }}
                >
                  {draft.sourceKind === 'stage'
                    ? 'save to crate'
                    : draft.sourceKind === 'crate'
                      ? (isDirty ? 'save' : 'saved')
                      : 'save'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => draftVoice && onAddToStage(draftVoice)}
                disabled={!draftVoice}
                className="px-2.5 py-1 cursor-pointer shrink-0"
                style={{
                  border: '1px solid rgba(136,255,136,0.18)',
                  color: draftVoice ? '#88ff88' : 'rgba(255,255,255,0.2)',
                }}
              >
                {draft.sourceKind === 'stage' ? 'stage as new' : 'stage'}
              </button>
            </div>

            <div className="mt-3">
              <PulsePreview code={draft.code} />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {selectedRole} crate · {roleVoices.length} voices
            </div>
          </div>

          <div className="space-y-2">
            {roleVoices.map((voice, idx) => {
              const isStaged = stagedVoiceNames.has(voice.name);
              const isPreviewing = previewingId === voice.id;
              const isLoaded = draft.sourceId === voice.id;
              const cardHighlighted = navLevel === 'workshop' && workshopTabIndex === CRATE_ROLES.length + idx;

              return (
                <div
                  key={voice.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => loadVoice(voice)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      loadVoice(voice);
                    }
                  }}
                  className="w-full text-left cursor-pointer"
                  style={{
                    border: cardHighlighted
                      ? '2px solid rgba(136,255,136,0.4)'
                      : isLoaded
                        ? '1px solid rgba(136,255,136,0.28)'
                        : '1px solid rgba(255,255,255,0.08)',
                    background: cardHighlighted
                      ? 'rgba(136,255,136,0.06)'
                      : isLoaded
                        ? 'rgba(136,255,136,0.05)'
                        : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className="text-[12px] text-white">{voice.name}</span>
                    {isStaged && <span className="text-[9px]" style={{ color: 'rgba(136,255,136,0.5)' }}>staged</span>}
                    {isLoaded && <span className="text-[9px]" style={{ color: '#88ff88' }}>loaded</span>}
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isPreviewing) onStopPreview();
                        else onPreview(voice);
                      }}
                      className="px-2 py-0.5 text-[10px] cursor-pointer"
                      style={{
                        border: `1px solid ${isPreviewing ? 'rgba(136,255,136,0.2)' : 'rgba(255,255,255,0.08)'}`,
                        color: isPreviewing ? '#88ff88' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {isPreviewing ? 'stop' : 'preview'}
                    </button>
                    {!isStaged && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onAddToStage(voice);
                        }}
                        className="px-2 py-0.5 text-[10px] cursor-pointer"
                        style={{ border: '1px solid rgba(136,255,136,0.15)', color: '#88ff88' }}
                      >
                        stage
                      </button>
                    )}
                  </div>

                  <div className="px-3 pb-2">
                    <PulsePreview code={voice.code} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ConfirmModal state={confirmState} onCancel={() => setConfirmState(null)} />
    </div>
  );
}
