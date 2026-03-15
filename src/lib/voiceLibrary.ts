export type VoiceRole = 'kick' | 'hats' | 'snare' | 'bass' | 'pad' | 'lead' | 'texture' | 'perc' | 'fx';

export type VoicePreset = {
  id: string;
  name: string;
  description: string;
  role: VoiceRole;
  code: string;
  tags: string[];
};

export const VOICE_ROLES: { role: VoiceRole; label: string; icon: string }[] = [
  { role: 'kick', label: 'Kick', icon: 'O' },
  { role: 'hats', label: 'Hats', icon: '^' },
  { role: 'snare', label: 'Snare', icon: '#' },
  { role: 'bass', label: 'Bass', icon: '_' },
  { role: 'pad', label: 'Pad', icon: '=' },
  { role: 'lead', label: 'Lead', icon: '>' },
  { role: 'texture', label: 'Texture', icon: '~' },
  { role: 'perc', label: 'Perc', icon: ':' },
  { role: 'fx', label: 'FX', icon: '*' },
];

export const VOICE_LIBRARY: VoicePreset[] = [

  // ═══════════════════════════════════════════════════════════════
  // SHOWCASE SET: "nerve" — dark, kinetic, UK bass / post-dubstep
  // All C minor. Syncopated, tense, lots of space and forward lean.
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'kick-nerve-pressure',
    name: 'nerve pressure',
    description: 'Syncopated kick that leans forward. The missing third beat creates tension.',
    role: 'kick',
    code: `$: s("bd [~ bd] ~ <bd [bd ~]>")
.lpf(slider(180, 60, 350))
.room(0.06)
.gain(slider(1.0, 0, 1.5))`,
    tags: ['syncopated', 'leaning', 'tense'],
  },
  {
    id: 'hats-nerve-scatter',
    name: 'nerve scatter',
    description: 'Seven-in-sixteen euclidean hats. Feels rushed and breathless.',
    role: 'hats',
    code: `$: s("hh(7,16)")
.hpf(slider(7500, 3000, 14000))
.pan(sine.range(-0.2, 0.2).slow(3))
.gain(slider(0.55, 0, 1.3))`,
    tags: ['euclidean', 'breathless', 'scattered'],
  },
  {
    id: 'snare-nerve-crack',
    name: 'nerve crack',
    description: 'Shifting backbeat that alternates between clap and snare placements.',
    role: 'snare',
    code: `$: s("<[~ cp] [~ sd] [~ cp] [~ sd cp]>")
.room(slider(0.18, 0, 0.7))
.hpf(slider(600, 150, 2500))
.gain(slider(0.82, 0, 1.4))`,
    tags: ['shifting', 'lurching', 'crack'],
  },
  {
    id: 'bass-nerve-undertow',
    name: 'nerve undertow',
    description: 'Saw bass with FM grit and a slowly breathing filter. Pulls the room sideways.',
    role: 'bass',
    code: `$: note("<c2 [c2 g1] eb2 [bb1 c2]>")
.s("sawtooth")
.lpf(sine.range(150, 600).slow(4))
.fm(slider(0.8, 0, 2.5))
.gain(slider(0.85, 0, 1.3))`,
    tags: ['fm', 'breathing', 'gritty'],
  },
  {
    id: 'pad-nerve-haze',
    name: 'nerve haze',
    description: 'Open saw voicings in minor. Wide intervals for an unsettled, spacious feel.',
    role: 'pad',
    code: `$: note("<[c4,g4,eb5] [ab3,eb4,c5] [bb3,f4,d5] [g3,d4,bb4]>")
.s("sawtooth")
.lpf(slider(1600, 300, 4000))
.room(slider(0.55, 0, 1))
.gain(slider(0.28, 0, 0.8))`,
    tags: ['open', 'unsettled', 'wide'],
  },
  {
    id: 'lead-nerve-wire',
    name: 'nerve wire',
    description: 'Sparse square lead where delay fills in the silences. Less is everything.',
    role: 'lead',
    code: `$: note("<~ c5 ~ eb5 ~ g4 bb4 ~>")
.s("square")
.lpf(slider(1800, 400, 5000))
.delay(slider(0.35, 0, 0.9))
.gain(slider(0.4, 0, 1))`,
    tags: ['sparse', 'delayed', 'ghostly'],
  },
  {
    id: 'texture-nerve-static',
    name: 'nerve static',
    description: 'Breathing digital noise floor. Crushed and band-limited. Always moving.',
    role: 'texture',
    code: `$: s("white")
.gain(sine.range(0.01, 0.05).slow(8))
.crush(slider(5, 2, 10))
.hpf(slider(4000, 1000, 10000))
.lpf(slider(9000, 3000, 14000))`,
    tags: ['digital', 'breathing', 'noise'],
  },
  {
    id: 'perc-nerve-tap',
    name: 'nerve tap',
    description: 'Sparse rim and clap conversation with delay depth. Ticking in the walls.',
    role: 'perc',
    code: `$: s("<rim [~ cp] ~ [rim ~]>")
.hpf(slider(2200, 600, 6000))
.delay(slider(0.18, 0, 0.6))
.gain(slider(0.52, 0, 1.2))`,
    tags: ['sparse', 'ticking', 'metallic'],
  },
  {
    id: 'fx-nerve-siren',
    name: 'nerve siren',
    description: 'Sine that drops two octaves. A descending siren once per eight beats.',
    role: 'fx',
    code: `$: note("<c6 ~ ~ ~ ~ ~ ~ ~>")
.s("sine")
.penv(-24)
.pdecay(slider(0.6, 0.1, 1.5))
.room(slider(0.5, 0, 1))
.gain(slider(0.25, 0, 0.7))`,
    tags: ['siren', 'descending', 'dramatic'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SHOWCASE SET: "driftwood" — warm, organic, downtempo
  // All C minor. Patient, spacious, lots of reverb and delay.
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'kick-drift-heartbeat',
    name: 'driftwood heartbeat',
    description: 'Two hits per bar with wide spacing. A resting pulse in a large room.',
    role: 'kick',
    code: `$: s("bd ~ ~ ~ ~ bd ~ ~")
.room(slider(0.35, 0, 0.9))
.lpf(slider(150, 60, 300))
.gain(slider(0.75, 0, 1.3))`,
    tags: ['sparse', 'roomy', 'patient'],
  },
  {
    id: 'hats-drift-rain',
    name: 'driftwood rain',
    description: 'Lazy open-hat pattern with delay tails. Sounds like rain on a slow afternoon.',
    role: 'hats',
    code: `$: s("<[~ oh] hh [~ hh] oh>")
.hpf(slider(5000, 1500, 11000))
.delay(slider(0.3, 0, 0.8))
.room(0.2)
.gain(slider(0.42, 0, 1.1))`,
    tags: ['lazy', 'delayed', 'rain'],
  },
  {
    id: 'bass-drift-tide',
    name: 'driftwood tide',
    description: 'Patient triangle bass with a slow filter sweep. Rises and falls like water.',
    role: 'bass',
    code: `$: note("c2 ~ ~ eb2 ~ ~ g1 ~")
.s("triangle")
.lpf(sine.range(200, 800).slow(12))
.room(slider(0.15, 0, 0.6))
.gain(slider(0.7, 0, 1.2))`,
    tags: ['warm', 'tidal', 'patient'],
  },
  {
    id: 'pad-drift-amber',
    name: 'driftwood amber',
    description: 'Sine chords with breathing gain. Appears and recedes over sixteen bars.',
    role: 'pad',
    code: `$: note("<[c4,g4,eb5] [ab3,eb4,c5] [f3,c4,ab4] [eb3,bb3,g4]>")
.s("sine")
.room(slider(0.6, 0, 1))
.delay(slider(0.25, 0, 0.8))
.gain(sine.range(0.15, 0.45).slow(16))`,
    tags: ['breathing', 'amber', 'immersive'],
  },
  {
    id: 'lead-drift-feather',
    name: 'driftwood feather',
    description: 'Three notes per bar. The delay writes the rest of the melody for you.',
    role: 'lead',
    code: `$: note("~ ~ g4 ~ ~ c5 ~ bb4")
.s("triangle")
.delay(slider(0.4, 0, 0.9))
.room(0.3)
.lpf(slider(2800, 600, 6000))
.gain(slider(0.38, 0, 1))`,
    tags: ['floating', 'sparse', 'melodic'],
  },
  {
    id: 'texture-drift-shore',
    name: 'driftwood shore',
    description: 'Slowed cymbal hits with deep reverb. Distant waves on a far beach.',
    role: 'texture',
    code: `$: s("<oh ~ ~ ~ cr ~ ~ ~>")
.speed("<0.5 0.75 1 0.5>")
.room(slider(0.55, 0, 1))
.hpf(slider(3000, 500, 9000))
.gain(slider(0.22, 0, 0.7))`,
    tags: ['waves', 'slowed', 'distant'],
  },
  {
    id: 'perc-drift-bell',
    name: 'driftwood bell',
    description: 'Pitched-up hats and rims become bell-like. Occasional and clear.',
    role: 'perc',
    code: `$: s("<hh ~ rim ~ ~ rim ~ ~>")
.speed("<1.5 1.3 1.4 1.2>")
.room(slider(0.4, 0, 1))
.hpf(slider(4000, 1200, 10000))
.gain(slider(0.35, 0, 0.9))`,
    tags: ['bell', 'pitched', 'occasional'],
  },
  {
    id: 'fx-drift-fog',
    name: 'driftwood fog',
    description: 'Noise that appears and disappears over sixteen bars. Like fog rolling in.',
    role: 'fx',
    code: `$: s("white")
.gain(sine.range(0, 0.08).slow(16))
.lpf(sine.range(800, 4000).slow(16))
.hpf(slider(200, 50, 1000))
.room(slider(0.7, 0, 1))`,
    tags: ['fog', 'slow', 'atmospheric'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SHOWCASE SET: "chrome" — clean, precise, modern techno
  // All C minor. Straight grid, forward motion, functional.
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'kick-chrome-drive',
    name: 'chrome drive',
    description: 'Clean four-on-the-floor with a bright attack. Forward and relentless.',
    role: 'kick',
    code: `$: s("bd*4")
.speed(1.05)
.lpf(slider(240, 80, 480))
.hpf(25)
.gain(slider(1.15, 0, 1.5))`,
    tags: ['four-floor', 'forward', 'clean'],
  },
  {
    id: 'hats-chrome-grid',
    name: 'chrome grid',
    description: 'Straight eighth hats with velocity dynamics. Precise and minimal.',
    role: 'hats',
    code: `$: s("hh*8")
.hpf(slider(9000, 4000, 14000))
.gain("<0.65 0.35 0.55 0.35 0.7 0.3 0.5 0.35>")
.pan("<-0.1 0.1>")`,
    tags: ['straight', 'precise', 'velocity'],
  },
  {
    id: 'snare-chrome-clap',
    name: 'chrome clap',
    description: 'Pure clap backbeat. No tricks, no games. Just the pocket.',
    role: 'snare',
    code: `$: s("[~ cp] [~ cp]")
.room(slider(0.12, 0, 0.5))
.hpf(slider(1000, 300, 3500))
.gain(slider(0.88, 0, 1.4))`,
    tags: ['clap', 'backbeat', 'clean'],
  },
  {
    id: 'bass-chrome-sine',
    name: 'chrome sine',
    description: 'Sine sub locked to the kick. The fourth note alternates for subtle drift.',
    role: 'bass',
    code: `$: note("c2 c2 g1 <c2 eb2>")
.s("sine")
.lpf(slider(200, 60, 600))
.gain(slider(1.1, 0, 1.5))`,
    tags: ['sub', 'locked', 'anchor'],
  },
  {
    id: 'bass-chrome-acid',
    name: 'chrome acid',
    description: 'Saw bass with filter envelope on each note. The classic 303 approach.',
    role: 'bass',
    code: `$: note("<c2 eb2 g2 c2 bb1 g1 eb2 c2>")
.s("sawtooth")
.lpf(400)
.lpa(0.01)
.lpd(slider(0.15, 0.02, 0.5))
.lps(0.1)
.lpenv(slider(3000, 500, 6000))
.gain(slider(0.7, 0, 1.2))`,
    tags: ['acid', '303', 'envelope'],
  },
  {
    id: 'pad-chrome-field',
    name: 'chrome field',
    description: 'Power voicings in fifths and octaves. Wider and heavier than triads.',
    role: 'pad',
    code: `$: note("<[c4,g4,c5] [eb4,bb4,eb5] [ab3,eb4,ab4] [bb3,f4,bb4]>")
.s("supersaw")
.lpf(slider(2200, 500, 5500))
.room(slider(0.35, 0, 0.9))
.gain(slider(0.3, 0, 0.9))`,
    tags: ['power', 'wide', 'heavy'],
  },
  {
    id: 'lead-chrome-sequence',
    name: 'chrome sequence',
    description: 'Fast arpeggio running up the chord. Classic techno sequencer energy.',
    role: 'lead',
    code: `$: note("[c5 eb5 g5 c6]*2")
.s("sawtooth")
.lpf(slider(2400, 500, 6000))
.delay(slider(0.12, 0, 0.5))
.gain(slider(0.5, 0, 1.1))`,
    tags: ['arpeggio', 'sequencer', 'running'],
  },
  {
    id: 'texture-chrome-rain',
    name: 'chrome rain',
    description: 'Sample-rate-crushed hats as texture. Digital rain from a broken speaker.',
    role: 'texture',
    code: `$: s("hh*16")
.gain("<0.25 0.1 0.18 0.08 0.22 0.06 0.15 0.1 0.2 0.08 0.16 0.06 0.25 0.08 0.12 0.08>")
.coarse(slider(10, 3, 32))
.hpf(slider(7000, 2000, 14000))
.pan(sine.range(-0.3, 0.3).slow(4))`,
    tags: ['coarse', 'digital', 'rain'],
  },
  {
    id: 'perc-chrome-click',
    name: 'chrome click',
    description: 'Three-in-eight euclidean rim clicks. The clock underneath the groove.',
    role: 'perc',
    code: `$: s("rim(3,8)")
.hpf(slider(3000, 800, 8000))
.pan("<-0.25 0.25 0>")
.gain(slider(0.48, 0, 1.1))`,
    tags: ['euclidean', 'clock', 'clicking'],
  },
  {
    id: 'fx-chrome-sweep',
    name: 'chrome sweep',
    description: 'Clean noise riser. Gets thinner and louder as it climbs over four bars.',
    role: 'fx',
    code: `$: s("white")
.gain(saw.range(0, 0.12).slow(4))
.hpf(saw.range(2000, 14000).slow(4))
.room(slider(0.2, 0, 0.7))`,
    tags: ['riser', 'sweep', 'clean'],
  },
];

export function getPresetsByRole(role: VoiceRole): VoicePreset[] {
  return VOICE_LIBRARY.filter((preset) => preset.role === role);
}
