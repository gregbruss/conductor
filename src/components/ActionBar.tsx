import { useState } from 'react';

interface Props {
  onShapeAction: (prompt: string) => void;
  onAddLayer: (prompt: string) => void;
  onSaveAndMoveOn: () => void;
  isGenerating: boolean;
  segmentCount: number;
}

const SHAPE_ACTIONS = [
  { label: 'harder', prompt: 'Make it harder and more aggressive. More drive, more punch.' },
  { label: 'softer', prompt: 'Make it softer and gentler. Less intensity, more delicate.' },
  { label: 'darker', prompt: 'Make it darker and moodier. Lower frequencies, more ominous.' },
  { label: 'weirder', prompt: 'Make it weirder and more experimental. Unexpected rhythms, glitchy textures.' },
  { label: 'spacier', prompt: 'More spacious. Add reverb, delay, more space between elements.' },
  { label: 'busier', prompt: 'Make it busier. More rhythmic subdivisions, more movement.' },
  { label: 'simpler', prompt: 'Simplify it. Strip back to essentials. Less is more.' },
];

const LAYER_TYPES = [
  { label: 'kick', prompt: 'Add a kick drum layer' },
  { label: 'bass', prompt: 'Add a bassline layer using a synth waveform' },
  { label: 'melody', prompt: 'Add a melody layer' },
  { label: 'pad', prompt: 'Add a pad/chord layer using a synth waveform' },
  { label: 'arp', prompt: 'Add an arpeggio layer' },
  { label: 'perc', prompt: 'Add a percussion layer (shakers, claps, rim shots)' },
  { label: 'fx', prompt: 'Add a texture/atmosphere layer (noise, sweeps)' },
];

export default function ActionBar({ onShapeAction, onAddLayer, onSaveAndMoveOn, isGenerating, segmentCount }: Props) {
  const [showLayerPicker, setShowLayerPicker] = useState(false);

  return (
    <div style={{ opacity: isGenerating ? 0.4 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}>
      {/* Add layer + Shape buttons */}
      <div className="flex flex-wrap gap-1.5 mb-3 mt-3">
        {showLayerPicker ? (
          <>
            {LAYER_TYPES.map(t => (
              <button key={t.label}
                onClick={() => { onAddLayer(`${t.prompt}. Keep ALL existing layers exactly as they are. Add ONE new $: line.`); setShowLayerPicker(false); }}
                className="px-2.5 py-1 text-[11px] cursor-pointer transition-all hover:text-white hover:bg-[rgba(136,255,136,0.08)]"
                style={{ color: '#88ff88', border: '1px solid rgba(136,255,136,0.2)' }}>
                + {t.label}
              </button>
            ))}
            <button onClick={() => setShowLayerPicker(false)}
              className="px-2.5 py-1 text-[11px] cursor-pointer text-[#6666aa] hover:text-white transition-colors">
              cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setShowLayerPicker(true)}
              className="px-2.5 py-1 text-[11px] cursor-pointer transition-all hover:text-white hover:bg-[rgba(136,255,136,0.08)]"
              style={{ color: '#88ff88', border: '1px solid rgba(136,255,136,0.2)' }}>
              + add layer
            </button>
            {SHAPE_ACTIONS.map(a => (
              <button key={a.label}
                onClick={() => onShapeAction(a.prompt)}
                className="px-2.5 py-1 text-[11px] cursor-pointer transition-all hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
                style={{ color: '#aaaaff', border: '1px solid rgba(255,255,255,0.1)' }}>
                {a.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Save & move on */}
      <div className="flex justify-center mt-4 mb-2">
        <button
          onClick={onSaveAndMoveOn}
          className="px-5 py-2 text-sm cursor-pointer transition-all hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
          style={{ color: '#88ff88', border: '1px solid rgba(136,255,136,0.25)' }}
        >
          {segmentCount <= 1
            ? '\u2713 save & move on \u2192'
            : '\u2713 happy with this \u2014 what\'s next? \u2192'}
        </button>
      </div>
    </div>
  );
}
