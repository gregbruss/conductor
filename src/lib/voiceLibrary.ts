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
  {
    id: 'kick-sub-weight',
    name: 'sub weight',
    description: 'Deep four-on-the-floor kick with a rounded low-pass tail.',
    role: 'kick',
    code: `$: s("bd*4")
.lpf(slider(180, 60, 400))
.room(0.08)
.gain(slider(1.2, 0, 1.5))`,
    tags: ['steady', 'club', 'sub'],
  },
  {
    id: 'kick-broken-thump',
    name: 'broken thump',
    description: 'Broken-grid kick pulse with speed accents and tighter cuts.',
    role: 'kick',
    code: `$: s("[bd bd*2] <bd*2 bd>")
.speed("<1 0.9 1.1 1>")
.cut(1)
.lpf(slider(240, 80, 500))
.gain(slider(1.05, 0, 1.5))`,
    tags: ['broken', 'accented', 'tight'],
  },
  {
    id: 'kick-dust-stomp',
    name: 'dust stomp',
    description: 'Dusty kick phrase with alternating transients and room bloom.',
    role: 'kick',
    code: `$: s("<bd*3 [bd bd]>")
.speed("<1 0.85 1 1.15>")
.room(slider(0.22, 0, 0.8))
.hpf(35)
.gain(slider(1.1, 0, 1.5))`,
    tags: ['dusty', 'groove', 'roomy'],
  },
  {
    id: 'kick-iron-engine',
    name: 'iron engine',
    description: 'Mechanical kick engine with bit-crushed body and stereo motion.',
    role: 'kick',
    code: `$: s("bd <bd*2 [bd bd]>")
.crush(slider(2, 0, 8))
.pan("<0 -0.1 0.1 0>")
.lpf(slider(210, 90, 420))
.gain(slider(0.98, 0, 1.5))`,
    tags: ['mechanical', 'industrial', 'driving'],
  },
  {
    id: 'hats-needle-spray',
    name: 'needle spray',
    description: 'Fast hat spray with alternating filters and crisp stereo movement.',
    role: 'hats',
    code: `$: s("hh*8")
.hpf(slider(7000, 2000, 12000))
.pan("<-0.4 0.4 -0.2 0.2>")
.gain(slider(0.72, 0, 1.5))`,
    tags: ['fast', 'crisp', 'wide'],
  },
  {
    id: 'hats-air-grid',
    name: 'air grid',
    description: 'Open and closed hat interplay with a light room wash.',
    role: 'hats',
    code: `$: s("<hh*4 [hh oh] hh*2 oh>")
.hpf(slider(6200, 1500, 11000))
.room(slider(0.18, 0, 0.7))
.gain(slider(0.68, 0, 1.5))`,
    tags: ['open', 'grid', 'airy'],
  },
  {
    id: 'hats-shiver-tick',
    name: 'shiver tick',
    description: 'Jittered hat pattern with subtle speed modulation and crush.',
    role: 'hats',
    code: `$: s("[hh hh*2] <hh hh oh>")
.speed("<1 1.2 0.8 1>")
.crush(slider(1, 0, 6))
.hpf(slider(7800, 2500, 12000))
.gain(slider(0.64, 0, 1.5))`,
    tags: ['jitter', 'digital', 'shimmer'],
  },
  {
    id: 'hats-late-smoke',
    name: 'late smoke',
    description: 'Laid-back offbeat hats with soft delay tails.',
    role: 'hats',
    code: `$: s("<oh hh oh [hh hh]>")
.delay(slider(0.2, 0, 0.8))
.hpf(slider(5600, 1800, 10000))
.pan("<0.25 -0.25 0.15 -0.15>")
.gain(slider(0.61, 0, 1.5))`,
    tags: ['offbeat', 'smoky', 'delayed'],
  },
  {
    id: 'snare-back-alley',
    name: 'back alley',
    description: 'Classic snare backbeat with roomy crack and midrange bite.',
    role: 'snare',
    code: `$: s("[~ sd] [~ sd]")
.room(slider(0.24, 0, 0.9))
.hpf(slider(600, 150, 2500))
.gain(slider(0.95, 0, 1.5))`,
    tags: ['backbeat', 'roomy', 'classic'],
  },
  {
    id: 'snare-rim-theory',
    name: 'rim theory',
    description: 'Rim and snare alternation for lean syncopated punctuation.',
    role: 'snare',
    code: `$: s("<[~ rim] [~ sd] [rim ~] [~ sd]>")
.pan("<-0.2 0.2 0 0.15>")
.hpf(slider(900, 250, 3000))
.gain(slider(0.84, 0, 1.5))`,
    tags: ['rim', 'syncopated', 'lean'],
  },
  {
    id: 'snare-clap-bloom',
    name: 'clap bloom',
    description: 'Clap-snare hybrid with wider room bloom and softened highs.',
    role: 'snare',
    code: `$: s("<[~ cp] [~ sd cp]>")
.room(slider(0.36, 0, 1))
.lpf(slider(5200, 1200, 9000))
.gain(slider(0.9, 0, 1.5))`,
    tags: ['clap', 'hybrid', 'wide'],
  },
  {
    id: 'snare-static-slap',
    name: 'static slap',
    description: 'Crushed snare punctuation with unstable timing energy.',
    role: 'snare',
    code: `$: s("<[~ sd] [rim sd] [~ sd*2] [cp ~]>")
.crush(slider(2, 0, 8))
.delay(slider(0.12, 0, 0.5))
.gain(slider(0.88, 0, 1.5))`,
    tags: ['crushed', 'glitchy', 'punch'],
  },
  {
    id: 'bass-foundation-drop',
    name: 'foundation drop',
    description: 'Solid sine bass anchor with short melodic dips.',
    role: 'bass',
    code: `$: note("c2 c2 g1 <c2 a1>")
.s("sine")
.lpf(slider(240, 80, 900))
.room(0.05)
.gain(slider(1.05, 0, 1.5))`,
    tags: ['sub', 'anchor', 'minimal'],
  },
  {
    id: 'bass-acid-root',
    name: 'acid root',
    description: 'Saw bass riff with resonant filter movement in C minor.',
    role: 'bass',
    code: `$: note("<c2 eb2 g1 bb1>")
.s("sawtooth")
.lpf(slider(420, 100, 1800))
.delay(0.08)
.gain(slider(0.96, 0, 1.5))`,
    tags: ['acid', 'riff', 'resonant'],
  },
  {
    id: 'bass-rubber-pulse',
    name: 'rubber pulse',
    description: 'Bouncy square bass with stepping movement and clipped attacks.',
    role: 'bass',
    code: `$: note("[c2 c3] <g1 bb1> [c2 d2]")
.s("square")
.cut(1)
.lpf(slider(520, 120, 1600))
.gain(slider(0.9, 0, 1.5))`,
    tags: ['bouncy', 'square', 'steppy'],
  },
  {
    id: 'bass-night-rail',
    name: 'night rail',
    description: 'Low triangle bass line with stereo glide and long-space tail.',
    role: 'bass',
    code: `$: note("<c2 ~ g1 ~> [bb1 c2]")
.s("triangle")
.pan("<-0.15 0.15 0 -0.1>")
.room(slider(0.18, 0, 0.7))
.lpf(slider(300, 90, 1100))
.gain(slider(0.92, 0, 1.5))`,
    tags: ['warm', 'rolling', 'nocturnal'],
  },
  {
    id: 'pad-glass-halo',
    name: 'glass halo',
    description: 'Bright supersaw pad with gentle delay and wide pan drift.',
    role: 'pad',
    code: `$: note("<c4 e4 g4 b4>")
.s("supersaw")
.delay(slider(0.25, 0, 0.9))
.pan("<-0.3 0.3 -0.15 0.15>")
.lpf(slider(2800, 500, 8000))
.gain(slider(0.62, 0, 1.5))`,
    tags: ['bright', 'wide', 'wash'],
  },
  {
    id: 'pad-velvet-floor',
    name: 'velvet floor',
    description: 'Soft triangle pad for low-mid body and slow room bloom.',
    role: 'pad',
    code: `$: note("[c3 g3] <bb3 f3> [a3 e3]")
.s("triangle")
.room(slider(0.42, 0, 1))
.lpf(slider(1800, 300, 5000))
.gain(slider(0.58, 0, 1.5))`,
    tags: ['soft', 'warm', 'bed'],
  },
  {
    id: 'pad-neon-fog',
    name: 'neon fog',
    description: 'Filtered saw pad with a darker top and delayed shimmer.',
    role: 'pad',
    code: `$: note("<c4 bb3 g3 eb4>")
.s("sawtooth")
.delay(slider(0.32, 0, 1))
.hpf(slider(180, 0, 1200))
.lpf(slider(2200, 400, 7000))
.gain(slider(0.55, 0, 1.5))`,
    tags: ['dark', 'foggy', 'shimmer'],
  },
  {
    id: 'pad-dawn-bloom',
    name: 'dawn bloom',
    description: 'Gentle sine chord cycle with broad room and slow lift.',
    role: 'pad',
    code: `$: note("<c4 e4> <d4 fs4> <a3 c4> <g3 b3>")
.s("sine")
.room(slider(0.55, 0, 1))
.pan("<-0.2 0.2 0.1 -0.1>")
.gain(slider(0.6, 0, 1.5))`,
    tags: ['ambient', 'gentle', 'lift'],
  },
  {
    id: 'lead-acid-line',
    name: 'acid line',
    description: 'Sharp saw lead with snappy filter motion and short echoes.',
    role: 'lead',
    code: `$: note("[c4 eb4 g4 bb4]*2")
.s("sawtooth")
.lpf(slider(1600, 300, 5000))
.delay(slider(0.14, 0, 0.6))
.gain(slider(0.78, 0, 1.5))`,
    tags: ['acid', 'sharp', 'melodic'],
  },
  {
    id: 'lead-laser-thread',
    name: 'laser thread',
    description: 'Focused square lead with narrow cuts and bouncing stereo taps.',
    role: 'lead',
    code: `$: note("<c5 g4 eb5 bb4>*2")
.s("square")
.cut(1)
.pan("<-0.25 0.25 -0.1 0.1>")
.gain(slider(0.74, 0, 1.5))`,
    tags: ['focused', 'square', 'agile'],
  },
  {
    id: 'lead-sky-bend',
    name: 'sky bend',
    description: 'Airy triangle lead with room bloom and filtered top end.',
    role: 'lead',
    code: `$: note("<g4 a4 c5 e5> [d5 c5]")
.s("triangle")
.room(slider(0.28, 0, 0.9))
.lpf(slider(2600, 500, 7000))
.gain(slider(0.7, 0, 1.5))`,
    tags: ['airy', 'expressive', 'float'],
  },
  {
    id: 'lead-silver-bite',
    name: 'silver bite',
    description: 'Supersaw lead stacked for hooks with a polished top-end sheen.',
    role: 'lead',
    code: `$: note("<c5 eb5 g5 bb5>")
.s("supersaw")
.hpf(slider(220, 0, 1200))
.delay(slider(0.18, 0, 0.8))
.gain(slider(0.76, 0, 1.5))`,
    tags: ['hook', 'anthemic', 'bright'],
  },
  {
    id: 'texture-ghost-dust',
    name: 'ghost dust',
    description: 'Sparse hat and rim haze for motion without obvious pulse.',
    role: 'texture',
    code: `$: s("<[hh ~ rim] [~ oh ~] [hh rim ~] [~ ~ oh]>")
.room(slider(0.48, 0, 1))
.hpf(slider(4200, 800, 12000))
.gain(slider(0.48, 0, 1.5))`,
    tags: ['haze', 'sparse', 'motion'],
  },
  {
    id: 'texture-metal-mist',
    name: 'metal mist',
    description: 'Ride-crash cloud with filtered highs and delayed spread.',
    role: 'texture',
    code: `$: s("<rd ~ cr ~> [~ rd]")
.delay(slider(0.26, 0, 0.9))
.hpf(slider(5000, 1200, 12000))
.gain(slider(0.44, 0, 1.5))`,
    tags: ['metallic', 'wash', 'wide'],
  },
  {
    id: 'texture-tape-breath',
    name: 'tape breath',
    description: 'Slow hat texture with crushed edges and unstable rate.',
    role: 'texture',
    code: `$: s("<hh oh> [~ hh]")
.speed("<0.5 1 0.75 1.25>")
.crush(slider(3, 0, 8))
.room(slider(0.38, 0, 1))
.gain(slider(0.42, 0, 1.5))`,
    tags: ['lofi', 'unstable', 'breathy'],
  },
  {
    id: 'texture-night-static',
    name: 'night static',
    description: 'Thin percussion haze with stereo drift and high-pass air.',
    role: 'texture',
    code: `$: s("<rim cp ~ hh>")
.pan("<-0.35 0.35 -0.2 0.2>")
.hpf(slider(3600, 600, 10000))
.delay(slider(0.22, 0, 0.8))
.gain(slider(0.4, 0, 1.5))`,
    tags: ['thin', 'static', 'drift'],
  },
  {
    id: 'perc-tribal-step',
    name: 'tribal step',
    description: 'Mid-tom and low-tom pattern for rolling hand-drum momentum.',
    role: 'perc',
    code: `$: s("<mt lt mt [lt mt]>")
.room(slider(0.16, 0, 0.8))
.lpf(slider(1800, 300, 5000))
.gain(slider(0.82, 0, 1.5))`,
    tags: ['tribal', 'rolling', 'organic'],
  },
  {
    id: 'perc-rim-lattice',
    name: 'rim lattice',
    description: 'Interlocking rim clicks for light rhythmic scaffolding.',
    role: 'perc',
    code: `$: s("[rim ~ rim] <cp rim [~ cp]>")
.pan("<-0.25 0.25 0 -0.1>")
.hpf(slider(1800, 400, 6000))
.gain(slider(0.66, 0, 1.5))`,
    tags: ['clicky', 'interlocking', 'light'],
  },
  {
    id: 'perc-high-runner',
    name: 'high runner',
    description: 'High tom and mid tom runner that fills gaps around the groove.',
    role: 'perc',
    code: `$: s("<ht mt ht*2 [mt ht]>")
.speed("<1 1.1 0.9 1>")
.room(slider(0.14, 0, 0.7))
.gain(slider(0.71, 0, 1.5))`,
    tags: ['runner', 'nimble', 'fills'],
  },
  {
    id: 'perc-pocket-clave',
    name: 'pocket clave',
    description: 'Clave-style clap and rim phrasing with a dry, upfront pocket.',
    role: 'perc',
    code: `$: s("<cp ~ rim cp> [~ rim]")
.cut(1)
.hpf(slider(1400, 300, 5000))
.gain(slider(0.63, 0, 1.5))`,
    tags: ['clave', 'dry', 'pocket'],
  },
  {
    id: 'fx-crash-gate',
    name: 'crash gate',
    description: 'Gated crash accent for transitions and barline lifts.',
    role: 'fx',
    code: `$: s("<cr ~ ~ ~>")
.cut(1)
.room(slider(0.52, 0, 1))
.hpf(slider(2200, 400, 8000))
.gain(slider(0.74, 0, 1.5))`,
    tags: ['transition', 'accent', 'gated'],
  },
  {
    id: 'fx-reverse-mirage',
    name: 'reverse mirage',
    description: 'Pseudo-reverse ride wash via slower playback and delay bloom.',
    role: 'fx',
    code: `$: s("<rd ~ ~ [rd ~]>")
.speed("<0.5 0.75 1 0.5>")
.delay(slider(0.38, 0, 1))
.gain(slider(0.58, 0, 1.5))`,
    tags: ['reverse-ish', 'wash', 'build'],
  },
  {
    id: 'fx-bit-spark',
    name: 'bit spark',
    description: 'Crushed clap-rim flare for digital transitions and fills.',
    role: 'fx',
    code: `$: s("<[cp rim] ~ [rim cp] ~>")
.crush(slider(4, 0, 8))
.pan("<-0.4 0.4 -0.2 0.2>")
.gain(slider(0.56, 0, 1.5))`,
    tags: ['digital', 'flare', 'fill'],
  },
  {
    id: 'fx-echo-flare',
    name: 'echo flare',
    description: 'Open-hat flare with long echoes and high-air lift.',
    role: 'fx',
    code: `$: s("<oh ~ hh ~>")
.delay(slider(0.44, 0, 1))
.hpf(slider(4800, 1000, 12000))
.room(slider(0.34, 0, 1))
.gain(slider(0.52, 0, 1.5))`,
    tags: ['echo', 'air', 'lift'],
  },
  // === SHOWCASE SET: "warehouse dusk" — all C minor, designed to perform together ===

  {
    id: 'kick-pressure-floor',
    name: 'pressure floor',
    description: 'Pitched kick with sub oscillator layered underneath. Moves air.',
    role: 'kick',
    code: `$: s("bd*4").gain(0.9)
.lpf(slider(160, 60, 300))
.add(note("c1").s("sine").gain(0.4).decay(0.15))`,
    tags: ['sub', 'layered', 'pressure'],
  },
  {
    id: 'kick-skip-pulse',
    name: 'skip pulse',
    description: 'Broken kick pattern that breathes. Skips beats to create tension.',
    role: 'kick',
    code: `$: s("bd [~ bd] ~ [bd ~]")
.speed("<1 0.95 1.05 1>")
.lpf(slider(200, 60, 400))
.gain(slider(0.85, 0, 1.5))`,
    tags: ['broken', 'skippy', 'breathing'],
  },
  {
    id: 'hats-clock-drift',
    name: 'clock drift',
    description: 'Euclidean hat pattern. Not straight, not random — somewhere in between.',
    role: 'hats',
    code: `$: s("hh(5,8)")
.hpf(slider(6000, 2000, 12000))
.pan(sine.range(-0.3, 0.3).slow(4))
.gain(slider(0.6, 0, 1.5))`,
    tags: ['euclidean', 'organic', 'drift'],
  },
  {
    id: 'hats-sixteen-rain',
    name: 'sixteen rain',
    description: '16th hats with velocity variation. Feels like drumming, not programming.',
    role: 'hats',
    code: `$: s("hh*16")
.gain("<0.8 0.4 0.6 0.4 0.8 0.3 0.7 0.5 0.8 0.4 0.6 0.3 0.9 0.4 0.5 0.3>")
.hpf(slider(7500, 3000, 12000))
.room(0.05)`,
    tags: ['velocity', 'human', 'rain'],
  },
  {
    id: 'snare-shadow-step',
    name: 'shadow step',
    description: 'Dry clap-snare answer that lands behind the beat and leaves space.',
    role: 'snare',
    code: `$: s("<[~ cp] [~ sd] [~ cp] [~ sd cp]>")
.room(slider(0.14, 0, 0.8))
.hpf(slider(900, 200, 3200))
.gain(slider(0.72, 0, 1.4))`,
    tags: ['dry', 'answering', 'space'],
  },
  {
    id: 'bass-deep-current',
    name: 'deep current',
    description: 'Sub bass with slow filter envelope. Feels like it\'s pulling the room.',
    role: 'bass',
    code: `$: note("<c2 [c2 g1] eb2 [bb1 c2]>")
.s("sine")
.lpf(sine.range(120, 400).slow(8))
.gain(slider(1.1, 0, 1.5))`,
    tags: ['sub', 'slow', 'pulling'],
  },
  {
    id: 'bass-saw-climb',
    name: 'saw climb',
    description: 'Saw bass with rising filter. Each phrase opens up more.',
    role: 'bass',
    code: `$: note("<c2 eb2 g2 bb2>")
.s("sawtooth")
.lpf(saw.range(200, 1200).slow(4))
.gain(slider(0.7, 0, 1.5))`,
    tags: ['saw', 'rising', 'energy'],
  },
  {
    id: 'bass-corner-pressure',
    name: 'corner pressure',
    description: 'Syncopated FM bass that pokes through the groove instead of sitting under it.',
    role: 'bass',
    code: `$: note("<c2 [~ eb2] g1 [bb1 c2]>")
.s("sine")
.fm(slider(1.8, 0, 4))
.lpf(slider(520, 120, 1800))
.gain(slider(0.78, 0, 1.3))`,
    tags: ['fm', 'syncopated', 'pointed'],
  },
  {
    id: 'pad-slow-glass',
    name: 'slow glass',
    description: 'Chord pad that changes once per bar. Patient. Immersive.',
    role: 'pad',
    code: `$: note("<[c4,eb4,g4] [bb3,d4,f4] [ab3,c4,eb4] [g3,bb3,d4]>")
.s("supersaw")
.lpf(slider(1800, 400, 5000))
.room(slider(0.5, 0, 1))
.gain(slider(0.35, 0, 1))`,
    tags: ['chords', 'slow', 'immersive'],
  },
  {
    id: 'pad-breath-cycle',
    name: 'breath cycle',
    description: 'Sine pad that swells and fades with LFO. Sounds like the room breathing.',
    role: 'pad',
    code: `$: note("[c4,g4,eb5]")
.s("sine")
.gain(sine.range(0.05, 0.5).slow(8))
.room(slider(0.6, 0, 1))
.lpf(sine.range(800, 3000).slow(16))`,
    tags: ['breathing', 'lfo', 'ambient'],
  },
  {
    id: 'pad-afterimage',
    name: 'afterimage',
    description: 'High suspended chord haze that hangs above the rhythm like light on smoke.',
    role: 'pad',
    code: `$: note("<[g4,bb4,d5] [eb4,g4,c5] [f4,ab4,c5] [g4,bb4,d5]>")
.s("triangle")
.delay(slider(0.34, 0, 0.9))
.room(slider(0.58, 0, 1))
.gain(slider(0.28, 0, 0.9))`,
    tags: ['suspended', 'high', 'haze'],
  },
  {
    id: 'lead-mirror-line',
    name: 'mirror line',
    description: 'Melodic line that plays forward then backward. Hypnotic.',
    role: 'lead',
    code: `$: note("<c5 eb5 g5 bb5 g5 eb5>")
.s("triangle")
.delay(slider(0.2, 0, 0.8))
.lpf(slider(2400, 500, 6000))
.gain(slider(0.55, 0, 1.2))`,
    tags: ['palindrome', 'hypnotic', 'melodic'],
  },
  {
    id: 'lead-stab-question',
    name: 'stab question',
    description: 'Short chord stabs with rests. Asks a question every bar.',
    role: 'lead',
    code: `$: note("<[c5,eb5,g5] ~ ~ [bb4,d5,f5]>")
.s("square")
.lpf(slider(1800, 400, 5000))
.decay(0.12)
.gain(slider(0.6, 0, 1.2))`,
    tags: ['stabs', 'sparse', 'question'],
  },
  {
    id: 'lead-late-signal',
    name: 'late signal',
    description: 'A delayed square motif that feels like it arrives from the far side of the room.',
    role: 'lead',
    code: `$: note("<~ c5 eb5 ~ [g5 bb4]>")
.s("square")
.delay(slider(0.42, 0, 0.9))
.lpf(slider(2100, 400, 7000))
.gain(slider(0.44, 0, 1.1))`,
    tags: ['delayed', 'motif', 'distant'],
  },
  {
    id: 'texture-vinyl-crackle',
    name: 'vinyl crackle',
    description: 'Crushed noise with filtering. Makes digital sound analog.',
    role: 'texture',
    code: `$: s("white")
.gain(0.04)
.crush(slider(6, 2, 12))
.hpf(slider(3000, 500, 8000))
.lpf(slider(8000, 2000, 14000))`,
    tags: ['noise', 'analog', 'warmth'],
  },
  {
    id: 'texture-distant-radio',
    name: 'distant radio',
    description: 'Filtered noise bursts. Like catching a signal from far away.',
    role: 'texture',
    code: `$: s("<white ~ ~ white> [~ white]")
.gain(0.06)
.crush(4)
.hpf(slider(2000, 500, 8000))
.lpf(slider(4000, 1000, 10000))
.room(slider(0.5, 0, 1))`,
    tags: ['radio', 'sparse', 'atmosphere'],
  },
  {
    id: 'texture-vent-hiss',
    name: 'vent hiss',
    description: 'Thin air texture with a breathing filter. More pressure than percussion.',
    role: 'texture',
    code: `$: s("white")
.gain(sine.range(0.01, 0.07).slow(6))
.hpf(slider(5000, 1500, 12000))
.pan(sine.range(-0.25, 0.25).slow(5))
.room(slider(0.24, 0, 0.9))`,
    tags: ['air', 'breathing', 'pressure'],
  },
  {
    id: 'perc-rim-clock',
    name: 'rim clock',
    description: 'Steady rim click on the offbeat. The skeleton of time.',
    role: 'perc',
    code: `$: s("[~ rim] [~ rim]")
.hpf(slider(2000, 500, 6000))
.gain(slider(0.5, 0, 1.2))
.pan("<-0.2 0.2>")`,
    tags: ['rim', 'steady', 'clock'],
  },
  {
    id: 'perc-tom-conversation',
    name: 'tom conversation',
    description: 'Low and mid toms talking to each other. Polyrhythmic.',
    role: 'perc',
    code: `$: s("lt(3,8)").gain(0.7)
.add(s("mt(5,8)").gain(0.5))
.lpf(slider(2000, 400, 5000))
.room(slider(0.2, 0, 0.8))`,
    tags: ['toms', 'polyrhythm', 'conversation'],
  },
  {
    id: 'perc-trip-wire',
    name: 'trip wire',
    description: 'Small metallic triplet figure that makes the groove feel unstable in a good way.',
    role: 'perc',
    code: `$: s("<rim*3 ~ rim*3 ~>")
.speed("<1 1 0.5 1>")
.hpf(slider(2600, 800, 7000))
.gain(slider(0.46, 0, 1.1))
.pan("<-0.18 0.18 0>")`,
    tags: ['triplet', 'metallic', 'unstable'],
  },
  {
    id: 'fx-swell-lift',
    name: 'swell lift',
    description: 'Noise swell that rises over 4 bars. Use before a drop.',
    role: 'fx',
    code: `$: s("white")
.gain(saw.range(0, 0.15).slow(4))
.hpf(saw.range(1000, 12000).slow(4))
.room(0.3)`,
    tags: ['riser', 'swell', 'transition'],
  },
  {
    id: 'fx-impact-scatter',
    name: 'impact scatter',
    description: 'Crash into scattered delay tails. One hit, long memory.',
    role: 'fx',
    code: `$: s("<cr ~ ~ ~>")
.delay(slider(0.5, 0, 1))
.room(slider(0.6, 0, 1))
.hpf(slider(3000, 500, 10000))
.gain(slider(0.5, 0, 1.2))`,
    tags: ['impact', 'crash', 'delay'],
  },
  {
    id: 'fx-freeze-flash',
    name: 'freeze flash',
    description: 'Short bright accent with enough room to cut a seam before the next phrase.',
    role: 'fx',
    code: `$: s("<cp cr ~ ~>")
.room(slider(0.46, 0, 1))
.delay(slider(0.18, 0, 0.7))
.hpf(slider(2400, 600, 9000))
.gain(slider(0.38, 0, 1))`,
    tags: ['accent', 'seam', 'bright'],
  },
];

export function getPresetsByRole(role: VoiceRole): VoicePreset[] {
  return VOICE_LIBRARY.filter((preset) => preset.role === role);
}
