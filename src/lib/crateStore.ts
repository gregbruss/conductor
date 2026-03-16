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
  // velvet — smoky, late-night, dubbed-out
  'kick-velvet-thump',
  'hats-velvet-dust',
  'snare-velvet-snap',
  'bass-velvet-rolling',
  'pad-velvet-mist',
  'lead-velvet-trace',
  'texture-velvet-air',
  'perc-velvet-knock',
  'fx-velvet-fall',
  // quartz — crystalline, glitchy, industrial cold
  'kick-quartz-click',
  'hats-quartz-shards',
  'snare-quartz-rim',
  'bass-quartz-grid',
  'pad-quartz-glacier',
  'lead-quartz-ping',
  'texture-quartz-static',
  'perc-quartz-tock',
  'fx-quartz-beam',
  // ambient — spacious, slow, suspended
  'kick-ambient-pulse',
  'hats-ambient-air',
  'bass-ambient-drift',
  'pad-ambient-cloud',
  'lead-ambient-glass',
  'texture-ambient-hush',
  'perc-ambient-bloom',
  'fx-ambient-rise',
  // house — warm, bouncy, direct
  'kick-house-foundation',
  'hats-house-chop',
  'snare-house-clack',
  'bass-house-bounce',
  'pad-house-stabs',
  'lead-house-organ',
  'texture-house-tape',
  'perc-house-rattle',
  'fx-house-lift',
  // garage — swung, rubbery, restless
  'kick-garage-skip',
  'hats-garage-swing',
  'snare-garage-snap',
  'bass-garage-rubber',
  'pad-garage-wash',
  'lead-garage-glint',
  'texture-garage-air',
  'perc-garage-click',
  'fx-garage-rise',
  // piano — warm keys, felt hammers, melodic glow
  'kick-piano-step',
  'hats-piano-brush',
  'snare-piano-clap',
  'bass-piano-walk',
  'pad-piano-bloom',
  'lead-piano-figure',
  'texture-piano-room',
  'perc-piano-knock',
  'fx-piano-fall',
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

function mergeMissingStarterVoices(crate: CrateVoice[]): CrateVoice[] {
  const existingIds = new Set(crate.map((voice) => voice.id));
  const missingStarters = getDefaultCrate().filter((voice) => !existingIds.has(voice.id));
  return missingStarters.length > 0 ? [...crate, ...missingStarters] : crate;
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
      ? mergeMissingStarterVoices(parsed.map(normalizeCrateVoice))
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
