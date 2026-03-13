import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Section } from './types';
import { parseLayers, reconstructCode } from './lib/parser';
import { highlight } from './lib/highlight';
import MixerLayer from './components/MixerLayer';
import Punchcard from './components/Punchcard';
import SectionBar from './components/SectionBar';

declare global {
  interface Window {
    initStrudel: () => Promise<void>;
    evaluate: (code: string) => any;
    hush: () => void;
    samples: (source: string) => Promise<void>;
  }
}

const DEFAULT_CODE = `setCps(120/60/4)
// kick
$: s("bd sd bd sd")
// hats
$: s("hh*8").gain(0.4)`;

const STARTER_VIBES = [
  { label: 'warehouse techno', prompt: 'Create a driving warehouse techno beat at 138 BPM with a pounding kick, acid bassline with filter sweep, and rolling hi-hats' },
  { label: 'deep house', prompt: 'Create a deep house groove at 122 BPM with a shuffled kick pattern, warm sub bass, smooth chords, and a shaker' },
  { label: 'ambient', prompt: 'Create a dreamy ambient pad with slow evolving chords, lots of reverb, and gentle movement' },
  { label: 'drum & bass', prompt: 'Create a drum and bass beat at 174 BPM with a fast breakbeat, deep rolling bass, and atmospheric pads' },
  { label: 'surprise me', prompt: 'Create something unexpected and creative. Surprise me with an interesting electronic genre.' },
];

function extractBpm(code: string): number | null {
  const m = code.match(/setCps\((\d+(?:\.\d+)?)\/60\/4\)/);
  return m ? Math.round(parseFloat(m[1])) : null;
}

export default function App() {
  const [currentCode, setCurrentCode] = useState(DEFAULT_CODE);
  const [lastWorkingCode, setLastWorkingCode] = useState(DEFAULT_CODE);
  const [codeHistory, setCodeHistory] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [command, setCommand] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showStarters, setShowStarters] = useState(true);
  const [changedLines, setChangedLines] = useState<Set<string>>(new Set());
  const [soloId, setSoloId] = useState<string | null>(null);

  // Sections
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [arrangementMode, setArrangementMode] = useState(false);
  const [arrangementIndex, setArrangementIndex] = useState(0);
  const arrangementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const strudelReady = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLayerCodes = useRef<Map<string, string>>(new Map());

  // Parse code into layers
  const { preamble, layers } = useMemo(() => parseLayers(currentCode), [currentCode]);

  // Track which layers changed for flash effect
  useEffect(() => {
    const newMap = new Map(layers.map(l => [l.id, l.code]));
    const changed = new Set<string>();
    for (const [id, code] of newMap) {
      if (prevLayerCodes.current.has(id) && prevLayerCodes.current.get(id) !== code) {
        changed.add(id);
      }
    }
    prevLayerCodes.current = newMap;
    if (changed.size > 0) {
      setChangedLines(changed);
      const t = setTimeout(() => setChangedLines(new Set()), 1200);
      return () => clearTimeout(t);
    }
  }, [layers]);

  const bpm = extractBpm(currentCode) || 120;

  // ---- Strudel engine ----

  const ensureStrudel = async () => {
    if (strudelReady.current) return;
    if (typeof window.initStrudel === 'function') {
      await window.initStrudel();
      try {
        if (typeof window.samples === 'function') {
          await window.samples('github:tidalcycles/dirt-samples');
        } else if (typeof window.evaluate === 'function') {
          window.evaluate("await samples('github:tidalcycles/dirt-samples')");
        }
      } catch (e) {
        console.warn('Sample loading:', e);
      }
      strudelReady.current = true;
    }
  };

  const evalCode = async (code: string): Promise<boolean> => {
    try {
      await ensureStrudel();
      if (typeof window.evaluate === 'function') {
        window.evaluate(code);
        setError(null);
        return true;
      }
      return false;
    } catch (e: any) {
      setError(e.message);
      if (code !== lastWorkingCode) {
        try { window.evaluate(lastWorkingCode); } catch {}
      }
      return false;
    }
  };

  // Re-evaluate when mute/solo changes
  const evalCurrent = useCallback(async () => {
    const code = reconstructCode(preamble, layers, soloId);
    await evalCode(code);
  }, [preamble, layers, soloId]);

  // ---- Transport controls ----

  const handlePlay = async () => {
    const code = reconstructCode(preamble, layers, soloId);
    const ok = await evalCode(code);
    if (ok) setIsPlaying(true);
  };

  const handleStop = () => {
    try { window.hush(); } catch {}
    setIsPlaying(false);
    setError(null);
    stopArrangement();
  };

  const handleUndo = async () => {
    if (codeHistory.length === 0) return;
    const prev = codeHistory[codeHistory.length - 1];
    setCodeHistory(h => h.slice(0, -1));
    setCurrentCode(prev);
    setLastWorkingCode(prev);
    setSoloId(null);
    if (isPlaying) await evalCode(prev);
  };

  // ---- Mixer controls ----

  const handleToggleMute = (layerId: string) => {
    const updated = layers.map(l =>
      l.id === layerId ? { ...l, muted: !l.muted } : l
    );
    const newCode = reconstructCode(preamble, updated, soloId);
    setCodeHistory(h => [...h, currentCode]);
    setCurrentCode(newCode);
    if (isPlaying) evalCode(newCode);
  };

  const handleToggleSolo = (layerId: string) => {
    const newSolo = soloId === layerId ? null : layerId;
    setSoloId(newSolo);
    const newCode = reconstructCode(preamble, layers, newSolo);
    if (isPlaying) evalCode(newCode);
  };

  // ---- AI generation ----

  const generateCode = async (direction: string) => {
    if (!direction.trim() || isGenerating) return;
    setIsGenerating(true);
    setShowStarters(false);
    if (!isPlaying) { await ensureStrudel(); setIsPlaying(true); }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCode, direction }),
      });
      if (!res.ok) throw new Error('API error');
      const { code: newCode } = await res.json();
      setCodeHistory(h => [...h, currentCode]);
      setCurrentCode(newCode);
      setSoloId(null);

      const ok = await evalCode(newCode);
      if (ok) {
        setLastWorkingCode(newCode);
      } else {
        try {
          const retry = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentCode: newCode, direction, isRetry: true, retryError: error || 'eval failed' }),
          });
          if (retry.ok) {
            const { code: fixed } = await retry.json();
            setCurrentCode(fixed);
            const fixOk = await evalCode(fixed);
            if (fixOk) setLastWorkingCode(fixed);
            else { setCurrentCode(lastWorkingCode); await evalCode(lastWorkingCode); }
          }
        } catch { setCurrentCode(lastWorkingCode); await evalCode(lastWorkingCode); }
      }
    } catch (e) {
      console.error('Generate error:', e);
    } finally {
      setIsGenerating(false);
      setCommand('');
      inputRef.current?.focus();
    }
  };

  // ---- Sections ----

  const handleSaveSection = (name: string) => {
    const section: Section = {
      id: `sec-${Date.now()}`,
      name,
      code: currentCode,
      bars: 8,
    };
    setSections(s => [...s, section]);
    setActiveSectionId(section.id);
  };

  const handleLoadSection = async (section: Section) => {
    setCodeHistory(h => [...h, currentCode]);
    setCurrentCode(section.code);
    setActiveSectionId(section.id);
    setSoloId(null);
    if (isPlaying) {
      const ok = await evalCode(section.code);
      if (ok) setLastWorkingCode(section.code);
    }
  };

  const handleDeleteSection = (id: string) => {
    setSections(s => s.filter(sec => sec.id !== id));
    if (activeSectionId === id) setActiveSectionId(null);
  };

  const handleUpdateBars = (id: string, bars: number) => {
    setSections(s => s.map(sec => sec.id === id ? { ...sec, bars } : sec));
  };

  // ---- Arrangement ----

  const stopArrangement = () => {
    setArrangementMode(false);
    if (arrangementTimer.current) { clearTimeout(arrangementTimer.current); arrangementTimer.current = null; }
  };

  const advanceArrangement = useCallback(async (index: number) => {
    if (sections.length === 0) return;
    const i = index % sections.length;
    const sec = sections[i];
    setArrangementIndex(i);
    setActiveSectionId(sec.id);
    setCurrentCode(sec.code);
    setSoloId(null);
    await evalCode(sec.code);
    setLastWorkingCode(sec.code);

    const secBpm = extractBpm(sec.code) || 120;
    const duration = sec.bars * (60 / secBpm) * 4 * 1000;
    arrangementTimer.current = setTimeout(() => advanceArrangement(i + 1), duration);
  }, [sections]);

  const handleToggleArrangement = async () => {
    if (arrangementMode) {
      stopArrangement();
    } else {
      setArrangementMode(true);
      if (!isPlaying) { await ensureStrudel(); setIsPlaying(true); }
      advanceArrangement(0);
    }
  };

  // Clean up arrangement timer on unmount
  useEffect(() => {
    return () => { if (arrangementTimer.current) clearTimeout(arrangementTimer.current); };
  }, []);

  // ---- Render ----

  return (
    <div className="h-screen flex flex-col select-none overflow-hidden" style={{ background: '#0000cc' }}>

      {/* TOP BAR */}
      <div className="px-4 py-2 flex items-center justify-between text-sm shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-4">
          <span className="font-bold tracking-widest">◉ CONDUCTOR</span>
          <button onClick={handlePlay} className="hover:text-[#88ff88] cursor-pointer transition-colors">
            [ ▶ {isPlaying ? 'playing' : 'play'} ]
          </button>
          <button onClick={handleUndo} disabled={codeHistory.length === 0}
            className="hover:text-[#88ff88] cursor-pointer transition-colors disabled:opacity-20">
            [ ↺ undo ]
          </button>
          <button onClick={handleStop} className="hover:text-[#ff4444] cursor-pointer transition-colors">
            [ ✕ stop ]
          </button>
        </div>
        <span className="text-[#8888cc]">// {bpm} bpm</span>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* MIXER / CODE AREA */}
        <div className="flex-1 overflow-auto min-h-0 px-4 py-3">

          {/* Starter vibes */}
          {showStarters && (
            <div className="mb-6">
              <div className="text-[#8888cc] text-sm mb-1">pick a vibe to start, or type your own below</div>
              <div className="flex flex-wrap gap-2 mt-3">
                {STARTER_VIBES.map((v, i) => (
                  <button key={i} onClick={() => generateCode(v.prompt)}
                    className="px-3 py-1.5 text-sm cursor-pointer transition-all hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
                    style={{ color: '#aaaaff', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-[#8888cc] text-sm mb-2">
              // ⚠ AI stumbled — keeping the groove
            </div>
          )}

          {/* Layers header */}
          {layers.length > 0 && !showStarters && (
            <div className="flex items-center justify-between mb-2 text-xs text-[#6666aa]">
              <span>{layers.length} layer{layers.length !== 1 ? 's' : ''} · {bpm} bpm</span>
              <span>click mute/solo to control layers</span>
            </div>
          )}

          {/* Layer rows */}
          {layers.map(layer => {
            const effectiveMuted = layer.muted || (soloId !== null && layer.id !== soloId);
            return (
              <MixerLayer
                key={layer.id}
                layer={layer}
                effectiveMuted={effectiveMuted}
                onToggleMute={() => handleToggleMute(layer.id)}
                onToggleSolo={() => handleToggleSolo(layer.id)}
                isPlaying={isPlaying}
                bpm={bpm}
                flash={changedLines.has(layer.id)}
              />
            );
          })}
        </div>

        {/* PUNCHCARD */}
        <div className="shrink-0" style={{ height: '22%', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Punchcard isPlaying={isPlaying} layers={layers} soloId={soloId} bpm={bpm} />
        </div>
      </div>

      {/* SECTION BAR */}
      <SectionBar
        sections={sections}
        activeSectionId={activeSectionId}
        arrangementMode={arrangementMode}
        arrangementIndex={arrangementIndex}
        onSave={handleSaveSection}
        onLoad={handleLoadSection}
        onDelete={handleDeleteSection}
        onUpdateBars={handleUpdateBars}
        onToggleArrangement={handleToggleArrangement}
      />

      {/* COMMAND BAR */}
      <div className="px-4 py-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <form onSubmit={(e) => { e.preventDefault(); generateCode(command); }} className="flex items-center gap-2">
          <span className="font-bold">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            disabled={isGenerating}
            placeholder="describe the vibe..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#6666aa] text-sm"
            autoFocus
          />
          {isGenerating && <span className="text-[#8888cc]">generating... █</span>}
        </form>
      </div>
    </div>
  );
}
