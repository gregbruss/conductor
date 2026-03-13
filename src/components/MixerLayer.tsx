import { useRef, useEffect, useCallback } from 'react';
import type { Layer } from '../types';
import { highlight } from '../lib/highlight';
import { generateRowGrid } from './Punchcard';

interface Props {
  layer: Layer;
  effectiveMuted: boolean;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  isPlaying: boolean;
  bpm: number;
  flash: boolean;
}

function MiniPunchcard({ code, isPlaying, effectiveMuted, bpm }: { code: string; isPlaying: boolean; effectiveMuted: boolean; bpm: number }) {
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

    const cols = 16, gap = 2;
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
        ctx.globalAlpha = active ? 0.06 : 0.02;
      } else {
        ctx.globalAlpha = active
          ? (atHead && isPlaying ? 0.9 : (isPlaying ? 0.4 : 0.15))
          : 0.04;
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

  return <canvas ref={canvasRef} className="w-full block" style={{ height: '16px' }} />;
}

export default function MixerLayer({ layer, effectiveMuted, onToggleMute, onToggleSolo, isPlaying, bpm, flash }: Props) {
  const codeLines = layer.code.split('\n');
  const isSoloed = !effectiveMuted && !layer.muted;

  return (
    <div
      className={`group px-3 py-2.5 mb-1 transition-all duration-200 ${flash ? 'line-flash' : ''}`}
      style={{
        opacity: effectiveMuted ? 0.3 : 1,
        background: effectiveMuted ? 'transparent' : 'rgba(255,255,255,0.03)',
        borderLeft: effectiveMuted ? '2px solid transparent' : '2px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Top row: label + controls */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[13px] text-[#8888cc] flex-1">{layer.label}</span>

        <button
          onClick={onToggleMute}
          className="text-[11px] px-2 py-0.5 cursor-pointer transition-all"
          style={{
            color: layer.muted ? '#ffffff' : '#6666aa',
            background: layer.muted ? 'rgba(255,68,68,0.4)' : 'transparent',
          }}
          title="Mute this layer"
        >
          {layer.muted ? 'MUTED' : 'mute'}
        </button>

        <button
          onClick={onToggleSolo}
          className="text-[11px] px-2 py-0.5 cursor-pointer transition-all"
          style={{
            color: isSoloed ? '#ffffff' : '#6666aa',
            background: isSoloed ? 'rgba(136,255,136,0.2)' : 'transparent',
          }}
          title="Solo — hear only this layer"
        >
          solo
        </button>
      </div>

      {/* Code */}
      <pre className="text-[13px] leading-6 whitespace-pre-wrap break-words m-0 mb-1.5">
        {codeLines.map((line, i) => (
          <span key={i} className="select-text" dangerouslySetInnerHTML={{ __html: highlight(line) + (i < codeLines.length - 1 ? '\n' : '') }} />
        ))}
      </pre>

      {/* Mini punchcard — full width below the code */}
      <MiniPunchcard code={layer.code} isPlaying={isPlaying} effectiveMuted={effectiveMuted} bpm={bpm} />
    </div>
  );
}
