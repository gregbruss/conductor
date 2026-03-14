import { memo, type JSX } from 'react';

interface Props {
  code: string;
  onSliderChange: (globalSliderIndex: number, value: number) => void;
  sliderOffset?: number;
  disabled?: boolean;
}

interface SliderInfo {
  value: number;
  min: number;
  max: number;
  start: number;
  end: number;
  label: string;
}

const SLIDER_RE = /slider\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/g;

function findSliders(code: string): SliderInfo[] {
  const results: SliderInfo[] = [];
  SLIDER_RE.lastIndex = 0;
  let m;
  while ((m = SLIDER_RE.exec(code)) !== null) {
    const before = code.slice(Math.max(0, m.index - 40), m.index);
    const labelMatch = before.match(/\.?(\w+)\(\s*$/);
    results.push({
      value: parseFloat(m[1]),
      min: parseFloat(m[2]),
      max: parseFloat(m[3]),
      start: m.index,
      end: m.index + m[0].length,
      label: labelMatch ? labelMatch[1] : 'val',
    });
  }
  return results;
}

export function countSliders(code: string): number {
  SLIDER_RE.lastIndex = 0;
  let n = 0;
  while (SLIDER_RE.exec(code)) n++;
  return n;
}

export function updateSliderInCode(code: string, sliderIndex: number, newValue: number): string {
  const sliders = findSliders(code);
  if (sliderIndex >= sliders.length) return code;
  const s = sliders[sliderIndex];
  const range = s.max - s.min;
  let formatted: string;
  if (range >= 100) formatted = Math.round(newValue).toString();
  else if (range >= 1) formatted = newValue.toFixed(1);
  else formatted = newValue.toFixed(2);
  return code.slice(0, s.start) + `slider(${formatted}, ${s.min}, ${s.max})` + code.slice(s.end);
}

export function stripSliders(code: string): string {
  return code.replace(/slider\(\s*([\d.]+)\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)/g, '$1');
}

// Syntax highlighting
function highlight(text: string): (JSX.Element | string)[] {
  const els: (JSX.Element | string)[] = [];
  const lines = text.split('\n');

  lines.forEach((line, li) => {
    if (li > 0) els.push('\n');
    if (line.trimStart().startsWith('//')) {
      els.push(<span key={`c-${li}`} style={{ color: '#6666aa' }}>{line}</span>);
      return;
    }
    const re = /(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*'|\$:|\b\d+\.?\d*\b)/g;
    let last = 0;
    let match;
    while ((match = re.exec(line)) !== null) {
      if (match.index > last) els.push(line.slice(last, match.index));
      const tok = match[0];
      if (tok === '$:') {
        els.push(<span key={`d-${li}-${match.index}`} className="font-bold">{tok}</span>);
      } else if (tok.startsWith('"') || tok.startsWith("'")) {
        els.push(<span key={`s-${li}-${match.index}`} style={{ color: '#88ff88' }}>{tok}</span>);
      } else {
        els.push(<span key={`n-${li}-${match.index}`} style={{ color: '#ffff88' }}>{tok}</span>);
      }
      last = match.index + match[0].length;
    }
    if (last < line.length) els.push(line.slice(last));
  });

  return els;
}

function formatVal(value: number, min: number, max: number): string {
  const range = max - min;
  if (range >= 100) return Math.round(value).toString();
  if (range >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

const ParamSlider = memo(function ParamSlider({
  label, value, min, max, onChange, disabled,
}: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
        {label}
      </span>
      <input
        type="range"
        className="code-slider"
        value={value}
        min={min}
        max={max}
        step={(max - min) / 200}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        style={{ width: 80 }}
      />
      <span className="text-[10px]" style={{ color: '#88ff88', minWidth: '3ch' }}>
        {formatVal(value, min, max)}
      </span>
    </div>
  );
});

// --- Separate exports for split layout ---

/** Renders just the syntax-highlighted code with slider values inlined */
export function CodeDisplay({ code }: { code: string }) {
  return (
    <pre className="whitespace-pre-wrap m-0 text-sm leading-relaxed">
      {highlight(stripSliders(code))}
    </pre>
  );
}

/** Renders just the slider controls for a piece of code */
export function SliderRow({
  code,
  onSliderChange,
  sliderOffset = 0,
  disabled,
  limit,
}: Props & { limit?: number }) {
  const sliders = findSliders(code);
  const visible = typeof limit === 'number' ? sliders.slice(0, limit) : sliders;
  if (sliders.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1">
      {visible.map((s, i) => (
        <ParamSlider
          key={i}
          label={s.label}
          value={s.value}
          min={s.min}
          max={s.max}
          onChange={(v) => onSliderChange(sliderOffset + i, v)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

// --- Combined component (used for preamble) ---

export default function InteractiveCode({ code, onSliderChange, sliderOffset = 0, disabled }: Props) {
  const sliders = findSliders(code);
  const cleanCode = stripSliders(code);

  return (
    <div>
      <pre className="whitespace-pre-wrap m-0 text-sm leading-relaxed">{highlight(cleanCode)}</pre>
      {sliders.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5">
          {sliders.map((s, i) => (
            <ParamSlider
              key={i}
              label={s.label}
              value={s.value}
              min={s.min}
              max={s.max}
              onChange={(v) => onSliderChange(sliderOffset + i, v)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
