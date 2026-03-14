import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Layer } from '../types';
import type { CrateVoice } from '../types';
import { findAdjustableLines, nudgeLineValue } from '../lib/codeNudge';

// --- Types ---

export type NavLevel =
  | 'stage'
  | 'lane'
  | 'parameter'
  | 'workshop'
  | 'workshop-variant'
  | 'workshop-parameter';

type TargetKind = 'lane' | 'crate' | 'workshop-button';

// --- Ring helpers ---

function ringSize(layerCount: number, crateCount: number): number {
  return layerCount + crateCount + 1;
}

function targetKind(index: number, layerCount: number, crateCount: number): TargetKind {
  if (index < layerCount) return 'lane';
  if (index < layerCount + crateCount) return 'crate';
  return 'workshop-button';
}

function laneIndex(stageIndex: number): number {
  return stageIndex;
}

function crateIndex(stageIndex: number, layerCount: number): number {
  return stageIndex - layerCount;
}

function wrapIndex(current: number, delta: number, size: number): number {
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
  // Callbacks
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
  // Derived
  selectedLayerId: string | null;
  selectedLaneIndex: number;
  workshopOpen: boolean;
  isParameterActive: boolean;
  stageTargetKind: TargetKind;
  crateHighlightIndex: number;
  workshopButtonHighlighted: boolean;
}

export function useTreeNav(params: UseTreeNavParams): TreeNavState & { handleKeyDown: (e: KeyboardEvent) => void } {
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
  const [stageIndex, setStageIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [workshopTabIndex, setWorkshopTabIndex] = useState(0);

  const layerCount = layers.length;
  const crateCount = crate.length;
  const stageSize = ringSize(layerCount, crateCount);
  const workshopRingSize = workshopRoleCount + workshopVisibleCount;

  // Clamp stageIndex when layers/crate change
  useEffect(() => {
    setStageIndex((prev) => {
      if (stageSize <= 0) return 0;
      return Math.min(prev, stageSize - 1);
    });
  }, [stageSize]);

  // Derived values
  const stageTargetKindValue = targetKind(stageIndex, layerCount, crateCount);

  const selectedLayerId = useMemo(() => {
    if (stageTargetKindValue === 'lane' && stageIndex < layerCount) {
      return layers[stageIndex]?.id ?? null;
    }
    return null;
  }, [stageTargetKindValue, stageIndex, layerCount, layers]);

  const workshopOpen = navLevel === 'workshop' || navLevel === 'workshop-variant' || navLevel === 'workshop-parameter';
  const isParameterActive = navLevel === 'parameter' || navLevel === 'workshop-parameter';

  const crateHighlightIndex = navLevel === 'stage' && stageTargetKindValue === 'crate'
    ? crateIndex(stageIndex, layerCount) : -1;

  const workshopButtonHighlighted = navLevel === 'stage' && stageTargetKindValue === 'workshop-button';

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;

    // Cmd/Ctrl+Z for undo — global
    if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
      event.preventDefault();
      undo();
      return;
    }

    // Space for play/stop — global (except in parameter mode to avoid conflicts)
    if (event.key === ' ' && navLevel !== 'parameter' && navLevel !== 'workshop-parameter') {
      event.preventDefault();
      if (isPlaying) handleStop();
      else void handlePlay();
      return;
    }

    // R for record — global
    if (event.key === 'r' && navLevel !== 'parameter' && navLevel !== 'workshop-parameter') {
      void handleRecordToggle();
      return;
    }

    // === PARAMETER LEVEL ===
    if (navLevel === 'parameter') {
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (!layer) return;

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
        case 'Escape':
          setNavLevel('lane');
          break;
      }
      return;
    }

    // === WORKSHOP-PARAMETER LEVEL ===
    if (navLevel === 'workshop-parameter') {
      if (event.key === 'Escape') {
        setNavLevel('workshop-variant');
      }
      // Arrow adjustments for workshop params will be handled by WorkshopOverlay
      return;
    }

    // === LANE LEVEL ===
    if (navLevel === 'lane') {
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (!layer) { setNavLevel('stage'); return; }
      const codeLines = layer.code.split('\n');
      const adjustable = findAdjustableLines(layer.code);

      switch (event.key) {
        case 'Tab': {
          event.preventDefault();
          const delta = event.shiftKey ? -1 : 1;
          setLineIndex((prev) => wrapIndex(prev, delta, codeLines.length));
          break;
        }
        case 'Enter': {
          event.preventDefault();
          const isAdj = adjustable.some((a) => a.lineIndex === lineIndex);
          if (isAdj) {
            setNavLevel('parameter');
          }
          break;
        }
        case 'Escape':
          setNavLevel('stage');
          setLineIndex(0);
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
            setLineIndex(0);
          }
          break;
      }
      return;
    }

    // === WORKSHOP-VARIANT LEVEL ===
    if (navLevel === 'workshop-variant') {
      switch (event.key) {
        case 'Tab':
          event.preventDefault();
          // Tab through variant code lines — handled by lineIndex
          // The workshop component will need to provide line count via the workshopVisibleCount mechanism
          // For now, cycle lineIndex
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
          break;
        case 'p':
          onWorkshopPreviewVariant();
          break;
      }
      return;
    }

    // === WORKSHOP LEVEL ===
    if (navLevel === 'workshop') {
      switch (event.key) {
        case 'Tab': {
          event.preventDefault();
          if (workshopRingSize > 0) {
            setWorkshopTabIndex((prev) => wrapIndex(prev, event.shiftKey ? -1 : 1, workshopRingSize));
          }
          break;
        }
        case 'Enter': {
          event.preventDefault();
          if (workshopTabIndex < workshopRoleCount) {
            onWorkshopChangeRole(workshopTabIndex);
          } else {
            const variantIdx = workshopTabIndex - workshopRoleCount;
            onWorkshopSelectVariant(variantIdx);
            setNavLevel('workshop-variant');
            setLineIndex(0);
          }
          break;
        }
        case 'Escape':
          closeWorkshop();
          setNavLevel('stage');
          setWorkshopTabIndex(0);
          break;
      }
      return;
    }

    // === STAGE LEVEL ===
    switch (event.key) {
      case 'Tab': {
        event.preventDefault();
        if (stageSize > 0) {
          setStageIndex((prev) => wrapIndex(prev, event.shiftKey ? -1 : 1, stageSize));
        }
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const kind = targetKind(stageIndex, layerCount, crateCount);
        if (kind === 'lane') {
          setNavLevel('lane');
          setLineIndex(0);
        } else if (kind === 'crate') {
          const idx = crateIndex(stageIndex, layerCount);
          const voice = crate[idx];
          if (voice) {
            if (stagedVoiceNames.has(voice.name)) {
              // Remove from stage
              const layer = layers.find((l) => l.label === voice.name);
              if (layer) void removeLayer(layer.id);
            } else {
              void appendVoiceToStage(voice.code, voice.name);
            }
          }
        } else {
          // workshop-button
          openWorkshop();
          setNavLevel('workshop');
          setWorkshopTabIndex(0);
        }
        break;
      }
      case 'w':
        if (workshopOpen) {
          closeWorkshop();
          setNavLevel('stage');
        } else {
          openWorkshop();
          setNavLevel('workshop');
          setWorkshopTabIndex(0);
        }
        break;
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
        // Deselect — go to first item
        setStageIndex(0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (stageSize > 0) {
          setStageIndex((prev) => wrapIndex(prev, -1, stageSize));
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (stageSize > 0) {
          setStageIndex((prev) => wrapIndex(prev, 1, stageSize));
        }
        break;
      default:
        if (/^[1-8]$/.test(event.key)) {
          const idx = parseInt(event.key, 10) - 1;
          if (idx < stageSize) {
            setStageIndex(idx);
          }
        }
    }
  }, [
    navLevel, stageIndex, lineIndex, workshopTabIndex,
    layers, crate, layerCount, crateCount, stageSize,
    workshopRingSize, workshopRoleCount,
    selectedLayerId, stagedVoiceNames, isPlaying,
    toggleMute, toggleSolo, removeLayer,
    appendVoiceToStage, updateLayerCode,
    handlePlay, handleStop, handleRecordToggle,
    undo, openWorkshop, closeWorkshop, workshopOpen,
    onWorkshopChangeRole, onWorkshopSelectVariant,
    onWorkshopStageVariant, onWorkshopPreviewVariant,
  ]);

  // Register keydown listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    navLevel,
    stageIndex,
    lineIndex,
    workshopTabIndex,
    selectedLayerId,
    selectedLaneIndex: stageTargetKindValue === 'lane' ? laneIndex(stageIndex) : -1,
    workshopOpen,
    isParameterActive,
    stageTargetKind: stageTargetKindValue,
    crateHighlightIndex,
    workshopButtonHighlighted,
    handleKeyDown,
  };
}
