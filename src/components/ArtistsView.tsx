/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Music, Star, Play, Plus, Edit3, Trash2, X, Image, Sparkles, Check, AlertTriangle, ListPlus, Radio, Heart } from 'lucide-react';
import { Artist, Track } from '../types';

interface ArtistsViewProps {
  artists: Artist[];
  tracks: Track[];
  onSelectArtist: (artist: Artist) => void;
  onSelectTrack: (track: Track) => void;
  onCreateArtist?: (artistData: { name: string; genre: string; avatarUrl: string; bannerUrl?: string; bio?: string }) => void;
  onUpdateArtist?: (artist: Artist) => void;
  onDeleteArtist?: (artistId: string) => void;
  onAddToPlaylist?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onPlayNext?: (track: Track) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520523839898-5071280330a7?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'
];

export const ArtistsView: React.FC<ArtistsViewProps> = ({
  artists,
  tracks,
  onSelectArtist,
  onSelectTrack,
  onCreateArtist,
  onUpdateArtist,
  onDeleteArtist,
  onAddToPlaylist,
  onAddToQueue,
  onPlayNext,
}) => {
  const [selectedArtistId, setSelectedArtistId] = useState<string>(artists[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [artistToEdit, setArtistToEdit] = useState<Artist | null>(null);
  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formGenre, setFormGenre] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formBio, setFormBio] = useState('');

  const selectedArtist = artists.find(a => a.id === selectedArtistId) || artists[0] || null;

  const artistTracks = selectedArtist
    ? tracks.filter(t => t.artist.toLowerCase().includes(selectedArtist.name.toLowerCase()) || t.artist === selectedArtist.name)
    : [];

  const openCreateModal = () => {
    setFormName('');
    setFormGenre('Electronic');
    setFormAvatarUrl(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
    setFormBio('');
    setShowCreateModal(true);
  };

  const openEditModal = (artist: Artist) => {
    setArtistToEdit(artist);
    setFormName(artist.name);
    setFormGenre(artist.genre || 'Electronic');
    setFormAvatarUrl(artist.avatarUrl || PRESET_AVATARS[0]);
    setFormBio(artist.bio || '');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !onCreateArtist) return;
    onCreateArtist({
      name: formName.trim(),
      genre: formGenre.trim() || 'Electronic',
      avatarUrl: formAvatarUrl.trim() || PRESET_AVATARS[0],
      bio: formBio.trim() || undefined,
    });
    setShowCreateModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistToEdit || !formName.trim() || !onUpdateArtist) return;
    const updated: Artist = {
      ...artistToEdit,
      name: formName.trim(),
      genre: formGenre.trim() || 'Electronic',
      avatarUrl: formAvatarUrl.trim() || PRESET_AVATARS[0],
      bio: formBio.trim() || undefined,
    };
    onUpdateArtist(updated);
    setArtistToEdit(null);
  };

  const handleConfirmDelete = () => {
    if (!artistToDelete || !onDeleteArtist) return;
    const deletedId = artistToDelete.id;
    onDeleteArtist(deletedId);
    
    if (selectedArtistId === deletedId) {
      const remaining = artists.filter(a => a.id !== deletedId);
      setSelectedArtistId(remaining[0]?.id || '');
    }
    setArtistToDelete(null);
  };

  const handleToggleFavorite = (artist: Artist) => {
    if (!onUpdateArtist) return;
    onUpdateArtist({
      ...artist,
      isFavorite: !artist.isFavorite,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFormAvatarUrl(objectUrl);
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">
      {/* Header with Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <span 
            className="text-[10px] font-bold uppercase tracking-[0.25em]"
            style={{ color: 'var(--theme-primary, #6366f1)' }}
          >
            ZTune Artists Roster
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">
            Artists ({artists.length})
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-lg transition-all"
          style={{ 
            backgroundColor: 'var(--theme-primary, #6366f1)',
            boxShadow: '0 4px 20px var(--theme-glow, rgba(99,102,241,0.4))'
          }}
        >
          <Plus className="w-4 h-4" />
          <span>New Artist</span>
        </button>
      </div>

      {/* Artists Grid */}
      {artists.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-white/5">
          <User className="w-12 h-12 mx-auto text-neutral-500" />
          <h3 className="text-lg font-bold text-white">No Artists in Library</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            You haven't added any artists yet. Click below to customize and add your first artist profile.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-bold shadow-lg"
            style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Artist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {artists.map((artist) => {
            const isSelected = selectedArtist?.id === artist.id;
            const currentSongCount = tracks.filter(t => t.artist.toLowerCase().includes(artist.name.toLowerCase()) || t.artist === artist.name).length;
            
            return (
              <div
                key={artist.id}
                onClick={() => {
                  setSelectedArtistId(artist.id);
                  onSelectArtist(artist);
                }}
                className={`group relative cursor-pointer glass-panel rounded-2xl p-4 text-center transition-all duration-300 ${
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
                {/* Action Buttons Top Floating */}
                <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(artist);
                    }}
                    className="w-7 h-7 rounded-full bg-black/70 hover:bg-indigo-600 text-neutral-300 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-md"
                    title={`Edit ${artist.name}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {onDeleteArtist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setArtistToDelete(artist);
                      }}
                      className="w-7 h-7 rounded-full bg-black/70 hover:bg-rose-600 text-neutral-300 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-md"
                      title={`Remove ${artist.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden bg-neutral-800 border-2 border-white/10 mb-3 shadow-md">
                  <img
                    src={artist.avatarUrl || PRESET_AVATARS[0]}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {artist.isFavorite && (
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-amber-500/90 flex items-center justify-center shadow-md">
                      <Star className="w-3 h-3 fill-white text-white" />
                    </div>
                  )}
                </div>

                <h3 
                  className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate px-1"
                  style={{ color: isSelected ? 'var(--theme-light-accent, #c7d2fe)' : undefined }}
                >
                  {artist.name}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                  {artist.genre || 'Artist'} • {currentSongCount} songs
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Artist Details & Discography */}
      {selectedArtist && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-5 min-w-0 flex-1">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-neutral-800 border border-white/10 shadow-lg shrink-0">
                <img
                  src={selectedArtist.avatarUrl || PRESET_AVATARS[0]}
                  alt={selectedArtist.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{ 
                      backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.2))',
                      color: 'var(--theme-light-accent, #c7d2fe)'
                    }}
                  >
                    {selectedArtist.genre || 'Verified Artist'}
                  </span>

                  <button
                    onClick={() => handleToggleFavorite(selectedArtist)}
                    className="text-neutral-400 hover:text-amber-400 transition-colors"
                    title={selectedArtist.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-4 h-4 ${selectedArtist.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-white mt-1 truncate">
                  {selectedArtist.name}
                </h2>
                
                {selectedArtist.bio ? (
                  <p className="text-xs text-neutral-300 mt-1 line-clamp-2 max-w-xl">
                    {selectedArtist.bio}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-400 mt-1">
                    {artistTracks.length} tracks available in library
                  </p>
                )}
              </div>
            </div>

            {/* Top action buttons for selected artist */}
            <div className="flex items-center gap-2.5 shrink-0">
              {artistTracks.length > 0 && (
                <button
                  onClick={() => onSelectTrack(artistTracks[0])}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-xs shadow-lg transition-all"
                  style={{ 
                    backgroundColor: 'var(--theme-primary, #6366f1)',
                    boxShadow: '0 4px 20px var(--theme-glow, rgba(99,102,241,0.4))'
                  }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play All</span>
                </button>
              )}

              <button
                onClick={() => openEditModal(selectedArtist)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-panel hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-semibold transition-colors"
                title="Customise artist info, image, bio and genre"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Artist</span>
              </button>

              {onDeleteArtist && (
                <button
                  onClick={() => setArtistToDelete(selectedArtist)}
                  className="p-2.5 rounded-full glass-panel hover:bg-rose-500/20 border border-rose-500/30 text-neutral-400 hover:text-rose-400 transition-colors"
                  title="Delete this artist profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Discography List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Songs by {selectedArtist.name} ({artistTracks.length})
              </h3>
            </div>

            {artistTracks.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-500 space-y-2">
                <Music className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                <p className="text-neutral-400 font-semibold">No tracks currently attributed to {selectedArtist.name}.</p>
                <p className="text-xs text-neutral-600">Import songs via "Import Local" or search iTunes in the top bar to expand your collection.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {artistTracks.map((track, idx) => (
                  <div
                    key={track.id || idx}
                    onClick={() => onSelectTrack(track)}
                    className="group flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                      <span className="text-xs font-mono text-neutral-500 w-6">
                        {idx + 1}
                      </span>
                      <img
                        src={track.artworkUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shrink-0 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-indigo-300 truncate" style={{ color: 'var(--theme-light-accent, #ffffff)' }}>
                          {track.title}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">{track.album || selectedArtist.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Play Next in Queue Quick Button */}
                      {onPlayNext && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayNext(track);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                          title="Play next in queue"
                        >
                          Play Next
                        </button>
                      )}

                      {/* Add to Queue */}
                      {onAddToQueue && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToQueue(track);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                          title="Add to queue"
                        >
                          <ListPlus className="w-4 h-4" />
                        </button>
                      )}

                      {/* Add to Playlist */}
                      {onAddToPlaylist && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToPlaylist(track);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Add to playlist"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}

                      <span className="text-xs font-mono text-neutral-400 w-12 text-right">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE ARTIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg border border-white/10 shadow-2xl bg-[#0e0e0e]/95 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Library Roster</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">Add Custom Artist</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Artist Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Daft Punk, Tycho, Hans Zimmer"
                  className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Primary Genre
                  </label>
                  <input
                    type="text"
                    value={formGenre}
                    onChange={(e) => setFormGenre(e.target.value)}
                    placeholder="e.g. Electronic, Synthwave, Rock"
                    className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Upload Custom Photo
                  </label>
                  <label className="flex items-center justify-center gap-2 h-10 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors">
                    <Image className="w-4 h-4" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={formAvatarUrl}
                  onChange={(e) => setFormAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Preset Avatars Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">
                  Or pick a preset avatar:
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormAvatarUrl(url)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                        formAvatarUrl === url ? 'border-indigo-500 scale-105 ring-2 ring-indigo-500/40' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={url} alt="Preset avatar" className="w-full h-full object-cover" />
                      {formAvatarUrl === url && (
                        <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Artist Biography / Notes
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Add a bio or notes about this artist..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all"
                  style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
                >
                  Create Artist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ARTIST MODAL */}
      {artistToEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg border border-white/10 shadow-2xl bg-[#0e0e0e]/95 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Customise Profile</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">Edit Artist: {artistToEdit.name}</h3>
              </div>
              <button 
                onClick={() => setArtistToEdit(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-white/20">
                  <img src={formAvatarUrl || PRESET_AVATARS[0]} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{formName || 'Artist Name'}</p>
                  <p className="text-[11px] text-neutral-400">{formGenre || 'Genre'}</p>
                  <label className="inline-flex items-center gap-1.5 mt-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
                    <Image className="w-3.5 h-3.5" />
                    <span>Upload new photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Artist Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Genre
                </label>
                <input
                  type="text"
                  value={formGenre}
                  onChange={(e) => setFormGenre(e.target.value)}
                  placeholder="e.g. Electronic, Synthwave, Classical"
                  className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={formAvatarUrl}
                  onChange={(e) => setFormAvatarUrl(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Preset Avatars Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">
                  Preset Avatars:
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormAvatarUrl(url)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                        formAvatarUrl === url ? 'border-indigo-500 scale-105 ring-2 ring-indigo-500/40' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={url} alt="Preset avatar" className="w-full h-full object-cover" />
                      {formAvatarUrl === url && (
                        <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Artist Biography / Description
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Describe this artist or add liner notes..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setArtistToEdit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all"
                  style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ARTIST CONFIRMATION MODAL */}
      {artistToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-rose-500/30 shadow-2xl bg-[#0e0e0e]/95 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-white">Remove Artist</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Are you sure you want to remove <span className="text-white font-semibold">"{artistToDelete.name}"</span> from your roster? Your songs will remain safe in your library.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setArtistToDelete(null)}
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
                <span>Remove Artist</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
