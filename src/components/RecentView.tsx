/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Pause, Clock, Plus, Trash2, Search, Filter, Disc, Volume2, ListMusic, ListOrdered, ListPlus, Sparkles } from 'lucide-react';
import { Track } from '../types';

interface RecentViewProps {
  recentTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  onRateTrack?: (trackId: string, rating: number) => void;
  onAddToPlaylist: (track: Track) => void;
  onRemoveFromRecent: (trackId: string) => void;
  onClearRecent: () => void;
  onPlayNext?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onAddSimilarToQueue?: (track: Track) => void;
}

export const RecentView: React.FC<RecentViewProps> = ({
  recentTracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onRateTrack,
  onAddToPlaylist,
  onRemoveFromRecent,
  onClearRecent,
  onPlayNext,
  onAddToQueue,
  onAddSimilarToQueue,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'plays' | 'title' | 'artist'>('recent');

  const filteredTracks = recentTracks
    .filter((t) => {
      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album && t.album.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return (b.playedAt || 0) - (a.playedAt || 0);
      if (sortBy === 'plays') return (b.playCount || 1) - (a.playCount || 1);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      return 0;
    });

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return 'Recently';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span 
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400"
              style={{ color: 'var(--theme-primary, #6366f1)' }}
            >
              Listening History
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">
            Recently Played ({recentTracks.length})
          </h1>
        </div>

        {/* Search, Sort & Clear Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search recents..."
              className="h-9 pl-9 pr-4 text-xs glass-panel rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 w-44 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 glass-panel px-3 py-1.5 rounded-xl text-xs text-neutral-300">
            <Filter className="w-3.5 h-3.5 text-indigo-400" style={{ color: 'var(--theme-primary, #6366f1)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="recent" className="bg-neutral-900">Most Recent</option>
              <option value="plays" className="bg-neutral-900">Most Played</option>
              <option value="title" className="bg-neutral-900">Song Title</option>
              <option value="artist" className="bg-neutral-900">Artist</option>
            </select>
          </div>

          {recentTracks.length > 0 && (
            <button
              onClick={onClearRecent}
              className="p-2 text-neutral-400 hover:text-rose-400 glass-panel rounded-xl text-xs transition-colors flex items-center gap-1"
              title="Clear all recent listening history"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Last Played Hero Resume Card */}
      {recentTracks.length > 0 && (
        <div 
          className="relative rounded-3xl overflow-hidden border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl transition-all"
          style={{ 
            background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb, 99, 102, 241), 0.18) 0%, rgba(10, 10, 15, 0.8) 100%)' 
          }}
        >
          <div className="flex items-center gap-5 min-w-0 flex-1">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg shrink-0 group">
              <img
                src={recentTracks[0].artworkUrl}
                alt={recentTracks[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <button
                onClick={() => onSelectTrack(recentTracks[0])}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <Play className="w-6 h-6 fill-white text-white" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 uppercase tracking-wider">
                  Last Listened • {formatTimeAgo(recentTracks[0].playedAt)}
                </span>
                {recentTracks[0].playCount && recentTracks[0].playCount > 1 && (
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 uppercase tracking-wider"
                    style={{ color: 'var(--theme-light-accent, #c7d2fe)' }}
                  >
                    {recentTracks[0].playCount} Plays
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white truncate mt-1">{recentTracks[0].title}</h2>
              <p className="text-xs text-neutral-400 truncate">{recentTracks[0].artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onAddToPlaylist(recentTracks[0])}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-panel text-xs font-semibold text-white hover:bg-white/10 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Playlist</span>
            </button>

            <button
              onClick={() => onSelectTrack(recentTracks[0])}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {currentTrack?.id === recentTracks[0].id && isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-black" />
                  <span>Playing</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                  <span>Resume Playback</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recents Songs Table View */}
      {filteredTracks.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3 border border-white/5">
          <Clock className="w-12 h-12 mx-auto text-neutral-600 animate-pulse" />
          <h3 className="text-lg font-bold text-white">No Recent Tracks Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {filterQuery ? `No tracks matching "${filterQuery}" in history` : 'Songs you play will automatically appear here with playback counts and timestamps.'}
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title & Artist</div>
            <div className="col-span-3">Played</div>
            <div className="col-span-1 text-center">Plays</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-white/5">
            {filteredTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id || idx}
                  onClick={() => onSelectTrack(track)}
                  className={`grid grid-cols-12 gap-4 px-6 py-3.5 items-center group cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-indigo-500/10 text-white font-medium'
                      : 'hover:bg-white/[0.03] text-neutral-300 hover:text-white'
                  }`}
                  style={isCurrent ? { backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.1))' } : {}}
                >
                  {/* Track number / Playing indicator */}
                  <div className="col-span-1 text-xs text-neutral-500 font-mono flex items-center">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-end gap-0.5 h-3.5">
                        <span className="w-1 bg-indigo-400 animate-pulse h-3 rounded-full" style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }} />
                        <span className="w-1 bg-indigo-400 animate-pulse h-2 rounded-full delay-75" style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }} />
                        <span className="w-1 bg-indigo-400 animate-pulse h-3.5 rounded-full delay-150" style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }} />
                      </div>
                    ) : (
                      <span className="group-hover:hidden">{idx + 1}</span>
                    )}
                    <Play className="w-4 h-4 hidden group-hover:block text-white" />
                  </div>

                  {/* Title & Artist & Thumbnail */}
                  <div className="col-span-5 flex items-center gap-3.5 min-w-0">
                    <img
                      src={track.artworkUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-indigo-300' : 'text-white'}`} style={isCurrent ? { color: 'var(--theme-light-accent, #c7d2fe)' } : {}}>
                        {track.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{track.artist}</p>
                    </div>
                  </div>

                  {/* Time ago */}
                  <div className="col-span-3 text-xs text-neutral-400 font-mono flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    <span>{formatTimeAgo(track.playedAt)}</span>
                  </div>

                  {/* Play count */}
                  <div className="col-span-1 text-center font-mono text-xs text-neutral-400">
                    {track.playCount || 1}
                  </div>

                  {/* Actions (Play Next, Add to Queue, Add to Playlist, Remove) */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    {onPlayNext && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayNext(track);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-300 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Play Next in Queue"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                    )}

                    {onAddToQueue && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToQueue(track);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Add to Queue"
                      >
                        <ListPlus className="w-4 h-4" />
                      </button>
                    )}

                    {onAddSimilarToQueue && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddSimilarToQueue(track);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-400 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Queue Similar Songs"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlaylist(track);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Add to Playlist"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromRecent(track.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
