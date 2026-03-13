import { useState } from 'react';
import type { Section } from '../types';

interface Props {
  sections: Section[];
  activeSectionId: string | null;
  arrangementMode: boolean;
  arrangementIndex: number;
  onSave: (name: string) => void;
  onLoad: (section: Section) => void;
  onDelete: (id: string) => void;
  onUpdateBars: (id: string, bars: number) => void;
  onToggleArrangement: () => void;
}

const BAR_OPTIONS = [2, 4, 8, 16, 32];

export default function SectionBar({
  sections, activeSectionId, arrangementMode, arrangementIndex,
  onSave, onLoad, onDelete, onUpdateBars, onToggleArrangement,
}: Props) {
  const [naming, setNaming] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleSave = () => {
    if (naming && nameInput.trim()) {
      onSave(nameInput.trim());
      setNameInput('');
      setNaming(false);
    } else {
      setNaming(true);
    }
  };

  const cycleBars = (id: string, current: number) => {
    const idx = BAR_OPTIONS.indexOf(current);
    const next = BAR_OPTIONS[(idx + 1) % BAR_OPTIONS.length];
    onUpdateBars(id, next);
  };

  return (
    <div className="px-4 py-2 flex items-center gap-3 text-sm"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>

      {/* Save button / inline form */}
      {naming ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex items-center gap-1.5 shrink-0">
          <span className="text-[#6666aa] text-xs">name:</span>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="intro, verse, drop..."
            className="bg-transparent border-none outline-none text-white placeholder-[#4444aa] w-36 text-sm"
            autoFocus
          />
          <button type="submit" className="text-[#88ff88] cursor-pointer hover:text-white transition-colors">save</button>
          <button type="button" onClick={() => setNaming(false)} className="text-[#6666aa] cursor-pointer hover:text-white transition-colors">cancel</button>
        </form>
      ) : (
        <button onClick={handleSave}
          className="cursor-pointer transition-colors shrink-0 hover:text-white"
          style={{ color: '#8888cc' }}>
          {sections.length === 0 ? '[ + save as section ]' : '[ + save ]'}
        </button>
      )}

      {/* Arrangement toggle */}
      {sections.length >= 2 && (
        <button onClick={onToggleArrangement}
          className="cursor-pointer transition-colors shrink-0 hover:text-white"
          style={{ color: arrangementMode ? '#88ff88' : '#8888cc' }}>
          {arrangementMode ? '[ ■ stop ]' : '[ ▶ play all ]'}
        </button>
      )}

      {/* Section blocks */}
      {sections.length > 0 && (
        <>
          <span className="text-[#333366]">|</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {sections.map((sec, i) => {
              const isActive = sec.id === activeSectionId;
              const isArranging = arrangementMode && i === arrangementIndex;
              return (
                <div key={sec.id}
                  className="flex items-center shrink-0 px-2.5 py-1 cursor-pointer transition-all group"
                  style={{
                    background: isArranging
                      ? 'rgba(136,255,136,0.15)'
                      : (isActive ? 'rgba(255,255,255,0.08)' : 'transparent'),
                    borderBottom: isActive ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
                  }}
                  onClick={() => onLoad(sec)}
                  title={`Load "${sec.name}" — ${sec.bars} bars`}
                >
                  <span style={{ color: isActive ? '#ffffff' : '#8888cc' }}>
                    {sec.name}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); cycleBars(sec.id, sec.bars); }}
                    className="text-[11px] ml-1.5 cursor-pointer transition-colors hover:text-white"
                    style={{ color: '#6666aa' }}
                    title="Click to change bar count"
                  >
                    {sec.bars}b
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(sec.id); }}
                    className="text-[10px] ml-1 cursor-pointer transition-colors opacity-0 group-hover:opacity-100 hover:text-[#ff4444]"
                    style={{ color: '#6666aa' }}
                    title="Delete section"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Hint when no sections */}
      {sections.length === 0 && !naming && (
        <span className="text-[#333366] text-xs">
          save your beat as a section to build a full track
        </span>
      )}
    </div>
  );
}
