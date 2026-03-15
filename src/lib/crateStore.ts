import type { CrateVoice } from '../types';
import { VOICE_LIBRARY } from './voiceLibrary';
import { DEFAULT_SET_NAMES, inferSetName, normalizeSetNames } from './setNames';

const CRATE_KEY = 'conductor_crate_v14';
const CRATE_SET_KEY = 'conductor_crate_sets_v1';

const DEFAULT_CRATE_PRESET_IDS = [
  // nerve — dark, kinetic
  'kick-nerve-pressure',
  'hats-nerve-scatter',
  'snare-nerve-crack',
  'bass-nerve-undertow',
  'pad-nerve-haze',
  'lead-nerve-wire',
  'texture-nerve-static',
  // driftwood — warm, organic
  'kick-drift-heartbeat',
  'bass-drift-tide',
  'pad-drift-amber',
  'lead-drift-feather',
  'texture-drift-shore',
  'perc-drift-bell',
  'fx-drift-fog',
  // chrome — clean, precise
  'kick-chrome-drive',
  'hats-chrome-grid',
  'snare-chrome-clap',
  'bass-chrome-acid',
  'pad-chrome-field',
  'lead-chrome-sequence',
  'fx-chrome-sweep',
];

function presetToCrateVoice(presetId: string, index: number): CrateVoice | null {
  const preset = VOICE_LIBRARY.find((item) => item.id === presetId);
  if (!preset) return null;
  return {
    id: `preset-${preset.id}`,
    name: preset.name,
    description: preset.description,
    setName: inferSetName(preset.id, preset.name),
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

function normalizeCrateVoice(voice: any): CrateVoice {
  return {
    ...voice,
    setName: typeof voice.setName === 'string' && voice.setName.trim()
      ? voice.setName
      : inferSetName(String(voice.id ?? ''), String(voice.name ?? '')),
  };
}

export function loadCrate(): CrateVoice[] {
  try {
    const raw = localStorage.getItem(CRATE_KEY);
    if (!raw) return getDefaultCrate();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map(normalizeCrateVoice)
      : getDefaultCrate();
  } catch {
    return getDefaultCrate();
  }
}

export function saveCrate(crate: CrateVoice[]): void {
  localStorage.setItem(CRATE_KEY, JSON.stringify(crate));
}

export function loadSetNames(): string[] {
  try {
    const raw = localStorage.getItem(CRATE_SET_KEY);
    if (!raw) return [...DEFAULT_SET_NAMES];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeSetNames(parsed) : [...DEFAULT_SET_NAMES];
  } catch {
    return [...DEFAULT_SET_NAMES];
  }
}

export function saveSetNames(setNames: string[]): void {
  localStorage.setItem(CRATE_SET_KEY, JSON.stringify(normalizeSetNames(setNames)));
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
