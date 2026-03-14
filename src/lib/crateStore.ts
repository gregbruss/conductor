import type { CrateVoice } from '../types';
import { VOICE_LIBRARY } from './voiceLibrary';

const CRATE_KEY = 'conductor_crate_v5';

const DEFAULT_CRATE_PRESET_IDS = [
  'kick-pressure-floor',
  'kick-skip-pulse',
  'hats-clock-drift',
  'hats-sixteen-rain',
  'snare-back-alley',
  'snare-shadow-step',
  'bass-deep-current',
  'bass-saw-climb',
  'bass-corner-pressure',
  'pad-slow-glass',
  'pad-breath-cycle',
  'pad-afterimage',
  'lead-mirror-line',
  'lead-stab-question',
  'lead-late-signal',
  'texture-vinyl-crackle',
  'texture-vent-hiss',
  'perc-rim-clock',
  'perc-trip-wire',
  'fx-swell-lift',
  'fx-freeze-flash',
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
