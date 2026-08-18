/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track } from '../types';
import { DEFAULT_TRACKS } from '../data/defaultCatalog';

export interface SimilarTracksResult {
  tracks: Track[];
  source: 'ai_curated' | 'fallback' | 'catalog';
  currentSeed: string;
}

export async function fetchSimilarTracks(
  currentTrack: Track,
  existingQueue: Track[] = [],
  count: number = 5
): Promise<SimilarTracksResult> {
  const existingIds = [currentTrack.id, ...existingQueue.map((t) => t.id)];

  try {
    const res = await fetch('/api/ai/similar-tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentTrack: {
          id: currentTrack.id,
          title: currentTrack.title,
          artist: currentTrack.artist,
          genre: currentTrack.genre,
          bpm: currentTrack.bpm,
          key: currentTrack.key,
        },
        count,
        existingIds,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        return {
          tracks: data.tracks,
          source: data.source || 'ai_curated',
          currentSeed: data.currentSeed || `${currentTrack.title} - ${currentTrack.artist}`,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch similar tracks from AI endpoint, utilizing catalog matching:', err);
  }

  // Fallback: match by genre, artist, or style from catalog & library
  const matchedFromCatalog = DEFAULT_TRACKS.filter(
    (t) =>
      t.id !== currentTrack.id &&
      !existingIds.includes(t.id) &&
      (t.genre?.toLowerCase() === currentTrack.genre?.toLowerCase() ||
        t.artist?.toLowerCase() === currentTrack.artist?.toLowerCase() ||
        (t.bpm && currentTrack.bpm && Math.abs(parseInt(t.bpm) - parseInt(currentTrack.bpm)) < 15))
  );

  const fallbackPool = matchedFromCatalog.length >= count ? matchedFromCatalog : DEFAULT_TRACKS.filter((t) => t.id !== currentTrack.id && !existingIds.includes(t.id));

  // Shuffle slightly
  const shuffled = [...fallbackPool].sort(() => 0.5 - Math.random()).slice(0, count);

  return {
    tracks: shuffled,
    source: 'catalog',
    currentSeed: `${currentTrack.title} - ${currentTrack.artist}`,
  };
}
