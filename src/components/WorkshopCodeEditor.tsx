import { useEffect, useMemo, useRef, useState } from 'react';
import { countSliders, updateSliderInCode } from './InteractiveCode';

interface Props {
  code: string;
  onChange: (nextCode: string) => void;
  placeholder: string;
}

type SliderToken = {
  value: number;
  min: number;
  max: number;
};

type LineToken =
  | { type: 'text'; value: string }
  | { type: 'slider'; value: SliderToken };

const SLIDER_RE = /slider\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/g;

function tokenizeLine(line: string): LineToken[] {
  const tokens: LineToken[] = [];
  let cursor = 0;

  SLIDER_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SLIDER_RE.exec(line)) !== null) {
    if (match.index > cursor) {
      tokens.push({ type: 'text', value: line.slice(cursor, match.index) });
    }
    tokens.push({
      type: 'slider',
      value: {
        value: parseFloat(match[1]),
        min: parseFloat(match[2]),
        max: parseFloat(match[3]),
      },
    });
    cursor = match.index + match[0].length;
  }

  if (cursor < line.length) {
    tokens.push({ type: 'text', value: line.slice(cursor) });
  }

  if (tokens.length === 0) {
    tokens.push({ type: 'text', value: '' });
  }

  return tokens;
}

function formatSliderValue(value: number, min: number, max: number): string {
  const range = max - min;
  if (range >= 100) return Math.round(value).toString();
  if (range >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

function InlineSlider({
  slider,
  globalIndex,
  onChange,
}: {
  slider: SliderToken;
  globalIndex: number;
  onChange: (globalIndex: number, nextValue: number) => void;
}) {
  const step = Math.max((slider.max - slider.min) / 200, 0.01);
  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <span>slider(</span>
      <input
        type="range"
        value={slider.value}
        min={slider.min}
        max={slider.max}
        step={step}
        onChange={(event) => onChange(globalIndex, parseFloat(event.target.value))}
        onClick={(event) => event.stopPropagation()}
        className="code-slider"
        style={{ width: 108 }}
      />
      <span style={{ color: '#88ff88' }}>{formatSliderValue(slider.value, slider.min, slider.max)}</span>
      <span style={{ color: 'rgba(255,255,255,0.45)' }}>{`, ${slider.min}, ${slider.max})`}</span>
    </span>
  );
}

export default function WorkshopCodeEditor({
  code,
  onChange,
  placeholder,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const lines = useMemo(() => code.split('\n'), [code]);
  const sliderOffsets = useMemo(() => {
    let offset = 0;
    return lines.map((line) => {
      const current = offset;
      offset += countSliders(line);
      return current;
    });
  }, [lines]);

  useEffect(() => {
    if (!isEditing || !textareaRef.current) return;
    const element = textareaRef.current;
    element.focus();
    const position = element.value.length;
    element.setSelectionRange(position, position);
  }, [isEditing]);

  return (
    <div
      onClick={() => {
        if (!isEditing) setIsEditing(true);
      }}
      style={{
        border: '1px solid rgba(255,255,255,0.1)',
        minHeight: 280,
        background: 'rgba(0,0,0,0.05)',
      }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setIsEditing(false);
            }
          }}
          className="w-full min-h-[280px] resize-y bg-transparent outline-none text-sm leading-relaxed"
          style={{ color: '#ffffff', padding: '10px 12px' }}
          spellCheck={false}
          placeholder={placeholder}
        />
      ) : (
        <div
          className="text-sm leading-relaxed cursor-text"
          style={{
            color: '#ffffff',
            padding: '10px 12px',
            minHeight: 280,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {code.trim().length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.45)' }}>{placeholder}</div>
          ) : (
            lines.map((line, lineIndex) => {
              const tokens = tokenizeLine(line);
              let sliderIndexInLine = 0;

              return (
                <div key={`line-${lineIndex}`} style={{ minHeight: '1.6em' }}>
                  {tokens.map((token, tokenIndex) => {
                  if (token.type === 'text') {
                    return (
                      <span key={`text-${lineIndex}-${tokenIndex}`}>
                        {token.value.length > 0 ? token.value : (tokenIndex === 0 ? ' ' : '')}
                      </span>
                    );
                  }

                  return (
                    <InlineSlider
                      key={`slider-${lineIndex}-${tokenIndex}`}
                      slider={token.value}
                      globalIndex={sliderOffsets[lineIndex] + sliderIndexInLine++}
                      onChange={(globalIndex, nextValue) => {
                        onChange(updateSliderInCode(code, globalIndex, nextValue));
                      }}
                    />
                  );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
