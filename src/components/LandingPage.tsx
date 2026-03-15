import { useEffect, useRef } from 'react';

interface Props {
  onEnter: () => void | Promise<void>;
}

function PulseGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1, y: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = 7;
    const cols = 18;
    const patterns = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ((row * 17 + col * 13 + 11) % 7 < 3 ? 1 : 0)),
    );

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onLeave = () => {
      mouseRef.current = { x: -1, y: -1 };
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    const startedAt = performance.now();

    const draw = (now: number) => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const elapsed = (now - startedAt) / 1000;
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      const playhead = (elapsed * 4) % cols;

      ctx.clearRect(0, 0, width, height);

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const active = patterns[row][col];
          const x = col * cellWidth + 4;
          const y = row * cellHeight + 4;
          const w = cellWidth - 8;
          const h = cellHeight - 8;
          const cx = x + w / 2;
          const cy = y + h / 2;

          const dx = (cx - mouseRef.current.x) / cellWidth;
          const dy = (cy - mouseRef.current.y) / cellHeight;
          const mouseGlow = mouseRef.current.x < 0 ? 0 : Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 3.2);
          const headGlow = Math.max(0, 1 - Math.abs(playhead - col) / 1.8);
          const alpha = active ? 0.08 + headGlow * 0.22 + mouseGlow * 0.18 : 0.02 + mouseGlow * 0.05;

          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fillRect(x, y, w, h);

          if ((headGlow > 0.3 || mouseGlow > 0.35) && active) {
            ctx.fillStyle = `rgba(136,255,136,${Math.max(headGlow * 0.35, mouseGlow * 0.12)})`;
            ctx.fillRect(x, y, w, h);
          }
        }
      }

      const playheadX = playhead * cellWidth + cellWidth / 2;
      ctx.fillStyle = 'rgba(136,255,136,0.18)';
      ctx.fillRect(playheadX, 0, 2, height);

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

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

export default function LandingPage({ onEnter }: Props) {
  return (
    <div style={{ background: '#0000cc', height: '100dvh', minHeight: '100dvh' }}>
      <section className="px-5 py-5 lg:px-10" style={{ height: '100dvh', minHeight: '100dvh' }}>
        <div className="flex items-center justify-between text-[11px]">
          <div className="font-bold tracking-[0.22em] text-white">CONDUCTOR</div>
          <button
            onClick={onEnter}
            className="px-4 py-2 text-[11px] font-bold tracking-[0.16em] cursor-pointer transition-all"
            style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            start performing
          </button>
        </div>

        <div className="relative mt-6 overflow-hidden px-5 py-12 lg:mt-10 lg:px-12 lg:py-24" style={{ minHeight: '76svh' }}>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(circle at center, rgba(0,0,204,0) 0%, rgba(0,0,204,0.35) 45%, rgba(0,0,204,0.92) 100%)' }}
          />
          <PulseGrid />
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="max-w-2xl text-2xl font-bold leading-tight text-white lg:text-5xl">
              A live instrument for shaping music in real time
            </div>
            <div className="mt-5 max-w-2xl text-sm leading-6 lg:mt-6 lg:text-base lg:leading-7" style={{ color: 'rgba(255,255,255,0.72)' }}>
              Conductor is a new kind of musical instrument. Code-powered voices you can shape, layer,
              and perform live. An ensemble that breathes, resists, and responds to your touch.
            </div>
            <button
              onClick={onEnter}
              className="mt-8 px-6 py-3 text-sm font-bold tracking-[0.18em] cursor-pointer transition-all lg:mt-10"
              style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.16)' }}
            >
              ENTER THE STAGE
            </button>
            <div className="mt-5 text-[11px]" style={{ color: 'rgba(255,255,255,0.44)' }}>
              browser-based · no install · play immediately
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
