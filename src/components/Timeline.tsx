import { useState } from 'react';
import type { Song } from '../types';
import { calculateEnergy } from '../lib/energy';
import { extractBpm } from '../lib/localOps';

interface Props {
  song: Song;
  activeSegmentIndex: number;
  isPlaying: boolean;
  playAllMode: boolean;
  onSelectSegment: (index: number) => void;
  onReorderSegments: (fromIndex: number, toIndex: number) => void;
  onPlayAll: () => void;
  onClickNext: () => void;
}

export default function Timeline({
  song, activeSegmentIndex, isPlaying, playAllMode,
  onSelectSegment, onReorderSegments, onPlayAll, onClickNext,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Calculate durations
  const durations = song.segments.map(s => {
    const bpm = extractBpm(s.code);
    return s.bars * (60 / bpm) * 4;
  });
  const totalDuration = durations.reduce((a, b) => a + b, 0);

  return (
    <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-1 overflow-x-auto">
        {song.segments.map((segment, i) => {
          const isActive = i === activeSegmentIndex;
          const energy = calculateEnergy(segment.code);
          const bpm = extractBpm(segment.code);
          const isDragOver = dragOverIndex === i && dragIndex !== i;
          const dur = durations[i];

          return (
            <div key={segment.id} className="flex items-center shrink-0">
              {i > 0 && (
                <span className="text-[10px] mx-0.5" style={{ color: '#4444aa' }}>&rarr;</span>
              )}
              <div
                className="cursor-pointer transition-all"
                style={{
                  padding: '5px 8px',
                  minWidth: '64px',
                  border: isActive
                    ? '1px solid rgba(255,255,255,0.4)'
                    : isDragOver
                      ? '1px solid rgba(136,255,136,0.4)'
                      : '1px solid rgba(255,255,255,0.08)',
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                  opacity: dragIndex === i ? 0.4 : 1,
                }}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={() => {
                  if (dragIndex !== null && dragIndex !== i) onReorderSegments(dragIndex, i);
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                onClick={() => onSelectSegment(i)}
              >
                <div className="text-[11px] mb-0.5" style={{ color: isActive ? '#ffffff' : '#8888cc' }}>
                  {segment.name}
                </div>
                {/* Energy bar */}
                <div className="flex gap-px mb-0.5" style={{ height: '8px' }}>
                  {Array.from({ length: 8 }, (_, j) => (
                    <div key={j} style={{
                      flex: 1,
                      background: '#ffffff',
                      opacity: (j + 1) / 8 <= energy ? (isActive ? 0.4 : 0.15) : 0.03,
                    }} />
                  ))}
                </div>
                <div className="text-[9px]" style={{ color: '#6666aa' }}>
                  {segment.bars}b {bpm} &middot; {Math.round(dur)}s
                </div>
              </div>
            </div>
          );
        })}

        {/* Ghost "next?" card */}
        <div className="flex items-center shrink-0">
          <span className="text-[10px] mx-0.5" style={{ color: '#4444aa' }}>&rarr;</span>
          <div
            className="flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.04)]"
            style={{
              padding: '5px 8px',
              minWidth: '56px',
              minHeight: '40px',
              border: '1px dashed rgba(255,255,255,0.15)',
              color: '#6666aa',
            }}
            onClick={onClickNext}
          >
            <span className="text-[11px]">next?</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Total + controls */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className="text-[10px]" style={{ color: '#6666aa' }}>
            {Math.round(totalDuration)}s total
          </span>
          {song.segments.length >= 2 && (
            <button
              onClick={onPlayAll}
              className="text-[11px] cursor-pointer transition-colors hover:text-white"
              style={{ color: playAllMode ? '#88ff88' : '#8888cc' }}
            >
              {playAllMode ? '[ &#9632; stop ]' : '[ &#9654; play all ]'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
