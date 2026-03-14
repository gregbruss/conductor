import { parseLayers, reconstructCode } from './parser';

/**
 * Adjust the .gain() value of a specific layer. Instant, no AI call.
 */
export function adjustGain(fullCode: string, layerIndex: number, newGain: number): string {
  const { preamble, layers } = parseLayers(fullCode);
  if (layerIndex < 0 || layerIndex >= layers.length) return fullCode;

  const layer = layers[layerIndex];
  const gainRegex = /\.gain\([^)]*\)/;

  if (gainRegex.test(layer.code)) {
    layer.code = layer.code.replace(gainRegex, `.gain(${newGain.toFixed(2)})`);
  } else {
    // Append .gain() to the first line
    const lines = layer.code.split('\n');
    lines[0] += `.gain(${newGain.toFixed(2)})`;
    layer.code = lines.join('\n');
  }

  return reconstructCode(preamble, layers, null);
}

/**
 * Change the BPM by modifying setCps(). Instant, no AI call.
 */
export function adjustBpm(code: string, newBpm: number): string {
  const bpmRegex = /setCps\([^)]*\)/;
  if (bpmRegex.test(code)) {
    return code.replace(bpmRegex, `setCps(${newBpm}/60/4)`);
  }
  return `setCps(${newBpm}/60/4)\n${code}`;
}

/**
 * Multiply density (*N) values in a specific layer. Instant, no AI call.
 */
export function adjustDensity(fullCode: string, layerIndex: number, factor: number): string {
  const { preamble, layers } = parseLayers(fullCode);
  if (layerIndex < 0 || layerIndex >= layers.length) return fullCode;

  const layer = layers[layerIndex];
  layer.code = layer.code.replace(/\*(\d+)/g, (_match, n) => {
    const newN = Math.max(1, Math.min(32, Math.round(parseInt(n) * factor)));
    return `*${newN}`;
  });

  return reconstructCode(preamble, layers, null);
}

/**
 * Remove a layer from the code. Instant, no AI call.
 */
export function removeLayer(fullCode: string, layerIndex: number): string {
  const { preamble, layers } = parseLayers(fullCode);
  if (layerIndex < 0 || layerIndex >= layers.length) return fullCode;

  layers.splice(layerIndex, 1);
  return reconstructCode(preamble, layers, null);
}

/**
 * Extract the gain value from a layer's code string.
 */
export function extractGain(layerCode: string): number {
  const match = layerCode.match(/\.gain\(([^)]+)\)/);
  if (match) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? 1.0 : Math.min(1.5, Math.max(0, val));
  }
  return 1.0;
}

/**
 * Extract BPM from code.
 */
export function extractBpm(code: string): number {
  const m = code.match(/setCps\((\d+(?:\.\d+)?)\/60\/4\)/);
  return m ? Math.round(parseFloat(m[1])) : 120;
}
