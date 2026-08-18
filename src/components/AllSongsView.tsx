/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Sparkles, MoreHorizontal, Filter, Download, Volume2, Search } from 'lucide-react';
import { Track } from '../types';

interface AllSongsViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  onRateTrack?: (trackId: string, rating: number) => void;
  onOpenAIInsights: (track: Track) => void;
  selectedGenre: string | null;
  setSelectedGenre: (g: string | null) => void;
}

export const AllSongsView: React.FC<AllSongsViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onRateTrack,
  onOpenAIInsights,
  selectedGenre,
  setSelectedGenre,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'duration'>('title');
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

  const genres = ['All', 'Dream Pop', 'Synth Pop', 'Electropop', 'Synthwave', '80s Synth', 'Indie Pop', 'Acoustic'];

  const filteredTracks = tracks
    .filter(t => {
      if (selectedGenre && selectedGenre !== 'All' && t.genre !== selectedGenre) return false;
      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'duration') return b.duration - a.duration;
      return 0;
    });

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
            Library Catalog
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">
            All Songs ({tracks.length})
          </h1>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter library..."
              className="h-9 pl-9 pr-4 text-xs glass-panel rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-indigo-500/50 w-48 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 glass-panel px-3 py-1.5 rounded-xl text-xs text-neutral-300">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="title" className="bg-neutral-900">Sort by Title</option>
              <option value="artist" className="bg-neutral-900">Sort by Artist</option>
              <option value="duration" className="bg-neutral-900">Sort by Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {genres.map(g => {
          const isActive = (g === 'All' && !selectedGenre) || selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g === 'All' ? null : g)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'glass-panel text-neutral-400 hover:text-white glass-panel-hover'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Songs Table View */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-4">Album / Genre</div>
          <div className="col-span-2 text-right">Time</div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className={`group grid grid-cols-12 gap-4 items-center px-6 py-3.5 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-500/10 border-l-4 border-indigo-500'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="col-span-1 text-xs font-mono text-neutral-500 group-hover:text-white flex items-center">
                  {isCurrent ? (
                    <Volume2 className={`w-4 h-4 text-indigo-400 ${isPlaying ? 'animate-pulse' : ''}`} />
                  ) : (
                    <span className="group-hover:hidden">{idx + 1}</span>
                  )}
                  {!isCurrent && (
                    <Play className="w-4 h-4 text-white hidden group-hover:block ml-[-2px]" />
                  )}
                </div>

                <div className="col-span-5 flex items-center gap-3.5 min-w-0">
                  <img
                    src={track.artworkUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-indigo-300' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="col-span-4 min-w-0">
                  <p className="text-xs text-neutral-300 truncate">{track.album}</p>
                  <span className="text-[10px] text-indigo-400/80 font-medium">
                    {track.genre}
                  </span>
                </div>

                {/* Duration & AI button */}
                <div 
                  className="col-span-2 flex items-center justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onOpenAIInsights(track)}
                    className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-neutral-400 hover:text-indigo-300 transition-colors"
                    title="AI Song Insights"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono text-neutral-400">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
