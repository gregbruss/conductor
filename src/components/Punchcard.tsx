import { useRef, useEffect, useMemo, useCallback } from 'react';
import type { Layer } from '../types';

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return h;
}

export function generateRowGrid(line: string, cols: number = 16): boolean[] {
  return Array.from({ length: cols }, (_, col) => {
    const v = Math.abs(hash(line + col));
    return (v % 100) / 100 < 0.4;
  });
}

interface Props {
  isPlaying: boolean;
  layers: Layer[];
  soloId: string | null;
  bpm: number;
}

export default function Punchcard({ isPlaying, layers, soloId, bpm }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const grids = useMemo(() => {
    const activeLayers = layers.filter(l => {
      if (soloId) return l.id === soloId;
      return !l.muted;
    });
    if (activeLayers.length === 0) return [Array(16).fill(false)];
    return activeLayers.map(l => generateRowGrid(l.code));
  }, [layers, soloId]);

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

    const cols = 16;
    const rows = grids.length;
    const gap = 4;
    const cellW = (w - gap * (cols + 1)) / cols;
    const cellH = Math.min((h - gap * (rows + 1)) / rows, 28);
    const totalH = rows * (cellH + gap) + gap;
    const offsetY = (h - totalH) / 2;

    if (!startRef.current && isPlaying) startRef.current = ts;
    const cycle = (60 / bpm) * 4 * 1000;
    const progress = isPlaying && startRef.current ? ((ts - startRef.current) % cycle) / cycle : -1;
    const playCol = progress >= 0 ? Math.floor(progress * cols) : -1;

    if (playCol >= 0) {
      const px = gap + playCol * (cellW + gap);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(px - gap / 2, 0, cellW + gap, h);
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = gap + col * (cellW + gap);
        const y = offsetY + gap + row * (cellH + gap);
        const active = grids[row][col];
        const atHead = col === playCol;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = active
          ? (atHead && isPlaying ? 0.95 : (isPlaying ? 0.45 : 0.15))
          : 0.03;
        ctx.fillRect(x, y, cellW, cellH);
      }
    }
    ctx.globalAlpha = 1;

    if (playCol >= 0) {
      const lx = gap + playCol * (cellW + gap) + cellW + gap / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, h);
      ctx.stroke();
    }

    if (isPlaying) animRef.current = requestAnimationFrame(draw);
  }, [isPlaying, grids, bpm]);

  useEffect(() => {
    startRef.current = 0;
    if (isPlaying) {
      animRef.current = requestAnimationFrame(draw);
    } else {
      requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, draw]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
