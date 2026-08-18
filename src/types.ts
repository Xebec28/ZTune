/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  artworkUrl: string;
  audioUrl: string;
  youtubeId?: string;
  candidateIds?: string[];
  previewUrl?: string;
  genre: string;
  rating: number; // 1 to 5 stars
  isFavorite?: boolean;
  source?: 'Local' | 'iTunes' | 'Catalog' | 'YouTube';
  isLocal?: boolean;
  bpm?: string;
  key?: string;
  file?: File;
  playedAt?: number;
  playCount?: number;
}

export interface Playlist {
  id: string;
  title: string;
  subtitle?: string;
  trackCount: number;
  rating: number;
  coverStyle?: 'purple-neon' | 'yellow-guitar' | 'white-headphones' | 'cyan-synth' | 'pro-gradient' | string;
  artworkUrl?: string;
  customArtworkUrl?: string;
  tracks: Track[];
  isCustom?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  songCount: number;
  isFavorite: boolean;
  genre?: string;
  bio?: string;
  bannerUrl?: string;
  isCustom?: boolean;
}

export interface EQBand {
  frequency: number;
  label: string;
  gain: number; // -12 to +12 dB
}

export interface EQSettings {
  enabled: boolean;
  preset: string;
  preamp: number;
  bassBoost: number; // 0 to 100
  bands: EQBand[];
}

export interface DynamicThemeColors {
  primary: string; // e.g. 'rgb(147, 51, 234)'
  primaryHex: string; // e.g. '#9333ea'
  primaryRgb: string; // e.g. '147, 51, 234'
  secondary: string;
  secondaryRgb: string;
  glow: string; // e.g. 'rgba(147, 51, 234, 0.4)'
  subtle: string; // e.g. 'rgba(147, 51, 234, 0.12)'
  border: string; // e.g. 'rgba(147, 51, 234, 0.3)'
  darkBg: string; // e.g. 'linear-gradient(135deg, rgba(30, 10, 45, 0.95), #050505)'
  lightAccent: string;
}

export type NavigationTab = 'home' | 'recents' | 'artists' | 'playlists' | 'equalizer' | 'songs';

