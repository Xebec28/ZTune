/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, MoreHorizontal, Plus, Download, Radio, Music, Volume2, Disc, ListPlus, ListOrdered, Sparkles } from 'lucide-react';
import { Track, Playlist, Artist, NavigationTab } from '../types';
import { ArtistHeroCarousel } from './ArtistHeroCarousel';
import { getPlaylistCover } from '../utils/playlistUtils';

interface HomeDashboardProps {
  tracks: Track[];
  recentTracks?: Track[];
  playlists: Playlist[];
  artists: Artist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectArtist: (artist: Artist) => void;
  onRateTrack?: (trackId: string, rating: number) => void;
  onAddToPlaylist: (track: Track) => void;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenNewPlaylistModal: () => void;
  onPlayNext?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onAddSimilarToQueue?: (track: Track) => void;
  themeMode?: 'normal' | 'dynamic';
  themeColors?: {
    primary?: string;
    accent?: string;
    glow?: string;
    bgDark?: string;
  };
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  tracks,
  recentTracks = [],
  playlists,
  artists,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onSelectPlaylist,
  onSelectArtist,
  onRateTrack,
  onAddToPlaylist,
  setActiveTab,
  onOpenNewPlaylistModal,
  onPlayNext,
  onAddToQueue,
  onAddSimilarToQueue,
  themeMode,
  themeColors,
}) => {
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

  // Helper to format duration in seconds -> m:ss
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Helper to format relative time ago for real recents
  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return null;
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Real recent tracks to display, fallback to catalog if empty
  const displayRecents = recentTracks.length > 0 ? recentTracks : tracks;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 custom-scrollbar">
      {/* ARTIST HITS DYNAMIC IMAGE CAROUSEL (Arijit Singh, K.K., Atif Aslam, Shreya Ghoshal, Synthwave) */}
      <section>
        <ArtistHeroCarousel
          onSelectTrack={onSelectTrack}
          setActiveTab={setActiveTab}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          themeMode={themeMode}
          themeColors={themeColors}
        />
      </section>

      {/* SECTION 1: Playlists Grid */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold tracking-tight text-white">Playlists</h2>
          <button
            onClick={() => setActiveTab('playlists')}
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            See All &gt;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {playlists.slice(0, 3).map((pl) => {
            const coverImage = getPlaylistCover(pl);
            return (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl)}
                className="group relative cursor-pointer flex flex-col glass-panel rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center">
                  <img
                    src={coverImage}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                </div>
                <div className="mt-3.5 px-1">
                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">
                    {pl.subtitle || `${(pl.tracks || []).length} songs`}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Playlist Card 4: Create Custom Playlist / Discover Mix */}
          <div
            onClick={() => onOpenNewPlaylistModal()}
            className="group relative cursor-pointer flex flex-col rounded-3xl p-5 bg-gradient-to-tr from-indigo-800 via-purple-700 to-indigo-900 shadow-xl overflow-hidden justify-between transition-all duration-300 hover:-translate-y-1 min-h-[220px]"
          >
            <div className="relative z-10">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                My Collection
              </span>
              <h3 className="text-lg font-extrabold text-white leading-snug mt-2">
                Create Custom<br />Playlist
              </h3>
            </div>

            <div className="flex items-center justify-between mt-4 relative z-10">
              <div className="text-4xl">🎵</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNewPlaylistModal();
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md shadow-lg transform group-hover:scale-110 transition-transform"
                title="Create New Playlist"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Ambient decorative glow */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          </div>
        </div>
      </section>

      {/* SECTION 2: Bottom Two-Column Split (Recently played + Fav Artists) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLUMNS: Recently Played Tracklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Recently played</h2>
              {recentTracks.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                  {recentTracks.length} tracks
                </span>
              )}
            </div>
            <button
              onClick={() => setActiveTab('recents')}
              className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
            >
              View All ({recentTracks.length || tracks.length}) &gt;
            </button>
          </div>

          <div className="space-y-1.5">
            {displayRecents.slice(0, 6).map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const timeAgo = formatTimeAgo(track.playedAt);
              return (
                <div
                  key={track.id}
                  onClick={() => onSelectTrack(track)}
                  className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                  style={isCurrent ? { 
                    backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.15))',
                    borderLeftColor: 'var(--theme-primary, #6366f1)' 
                  } : {}}
                >
                  {/* Left: Artwork + Title & Artist */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                      <img
                        src={track.artworkUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Volume2 className={`w-5 h-5 text-indigo-400 ${isPlaying ? 'animate-pulse' : ''}`} style={{ color: 'var(--theme-primary, #6366f1)' }} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-indigo-300' : 'text-white'}`} style={isCurrent ? { color: 'var(--theme-light-accent, #c7d2fe)' } : {}}>
                        {track.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-neutral-400 truncate">
                          {track.artist}
                        </p>
                        {timeAgo && (
                          <span className="text-[10px] text-neutral-500 shrink-0 font-medium">
                            • {timeAgo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center: Duration */}
                  <div className="text-xs text-neutral-400 font-mono w-14 text-right hidden sm:block">
                    {formatDuration(track.duration)}
                  </div>

                  {/* Actions: Add to Playlist & More Options */}
                  <div 
                    className="relative flex items-center gap-1 ml-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onAddToPlaylist(track)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                      title="Add to Playlist"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveMenuTrackId(activeMenuTrackId === track.id ? null : track.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                      title="More Options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Dropdown Options Menu */}
                    {activeMenuTrackId === track.id && (
                      <div className="absolute right-0 top-9 z-30 w-48 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl py-1 text-xs">
                        <button
                          onClick={() => {
                            onSelectTrack(track);
                            setActiveMenuTrackId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-white flex items-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5 text-indigo-400" style={{ color: 'var(--theme-primary, #6366f1)' }} />
                          <span>Play Immediately</span>
                        </button>
                        {onPlayNext && (
                          <button
                            onClick={() => {
                              onPlayNext(track);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-white flex items-center gap-2"
                          >
                            <ListOrdered className="w-3.5 h-3.5 text-indigo-300" />
                            <span>Play Next in Queue</span>
                          </button>
                        )}
                        {onAddToQueue && (
                          <button
                            onClick={() => {
                              onAddToQueue(track);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-white flex items-center gap-2"
                          >
                            <ListPlus className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Add to Queue</span>
                          </button>
                        )}
                        {onAddSimilarToQueue && (
                          <button
                            onClick={() => {
                              onAddSimilarToQueue(track);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-indigo-300 flex items-center gap-2"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Queue Similar Songs</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onAddToPlaylist(track);
                            setActiveMenuTrackId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-white flex items-center gap-2"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Add to Playlist</span>
                        </button>
                        <button
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = track.audioUrl;
                            a.download = `${track.title} - ${track.artist}.mp3`;
                            a.target = '_blank';
                            a.click();
                            setActiveMenuTrackId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-white flex items-center gap-2"
                        >
                          <Download className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Download Audio</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Fav Artists */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white">Fav Artists</h2>
            <button
              onClick={() => setActiveTab('artists')}
              className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
            >
              All &gt;
            </button>
          </div>

          <div className="space-y-3">
            {artists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => onSelectArtist(artist)}
                className="group flex items-center justify-between p-3 rounded-2xl glass-panel glass-panel-hover transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-indigo-500 border-2 border-neutral-900 shadow-sm" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {artist.name}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {artist.songCount} songs in library
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectArtist(artist);
                  }}
                  className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                  title={`View ${artist.name}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

