import type { CrateVoice } from '../types';

export const DEFAULT_SET_NAMES = ['chrome', 'driftwood', 'nerve', 'velvet', 'quartz', 'ambient', 'house', 'garage', 'piano'] as const;

export function inferSetName(id: string, name: string): string {
  const haystack = `${id} ${name}`.toLowerCase();
  if (haystack.includes('chrome')) return 'chrome';
  if (haystack.includes('driftwood')) return 'driftwood';
  if (haystack.includes('nerve')) return 'nerve';
  if (haystack.includes('velvet')) return 'velvet';
  if (haystack.includes('quartz')) return 'quartz';
  if (haystack.includes('ambient')) return 'ambient';
  if (haystack.includes('house')) return 'house';
  if (haystack.includes('garage')) return 'garage';
  if (haystack.includes('piano')) return 'piano';
  return 'set a';
}

export function normalizeSetName(name: string): string {
  return name.trim().toLowerCase();
}

export function normalizeSetNames(setNames: string[]): string[] {
  const normalized = setNames
    .map(normalizeSetName)
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_SET_NAMES, ...normalized]));
}

export function collectAvailableSetNames(crate: CrateVoice[], setNames: string[]): string[] {
  const found = new Set<string>(setNames.map(normalizeSetName));
  for (const voice of crate) {
    if (voice.setName) {
      found.add(normalizeSetName(voice.setName));
    }
  }
  return Array.from(found);
}

export function isStarterSet(name: string): boolean {
  return (DEFAULT_SET_NAMES as readonly string[]).includes(normalizeSetName(name));
}
