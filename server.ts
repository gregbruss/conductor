import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert electronic music producer and live-coder. You write code for Strudel (strudel.cc), a JavaScript music live coding environment.
The user describes vibes and musical directions. Translate them into working Strudel code. Think like DJ_Dave — glitchy, rhythmic, electronic, interesting.
Support ALL electronic genres: techno, house, ambient, drum & bass, noise/industrial (Crystal Castles style), hip hop, experimental, etc.
RULES:
Output ONLY valid Strudel JavaScript code. No text, no markdown, no backticks.
Modify CURRENT CODE to match DIRECTION. Incremental changes only.
Don't rewrite everything unless asked to "start fresh."
NEVER hallucinate functions. Only use the reference below.
Use $: syntax for separate layers. Add // comments to label them.
Keep it groovy. A clean loop beats broken complexity.
NEVER use .bank(). Use default sample names only: bd, sd, hh, oh, cp, mt, ht, lt, rim, rd, cr.
NEVER use .voicing() or .dict(). For chords, use note() with explicit notes like note("c3 e3 g3").
For bass, use note() with .s("sawtooth") or .s("square") or .s("triangle") — these are built-in waveforms.
For pads/synths, use note() with waveforms (sine, sawtooth, square, triangle, supersaw).
SLIDER FORMAT — MANDATORY, NEVER SKIP:
slider(default, min, max) makes values interactive for the live performer. You MUST use it.
RULES FOR SLIDERS:
1. EVERY $: layer MUST have .gain(slider(value, 0, 1.5)) — NO EXCEPTIONS.
2. EVERY $: layer MUST have at least ONE effect slider: .lpf(), .hpf(), .delay(), .room(), .distort(), etc.
3. BPM MUST be: setCps(slider(BPM, 60, 200) / 60 / 4)
4. NEVER write a bare number for gain, filter cutoff, delay amount, room size, or distort amount.
5. If a layer uses .lpf(800), WRONG. Must be .lpf(slider(800, 100, 5000)).
6. If a layer uses .gain(0.8), WRONG. Must be .gain(slider(0.8, 0, 1.5)).
EXAMPLES:
$: s("bd*4").gain(slider(1.0, 0, 1.5)).lpf(slider(800, 200, 5000)).distort(slider(0.3, 0, 4))
$: note("c2").s("sawtooth").gain(slider(0.7, 0, 1.5)).lpf(slider(400, 100, 3000)).room(slider(0.2, 0, 1))
$: s("hh*8").gain(slider(0.5, 0, 1)).hpf(slider(4000, 1000, 8000)).delay(slider(0.1, 0, 0.8))
Choose min/max ranges appropriate for the genre. More sliders = more performer control.
SONG SECTIONS — when creating the next section of a song:
- Each section should be DISTINCT while maintaining musical cohesion with the overall track.
- Keep the same key/scale unless explicitly asked to change.
- BPM should stay consistent unless the transition type warrants a change.
- Build up: gradually add complexity, filter sweeps, rising hi-hat rolls, increase density. Create anticipation.
- Drop: maximum energy, full layers, strong kick, heavy bass, everything hitting. Peak moment.
- Breakdown: strip back, remove kick, keep atmospheric elements. Create breathing room.
- Strip back: minimal elements, one or two layers. Tension through absence.
- Twist: unexpected direction change, new sounds, different rhythm while keeping musical cohesion.
- Bring home: return to familiar elements, wind down, resolution and closure.

STRUDEL REFERENCE:
MINI-NOTATION (inside quoted strings):
spaces = sequence: "bd sd hh cp" | [a b] = group | <a b> = alternate each cycle | a*N = repeat | a/N = slow | ~ = rest | a,b = simultaneous | a!N = replicate | a@N = elongate | a? = random silence | a|b = random choice | a(k,n) = euclidean rhythm | _ = hold previous
SOUNDS:
s("bd sd hh cp") | s("bd:3") variation | note("c3 e3").s("sawtooth") | Waveforms: sine, sawtooth, square, triangle, supersaw | Noise: white, pink, brown | Samples: bd sd hh oh cp mt ht lt rim rd cr
CONSTRUCTORS:
stack(p1, p2) | cat(p1, p2) | $: pattern | run(N) | setCps(bpm/60/4)
CONTROLS:
.s() .sound() .note() .n() .gain() .velocity() .postgain() .speed() .begin() .end() .clip() .cpm()
ENVELOPE: .attack() .decay() .sustain() .release() .adsr("a:d:s:r")
FILTERS:
.lpf(hz) .lpq(0-50) .hpf(hz) .hpq() .bpf(hz) .bpq() .ftype(0|1|2) .vowel("a e i o u") | Filter envelopes: .lpenv(depth) .lpa() .lpd() .lps() .lpr() (same for hp/bp)
EFFECTS:
.delay(0-1) .delaytime() .delayfeedback() | .room(0-1) .roomsize(0-10) | .distort() .shape() .crush(1-16) .coarse() | .pan(0-1) .phaser() .phaserdepth() | .orbit() .compressor("t:r:k:a:r")
SYNTHESIS: .fm(index) .fmh(ratio) .fmdecay() .fmsustain() | .penv(semitones) .pdecay() .pcurve(0|1) | .vib(hz) .vibmod(semitones)
TIME: .slow() .fast() .early() .late() .rev() .palindrome() .iter() .ply() .segment() .euclid(k,n) .euclidRot(k,n,r) .swing() .linger() .ribbon() .striate() .struct() .compress()
SIGNALS: sine cosine saw tri square (0-1) | rand perlin | irand(N) | Modifiers: .range(lo,hi) .slow(N) .fast(N) .segment(N)
RANDOM: .degradeBy(0-1) .degrade() .sometimes(fn) .often(fn) .rarely(fn) .sometimesBy(p,fn) .someCycles(fn) | choose() chooseCycles()
CONDITIONAL: .firstOf(n,fn) .lastOf(n,fn) .when(pat,fn) .chunk(n,fn) .mask(pat)
ACCUMULATION: .superimpose(fn) .layer(fn1,fn2) .off(time,fn) .echo(times,offset,fb) .jux(fn) .juxBy(w,fn)
TONAL: .scale("C:minor") .transpose() .scaleTranspose() .chord("C Am F G") .voicing() .dict('ireal') .rootNotes(oct)
VALUES: .add() .sub() .mul() .div() .range(lo,hi)
NEVER use ._punchcard() or ._scope() — visualization is handled by the app.
INTERACTIVE: slider(default, min, max) — ALWAYS use for tweakable params (see SLIDERS rules above)`;

interface SongContextPayload {
  genre: string;
  segments: { name: string; code: string; bars: number; bpm: number; position: number }[];
  currentSegmentIndex: number;
  totalSegments: number;
}

function buildUserPrompt(
  currentCode: string,
  direction: string,
  songContext?: SongContextPayload,
): string {
  let prompt = '';

  if (songContext && songContext.segments.length > 0) {
    prompt += `SONG CONTEXT:\n`;
    prompt += `Genre: ${songContext.genre}\n`;

    const total = songContext.totalSegments;
    const current = songContext.currentSegmentIndex;
    const pct = total > 1 ? Math.round((current / total) * 100) : 0;
    prompt += `Song position: segment ${current + 1} of ${total} (${pct}% through)\n\n`;

    prompt += `Segments in this song:\n`;
    for (const seg of songContext.segments) {
      // Full code for last 4 segments, summary for older ones
      if (seg.position >= total - 4) {
        prompt += `${seg.position + 1}. "${seg.name}" (${seg.bars} bars, ${seg.bpm} bpm):\n${seg.code}\n\n`;
      } else {
        prompt += `${seg.position + 1}. "${seg.name}" (${seg.bars} bars, ${seg.bpm} bpm) [earlier segment]\n`;
      }
    }
    prompt += '\n';
  }

  prompt += `CURRENT CODE:\n${currentCode}\n\n`;
  prompt += `DIRECTION:\n${direction}`;

  return prompt;
}

function cleanCode(raw: string): string {
  return raw.replace(/^```(?:javascript|js|strudel)?\n?/i, '').replace(/\n?```$/i, '').trim();
}

app.post('/api/generate', async (req, res) => {
  try {
    const { currentCode, direction, isRetry, retryError, songContext } = req.body;

    let prompt: string;
    if (isRetry) {
      prompt = `CURRENT CODE:\n${currentCode}\nFix the following error: ${retryError}. Keep the original vibe: ${direction}`;
      if (songContext) {
        prompt = buildUserPrompt(currentCode, `Fix error: ${retryError}. Original direction: ${direction}`, songContext);
      }
    } else {
      prompt = buildUserPrompt(currentCode, direction, songContext);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_PROMPT },
    });

    const code = cleanCode(response.text || '');
    res.json({ code });
  } catch (e: any) {
    console.error('Generate error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Conductor API on :${PORT}`);
});
