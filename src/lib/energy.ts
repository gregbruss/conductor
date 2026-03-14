export function calculateEnergy(code: string): number {
  const layers = (code.match(/^\$:/gm) || []).length;
  const multipliers = (code.match(/\*\d+/g) || []).length;
  const raw = layers * 0.2 + multipliers * 0.04 + Math.min(code.length / 600, 0.3);
  return Math.min(1, Math.max(0.08, raw));
}
