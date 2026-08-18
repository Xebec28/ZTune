/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Playlist } from '../types';

export const getPlaylistCover = (playlist?: Playlist | null): string => {
  if (!playlist) {
    return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
  }

  // 1. Explicit user uploaded/custom cover has absolute highest priority if set
  if (playlist.customArtworkUrl && playlist.customArtworkUrl.trim() !== '') {
    return playlist.customArtworkUrl;
  }

  // 2. Cover of the first track/element in the playlist list
  if (playlist.tracks && playlist.tracks.length > 0) {
    const firstTrackWithArtwork = playlist.tracks.find(t => t.artworkUrl && t.artworkUrl.trim() !== '');
    if (firstTrackWithArtwork && firstTrackWithArtwork.artworkUrl) {
      return firstTrackWithArtwork.artworkUrl;
    }
  }

  // 3. Fallback to playlist's assigned artworkUrl or fallback image
  if (playlist.artworkUrl && playlist.artworkUrl.trim() !== '') {
    return playlist.artworkUrl;
  }

  return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
};
