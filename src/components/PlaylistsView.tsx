/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Play, 
  Star, 
  Music, 
  Trash2, 
  X, 
  ListPlus, 
  AlertTriangle, 
  GripVertical, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  Edit3, 
  Sparkles,
  Check
} from 'lucide-react';
import { Playlist, Track } from '../types';
import { getPlaylistCover } from '../utils/playlistUtils';

interface PlaylistsViewProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectTrack: (track: Track) => void;
  onCreatePlaylist: (title: string, subtitle: string, customCoverUrl?: string) => void;
  onAddToPlaylist?: (track: Track) => void;
  onRemoveTrackFromPlaylist?: (playlistId: string, trackId: string) => void;
  onDeletePlaylist?: (playlistId: string) => void;
  onReorderPlaylistTracks?: (playlistId: string, fromIndex: number, toIndex: number) => void;
  onUpdatePlaylistCover?: (playlistId: string, coverUrl: string | undefined) => void;
  onPlayNext?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  onSelectPlaylist,
  onSelectTrack,
  onCreatePlaylist,
  onAddToPlaylist,
  onRemoveTrackFromPlaylist,
  onDeletePlaylist,
  onReorderPlaylistTracks,
  onUpdatePlaylistCover,
  onPlayNext,
  onAddToQueue,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(playlists[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  
  // Create Playlist Modal State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCustomCover, setNewCustomCover] = useState('');
  const [coverSourceType, setCoverSourceType] = useState<'url' | 'upload'>('url');

  // Edit Cover Modal State
  const [editingCoverPlaylist, setEditingCoverPlaylist] = useState<Playlist | null>(null);
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editCoverTab, setEditCoverTab] = useState<'url' | 'upload'>('url');

  // Drag and drop state for tracklist
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fileInputRefCreate = useRef<HTMLInputElement>(null);
  const fileInputRefEdit = useRef<HTMLInputElement>(null);

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreatePlaylist(newTitle.trim(), newSubtitle.trim() || 'Custom Playlist', newCustomCover.trim() || undefined);
    setNewTitle('');
    setNewSubtitle('');
    setNewCustomCover('');
    setShowCreateModal(false);
  };

  const handleConfirmDelete = () => {
    if (!playlistToDelete || !onDeletePlaylist) return;
    const deletedId = playlistToDelete.id;
    onDeletePlaylist(deletedId);
    
    // If the deleted playlist was selected, fallback to the first remaining one
    if (selectedPlaylistId === deletedId) {
      const remaining = playlists.filter((p) => p.id !== deletedId);
      setSelectedPlaylistId(remaining[0]?.id || '');
    }
    
    setPlaylistToDelete(null);
  };

  const handleFileUpload = (file: File, isCreateModal: boolean) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (isCreateModal) {
          setNewCustomCover(result);
        } else {
          setEditCoverUrl(result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Reorder handlers
  const handleMoveTrack = (playlistId: string, currentIndex: number, direction: 'up' | 'down') => {
    if (!onReorderPlaylistTracks) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= (selectedPlaylist?.tracks?.length || 0)) return;
    onReorderPlaylistTracks(playlistId, currentIndex, targetIndex);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // Keep it responsive
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || !selectedPlaylist || !onReorderPlaylistTracks) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (draggedIndex !== dropIndex) {
      onReorderPlaylistTracks(selectedPlaylist.id, draggedIndex, dropIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveCover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoverPlaylist || !onUpdatePlaylistCover) return;
    onUpdatePlaylistCover(editingCoverPlaylist.id, editCoverUrl.trim() || undefined);
    setEditingCoverPlaylist(null);
  };

  const handleResetCoverToDefault = () => {
    if (!editingCoverPlaylist || !onUpdatePlaylistCover) return;
    onUpdatePlaylistCover(editingCoverPlaylist.id, undefined);
    setEditingCoverPlaylist(null);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span 
            className="text-[10px] font-bold uppercase tracking-[0.25em]"
            style={{ color: 'var(--theme-primary, #6366f1)' }}
          >
            ZTune Collections
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">
            Playlists ({playlists.length})
          </h1>
        </div>

        <button
          onClick={() => {
            setNewTitle('');
            setNewSubtitle('');
            setNewCustomCover('');
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-lg transition-all hover:scale-105"
          style={{ 
            backgroundColor: 'var(--theme-primary, #6366f1)',
            boxShadow: '0 4px 20px var(--theme-glow, rgba(99,102,241,0.4))'
          }}
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-white/5">
          <ListPlus className="w-12 h-12 mx-auto text-neutral-500" />
          <h3 className="text-lg font-bold text-white">No Playlists in Library</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            You don't have any playlists yet. Click below to create your first music collection.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-bold shadow-lg"
            style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {playlists.map((playlist) => {
            const isSelected = selectedPlaylist?.id === playlist.id;
            const coverImage = getPlaylistCover(playlist);
            const hasCustomCover = !!playlist.customArtworkUrl;
            const firstSongCover = playlist.tracks?.[0]?.artworkUrl;

            return (
              <div
                key={playlist.id}
                onClick={() => {
                  setSelectedPlaylistId(playlist.id);
                  onSelectPlaylist(playlist);
                }}
                className={`group relative cursor-pointer glass-panel rounded-3xl p-4 transition-all duration-300 ${
                  isSelected
                    ? 'border-indigo-500 shadow-lg'
                    : 'glass-panel-hover hover:-translate-y-1'
                }`}
                style={isSelected ? { 
                  borderColor: 'var(--theme-primary, #6366f1)',
                  backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.12))',
                  boxShadow: '0 8px 25px var(--theme-glow, rgba(99,102,241,0.25))'
                } : {}}
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-0">
                  <img
                    src={coverImage}
                    alt={playlist.title}
                    className="w-full h-full object-cover rounded-2xl opacity-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Rating / Info Badge */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-md">
                    <span>{playlist.rating || 5}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>

                  {/* Dynamic Cover Origin Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-semibold text-neutral-300">
                    {hasCustomCover ? (
                      <>
                        <ImageIcon className="w-2.5 h-2.5 text-indigo-400" />
                        <span>Custom Cover</span>
                      </>
                    ) : firstSongCover ? (
                      <>
                        <Music className="w-2.5 h-2.5 text-indigo-400" />
                        <span>1st Song Cover</span>
                      </>
                    ) : (
                      <span>Default Cover</span>
                    )}
                  </div>

                  {/* Actions overlay (Change Cover & Delete) */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    {onUpdatePlaylistCover && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCoverPlaylist(playlist);
                          setEditCoverUrl(playlist.customArtworkUrl || '');
                        }}
                        className="w-8 h-8 rounded-full bg-black/70 hover:bg-indigo-600 text-neutral-200 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                        title="Change playlist cover"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeletePlaylist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaylistToDelete(playlist);
                        }}
                        className="w-8 h-8 rounded-full bg-black/70 hover:bg-rose-600 text-neutral-200 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                        title={`Remove playlist "${playlist.title}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 px-1 flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors truncate" style={{ color: isSelected ? 'var(--theme-light-accent, #c7d2fe)' : undefined }}>
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">
                      {playlist.subtitle || `${(playlist.tracks || []).length} songs`}
                    </p>
                  </div>

                  {/* Mobile/Direct Delete button */}
                  {onDeletePlaylist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaylistToDelete(playlist);
                      }}
                      className="p-1 text-neutral-500 hover:text-rose-400 sm:hidden transition-colors"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Playlist Detailed Tracklist with Drag & Drop */}
      {selectedPlaylist && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-5 min-w-0 flex-1">
              <div className="relative group/cover shrink-0">
                <img
                  src={getPlaylistCover(selectedPlaylist)}
                  alt={selectedPlaylist.title}
                  className="w-24 h-24 rounded-2xl object-cover bg-neutral-800 border border-white/10 shadow-xl"
                />
                {/* Change Cover Hover Trigger */}
                {onUpdatePlaylistCover && (
                  <button
                    onClick={() => {
                      setEditingCoverPlaylist(selectedPlaylist);
                      setEditCoverUrl(selectedPlaylist.customArtworkUrl || '');
                    }}
                    className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover/cover:opacity-100 backdrop-blur-xs flex flex-col items-center justify-center gap-1 text-white text-[10px] font-bold transition-opacity"
                    title="Edit custom cover"
                  >
                    <Edit3 className="w-4 h-4 text-indigo-300" />
                    <span>Change Cover</span>
                  </button>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--theme-primary, #6366f1)' }}
                  >
                    ZTune Playlist
                  </span>
                  {selectedPlaylist.customArtworkUrl ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                      Custom Cover Active
                    </span>
                  ) : (selectedPlaylist.tracks || []).length > 0 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10 font-medium">
                      Cover from 1st track
                    </span>
                  ) : null}
                </div>

                <h2 className="text-2xl font-black text-white mt-1 truncate">
                  {selectedPlaylist.title}
                </h2>
                <p className="text-xs text-neutral-400 truncate mt-0.5">
                  {selectedPlaylist.subtitle} • {(selectedPlaylist.tracks || []).length} tracks
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingCoverPlaylist(selectedPlaylist);
                      setEditCoverUrl(selectedPlaylist.customArtworkUrl || '');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{selectedPlaylist.customArtworkUrl ? 'Edit Custom Cover' : 'Set Custom Cover'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {(selectedPlaylist.tracks || []).length > 0 && (
                <button
                  onClick={() => onSelectTrack(selectedPlaylist.tracks[0])}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-bold text-xs shadow-lg transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: 'var(--theme-primary, #6366f1)',
                    boxShadow: '0 4px 20px var(--theme-glow, rgba(99,102,241,0.4))'
                  }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Playlist</span>
                </button>
              )}

              {onDeletePlaylist && (
                <button
                  onClick={() => setPlaylistToDelete(selectedPlaylist)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-panel hover:bg-rose-500/15 border border-rose-500/20 text-neutral-300 hover:text-rose-400 text-xs font-semibold transition-colors"
                  title="Remove this playlist"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Remove Playlist</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            {(selectedPlaylist.tracks || []).length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-500 space-y-2">
                <Music className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                <p className="text-neutral-400 font-semibold">This playlist has no tracks yet.</p>
                <p className="text-xs text-neutral-600">Click "+ Add to Playlist" on any song across ZTune to populate this collection.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-4 py-2 text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center">#</span>
                    <span>Title / Artist</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="hidden sm:inline">Order / Actions</span>
                    <span className="w-12 text-right">Time</span>
                  </div>
                </div>

                <div className="divide-y divide-white/5">
                  {selectedPlaylist.tracks.map((track, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === (selectedPlaylist.tracks.length - 1);
                    const isBeingDragged = draggedIndex === idx;
                    const isDragOver = dragOverIndex === idx;

                    return (
                      <div
                        key={track.id || idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSelectTrack(track)}
                        className={`group flex items-center justify-between py-3 px-4 rounded-xl transition-all cursor-pointer ${
                          isBeingDragged 
                            ? 'opacity-40 scale-[0.98] bg-white/[0.08]' 
                            : isDragOver
                            ? 'bg-indigo-500/20 border-y-2 border-indigo-500'
                            : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                          {/* Drag handle */}
                          <div 
                            className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-neutral-200 p-1 -ml-1 transition-colors"
                            title="Drag up/down to reorder"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <span className="text-xs font-mono text-neutral-500 w-5 text-center">
                            {idx + 1}
                          </span>

                          <div className="relative shrink-0">
                            <img
                              src={track.artworkUrl}
                              alt={track.title}
                              className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shadow-sm"
                            />
                            {isFirst && !selectedPlaylist.customArtworkUrl && (
                              <div 
                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 border border-black flex items-center justify-center shadow"
                                title="This song's cover is currently used as the playlist cover"
                              >
                                <Star className="w-2.5 h-2.5 fill-white text-white" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white group-hover:text-indigo-300 truncate" style={{ color: 'var(--theme-light-accent, #ffffff)' }}>
                                {track.title}
                              </p>
                              {isFirst && !selectedPlaylist.customArtworkUrl && (
                                <span className="hidden md:inline-block text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                                  Cover Track
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Up / Down Reordering Buttons */}
                          {onReorderPlaylistTracks && (
                            <div className="flex items-center gap-0.5 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                disabled={isFirst}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTrack(selectedPlaylist.id, idx, 'up');
                                }}
                                className={`p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors ${isFirst ? 'opacity-20 cursor-not-allowed' : ''}`}
                                title="Move up in list"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={isLast}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTrack(selectedPlaylist.id, idx, 'down');
                                }}
                                className={`p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors ${isLast ? 'opacity-20 cursor-not-allowed' : ''}`}
                                title="Move down in list"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {onPlayNext && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlayNext(track);
                              }}
                              className="px-2 py-1 rounded text-xs text-neutral-400 hover:text-indigo-300 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 hidden sm:inline-block"
                              title="Play Next in Queue"
                            >
                              Play Next
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

                          {onAddToPlaylist && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToPlaylist(track);
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="Add to another playlist"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}

                          <span className="text-xs font-mono text-neutral-400 w-12 text-right">
                            {formatDuration(track.duration)}
                          </span>

                          {onRemoveTrackFromPlaylist && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveTrackFromPlaylist(selectedPlaylist.id, track.id);
                              }}
                              className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Remove track from this playlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Playlist Confirmation Modal */}
      {playlistToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-rose-500/30 shadow-2xl bg-[#0e0e0e]/95 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-white">Remove Playlist</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Are you sure you want to remove <span className="text-white font-semibold">"{playlistToDelete.title}"</span>? This will delete the playlist from your library.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setPlaylistToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-bold bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Playlist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Custom Playlist Cover Modal */}
      {editingCoverPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl bg-[#0e0e0e]/95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Playlist Cover Artwork</h3>
                  <p className="text-xs text-neutral-400 truncate">{editingCoverPlaylist.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingCoverPlaylist(null)} 
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCover} className="space-y-4">
              {/* Preview */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <img 
                  src={editCoverUrl.trim() || getPlaylistCover(editingCoverPlaylist)} 
                  alt="Cover Preview" 
                  className="w-16 h-16 rounded-xl object-cover bg-neutral-800 border border-white/10 shadow-md"
                />
                <div className="text-xs text-neutral-400 space-y-1">
                  <p className="font-semibold text-white">Cover Preview</p>
                  <p className="text-[11px] leading-relaxed">
                    {editCoverUrl.trim() 
                      ? 'Using custom artwork below' 
                      : editingCoverPlaylist.tracks?.[0]?.artworkUrl 
                      ? 'Currently showing cover of 1st track' 
                      : 'Showing default catalog image'}
                  </p>
                </div>
              </div>

              {/* Tabs: URL or Upload */}
              <div className="flex rounded-xl bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setEditCoverTab('url')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    editCoverTab === 'url' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditCoverTab('upload')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    editCoverTab === 'upload' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
              </div>

              {editCoverTab === 'url' ? (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Custom Image URL (JPG, PNG, WebP)
                  </label>
                  <input
                    type="url"
                    value={editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-neutral-500">Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setEditCoverUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80')}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300"
                    >
                      Abstract Wave
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCoverUrl('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80')}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300"
                    >
                      Guitar Studio
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Upload from your device
                  </label>
                  <input
                    ref={fileInputRefEdit}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, false);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefEdit.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                  >
                    <Upload className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-semibold">Click to select an image</span>
                    <span className="text-[10px] text-neutral-500">PNG, JPG, GIF, WebP</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                {editingCoverPlaylist.customArtworkUrl ? (
                  <button
                    type="button"
                    onClick={handleResetCoverToDefault}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Reset to 1st Song Cover
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCoverPlaylist(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105"
                    style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Cover</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Playlist Modal (Enhanced with Custom Cover Option) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl bg-[#0e0e0e]/95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">Create New Playlist</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Playlist Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Midnight Drive"
                  className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="e.g. Synthwave & Retrowave Vibes"
                  className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Custom Cover Art Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Custom Playlist Cover <span className="text-[10px] text-neutral-500 font-normal">(Optional)</span>
                  </label>
                </div>

                <div className="flex rounded-xl bg-white/5 p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setCoverSourceType('url')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      coverSourceType === 'url' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Image URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverSourceType('upload')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      coverSourceType === 'upload' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                </div>

                {coverSourceType === 'url' ? (
                  <input
                    type="url"
                    value={newCustomCover}
                    onChange={(e) => setNewCustomCover(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                ) : (
                  <div>
                    <input
                      ref={fileInputRefCreate}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, true);
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefCreate.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl flex items-center justify-center gap-2 text-neutral-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                    >
                      <Upload className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold">
                        {newCustomCover ? 'Image Selected (Click to change)' : 'Select image file'}
                      </span>
                    </button>
                  </div>
                )}

                {newCustomCover && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 rounded-xl bg-white/5">
                    <img src={newCustomCover} alt="Cover Preview" className="w-10 h-10 rounded-lg object-cover bg-neutral-800" />
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Cover preview ready
                    </span>
                  </div>
                )}
                
                {!newCustomCover && (
                  <p className="text-[11px] text-neutral-500 mt-1.5">
                    * If left blank, the cover will automatically match the 1st song added to this playlist.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
                  style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
