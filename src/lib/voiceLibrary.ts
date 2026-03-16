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

  // ═══════════════════════════════════════════════════════════════
  // SHOWCASE SET: "velvet" — smoky, dubbed-out, late-night motion
  // All C minor. Round drums, soft edges, deep movement.
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'kick-velvet-thump',
    name: 'velvet thump',
    description: 'Round house kick with a lazy pocket and soft lowpass bloom.',
    role: 'kick',
    code: `$: s("bd ~ [bd ~] ~ bd ~ [~ bd] ~")
.lpf(slider(170, 70, 320))
.room(0.04)
.gain(slider(0.96, 0, 1.4))`,
    tags: ['round', 'lazy', 'house'],
  },
  {
    id: 'hats-velvet-dust',
    name: 'velvet dust',
    description: 'Shuffled closed hats with little gaps. Dry enough to keep the groove breathing.',
    role: 'hats',
    code: `$: s("<hh ~ hh hh ~ hh [~ hh] hh>")
.hpf(slider(6800, 2500, 13000))
.gain(slider(0.42, 0, 1.1))
.pan(sine.range(-0.12, 0.12).slow(6))`,
    tags: ['shuffled', 'dry', 'breathing'],
  },
  {
    id: 'snare-velvet-snap',
    name: 'velvet snap',
    description: 'A soft clap/snare backbeat that sits behind the kick instead of fighting it.',
    role: 'snare',
    code: `$: s("<[~ cp] [~ sd] [~ cp] [~ sd]>")
.room(slider(0.16, 0, 0.55))
.hpf(slider(900, 250, 2800))
.gain(slider(0.72, 0, 1.2))`,
    tags: ['soft', 'backbeat', 'rounded'],
  },
  {
    id: 'bass-velvet-rolling',
    name: 'velvet rolling',
    description: 'Subby triangle bass that keeps moving under the drums with a gentle filter sway.',
    role: 'bass',
    code: `$: note("<c2 ~ c2 g1 ~ eb2 c2 ~>")
.s("triangle")
.lpf(sine.range(180, 520).slow(6))
.room(0.08)
.gain(slider(0.88, 0, 1.25))`,
    tags: ['subby', 'rolling', 'gentle'],
  },
  {
    id: 'pad-velvet-mist',
    name: 'velvet mist',
    description: 'Muted minor chords with long reverb tails. More atmosphere than statement.',
    role: 'pad',
    code: `$: note("<[c4,eb4,g4] [ab3,c4,eb4] [bb3,d4,f4] [g3,bb3,d4]>")
.s("sawtooth")
.lpf(slider(1400, 250, 3600))
.room(slider(0.68, 0, 1))
.gain(slider(0.22, 0, 0.7))`,
    tags: ['muted', 'misty', 'atmospheric'],
  },
  {
    id: 'lead-velvet-trace',
    name: 'velvet trace',
    description: 'A tiny delayed lead line that leaves traces in the dark instead of sitting on top.',
    role: 'lead',
    code: `$: note("~ g4 ~ bb4 ~ c5 ~ eb5")
.s("square")
.delay(slider(0.28, 0, 0.8))
.lpf(slider(2400, 500, 5200))
.gain(slider(0.34, 0, 0.9))`,
    tags: ['delayed', 'small', 'nocturnal'],
  },
  {
    id: 'texture-velvet-air',
    name: 'velvet air',
    description: 'Filtered noise breathing in long cycles. A soft halo around the set.',
    role: 'texture',
    code: `$: s("white")
.gain(sine.range(0.01, 0.04).slow(10))
.hpf(slider(3200, 800, 9000))
.lpf(slider(9500, 2500, 14000))
.room(slider(0.45, 0, 1))`,
    tags: ['halo', 'breathing', 'soft'],
  },
  {
    id: 'perc-velvet-knock',
    name: 'velvet knock',
    description: 'A sparse woody rim pattern that nudges the groove without getting busy.',
    role: 'perc',
    code: `$: s("<rim ~ ~ rim [~ rim] ~ ~ ~>")
.hpf(slider(1800, 500, 6000))
.delay(slider(0.1, 0, 0.35))
.gain(slider(0.46, 0, 1))`,
    tags: ['woody', 'sparse', 'nudge'],
  },
  {
    id: 'fx-velvet-fall',
    name: 'velvet fall',
    description: 'A soft descending sine sweep that feels more like a curtain drop than a riser.',
    role: 'fx',
    code: `$: note("<eb6 ~ ~ ~ ~ ~ ~ ~>")
.s("sine")
.penv(-18)
.pdecay(slider(0.5, 0.08, 1.1))
.room(slider(0.42, 0, 0.9))
.gain(slider(0.22, 0, 0.6))`,
    tags: ['descending', 'soft', 'curtain'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SHOWCASE SET: "quartz" — crystalline, glitchy, industrial cold
  // All D minor. Sharp transients, metallic edges, precise clockwork.
  // Uses the EmuSP12 sample map for a new compatibility target.
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'kick-quartz-click',
    name: 'quartz click',
    description: 'A clipped SP12 kick pattern with sharp transients and a short metallic tail.',
    role: 'kick',
    code: `$: s("bd(3,8)")
.bank("EmuSP12")
.lpf(slider(420, 180, 1800))
.clip(0.5)
.gain(slider(0.82, 0, 1.2))`,
    tags: ['sp12', 'sharp', 'surgical'],
  },
  {
    id: 'hats-quartz-shards',
    name: 'quartz shards',
    description: 'Metallic SP12 hats that jitter lightly across the stereo field.',
    role: 'hats',
    code: `$: s("hh*8")
.bank("EmuSP12")
.crush(slider(4, 2, 8))
.pan(sine.range(-0.45, 0.45).slow(2))
.gain(slider(0.32, 0, 0.85))`,
    tags: ['sp12', 'metallic', 'glitch'],
  },
  {
    id: 'snare-quartz-rim',
    name: 'quartz rim',
    description: 'A cold gated rim/clap accent that snaps through the center of the groove.',
    role: 'snare',
    code: `$: s("<~ rim ~ cp>")
.bank("EmuSP12")
.hpf(slider(1200, 500, 3200))
.room(0.08)
.gain(slider(0.62, 0, 1.1))`,
    tags: ['sp12', 'cold', 'gated'],
  },
  {
    id: 'bass-quartz-grid',
    name: 'quartz grid',
    description: 'Rigid square/FM bass moving in discrete steps like an icy sequencer.',
    role: 'bass',
    code: `$: note("<d1 f1 g1 [d1 c1]>")
.s("square")
.fm(slider(1.2, 0, 3.2))
.lpf(slider(1200, 300, 3000))
.gain(slider(0.68, 0, 1.05))`,
    tags: ['rigid', 'fm', 'grid'],
  },
  {
    id: 'pad-quartz-glacier',
    name: 'quartz glacier',
    description: 'Stark minor saw chords with a low, fixed ceiling and very little warmth.',
    role: 'pad',
    code: `$: note("<[d3,f3,a3] [bb2,d3,f3] [c3,e3,g3] [a2,d3,f3]>")
.s("sawtooth")
.lpf(slider(900, 250, 1800))
.room(slider(0.35, 0, 0.85))
.gain(slider(0.18, 0, 0.5))`,
    tags: ['cold', 'stark', 'glacial'],
  },
  {
    id: 'lead-quartz-ping',
    name: 'quartz ping',
    description: 'Resonant little sine pings with a digital delay trail hanging behind them.',
    role: 'lead',
    code: `$: note("d5(5,8,1)")
.s("sine")
.delay(slider(0.55, 0, 0.9))
.lpf(slider(4200, 1200, 8000))
.gain(slider(0.24, 0, 0.65))`,
    tags: ['ping', 'digital', 'resonant'],
  },
  {
    id: 'texture-quartz-static',
    name: 'quartz static',
    description: 'Bit-crushed white noise breathing like machinery in a frozen room.',
    role: 'texture',
    code: `$: s("white")
.crush(slider(2, 1, 6))
.lpf(sine.range(1200, 5000).slow(8))
.gain(slider(0.03, 0, 0.12))`,
    tags: ['static', 'mechanical', 'crushed'],
  },
  {
    id: 'perc-quartz-tock',
    name: 'quartz tock',
    description: 'Dry SP12 rim ticks that make the whole set feel clocked and exact.',
    role: 'perc',
    code: `$: s("<rim ~ [~ rim] ~>")
.bank("EmuSP12")
.speed(1.2)
.hpf(slider(2400, 1000, 7000))
.gain(slider(0.45, 0, 0.95))`,
    tags: ['sp12', 'clockwork', 'dry'],
  },
  {
    id: 'fx-quartz-beam',
    name: 'quartz beam',
    description: 'A bright SP12 crash accent with extra speed for sharp transition flashes.',
    role: 'fx',
    code: `$: s("<cr ~ ~ ~>")
.bank("EmuSP12")
.speed("<1.1 1.4 1.2 1.3>")
.room(slider(0.18, 0, 0.6))
.gain(slider(0.24, 0, 0.65))`,
    tags: ['sp12', 'flash', 'transition'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SHOWCASE SET: "ambient" — spacious, suspended, slowly glowing
  // All C minor. Sparse rhythm, soft attacks, long tails.
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'kick-ambient-pulse',
    name: 'ambient pulse',
    description: 'A distant kick heartbeat. More pulse than groove.',
    role: 'kick',
    code: `$: s("bd ~ ~ ~ ~ ~ bd ~")
.room(slider(0.42, 0, 0.95))
.lpf(slider(140, 50, 260))
.gain(slider(0.58, 0, 1.1))`,
    tags: ['heartbeat', 'distant', 'sparse'],
  },
  {
    id: 'hats-ambient-air',
    name: 'ambient air',
    description: 'Occasional open hat shimmer to add just a little top-end breath.',
    role: 'hats',
    code: `$: s("<~ ~ oh ~ ~ hh ~ ~>")
.hpf(slider(4200, 1200, 10000))
.room(slider(0.35, 0, 0.9))
.gain(slider(0.18, 0, 0.55))`,
    tags: ['shimmer', 'air', 'occasional'],
  },
  {
    id: 'bass-ambient-drift',
    name: 'ambient drift',
    description: 'A low triangle bass that changes slowly and leaves lots of space.',
    role: 'bass',
    code: `$: note("<c2 ~ ~ g1 ~ eb2 ~ ~>")
.s("triangle")
.lpf(sine.range(180, 520).slow(10))
.room(slider(0.12, 0, 0.5))
.gain(slider(0.45, 0, 0.95))`,
    tags: ['slow', 'low', 'drifting'],
  },
  {
    id: 'pad-ambient-cloud',
    name: 'ambient cloud',
    description: 'Wide sine chords with long, blooming reverb and breathing gain.',
    role: 'pad',
    code: `$: note("<[c4,eb4,g4] [ab3,c4,eb4] [g3,bb3,d4] [f3,ab3,c4]>")
.s("sine")
.room(slider(0.82, 0, 1))
.delay(slider(0.22, 0, 0.7))
.gain(sine.range(0.12, 0.32).slow(14))`,
    tags: ['wide', 'blooming', 'cloud'],
  },
  {
    id: 'lead-ambient-glass',
    name: 'ambient glass',
    description: 'Sparse high notes with a long delay trail, like light reflecting in a dark room.',
    role: 'lead',
    code: `$: note("~ ~ g5 ~ ~ c6 ~ eb6")
.s("sine")
.delay(slider(0.48, 0, 0.9))
.room(slider(0.45, 0, 1))
.gain(slider(0.16, 0, 0.45))`,
    tags: ['sparse', 'reflective', 'glass'],
  },
  {
    id: 'texture-ambient-hush',
    name: 'ambient hush',
    description: 'Soft filtered noise that breathes under everything else.',
    role: 'texture',
    code: `$: s("white")
.gain(sine.range(0.005, 0.03).slow(12))
.hpf(slider(2400, 500, 7000))
.lpf(slider(8500, 2000, 14000))
.room(slider(0.48, 0, 1))`,
    tags: ['noise', 'breathing', 'soft'],
  },
  {
    id: 'perc-ambient-bloom',
    name: 'ambient bloom',
    description: 'A very occasional bell-like percussive accent that opens the phrase.',
    role: 'perc',
    code: `$: s("<~ rim ~ ~ ~ ~ cp ~>")
.speed("<1.4 1.2 1.5 1.3>")
.room(slider(0.55, 0, 1))
.hpf(slider(2600, 800, 9000))
.gain(slider(0.22, 0, 0.6))`,
    tags: ['bell-like', 'accent', 'bloom'],
  },
  {
    id: 'fx-ambient-rise',
    name: 'ambient rise',
    description: 'A soft slow-moving noise swell that can lift the scene without turning into a riser cliché.',
    role: 'fx',
    code: `$: s("white")
.gain(saw.range(0, 0.07).slow(8))
.lpf(sine.range(1000, 5000).slow(8))
.room(slider(0.7, 0, 1))
.hpf(slider(120, 30, 800))`,
    tags: ['swell', 'slow', 'lift'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SHOWCASE SET: "house" — warm, bouncy, direct, floor-ready
  // All C minor. Clear pulse, friendly movement, simple hooks.
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'kick-house-foundation',
    name: 'house foundation',
    description: 'A straight warm kick that holds the floor without getting too hard.',
    role: 'kick',
    code: `$: s("bd*4")
.lpf(slider(180, 70, 360))
.room(0.03)
.gain(slider(1.02, 0, 1.35))`,
    tags: ['four-floor', 'warm', 'foundation'],
  },
  {
    id: 'hats-house-chop',
    name: 'house chop',
    description: 'Open and closed hats alternating in a simple, danceable pattern.',
    role: 'hats',
    code: `$: s("<hh [~ hh] oh [~ hh] hh [~ hh] oh hh>")
.hpf(slider(7000, 2500, 13000))
.gain(slider(0.44, 0, 1))
.pan("<-0.08 0.08>")`,
    tags: ['alternating', 'danceable', 'bright'],
  },
  {
    id: 'snare-house-clack',
    name: 'house clack',
    description: 'A dry clap backbeat with just enough room to sit behind the kick.',
    role: 'snare',
    code: `$: s("[~ cp] [~ cp]")
.room(slider(0.1, 0, 0.4))
.hpf(slider(950, 250, 2600))
.gain(slider(0.82, 0, 1.25))`,
    tags: ['clap', 'backbeat', 'dry'],
  },
  {
    id: 'bass-house-bounce',
    name: 'house bounce',
    description: 'A round triangle bassline that pumps gently around the kick.',
    role: 'bass',
    code: `$: note("<c2 ~ c2 eb2 c2 ~ g1 ~>")
.s("triangle")
.lpf(sine.range(220, 700).slow(6))
.room(0.06)
.gain(slider(0.82, 0, 1.2))`,
    tags: ['round', 'bouncy', 'pump'],
  },
  {
    id: 'pad-house-stabs',
    name: 'house stabs',
    description: 'Short saw stabs on the chords. Classic house punctuation.',
    role: 'pad',
    code: `$: note("<[c4,eb4,g4] ~ [ab3,c4,eb4] ~ [bb3,d4,f4] ~ [g3,bb3,d4] ~>")
.s("sawtooth")
.lpf(slider(1800, 400, 4200))
.room(slider(0.28, 0, 0.8))
.gain(slider(0.24, 0, 0.7))`,
    tags: ['stabs', 'chords', 'classic'],
  },
  {
    id: 'lead-house-organ',
    name: 'house organ',
    description: 'A friendly little organ-like hook that sits above the groove.',
    role: 'lead',
    code: `$: note("~ g4 bb4 ~ c5 ~ bb4 ~")
.s("square")
.delay(slider(0.16, 0, 0.5))
.lpf(slider(2600, 600, 5000))
.gain(slider(0.32, 0, 0.8))`,
    tags: ['hook', 'organ-like', 'friendly'],
  },
  {
    id: 'texture-house-tape',
    name: 'house tape',
    description: 'Soft white noise wash that glues the top end together like tape hiss.',
    role: 'texture',
    code: `$: s("white")
.gain(sine.range(0.01, 0.035).slow(10))
.hpf(slider(3600, 1000, 9000))
.lpf(slider(9800, 3000, 14000))
.room(slider(0.18, 0, 0.6))`,
    tags: ['glue', 'tape', 'wash'],
  },
  {
    id: 'perc-house-rattle',
    name: 'house rattle',
    description: 'A light rim chatter that gives the groove a little extra shoulder movement.',
    role: 'perc',
    code: `$: s("<rim ~ rim ~ [~ rim] ~ rim ~>")
.hpf(slider(2200, 700, 7000))
.delay(slider(0.08, 0, 0.28))
.gain(slider(0.34, 0, 0.85))`,
    tags: ['chatter', 'groove', 'light'],
  },
  {
    id: 'fx-house-lift',
    name: 'house lift',
    description: 'A bright airy noise lift that can open a transition without taking over.',
    role: 'fx',
    code: `$: s("white")
.gain(saw.range(0, 0.08).slow(4))
.hpf(saw.range(1600, 9000).slow(4))
.room(slider(0.22, 0, 0.7))
    .lpf(slider(12000, 5000, 14000))`,
    tags: ['lift', 'air', 'transition'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SHOWCASE SET: "garage" — swung, rubbery, restless, late-night
  // All C minor. 2-step lean, clipped percussion, elastic low end.
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'kick-garage-skip',
    name: 'garage skip',
    description: 'A clipped TR909 kick pattern that skips around the downbeat without softening it.',
    role: 'kick',
    code: `$: s("<bd [~ bd] ~ bd>")
.bank("RolandTR909")
.clip(slider(0.42, 0.1, 0.8))
.lpf(slider(220, 80, 420))
.gain(slider(1.0, 0, 1.35))`,
    tags: ['skipping', '2-step', '909'],
  },
  {
    id: 'hats-garage-swing',
    name: 'garage swing',
    description: 'Shuffled TR909 hats with a little open-hat lift on the turnarounds.',
    role: 'hats',
    code: `$: s("<hh [~ hh] hh [hh ~] hh [~ hh] hh oh>")
.bank("RolandTR909")
.hpf(slider(8400, 3000, 14000))
.pan("<-0.12 0.12>")
.gain(slider(0.42, 0, 1.05))`,
    tags: ['shuffled', 'swing', '909'],
  },
  {
    id: 'snare-garage-snap',
    name: 'garage snap',
    description: 'A clipped 909 clap answer that pushes the backbeat off-center.',
    role: 'snare',
    code: `$: s("<[~ cp] [~ sd] [~ cp] [~ cp sd]>")
.bank("RolandTR909")
.room(slider(0.08, 0, 0.28))
.hpf(slider(1200, 300, 2800))
.gain(slider(0.82, 0, 1.2))`,
    tags: ['clipped', 'answering', 'backbeat'],
  },
  {
    id: 'bass-garage-rubber',
    name: 'garage rubber',
    description: 'An elastic FM square bassline that rebounds around the kick and snare gaps.',
    role: 'bass',
    code: `$: note("<c2 ~ eb2 g1 ~ bb1 g1 ~>")
.s("square")
.fm(slider(0.45, 0, 1.6))
.lpf(sine.range(320, 1100).slow(5))
.gain(slider(0.8, 0, 1.15))`,
    tags: ['elastic', 'rubber', 'bouncy'],
  },
  {
    id: 'pad-garage-wash',
    name: 'garage wash',
    description: 'Short warm chord hits that widen the groove without turning into a pad cloud.',
    role: 'pad',
    code: `$: note("<[c4,eb4,g4] ~ [bb3,d4,f4] ~ [ab3,c4,eb4] ~ [g3,bb3,d4] ~>")
.s("supersaw")
.lpf(slider(1400, 400, 3600))
.room(slider(0.18, 0, 0.55))
.gain(slider(0.16, 0, 0.45))`,
    tags: ['stabs', 'roomy', 'supportive'],
  },
  {
    id: 'lead-garage-glint',
    name: 'garage glint',
    description: 'A bright little hook that flashes through the gaps instead of taking over.',
    role: 'lead',
    code: `$: note("<~ g4 bb4 ~ c5 d5 ~ bb4>")
.s("triangle")
.delay(slider(0.18, 0, 0.45))
.lpf(slider(3200, 900, 6200))
.gain(slider(0.24, 0, 0.7))`,
    tags: ['bright', 'hook', 'spacey'],
  },
  {
    id: 'texture-garage-air',
    name: 'garage air',
    description: 'A clipped vinyl-and-noise top layer that keeps the set moving without washing out.',
    role: 'texture',
    code: `$: s("<white ~ white ~>")
.crush(slider(3, 2, 7))
.hpf(slider(5200, 1800, 11000))
.gain(sine.range(0.01, 0.035).slow(8))
.room(0.06)`,
    tags: ['clipped', 'top-end', 'restless'],
  },
  {
    id: 'perc-garage-click',
    name: 'garage click',
    description: 'Dry TR909 rims tucked around the groove to make the swing feel nervous.',
    role: 'perc',
    code: `$: s("<rim ~ [rim ~] ~ rim ~ [~ rim] ~>")
.bank("RolandTR909")
.hpf(slider(2800, 900, 7000))
.delay(slider(0.06, 0, 0.18))
.gain(slider(0.34, 0, 0.82))`,
    tags: ['clicks', 'chatter', 'movement'],
  },
  {
    id: 'fx-garage-rise',
    name: 'garage rise',
    description: 'A tight bright lift for transitions that keeps the set snappy instead of cinematic.',
    role: 'fx',
    code: `$: s("white")
.gain(saw.range(0, 0.05).slow(4))
.hpf(saw.range(2200, 9800).slow(4))
.room(slider(0.1, 0, 0.3))
.lpf(slider(12000, 5000, 14000))`,
    tags: ['rise', 'transition', 'bright'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SHOWCASE SET: "piano" — felt hammers, warm keys, melodic glow
  // Built around the dough-samples piano map.
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'kick-piano-step',
    name: 'piano step',
    description: 'A simple grounding kick that leaves space for the piano samples to speak.',
    role: 'kick',
    code: `$: s("bd ~ ~ bd")
.lpf(slider(180, 70, 360))
.room(0.05)
.gain(slider(0.88, 0, 1.25))`,
    tags: ['simple', 'grounding', 'space'],
  },
  {
    id: 'hats-piano-brush',
    name: 'piano brush',
    description: 'Light hats that feel more like a brushed pulse than a hard top end.',
    role: 'hats',
    code: `$: s("<hh ~ hh ~ hh [~ hh] hh ~>")
.hpf(slider(6200, 2200, 12000))
.gain(slider(0.28, 0, 0.8))
.pan("<-0.08 0.08>")`,
    tags: ['light', 'brushed', 'pulse'],
  },
  {
    id: 'snare-piano-clap',
    name: 'piano clap',
    description: 'A soft clap backbeat that keeps the set moving without fighting the keys.',
    role: 'snare',
    code: `$: s("[~ cp] [~ cp]")
.room(slider(0.12, 0, 0.4))
.hpf(slider(1000, 250, 2400))
.gain(slider(0.66, 0, 1.05))`,
    tags: ['soft', 'backbeat', 'supportive'],
  },
  {
    id: 'bass-piano-walk',
    name: 'piano walk',
    description: 'Low piano notes used as a bass walk, woody and percussive instead of subby.',
    role: 'bass',
    code: `$: note("<c2 ~ eb2 ~ g1 ~ bb1 ~>")
.s("piano")
.room(slider(0.08, 0, 0.25))
.lpf(slider(1400, 400, 3200))
.gain(slider(0.64, 0, 1))`,
    tags: ['woody', 'walking', 'percussive'],
  },
  {
    id: 'pad-piano-bloom',
    name: 'piano bloom',
    description: 'Wide piano chords that bloom into the room and hang just behind the drums.',
    role: 'pad',
    code: `$: note("<[c4,eb4,g4] ~ [ab3,c4,eb4] ~ [bb3,d4,f4] ~ [g3,bb3,d4] ~>")
.s("piano")
.room(slider(0.42, 0, 1))
.delay(slider(0.18, 0, 0.5))
.gain(slider(0.24, 0, 0.6))`,
    tags: ['bloom', 'wide', 'room'],
  },
  {
    id: 'lead-piano-figure',
    name: 'piano figure',
    description: 'A little repeating piano phrase that turns the set from texture into song.',
    role: 'lead',
    code: `$: note("<g4 bb4 c5 bb4 g4 ~ eb5 ~>")
.s("piano")
.delay(slider(0.14, 0, 0.35))
.room(slider(0.18, 0, 0.45))
.gain(slider(0.28, 0, 0.7))`,
    tags: ['phrase', 'songful', 'keys'],
  },
  {
    id: 'texture-piano-room',
    name: 'piano room',
    description: 'A faint room-noise halo that makes the piano feel recorded, not synthesized.',
    role: 'texture',
    code: `$: s("white")
.gain(sine.range(0.006, 0.022).slow(10))
.hpf(slider(5000, 1800, 11000))
.room(slider(0.28, 0, 0.7))
.lpf(slider(12000, 5000, 14000))`,
    tags: ['halo', 'recorded', 'air'],
  },
  {
    id: 'perc-piano-knock',
    name: 'piano knock',
    description: 'Dry rim knocks that underline the piano rhythm without turning into drums-first music.',
    role: 'perc',
    code: `$: s("<rim ~ ~ rim ~ rim ~ ~>")
.hpf(slider(2400, 800, 7000))
.gain(slider(0.28, 0, 0.72))
.room(0.04)`,
    tags: ['knock', 'dry', 'underlining'],
  },
  {
    id: 'fx-piano-fall',
    name: 'piano fall',
    description: 'A high piano accent that falls through a little space before the next phrase.',
    role: 'fx',
    code: `$: note("<c6 ~ ~ ~ ~ ~ ~ ~>")
.s("piano")
.room(slider(0.35, 0, 0.8))
.delay(slider(0.16, 0, 0.4))
.gain(slider(0.18, 0, 0.45))`,
    tags: ['accent', 'falling', 'phrase'],
  },
];

export function getPresetsByRole(role: VoiceRole): VoicePreset[] {
  return VOICE_LIBRARY.filter((preset) => preset.role === role);
}
