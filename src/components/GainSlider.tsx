import { useRef, useCallback } from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function GainSlider({ value, onChange, disabled }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    // Map 0-1 slider to 0-1.5 gain range
    onChange(+(pct * 1.5).toFixed(2));
  }, [onChange]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    dragging.current = true;
    update(e.clientX);

    const onMove = (ev: MouseEvent) => {
      if (dragging.current) update(ev.clientX);
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [disabled, update]);

  // Map gain (0-1.5) back to 0-1 for display
  const pct = Math.min(1, value / 1.5);

  return (
    <div
      ref={trackRef}
      className="relative w-20 h-4 cursor-pointer shrink-0"
      onMouseDown={onMouseDown}
      style={{ opacity: disabled ? 0.3 : 1 }}
    >
      {/* Track */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2"
        style={{ height: '2px', background: 'rgba(255,255,255,0.15)' }} />

      {/* Filled portion */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2"
        style={{ height: '2px', width: `${pct * 100}%`, background: 'rgba(255,255,255,0.4)' }} />

      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        style={{
          left: `${pct * 100}%`,
          width: '6px',
          height: '10px',
          background: '#ffffff',
        }}
      />
    </div>
  );
}
