/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CATALOG } from './data/defaultCatalog';
import { Track, Playlist, Artist, NavigationTab, DynamicThemeColors } from './types';
import { audioEngine } from './services/audioEngine';
import { LeftSidebar } from './components/LeftSidebar';
import { TopNavbar } from './components/TopNavbar';
import { HomeDashboard } from './components/HomeDashboard';
import { BottomPlayerBar } from './components/BottomPlayerBar';
import { RecentView } from './components/RecentView';
import { ArtistsView } from './components/ArtistsView';
import { PlaylistsView } from './components/PlaylistsView';
import { EqualizerModal } from './components/EqualizerModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { ImportModal } from './components/ImportModal';
import { extractDominantColor, applyThemeToCssVariables, DEFAULT_THEME } from './utils/colorExtractor';
import { fetchSimilarTracks } from './services/similarTracksService';
import { SOUND_SKULL_THUMBNAIL, LOCAL_IMPORT_THUMBNAIL } from './data/localImportCover';

const STORAGE_KEY_RECENTS = 'vitune_recent_tracks';
const STORAGE_KEY_PLAYLISTS = 'vitune_playlists';
const STORAGE_KEY_ARTISTS = 'vitune_artists';
const STORAGE_KEY_THEME_MODE = 'vitune_theme_mode';
const STORAGE_KEY_AUTO_QUEUE_SIMILAR = 'vitune_auto_queue_similar';
const STORAGE_KEY_AUTOPLAY_NEXT = 'vitune_autoplay_next';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_CATALOG.tracks);
  
  // Initialize Playlists from local storage or default catalog
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load playlists from storage', e);
    }
    return DEFAULT_CATALOG.playlists;
  });

  // Initialize Artists from local storage or default catalog
  const [artists, setArtists] = useState<Artist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ARTISTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load artists from storage', e);
    }
    return DEFAULT_CATALOG.artists;
  });

  // Queue state for Up Next and Play Next management
  const [queue, setQueue] = useState<Track[]>([]);

  // Autoplay next song toggle state (Queue & Continuous playback)
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTOPLAY_NEXT);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return true;
  });

  // Similar tracks queueing state
  const [isFetchingSimilar, setIsFetchingSimilar] = useState<boolean>(false);
  const [similarFeedbackMessage, setSimilarFeedbackMessage] = useState<string | null>(null);
  const [autoQueueSimilar, setAutoQueueSimilar] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTO_QUEUE_SIMILAR);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return true;
  });

  const [currentTrack, setCurrentTrack] = useState<Track | null>(DEFAULT_CATALOG.tracks[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Track to Add to Playlist Modal state
  const [trackToAdd, setTrackToAdd] = useState<Track | null>(null);

  // Import Modal state (Local One Piece + YouTube Link)
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importModalTab, setImportModalTab] = useState<'local' | 'youtube'>('local');

  // Dynamic Theme state (Defaulting to 'dynamic' so thumbnail colors immediately adapt!)
  const [themeMode, setThemeMode] = useState<'normal' | 'dynamic'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME_MODE);
      if (saved === 'normal' || saved === 'dynamic') return saved;
    } catch (e) {
      // ignore
    }
    return 'dynamic';
  });

  const [themeColors, setThemeColors] = useState<DynamicThemeColors>(DEFAULT_THEME);

  // Initialize Recent Tracks from localStorage or pre-seeded catalog
  const [recentTracks, setRecentTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load recents from storage', e);
    }
    // Seed initial recents from catalog with timestamps
    return DEFAULT_CATALOG.tracks.slice(0, 6).map((t, idx) => ({
      ...t,
      playedAt: Date.now() - (idx * 1800000 + 300000),
      playCount: Math.max(1, 5 - idx),
    }));
  });

  // Save recents to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(recentTracks));
    } catch (e) {
      console.warn('Failed to save recents', e);
    }
  }, [recentTracks]);

  // Save playlists to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Failed to save playlists', e);
    }
  }, [playlists]);

  // Save artists to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(artists));
    } catch (e) {
      console.warn('Failed to save artists', e);
    }
  }, [artists]);

  // Save theme mode
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME_MODE, themeMode);
    } catch (e) {
      // ignore
    }
  }, [themeMode]);

  // Dynamic Theme Color Extraction Effect
  useEffect(() => {
    if (themeMode === 'normal') {
      applyThemeToCssVariables(DEFAULT_THEME);
      setThemeColors(DEFAULT_THEME);
      return;
    }

    if (currentTrack?.artworkUrl) {
      let isMounted = true;
      extractDominantColor(currentTrack.artworkUrl)
        .then((extractedTheme) => {
          if (isMounted) {
            setThemeColors(extractedTheme);
            applyThemeToCssVariables(extractedTheme);
          }
        })
        .catch((err) => {
          console.warn('Dynamic theme extraction error, falling back:', err);
          if (isMounted) {
            applyThemeToCssVariables(DEFAULT_THEME);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [currentTrack?.artworkUrl, themeMode]);

  // Auto-play selected track & record to Recent history
  const handleSelectTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    audioEngine.playTrack(track).catch(err => console.warn('playTrack error:', err));

    // Update Recent Listening History
    setRecentTracks((prev) => {
      const now = Date.now();
      const existingIdx = prev.findIndex((t) => t.id === track.id || (t.title === track.title && t.artist === track.artist));
      let currentPlayCount = 1;

      if (existingIdx !== -1) {
        currentPlayCount = (prev[existingIdx].playCount || 1) + 1;
      }

      const updatedTrack: Track = {
        ...track,
        playedAt: now,
        playCount: currentPlayCount,
      };

      const filtered = prev.filter((t) => t.id !== track.id && !(t.title === track.title && t.artist === track.artist));
      return [updatedTrack, ...filtered].slice(0, 50); // Keep top 50 recents
    });
  }, []);

  // Queue Actions
  const handleAddToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  // Play Next: Inserts track at the very top of the queue so it is played next
  const handlePlayNext = useCallback((track: Track) => {
    setQueue((prev) => [track, ...prev.filter((t) => t.id !== track.id)]);
  }, []);

  const handleQueueAll = useCallback((newTracks: Track[]) => {
    setQueue((prev) => {
      const existingIds = new Set(prev.map(t => t.id));
      const filteredNew = newTracks.filter(t => !existingIds.has(t.id));
      return [...prev, ...filteredNew];
    });
  }, []);

  // Play Next in Queue: Immediately plays the first track from queue, or regular next track
  const handlePlayNextInQueue = useCallback(() => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue((prev) => prev.slice(1));
      handleSelectTrack(nextTrack);
    } else if (currentTrack && tracks.length > 0) {
      const currentIdx = tracks.findIndex(t => t.id === currentTrack.id);
      const nextIdx = (currentIdx + 1) % tracks.length;
      handleSelectTrack(tracks[nextIdx]);
    }
  }, [queue, currentTrack, tracks, handleSelectTrack]);

  const handlePlayTrackFromQueue = useCallback((track: Track) => {
    setQueue((prev) => prev.filter((t) => t.id !== track.id));
    handleSelectTrack(track);
  }, [handleSelectTrack]);

  const handleRemoveFromQueue = useCallback((trackId: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  const handleClearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const handleReorderQueue = useCallback((fromIdx: number, toIdx: number) => {
    setQueue((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  }, []);

  // Add Similar Songs to Queue (Powered by Gemini AI recommendation & YouTube resolution)
  const handleAddSimilarToQueue = useCallback(async (seedTrack?: Track) => {
    const trackToUse = seedTrack || currentTrack;
    if (!trackToUse) return;

    setIsFetchingSimilar(true);
    setSimilarFeedbackMessage(`Finding songs matching "${trackToUse.title}"...`);

    try {
      const result = await fetchSimilarTracks(trackToUse, queue, 5);
      if (result.tracks && result.tracks.length > 0) {
        setQueue((prev) => {
          const existingIds = new Set([trackToUse.id, ...prev.map((t) => t.id)]);
          const toAdd = result.tracks.filter((t) => !existingIds.has(t.id));
          return [...prev, ...toAdd];
        });

        const addedCount = result.tracks.length;
        setSimilarFeedbackMessage(`✨ Added ${addedCount} similar ${addedCount === 1 ? 'song' : 'songs'} to Queue!`);
        setTimeout(() => setSimilarFeedbackMessage(null), 4000);
      } else {
        setSimilarFeedbackMessage('No similar tracks found right now.');
        setTimeout(() => setSimilarFeedbackMessage(null), 3000);
      }
    } catch (err) {
      console.warn('handleAddSimilarToQueue error:', err);
      setSimilarFeedbackMessage('Could not load similar tracks.');
      setTimeout(() => setSimilarFeedbackMessage(null), 3000);
    } finally {
      setIsFetchingSimilar(false);
    }
  }, [currentTrack, queue]);

  const handleToggleAutoQueueSimilar = useCallback(() => {
    setAutoQueueSimilar((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_AUTO_QUEUE_SIMILAR, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  const handleToggleAutoPlayNext = useCallback(() => {
    setAutoPlayNext((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_AUTOPLAY_NEXT, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  // Toggle play/pause
  const handlePlayPause = useCallback(() => {
    if (!currentTrack && tracks.length > 0) {
      handleSelectTrack(tracks[0]);
      return;
    }
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentTrack) {
        audioEngine.playTrack(currentTrack).catch(err => console.warn('playTrack error:', err));
      } else {
        audioEngine.play().catch(err => console.warn('play error:', err));
      }
    }
  }, [currentTrack, isPlaying, tracks, handleSelectTrack]);

  // Next track: Prioritizes queue if present, otherwise catalog
  const handleNextTrack = useCallback(() => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue((prev) => prev.slice(1));
      handleSelectTrack(nextTrack);
      return;
    }
    if (!currentTrack || tracks.length === 0) return;
    const currentIdx = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIdx = (currentIdx + 1) % tracks.length;
    handleSelectTrack(tracks[nextIdx]);
  }, [queue, currentTrack, tracks, handleSelectTrack]);

  const handlePrevTrack = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIdx = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIdx = (currentIdx - 1 + tracks.length) % tracks.length;
    handleSelectTrack(tracks[prevIdx]);
  }, [currentTrack, tracks, handleSelectTrack]);

  // Keyboard Shortcuts (Space, E, ArrowRight, ArrowLeft)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        setActiveTab('equalizer');
      } else if (e.code === 'ArrowRight' && e.shiftKey) {
        e.preventDefault();
        handleNextTrack();
      } else if (e.code === 'ArrowLeft' && e.shiftKey) {
        e.preventDefault();
        handlePrevTrack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Native Electron Hardware Media Keys Listener
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onMediaKey) {
      electronAPI.onMediaKey((command: string) => {
        if (command === 'play-pause') {
          handlePlayPause();
        } else if (command === 'next-track') {
          handleNextTrack();
        } else if (command === 'prev-track') {
          handlePrevTrack();
        }
      });
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleNextTrack, handlePrevTrack]);

  // Handle track ended & sync playback status
  useEffect(() => {
    audioEngine.setOnTrackEnded(() => {
      if (autoPlayNext) {
        handleNextTrack();
      } else {
        setIsPlaying(false);
      }
    });

    const unsubscribe = audioEngine.subscribe(() => {
      const paused = audioEngine.isPaused();
      setIsPlaying(!paused);
    });

    return () => {
      unsubscribe();
    };
  }, [handleNextTrack, autoPlayNext]);

  // Rate track handler
  const handleRateTrack = (trackId: string, rating: number) => {
    setTracks(prev =>
      prev.map(t => (t.id === trackId ? { ...t, rating } : t))
    );
    setRecentTracks(prev =>
      prev.map(t => (t.id === trackId ? { ...t, rating } : t))
    );
    if (currentTrack?.id === trackId) {
      setCurrentTrack(prev => (prev ? { ...prev, rating } : null));
    }
  };

  // Import local audio files (.mp3, .flac, .wav, .ogg) with the custom thumbnail artwork
  const handleImportLocalFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const parts = cleanName.split(' - ');
    const title = parts.length > 1 ? parts[1].trim() : cleanName;
    const artist = parts.length > 1 ? parts[0].trim() : 'Local Artist';

    const newTrack: Track = {
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      artist,
      album: 'Local Collection',
      duration: 210,
      artworkUrl: LOCAL_IMPORT_THUMBNAIL,
      audioUrl: objectUrl,
      genre: 'Local Audio',
      rating: 5,
      isLocal: true,
      file,
      source: 'Local'
    };

    setTracks(prev => [newTrack, ...prev]);
    handleSelectTrack(newTrack);
  };

  // Batch or single track importer (Local files or YouTube Link)
  const handleImportTracks = (newTracks: Track[], autoPlay = false) => {
    if (!newTracks || newTracks.length === 0) return;
    setTracks(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const filtered = newTracks.filter(t => !existingIds.has(t.id));
      return [...filtered, ...prev];
    });
    if (autoPlay && newTracks.length > 0) {
      handleSelectTrack(newTracks[0]);
    }
  };

  // Create custom playlist
  const handleCreatePlaylist = (title: string, subtitle: string, customCoverUrl?: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      subtitle: subtitle || 'Custom User Playlist',
      artworkUrl: customCoverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
      customArtworkUrl: customCoverUrl,
      trackCount: 0,
      rating: 5,
      tracks: [],
      isCustom: true,
    };
    setPlaylists(prev => [newPl, ...prev]);
    setActiveTab('playlists');
  };

  // Add / Remove track to/from playlist (Toggle)
  const handleTogglePlaylistTrack = (playlistId: string, track: Track) => {
    setPlaylists(prev =>
      prev.map(pl => {
        if (pl.id !== playlistId) return pl;
        const exists = (pl.tracks || []).some(t => t.id === track.id || (t.title === track.title && t.artist === track.artist));
        const updatedTracks = exists
          ? (pl.tracks || []).filter(t => t.id !== track.id && !(t.title === track.title && t.artist === track.artist))
          : [...(pl.tracks || []), track];
        
        return {
          ...pl,
          tracks: updatedTracks,
          trackCount: updatedTracks.length,
          artworkUrl: pl.customArtworkUrl || (updatedTracks.length > 0 ? updatedTracks[0].artworkUrl : pl.artworkUrl),
        };
      })
    );
  };

  // Create new playlist with track
  const handleCreatePlaylistAndAdd = (title: string, track: Track) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      subtitle: 'Custom Playlist',
      artworkUrl: track.artworkUrl,
      trackCount: 1,
      rating: 5,
      tracks: [track],
      isCustom: true,
    };
    setPlaylists(prev => [newPl, ...prev]);
  };

  // Reorder tracks inside a playlist (move up/down or drag and drop)
  const handleReorderPlaylistTracks = (playlistId: string, fromIndex: number, toIndex: number) => {
    setPlaylists(prev =>
      prev.map(pl => {
        if (pl.id !== playlistId || !pl.tracks) return pl;
        const newTracks = [...pl.tracks];
        if (fromIndex < 0 || fromIndex >= newTracks.length || toIndex < 0 || toIndex >= newTracks.length) {
          return pl;
        }
        const [movedTrack] = newTracks.splice(fromIndex, 1);
        newTracks.splice(toIndex, 0, movedTrack);
        return {
          ...pl,
          tracks: newTracks,
          artworkUrl: pl.customArtworkUrl || (newTracks.length > 0 ? newTracks[0].artworkUrl : pl.artworkUrl),
        };
      })
    );
  };

  // Update or clear custom artwork for a playlist
  const handleUpdatePlaylistCover = (playlistId: string, coverUrl: string | undefined) => {
    setPlaylists(prev =>
      prev.map(pl => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          customArtworkUrl: coverUrl,
          artworkUrl: coverUrl || (pl.tracks && pl.tracks.length > 0 ? pl.tracks[0].artworkUrl : pl.artworkUrl),
        };
      })
    );
  };

  // Remove track specifically from a playlist
  const handleRemoveTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev =>
      prev.map(pl => {
        if (pl.id !== playlistId) return pl;
        const updatedTracks = (pl.tracks || []).filter(t => t.id !== trackId);
        return {
          ...pl,
          tracks: updatedTracks,
          trackCount: updatedTracks.length,
          artworkUrl: pl.customArtworkUrl || (updatedTracks.length > 0 ? updatedTracks[0].artworkUrl : pl.artworkUrl),
        };
      })
    );
  };

  // Delete an entire playlist
  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
  };

  // Artist Customization Handlers
  const handleCreateArtist = (artistData: { name: string; genre: string; avatarUrl: string; bannerUrl?: string; bio?: string }) => {
    const newArtist: Artist = {
      id: `artist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: artistData.name,
      genre: artistData.genre,
      avatarUrl: artistData.avatarUrl,
      bannerUrl: artistData.bannerUrl,
      bio: artistData.bio,
      songCount: tracks.filter(t => t.artist.toLowerCase().includes(artistData.name.toLowerCase())).length,
      isFavorite: false,
      isCustom: true,
    };
    setArtists(prev => [newArtist, ...prev]);
  };

  const handleUpdateArtist = (updatedArtist: Artist) => {
    setArtists(prev => prev.map(a => a.id === updatedArtist.id ? updatedArtist : a));
  };

  const handleDeleteArtist = (artistId: string) => {
    setArtists(prev => prev.filter(a => a.id !== artistId));
  };

  // Recents management
  const handleRemoveFromRecent = (trackId: string) => {
    setRecentTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const handleClearRecent = () => {
    setRecentTracks([]);
    try {
      localStorage.removeItem(STORAGE_KEY_RECENTS);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div 
      className="flex flex-col h-screen text-white overflow-hidden select-none transition-colors duration-1000 relative"
      style={{
        backgroundColor: themeMode === 'dynamic' ? themeColors.bgDark : '#050505',
        backgroundImage: themeMode === 'dynamic' ? themeColors.gradient : undefined,
      }}
    >
      {/* Dynamic ambient glow meshes that respond to dominant artwork color */}
      {themeMode === 'dynamic' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div 
            className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full blur-[140px] opacity-35 transition-all duration-1000 animate-pulse"
            style={{ backgroundColor: themeColors.primary }}
          />
          <div 
            className="absolute top-1/3 -right-32 w-[36rem] h-[36rem] rounded-full blur-[160px] opacity-25 transition-all duration-1000 animate-pulse"
            style={{ backgroundColor: themeColors.accent }}
          />
          <div 
            className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] rounded-full blur-[140px] opacity-20 transition-all duration-1000"
            style={{ backgroundColor: themeColors.glow }}
          />
        </div>
      )}

      {/* Top Section: LeftSidebar + Main Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative z-10">
        {/* Left Sidebar (Equalizer button removed as requested) */}
        <LeftSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          playlists={playlists}
          onSelectPlaylist={() => setActiveTab('playlists')}
          onDeletePlaylist={handleDeletePlaylist}
        />

        {/* MAIN APPLICATION WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <TopNavbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSelectTrack={handleSelectTrack}
            onImportLocalFile={handleImportLocalFile}
            onOpenImportModal={(tab) => {
              setImportModalTab(tab || 'local');
              setIsImportModalOpen(true);
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddToPlaylist={(track) => setTrackToAdd(track)}
            onPlayNext={handlePlayNext}
            onAddToQueue={handleAddToQueue}
            onQueueAll={handleQueueAll}
            themeMode={themeMode}
            onToggleTheme={() => setThemeMode(prev => prev === 'normal' ? 'dynamic' : 'normal')}
          />

          {/* ACTIVE CONTENT VIEW */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            {activeTab === 'home' && (
              <HomeDashboard
                tracks={tracks}
                recentTracks={recentTracks}
                playlists={playlists}
                artists={artists}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onSelectTrack={handleSelectTrack}
                onSelectPlaylist={(pl) => {
                  if (pl.tracks && pl.tracks.length > 0) {
                    handleSelectTrack(pl.tracks[0]);
                  }
                  setActiveTab('playlists');
                }}
                onSelectArtist={() => setActiveTab('artists')}
                onRateTrack={handleRateTrack}
                onAddToPlaylist={(t) => setTrackToAdd(t)}
                setActiveTab={setActiveTab}
                onOpenNewPlaylistModal={() => setActiveTab('playlists')}
                onPlayNext={handlePlayNext}
                onAddToQueue={handleAddToQueue}
                onAddSimilarToQueue={handleAddSimilarToQueue}
                themeMode={themeMode}
                themeColors={themeColors}
              />
            )}

            {/* RECENT SECTION */}
            {(activeTab === 'recents' || activeTab === 'songs') && (
              <RecentView
                recentTracks={recentTracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onSelectTrack={handleSelectTrack}
                onRateTrack={handleRateTrack}
                onAddToPlaylist={(t) => setTrackToAdd(t)}
                onRemoveFromRecent={handleRemoveFromRecent}
                onClearRecent={handleClearRecent}
                onPlayNext={handlePlayNext}
                onAddToQueue={handleAddToQueue}
                onAddSimilarToQueue={handleAddSimilarToQueue}
              />
            )}

            {/* ARTISTS SECTION (With Rich Customization, Creation, Editing & Deletion) */}
            {activeTab === 'artists' && (
              <ArtistsView
                artists={artists}
                tracks={tracks}
                onSelectArtist={() => {}}
                onSelectTrack={handleSelectTrack}
                onCreateArtist={handleCreateArtist}
                onUpdateArtist={handleUpdateArtist}
                onDeleteArtist={handleDeleteArtist}
                onAddToPlaylist={(t) => setTrackToAdd(t)}
                onAddToQueue={handleAddToQueue}
                onPlayNext={handlePlayNext}
              />
            )}

            {activeTab === 'playlists' && (
              <PlaylistsView
                playlists={playlists}
                onSelectPlaylist={() => {}}
                onSelectTrack={handleSelectTrack}
                onCreatePlaylist={handleCreatePlaylist}
                onAddToPlaylist={(t) => setTrackToAdd(t)}
                onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onReorderPlaylistTracks={handleReorderPlaylistTracks}
                onUpdatePlaylistCover={handleUpdatePlaylistCover}
                onPlayNext={handlePlayNext}
                onAddToQueue={handleAddToQueue}
              />
            )}

            {activeTab === 'equalizer' && (
              <EqualizerModal onClose={() => setActiveTab('home')} />
            )}
          </main>
        </div>
      </div>

      {/* BOTTOM PLAYER BAR WITH PLAY NEXT IN QUEUE ON LEFT OF VOLUME CONTROL */}
      <BottomPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        onRateTrack={handleRateTrack}
        onOpenEQ={() => setActiveTab('equalizer')}
        onAddToPlaylist={(t) => setTrackToAdd(t)}
        queue={queue}
        upcomingTracks={tracks.filter(t => t.id !== currentTrack?.id)}
        onPlayTrackFromQueue={handlePlayTrackFromQueue}
        onPlayNextInQueue={handlePlayNextInQueue}
        onAddToQueue={handleAddToQueue}
        onPlayNext={handlePlayNext}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
        onReorderQueue={handleReorderQueue}
        onAddSimilarToQueue={handleAddSimilarToQueue}
        isFetchingSimilar={isFetchingSimilar}
        autoQueueSimilar={autoQueueSimilar}
        onToggleAutoQueueSimilar={handleToggleAutoQueueSimilar}
        autoPlayNext={autoPlayNext}
        onToggleAutoPlayNext={handleToggleAutoPlayNext}
        similarFeedbackMessage={similarFeedbackMessage}
      />

      {/* ADD TO PLAYLIST MODAL */}
      {trackToAdd && (
        <AddToPlaylistModal
          track={trackToAdd}
          playlists={playlists}
          onClose={() => setTrackToAdd(null)}
          onTogglePlaylistTrack={handleTogglePlaylistTrack}
          onCreatePlaylistAndAdd={handleCreatePlaylistAndAdd}
        />
      )}

      {/* IMPORT MODAL (Local One Piece Anime Art + YouTube Video Link) */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        initialTab={importModalTab}
        onImportTracks={handleImportTracks}
      />
    </div>
  );
}
