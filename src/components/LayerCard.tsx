import { useEffect, useRef, useState } from 'react';
import type { Layer } from '../types';
import { findAdjustableLines } from '../lib/codeNudge';
import type { NavLevel } from '../hooks/useTreeNav';

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
  navLevel: NavLevel;
  lineIndex: number;
  isPlaying: boolean;
  bpm: number;
  disabled?: boolean;
}

function useBeatIndex(isPlaying: boolean, bpm: number) {
  const [beatIndex, setBeatIndex] = useState(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      setBeatIndex(0);
      startRef.current = 0;
      return undefined;
    }

    let raf = 0;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const beatMs = (60 / Math.max(bpm, 1)) * 1000;
      const nextBeat = Math.floor((ts - startRef.current) / beatMs);
      setBeatIndex(nextBeat);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [bpm, isPlaying]);

  return beatIndex;
}

function splitQuotedContent(content: string) {
  return content.split(/(\s+|[\[\]<>])/).filter((part) => part.length > 0);
}

function AnimatedLine({
  line,
  beatIndex,
  isFocused,
  dimmed,
}: {
  line: string;
  beatIndex: number;
  isFocused: boolean;
  dimmed: boolean;
}) {
  const parts: React.ReactNode[] = [];
  const regex = /"([^"]*)"/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`} style={{ color: dimmed ? 'rgba(255,255,255,0.28)' : (isFocused ? '#ffffff' : 'rgba(255,255,255,0.72)') }}>
          {line.slice(lastIndex, match.index)}
        </span>,
      );
    }

    const content = match[1];
    const tokens = splitQuotedContent(content);
    const musicalTokens = tokens.filter((token) => token.trim() && !/^\s+$/.test(token) && !/^[\[\]<>]$/.test(token));
    const activeToken = musicalTokens.length > 0 ? beatIndex % musicalTokens.length : -1;
    let musicalIndex = 0;

    parts.push(<span key={`quote-open-${match.index}`} style={{ color: dimmed ? 'rgba(255,255,255,0.28)' : '#ffffff' }}>"</span>);
    tokens.forEach((token, index) => {
      const isMusical = token.trim() && !/^[\[\]<>]$/.test(token);
      const isActive = isMusical && musicalIndex === activeToken;
      parts.push(
        <span
          key={`token-${match.index}-${index}`}
          style={{
            color: dimmed ? 'rgba(255,255,255,0.28)' : isActive ? '#88ff88' : (isFocused ? '#ffffff' : 'rgba(255,255,255,0.72)'),
            background: isActive ? 'rgba(136,255,136,0.14)' : 'transparent',
            boxShadow: isActive ? '0 0 0 1px rgba(136,255,136,0.24) inset' : 'none',
          }}
        >
          {token}
        </span>,
      );
      if (isMusical) musicalIndex += 1;
    });
    parts.push(<span key={`quote-close-${match.index}`} style={{ color: dimmed ? 'rgba(255,255,255,0.28)' : '#ffffff' }}>"</span>);

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    parts.push(
      <span key={`tail-${lastIndex}`} style={{ color: dimmed ? 'rgba(255,255,255,0.28)' : (isFocused ? '#ffffff' : 'rgba(255,255,255,0.72)') }}>
        {line.slice(lastIndex)}
      </span>,
    );
  }

  if (parts.length === 0) {
    parts.push(
      <span key="plain" style={{ color: dimmed ? 'rgba(255,255,255,0.28)' : (isFocused ? '#ffffff' : 'rgba(255,255,255,0.72)') }}>
        {line}
      </span>,
    );
  }

  return <>{parts}</>;
}

function LineNavCodeView({ code, lineIndex, isParameterActive, beatIndex, compact, dimmed }: {
  code: string;
  lineIndex: number;
  isParameterActive: boolean;
  beatIndex: number;
  compact: boolean;
  dimmed: boolean;
}) {
  const allLines = code.split('\n');
  const visibleLines = compact ? allLines.slice(0, 3) : allLines.slice(0, 4);
  const adjustable = findAdjustableLines(code);

  return (
    <div className="text-sm leading-relaxed" style={{ fontFamily: 'monospace' }}>
      {visibleLines.map((line, i) => {
        const isFocused = i === lineIndex;
        const param = adjustable.find((a) => a.lineIndex === i);
        const isAdj = !!param;

        return (
          <div
            key={i}
            className="px-2 py-1 flex items-center gap-3 transition-colors"
            style={{
              background: isFocused ? 'rgba(136,255,136,0.12)' : 'transparent',
              borderLeft: isFocused ? '3px solid #88ff88' : '3px solid transparent',
            }}
          >
            {isFocused && isAdj && isParameterActive ? (
              <>
                <span style={{ color: '#88ff88' }}>.{param.label}(</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 relative" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="absolute top-0 left-0 h-full"
                      style={{
                        background: '#88ff88',
                        width: `${((param.value - param.min) / (param.max - param.min)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] shrink-0" style={{ color: '#88ff88', minWidth: '4ch' }}>
                    {param.max >= 100 ? Math.round(param.value) : param.value.toFixed(2)}
                  </span>
                </div>
                <span style={{ color: '#88ff88' }}>)</span>
              </>
            ) : (
              <>
                <AnimatedLine line={line} beatIndex={beatIndex} isFocused={isFocused} dimmed={dimmed} />
                {isAdj && !isFocused && (
                  <span className="text-[9px] ml-auto shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {param.label} {param.max >= 100 ? Math.round(param.value) : param.value.toFixed(2)}
                  </span>
                )}
                {isFocused && isAdj && (
                  <span className="text-[10px] ml-auto shrink-0" style={{ color: '#88ff88' }}>
                    ↵ {param.label}: {param.max >= 100 ? Math.round(param.value) : param.value.toFixed(2)}
                  </span>
                )}
                {isFocused && !isAdj && (
                  <span className="text-[9px] ml-auto shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    —
                  </span>
                )}
              </>
            )}
          </div>
        );
      })}
      {allLines.length > visibleLines.length && (
        <div className="px-2 pt-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          …
        </div>
      )}
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
  navLevel,
  lineIndex: navLineIndex,
  isPlaying,
  bpm,
  disabled,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftCode, setDraftCode] = useState(layer.code);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatIndex = useBeatIndex(isPlaying, bpm);

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

  const isInside = navLevel === 'lane' || navLevel === 'parameter' || isEditing;
  const compact = !isSelected || navLevel === 'stage';

  return (
    <div
      className="mx-4 mb-1"
      style={{
        opacity: effectivelyMuted ? 0.5 : 1,
        border: isSelected ? '2px solid rgba(136,255,136,0.35)' : '1px solid rgba(255,255,255,0.06)',
        background: isSelected ? 'rgba(136,255,136,0.04)' : 'transparent',
      }}
      onClick={onFocus}
    >
      {/* Header — always visible */}
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="w-4 text-[11px]" style={{ color: isSelected ? '#88ff88' : 'rgba(255,255,255,0.25)' }}>
          {index + 1}
        </span>
        <span className="text-[12px] text-white">{layer.label}</span>
        {effectivelyMuted && (
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>MUTED</span>
        )}
        {isInside && (
          <span className="text-[9px] uppercase tracking-[0.18em]" style={{ color: '#88ff88' }}>
            {isEditing ? 'editing' : navLevel === 'parameter' ? '←→ adjust' : 'tab · enter · esc'}
          </span>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onToggleMute(); }}
          className="text-[10px] px-1 cursor-pointer"
          style={{ color: isMuted ? '#ff9d84' : 'rgba(255,255,255,0.2)' }}
        >
          [m]
        </button>
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onToggleSolo(); }}
          className="text-[10px] px-1 cursor-pointer"
          style={{ color: isSoloed ? '#88ff88' : 'rgba(255,255,255,0.2)' }}
        >
          [s]
        </button>
      </div>

      {!effectivelyMuted && (
        <div className="px-4 pl-8 pb-3 pt-0">
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
                  if (draftCode.trim()) onUpdateCode(draftCode);
                  setIsEditing(false);
                }
              }}
              disabled={disabled}
              className="w-full min-h-[100px] resize-y bg-transparent outline-none text-sm leading-relaxed"
              style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px' }}
              spellCheck={false}
            />
          ) : (
            <LineNavCodeView
              code={layer.code}
              lineIndex={navLineIndex}
              isParameterActive={navLevel === 'parameter'}
              beatIndex={beatIndex}
              compact={compact}
              dimmed={effectivelyMuted}
            />
          )}
        </div>
      )}
    </div>
  );
}
