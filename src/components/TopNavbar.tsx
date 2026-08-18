/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Search, Upload, ChevronLeft, ChevronRight, Palette, Plus, ListOrdered, ListPlus, Check, Play, ChevronDown, FolderOpen, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Track, NavigationTab } from '../types';

interface TopNavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onSelectTrack: (track: Track) => void;
  onImportLocalFile: (file: File) => void;
  onOpenImportModal: (tab?: 'local' | 'youtube') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddToPlaylist?: (track: Track) => void;
  onPlayNext?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onQueueAll?: (tracks: Track[]) => void;
  themeMode: 'normal' | 'dynamic';
  onToggleTheme: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTrack,
  onImportLocalFile,
  onOpenImportModal,
  searchQuery,
  setSearchQuery,
  onAddToPlaylist,
  onPlayNext,
  onAddToQueue,
  onQueueAll,
  themeMode,
  onToggleTheme,
}) => {
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [lastActionId, setLastActionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string, trackId?: string) => {
    setFeedbackMessage(msg);
    if (trackId) setLastActionId(trackId);
    setTimeout(() => {
      setFeedbackMessage(null);
      setLastActionId(null);
    }, 2200);
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (q.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.tracks || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        onImportLocalFile(file);
      });
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md z-30 border-b border-white/5">
      {/* Left: Geometric Balance Back/Forward glass-panel arrows */}
      <div className="flex gap-3 items-center">
        <button 
          onClick={() => setActiveTab('home')}
          className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          title="Home / Discover"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setActiveTab('recents')}
          className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          title="Recently Played"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Center: Search input with dropdown */}
      <div className="relative w-full max-w-md mx-6">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setShowDropdown(true);
            }}
            placeholder="Search for artists, songs and YouTube Music catalog..."
            className="w-full h-9 pl-10 pr-4 text-xs glass-panel rounded-full text-white placeholder-neutral-400 focus:outline-none transition-all"
            style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.08))' }}
          />
        </div>

        {/* Live Search Results Dropdown */}
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)} 
            />
            <div className="absolute left-0 right-0 top-11 z-50 bg-[#121216] border border-white/15 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-white/10 flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider bg-black/40">
                <span className="flex items-center gap-1.5">
                  <span>Search Matches</span>
                  {feedbackMessage && (
                    <span className="text-emerald-400 font-semibold normal-case flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3 h-3" /> {feedbackMessage}
                    </span>
                  )}
                </span>
                
                <div className="flex items-center gap-2">
                  {searchResults.length > 0 && onQueueAll && (
                    <button
                      onClick={() => {
                        onQueueAll(searchResults);
                        showFeedback(`Added ${searchResults.length} songs to Queue!`);
                      }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors"
                      title="Add all search results to playback queue"
                    >
                      <ListPlus className="w-3 h-3 text-indigo-400" />
                      <span>Queue All ({searchResults.length})</span>
                    </button>
                  )}
                  {isSearching && <span className="animate-pulse" style={{ color: 'var(--theme-primary, #6366f1)' }}>Searching...</span>}
                </div>
              </div>

              {searchResults.length === 0 && !isSearching ? (
                <div className="p-6 text-center text-xs text-neutral-400">
                  No tracks found for "{searchQuery}"
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {searchResults.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 hover:bg-white/[0.06] cursor-pointer transition-colors group"
                      onClick={() => {
                        onSelectTrack(t);
                        setShowDropdown(false);
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                        <img
                          src={t.artworkUrl}
                          alt={t.title}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300" style={{ color: 'var(--theme-light-accent, #ffffff)' }}>
                            {t.title}
                          </p>
                          <p className="text-[11px] text-neutral-400 truncate">{t.artist} • {t.album}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Play Next in Queue button */}
                        {onPlayNext && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayNext(t);
                              showFeedback(`"${t.title}" queued as Next!`, t.id);
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
                              lastActionId === t.id 
                                ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/40' 
                                : 'text-neutral-300 hover:text-white hover:bg-white/10'
                            }`}
                            title="Play Next in Queue (adds right after current song)"
                          >
                            <ListOrdered className="w-3.5 h-3.5 text-indigo-300" />
                            <span className="hidden sm:inline">Play Next</span>
                          </button>
                        )}

                        {/* Add to Queue (end) button */}
                        {onAddToQueue && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToQueue(t);
                              showFeedback(`Added to Queue!`, t.id);
                            }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Add to End of Queue"
                          >
                            <ListPlus className="w-4 h-4 text-neutral-300 hover:text-indigo-300" />
                          </button>
                        )}

                        {onAddToPlaylist && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToPlaylist(t);
                            }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Add to Playlist"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTrack(t);
                            setShowDropdown(false);
                          }}
                          className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1"
                          style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Play</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: Upgrade badge + Import + Dynamic Theme Toggle */}
      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*,.mp3,.flac,.wav,.ogg,.m4a"
          multiple
          className="hidden"
        />

        {/* Interactive Import Dropdown & Modal Launcher */}
        <div className="relative">
          <button
            onClick={() => setShowImportMenu(prev => !prev)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel hover:bg-white/10 text-xs text-white font-semibold transition-all border border-white/10 shadow-sm"
            title="Import Music (Local Audio or YouTube Video Link)"
          >
            <Upload className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary, #6366f1)' }} />
            <span>Import</span>
            <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${showImportMenu ? 'rotate-180' : ''}`} />
          </button>

          {showImportMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowImportMenu(false)}
              />
              <div 
                className="absolute right-0 top-10 z-50 w-72 bg-[#121218] border border-white/15 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150"
                style={{
                  boxShadow: '0 20px 40px rgba(0,0,0,0.7), 0 0 20px var(--theme-glow, rgba(99,102,241,0.2))'
                }}
              >
                <div className="px-3 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-white/10 flex items-center justify-between">
                  <span>Import Options</span>
                  <span className="text-indigo-400 flex items-center gap-1 font-semibold normal-case text-[11px]">
                    <Sparkles className="w-3 h-3" /> Quick Add
                  </span>
                </div>

                {/* Option 1: Import Local */}
                <button
                  onClick={() => {
                    setShowImportMenu(false);
                    onOpenImportModal('local');
                  }}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                      <span>Import Local Audio</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                        Sound Skull Art
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                      Upload MP3, WAV, FLAC with iconic Sound Skull cover art
                    </p>
                  </div>
                </button>

                {/* Option 2: Import YouTube Video Link */}
                <button
                  onClick={() => {
                    setShowImportMenu(false);
                    onOpenImportModal('youtube');
                  }}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors flex items-center justify-between">
                      <span>YouTube Video Link</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                        URL
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                      Paste any YouTube link to stream & add to library
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />

        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
            themeMode === 'dynamic'
              ? 'text-white shadow-md'
              : 'glass-panel border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
          }`}
          style={themeMode === 'dynamic' ? {
            backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.25))',
            borderColor: 'var(--theme-border, rgba(99,102,241,0.5))',
            boxShadow: '0 2px 12px var(--theme-glow, rgba(99,102,241,0.3))'
          } : {}}
          title="Toggle between Dynamic Thumbnail Ambient Theme and Classic Dark"
        >
          <Palette className={`w-3.5 h-3.5 ${themeMode === 'dynamic' ? 'animate-pulse' : 'text-neutral-400'}`} style={themeMode === 'dynamic' ? { color: 'var(--theme-primary, #a855f7)' } : {}} />
          <span className="hidden md:inline">{themeMode === 'dynamic' ? 'Dynamic Theme' : 'Normal Theme'}</span>
        </button>
      </div>
    </header>
  );
};

