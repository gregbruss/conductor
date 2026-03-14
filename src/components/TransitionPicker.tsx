import { useState } from 'react';
import type { Song, PreGenResult } from '../types';
import { ALL_TRANSITIONS, getRecommendedTransitions } from '../lib/transitions';

interface Props {
  song: Song;
  activeSegmentIndex: number;
  preGenCache: Map<string, PreGenResult>;
  onSelectTransition: (type: string, name: string) => void;
  onFreeText: (text: string) => void;
  onCancel: () => void;
  isGenerating: boolean;
}

export default function TransitionPicker({
  song, activeSegmentIndex, preGenCache,
  onSelectTransition, onFreeText, onCancel, isGenerating,
}: Props) {
  const [freeInput, setFreeInput] = useState('');

  const currentSegment = song.segments[activeSegmentIndex];
  const recommended = getRecommendedTransitions(
    currentSegment?.name || 'start',
    activeSegmentIndex,
    song.segments.length,
  );

  const totalDuration = song.segments.reduce((sum, s) => {
    const bpmMatch = s.code.match(/setCps\((\d+(?:\.\d+)?)\/60\/4\)/);
    const bpm = bpmMatch ? parseFloat(bpmMatch[1]) : 120;
    return sum + s.bars * (60 / bpm) * 4;
  }, 0);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8"
      style={{ opacity: isGenerating ? 0.5 : 1 }}>

      <div className="text-[#8888cc] text-sm mb-1">
        {song.segments.length} segment{song.segments.length !== 1 ? 's' : ''} &middot; {Math.round(totalDuration)}s so far
      </div>

      <div className="text-lg mb-6" style={{ color: '#ffffff' }}>
        what happens next?
      </div>

      {/* Recommended transitions */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {ALL_TRANSITIONS.filter(t => recommended.includes(t.type)).map(t => {
          const cached = preGenCache.get(t.type);
          const isReady = cached?.status === 'ready';
          const isPending = cached?.status === 'pending';

          return (
            <button
              key={t.type}
              onClick={() => onSelectTransition(t.type, t.label)}
              disabled={isGenerating}
              className="px-4 py-2 text-sm cursor-pointer transition-all hover:text-white hover:bg-[rgba(255,255,255,0.08)] disabled:cursor-wait"
              style={{
                color: isReady ? '#88ff88' : '#aaaaff',
                border: isReady
                  ? '1px solid rgba(136,255,136,0.3)'
                  : '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {t.label} &rarr;
              {isPending && <span className="ml-1 text-[10px] text-[#6666aa]">...</span>}
              {isReady && <span className="ml-1 text-[10px]">&bull;</span>}
            </button>
          );
        })}
      </div>

      {/* All transitions */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-6">
        {ALL_TRANSITIONS.filter(t => !recommended.includes(t.type)).map(t => {
          const cached = preGenCache.get(t.type);
          const isReady = cached?.status === 'ready';

          return (
            <button
              key={t.type}
              onClick={() => onSelectTransition(t.type, t.label)}
              disabled={isGenerating}
              className="px-3 py-1.5 text-[11px] cursor-pointer transition-all hover:text-white hover:bg-[rgba(255,255,255,0.06)] disabled:cursor-wait"
              style={{ color: '#6666aa', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {t.label} &rarr;
              {isReady && <span className="ml-1">&bull;</span>}
            </button>
          );
        })}
      </div>

      {/* Free text */}
      <form onSubmit={(e) => { e.preventDefault(); if (freeInput.trim()) onFreeText(freeInput.trim()); }}
        className="flex items-center gap-2 mb-6">
        <span className="text-[#6666aa] text-sm">or:</span>
        <input
          type="text"
          value={freeInput}
          onChange={(e) => setFreeInput(e.target.value)}
          disabled={isGenerating}
          placeholder="describe what happens next..."
          className="bg-transparent border-none outline-none text-white placeholder-[#4444aa] text-sm w-64"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
        />
      </form>

      {/* Back to editing */}
      <button
        onClick={onCancel}
        className="text-[11px] cursor-pointer transition-colors hover:text-white"
        style={{ color: '#6666aa' }}
      >
        &larr; keep editing {currentSegment?.name || 'current segment'}
      </button>

      {isGenerating && (
        <div className="mt-4 text-[#8888cc] text-sm">generating... &#9608;</div>
      )}
    </div>
  );
}
