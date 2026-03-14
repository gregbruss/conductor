import { useMemo, useState } from 'react';
import type { CrateVoice, VoiceRole } from '../types';
import { VOICE_LIBRARY, VOICE_ROLES } from '../lib/voiceLibrary';
import { generateRowGrid } from './Punchcard';

type WorkshopRole = VoiceRole | 'all';

interface WorkshopVoice {
  id: string;
  name: string;
  description: string;
  role: VoiceRole;
  code: string;
  tags: string[];
}

interface Props {
  open: boolean;
  role: WorkshopRole;
  generatedVoices: WorkshopVoice[];
  crate: CrateVoice[];
  previewingId: string | null;
  isGenerating: boolean;
  onClose: () => void;
  onChangeRole: (role: WorkshopRole) => void;
  onGenerate: (role: VoiceRole, prompt: string) => void;
  onPreview: (voice: WorkshopVoice) => void;
  onStopPreview: () => void;
  onSaveToCrate: (voice: WorkshopVoice) => void;
  onAddToStage: (voice: WorkshopVoice) => void;
}

function PulsePreview({ code }: { code: string }) {
  const grid = generateRowGrid(code);
  return (
    <div className="flex gap-[2px]">
      {grid.map((active, index) => (
        <div
          key={index}
          className="h-3 flex-1"
          style={{ background: active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.05)' }}
        />
      ))}
    </div>
  );
}

function VoiceCard({
  voice,
  previewing,
  onPreview,
  onSaveToCrate,
  onAddToStage,
}: {
  voice: WorkshopVoice;
  previewing: boolean;
  onPreview: () => void;
  onSaveToCrate: () => void;
  onAddToStage: () => void;
}) {
  return (
    <div
      className="p-3"
      style={{
        border: previewing ? '1px solid rgba(136,255,136,0.22)' : '1px solid rgba(255,255,255,0.06)',
        background: previewing ? 'rgba(136,255,136,0.04)' : 'rgba(0,0,0,0.18)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white">{voice.name}</div>
          <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {voice.role}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {voice.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5"
              style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {voice.description}
      </div>

      <div className="mt-3">
        <PulsePreview code={voice.code} />
      </div>

      <pre
        className="mt-3 text-[11px] leading-relaxed whitespace-pre-wrap"
        style={{ color: 'rgba(255,255,255,0.7)' }}
      >
        {voice.code}
      </pre>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onPreview}
          className="px-2.5 py-1 text-[10px] cursor-pointer transition-all"
          style={{
            color: previewing ? '#88ff88' : 'rgba(255,255,255,0.55)',
            border: `1px solid ${previewing ? 'rgba(136,255,136,0.22)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {previewing ? 'stop preview' : 'preview'}
        </button>
        <button
          onClick={onSaveToCrate}
          className="px-2.5 py-1 text-[10px] cursor-pointer transition-all"
          style={{ color: '#88ff88', border: '1px solid rgba(136,255,136,0.15)' }}
        >
          save to crate
        </button>
        <button
          onClick={onAddToStage}
          className="px-2.5 py-1 text-[10px] cursor-pointer transition-all"
          style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          add to stage
        </button>
      </div>
    </div>
  );
}

export default function WorkshopOverlay({
  open,
  role,
  generatedVoices,
  crate,
  previewingId,
  isGenerating,
  onClose,
  onChangeRole,
  onGenerate,
  onPreview,
  onStopPreview,
  onSaveToCrate,
  onAddToStage,
}: Props) {
  const [prompt, setPrompt] = useState('');

  const libraryVoices = useMemo(() => {
    if (role === 'all') return VOICE_LIBRARY;
    return VOICE_LIBRARY.filter((voice) => voice.role === role);
  }, [role]);

  const crateVoices = useMemo(() => {
    if (role === 'all') return crate;
    return crate.filter((voice) => voice.role === role);
  }, [crate, role]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0, 0, 140, 0.96)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="px-5 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <div className="text-xs tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            WORKSHOP
          </div>
          <div className="text-sm text-white">Stock the crate, then go back to the stage.</div>
        </div>
        <button
          onClick={() => { onStopPreview(); onClose(); }}
          className="px-3 py-1.5 text-[11px] cursor-pointer transition-all"
          style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          back to stage
        </button>
      </div>

      <div className="px-5 py-3 shrink-0 flex items-center gap-2 overflow-x-auto"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => onChangeRole('all')}
          className="px-2.5 py-1 text-[10px] cursor-pointer transition-all"
          style={{
            color: role === 'all' ? '#88ff88' : 'rgba(255,255,255,0.35)',
            border: `1px solid ${role === 'all' ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          all
        </button>
        {VOICE_ROLES.map(({ role: voiceRole, label }) => (
          <button
            key={voiceRole}
            onClick={() => onChangeRole(voiceRole)}
            className="px-2.5 py-1 text-[10px] cursor-pointer transition-all"
            style={{
              color: role === voiceRole ? '#88ff88' : 'rgba(255,255,255,0.35)',
              border: `1px solid ${role === voiceRole ? 'rgba(136,255,136,0.18)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            {label.toLowerCase()}
          </button>
        ))}
      </div>

      <div
        className="px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (role === 'all' || !prompt.trim() || isGenerating) return;
            onGenerate(role, prompt.trim());
            setPrompt('');
          }}
          className="flex items-center gap-3"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            forge
          </span>
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={role === 'all'
              ? 'pick a role to generate a voice'
              : `generate a ${role} for the crate...`}
            disabled={isGenerating || role === 'all'}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[#7a7ab8]"
          />
          <button
            type="submit"
            disabled={isGenerating || role === 'all' || !prompt.trim()}
            className="px-3 py-1.5 text-[11px] cursor-pointer transition-all disabled:opacity-30"
            style={{ color: '#88ff88', border: '1px solid rgba(136,255,136,0.18)' }}
          >
            {isGenerating ? 'generating...' : 'generate'}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-auto px-5 py-5 space-y-8">
        {generatedVoices.length > 0 && (
          <section>
            <div className="mb-3 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
              generated
            </div>
            <div className="grid grid-cols-2 gap-4">
              {generatedVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  previewing={previewingId === voice.id}
                  onPreview={() => onPreview(voice)}
                  onSaveToCrate={() => onSaveToCrate(voice)}
                  onAddToStage={() => onAddToStage(voice)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
            crate
          </div>
          {crateVoices.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {crateVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  previewing={previewingId === voice.id}
                  onPreview={() => onPreview(voice)}
                  onSaveToCrate={() => onSaveToCrate(voice)}
                  onAddToStage={() => onAddToStage(voice)}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              No saved crate voices for this role yet.
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
            library
          </div>
          <div className="grid grid-cols-2 gap-4">
            {libraryVoices.map((voice) => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                previewing={previewingId === voice.id}
                onPreview={() => onPreview(voice)}
                onSaveToCrate={() => onSaveToCrate(voice)}
                onAddToStage={() => onAddToStage(voice)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
