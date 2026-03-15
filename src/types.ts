export interface Layer {
  id: string;
  label: string;
  code: string;
  muted: boolean;
}

export type VoiceRole = 'kick' | 'hats' | 'snare' | 'bass' | 'pad' | 'lead' | 'texture' | 'perc' | 'fx';

export interface CrateVoice {
  id: string;
  name: string;
  description: string;
  setName: string;
  role: VoiceRole;
  code: string;
  tags: string[];
  savedAt: number;
  isFavorite: boolean;
}

export interface Moment {
  id: string;
  name: string;
  code: string;
  mutedIds: string[];
  soloId: string | null;
  timestamp: number;
  voiceCount: number;
  voiceLabels: string[];
}

// Legacy types kept for compatibility
export interface Segment {
  id: string;
  name: string;
  code: string;
  bars: number;
}

export interface Song {
  id: string;
  genre: string;
  segments: Segment[];
  createdAt: number;
}

export interface SongContext {
  genre: string;
  segments: { name: string; code: string; bars: number; bpm: number; position: number }[];
  currentSegmentIndex: number;
  totalSegments: number;
}

export interface PreGenResult {
  transitionType: string;
  code: string;
  status: 'pending' | 'ready' | 'failed';
  fromSegmentId: string;
}
