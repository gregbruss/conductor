import { useEffect, useRef, useState, useCallback } from 'react';
import type { Layer } from '../types';
import { CodeDisplay, SliderRow } from './InteractiveCode';
import { generateRowGrid } from './Punchcard';
import { findAdjustableLines } from '../lib/codeNudge';

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
  focusMode: boolean;
  focusedParamIndex: number;
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

function FocusCodeView({ code, focusedParamIndex }: { code: string; focusedParamIndex: number }) {
  const lines = code.split('\n');
  const adjustable = findAdjustableLines(code);
  const focusedLineIndex = adjustable[focusedParamIndex]?.lineIndex ?? -1;

  return (
    <div className="text-sm leading-relaxed" style={{ fontFamily: 'monospace' }}>
      {lines.map((line, i) => {
        const isFocused = i === focusedLineIndex;
        const param = adjustable.find((a) => a.lineIndex === i);
        return (
          <div
            key={i}
            className="px-2 py-0.5 flex items-center gap-3"
            style={{
              background: isFocused ? 'rgba(136,255,136,0.12)' : 'transparent',
              borderLeft: isFocused ? '3px solid #88ff88' : '3px solid transparent',
            }}
          >
            <span style={{ color: isFocused ? '#ffffff' : 'rgba(255,255,255,0.7)' }}>{line}</span>
            {isFocused && param && (
              <span className="text-[10px] ml-auto shrink-0" style={{ color: '#88ff88' }}>
                ← {param.label}: {param.value.toFixed(param.max >= 100 ? 0 : 2)}
              </span>
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
  focusMode,
  focusedParamIndex,
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
        {focusMode && (
          <span className="text-[9px] uppercase tracking-[0.18em]" style={{ color: '#88ff88' }}>
            focus · ↑↓ nudge · tab next · esc exit
          </span>
        )}
        {isEditing && !focusMode && (
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
            ) : focusMode ? (
              <FocusCodeView code={layer.code} focusedParamIndex={focusedParamIndex} />
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

          <div className="px-4 pl-8 py-3" onClick={(event) => event.stopPropagation()}>
            <SliderRow
              code={layer.code}
              onSliderChange={onSliderChange}
              sliderOffset={sliderOffset}
              disabled={disabled}
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
