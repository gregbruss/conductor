import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import InteractiveCode, { updateSliderInCode, stripSliders, countSliders } from './components/InteractiveCode';
import LayerCard from './components/LayerCard';
import SequencerOverview from './components/SequencerOverview';
import SetDock from './components/SetDock';
import LandingPage from './components/LandingPage';
import WorkshopOverlay from './components/WorkshopOverlay';
import { parseLayers, reconstructCode } from './lib/parser';
import { loadCrate, saveCrate, createCrateVoice } from './lib/crateStore';
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
type CrateRole = VoiceRole | 'all';

const WORKSHOP_SEEDS: Record<VoiceRole, string> = {
  kick: `// kick seed
$: s("bd*4")
.gain(slider(1.0, 0, 1.5))
.lpf(slider(200, 60, 500))`,
  hats: `// hats seed
$: s("hh*16")
.gain(slider(0.5, 0, 1.5))
.hpf(slider(6000, 1500, 12000))`,
  snare: `// snare seed
$: s("[~ sd] [~ sd]")
.gain(slider(0.9, 0, 1.5))
.room(slider(0.2, 0, 1))`,
  bass: `// bass seed
$: note("<c2 eb2>")
.s("sawtooth")
.gain(slider(0.8, 0, 1.5))
.lpf(slider(400, 100, 1600))`,
  pad: `// pad seed
$: note("<c4 eb4 g4 bb4>")
.s("supersaw")
.gain(slider(0.5, 0, 1.5))
.room(slider(0.4, 0, 1))`,
  lead: `// lead seed
$: note("<c5 eb5 g5>")
.s("square")
.gain(slider(0.7, 0, 1.5))
.delay(slider(0.15, 0, 0.8))`,
  texture: `// texture seed
$: s("<hh ~ rim ~>")
.gain(slider(0.4, 0, 1.5))
.room(slider(0.35, 0, 1))
.hpf(slider(4200, 800, 12000))`,
  perc: `// percussion seed
$: s("<rim cp rim ~>")
.gain(slider(0.7, 0, 1.5))
.hpf(slider(1800, 400, 6000))`,
  fx: `// fx seed
$: s("<cr ~ ~ ~>")
.gain(slider(0.6, 0, 1.5))
.delay(slider(0.3, 0, 1))
.room(slider(0.4, 0, 1))`,
};

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
  if (haystack.includes('texture') || haystack.includes('dust') || haystack.includes('noise') || haystack.includes('air')) return 'texture';
  if (haystack.includes('perc') || haystack.includes('rim') || haystack.includes('tom')) return 'perc';
  if (haystack.includes('fx') || haystack.includes('cr') || haystack.includes('impact')) return 'fx';
  return null;
}

function buildBaseCodeForNewVoice(currentCode: string, bpm: number): string {
  if (currentCode.trim()) return currentCode;
  return `setCps(${Math.round(bpm)}/60/4)`;
}

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [code, setCode] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [soloId, setSoloId] = useState<string | null>(null);
  const [focusedLayerId, setFocusedLayerId] = useState<string | null>(null);
  const [crate, setCrate] = useState<CrateVoice[]>(() => loadCrate());
  const [crateRole, setCrateRole] = useState<CrateRole>('all');
  const [workshopOpen, setWorkshopOpen] = useState(false);
  const [workshopRole, setWorkshopRole] = useState<CrateRole>('all');
  const [generatedVoices, setGeneratedVoices] = useState<CrateVoice[]>([]);
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);
  const [phraseCount, setPhraseCount] = useState(0);
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

  const { preamble, layers } = useMemo(() => {
    if (!code) return { preamble: '', layers: [] };
    return parseLayers(code);
  }, [code]);

  const bpm = extractBpm(code || 'setCps(120/60/4)');
  const focusedLayer = layers.find((layer) => layer.id === focusedLayerId) || null;
  const focusedRole = focusedLayer ? guessRole(focusedLayer.label, focusedLayer.code) : null;

  const layerOffsets = useMemo(() => {
    let offset = countSliders(preamble);
    return layers.map((layer) => {
      const currentOffset = offset;
      offset += countSliders(layer.code);
      return currentOffset;
    });
  }, [layers, preamble]);

  useEffect(() => {
    if (!isPlaying) {
      setPhraseCount(0);
      return undefined;
    }
    const barMs = (60 / bpm) * 4 * 1000;
    const interval = setInterval(() => setPhraseCount((value) => value + 1), barMs);
    return () => clearInterval(interval);
  }, [bpm, isPlaying]);

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
    setPreviewVoiceId(null);
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

  const replaceWholeCode = async (nextCode: string) => {
    setCode(nextCode);
    setMutedIds(new Set());
    setSoloId(null);
    if (isPlayingRef.current) {
      await evalStrudel(nextCode, new Set(), null);
    }
  };

  const toggleMute = (layerId: string) => {
    const nextMutedIds = new Set(mutedIds);
    if (nextMutedIds.has(layerId)) nextMutedIds.delete(layerId);
    else nextMutedIds.add(layerId);
    setMutedIds(nextMutedIds);
    if (isPlaying) {
      try {
        window.evaluate(buildEvalCode(code, nextMutedIds, soloId));
      } catch {}
    }
  };

  const toggleSolo = (layerId: string) => {
    const nextSoloId = soloId === layerId ? null : layerId;
    setSoloId(nextSoloId);
    if (isPlaying) {
      try {
        window.evaluate(buildEvalCode(code, mutedIds, nextSoloId));
      } catch {}
    }
  };

  const callApi = async (
    currentCode: string,
    direction: string,
    isRetry = false,
    retryError = '',
  ): Promise<string | null> => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCode, direction, isRetry, retryError }),
      });
      if (!response.ok) throw new Error('API error');
      const payload = await response.json();
      return payload.code;
    } catch {
      return null;
    }
  };

  const createWorkshopVoice = (rawCode: string, fallbackRole: VoiceRole, prompt: string): CrateVoice | null => {
    const parsed = parseLayers(rawCode);
    const firstLayer = parsed.layers[0];
    if (!firstLayer) return null;
    const role = guessRole(firstLayer.label, firstLayer.code) || fallbackRole;
    return createCrateVoice({
      name: firstLayer.label,
      description: prompt || `Generated ${role} voice`,
      role,
      code: firstLayer.code,
      tags: [role, 'generated'],
    });
  };

  const handleGenerateWorkshopVoice = async (role: VoiceRole, prompt: string) => {
    setIsGenerating(true);
    const seedCode = `setCps(${Math.round(bpm)}/60/4)\n\n${WORKSHOP_SEEDS[role]}`;
    const direction = [
      `Create a single ${role} voice for Conductor's crate.`,
      prompt,
      'Return one labeled layer only.',
      'Keep it performance-ready and use slider() for tweakable parameters.',
      'Do not include multiple voices.',
    ].join(' ');

    const generatedCode = await callApi(seedCode, direction);
    if (generatedCode) {
      const candidate = createWorkshopVoice(generatedCode, role, prompt);
      if (candidate) {
        setGeneratedVoices((previous) => [candidate, ...previous]);
        setStatusMessage(`Generated ${candidate.name}`);
      }
    }
    setIsGenerating(false);
  };

  const appendVoiceToStage = async (voiceCode: string, label: string) => {
    if (previewVoiceId) await restoreStageAudio();
    const base = buildBaseCodeForNewVoice(code, bpm);
    const nextCode = `${base}\n\n// ${label}\n${voiceCode}`;
    if (code) setHistory((previous) => [...previous, code]);
    setCode(nextCode);
    const nextLayers = parseLayers(nextCode).layers;
    setFocusedLayerId(nextLayers[nextLayers.length - 1]?.id ?? null);
    if (!isPlayingRef.current) {
      const ok = await evalStrudel(nextCode, new Set(), null);
      if (ok) setIsPlaying(true);
    } else {
      await evalStrudel(nextCode, mutedIds, soloId);
    }
  };

  const updateLayerCode = async (layerId: string, nextLayerCode: string) => {
    const parsed = parseLayers(code);
    const nextLayers = parsed.layers.map((layer) => (
      layer.id === layerId
        ? { ...layer, code: nextLayerCode }
        : layer
    ));
    const nextCode = reconstructCode(parsed.preamble, nextLayers, null);
    setHistory((previous) => [...previous, code]);
    setCode(nextCode);
    if (isPlayingRef.current) await evalStrudel(nextCode, mutedIds, soloId);
  };

  const duplicateLayer = async (layerId: string) => {
    const parsed = parseLayers(code);
    const sourceIndex = parsed.layers.findIndex((layer) => layer.id === layerId);
    if (sourceIndex === -1) return;
    const sourceLayer = parsed.layers[sourceIndex];
    const duplicated = {
      ...sourceLayer,
      label: `${sourceLayer.label} copy`,
    };
    const nextLayers = [...parsed.layers];
    nextLayers.splice(sourceIndex + 1, 0, duplicated);
    const nextCode = reconstructCode(parsed.preamble, nextLayers, null);
    setHistory((previous) => [...previous, code]);
    setCode(nextCode);
    const reparsed = parseLayers(nextCode).layers;
    setFocusedLayerId(reparsed[sourceIndex + 1]?.id ?? null);
    if (isPlayingRef.current) await evalStrudel(nextCode, mutedIds, soloId);
  };

  const saveLayerToCrate = (layerId: string) => {
    const targetLayer = layers.find((layer) => layer.id === layerId);
    if (!targetLayer) return;
    const role = guessRole(targetLayer.label, targetLayer.code) || 'texture';
    const exists = crate.some((voice) => voice.name === targetLayer.label && voice.code === targetLayer.code);
    if (exists) {
      setStatusMessage(`${targetLayer.label} is already in the crate`);
      return;
    }
    const nextVoice = createCrateVoice({
      name: targetLayer.label,
      description: 'Saved from stage',
      role,
      code: targetLayer.code,
      tags: [role, 'stage'],
    });
    setCrate((previous) => [...previous, nextVoice]);
    setStatusMessage(`Saved ${targetLayer.label} to the crate`);
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

  const removeLayer = async (layerId: string) => {
    const parsed = parseLayers(code);
    const nextLayers = parsed.layers.filter((layer) => layer.id !== layerId);
    const nextCode = reconstructCode(parsed.preamble, nextLayers, null);
    setHistory((previous) => [...previous, code]);
    setCode(nextCode);
    setFocusedLayerId((current) => (current === layerId ? null : current));
    const nextMutedIds = new Set(mutedIds);
    nextMutedIds.delete(layerId);
    setMutedIds(nextMutedIds);
    const nextSoloId = soloId === layerId ? null : soloId;
    setSoloId(nextSoloId);
    if (isPlayingRef.current) {
      if (nextCode.trim()) await evalStrudel(nextCode, nextMutedIds, nextSoloId);
      else handleStop();
    }
  };

  const previewWorkshopVoice = async (voice: CrateVoice) => {
    if (previewVoiceId === voice.id) {
      await restoreStageAudio();
      return;
    }
    const previewBase = code.trim() ? code : buildBaseCodeForNewVoice('', bpm);
    const previewCode = `${previewBase}\n\n// ${voice.name}\n${voice.code}`;
    const ok = await evalStrudel(previewCode, mutedIds, soloId);
    if (ok) setPreviewVoiceId(voice.id);
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
    setPreviewVoiceId(null);
  };

  const handleUndo = async () => {
    if (history.length === 0) return;
    const previousCode = history[history.length - 1];
    setHistory((previous) => previous.slice(0, -1));
    setMutedIds(new Set());
    setSoloId(null);
    setFocusedLayerId(null);
    await replaceWholeCode(previousCode);
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

      switch (event.key) {
        case 'm':
          if (focusedLayerId) toggleMute(focusedLayerId);
          break;
        case 's':
          if (focusedLayerId) toggleSolo(focusedLayerId);
          break;
        case 'Escape':
          if (workshopOpen) {
            restoreStageAudio().then(() => setWorkshopOpen(false));
          } else {
            setFocusedLayerId(null);
          }
          break;
        case ' ':
          event.preventDefault();
          if (isPlaying) handleStop();
          else handlePlay();
          break;
        default:
          if (/^[1-9]$/.test(event.key)) {
            const index = parseInt(event.key, 10) - 1;
            if (index < layers.length) {
              const targetId = layers[index].id;
              setFocusedLayerId((current) => (current === targetId ? null : targetId));
            }
          }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusedLayerId, isPlaying, layers, restoreStageAudio, workshopOpen]);

  const hasCode = !!code;

  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('perform')} />;
  }

  return (
    <div className="h-screen flex flex-col select-none overflow-hidden" style={{ background: '#0000cc' }}>
      <div
        className="px-4 py-2 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-4">
          <span className="font-bold tracking-widest text-xs">{'\u25C9'} CONDUCTOR</span>
          {hasCode && (
            <>
              <button
                onClick={isPlaying ? handleStop : handlePlay}
                className="text-[11px] px-2.5 py-1 cursor-pointer transition-all"
                style={{
                  color: isPlaying ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: isPlaying ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
              >
                {isPlaying ? '\u25A0 stop' : '\u25B6 play'}
              </button>
              <button
                className="text-[11px] px-2.5 py-1 transition-all cursor-not-allowed"
                style={{ color: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.06)' }}
                title="Audio take capture is not implemented yet."
              >
                rec soon
              </button>
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="text-[10px] cursor-pointer transition-colors disabled:opacity-10"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {'\u21BA'}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          {statusMessage && (
            <span style={{ color: '#88ff88' }}>{statusMessage}</span>
          )}
          {error && (
            <span className="text-[#ff8888] truncate max-w-52">// {error}</span>
          )}
          {hasCode && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>phrase: {String(phraseCount).padStart(2, '0')}</span>
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>{bpm} bpm</span>
              {isPlaying && (
                <span className="tracking-wider" style={{ color: '#88ff88' }}>
                  {'\u25CF'} live
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {hasCode && (
        <div>
          <div className="px-4 py-1 text-[9px] uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.12)' }}>
            score overview
          </div>
          <SequencerOverview
            layers={layers}
            mutedIds={mutedIds}
            soloId={soloId}
            focusedLayerId={focusedLayerId}
            isPlaying={isPlaying}
            bpm={bpm}
            onFocusLayer={(id) => setFocusedLayerId((current) => (current === id ? null : id))}
          />
        </div>
      )}

      <div className="flex-1 overflow-auto min-h-0">
        {!hasCode ? (
          <div className="h-full flex flex-col items-center justify-center px-4 text-center">
            <div className="text-lg font-bold tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.07)' }}>
              STAGE
            </div>
            <div className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Drag voices up from the crate or open the workshop.
            </div>
            <div className="mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.16)' }}>
              Beginners can start from the crate. Experts can perform in code.
            </div>
            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => setWorkshopOpen(true)}
                className="px-3 py-1.5 text-[11px] cursor-pointer transition-all"
                style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                open workshop
              </button>
              <button
                onClick={() => appendVoiceToStage(crate[0]?.code || WORKSHOP_SEEDS.kick, crate[0]?.name || 'sub weight')}
                className="px-3 py-1.5 text-[11px] cursor-pointer transition-all"
                style={{ color: '#88ff88', border: '1px solid rgba(136,255,136,0.18)' }}
              >
                load first voice
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2">
            {preamble && (
              <div className="px-4 py-1 mb-2">
                <InteractiveCode
                  code={preamble}
                  onSliderChange={handleSliderChange}
                  sliderOffset={0}
                  disabled={isGenerating}
                />
              </div>
            )}

            {layers.map((layer, index) => (
              <LayerCard
                key={layer.id}
                layer={layer}
                index={index}
                sliderOffset={layerOffsets[index]}
                onSliderChange={handleSliderChange}
                onToggleMute={() => toggleMute(layer.id)}
                onToggleSolo={() => toggleSolo(layer.id)}
                onFocus={() => setFocusedLayerId((current) => (current === layer.id ? null : layer.id))}
                onUpdateCode={(nextCode) => updateLayerCode(layer.id, nextCode)}
                onDuplicate={() => duplicateLayer(layer.id)}
                onSaveToCrate={() => saveLayerToCrate(layer.id)}
                onRemove={() => removeLayer(layer.id)}
                isMuted={mutedIds.has(layer.id)}
                isSoloed={soloId === layer.id}
                isFocused={focusedLayerId === layer.id}
                isPlaying={isPlaying}
                bpm={bpm}
                disabled={isGenerating}
              />
            ))}

            <div className="px-4 py-2 text-[9px] flex gap-4 flex-wrap" style={{ color: 'rgba(255,255,255,0.1)' }}>
              <span>space play/stop</span>
              <span>1-{Math.min(layers.length, 9)} select voice</span>
              <span>m mute</span>
              <span>s solo</span>
              <span>esc unfocus</span>
            </div>
          </div>
        )}
      </div>

      <SetDock
        crate={crate}
        activeRole={crateRole}
        focusedRole={focusedRole}
        onChangeRole={setCrateRole}
        onAddVoice={appendVoiceToStage}
        onOpenWorkshop={() => {
          setWorkshopRole(focusedRole ?? crateRole);
          setWorkshopOpen(true);
        }}
      />

      <WorkshopOverlay
        open={workshopOpen}
        role={workshopRole}
        generatedVoices={generatedVoices}
        crate={crate}
        previewingId={previewVoiceId}
        isGenerating={isGenerating}
        onClose={() => setWorkshopOpen(false)}
        onChangeRole={setWorkshopRole}
        onGenerate={handleGenerateWorkshopVoice}
        onPreview={previewWorkshopVoice}
        onStopPreview={restoreStageAudio}
        onSaveToCrate={saveWorkshopVoiceToCrate}
        onAddToStage={async (voice) => {
          await appendVoiceToStage(voice.code, voice.name);
          setWorkshopOpen(false);
        }}
      />
    </div>
  );
}
