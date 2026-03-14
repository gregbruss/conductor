import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { countSliders, SliderRow, stripSliders, updateSliderInCode, updateSoundInCode } from './components/InteractiveCode';
import LayerCard from './components/LayerCard';
import SequencerOverview from './components/SequencerOverview';
import SetDock from './components/SetDock';
import LandingPage from './components/LandingPage';
import WorkshopOverlay from './components/WorkshopOverlay';
import { parseLayers, reconstructCode } from './lib/parser';
import { createCrateVoice, loadCrate, saveCrate } from './lib/crateStore';
import { useTreeNav } from './hooks/useTreeNav';
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
  if (haystack.includes('pad') || haystack.includes('chord') || haystack.includes('supersaw')) return 'pad';
  if (haystack.includes('lead') || haystack.includes('melody')) return 'lead';
  if (haystack.includes('texture') || haystack.includes('noise') || haystack.includes('dust')) return 'texture';
  if (haystack.includes('perc') || haystack.includes('rim') || haystack.includes('tom')) return 'perc';
  if (haystack.includes('fx') || haystack.includes('cr') || haystack.includes('impact')) return 'fx';
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
  const [workshopRole, setWorkshopRole] = useState<VoiceRole>('bass');
  const [workshopSeedVoice, setWorkshopSeedVoice] = useState<CrateVoice | null>(null);
  const [previewVoice, setPreviewVoice] = useState<CrateVoice | null>(null);
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
    const nextLayers = parseLayers(nextCode).layers;
    const nextId = nextLayers[nextLayers.length - 1]?.id ?? null;
    setSelectedLayerId(nextId);
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
    setSelectedLayerId((current) => (current === layerId ? null : current));
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

  const openWorkshop = (role?: VoiceRole, seedVoice?: CrateVoice | null) => {
    setSavedTake(null);
    const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
    const inferredRole = guessRole(selectedLayer?.label || '', selectedLayer?.code || '') || 'bass';
    setWorkshopRole(role ?? inferredRole);
    if (seedVoice) {
      setWorkshopSeedVoice(seedVoice);
    } else if (selectedLayer) {
      setWorkshopSeedVoice(createCrateVoice({
        name: selectedLayer.label,
        description: 'Shaping from stage',
        role: inferredRole,
        code: selectedLayer.code,
        tags: [inferredRole, 'stage'],
      }));
    } else {
      setWorkshopSeedVoice(null);
    }
    setWorkshopOpen(true);
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

  const saveWorkshopVoiceToCrate = (voice: CrateVoice) => {
    const exists = crate.some((crateVoice) => crateVoice.name === voice.name && crateVoice.code === voice.code);
    if (exists) {
      setStatusMessage(`${voice.name} is already in the crate`);
      return;
    }
    const nextVoice = createCrateVoice({
      name: voice.name,
      description: voice.description,
      role: voice.role,
      code: voice.code,
      tags: voice.tags,
    });
    setCrate((previous) => [...previous, nextVoice]);
    setStatusMessage(`Saved ${voice.name} to the crate`);
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
    setSelectedLayerId(null);
    setWorkshopOpen(false);
    setCode('');
  };

  const handleStartNewSet = () => {
    setSavedTake(null);
    setMutedIds(new Set());
    setSoloId(null);
    setSelectedLayerId(null);
    setWorkshopOpen(false);
    setWorkshopSeedVoice(null);
    setPreviewVoice(null);
    setCode('');
  };

  const hasCode = !!code;
  const stagedVoiceNames = useMemo(() => new Set(layers.map((layer) => layer.label)), [layers]);

  const nav = useTreeNav({
    layers,
    crate,
    stagedVoiceNames,
    workshopVisibleCount: 5,
    workshopRoleCount: 6,
    toggleMute,
    toggleSolo,
    removeLayer,
    appendVoiceToStage,
    updateLayerCode,
    handlePlay,
    handleStop,
    handleRecordToggle: () => handleRecordToggle(),
    undo: () => {
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
    },
    openWorkshop: () => {
      setSavedTake(null);
      const selectedLayer = layers.find((layer) => layer.id === nav.selectedLayerId);
      const inferredRole = guessRole(selectedLayer?.label || '', selectedLayer?.code || '') || 'bass';
      setWorkshopRole(inferredRole);
      if (selectedLayer) {
        setWorkshopSeedVoice(createCrateVoice({
          name: selectedLayer.label,
          description: 'Shaping from stage',
          role: inferredRole,
          code: selectedLayer.code,
          tags: [inferredRole, 'stage'],
        }));
      } else {
        setWorkshopSeedVoice(null);
      }
    },
    closeWorkshop: () => {
      setWorkshopSeedVoice(null);
      void restoreStageAudio();
    },
    onWorkshopChangeRole: (roleIndex) => {
      const roles: VoiceRole[] = ['kick', 'hats', 'bass', 'pad', 'texture', 'fx'];
      if (roleIndex < roles.length) setWorkshopRole(roles[roleIndex]);
    },
    onWorkshopSelectVariant: () => {},
    onWorkshopStageVariant: () => {},
    onWorkshopPreviewVariant: () => {},
    isPlaying,
  });


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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isPlaying ? handleStop : () => void handlePlay()}
              className="px-3 py-1.5 text-[11px] cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
            >
              {isPlaying ? '▶▶' : '▶'}
            </button>
            <button
              type="button"
              onClick={() => void handleRecordToggle()}
              className="px-3 py-1.5 text-[11px] cursor-pointer"
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                color: isRecording ? '#ff9d84' : '#ffffff',
              }}
            >
              {isRecording ? '■ stop' : '● rec'}
            </button>
          </div>
        </div>
        {isRecording && (
          <div className="mt-2 text-[10px]" style={{ color: '#ff9d84' }}>
            ● {formatDuration(recordSeconds)} REC
          </div>
        )}
      </div>

      <div className="shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.15)' }}>
        <div className="px-4 py-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          score
        </div>
        {layers.length > 0 ? (
          <SequencerOverview
            layers={layers}
            mutedIds={mutedIds}
            soloId={soloId}
            focusedLayerId={selectedLayerId}
            isPlaying={isPlaying}
            bpm={bpm}
            onFocusLayer={(id) => setSelectedLayerId((current) => (current === id ? null : id))}
            onToggleMute={toggleMute}
            onToggleSolo={toggleSolo}
          />
        ) : (
          <div className="px-4 pb-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.32)' }}>
            {savedTake ? '— take complete —' : '— no active voices —'}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto min-h-0" style={{ background: 'rgba(0,0,0,0.08)' }}>
        {savedTake ? (
          <div className="h-full flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-xl p-6" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-lg text-white">TAKE SAVED</div>
              <div className="mt-6 text-base text-white">{savedTake.title}</div>
              <div className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>duration: {savedTake.duration}</div>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 text-[11px]"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
                  title="Audio take playback comes later."
                >
                  ▶ play back
                </button>
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
        ) : workshopOpen ? (
          <div
            className="py-3"
            style={{ animation: 'workshopSlideIn 0.25s ease-out' }}
          >
            <style>{`
              @keyframes workshopSlideIn {
                from { opacity: 0; transform: translateY(24px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            {layers.length > 0 && (
              <div className="mx-4 mb-3" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.1)' }}>
                {layers.map((layer, index) => (
                  <CompactStageLane
                    key={layer.id}
                    index={index}
                    code={layer.code}
                    sliderOffset={layerOffsets[index]}
                    label={layer.label}
                    muted={mutedIds.has(layer.id)}
                    onToggleMute={() => toggleMute(layer.id)}
                    onToggleSolo={() => toggleSolo(layer.id)}
                    isSoloed={soloId === layer.id}
                    onSliderChange={handleSliderChange}
                  />
                ))}
              </div>
            )}
            <div className="mx-4">
              <WorkshopOverlay
                role={workshopRole}
                seedVoice={workshopSeedVoice}
                crate={crate}
                previewingId={previewVoice?.id ?? null}
                onClose={() => {
                  setWorkshopSeedVoice(null);
                  restoreStageAudio().then(() => setWorkshopOpen(false));
                }}
                onChangeRole={setWorkshopRole}
                onPreview={previewWorkshopVoice}
                onSaveToCrate={saveWorkshopVoiceToCrate}
                onAddToStage={async (voice) => {
                  await appendVoiceToStage(voice.code, voice.name);
                  setWorkshopSeedVoice(null);
                  setWorkshopOpen(false);
                }}
              />
            </div>
          </div>
        ) : !hasCode ? (
          <div className="h-full flex flex-col items-center justify-center px-4 text-center">
            <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.46)' }}>
              click a voice in the crate to begin
            </div>
            <div className="mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.24)' }}>
              or press 1–8 to load by number
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
                  setFocusMode(false);
                  setFocusedParamIndex(0);
                  setSelectedLayerId((current) => (current === layer.id ? null : layer.id));
                }}
                onUpdateCode={(nextCode) => updateLayerCode(layer.id, nextCode)}
                onChangeSound={(nextSound) => updateLayerSound(layer.id, nextSound)}
                isMuted={mutedIds.has(layer.id)}
                isSoloed={soloId === layer.id}
                isSelected={selectedLayerId === layer.id}
                focusMode={focusMode && selectedLayerId === layer.id}
                focusedParamIndex={selectedLayerId === layer.id ? focusedParamIndex : -1}
                isPlaying={isPlaying}
                bpm={bpm}
                disabled={false}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 py-1.5 flex items-center justify-between text-[9px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.22)' }}>
        <div>
          {focusMode
            ? '↑↓ nudge value · tab next param · shift+tab prev · esc exit focus'
            : workshopOpen
              ? 'esc close · w close'
              : savedTake
                ? 'esc dismiss'
                : layers.length > 0
                  ? `space ${isPlaying ? 'stop' : 'play'} · 1-${Math.min(layers.length, 8)} select · ↑↓ navigate · enter focus · m mute · x remove · w workshop`
                  : `space play · 1-${Math.min(crate.length, 8)} load · w workshop`
          }
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)' }}>
          {focusMode ? 'FOCUS' : workshopOpen ? 'WORKSHOP' : savedTake ? 'TAKE' : 'STAGE'}
        </div>
      </div>

      <SetDock
        crate={crate}
        stagedVoiceNames={stagedVoiceNames}
        workshopOpen={workshopOpen}
        onAddVoice={appendVoiceToStage}
        onRemoveVoice={(name) => {
          const layer = layers.find((l) => l.label === name);
          if (layer) void removeLayer(layer.id);
        }}
        onToggleWorkshop={() => {
          if (workshopOpen) {
            setWorkshopSeedVoice(null);
            restoreStageAudio().then(() => setWorkshopOpen(false));
          } else {
            openWorkshop();
          }
        }}
      />
    </div>
  );
}
