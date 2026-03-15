import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Layer } from '../types';
import type { CrateVoice } from '../types';
import { findAdjustableLines, nudgeLineValue } from '../lib/codeNudge';

// --- Types ---

export type NavLevel =
  | 'stage'
  | 'crate'
  | 'crate-role'
  | 'lane'
  | 'parameter'
  | 'workshop'
  | 'workshop-variant'
  | 'workshop-parameter';

export const CRATE_ROLES = ['kick', 'hats', 'snare', 'bass', 'pad', 'lead', 'texture', 'perc', 'fx'] as const;

type TargetKind = 'lane' | 'crate';

// --- Ring helpers ---
// Stage ring: [lane0, ..., laneN, CRATE]

function stageRingSize(layerCount: number): number {
  return layerCount + 1; // +1 for crate
}

function getTargetKind(index: number, layerCount: number): TargetKind {
  if (index < layerCount) return 'lane';
  return 'crate';
}

function wrap(current: number, delta: number, size: number): number {
  if (size <= 0) return 0;
  return ((current + delta) % size + size) % size;
}

// --- Hook ---

interface UseTreeNavParams {
  layers: Layer[];
  crate: CrateVoice[];
  stagedVoiceNames: Set<string>;
  workshopVisibleCount: number;
  workshopRoleCount: number;
  toggleMute: (id: string) => void;
  toggleSolo: (id: string) => void;
  removeLayer: (id: string) => Promise<void>;
  appendVoiceToStage: (code: string, label: string) => Promise<void>;
  updateLayerCode: (id: string, code: string) => Promise<void>;
  handlePlay: () => Promise<void>;
  handleStop: () => void;
  handleRecordToggle: () => Promise<void>;
  undo: () => void;
  openWorkshop: () => void;
  closeWorkshop: () => void;
  onWorkshopChangeRole: (roleIndex: number) => void;
  onWorkshopSelectVariant: (variantIndex: number) => void;
  onWorkshopStageVariant: () => void;
  onWorkshopPreviewVariant: () => void;
  isPlaying: boolean;
}

export interface TreeNavState {
  navLevel: NavLevel;
  stageIndex: number;
  lineIndex: number;
  workshopTabIndex: number;
  selectedLayerId: string | null;
  selectedLaneIndex: number;
  workshopOpen: boolean;
  isParameterActive: boolean;
  stageTargetKind: TargetKind;
  crateIsOpen: boolean;
  crateRoleIndex: number;
  crateVoiceIndex: number;
  crateHighlighted: boolean;
  // Imperative methods for click navigation
  jumpToLane: (laneIdx: number) => void;
  enterLane: (laneIdx: number) => void;
  openCrate: () => void;
  openCrateRole: (roleIdx: number) => void;
  openWorkshopPanel: () => void;
  closeWorkshopPanel: () => void;
}

export function useTreeNav(params: UseTreeNavParams): TreeNavState {
  const {
    layers, crate, stagedVoiceNames,
    workshopVisibleCount, workshopRoleCount,
    toggleMute, toggleSolo, removeLayer,
    appendVoiceToStage, updateLayerCode,
    handlePlay, handleStop, handleRecordToggle,
    undo, openWorkshop, closeWorkshop,
    onWorkshopChangeRole, onWorkshopSelectVariant,
    onWorkshopStageVariant, onWorkshopPreviewVariant,
    isPlaying,
  } = params;

  const [navLevel, setNavLevel] = useState<NavLevel>('stage');
  const [stageIndex, setStageIndex] = useState(-1); // -1 = nothing selected yet
  const [lineIndex, setLineIndex] = useState(0);
  const [crateRoleIndex, setCrateRoleIndex] = useState(0);
  const [crateVoiceIndex, setCrateVoiceIndex] = useState(0);
  const [workshopTabIndex, setWorkshopTabIndex] = useState(0);
  const [lastLaneId, setLastLaneId] = useState<string | null>(null);

  const layerCount = layers.length;
  const crateCount = crate.length;
  const stageSize = stageRingSize(layerCount);
  const workshopRingSize = workshopRoleCount + workshopVisibleCount;

  // Clamp stageIndex when layers/crate change
  useEffect(() => {
    setStageIndex((prev) => {
      if (prev < 0) return prev; // keep -1 (nothing selected)
      if (stageSize <= 0) return -1;
      return Math.min(prev, stageSize - 1);
    });
  }, [stageSize]);

  // Derived values
  const kind = stageIndex < 0 ? null : getTargetKind(stageIndex, layerCount);

  const selectedLayerId = useMemo(() => {
    if (kind === 'lane' && stageIndex >= 0 && stageIndex < layerCount) {
      return layers[stageIndex]?.id ?? null;
    }
    return null;
  }, [kind, stageIndex, layerCount, layers]);

  // Reset lineIndex when switching to a different lane
  useEffect(() => {
    if (selectedLayerId && selectedLayerId !== lastLaneId) {
      setLineIndex(0);
      setLastLaneId(selectedLayerId);
    }
  }, [selectedLayerId, lastLaneId]);

  const workshopOpen = navLevel === 'workshop' || navLevel === 'workshop-variant' || navLevel === 'workshop-parameter';
  const isParameterActive = navLevel === 'parameter' || navLevel === 'workshop-parameter';
  const crateIsOpen = navLevel === 'crate' || navLevel === 'crate-role';
  const crateHighlighted = navLevel === 'stage' && stageIndex >= 0 && kind === 'crate';

  // Group crate voices by role
  const crateByRole = useMemo(() => {
    const map: Record<string, CrateVoice[]> = {};
    for (const role of CRATE_ROLES) map[role] = [];
    for (const voice of crate) {
      if (map[voice.role]) map[voice.role].push(voice);
    }
    return map;
  }, [crate]);

  const activeRoleVoices = crateByRole[CRATE_ROLES[crateRoleIndex]] ?? [];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;

    // --- GLOBAL KEYS (all levels) ---

    if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
      event.preventDefault();
      undo();
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      if (isPlaying) handleStop();
      else void handlePlay();
      return;
    }

    if (event.key === 'r') {
      void handleRecordToggle();
      return;
    }

    // C — jump to crate (from any level except parameter/editing)
    if (event.key === 'c' && navLevel !== 'parameter' && navLevel !== 'workshop-parameter') {
      if (navLevel === 'crate' || navLevel === 'crate-role') return; // already there
      if (navLevel === 'workshop' || navLevel === 'workshop-variant') closeWorkshop();
      setNavLevel('crate');
      setCrateRoleIndex(0);
      return;
    }

    // W — toggle workshop (from any level except parameter/editing)
    if (event.key === 'w' && navLevel !== 'parameter' && navLevel !== 'workshop-parameter') {
      if (navLevel === 'workshop' || navLevel === 'workshop-variant') {
        closeWorkshop();
        setNavLevel('stage');
        setWorkshopTabIndex(0);
      } else {
        openWorkshop();
        setNavLevel('workshop');
        setWorkshopTabIndex(0);
      }
      return;
    }

    // 1-8: stage + lane + crate levels only (not parameter, not workshop)
    if (/^[1-8]$/.test(event.key) && (navLevel === 'stage' || navLevel === 'lane' || navLevel === 'crate' || navLevel === 'crate-role')) {
      const idx = parseInt(event.key, 10) - 1;
      if (idx < layerCount) {
        setNavLevel('stage');
        setStageIndex(idx);
      }
      return;
    }

    // --- PARAMETER LEVEL ---
    if (navLevel === 'parameter') {
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (!layer) { setNavLevel('stage'); return; }
      const adjustable = findAdjustableLines(layer.code);

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown': {
          event.preventDefault();
          const nudged = nudgeLineValue(layer.code, lineIndex, -1, event.shiftKey);
          void updateLayerCode(layer.id, nudged);
          break;
        }
        case 'ArrowRight':
        case 'ArrowUp': {
          event.preventDefault();
          const nudged = nudgeLineValue(layer.code, lineIndex, 1, event.shiftKey);
          void updateLayerCode(layer.id, nudged);
          break;
        }
        case 'Tab': {
          // At parameter level, Tab jumps between ADJUSTABLE lines only
          event.preventDefault();
          if (adjustable.length <= 1) break;
          const currentAdjIdx = adjustable.findIndex((a) => a.lineIndex === lineIndex);
          const nextAdjIdx = wrap(currentAdjIdx, event.shiftKey ? -1 : 1, adjustable.length);
          setLineIndex(adjustable[nextAdjIdx].lineIndex);
          break;
        }
        case 'Escape':
          setNavLevel('lane');
          break;
        case 'm':
          if (selectedLayerId) toggleMute(selectedLayerId);
          break;
      }
      return;
    }

    // --- WORKSHOP-PARAMETER LEVEL ---
    if (navLevel === 'workshop-parameter') {
      switch (event.key) {
        case 'Escape':
          setNavLevel('workshop-variant');
          break;
        // Arrow adjustments for workshop params handled by WorkshopOverlay via props
      }
      return;
    }

    // --- LANE LEVEL ---
    if (navLevel === 'lane') {
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (!layer) { setNavLevel('stage'); return; }
      const codeLines = layer.code.split('\n');
      const adjustable = findAdjustableLines(layer.code);

      switch (event.key) {
        case 'Tab': {
          event.preventDefault();
          setLineIndex((prev) => wrap(prev, event.shiftKey ? -1 : 1, codeLines.length));
          break;
        }
        case 'Enter': {
          event.preventDefault();
          if (adjustable.some((a) => a.lineIndex === lineIndex)) {
            setNavLevel('parameter');
          }
          break;
        }
        case 'Escape':
          // Preserve lineIndex — don't reset
          setNavLevel('stage');
          break;
        case 'm':
          if (selectedLayerId) toggleMute(selectedLayerId);
          break;
        case 'x':
        case 'Backspace':
          event.preventDefault();
          if (selectedLayerId) {
            void removeLayer(selectedLayerId);
            setNavLevel('stage');
          }
          break;
      }
      return;
    }

    // --- CRATE LEVEL (browsing role columns) ---
    if (navLevel === 'crate') {
      switch (event.key) {
        case 'Tab':
        case 'ArrowRight':
          event.preventDefault();
          setCrateRoleIndex((prev) => wrap(prev, event.shiftKey ? -1 : 1, CRATE_ROLES.length));
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setCrateRoleIndex((prev) => wrap(prev, -1, CRATE_ROLES.length));
          break;
        case 'Enter': {
          event.preventDefault();
          const voices = crateByRole[CRATE_ROLES[crateRoleIndex]] ?? [];
          if (voices.length > 0) {
            setCrateVoiceIndex(0);
            setNavLevel('crate-role');
          }
          break;
        }
        case 'Escape':
          setNavLevel('stage');
          break;
      }
      return;
    }

    // --- CRATE-ROLE LEVEL (browsing voices within a role) ---
    if (navLevel === 'crate-role') {
      switch (event.key) {
        case 'Tab':
        case 'ArrowDown':
          event.preventDefault();
          if (activeRoleVoices.length > 0) {
            setCrateVoiceIndex((prev) => wrap(prev, event.shiftKey ? -1 : 1, activeRoleVoices.length));
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (activeRoleVoices.length > 0) {
            setCrateVoiceIndex((prev) => wrap(prev, -1, activeRoleVoices.length));
          }
          break;
        case 'ArrowRight':
          // Move to next role column, stay in crate-role level
          event.preventDefault();
          setCrateRoleIndex((prev) => wrap(prev, 1, CRATE_ROLES.length));
          setCrateVoiceIndex(0);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setCrateRoleIndex((prev) => wrap(prev, -1, CRATE_ROLES.length));
          setCrateVoiceIndex(0);
          break;
        case 'Enter': {
          event.preventDefault();
          const voice = activeRoleVoices[crateVoiceIndex];
          if (voice) {
            if (stagedVoiceNames.has(voice.name)) {
              const layer = layers.find((l) => l.label === voice.name);
              if (layer) void removeLayer(layer.id);
            } else {
              void appendVoiceToStage(voice.code, voice.name).then(() => {
                setStageIndex(layerCount);
                setNavLevel('stage');
              });
            }
          }
          break;
        }
        case 'Escape':
          setNavLevel('crate');
          break;
      }
      return;
    }

    // --- WORKSHOP-VARIANT LEVEL ---
    if (navLevel === 'workshop-variant') {
      switch (event.key) {
        case 'Tab':
          event.preventDefault();
          setLineIndex((prev) => prev + (event.shiftKey ? -1 : 1));
          break;
        case 'Enter':
          event.preventDefault();
          setNavLevel('workshop-parameter');
          break;
        case 'Escape':
          setNavLevel('workshop');
          setLineIndex(0);
          break;
        case 's':
          onWorkshopStageVariant();
          setNavLevel('stage');
          break;
        case 'p':
          onWorkshopPreviewVariant();
          break;
      }
      return;
    }

    // --- WORKSHOP LEVEL ---
    if (navLevel === 'workshop') {
      const inRoleTabs = workshopTabIndex < workshopRoleCount;

      switch (event.key) {
        case 'Tab': {
          event.preventDefault();
          if (inRoleTabs) {
            // Tab only cycles role tabs — variants update via useEffect in WorkshopOverlay
            setWorkshopTabIndex((prev) => wrap(prev, event.shiftKey ? -1 : 1, workshopRoleCount));
          } else {
            // Tab cycles variant cards
            const variantStart = workshopRoleCount;
            const variantEnd = workshopRoleCount + workshopVisibleCount;
            setWorkshopTabIndex((prev) => {
              const variantIdx = prev - variantStart;
              const next = wrap(variantIdx, event.shiftKey ? -1 : 1, workshopVisibleCount);
              return variantStart + next;
            });
          }
          break;
        }
        case 'Enter': {
          event.preventDefault();
          if (inRoleTabs) {
            // Enter on role tab: drop into variant card browsing
            setWorkshopTabIndex(workshopRoleCount); // first variant
          } else {
            // Enter on variant card: expand it (handled by WorkshopOverlay via onWorkshopSelectVariant)
            const variantIdx = workshopTabIndex - workshopRoleCount;
            onWorkshopSelectVariant(variantIdx);
          }
          break;
        }
        case 'p': {
          if (!inRoleTabs) {
            onWorkshopPreviewVariant();
          }
          break;
        }
        case 's': {
          if (!inRoleTabs) {
            onWorkshopStageVariant();
            setNavLevel('stage');
          }
          break;
        }
        case 'n': {
          // Next batch
          // Handled by workshop component via callback — for now just signal
          break;
        }
        case 'Escape':
          if (!inRoleTabs) {
            // Back to role tabs — go to index 0 (first role tab)
            setWorkshopTabIndex(0);
          } else {
            closeWorkshop();
            setNavLevel('stage');
            setWorkshopTabIndex(0);
          }
          break;
      }
      return;
    }

    // --- STAGE LEVEL ---
    switch (event.key) {
      case 'Tab': {
        event.preventDefault();
        if (stageSize > 0) {
          setStageIndex((prev) => {
            if (prev < 0) return 0; // first Tab selects first item
            return wrap(prev, event.shiftKey ? -1 : 1, stageSize);
          });
        }
        break;
      }
      case 'Enter': {
        event.preventDefault();
        if (stageIndex < 0) break; // nothing selected
        if (kind === 'lane') {
          setNavLevel('lane');
        } else {
          // crate — open at first role
          setNavLevel('crate');
          setCrateRoleIndex(0);
        }
        break;
      }
      case 'm':
        if (selectedLayerId) toggleMute(selectedLayerId);
        break;
      case 's':
        if (selectedLayerId) toggleSolo(selectedLayerId);
        break;
      case 'x':
      case 'Backspace':
        if (selectedLayerId) {
          event.preventDefault();
          void removeLayer(selectedLayerId);
        }
        break;
      case 'Escape':
        setStageIndex(-1); // deselect everything
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (stageSize > 0) {
          setStageIndex((prev) => prev < 0 ? stageSize - 1 : wrap(prev, -1, stageSize));
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (stageSize > 0) {
          setStageIndex((prev) => prev < 0 ? 0 : wrap(prev, 1, stageSize));
        }
        break;
    }
  }, [
    navLevel, stageIndex, lineIndex, workshopTabIndex,
    layers, crate, layerCount, crateCount, crateRoleIndex, crateVoiceIndex, crateByRole, activeRoleVoices, stageSize,
    workshopRingSize, workshopRoleCount, kind,
    selectedLayerId, stagedVoiceNames, isPlaying,
    toggleMute, toggleSolo, removeLayer,
    appendVoiceToStage, updateLayerCode,
    handlePlay, handleStop, handleRecordToggle,
    undo, openWorkshop, closeWorkshop,
    onWorkshopChangeRole, onWorkshopSelectVariant,
    onWorkshopStageVariant, onWorkshopPreviewVariant,
  ]);

  // Register keydown listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Imperative methods for click-driven navigation
  const jumpToLane = useCallback((laneIdx: number) => {
    setNavLevel('stage');
    setStageIndex(laneIdx);
  }, []);

  const enterLane = useCallback((laneIdx: number) => {
    setStageIndex(laneIdx);
    setNavLevel('lane');
    setLineIndex(0);
  }, []);

  const openCrate = useCallback(() => {
    setNavLevel('crate');
    setCrateRoleIndex(0);
  }, []);

  const openCrateRole = useCallback((roleIdx: number) => {
    setNavLevel('crate-role');
    setCrateRoleIndex(roleIdx);
    setCrateVoiceIndex(0);
  }, []);

  const openWorkshopPanel = useCallback(() => {
    openWorkshop();
    setNavLevel('workshop');
    setWorkshopTabIndex(0);
  }, [openWorkshop]);

  const closeWorkshopPanel = useCallback(() => {
    closeWorkshop();
    setNavLevel('stage');
    setWorkshopTabIndex(0);
  }, [closeWorkshop]);

  return {
    navLevel,
    stageIndex,
    lineIndex,
    workshopTabIndex,
    selectedLayerId,
    selectedLaneIndex: kind === 'lane' && stageIndex >= 0 ? stageIndex : -1,
    workshopOpen,
    isParameterActive,
    stageTargetKind: kind,
    crateIsOpen,
    crateRoleIndex,
    crateVoiceIndex,
    crateHighlighted,
    // Imperative
    jumpToLane,
    enterLane,
    openCrate,
    openCrateRole,
    openWorkshopPanel,
    closeWorkshopPanel,
  };
}
