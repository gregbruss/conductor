import { useRef, useEffect, useCallback } from 'react';
import type { Layer } from '../types';
import { generateRowGrid } from './Punchcard';

interface Props {
  layers: Layer[];
  mutedIds: Set<string>;
  soloId: string | null;
  focusedLayerId: string | null;
  isPlaying: boolean;
  bpm: number;
  onFocusLayer: (id: string) => void;
}

const COLS = 16;
const ROW_H = 22;
const LABEL_W = 130;
const GAP = 2;

export default function SequencerOverview({
  layers, mutedIds, soloId, focusedLayerId, isPlaying, bpm, onFocusLayer,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const rows = layers.length;

  const draw = useCallback((ts: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    ctx.clearRect(0, 0, w, rows * ROW_H);

    if (!startRef.current && isPlaying) startRef.current = ts;
    const cycle = (60 / bpm) * 4 * 1000;
    const progress = isPlaying && startRef.current
      ? ((ts - startRef.current) % cycle) / cycle : -1;
    const playCol = progress >= 0 ? Math.floor(progress * COLS) : -1;

    const gridW = w - LABEL_W;
    const cellW = (gridW - GAP * (COLS + 1)) / COLS;

    for (let r = 0; r < rows; r++) {
      const layer = layers[r];
      const y = r * ROW_H;
      const isMuted = soloId ? layer.id !== soloId : mutedIds.has(layer.id);
      const isFocused = layer.id === focusedLayerId;
      const grid = generateRowGrid(layer.code);

      // Focus highlight
      if (isFocused) {
        ctx.fillStyle = 'rgba(136, 255, 136, 0.05)';
        ctx.fillRect(0, y, w, ROW_H);
      }

      // Lane number
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = isFocused ? '#88ff88' : 'rgba(255,255,255,0.2)';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${r + 1}`, 10, y + ROW_H / 2);

      // Lane label
      ctx.fillStyle = isMuted
        ? 'rgba(255,255,255,0.08)'
        : isFocused ? '#88ff88' : 'rgba(255,255,255,0.35)';
      ctx.fillText(layer.label.slice(0, 16), 28, y + ROW_H / 2);

      // Grid cells
      for (let col = 0; col < COLS; col++) {
        const x = LABEL_W + GAP + col * (cellW + GAP);
        const active = grid[col];
        const atHead = col === playCol;

        ctx.fillStyle = '#ffffff';
        if (isMuted) {
          ctx.globalAlpha = active ? 0.03 : 0.01;
        } else {
          ctx.globalAlpha = active
            ? (atHead && isPlaying ? 0.8 : (isPlaying ? 0.3 : 0.1))
            : 0.02;
        }
        ctx.fillRect(x, y + 3, cellW, ROW_H - 6);

        // Green glow on active cells at playhead
        if (active && atHead && isPlaying && !isMuted) {
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#88ff88';
          ctx.fillRect(x, y + 3, cellW, ROW_H - 6);
        }
      }
      ctx.globalAlpha = 1;

      // Row separator
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(LABEL_W, y + ROW_H - 1, gridW, 1);
    }

    // Playhead line
    if (playCol >= 0) {
      const px = LABEL_W + GAP + playCol * (cellW + GAP) + cellW + GAP / 2;
      ctx.strokeStyle = 'rgba(136, 255, 136, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, rows * ROW_H);
      ctx.stroke();
    }

    if (isPlaying) animRef.current = requestAnimationFrame(draw);
  }, [layers, mutedIds, soloId, focusedLayerId, isPlaying, bpm, rows]);

  useEffect(() => {
    startRef.current = 0;
    if (isPlaying) {
      animRef.current = requestAnimationFrame(draw);
    } else {
      requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, draw]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const row = Math.floor((e.clientY - rect.top) / ROW_H);
    if (row >= 0 && row < layers.length) {
      onFocusLayer(layers[row].id);
    }
  };

  if (layers.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="w-full block cursor-pointer"
      style={{
        height: `${rows * ROW_H}px`,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      onClick={handleClick}
    />
  );
}
