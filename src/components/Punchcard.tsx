import { useRef, useEffect, useMemo, useCallback } from 'react';
import type { Layer } from '../types';

export type ScorePatternKind = 'kick' | 'hats' | 'snare' | 'perc' | 'bass' | 'melodic' | 'texture' | 'fx';

export interface ScoreCell {
  active: boolean;
  intensity: number;
  lane: number;
}

export interface ScorePattern {
  kind: ScorePatternKind;
  cells: ScoreCell[];
}

const NOTE_RE = /([a-g])(b|#|s)?(-?\d)?/gi;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function extractPatternSource(code: string): { source: string; mode: 'note' | 'sample' | 'unknown' } {
  const noteMatch = code.match(/note\(\s*["'`]([\s\S]*?)["'`]\s*\)/);
  if (noteMatch) return { source: noteMatch[1], mode: 'note' };
  const sampleMatch = code.match(/\.?s\(\s*["'`]([\s\S]*?)["'`]\s*\)/);
  if (sampleMatch) return { source: sampleMatch[1], mode: 'sample' };
  return { source: code, mode: 'unknown' };
}

function flattenTokens(pattern: string): string[] {
  const cleaned = pattern
    .replace(/[,]/g, ' ')
    .replace(/[<>{}\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return [];

  const rawTokens = cleaned.split(' ').filter(Boolean);
  const expanded: string[] = [];

  for (const token of rawTokens) {
    const repeatMatch = token.match(/^(.+)\*(\d+)$/);
    if (repeatMatch) {
      const base = repeatMatch[1];
      const repeat = Math.min(parseInt(repeatMatch[2], 10), 32);
      for (let i = 0; i < repeat; i += 1) expanded.push(base);
      continue;
    }
    expanded.push(token);
  }

  return expanded;
}

function parsePitchValue(token: string): number | null {
  const matches = [...token.matchAll(NOTE_RE)];
  if (matches.length === 0) return null;

  const values = matches.map((match) => {
    const letter = match[1].toLowerCase();
    const accidental = match[2] ?? '';
    const octave = match[3] ? parseInt(match[3], 10) : 4;
    const base: Record<string, number> = {
      c: 0,
      d: 2,
      e: 4,
      f: 5,
      g: 7,
      a: 9,
      b: 11,
    };
    let semitone = base[letter];
    if (accidental === 'b') semitone -= 1;
    if (accidental === '#' || accidental === 's') semitone += 1;
    return (octave + 1) * 12 + semitone;
  });

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function inferSampleKind(tokens: string[], code: string): ScorePatternKind {
  const haystack = `${tokens.join(' ')} ${code}`.toLowerCase();
  if (/\bbd\b|\bkick\b/.test(haystack)) return 'kick';
  if (/\boh\b|\bhh\b|\bhat\b/.test(haystack)) return 'hats';
  if (/\bsd\b|\bcp\b|\bsnare\b|\bclap\b/.test(haystack)) return 'snare';
  if (/\brim\b|\btom\b|\btabla\b|\bperc\b/.test(haystack)) return 'perc';
  if (/\bcr\b|\bimpact\b|\bswell\b|\brise\b|\bfx\b/.test(haystack)) return 'fx';
  if (/\bwhite\b|\bpink\b|\bnoise\b|\bvinyl\b|\bcrackle\b|\bhiss\b/.test(haystack)) return 'texture';
  return 'perc';
}

function buildFallbackPattern(code: string, cols: number): ScorePattern {
  return {
    kind: 'texture',
    cells: Array.from({ length: cols }, (_, col) => {
      const v = Math.abs(hash(code + col));
      return {
        active: ((v % 100) / 100) < 0.4,
        intensity: 0.35,
        lane: ((v % 7) / 6),
      };
    }),
  };
}

export function analyzeScorePattern(code: string, cols: number = 24): ScorePattern {
  const { source, mode } = extractPatternSource(code);
  const tokens = flattenTokens(source);
  if (tokens.length === 0) return buildFallbackPattern(code, cols);

  if (mode === 'note') {
    const pitches = tokens.map(parsePitchValue).filter((value): value is number => value !== null);
    const avgPitch = pitches.length > 0
      ? pitches.reduce((sum, value) => sum + value, 0) / pitches.length
      : 60;
    const kind: ScorePatternKind = avgPitch < 52 ? 'bass' : 'melodic';
    const minPitch = pitches.length > 0 ? Math.min(...pitches) : avgPitch;
    const maxPitch = pitches.length > 0 ? Math.max(...pitches) : avgPitch + 1;
    const range = Math.max(maxPitch - minPitch, 1);

    const expanded = Array.from({ length: cols }, (_, index) => tokens[index % tokens.length]);
    return {
      kind,
      cells: expanded.map((token) => {
        if (token === '~') return { active: false, intensity: 0.08, lane: 0.5 };
        const pitch = parsePitchValue(token);
        const lane = pitch === null ? 0.5 : (pitch - minPitch) / range;
        return {
          active: true,
          intensity: kind === 'bass' ? 0.9 : 0.7,
          lane,
        };
      }),
    };
  }

  const kind = inferSampleKind(tokens, code);
  const expanded = Array.from({ length: cols }, (_, index) => tokens[index % tokens.length]);
  return {
    kind,
    cells: expanded.map((token, index) => {
      if (token === '~') return { active: false, intensity: 0.06, lane: 0.5 };
      const drift = ((Math.abs(hash(token + index)) % 100) / 100);
      return {
        active: true,
        intensity: kind === 'kick' ? 1 : kind === 'hats' ? 0.55 : kind === 'texture' ? 0.3 : 0.7,
        lane: drift,
      };
    }),
  };
}

export function generateRowGrid(code: string, cols: number = 16): boolean[] {
  return analyzeScorePattern(code, cols).cells.map((cell) => cell.active);
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

  const patterns = useMemo(() => {
    const activeLayers = layers.filter((layer) => {
      if (soloId) return layer.id === soloId;
      return !layer.muted;
    });
    if (activeLayers.length === 0) return [analyzeScorePattern('', 16)];
    return activeLayers.map((layer) => analyzeScorePattern(layer.code, 16));
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
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const cols = 16;
    const rows = patterns.length;
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

    for (let row = 0; row < rows; row += 1) {
      const pattern = patterns[row];
      for (let col = 0; col < cols; col += 1) {
        const x = gap + col * (cellW + gap);
        const y = offsetY + gap + row * (cellH + gap);
        const cell = pattern.cells[col];
        const atHead = col === playCol;

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = cell.active ? (atHead && isPlaying ? 0.9 : 0.22 + (cell.intensity * 0.35)) : 0.03;
        ctx.fillRect(x, y + ((1 - cell.lane) * (cellH * 0.35)), cellW, Math.max(4, cellH * 0.28));
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
  }, [isPlaying, patterns, bpm]);

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
