import type { CrateVoice, VoiceRole } from '../types';

export const WORKSHOP_SEEDS: Record<VoiceRole, string> = {
  kick: `$: s("bd*4")
.gain(slider(1.0, 0, 1.5))
.lpf(slider(200, 60, 500))`,
  hats: `$: s("hh*16")
.gain(slider(0.5, 0, 1.5))
.hpf(slider(6000, 1500, 12000))`,
  snare: `$: s("[~ sd] [~ sd]")
.gain(slider(0.9, 0, 1.5))
.room(slider(0.2, 0, 1))`,
  bass: `$: note("<c2 eb2>")
.s("sawtooth")
.gain(slider(0.8, 0, 1.5))
.lpf(slider(400, 100, 1600))`,
  pad: `$: note("<c4 eb4 g4 bb4>")
.s("supersaw")
.gain(slider(0.5, 0, 1.5))
.room(slider(0.4, 0, 1))`,
  lead: `$: note("<c5 eb5 g5>")
.s("square")
.gain(slider(0.7, 0, 1.5))
.delay(slider(0.15, 0, 0.8))`,
  texture: `$: s("<hh ~ rim ~>")
.gain(slider(0.4, 0, 1.5))
.room(slider(0.35, 0, 1))
.hpf(slider(4200, 800, 12000))`,
  perc: `$: s("<rim cp rim ~>")
.gain(slider(0.7, 0, 1.5))
.hpf(slider(1800, 400, 6000))`,
  fx: `$: s("<cr ~ ~ ~>")
.gain(slider(0.6, 0, 1.5))
.delay(slider(0.3, 0, 1))
.room(slider(0.4, 0, 1))`,
};

export function createBlankWorkshopVoice(role: VoiceRole): CrateVoice {
  return {
    id: `scratch-${role}-${Date.now()}`,
    name: `new ${role}`,
    description: `Built from scratch in workshop.`,
    setName: 'chrome',
    role,
    code: WORKSHOP_SEEDS[role],
    tags: [role, 'scratch'],
    savedAt: Date.now(),
    isFavorite: false,
  };
}
