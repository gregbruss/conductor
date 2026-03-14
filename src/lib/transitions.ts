export interface Transition {
  type: string;
  label: string;
  prompt: string;
}

export const ALL_TRANSITIONS: Transition[] = [
  {
    type: 'build_up',
    label: 'build up',
    prompt: 'Create the NEXT section: a BUILD UP. Gradually increase tension and energy from the previous section. Add hi-hat rolls, filter sweeps, rising elements. Create anticipation.',
  },
  {
    type: 'drop',
    label: 'drop',
    prompt: 'Create the NEXT section: a DROP. Maximum energy, full power. Strong kick, heavy bass, all layers hitting hard. This is the peak moment.',
  },
  {
    type: 'break_down',
    label: 'break down',
    prompt: 'Create the NEXT section: a BREAKDOWN. Strip back to minimal elements. Remove the kick, keep atmospheric elements. Create breathing room and space.',
  },
  {
    type: 'strip_back',
    label: 'strip back',
    prompt: 'Create the NEXT section: STRIPPED BACK. Pull out most elements, leave just one or two layers. Tension through absence and minimalism.',
  },
  {
    type: 'twist',
    label: 'twist',
    prompt: 'Create the NEXT section: a TWIST. Unexpected direction change — new sounds, different rhythm, surprise the listener while keeping musical cohesion.',
  },
  {
    type: 'bring_home',
    label: 'bring home',
    prompt: 'Create the NEXT section: BRING IT HOME. Return to familiar elements from earlier in the song. Wind down the energy. Resolution and closure.',
  },
];

/**
 * Get the top 3 recommended transitions based on what just happened
 * and where we are in the song.
 */
export function getRecommendedTransitions(
  segmentName: string,
  position: number,
  total: number,
): string[] {
  const name = segmentName.toLowerCase();

  // Name-based recommendations
  if (name.includes('intro') || name === 'start') return ['build_up', 'drop', 'twist'];
  if (name.includes('build')) return ['drop', 'twist', 'strip_back'];
  if (name.includes('drop')) return ['break_down', 'strip_back', 'twist'];
  if (name.includes('break')) return ['build_up', 'drop', 'bring_home'];
  if (name.includes('strip')) return ['build_up', 'twist', 'bring_home'];
  if (name.includes('twist')) return ['drop', 'build_up', 'break_down'];
  if (name.includes('home') || name.includes('outro')) return ['strip_back', 'bring_home', 'twist'];

  // Position-based fallback
  const pct = total > 1 ? position / total : 0;
  if (pct < 0.3) return ['build_up', 'drop', 'twist'];
  if (pct < 0.6) return ['drop', 'break_down', 'twist'];
  return ['break_down', 'bring_home', 'strip_back'];
}

/**
 * Get a song position descriptor for the prompt.
 */
export function getSongPositionLabel(index: number, total: number): string {
  if (total <= 1) return 'opening';
  const pct = index / total;
  if (pct < 0.2) return 'opening';
  if (pct < 0.4) return 'early';
  if (pct < 0.6) return 'middle';
  if (pct < 0.8) return 'late';
  return 'closing';
}
