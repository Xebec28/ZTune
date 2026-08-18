/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Check, Music, X, ListMusic, Sparkles } from 'lucide-react';
import { Playlist, Track } from '../types';
import { getPlaylistCover } from '../utils/playlistUtils';

interface AddToPlaylistModalProps {
  track: Track | null;
  playlists: Playlist[];
  onClose: () => void;
  onTogglePlaylistTrack: (playlistId: string, track: Track) => void;
  onCreatePlaylistAndAdd: (title: string, track: Track) => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  track,
  playlists,
  onClose,
  onTogglePlaylistTrack,
  onCreatePlaylistAndAdd,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);

  if (!track) return null;

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreatePlaylistAndAdd(newTitle.trim(), track);
    setNewTitle('');
    setShowNewInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative z-10 w-full max-w-md bg-[#0D0D12] border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Ambient Top Glow */}
        <div 
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-40"
          style={{ background: 'var(--theme-primary, #6366f1)' }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-indigo-400" style={{ color: 'var(--theme-primary, #6366f1)' }} />
            <h2 className="text-lg font-bold text-white">Add to Playlist</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Song Info */}
        <div className="flex items-center gap-3.5 my-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 relative z-10">
          <img
            src={track.artworkUrl}
            alt={track.title}
            className="w-12 h-12 rounded-xl object-cover shadow-md"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{track.title}</p>
            <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>
          </div>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar my-2 relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Your Playlists ({playlists.length})
          </p>

          {playlists.length === 0 ? (
            <div className="text-center py-6 text-neutral-500 text-xs">
              No playlists found. Create your first playlist below!
            </div>
          ) : (
            playlists.map((playlist) => {
              const isInPlaylist = (playlist.tracks || []).some((t) => t.id === track.id || (t.title === track.title && t.artist === track.artist));

              return (
                <div
                  key={playlist.id}
                  onClick={() => onTogglePlaylistTrack(playlist.id, track)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isInPlaylist
                      ? 'bg-indigo-500/15 border border-indigo-500/40 text-white'
                      : 'bg-white/[0.02] border border-white/5 text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                  style={isInPlaylist ? { borderColor: 'var(--theme-border, rgba(99,102,241,0.4))', backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.15))' } : {}}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-neutral-800 shrink-0 flex items-center justify-center border border-white/10">
                      <img src={getPlaylistCover(playlist)} alt={playlist.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate text-white">{playlist.title}</p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {(playlist.tracks || []).length} songs
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isInPlaylist
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'border border-white/20 text-transparent hover:border-white/40'
                    }`}
                    style={isInPlaylist ? { backgroundColor: 'var(--theme-primary, #6366f1)' } : {}}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create New Playlist Inline Section */}
        <div className="pt-3 border-t border-white/10 relative z-10">
          {showNewInput ? (
            <form onSubmit={handleCreateNew} className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Playlist name..."
                className="flex-1 h-9 px-3.5 text-xs rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-4 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
                style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewInput(false)}
                className="px-3 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 text-neutral-400 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowNewInput(true)}
              className="w-full py-2.5 px-4 rounded-xl glass-panel text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-indigo-400" style={{ color: 'var(--theme-primary, #6366f1)' }} />
              <span>Create New Playlist & Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
