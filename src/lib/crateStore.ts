import type { CrateVoice } from '../types';
import { VOICE_LIBRARY } from './voiceLibrary';

const CRATE_KEY = 'conductor_crate_v13';

const DEFAULT_CRATE_PRESET_IDS = [
  // kick — steady, broken, acoustic
  'kick-pressure-floor',
  'kick-skip-pulse',
  'kick-jazz-room',
  // hats — straight, euclidean, brushes
  'hats-sixteen-rain',
  'hats-clock-drift',
  'hats-brush-sweep',
  // snare — classic, dry, swing
  'snare-back-alley',
  'snare-shadow-step',
  // bass — sub, saw, plucked
  'bass-deep-current',
  'bass-acid-root',
  'bass-pluck-step',
  // pad — chords, choir, piano
  'pad-slow-glass',
  'pad-choir-vowel',
  'pad-piano-chords',
  // lead — melodic, sax, arpeggio
  'lead-mirror-line',
  'lead-sax-phrase',
  'lead-piano-arp',
  // texture — crackle, air, digital
  'texture-vinyl-crackle',
  'texture-vent-hiss',
  'texture-coarse-rain',
  // perc — tabla, rim, sitar
  'perc-tabla-pulse',
  'perc-rim-clock',
  'perc-sitar-ghost',
  // fx — swell, reverse
  'fx-swell-lift',
  'fx-reverse-swell',
];

function presetToCrateVoice(presetId: string, index: number): CrateVoice | null {
  const preset = VOICE_LIBRARY.find((item) => item.id === presetId);
  if (!preset) return null;
  return {
    id: `preset-${preset.id}`,
    name: preset.name,
    description: preset.description,
    role: preset.role,
    code: preset.code,
    tags: preset.tags,
    savedAt: Date.now() - index,
    isFavorite: index < 3,
  };
}

export function getDefaultCrate(): CrateVoice[] {
  return DEFAULT_CRATE_PRESET_IDS
    .map((presetId, index) => presetToCrateVoice(presetId, index))
    .filter((voice): voice is CrateVoice => voice !== null);
}

export function loadCrate(): CrateVoice[] {
  try {
    const raw = localStorage.getItem(CRATE_KEY);
    if (!raw) return getDefaultCrate();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultCrate();
  } catch {
    return getDefaultCrate();
  }
}

export function saveCrate(crate: CrateVoice[]): void {
  localStorage.setItem(CRATE_KEY, JSON.stringify(crate));
}

export function createCrateVoice(
  voice: Omit<CrateVoice, 'id' | 'savedAt' | 'isFavorite'>,
): CrateVoice {
  return {
    ...voice,
    id: `crate-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    savedAt: Date.now(),
    isFavorite: false,
  };
}

export function addToCrate(voice: Omit<CrateVoice, 'id' | 'savedAt' | 'isFavorite'>): CrateVoice {
  const crate = loadCrate();
  const newVoice = createCrateVoice(voice);
  saveCrate([...crate, newVoice]);
  return newVoice;
}

export function removeFromCrate(id: string): void {
  const crate = loadCrate().filter((voice) => voice.id !== id);
  saveCrate(crate);
}

export function toggleFavorite(id: string): void {
  const crate = loadCrate().map((voice) => (
    voice.id === id
      ? { ...voice, isFavorite: !voice.isFavorite }
      : voice
  ));
  saveCrate(crate);
}
