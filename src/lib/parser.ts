import type { Layer } from '../types';

export interface ParsedCode {
  preamble: string;
  layers: Layer[];
}

export function parseLayers(code: string): ParsedCode {
  const lines = code.split('\n');
  const preambleLines: string[] = [];
  const layers: Layer[] = [];
  let pendingLabel: string | null = null;
  let currentLayer: Layer | null = null;
  let layerCount = 0;
  let foundFirstLayer = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for muted layer: // $: ...
    const mutedMatch = trimmed.match(/^\/\/\s*(\$:.+)$/);
    if (mutedMatch) {
      if (currentLayer) { layers.push(currentLayer); currentLayer = null; }
      foundFirstLayer = true;
      currentLayer = {
        id: `layer-${layerCount++}`,
        label: pendingLabel || `track ${layerCount}`,
        code: mutedMatch[1],
        muted: true,
      };
      pendingLabel = null;
      continue;
    }

    // Check for $: line (active layer start)
    if (trimmed.startsWith('$:')) {
      if (currentLayer) { layers.push(currentLayer); currentLayer = null; }
      foundFirstLayer = true;
      currentLayer = {
        id: `layer-${layerCount++}`,
        label: pendingLabel || `track ${layerCount}`,
        code: line,
        muted: false,
      };
      pendingLabel = null;
      continue;
    }

    // Continuation line (starts with . and follows a layer)
    if (currentLayer && trimmed.startsWith('.')) {
      currentLayer.code += '\n' + line;
      continue;
    }

    // Comment line — could be a label for the next layer
    const commentMatch = trimmed.match(/^\/\/\s*(.+)$/);
    if (commentMatch) {
      // If we have an active layer, flush it first
      if (currentLayer) { layers.push(currentLayer); currentLayer = null; }
      if (foundFirstLayer || (i + 1 < lines.length && (lines[i + 1].trim().startsWith('$:') || lines[i + 1].trim().match(/^\/\/\s*\$:/)))) {
        pendingLabel = commentMatch[1];
      } else {
        preambleLines.push(line);
      }
      continue;
    }

    // Anything else
    if (currentLayer) {
      // Blank line or other content after a layer — flush the layer
      layers.push(currentLayer);
      currentLayer = null;
      if (!foundFirstLayer) preambleLines.push(line);
    } else {
      if (!foundFirstLayer) {
        preambleLines.push(line);
      }
    }
  }

  if (currentLayer) layers.push(currentLayer);

  return {
    preamble: preambleLines.join('\n'),
    layers,
  };
}

export function reconstructCode(preamble: string, layers: Layer[], soloId: string | null): string {
  const lines: string[] = [];
  if (preamble.trim()) lines.push(preamble);

  for (const layer of layers) {
    lines.push('');
    lines.push(`// ${layer.label}`);
    const isMuted = layer.muted || (soloId !== null && layer.id !== soloId);
    if (isMuted) {
      // Comment out each line of the layer code
      layer.code.split('\n').forEach(l => lines.push(`// ${l}`));
    } else {
      lines.push(layer.code);
    }
  }

  return lines.join('\n');
}
