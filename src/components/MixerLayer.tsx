import { useRef, useEffect, useCallback } from 'react';
import type { Layer } from '../types';
import { generateRowGrid } from './Punchcard';
import { extractGain } from '../lib/localOps';
import GainSlider from './GainSlider';

interface Props {
  layer: Layer;
  layerIndex: number;
  effectiveMuted: boolean;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onGainChange: (gain: number) => void;
  onRemove: () => void;
  isPlaying: boolean;
  bpm: number;
  flash: boolean;
  isSoloed: boolean;
}

function MiniStrip({ code, isPlaying, effectiveMuted, bpm }: {
  code: string; isPlaying: boolean; effectiveMuted: boolean; bpm: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const grid = generateRowGrid(code);

  const draw = useCallback((ts: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const cols = 16, gap = 1;
    const cellW = (w - gap * (cols + 1)) / cols;
    const cellH = h - gap * 2;

    if (!startRef.current && isPlaying) startRef.current = ts;
    const cycle = (60 / bpm) * 4 * 1000;
    const progress = isPlaying && startRef.current ? ((ts - startRef.current) % cycle) / cycle : -1;
    const playCol = progress >= 0 ? Math.floor(progress * cols) : -1;

    for (let col = 0; col < cols; col++) {
      const x = gap + col * (cellW + gap);
      const active = grid[col];
      const atHead = col === playCol;
      ctx.fillStyle = '#ffffff';
      if (effectiveMuted) {
        ctx.globalAlpha = active ? 0.04 : 0.02;
      } else {
        ctx.globalAlpha = active
          ? (atHead && isPlaying ? 0.8 : (isPlaying ? 0.35 : 0.12))
          : 0.03;
      }
      ctx.fillRect(x, gap, cellW, cellH);
    }
    ctx.globalAlpha = 1;
    if (isPlaying && !effectiveMuted) animRef.current = requestAnimationFrame(draw);
  }, [isPlaying, grid, bpm, effectiveMuted]);

  useEffect(() => {
    startRef.current = 0;
    if (isPlaying && !effectiveMuted) {
      animRef.current = requestAnimationFrame(draw);
    } else {
      requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, effectiveMuted, draw]);

  return <canvas ref={canvasRef} className="w-full block" style={{ height: '12px' }} />;
}

export default function MixerLayer({
  layer, layerIndex, effectiveMuted, onToggleMute, onToggleSolo,
  onGainChange, onRemove, isPlaying, bpm, flash, isSoloed,
}: Props) {
  const gain = extractGain(layer.code);

  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 mb-0.5 group transition-all duration-200 ${flash ? 'line-flash' : ''}`}
      style={{
        opacity: effectiveMuted ? 0.25 : 1,
        background: effectiveMuted ? 'transparent' : 'rgba(255,255,255,0.03)',
        borderLeft: effectiveMuted ? '2px solid transparent' : '2px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Label */}
      <span className="text-[12px] w-32 truncate shrink-0" style={{ color: '#8888cc' }}>
        {layer.label}
      </span>

      {/* Gain slider */}
      <GainSlider value={gain} onChange={onGainChange} disabled={effectiveMuted} />

      {/* Mini punchcard strip */}
      <div className="flex-1 min-w-0">
        <MiniStrip code={layer.code} isPlaying={isPlaying} effectiveMuted={effectiveMuted} bpm={bpm} />
      </div>

      {/* Mute */}
      <button
        onClick={onToggleMute}
        className="text-[10px] px-1.5 py-0.5 cursor-pointer transition-all shrink-0"
        style={{
          color: layer.muted ? '#ffffff' : '#6666aa',
          background: layer.muted ? 'rgba(255,68,68,0.4)' : 'transparent',
        }}
      >
        {layer.muted ? 'M' : 'm'}
      </button>

      {/* Solo */}
      <button
        onClick={onToggleSolo}
        className="text-[10px] px-1.5 py-0.5 cursor-pointer transition-all shrink-0"
        style={{
          color: isSoloed ? '#ffffff' : '#6666aa',
          background: isSoloed ? 'rgba(136,255,136,0.2)' : 'transparent',
        }}
      >
        s
      </button>

      {/* Delete */}
      <button
        onClick={onRemove}
        className="text-[10px] px-1 cursor-pointer transition-all shrink-0 opacity-0 group-hover:opacity-100 hover:text-[#ff4444]"
        style={{ color: '#6666aa' }}
      >
        &times;
      </button>
    </div>
  );
}
