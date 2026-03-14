import { useState, useMemo } from 'react';
import type { Layer, CrateVoice, VoiceRole, Moment } from '../types';
import VoiceBrowser from './VoiceBrowser';
import { VOICE_ROLES } from '../lib/voiceLibrary';

interface Props {
  layers: Layer[];
  focusedLayer: Layer | null;
  crate: CrateVoice[];
  moments: Moment[];
  isGenerating: boolean;
  onAddVoice: (code: string, label: string) => void;
  onLaneAction: (action: string) => void;
  onEnsembleAction: (action: string) => void;
  onSaveToCrate: () => void;
  onCaptureMoment: () => void;
  onRecallMoment: (moment: Moment) => void;
  onRemoveLayer: () => void;
}

const LANE_ACTIONS = [
  { id: 'mutate', label: 'mutate', desc: 'new variation, same role' },
  { id: 'strip', label: 'strip', desc: 'simplify to essentials' },
  { id: 'double', label: 'double', desc: 'increase density' },
  { id: 'halve', label: 'halve', desc: 'reduce density' },
  { id: 'twist', label: 'twist', desc: 'make it unexpected' },
  { id: 'tighten', label: 'tighten', desc: 'shorten, cut, dry' },
  { id: 'open', label: 'open', desc: 'widen, add space' },
  { id: 'scatter', label: 'scatter', desc: 'add irregularity' },
];

const ENSEMBLE_ACTIONS = [
  { id: 'build', label: 'build', desc: 'raise tension across all' },
  { id: 'drop', label: 'drop', desc: 'reassert core force' },
  { id: 'freeze', label: 'freeze', desc: 'lock groove, evolve timbre' },
  { id: 'release', label: 'release', desc: 'reduce pressure' },
  { id: 'blackout', label: 'blackout', desc: 'strip to almost nothing' },
];

function guessRole(label: string): VoiceRole | null {
  const l = label.toLowerCase();
  for (const { role } of VOICE_ROLES) {
    if (l.includes(role)) return role;
  }
  if (l.includes('kick') || l.includes('bd') || l.includes('four')) return 'kick';
  if (l.includes('hat') || l.includes('hh') || l.includes('hihat')) return 'hats';
  if (l.includes('snare') || l.includes('sd') || l.includes('clap') || l.includes('cp')) return 'snare';
  if (l.includes('bass') || l.includes('sub')) return 'bass';
  if (l.includes('pad') || l.includes('chord')) return 'pad';
  if (l.includes('lead') || l.includes('melody') || l.includes('synth')) return 'lead';
  if (l.includes('texture') || l.includes('ambient') || l.includes('noise') || l.includes('dust') || l.includes('atmosphere')) return 'texture';
  if (l.includes('perc') || l.includes('rim') || l.includes('tom')) return 'perc';
  if (l.includes('fx') || l.includes('crash') || l.includes('impact')) return 'fx';
  return null;
}

export default function ControlPanel({
  focusedLayer,
  crate,
  moments,
  isGenerating,
  onAddVoice,
  onLaneAction,
  onEnsembleAction,
  onSaveToCrate,
  onCaptureMoment,
  onRecallMoment,
  onRemoveLayer,
}: Props) {
  const [showBrowser, setShowBrowser] = useState(true);

  const detectedRole = useMemo(() => {
    if (!focusedLayer) return null;
    return guessRole(focusedLayer.label);
  }, [focusedLayer]);

  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.15)',
      }}>

      {/* VOICE BROWSER */}
      <div className="shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setShowBrowser(!showBrowser)}
          className="w-full px-3 py-1.5 text-[10px] text-left cursor-pointer
            hover:bg-[rgba(255,255,255,0.04)] transition-all"
          style={{ color: '#8888cc' }}
        >
          {showBrowser ? '\u25BE' : '\u25B8'} VOICES
        </button>
        {showBrowser && (
          <VoiceBrowser
            crate={crate}
            onAddVoice={onAddVoice}
            disabled={isGenerating}
          />
        )}
      </div>

      {/* LANE CONTROLS — context-sensitive */}
      <div className="flex-1 overflow-auto min-h-0">
        {focusedLayer ? (
          <div>
            {/* Lane header */}
            <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] tracking-wider" style={{ color: '#88ff88' }}>
                    {detectedRole ? detectedRole.toUpperCase() : 'VOICE'}
                  </span>
                  <span className="text-[10px] mx-1.5" style={{ color: '#333388' }}>{'\u2014'}</span>
                  <span className="text-xs text-white">{focusedLayer.label}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[9px] tracking-wider mb-1.5" style={{ color: '#6666aa' }}>
                ACTIONS
              </div>
              <div className="grid grid-cols-2 gap-1">
                {LANE_ACTIONS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => onLaneAction(a.id)}
                    disabled={isGenerating}
                    className="px-2 py-1.5 text-[11px] text-left cursor-pointer transition-all
                      hover:bg-[rgba(255,255,255,0.08)] hover:text-white disabled:opacity-30 group"
                    style={{
                      color: '#aaaaff',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div>{a.label}</div>
                    <div className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#6666aa' }}>
                      {a.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save & Remove */}
            <div className="px-3 py-2 flex gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={onSaveToCrate}
                disabled={isGenerating}
                className="flex-1 px-2 py-1.5 text-[10px] cursor-pointer transition-all
                  hover:bg-[rgba(136,255,136,0.1)] disabled:opacity-30"
                style={{ color: '#88ff88', border: '1px solid rgba(136,255,136,0.15)' }}
              >
                + save to crate
              </button>
              <button
                onClick={onRemoveLayer}
                disabled={isGenerating}
                className="px-2 py-1.5 text-[10px] cursor-pointer transition-all
                  hover:bg-[rgba(255,136,136,0.1)] disabled:opacity-30"
                style={{ color: '#ff8888', border: '1px solid rgba(255,136,136,0.1)' }}
              >
                remove
              </button>
            </div>
          </div>
        ) : (
          <div className="px-3 py-4 text-[10px] text-center" style={{ color: '#444488' }}>
            click a lane to see controls
          </div>
        )}

        {/* ENSEMBLE */}
        <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[9px] tracking-wider mb-1.5" style={{ color: '#6666aa' }}>
            ENSEMBLE
          </div>
          <div className="grid grid-cols-2 gap-1">
            {ENSEMBLE_ACTIONS.map(a => (
              <button
                key={a.id}
                onClick={() => onEnsembleAction(a.id)}
                disabled={isGenerating}
                className="px-2 py-1.5 text-[11px] text-left cursor-pointer transition-all
                  hover:bg-[rgba(255,255,255,0.08)] hover:text-white disabled:opacity-30 group"
                style={{
                  color: '#aaaaff',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div>{a.label}</div>
                <div className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#6666aa' }}>
                  {a.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MOMENTS */}
      <div className="shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-3 py-1.5 flex items-center justify-between">
          <span className="text-[9px] tracking-wider" style={{ color: '#6666aa' }}>MOMENTS</span>
          <button
            onClick={onCaptureMoment}
            disabled={isGenerating}
            className="text-[10px] px-2 py-0.5 cursor-pointer transition-all
              hover:bg-[rgba(136,255,136,0.1)] disabled:opacity-30"
            style={{ color: '#88ff88', border: '1px solid rgba(136,255,136,0.15)' }}
          >
            + capture
          </button>
        </div>
        {moments.length > 0 && (
          <div className="px-2 pb-2 flex gap-1 overflow-x-auto">
            {moments.map(m => (
              <button
                key={m.id}
                onClick={() => onRecallMoment(m)}
                className="shrink-0 px-2 py-1 text-[9px] cursor-pointer transition-all
                  hover:bg-[rgba(255,255,255,0.06)]"
                style={{ color: '#aaaaff', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="text-white">{'\u25CF'} {m.name}</div>
                <div style={{ color: '#444488' }}>{m.voiceCount} voices</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
