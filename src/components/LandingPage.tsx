import { useEffect, useRef, useState } from 'react';

interface Props {
  onEnter: () => void;
}

const vocabulary = [
  { verb: 'mutate', desc: 'new variation, same role' },
  { verb: 'strip', desc: 'reduce to essentials' },
  { verb: 'double', desc: 'increase density' },
  { verb: 'twist', desc: 'make it unexpected' },
  { verb: 'tighten', desc: 'dry, precise, short' },
  { verb: 'open', desc: 'widen, add space' },
  { verb: 'scatter', desc: 'controlled irregularity' },
  { verb: 'build', desc: 'raise ensemble tension' },
  { verb: 'drop', desc: 'maximum impact' },
  { verb: 'blackout', desc: 'strip to almost nothing' },
];

// Fake lanes for the app preview
const previewLanes = [
  {
    label: 'deep kick',
    code: '$: s("bd*4").gain(0.8).lpf(200).room(0.3)',
    cells: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
  },
  {
    label: 'hi-hat shimmer',
    code: '$: s("hh*8").gain(0.3).hpf(4000).room(0.6)',
    cells: [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],
  },
  {
    label: 'sub bass',
    code: '$: note("<c2 eb2 g2>").s("sawtooth").lpf(600).gain(0.7)',
    cells: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
  },
];

function PulseGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1, y: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const rows = 8;
    const cols = 16;
    const patterns = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const h = (r * 17 + c * 31 + 5) % 100;
        return h > 40 ? 1 : h > 20 ? 0.5 : 0;
      })
    );

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 }; };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    const t0 = performance.now();

    const draw = (now: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const elapsed = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      const cellW = w / cols;
      const cellH = h / rows;
      const gap = 3;
      const playhead = (elapsed * 4) % cols;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Lanes fade in one by one
      const laneDelay = 0.4;

      for (let r = 0; r < rows; r++) {
        const laneAge = Math.max(0, elapsed - r * laneDelay);
        if (laneAge <= 0) continue;
        const laneFade = Math.min(1, laneAge / 1.2);

        // Faint lane separator
        const laneY = r * cellH;
        ctx.fillStyle = `rgba(136, 255, 136, ${0.02 * laneFade})`;
        ctx.fillRect(0, laneY + cellH - 1, w, 1);

        for (let c = 0; c < cols; c++) {
          const x = c * cellW + gap;
          const y = laneY + gap;
          const cw = cellW - gap * 2;
          const ch = cellH - gap * 2;
          const cx = x + cw / 2;
          const cy = y + ch / 2;

          const active = patterns[r][c];
          const dist = Math.abs(playhead - c);
          const nearHead = Math.max(0, 1 - dist / 2);
          const breath = Math.sin(elapsed * (1.4 + r * 0.18) + c * 0.5) * 0.5 + 0.5;

          // Mouse proximity
          let mouseGlow = 0;
          if (mx >= 0) {
            const dx = (cx - mx) / cellW;
            const dy = (cy - my) / cellH;
            const mouseDist = Math.sqrt(dx * dx + dy * dy);
            mouseGlow = Math.max(0, 1 - mouseDist / 3.5);
          }

          let alpha: number;
          if (active >= 1) {
            alpha = 0.05 + breath * 0.06 + nearHead * 0.5 + mouseGlow * 0.25;
          } else if (active >= 0.5) {
            alpha = 0.03 + breath * 0.03 + nearHead * 0.25 + mouseGlow * 0.15;
          } else {
            alpha = 0.015 + nearHead * 0.06 + mouseGlow * 0.08;
          }
          alpha *= laneFade;

          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.9, alpha)})`;
          ctx.fillRect(x, y, cw, ch);

          // Green glow on active cells near playhead or mouse
          const glow = nearHead * (active >= 0.5 ? 0.5 : 0.1) + mouseGlow * 0.2;
          if (glow > 0.08 && laneFade > 0.5) {
            ctx.shadowBlur = 15 + glow * 25;
            ctx.shadowColor = `rgba(136, 255, 136, ${Math.min(0.7, glow)})`;
            ctx.fillStyle = `rgba(136, 255, 136, ${Math.min(0.6, glow * 0.7)})`;
            ctx.fillRect(x, y, cw, ch);
            ctx.shadowBlur = 0;
          }
        }
      }

      // Playhead line
      if (elapsed > rows * laneDelay) {
        const px = playhead * cellW + cellW / 2;
        ctx.fillStyle = 'rgba(136, 255, 136, 0.25)';
        ctx.fillRect(px - 1, 0, 2, h);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />;
}

function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started || shown >= text.length) return;
    const t = setTimeout(() => setShown(v => v + 1), 28 + Math.random() * 18);
    return () => clearTimeout(t);
  }, [shown, started, text]);

  return (
    <span>
      {text.slice(0, shown)}
      {shown < text.length && started && (
        <span
          className="ml-0.5 inline-block h-[1em] w-[2px] align-middle"
          style={{ background: '#88ff88', animation: 'blink 0.8s step-end infinite' }}
        />
      )}
    </span>
  );
}

function SectionLabel({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex items-center gap-4 mb-14">
      <span className="text-[10px] w-4 text-center" style={{ color: '#88ff88' }}>{num}</span>
      <div className="h-px w-10" style={{ background: 'rgba(136,255,136,0.4)' }} />
      <span className="text-[10px] uppercase tracking-[0.35em]"
        style={{ color: 'rgba(136,255,136,0.5)' }}>{text}</span>
    </div>
  );
}

function AppPreview() {
  return (
    <div className="border overflow-hidden"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.4)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-[0.15em]"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
        <div className="flex items-center gap-3">
          <span style={{ color: '#88ff88' }}>{'●'}</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>CONDUCTOR</span>
          <span>{'■'} stop</span>
        </div>
        <span>3 voices · 120 bpm · <span style={{ color: '#88ff88' }}>LIVE</span></span>
      </div>

      {/* Lanes */}
      {previewLanes.map((lane, idx) => (
        <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-3 px-3 py-1.5">
            <span className="text-[10px] w-3 text-center shrink-0"
              style={{ color: '#444488' }}>{idx + 1}</span>
            <span className="text-[11px] w-28 truncate shrink-0"
              style={{ color: '#8888cc' }}>{lane.label}</span>
            {/* Mini pulse strip */}
            <div className="flex-1 flex gap-[2px]">
              {lane.cells.map((cell, i) => (
                <div key={i} className="flex-1 h-[14px]" style={{
                  background: cell
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(255,255,255,0.025)',
                }} />
              ))}
            </div>
            <span className="text-[10px] px-2 py-0.5 shrink-0"
              style={{ color: '#6666aa' }}>mute</span>
            <span className="text-[10px] px-2 py-0.5 shrink-0"
              style={{ color: '#6666aa' }}>solo</span>
          </div>
          <div className="px-3 pb-2 pl-9">
            <pre className="text-xs m-0 whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <span className="font-bold" style={{ color: 'rgba(255,255,255,0.65)' }}>$:</span>
              {' '}{lane.code.slice(3)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage({ onEnter }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #0a0a2e 0%, #070720 50%, #040412 100%)',
        color: 'rgba(255,255,255,0.92)',
      }}
    >
      {/* NAV */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <span className="text-xs font-bold tracking-[0.4em]" style={{ color: 'rgba(255,255,255,0.85)' }}>
          CONDUCTOR
        </span>
        <div className="flex items-center gap-5 text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          <a href="#instrument" className="hidden md:block hover:text-white transition-colors">instrument</a>
          <a href="#philosophy" className="hidden md:block hover:text-white transition-colors">philosophy</a>
          <button
            onClick={onEnter}
            className="px-4 py-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
            style={{
              color: '#88ff88',
              border: '1px solid rgba(136,255,136,0.35)',
              background: 'rgba(136,255,136,0.05)',
            }}
          >
            start performing
          </button>
        </div>
      </nav>

      {/* HERO — full viewport, grid behind centered text */}
      <section className="relative flex flex-col items-center justify-center"
        style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <PulseGrid />
          {/* Vignette */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 65% 55% at 50% 48%, rgba(10,10,46,0.25) 0%, rgba(10,10,46,0.88) 100%)',
          }} />
        </div>

        <div className={`relative z-10 text-center max-w-2xl px-6 transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h1 className="text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight font-bold">
            A live instrument for
            <br />
            <span style={{ color: '#88ff88' }}>shaping music in real time</span>
          </h1>

          <p className="mt-5 text-xs md:text-sm leading-relaxed max-w-md mx-auto"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            <TypedText
              text="Conductor is a new kind of musical instrument. Code-powered voices you can shape, layer, and perform live. An ensemble that breathes, resists, and responds to your touch."
              delay={600}
            />
          </p>

          <button
            onClick={onEnter}
            className="mt-8 px-8 py-2.5 text-[11px] uppercase tracking-[0.3em] transition-all hover:-translate-y-1 cursor-pointer"
            style={{
              color: '#88ff88',
              border: '1px solid rgba(136,255,136,0.45)',
              background: 'rgba(136,255,136,0.06)',
              boxShadow: '0 0 30px rgba(136,255,136,0.08)',
            }}
          >
            ENTER THE STAGE
          </button>

          <p className="mt-3 text-[9px] uppercase tracking-[0.3em]"
            style={{ color: 'rgba(255,255,255,0.18)' }}>
            browser-based · no install · play immediately
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-[8px] uppercase tracking-[0.4em]"
            style={{ color: 'rgba(255,255,255,0.15)' }}>scroll</span>
          <div className="w-px h-6" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)' }} />
        </div>
      </section>

      {/* THE INSTRUMENT — app preview */}
      <section id="instrument" className="px-8 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <SectionLabel num="01" text="The instrument" />

          <div className="space-y-6 text-base md:text-lg leading-relaxed mb-12">
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              You start with a genre. Conductor generates an ensemble of voices — bass,
              percussion, melody, texture — each one a lane of live code running in parallel.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>
              Every voice is real <span style={{ color: '#88ff88' }}>Strudel</span> code.
              Read it, edit it, or conduct from a higher level — drag sliders, click
              <em> mutate</em>, click <em>strip</em>, and shape the sound in real time.
            </p>
          </div>

          {/* Static app preview */}
          <AppPreview />

          <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-center"
            style={{ color: 'rgba(255,255,255,0.2)' }}>
            Each voice is a lane of live code
          </p>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section id="philosophy" className="px-8 py-24 md:py-32"
        style={{ background: 'rgba(255,255,255,0.012)' }}>
        <div className="max-w-3xl mx-auto">
          <SectionLabel num="02" text="Philosophy" />

          <blockquote className="text-xl md:text-2xl leading-snug mb-16"
            style={{ color: 'rgba(255,255,255,0.85)' }}>
            "The highest compliment for Conductor should never be that it is smart or
            technically impressive. It should be that someone used it with taste, with
            nerve, with timing, with style."
          </blockquote>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { t: 'code is the truth', b: 'Every voice is real Strudel code. Experts can edit it live. The code is the instrument, not an abstraction hiding behind buttons.' },
              { t: 'friction is a feature', b: 'The system should not obey instantly. Voices have inertia. Some cooperate easily. Others resist. That resistance is where skill develops.' },
              { t: 'performance over production', b: "You don't assemble tracks in a timeline. You perform them. If you want to record a track, you play it live. Every take is unique." },
              { t: 'the screen is a stage', b: 'Everything on screen is visible to the audience. Who has power, who is restrained, what is about to land. The interface is the performance.' },
            ].map(item => (
              <div key={item.t} className="border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: '#88ff88' }}>
                  {item.t}
                </p>
                <p className="text-xs leading-6" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {item.b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VOCABULARY */}
      <section className="px-8 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <SectionLabel num="03" text="The vocabulary" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-px"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            {vocabulary.map((item, i) => (
              <div key={item.verb}
                className="group p-4 transition-colors hover:bg-[rgba(136,255,136,0.03)]"
                style={{
                  background: i % 2 === 0
                    ? 'rgba(255,255,255,0.015)'
                    : 'rgba(136,255,136,0.015)',
                  minHeight: 110,
                }}>
                <p className="text-[8px] uppercase tracking-[0.2em] mb-5 transition-colors group-hover:text-[#88ff88]"
                  style={{ color: 'rgba(255,255,255,0.18)' }}>
                  cue {String(i + 1).padStart(2, '0')}
                </p>
                <p className="text-base mb-1" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {item.verb}
                </p>
                <p className="text-[9px] uppercase tracking-[0.18em]"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-8 py-24 md:py-32">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[9px] uppercase tracking-[0.35em] mb-3"
            style={{ color: 'rgba(136,255,136,0.4)' }}>
            Final cue
          </p>
          <h2 className="text-2xl md:text-3xl leading-tight mb-5"
            style={{ color: 'rgba(255,255,255,0.9)' }}>
            Bring the room to attention.
          </h2>
          <p className="text-xs leading-relaxed mb-8 max-w-sm mx-auto"
            style={{ color: 'rgba(255,255,255,0.35)' }}>
            Pick a voice, start the pattern, and feel the grid answer back.
            Conductor is ready when you are.
          </p>
          <button
            onClick={onEnter}
            className="px-8 py-3 text-[11px] uppercase tracking-[0.3em] transition-all hover:-translate-y-1 cursor-pointer"
            style={{
              color: '#031103',
              background: '#88ff88',
              boxShadow: '0 0 40px rgba(136,255,136,0.2)',
            }}
          >
            ENTER THE STAGE
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex items-center justify-between px-8 py-5 text-[8px] uppercase tracking-[0.2em]"
        style={{ color: 'rgba(255,255,255,0.12)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <span>CONDUCTOR</span>
        <span>a live musical instrument powered by code</span>
      </footer>
    </div>
  );
}
