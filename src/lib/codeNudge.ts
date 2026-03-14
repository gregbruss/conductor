export interface AdjustableLine {
  lineIndex: number;
  label: string;
  value: number;
  min: number;
  max: number;
  isSlider: boolean;
}

export function findAdjustableLines(code: string): AdjustableLine[] {
  const lines = code.split('\n');
  const results: AdjustableLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const sliderMatch = line.match(/\.(\w+)\(\s*slider\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
    if (sliderMatch) {
      results.push({
        lineIndex: i,
        label: sliderMatch[1],
        value: parseFloat(sliderMatch[2]),
        min: parseFloat(sliderMatch[3]),
        max: parseFloat(sliderMatch[4]),
        isSlider: true,
      });
      continue;
    }

    const simpleMatch = line.match(/\.(\w+)\(\s*([\d.]+)\s*\)/);
    if (simpleMatch) {
      const val = parseFloat(simpleMatch[2]);
      results.push({
        lineIndex: i,
        label: simpleMatch[1],
        value: val,
        min: 0,
        max: val * 3 || 1,
        isSlider: false,
      });
    }
  }

  return results;
}

export function nudgeLineValue(code: string, lineIndex: number, direction: 1 | -1, large: boolean): string {
  const lines = code.split('\n');
  const line = lines[lineIndex];

  const sliderMatch = line.match(/slider\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
  if (sliderMatch) {
    const value = parseFloat(sliderMatch[1]);
    const min = parseFloat(sliderMatch[2]);
    const max = parseFloat(sliderMatch[3]);
    const range = max - min;
    const step = large ? range * 0.1 : range * 0.02;
    const next = Math.min(max, Math.max(min, value + direction * step));
    const formatted = range >= 100 ? Math.round(next).toString()
      : range >= 1 ? next.toFixed(1)
      : next.toFixed(2);
    lines[lineIndex] = line.replace(sliderMatch[0], `slider(${formatted}, ${min}, ${max})`);
    return lines.join('\n');
  }

  const simpleMatch = line.match(/(\.(\w+)\()\s*([\d.]+)\s*(\))/);
  if (simpleMatch) {
    const value = parseFloat(simpleMatch[3]);
    const step = large
      ? (value >= 1000 ? 100 : value >= 100 ? 10 : value >= 10 ? 1 : value >= 1 ? 0.1 : 0.01)
      : (value >= 1000 ? 10 : value >= 100 ? 1 : value >= 10 ? 0.1 : value >= 1 ? 0.01 : 0.005);
    const next = Math.max(0, value + direction * step);
    const decimals = simpleMatch[3].includes('.') ? simpleMatch[3].split('.')[1].length : 0;
    const formatted = next.toFixed(Math.max(decimals, step < 1 ? 2 : 0));
    lines[lineIndex] = line.replace(simpleMatch[0], `${simpleMatch[1]}${formatted}${simpleMatch[4]}`);
    return lines.join('\n');
  }

  return code;
}
