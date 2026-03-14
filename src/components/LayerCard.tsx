import { useEffect, useRef, useState, useCallback } from 'react';
import type { Layer } from '../types';
import { CodeDisplay, SliderRow } from './InteractiveCode';
import { generateRowGrid } from './Punchcard';
import { findAdjustableLines } from '../lib/codeNudge';
import type { NavLevel } from '../hooks/useTreeNav';

interface Props {
  layer: Layer;
  index: number;
  sliderOffset: number;
  onSliderChange: (globalIndex: number, value: number) => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onFocus: () => void;
  onUpdateCode: (code: string) => void;
  onChangeSound: (sound: string) => void;
  isMuted: boolean;
  isSoloed: boolean;
  isSelected: boolean;
  navLevel: NavLevel;
  lineIndex: number;
  isPlaying: boolean;
  bpm: number;
  disabled?: boolean;
}

function PulseStrip({
  code,
  isPlaying,
  dimmed,
  bpm,
}: {
  code: string;
  isPlaying: boolean;
  dimmed: boolean;
  bpm: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const grid = generateRowGrid(code);

  const draw = useCallback((ts: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const cols = 16;
    const gap = 2;
    const cellWidth = (width - gap * (cols + 1)) / cols;
    const cellHeight = height - gap * 2;

    if (!startRef.current && isPlaying) startRef.current = ts;
    const cycle = (60 / bpm) * 4 * 1000;
    const progress = isPlaying && startRef.current ? ((ts - startRef.current) % cycle) / cycle : -1;
    const playCol = progress >= 0 ? Math.floor(progress * cols) : -1;

    for (let col = 0; col < cols; col += 1) {
      const x = gap + col * (cellWidth + gap);
      const active = grid[col];
      const atHead = col === playCol;

      ctx.fillStyle = '#ffffff';
      if (dimmed) {
        ctx.globalAlpha = active ? 0.05 : 0.018;
      } else {
        ctx.globalAlpha = active ? (atHead && isPlaying ? 0.75 : 0.22) : 0.03;
      }
      ctx.fillRect(x, gap, cellWidth, cellHeight);

      if (active && atHead && isPlaying && !dimmed) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#88ff88';
        ctx.fillRect(x, gap, cellWidth, cellHeight);
      }
    }

    ctx.globalAlpha = 1;
    if (isPlaying && !dimmed) animRef.current = requestAnimationFrame(draw);
  }, [bpm, dimmed, grid, isPlaying]);

  useEffect(() => {
    startRef.current = 0;
    if (isPlaying && !dimmed) {
      animRef.current = requestAnimationFrame(draw);
    } else {
      requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [dimmed, draw, isPlaying]);

  return <canvas ref={canvasRef} className="block w-full" style={{ height: '18px' }} />;
}

function LineNavCodeView({ code, lineIndex, isParameterActive }: {
  code: string;
  lineIndex: number;
  isParameterActive: boolean;
}) {
  const lines = code.split('\n');
  const adjustable = findAdjustableLines(code);

  return (
    <div className="text-sm leading-relaxed" style={{ fontFamily: 'monospace' }}>
      {lines.map((line, i) => {
        const isFocused = i === lineIndex;
        const param = adjustable.find((a) => a.lineIndex === i);
        const isAdj = !!param;

        return (
          <div
            key={i}
            className="px-2 py-1 flex items-center gap-3 transition-colors"
            style={{
              background: isFocused ? 'rgba(136,255,136,0.12)' : 'transparent',
              borderLeft: isFocused ? '3px solid #88ff88' : '3px solid transparent',
            }}
          >
            {isFocused && isAdj && isParameterActive ? (
              <>
                <span style={{ color: '#88ff88' }}>.{param.label}(</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 relative" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="absolute top-0 left-0 h-full"
                      style={{
                        background: '#88ff88',
                        width: `${((param.value - param.min) / (param.max - param.min)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] shrink-0" style={{ color: '#88ff88', minWidth: '4ch' }}>
                    {param.max >= 100 ? Math.round(param.value) : param.value.toFixed(2)}
                  </span>
                </div>
                <span style={{ color: '#88ff88' }}>)</span>
              </>
            ) : (
              <>
                <span style={{ color: isFocused ? '#ffffff' : (isAdj ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)') }}>
                  {line}
                </span>
                {isAdj && !isFocused && (
                  <span className="text-[9px] ml-auto shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {param.label} {param.max >= 100 ? Math.round(param.value) : param.value.toFixed(2)}
                  </span>
                )}
                {isFocused && isAdj && (
                  <span className="text-[10px] ml-auto shrink-0" style={{ color: '#88ff88' }}>
                    ↵ {param.label}: {param.max >= 100 ? Math.round(param.value) : param.value.toFixed(2)}
                  </span>
                )}
                {isFocused && !isAdj && (
                  <span className="text-[9px] ml-auto shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    —
                  </span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LayerCard({
  layer,
  index,
  sliderOffset,
  onSliderChange,
  onToggleMute,
  onToggleSolo,
  onFocus,
  onUpdateCode,
  onChangeSound,
  isMuted,
  isSoloed,
  isSelected,
  navLevel,
  lineIndex: navLineIndex,
  isPlaying,
  bpm,
  disabled,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftCode, setDraftCode] = useState(layer.code);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isEditing) setDraftCode(layer.code);
  }, [isEditing, layer.code]);

  useEffect(() => () => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
  }, []);

  const queueLiveUpdate = (nextCode: string) => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      if (nextCode.trim()) onUpdateCode(nextCode);
    }, 140);
  };

  const effectivelyMuted = isMuted && !isSoloed;

  return (
    <div
      className="mx-4 mb-3"
      style={{
        opacity: effectivelyMuted ? 0.62 : 1,
        border: isSelected ? '2px solid rgba(136,255,136,0.35)' : '1px solid rgba(255,255,255,0.08)',
        background: isSelected ? 'rgba(136,255,136,0.04)' : 'rgba(255,255,255,0.015)',
      }}
      onClick={onFocus}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-4 text-[11px]" style={{ color: isSelected ? '#88ff88' : 'rgba(255,255,255,0.25)' }}>
          {index + 1}
        </span>
        <span className="text-sm text-white">{layer.label}</span>
        {(navLevel === 'lane' || navLevel === 'parameter') && (
          <span className="text-[9px] uppercase tracking-[0.18em]" style={{ color: '#88ff88' }}>
            {navLevel === 'parameter' ? '←→ adjust · tab next · esc back' : 'tab line · enter adjust · esc back'}
          </span>
        )}
        {isEditing && navLevel === 'stage' && (
          <span className="text-[9px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
            editing
          </span>
        )}
        {effectivelyMuted && !isEditing && (
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
            MUTED
          </span>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleMute();
          }}
          className="text-[10px] px-2 py-0.5 cursor-pointer"
          style={{ color: isMuted ? '#ff9d84' : 'rgba(255,255,255,0.28)' }}
        >
          [m]
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSolo();
          }}
          className="text-[10px] px-2 py-0.5 cursor-pointer"
          style={{ color: isSoloed ? '#88ff88' : 'rgba(255,255,255,0.28)' }}
        >
          [s]
        </button>
      </div>

      {!effectivelyMuted || isEditing ? (
        <>
          <div className="px-4 pl-8">
            {isEditing ? (
              <textarea
                value={draftCode}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const next = event.target.value;
                  setDraftCode(next);
                  queueLiveUpdate(next);
                }}
                onBlur={() => {
                  if (draftCode.trim()) onUpdateCode(draftCode);
                  setIsEditing(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    setDraftCode(layer.code);
                    setIsEditing(false);
                  }
                }}
                disabled={disabled}
                className="w-full min-h-[112px] resize-y bg-transparent outline-none text-sm leading-relaxed"
                style={{
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '8px 10px',
                }}
                spellCheck={false}
              />
            ) : (navLevel === 'lane' || navLevel === 'parameter') ? (
              <LineNavCodeView code={layer.code} lineIndex={navLineIndex} isParameterActive={navLevel === 'parameter'} />
            ) : (
              <button
                type="button"
                className="w-full cursor-text text-left"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <CodeDisplay
                  code={layer.code}
                  onSoundChange={(nextSound) => onChangeSound(nextSound)}
                />
              </button>
            )}
          </div>

          <div className="px-4 pl-8 pt-3" onClick={(event) => event.stopPropagation()}>
            <PulseStrip
              code={layer.code}
              isPlaying={isPlaying}
              dimmed={effectivelyMuted}
              bpm={bpm}
            />
          </div>

        </>
      ) : (
        <div className="px-4 pb-3 pl-8 text-[11px] tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
          ································
        </div>
      )}
    </div>
  );
}
