import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { countSliders, SliderRow, stripSliders, updateSliderInCode, updateSoundInCode } from './components/InteractiveCode';
import LayerCard from './components/LayerCard';
import SequencerOverview from './components/SequencerOverview';
import SetDock from './components/SetDock';
import LandingPage from './components/LandingPage';
import WorkshopOverlay from './components/WorkshopOverlay';
import { parseLayers, reconstructCode } from './lib/parser';
import { loadCrate, saveCrate } from './lib/crateStore';
import { useTreeNav, type NavLevel } from './hooks/useTreeNav';
import type { CrateVoice, VoiceRole } from './types';

declare global {
  interface Window {
    initStrudel: () => Promise<void>;
    evaluate: (code: string) => unknown;
    hush: () => void;
    samples: (source: string) => Promise<void>;
  }
}

type AppView = 'landing' | 'perform';
type SavedTake = { title: string; duration: string };
type WorkshopStageSeed = {
  layerId: string;
  label: string;
  code: string;
  role: VoiceRole;
} | null;

function extractBpm(code: string): number {
  const match = code.match(/setCps\((?:slider\()?([\d.]+)/);
  return match ? parseFloat(match[1]) : 120;
}

function guessRole(label: string, code = ''): VoiceRole | null {
  const haystack = `${label} ${code}`.toLowerCase();
  if (haystack.includes('kick') || haystack.includes('bd')) return 'kick';
  if (haystack.includes('hat') || haystack.includes('hh')) return 'hats';
  if (haystack.includes('snare') || haystack.includes('sd') || haystack.includes('clap') || haystack.includes('cp')) return 'snare';
  if (haystack.includes('bass') || haystack.includes('sub')) return 'bass';
  if (haystack.includes('pad') || haystack.includes('chord') || haystack.includes('supersaw') || haystack.includes('rhodes')) return 'pad';
  if (haystack.includes('lead') || haystack.includes('melody')) return 'lead';
  if (haystack.includes('texture') || haystack.includes('noise') || haystack.includes('dust')) return 'texture';
  if (haystack.includes('perc') || haystack.includes('rim') || haystack.includes('tom') || haystack.includes('tabla')) return 'perc';
  if (haystack.includes('fx') || haystack.includes('cr') || haystack.includes('impact') || haystack.includes('swell')) return 'fx';
  return null;
}


function buildBaseCodeForNewVoice(currentCode: string, bpm: number): string {
  if (currentCode.trim()) return currentCode;
  return `setCps(${Math.round(bpm)}/60/4)`;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function CompactStageLane({
  index,
  code,
  sliderOffset,
  label,
  muted,
  onToggleMute,
  onToggleSolo,
  isSoloed,
  onSliderChange,
}: {
  index: number;
  code: string;
  sliderOffset: number;
  label: string;
  muted: boolean;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  isSoloed: boolean;
  onSliderChange: (globalIndex: number, value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="w-4 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{index + 1}</span>
      <span className="text-[12px]" style={{ color: '#ffffff' }}>{label}</span>
      {!muted && (
        <div className="min-w-[110px]" onClick={(event) => event.stopPropagation()}>
          <SliderRow
            code={code}
            onSliderChange={onSliderChange}
            sliderOffset={sliderOffset}
            limit={1}
          />
        </div>
      )}
      <div className="flex-1" />
      {muted && <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>MUTED</span>}
      <button
        type="button"
        onClick={onToggleMute}
        className="text-[10px] cursor-pointer"
        style={{ color: muted ? '#ff9d84' : 'rgba(255,255,255,0.35)' }}
      >
        [m]
      </button>
      <button
        type="button"
        onClick={onToggleSolo}
        className="text-[10px] cursor-pointer"
        style={{ color: isSoloed ? '#88ff88' : 'rgba(255,255,255,0.35)' }}
      >
        [s]
      </button>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [code, setCode] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [savedTake, setSavedTake] = useState<SavedTake | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [soloId, setSoloId] = useState<string | null>(null);
  const [crate, setCrate] = useState<CrateVoice[]>(() => loadCrate());
  const [previewVoice, setPreviewVoice] = useState<CrateVoice | null>(null);
  const [workshopStageSeed, setWorkshopStageSeed] = useState<WorkshopStageSeed>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const strudelReady = useRef(false);
  const evalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCode = useRef('');
  const isPlayingRef = useRef(false);
  const mutedIdsRef = useRef<Set<string>>(new Set());
  const soloIdRef = useRef<string | null>(null);

  isPlayingRef.current = isPlaying;
  mutedIdsRef.current = mutedIds;
  soloIdRef.current = soloId;

  useEffect(() => {
    saveCrate(crate);
  }, [crate]);

  useEffect(() => {
    if (!statusMessage) return undefined;
    const timeout = setTimeout(() => setStatusMessage(null), 2400);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  useEffect(() => {
    if (!isRecording) {
      setRecordSeconds(0);
      return undefined;
    }
    const interval = setInterval(() => setRecordSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const { preamble, layers } = useMemo(() => {
    if (!code) return { preamble: '', layers: [] };
    return parseLayers(code);
  }, [code]);

  const bpm = extractBpm(code || 'setCps(120/60/4)');

  const layerOffsets = useMemo(() => {
    let offset = countSliders(preamble);
    return layers.map((layer) => {
      const currentOffset = offset;
      offset += countSliders(layer.code);
      return currentOffset;
    });
  }, [layers, preamble]);

  const ensureStrudel = async () => {
    if (strudelReady.current) return;
    if (typeof window.initStrudel === 'function') {
      await window.initStrudel();
      try {
        if (typeof window.samples === 'function') {
          await window.samples('github:tidalcycles/dirt-samples');
        }
      } catch (samplesError) {
        console.warn('Samples:', samplesError);
      }
      strudelReady.current = true;
    }
  };

  const buildEvalCode = (codeString: string, muted: Set<string>, solo: string | null): string => {
    const parsed = parseLayers(codeString);
    const layersWithTransportState = parsed.layers.map((layer) => ({
      ...layer,
      muted: solo ? layer.id !== solo : muted.has(layer.id),
    }));
    return stripSliders(reconstructCode(parsed.preamble, layersWithTransportState, null));
  };

  const evalStrudel = async (
    codeString: string,
    muted?: Set<string>,
    solo?: string | null,
  ): Promise<boolean> => {
    try {
      await ensureStrudel();
      const evalCode = buildEvalCode(codeString, muted ?? mutedIdsRef.current, solo ?? soloIdRef.current);
      window.evaluate(evalCode);
      setError(null);
      return true;
    } catch (evalError: any) {
      setError(evalError.message);
      return false;
    }
  };

  const restoreStageAudio = useCallback(async () => {
    if (isPlayingRef.current && code) {
      await evalStrudel(code, mutedIdsRef.current, soloIdRef.current);
    } else {
      try {
        window.hush();
      } catch {}
    }
    setPreviewVoice(null);
  }, [code]);

  const handleSliderChange = useCallback((globalIndex: number, value: number) => {
    setCode((previousCode) => {
      const updated = updateSliderInCode(previousCode, globalIndex, value);
      pendingCode.current = updated;
      return updated;
    });

    if (evalTimer.current) clearTimeout(evalTimer.current);
    evalTimer.current = setTimeout(() => {
      if (isPlayingRef.current && pendingCode.current) {
        try {
          const evalCode = buildEvalCode(pendingCode.current, mutedIdsRef.current, soloIdRef.current);
          window.evaluate(evalCode);
        } catch {}
      }
    }, 50);
  }, []);

  const toggleMute = (layerId: string) => {
    const nextMutedIds = new Set(mutedIds);
    if (nextMutedIds.has(layerId)) nextMutedIds.delete(layerId);
    else nextMutedIds.add(layerId);
    setMutedIds(nextMutedIds);
    if (isPlayingRef.current && code) {
      void evalStrudel(code, nextMutedIds, soloId);
    }
  };

  const toggleSolo = (layerId: string) => {
    const nextSoloId = soloId === layerId ? null : layerId;
    setSoloId(nextSoloId);
    if (isPlayingRef.current && code) {
      void evalStrudel(code, mutedIds, nextSoloId);
    }
  };

  const appendVoiceToStage = async (voiceCode: string, label: string) => {
    if (previewVoice) await restoreStageAudio();
    setSavedTake(null);
    const base = buildBaseCodeForNewVoice(code, bpm);
    const nextCode = `${base}\n\n// ${label}\n${voiceCode}`;
    if (code) setHistory((previous) => [...previous, code]);
    setCode(nextCode);
    if (!isPlayingRef.current) {
      const ok = await evalStrudel(nextCode, new Set(), null);
      if (ok) setIsPlaying(true);
    } else {
      await evalStrudel(nextCode, mutedIds, soloId);
    }
    setStatusMessage(`${label} staged`);
  };

  const updateLayerCode = async (layerId: string, nextLayerCode: string) => {
    const parsed = parseLayers(code);
    const nextLayers = parsed.layers.map((layer) => (
      layer.id === layerId ? { ...layer, code: nextLayerCode } : layer
    ));
    const nextCode = reconstructCode(parsed.preamble, nextLayers, null);
    setCode(nextCode);
    if (isPlayingRef.current) await evalStrudel(nextCode, mutedIds, soloId);
  };

  const updateLayerSound = async (layerId: string, nextSound: string) => {
    const targetLayer = layers.find((layer) => layer.id === layerId);
    if (!targetLayer) return;
    await updateLayerCode(layerId, updateSoundInCode(targetLayer.code, nextSound));
  };

  const removeLayer = async (layerId: string) => {
    const parsed = parseLayers(code);
    const nextLayers = parsed.layers.filter((layer) => layer.id !== layerId);
    const nextCode = reconstructCode(parsed.preamble, nextLayers, null);
    setHistory((previous) => [...previous, code]);
    setCode(nextCode);
    const nextMutedIds = new Set(mutedIds);
    nextMutedIds.delete(layerId);
    setMutedIds(nextMutedIds);
    const nextSoloId = soloId === layerId ? null : soloId;
    setSoloId(nextSoloId);
    if (isPlayingRef.current) {
      if (nextCode.trim()) await evalStrudel(nextCode, nextMutedIds, nextSoloId);
      else {
        try {
          window.hush();
        } catch {}
        setIsPlaying(false);
      }
    }
  };

  const previewWorkshopVoice = async (voice: CrateVoice) => {
    if (previewVoice && previewVoice.id === voice.id && previewVoice.code === voice.code) {
      await restoreStageAudio();
      return;
    }
    const previewBase = code.trim() ? code : buildBaseCodeForNewVoice('', bpm);
    const previewCode = `${previewBase}\n\n// ${voice.name}\n${voice.code}`;
    const ok = await evalStrudel(previewCode, mutedIds, soloId);
    if (ok) setPreviewVoice(voice);
  };


  const handlePlay = async () => {
    if (!code) return;
    const ok = await evalStrudel(code);
    if (ok) setIsPlaying(true);
  };

  const handleStop = () => {
    try {
      window.hush();
    } catch {}
    setIsPlaying(false);
    setPreviewVoice(null);
  };

  const handleRecordToggle = async () => {
    if (!isRecording) {
      if (!code) return;
      if (!isPlayingRef.current) {
        const ok = await evalStrudel(code);
        if (ok) setIsPlaying(true);
      }
      setSavedTake(null);
      setIsRecording(true);
      return;
    }

    setIsRecording(false);
    handleStop();
    setSavedTake({
      title: `live take ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      duration: formatDuration(recordSeconds),
    });
    setMutedIds(new Set());
    setSoloId(null);
    setCode('');
  };

  const handleStartNewSet = () => {
    setSavedTake(null);
    setMutedIds(new Set());
    setSoloId(null);
    setPreviewVoice(null);
    setCode('');
  };

  const hasCode = !!code;
  const stagedVoiceNames = useMemo(() => new Set(layers.map((layer) => layer.label)), [layers]);

  // Refs for callbacks that need current values without causing re-renders
  const selectedLayerRef = useRef<string | null>(null);

  const openWorkshopCb = useCallback(() => {
    setSavedTake(null);
    const selectedLayerId = selectedLayerRef.current;
    if (!selectedLayerId) {
      setWorkshopStageSeed(null);
      return;
    }

    const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
    if (!selectedLayer) {
      setWorkshopStageSeed(null);
      return;
    }

    setWorkshopStageSeed({
      layerId: selectedLayer.id,
      label: selectedLayer.label,
      code: selectedLayer.code,
      role: guessRole(selectedLayer.label, selectedLayer.code) ?? 'bass',
    });
  }, [layers]);

  const undoCb = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCode(previous);
    if (isPlayingRef.current && previous.trim()) {
      void evalStrudel(previous, mutedIds, soloId);
    } else if (!previous.trim()) {
      try { window.hush(); } catch {}
      setIsPlaying(false);
    }
    setStatusMessage('undo');
  }, [history, mutedIds, soloId]);

  const closeWorkshopCb = useCallback(() => {
    setWorkshopStageSeed(null);
    void restoreStageAudio();
  }, [restoreStageAudio]);


  const nav = useTreeNav({
    layers,
    crate,
    stagedVoiceNames,
    workshopVisibleCount: 6,
    workshopRoleCount: 6,
    toggleMute,
    toggleSolo,
    removeLayer,
    appendVoiceToStage,
    updateLayerCode,
    handlePlay,
    handleStop,
    handleRecordToggle: () => handleRecordToggle(),
    undo: undoCb,
    openWorkshop: openWorkshopCb,
    closeWorkshop: closeWorkshopCb,
    onWorkshopChangeRole: () => {},
    onWorkshopSelectVariant: () => {},
    onWorkshopStageVariant: () => {},
    onWorkshopPreviewVariant: () => {},
    isPlaying,
  });

  // Keep ref in sync for callbacks
  selectedLayerRef.current = nav.selectedLayerId;


  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('perform')} />;
  }

  return (
    <div className="h-screen flex flex-col select-none overflow-hidden" style={{ background: '#0000cc' }}>
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-[0.22em] text-white">CONDUCTOR</span>
            {statusMessage && <span className="text-[10px]" style={{ color: '#88ff88' }}>{statusMessage}</span>}
            {error && <span className="text-[10px]" style={{ color: '#ff9d84' }}>{error}</span>}
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            {isPlaying && <span style={{ color: '#88ff88' }}>▶ playing</span>}
            {isRecording && <span style={{ color: '#ff9d84' }}>● REC {formatDuration(recordSeconds)}</span>}
          </div>
        </div>
      </div>

      <div className="shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.15)', minHeight: '80px' }}>
        <div className="px-4 py-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          score
        </div>
        {layers.length > 0 ? (
          <SequencerOverview
            layers={layers}
            mutedIds={mutedIds}
            soloId={soloId}
            focusedLayerId={nav.selectedLayerId}
            isPlaying={isPlaying}
            bpm={bpm}
            onFocusLayer={(id) => {
              const idx = layers.findIndex((l) => l.id === id);
              if (idx >= 0) nav.jumpToLane(idx);
            }}
            onToggleMute={toggleMute}
            onToggleSolo={toggleSolo}
          />
        ) : (
          <div className="px-4 pb-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.32)' }}>
            {savedTake ? '— take complete —' : '— no active voices —'}
          </div>
        )}
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: Stage area */}
        <div className="flex-1 overflow-auto" style={{ background: 'rgba(0,0,0,0.08)' }}>
          {savedTake ? (
            <div className="h-full flex items-center justify-center px-4 py-8">
              <div className="w-full max-w-xl p-6" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-lg text-white">TAKE SAVED</div>
                <div className="mt-6 text-base text-white">{savedTake.title}</div>
                <div className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>duration: {savedTake.duration}</div>
                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={handleStartNewSet}
                    className="px-3 py-1.5 text-[11px] cursor-pointer"
                    style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
                  >
                    start new set
                  </button>
                </div>
              </div>
            </div>
          ) : !hasCode ? (
            <div className="h-full flex flex-col items-center justify-center px-4 text-center">
              <div className="text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                tab to navigate · enter to open · esc to go back
              </div>
              <div className="mt-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                press tab to start
              </div>
              <div className="mt-8 space-y-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                <div>C — Crate (browse your catalog)</div>
                <div>W — Workshop (write new pieces)</div>
                <div>Spacebar — Play / Stop</div>
                <div>R — Record</div>
              </div>
            </div>
          ) : (
            <div className="py-3">
              {layers.map((layer, index) => (
                <LayerCard
                  key={layer.id}
                  layer={layer}
                  index={index}
                  sliderOffset={layerOffsets[index]}
                  onSliderChange={handleSliderChange}
                  onToggleMute={() => toggleMute(layer.id)}
                  onToggleSolo={() => toggleSolo(layer.id)}
                  onFocus={() => {
                    if (nav.selectedLayerId === layer.id && nav.navLevel === 'stage') {
                      nav.enterLane(index);
                    } else {
                      nav.jumpToLane(index);
                    }
                  }}
                  onUpdateCode={(nextCode) => updateLayerCode(layer.id, nextCode)}
                  onChangeSound={(nextSound) => updateLayerSound(layer.id, nextSound)}
                  isMuted={mutedIds.has(layer.id)}
                  isSoloed={soloId === layer.id}
                  isSelected={nav.selectedLayerId === layer.id}
                  navLevel={nav.selectedLayerId === layer.id ? nav.navLevel : 'stage'}
                  lineIndex={nav.selectedLayerId === layer.id ? nav.lineIndex : -1}
                  isPlaying={isPlaying}
                  bpm={bpm}
                  disabled={false}
                />
              ))}
            </div>
          )}
        </div>
        {/* Right: Workshop drawer */}
        <div
          className="shrink-0 min-h-0"
          style={{
            width: nav.workshopOpen ? 'min(52vw, 760px)' : '22px',
            borderLeft: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(0,0,0,0.18)',
            transition: 'width 180ms ease',
          }}
        >
          {nav.workshopOpen ? (
            <div className="h-full overflow-auto">
              <WorkshopOverlay
                crate={crate}
                stagedVoiceNames={stagedVoiceNames}
                previewingId={previewVoice?.id ?? null}
                navLevel={nav.navLevel}
                workshopTabIndex={nav.workshopTabIndex}
                initialRole={workshopStageSeed?.role}
                initialStageSeed={workshopStageSeed}
                onClose={() => {
                  closeWorkshopCb();
                  nav.closeWorkshopPanel();
                }}
                onPreview={previewWorkshopVoice}
                onStopPreview={() => {
                  void restoreStageAudio();
                }}
                onAddToStage={async (voice) => {
                  await appendVoiceToStage(voice.code, voice.name);
                }}
                onRemoveFromCrate={(voiceId) => {
                  setCrate((prev) => prev.filter((v) => v.id !== voiceId));
                }}
                onAddToCrate={(voice) => {
                  setCrate((prev) => [...prev, voice]);
                }}
                onUpdateCrateVoice={(voiceId, updates) => {
                  setCrate((prev) => prev.map((v) => (
                    v.id === voiceId ? { ...v, name: updates.name, code: updates.code } : v
                  )));
                }}
                onApplyToLane={(layerId, nextCode) => {
                  const targetLayer = layers.find((layer) => layer.id === layerId);
                  if (targetLayer) setStatusMessage(`updated ${targetLayer.label}`);
                  void updateLayerCode(layerId, nextCode);
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={nav.openWorkshopPanel}
              className="h-full w-full flex items-center justify-center cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              aria-label="Open workshop"
              title="Open workshop"
            >
              <span className="text-[18px]" style={{ transform: 'translateX(-1px)' }}>‹</span>
            </button>
          )}
        </div>
      </div>

      <div className="shrink-0 px-4 py-1.5 flex items-center justify-between text-[9px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.22)' }}>
        <div>
          {nav.navLevel === 'parameter'
            ? '←→ adjust · shift large step · tab next param · esc back'
            : nav.navLevel === 'lane'
              ? 'tab next line · enter adjust · e edit · esc back · m mute'
              : nav.navLevel === 'crate-role'
                ? '↑↓ navigate voices · ←→ switch role · enter stage · esc back'
              : nav.navLevel === 'crate'
                ? 'tab switch role · enter browse voices · esc close'
              : nav.workshopOpen
                ? 'click to edit · p preview · esc close · w toggle'
                : savedTake
                  ? 'esc dismiss'
                    : layers.length > 0
                    ? 'tab navigate · enter open · m mute · x remove · w workshop'
                    : 'tab navigate · enter load · w workshop'
          }
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)' }}>
          {nav.navLevel === 'parameter' ? 'PARAMETER'
            : nav.navLevel === 'crate-role' ? 'CRATE'
            : nav.navLevel === 'crate' ? 'CRATE'
            : nav.navLevel === 'lane' ? 'LANE'
            : nav.navLevel === 'workshop-variant' ? 'VARIANT'
            : nav.navLevel === 'workshop-parameter' ? 'PARAMETER'
            : nav.workshopOpen ? 'WORKSHOP'
            : savedTake ? 'TAKE' : 'STAGE'}
        </div>
      </div>

      <SetDock
        crate={crate}
        stagedVoiceNames={stagedVoiceNames}
        crateIsOpen={nav.crateIsOpen}
        crateRoleIndex={nav.crateRoleIndex}
        crateVoiceIndex={nav.crateVoiceIndex}
        navLevel={nav.navLevel}
        crateHighlighted={nav.crateHighlighted}
        onOpenCrate={nav.openCrate}
        onOpenCrateRole={nav.openCrateRole}
        onAddVoice={appendVoiceToStage}
        onRemoveVoice={(name) => {
          const layer = layers.find((l) => l.label === name);
          if (layer) void removeLayer(layer.id);
        }}
      />
    </div>
  );
}
