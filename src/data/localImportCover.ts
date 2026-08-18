/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import skullArtworkImage from '../assets/images/ztune_sound_skull_1787052534003.jpg';

export const SOUND_SKULL_THUMBNAIL = skullArtworkImage;
export const LOCAL_IMPORT_THUMBNAIL = skullArtworkImage;
export const DEFAULT_LOCAL_IMPORT_AVATAR = skullArtworkImage;

export const EXCLUSIVE_LOCAL_COVER = {
  id: 'ztune-sound-skull',
  name: 'ZTune Sound Skull',
  description: 'Iconic Sound Skull with Studio DJ Headphones',
  imageUrl: skullArtworkImage,
  accentColor: '#ffffff',
};

// Aliases for compatibility
export function getLocalImportThumbnail(): string {
  return skullArtworkImage;
}

export function getNextAnimeScenery() {
  return EXCLUSIVE_LOCAL_COVER;
}

export function getRandomAnimeScenery() {
  return EXCLUSIVE_LOCAL_COVER;
}

export const DEFAULT_ANIME_SCENERY = EXCLUSIVE_LOCAL_COVER;
export const ANIME_SCENERY_COLLECTION = [EXCLUSIVE_LOCAL_COVER];
