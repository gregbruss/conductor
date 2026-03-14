import { useEffect, useRef, useState, useCallback } from 'react';
import type { Layer } from '../types';
import { CodeDisplay, SliderRow } from './InteractiveCode';
import { generateRowGrid } from './Punchcard';

interface Props {
  layer: Layer;
  index: number;
  sliderOffset: number;
  onSliderChange: (globalIndex: number, value: number) => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onFocus: () => void;
  onUpdateCode: (code: string) => void;
  onDuplicate: () => void;
  onSaveToCrate: () => void;
  onRemove: () => void;
  isMuted: boolean;
  isSoloed: boolean;
  isFocused: boolean;
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
    const ctx = canvas.getContext('2d')!;
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

    for (let col = 0; col < cols; col++) {
      const x = gap + col * (cellWidth + gap);
      const active = grid[col];
      const atHead = col === playCol;
      ctx.fillStyle = '#ffffff';
      if (dimmed) {
        ctx.globalAlpha = active ? 0.04 : 0.015;
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

  return <canvas ref={canvasRef} className="w-full block" style={{ height: '18px' }} />;
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
  onDuplicate,
  onSaveToCrate,
  onRemove,
  isMuted,
  isSoloed,
  isFocused,
  isPlaying,
  bpm,
  disabled,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftCode, setDraftCode] = useState(layer.code);

  useEffect(() => {
    if (!isEditing) setDraftCode(layer.code);
  }, [isEditing, layer.code]);

  const commitEdit = () => {
    const next = draftCode.trim();
    if (!next) return;
    onUpdateCode(next);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraftCode(layer.code);
    setIsEditing(false);
  };

  const effectivelyMuted = isMuted && !isSoloed;

  return (
    <div
      className="mx-4 mb-2 transition-all duration-150"
      style={{
        opacity: effectivelyMuted && !isFocused ? 0.3 : 1,
        border: isFocused
          ? '1px solid rgba(255,255,255,0.14)'
          : '1px solid transparent',
        borderLeft: isFocused
          ? '2px solid rgba(255,255,255,0.35)'
          : '2px solid rgba(255,255,255,0.08)',
        background: isFocused
          ? 'rgba(255,255,255,0.03)'
          : 'transparent',
      }}
    >
      <div
        className="flex items-center gap-3 px-3 py-2 cursor-pointer"
        onClick={onFocus}
      >
        <span className="text-[10px] w-4 text-center shrink-0"
          style={{ color: isFocused ? '#ffffff' : 'rgba(255,255,255,0.2)' }}>
          {index + 1}
        </span>
        <span className="text-xs truncate shrink-0"
          style={{ color: isFocused ? '#ffffff' : 'rgba(255,255,255,0.55)', maxWidth: '220px' }}>
          {layer.label}
        </span>
        {isFocused && (
          <span className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            focused
          </span>
        )}
        <div className="flex-1" />
        <button
          onClick={(event) => { event.stopPropagation(); onToggleMute(); }}
          className="text-[10px] px-2 py-0.5 cursor-pointer transition-all shrink-0"
          style={{
            color: isMuted ? '#ffffff' : 'rgba(255,255,255,0.2)',
            background: isMuted ? 'rgba(255,255,255,0.08)' : 'transparent',
          }}
        >
          {isMuted ? 'mute' : 'm'}
        </button>
        <button
          onClick={(event) => { event.stopPropagation(); onToggleSolo(); }}
          className="text-[10px] px-2 py-0.5 cursor-pointer transition-all shrink-0"
          style={{
            color: isSoloed ? '#88ff88' : 'rgba(255,255,255,0.2)',
            background: isSoloed ? 'rgba(136,255,136,0.08)' : 'transparent',
          }}
        >
          {isSoloed ? 'solo' : 's'}
        </button>
      </div>

      <div className="px-3 pb-1 pl-10">
        {isEditing ? (
          <div>
            <textarea
              value={draftCode}
              onChange={(event) => setDraftCode(event.target.value)}
              disabled={disabled}
              className="w-full min-h-[96px] bg-transparent outline-none resize-y text-sm leading-relaxed"
              style={{
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '8px 10px',
              }}
              spellCheck={false}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault();
                  commitEdit();
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  cancelEdit();
                }
              }}
            />
            <div className="mt-2 flex items-center gap-2 text-[10px]">
              <button
                onClick={commitEdit}
                className="px-2.5 py-1 cursor-pointer transition-all"
                style={{ color: '#88ff88', border: '1px solid rgba(136,255,136,0.15)' }}
              >
                save code
              </button>
              <button
                onClick={cancelEdit}
                className="px-2.5 py-1 cursor-pointer transition-all"
                style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                cancel
              </button>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>cmd/ctrl+enter save</span>
            </div>
          </div>
        ) : (
          <CodeDisplay code={layer.code} />
        )}
      </div>

      <div className="px-3 pl-10">
        <PulseStrip
          code={layer.code}
          isPlaying={isPlaying}
          dimmed={effectivelyMuted}
          bpm={bpm}
        />
      </div>

      <div className="px-3 pl-10 py-2">
        <SliderRow
          code={layer.code}
          onSliderChange={onSliderChange}
          sliderOffset={sliderOffset}
          disabled={disabled}
          limit={isFocused ? undefined : 2}
        />
      </div>

      {isFocused && !isEditing && (
        <div className="px-3 pl-10 pb-3 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] px-2.5 py-1 cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.06)]"
            style={{ color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            edit code
          </button>
          <button
            onClick={onDuplicate}
            className="text-[10px] px-2.5 py-1 cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.06)]"
            style={{ color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            duplicate
          </button>
          <button
            onClick={onSaveToCrate}
            className="text-[10px] px-2.5 py-1 cursor-pointer transition-all hover:bg-[rgba(136,255,136,0.06)]"
            style={{ color: '#88ff88', border: '1px solid rgba(136,255,136,0.15)' }}
          >
            save to crate
          </button>
          <div className="flex-1" />
          <button
            onClick={onRemove}
            className="text-[10px] px-2.5 py-1 cursor-pointer transition-all hover:bg-[rgba(255,136,136,0.08)]"
            style={{ color: '#ff8888', border: '1px solid rgba(255,136,136,0.1)' }}
          >
            remove
          </button>
        </div>
      )}
    </div>
  );
}
