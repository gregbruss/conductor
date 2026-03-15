import { useRef, useEffect, useMemo, useCallback } from 'react';
import type { Layer } from '../types';
import { analyzeScorePattern, type ScoreCell, type ScorePatternKind } from './Punchcard';

interface Props {
  layers: Layer[];
  mutedIds: Set<string>;
  soloId: string | null;
  focusedLayerId: string | null;
  isPlaying: boolean;
  bpm: number;
  onFocusLayer: (id: string) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
}

interface EnsembleBands {
  low: number;
  mid: number;
  high: number;
  air: number;
}

const COLS = 24;
const LABEL_W = 154;
const GAP = 3;
const BAR_GROUP = 4;
const PHRASE_GROUP = 8;
const ENSEMBLE_H = 60;
const ROW_H = 22;
const SECTION_GAP = 12;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getBands(kind: ScorePatternKind, cell: ScoreCell): EnsembleBands {
  if (!cell.active) {
    return { low: 0, mid: 0, high: 0, air: 0 };
  }

  const amt = cell.intensity;

  switch (kind) {
    case 'kick':
      return { low: 1.1 * amt, mid: 0.18 * amt, high: 0, air: 0 };
    case 'bass':
      return {
        low: (0.65 + (1 - cell.lane) * 0.35) * amt,
        mid: (0.15 + cell.lane * 0.2) * amt,
        high: 0,
        air: 0,
      };
    case 'snare':
      return { low: 0.08 * amt, mid: 0.75 * amt, high: 0.18 * amt, air: 0 };
    case 'perc':
      return { low: 0.05 * amt, mid: 0.48 * amt, high: 0.34 * amt, air: 0.08 * amt };
    case 'hats':
      return { low: 0, mid: 0.15 * amt, high: 0.7 * amt, air: 0.28 * amt };
    case 'texture':
      return { low: 0, mid: 0.12 * amt, high: 0.26 * amt, air: 0.75 * amt };
    case 'fx':
      return { low: 0.05 * amt, mid: 0.22 * amt, high: 0.36 * amt, air: 0.52 * amt };
    case 'melodic':
    default:
      return {
        low: Math.max(0, 0.28 - cell.lane * 0.18) * amt,
        mid: (0.42 + (1 - Math.abs(cell.lane - 0.5) * 0.9) * 0.18) * amt,
        high: (0.2 + cell.lane * 0.42) * amt,
        air: 0.08 * amt,
      };
  }
}

function drawFingerprintCell(
  ctx: CanvasRenderingContext2D,
  kind: ScorePatternKind,
  cell: ScoreCell,
  x: number,
  y: number,
  cellW: number,
  rowH: number,
  alpha: number,
) {
  const emptyAlpha = alpha * 0.12;
  const activeAlpha = alpha;

  if (!cell.active) {
    ctx.fillStyle = `rgba(255, 255, 255, ${emptyAlpha})`;
    ctx.fillRect(x, y + rowH * 0.56, cellW, 1);
    return;
  }

  if (kind === 'kick') {
    ctx.fillStyle = `rgba(255, 240, 180, ${activeAlpha * 0.9})`;
    ctx.fillRect(x, y + rowH * 0.28, cellW, rowH * 0.44);
    return;
  }

  if (kind === 'hats') {
    ctx.fillStyle = `rgba(255, 255, 255, ${activeAlpha * 0.78})`;
    ctx.fillRect(x, y + rowH * 0.5, cellW, 2);
    return;
  }

  if (kind === 'snare' || kind === 'perc') {
    ctx.fillStyle = `rgba(255, 236, 215, ${activeAlpha * 0.72})`;
    ctx.fillRect(x + cellW * 0.08, y + rowH * 0.36, cellW * 0.84, rowH * 0.28);
    return;
  }

  if (kind === 'texture' || kind === 'fx') {
    ctx.fillStyle = `rgba(255, 255, 255, ${activeAlpha * 0.42})`;
    ctx.fillRect(x + cellW * 0.45, y + rowH * (0.24 + (1 - cell.lane) * 0.42), 2, 2);
    return;
  }

  const pitchY = y + 3 + (1 - cell.lane) * (rowH - 8);
  const h = kind === 'bass' ? rowH * 0.28 : rowH * 0.2;
  const tint = kind === 'bass' ? '200, 255, 210' : '220, 255, 220';
  ctx.fillStyle = `rgba(${tint}, ${activeAlpha * 0.72})`;
  ctx.fillRect(x, pitchY, cellW, h);
}

export default function SequencerOverview({
  layers,
  mutedIds,
  soloId,
  focusedLayerId,
  isPlaying,
  bpm,
  onFocusLayer,
  onToggleMute,
  onToggleSolo,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const patterns = useMemo(
    () => layers.map((layer) => ({
      layer,
      pattern: analyzeScorePattern(layer.code, COLS),
    })),
    [layers],
  );

  const rows = layers.length;
  const totalH = ENSEMBLE_H + SECTION_GAP + rows * ROW_H;

  const draw = useCallback((ts: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    ctx.clearRect(0, 0, w, totalH);

    if (!startRef.current && isPlaying) startRef.current = ts;
    const cycle = (60 / bpm) * 4 * 1000;
    const progress = isPlaying && startRef.current
      ? ((ts - startRef.current) % cycle) / cycle
      : -1;
    const playCol = progress >= 0 ? Math.floor(progress * COLS) : -1;

    const gridW = w - LABEL_W;
    const cellW = (gridW - GAP * (COLS + 1)) / COLS;
    const rowsTop = ENSEMBLE_H + SECTION_GAP;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.fillRect(0, ENSEMBLE_H - 1, w, 1);

    for (let col = 0; col < COLS; col += 1) {
      const x = LABEL_W + GAP + col * (cellW + GAP);

      if (col > 0 && col % BAR_GROUP === 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${col % PHRASE_GROUP === 0 ? 0.06 : 0.03})`;
        ctx.fillRect(x - GAP / 2, 0, 1, totalH);
      }

      let low = 0;
      let mid = 0;
      let high = 0;
      let air = 0;

      for (const { layer, pattern } of patterns) {
        const isMuted = soloId ? layer.id !== soloId : mutedIds.has(layer.id);
        if (isMuted) continue;
        const bands = getBands(pattern.kind, pattern.cells[col]);
        low += bands.low;
        mid += bands.mid;
        high += bands.high;
        air += bands.air;
      }

      const lowNorm = clamp01(low / Math.max(1.2, rows * 0.45));
      const midNorm = clamp01(mid / Math.max(1.2, rows * 0.52));
      const highNorm = clamp01(high / Math.max(1.1, rows * 0.48));
      const airNorm = clamp01(air / Math.max(1, rows * 0.55));

      const lowH = 10 + lowNorm * 18;
      const midH = 8 + midNorm * 12;
      const highH = 5 + highNorm * 10;

      ctx.fillStyle = `rgba(185, 255, 205, ${0.06 + lowNorm * 0.18})`;
      ctx.fillRect(x, ENSEMBLE_H - lowH - 6, cellW, lowH);

      ctx.fillStyle = `rgba(210, 255, 235, ${0.05 + midNorm * 0.16})`;
      ctx.fillRect(x, ENSEMBLE_H * 0.45 - midH * 0.5, cellW, midH);

      ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + highNorm * 0.14})`;
      ctx.fillRect(x, 8 + (1 - highNorm) * 10, cellW, highH);

      if (airNorm > 0.08) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.04 + airNorm * 0.08})`;
        const dustCount = Math.min(3, Math.ceil(airNorm * 3));
        for (let i = 0; i < dustCount; i += 1) {
          const dx = x + cellW * (0.2 + i * 0.25);
          const dy = 7 + ((col * 13 + i * 17) % 10);
          ctx.fillRect(dx, dy, 1.5, 1.5);
        }
      }
    }

    for (let row = 0; row < rows; row += 1) {
      const { layer, pattern } = patterns[row];
      const y = rowsTop + row * ROW_H;
      const isMuted = soloId ? layer.id !== soloId : mutedIds.has(layer.id);
      const isFocused = layer.id === focusedLayerId;
      const alpha = isMuted ? 0.18 : isFocused ? 0.95 : 0.6;

      if (isFocused) {
        ctx.fillStyle = 'rgba(136, 255, 136, 0.06)';
        ctx.fillRect(0, y, w, ROW_H);
      }

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isFocused ? '#88ff88' : `rgba(255, 255, 255, ${isMuted ? 0.12 : 0.28})`;
      ctx.fillText(`${row + 1}`, 10, y + ROW_H / 2);

      ctx.fillStyle = isFocused ? '#c7ffd1' : `rgba(255, 255, 255, ${isMuted ? 0.16 : 0.34})`;
      ctx.fillText(layer.label.slice(0, 18), 28, y + ROW_H / 2);

      for (let col = 0; col < COLS; col += 1) {
        const x = LABEL_W + GAP + col * (cellW + GAP);
        drawFingerprintCell(ctx, pattern.kind, pattern.cells[col], x, y, cellW, ROW_H, alpha);
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(LABEL_W, y + ROW_H - 1, gridW, 1);
    }

    if (playCol >= 0) {
      const px = LABEL_W + GAP + playCol * (cellW + GAP);

      const glow = ctx.createLinearGradient(px - 12, 0, px + cellW + 12, 0);
      glow.addColorStop(0, 'rgba(160, 255, 180, 0)');
      glow.addColorStop(0.35, 'rgba(160, 255, 180, 0.08)');
      glow.addColorStop(0.5, 'rgba(160, 255, 180, 0.12)');
      glow.addColorStop(0.65, 'rgba(160, 255, 180, 0.08)');
      glow.addColorStop(1, 'rgba(160, 255, 180, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(px - 12, 0, cellW + 24, totalH);

      ctx.fillStyle = 'rgba(160, 255, 180, 0.18)';
      ctx.fillRect(px, 0, cellW, ENSEMBLE_H);

      ctx.fillStyle = 'rgba(160, 255, 180, 0.35)';
      ctx.fillRect(px + cellW / 2, 6, 1, totalH - 12);
    }

    if (isPlaying) {
      animRef.current = requestAnimationFrame(draw);
    }
  }, [bpm, focusedLayerId, isPlaying, mutedIds, patterns, rows, soloId, totalH]);

  useEffect(() => {
    startRef.current = 0;
    if (isPlaying) {
      animRef.current = requestAnimationFrame(draw);
    } else {
      requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [draw, isPlaying]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    if (y < ENSEMBLE_H + SECTION_GAP) return;

    const row = Math.floor((y - (ENSEMBLE_H + SECTION_GAP)) / ROW_H);
    if (row < 0 || row >= layers.length) return;

    const layerId = layers[row].id;
    if (e.shiftKey) {
      onToggleSolo(layerId);
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      onToggleMute(layerId);
      return;
    }
    onFocusLayer(layerId);
  };

  if (layers.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="block w-full cursor-pointer"
      style={{
        height: `${totalH}px`,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      onClick={handleClick}
    />
  );
}
