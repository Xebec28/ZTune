/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Sliders,
  Tv,
  ChevronDown,
  ExternalLink,
  Plus,
  ListMusic,
  ListOrdered,
  X,
  Trash2,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Music,
  Sparkles,
  Infinity
} from 'lucide-react';
import { Track } from '../types';
import { audioEngine, RepeatMode } from '../services/audioEngine';

interface BottomPlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRateTrack?: (trackId: string, rating: number) => void;
  onOpenEQ: () => void;
  onAddToPlaylist?: (track: Track) => void;
  queue?: Track[];
  upcomingTracks?: Track[];
  onPlayTrackFromQueue?: (track: Track) => void;
  onPlayNextInQueue?: () => void;
  onAddToQueue?: (track: Track) => void;
  onPlayNext?: (track: Track) => void;
  onRemoveFromQueue?: (trackId: string) => void;
  onClearQueue?: () => void;
  onReorderQueue?: (from: number, to: number) => void;
  onAddSimilarToQueue?: (track?: Track) => Promise<void> | void;
  isFetchingSimilar?: boolean;
  autoQueueSimilar?: boolean;
  onToggleAutoQueueSimilar?: () => void;
  autoPlayNext?: boolean;
  onToggleAutoPlayNext?: () => void;
  similarFeedbackMessage?: string | null;
}

export const BottomPlayerBar: React.FC<BottomPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onRateTrack,
  onOpenEQ,
  onAddToPlaylist,
  queue = [],
  upcomingTracks = [],
  onPlayTrackFromQueue,
  onPlayNextInQueue,
  onAddToQueue,
  onPlayNext,
  onRemoveFromQueue,
  onClearQueue,
  onReorderQueue,
  onAddSimilarToQueue,
  isFetchingSimilar = false,
  autoQueueSimilar = true,
  onToggleAutoQueueSimilar,
  autoPlayNext = true,
  onToggleAutoPlayNext,
  similarFeedbackMessage,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [showQueuePopover, setShowQueuePopover] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Initialize YouTube player element on mount
  useEffect(() => {
    audioEngine.initYouTubePlayer();
  }, []);

  // Sync with audioEngine time & duration
  useEffect(() => {
    let animationId: number;

    const updateLoop = () => {
      if (!isScrubbing) {
        const c = audioEngine.getCurrentTime();
        setCurrentTime(c);
      }
      
      const d = audioEngine.getDuration();
      if (d > 0 && !isNaN(d)) {
        setDuration(d);
      } else if (currentTrack?.duration) {
        setDuration(currentTrack.duration);
      }

      animationId = requestAnimationFrame(updateLoop);
    };

    animationId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, currentTrack, isScrubbing]);

  // Click outside to close queue popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowQueuePopover(false);
      }
    };
    if (showQueuePopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQueuePopover]);

  const handleSeek = (targetTime: number) => {
    audioEngine.seek(targetTime);
    setCurrentTime(targetTime);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.85);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIdx]);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      <footer className="relative z-40 h-24 bg-[#0A0A0A] border-t border-white/5 px-8 flex items-center justify-between backdrop-blur-2xl">
        {/* LEFT: Currently Playing Track Details */}
        <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
          {currentTrack ? (
            <>
              <div className="relative w-14 h-14 rounded-xl overflow-hidden glass-panel shrink-0 group shadow-md">
                <img
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">{currentTrack.title}</p>
                  <span 
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                    style={{ 
                      backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.2))',
                      color: 'var(--theme-light-accent, #c7d2fe)'
                    }}
                  >
                    {currentTrack.genre || 'Music'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{currentTrack.artist}</p>
              </div>

              {/* Add to Playlist button */}
              {onAddToPlaylist && (
                <button
                  onClick={() => onAddToPlaylist(currentTrack)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  title="Add to Playlist"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 text-neutral-500 text-sm font-medium">
              <div className="w-14 h-14 rounded-xl glass-panel flex items-center justify-center">
                <span className="text-lg">🎵</span>
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-400">No Track Selected</p>
                <p className="text-xs text-neutral-600">Select a song to start listening</p>
              </div>
            </div>
          )}
        </div>

        {/* CENTER: Playback Controls + Progress Bar */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-6">
          {/* Playback Buttons */}
          <div className="flex items-center gap-6 mb-2">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-1.5 rounded-lg transition-colors ${
                isShuffle ? 'text-indigo-400' : 'text-neutral-400 hover:text-white'
              }`}
              style={{ color: isShuffle ? 'var(--theme-primary, #6366f1)' : undefined }}
              title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrev}
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-all active:scale-95"
              title="Previous Track (Shift+Left)"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Main Play/Pause Button */}
            <button
              onClick={onPlayPause}
              className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: 'var(--theme-primary, #6366f1)',
                boxShadow: '0 4px 20px var(--theme-glow, rgba(99,102,241,0.5))'
              }}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-all active:scale-95"
              title="Next Track (Shift+Right)"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className="relative p-2 rounded-xl transition-all flex items-center justify-center bg-transparent border-0 shadow-none active:scale-95 text-neutral-400 hover:text-white"
              style={{
                color: repeatMode !== 'off' ? 'var(--theme-primary, #6366f1)' : undefined,
                backgroundColor: 'transparent',
                boxShadow: 'none',
              }}
              title={
                repeatMode === 'off'
                  ? 'Loop: Off (Click to enable Infinite Loop)'
                  : repeatMode === 'all'
                  ? 'Loop: Infinite All (Click for Repeat 1)'
                  : 'Loop: Repeat Current 1 (Click to turn off)'
              }
            >
              <Infinity 
                className="w-4 h-4 transition-transform duration-200" 
                style={{ 
                  fill: repeatMode !== 'off' ? 'var(--theme-primary, #6366f1)' : 'none',
                  color: repeatMode !== 'off' ? 'var(--theme-primary, #6366f1)' : 'currentColor',
                  stroke: repeatMode !== 'off' ? 'var(--theme-primary, #6366f1)' : 'currentColor',
                }} 
              />
            </button>
          </div>

          {/* Scrubber / Timeline Bar */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-neutral-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div
              className="relative flex-1 h-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer group transition-all"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, clickX / rect.width));
                handleSeek(pct * (duration || 210));
              }}
            >
              {/* Dynamic Theme Color Filled Progress Track */}
              <div
                className="h-full rounded-full transition-all duration-75 relative"
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--theme-primary, #6366f1)',
                  boxShadow: '0 0 10px var(--theme-glow, rgba(99,102,241,0.6))'
                }}
              >
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    boxShadow: '0 0 6px rgba(0,0,0,0.5)'
                  }}
                />
              </div>
            </div>

            <span className="text-[11px] font-mono text-neutral-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* RIGHT: Video/Iframe, EQ, Similar Songs, and Queue/Play Next */}
        <div className="flex items-center justify-end gap-2.5 w-1/4 relative">
          {/* Toggle YouTube Video / Iframe View */}
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold bg-transparent border-0 shadow-none hover:text-white active:scale-95 text-neutral-400"
            style={{
              color: showVideo ? 'var(--theme-primary, #6366f1)' : undefined,
              backgroundColor: 'transparent',
              boxShadow: 'none',
            }}
            title="Toggle YouTube Video Iframe Player"
          >
            <Tv 
              className="w-4 h-4" 
              style={{ color: showVideo ? 'var(--theme-primary, #6366f1)' : 'currentColor' }} 
            />
            <span className="hidden lg:inline">{showVideo ? 'Hide MV' : 'Video'}</span>
          </button>

          {/* Equalizer Quick Button */}
          <button
            onClick={onOpenEQ}
            className="p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold bg-transparent border-0 shadow-none hover:text-white active:scale-95 text-neutral-400"
            style={{
              backgroundColor: 'transparent',
              boxShadow: 'none',
            }}
            title="Open 10-Band Equalizer (E)"
          >
            <Sliders 
              className="w-4 h-4" 
              style={{ color: 'var(--theme-primary, #6366f1)' }} 
            />
            <span className="hidden lg:inline">EQ</span>
          </button>

          {/* QUICK ACTION: SIMILAR SONGS TO QUEUE */}
          {currentTrack && onAddSimilarToQueue && (
            <button
              onClick={() => onAddSimilarToQueue(currentTrack)}
              disabled={isFetchingSimilar}
              className="p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold bg-transparent border-0 shadow-none hover:text-white active:scale-95 disabled:opacity-50 text-neutral-400"
              style={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
              }}
              title={`Add similar songs to queue based on "${currentTrack.title}" by ${currentTrack.artist}`}
            >
              <Sparkles 
                className={`w-3.5 h-3.5 ${isFetchingSimilar ? 'animate-spin' : ''}`} 
                style={{ color: 'var(--theme-primary, #6366f1)' }} 
              />
              <span className="hidden 2xl:inline">
                {isFetchingSimilar ? 'Finding...' : 'Similar'}
              </span>
            </button>
          )}

          {/* PLAY NEXT IN QUEUE / QUEUE POPOVER TRIGGER */}
          <div className="relative">
            <button
              onClick={() => setShowQueuePopover(!showQueuePopover)}
              className="p-2 rounded-xl transition-all flex items-center gap-2 text-xs font-semibold bg-transparent border-0 shadow-none hover:text-white active:scale-95 text-neutral-400"
              style={{
                color: showQueuePopover || queue.length > 0 ? 'var(--theme-primary, #6366f1)' : undefined,
                backgroundColor: 'transparent',
                boxShadow: 'none',
              }}
              title="Play Next in Queue / Up Next"
            >
              <ListOrdered 
                className="w-4 h-4" 
                style={{ color: showQueuePopover || queue.length > 0 ? 'var(--theme-primary, #6366f1)' : 'currentColor' }} 
              />
              <span className="hidden xl:inline">Play Next</span>
              {queue.length > 0 && (
                <span 
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-black text-white shadow-sm"
                  style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
                >
                  {queue.length}
                </span>
              )}
            </button>

            {/* QUEUE & PLAY NEXT POPOVER DRAWER (Fully responsive across mobile & desktop) */}
            {showQueuePopover && (
              <div 
                ref={popoverRef}
                className="fixed sm:absolute bottom-24 sm:bottom-14 right-2 sm:right-0 w-[calc(100vw-1rem)] sm:w-96 max-w-[420px] max-h-[75vh] sm:max-h-[520px] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl shadow-black/90 border border-white/15 bg-[#141418]/95 backdrop-blur-xl z-50 flex flex-col space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <ListOrdered 
                      className="w-4 h-4" 
                      style={{ color: 'var(--theme-primary, #6366f1)' }} 
                    />
                    <h4 className="text-sm font-bold text-white">Play Next & Queue</h4>
                    {queue.length > 0 && (
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.2))',
                          borderColor: 'var(--theme-border, rgba(99,102,241,0.4))',
                          color: 'var(--theme-light-accent, #c7d2fe)'
                        }}
                      >
                        {queue.length} queued
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {queue.length > 0 && onClearQueue && (
                      <button
                        onClick={onClearQueue}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Clear entire queue"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => setShowQueuePopover(false)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Action: Play Next Track in Queue Button */}
                {queue.length > 0 && onPlayNextInQueue && (
                  <button
                    onClick={() => {
                      onPlayNextInQueue();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-white text-xs font-bold shadow-lg transition-all"
                    style={{ 
                      backgroundColor: 'var(--theme-primary, #6366f1)',
                      boxShadow: '0 4px 15px var(--theme-glow, rgba(99,102,241,0.35))'
                    }}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Next Track in Queue ({queue[0]?.title})</span>
                  </button>
                )}

                {/* Popover Body List */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar max-h-[350px]">
                  {/* Next Song Autoplay Toggle Bar */}
                  {onToggleAutoPlayNext && (
                    <div 
                      className="flex items-center justify-between p-2.5 rounded-2xl border transition-all select-none"
                      style={{
                        backgroundColor: autoPlayNext ? 'var(--theme-subtle, rgba(99,102,241,0.12))' : 'rgba(255,255,255,0.03)',
                        borderColor: autoPlayNext ? 'var(--theme-border, rgba(99,102,241,0.3))' : 'rgba(255,255,255,0.08)'
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${autoPlayNext ? 'animate-pulse' : ''}`}
                          style={{ backgroundColor: autoPlayNext ? 'var(--theme-primary, #6366f1)' : '#737373' }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-white leading-tight">Next Song Autoplay</p>
                            <span 
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider text-white"
                              style={{
                                backgroundColor: autoPlayNext ? 'var(--theme-primary, #6366f1)' : '#404040',
                              }}
                            >
                              {autoPlayNext ? 'ON' : 'OFF'}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {autoPlayNext 
                              ? 'Automatically plays next song in queue when current track ends' 
                              : 'Stops playback after current track ends'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleAutoPlayNext}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ml-2 ${
                          autoPlayNext ? 'bg-indigo-600' : 'bg-neutral-700'
                        }`}
                        style={autoPlayNext ? { backgroundColor: 'var(--theme-primary, #6366f1)' } : {}}
                        title={autoPlayNext ? 'Next Song Autoplay is ON (Click to turn off)' : 'Next Song Autoplay is OFF (Click to turn on)'}
                        aria-label="Toggle next song auto play in queue"
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            autoPlayNext ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Currently Playing Track & Similar Songs Trigger */}
                  {currentTrack && (
                    <div className="space-y-2">
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider block"
                        style={{ color: 'var(--theme-light-accent, #c7d2fe)' }}
                      >
                        Now Playing
                      </span>
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
                        <img 
                          src={currentTrack.artworkUrl} 
                          alt={currentTrack.title} 
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{currentTrack.artist}</p>
                        </div>
                        <div 
                          className="w-2 h-2 rounded-full animate-pulse shrink-0"
                          style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
                        />
                      </div>

                      {/* ADD SIMILAR SONGS ACTION PANEL */}
                      {onAddSimilarToQueue && (
                        <div 
                          className="p-2.5 rounded-2xl border space-y-2"
                          style={{
                            backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.12))',
                            borderColor: 'var(--theme-border, rgba(99,102,241,0.3))'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Sparkles 
                                className="w-3.5 h-3.5 animate-pulse" 
                                style={{ color: 'var(--theme-primary, #6366f1)' }}
                              />
                              <span 
                                className="text-[11px] font-bold"
                                style={{ color: 'var(--theme-light-accent, #c7d2fe)' }}
                              >
                                Match Similar Vibe
                              </span>
                            </div>
                            {onToggleAutoQueueSimilar && (
                              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-neutral-400 hover:text-white select-none">
                                <span>Autoplay</span>
                                <input
                                  type="checkbox"
                                  checked={autoQueueSimilar}
                                  onChange={onToggleAutoQueueSimilar}
                                  className="w-3 h-3 rounded cursor-pointer"
                                  style={{ accentColor: 'var(--theme-primary, #6366f1)' }}
                                />
                              </label>
                            )}
                          </div>

                          <button
                            onClick={() => onAddSimilarToQueue(currentTrack)}
                            disabled={isFetchingSimilar}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-98 disabled:opacity-50 border"
                            style={{
                              backgroundColor: 'var(--theme-primary, #6366f1)',
                              borderColor: 'var(--theme-border, rgba(99,102,241,0.4))',
                              boxShadow: '0 2px 10px var(--theme-glow, rgba(99,102,241,0.3))'
                            }}
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isFetchingSimilar ? 'animate-spin' : ''}`} />
                            <span>
                              {isFetchingSimilar
                                ? 'Finding similar songs...'
                                : `Add Similar Songs to Queue`}
                            </span>
                          </button>

                          {similarFeedbackMessage && (
                            <div className="text-[10px] text-center font-medium text-emerald-300 bg-emerald-500/10 py-1 px-2 rounded-lg border border-emerald-500/20 animate-in fade-in">
                              ✨ {similarFeedbackMessage}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Queued Songs (Up Next) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Next in Queue ({queue.length})
                      </span>
                      {onToggleAutoPlayNext && (
                        <button 
                          onClick={onToggleAutoPlayNext}
                          className="text-[10px] flex items-center gap-1 font-medium hover:underline text-neutral-400 hover:text-white transition-colors"
                          title="Toggle Next Song Autoplay"
                        >
                          <span>Autoplay:</span>
                          <span 
                            className="font-bold"
                            style={{ color: autoPlayNext ? 'var(--theme-light-accent, #c7d2fe)' : '#9ca3af' }}
                          >
                            {autoPlayNext ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      )}
                    </div>

                    {queue.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-neutral-500">
                        Queue is empty. Click <span className="text-indigo-300 font-semibold">"Play Next"</span> on any track in your library to queue it here.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {queue.map((track, idx) => (
                          <div 
                            key={`${track.id}-${idx}`}
                            className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                          >
                            <div 
                              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                              onClick={() => onPlayTrackFromQueue && onPlayTrackFromQueue(track)}
                            >
                              <span className="text-[11px] font-mono text-neutral-500 w-4 text-center">
                                {idx + 1}
                              </span>
                              <img 
                                src={track.artworkUrl} 
                                alt={track.title} 
                                className="w-8 h-8 rounded-md object-cover bg-neutral-800 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white group-hover:text-indigo-300 truncate">
                                  {track.title}
                                </p>
                                <p className="text-[10px] text-neutral-400 truncate">{track.artist}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              {/* Move Up */}
                              {idx > 0 && onReorderQueue && (
                                <button
                                  onClick={() => onReorderQueue(idx, idx - 1)}
                                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                              )}

                              {/* Move Down */}
                              {idx < queue.length - 1 && onReorderQueue && (
                                <button
                                  onClick={() => onReorderQueue(idx, idx + 1)}
                                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              )}

                              {/* Remove from Queue */}
                              {onRemoveFromQueue && (
                                <button
                                  onClick={() => onRemoveFromQueue(track.id)}
                                  className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Remove from queue"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upcoming from Catalog / Playlist */}
                  {upcomingTracks.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                        Suggested Up Next
                      </span>
                      <div className="space-y-1">
                        {upcomingTracks.slice(0, 4).map((track, idx) => (
                          <div 
                            key={`upcoming-${track.id}-${idx}`}
                            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <img src={track.artworkUrl} alt={track.title} className="w-7 h-7 rounded object-cover shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-white truncate text-[11px]">{track.title}</p>
                                <p className="text-[10px] text-neutral-400 truncate">{track.artist}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {onPlayNext && (
                                <button
                                  onClick={() => onPlayNext(track)}
                                  className="px-2 py-1 rounded bg-white/5 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-semibold transition-colors"
                                  title="Play immediately next"
                                >
                                  Play Next
                                </button>
                              )}

                              {onAddToQueue && (
                                <button
                                  onClick={() => onAddToQueue(track)}
                                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10"
                                  title="Add to queue"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Volume slider (to the right of play next in queue) */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-neutral-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        </div>
      </footer>

      {/* PERSISTENT YOUTUBE ENGINE CONTAINER (Responsive floating window) */}
      <div
        className={`fixed rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/20 transition-all duration-300 w-[calc(100vw-1.5rem)] sm:w-96 md:w-[420px] max-w-[440px] h-56 sm:h-64 ${
          showVideo
            ? 'bottom-24 sm:bottom-28 right-3 sm:right-6 opacity-100 pointer-events-auto z-50'
            : '-top-[9999px] -left-[9999px] opacity-0 pointer-events-none -z-50'
        }`}
      >
        {/* Floating Header Bar */}
        <div className="h-9 bg-neutral-900/95 px-3 flex items-center justify-between border-b border-white/10 text-xs">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Tv className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-white font-semibold truncate text-[11px]">
              {currentTrack?.title ? `${currentTrack.artist} - ${currentTrack.title}` : 'YouTube Music'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentTrack?.youtubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-neutral-400 hover:text-white transition-colors"
                title="Open on YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => setShowVideo(false)}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
              title="Minimize Video"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The YouTube IFrame API Target Element */}
        <div className="w-full h-[calc(100%-36px)] bg-black relative">
          <div id="vitune-yt-player-dock" className="w-full h-full" />
        </div>
      </div>
    </>
  );
};
