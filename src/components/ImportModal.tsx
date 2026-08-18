/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Play, 
  Plus, 
  Check, 
  Loader2, 
  Music, 
  Sparkles, 
  Film,
  AlertCircle,
  FolderOpen,
  Headphones
} from 'lucide-react';
import { Track } from '../types';
import { SOUND_SKULL_THUMBNAIL, LOCAL_IMPORT_THUMBNAIL } from '../data/localImportCover';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'local' | 'youtube';
  onImportTracks: (tracks: Track[], autoPlay?: boolean) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'local',
  onImportTracks,
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'youtube'>(initialTab);
  
  // Local File State
  const [localPendingFiles, setLocalPendingFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // YouTube Link State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isResolvingYt, setIsResolvingYt] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const [resolvedTrack, setResolvedTrack] = useState<Track | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Reset tab when modal opens with new initialTab
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setYtError(null);
      setImportSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Process Local Files
  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => 
      f.type.startsWith('audio/') || 
      /\.(mp3|wav|flac|ogg|m4a|aac|wma)$/i.test(f.name)
    );

    if (fileArray.length === 0) return;
    setLocalPendingFiles(prev => [...prev, ...fileArray]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFinalizeLocalImport = (autoPlay = false) => {
    if (localPendingFiles.length === 0) return;

    const newTracks: Track[] = localPendingFiles.map((file, idx) => {
      const objectUrl = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const parts = cleanName.split(' - ');
      const title = parts.length > 1 ? parts[1].trim() : cleanName;
      const artist = parts.length > 1 ? parts[0].trim() : 'Local Artist';

      return {
        id: `local-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        artist,
        album: 'ZTune Local Collection',
        duration: 210,
        artworkUrl: SOUND_SKULL_THUMBNAIL,
        audioUrl: objectUrl,
        genre: 'Local Audio',
        rating: 5,
        isLocal: true,
        file,
        source: 'Local'
      };
    });

    onImportTracks(newTracks, autoPlay);
    setLocalPendingFiles([]);
    onClose();
  };

  // YouTube Link Resolution
  const handleResolveYoutubeUrl = async (urlToResolve = youtubeUrl) => {
    const trimmed = urlToResolve.trim();
    if (!trimmed) {
      setYtError('Please enter a YouTube video URL or ID');
      return;
    }

    setIsResolvingYt(true);
    setYtError(null);
    setResolvedTrack(null);

    try {
      const res = await fetch('/api/youtube/resolve-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.track) {
        throw new Error(data.error || 'Failed to resolve YouTube video information');
      }

      setResolvedTrack(data.track);
    } catch (err: any) {
      console.error('YouTube resolve error:', err);
      setYtError(err.message || 'Could not fetch video. Check URL and try again.');
    } finally {
      setIsResolvingYt(false);
    }
  };

  const handleFinalizeYoutubeImport = (autoPlay = false) => {
    if (!resolvedTrack) return;
    onImportTracks([resolvedTrack], autoPlay);
    setImportSuccessMsg(`Imported "${resolvedTrack.title}"!`);
    setTimeout(() => {
      onClose();
      setResolvedTrack(null);
      setYoutubeUrl('');
      setImportSuccessMsg(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-xl bg-[#111116] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 40px var(--theme-glow, rgba(99,102,241,0.15))'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
            >
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Import Music</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                  ZTune Desktop
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Import local audio files with official Sound Skull artwork or stream from YouTube
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-neutral-900/50 p-1.5 gap-2">
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'local'
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-indigo-400" />
            <span>Local Audio Files</span>
          </button>

          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'youtube'
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-rose-400" />
            <span>YouTube Video Link</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {activeTab === 'local' && (
            <div className="space-y-5">
              {/* Sound Skull Official Thumbnail Banner */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/60 border border-white/15 shadow-inner">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/20 shadow-xl shrink-0 bg-black flex items-center justify-center">
                  <img
                    src={SOUND_SKULL_THUMBNAIL}
                    alt="ZTune Sound Skull Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Auto-Assigned Thumbnail
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 font-semibold mt-0.5 truncate">
                    Iconic Sound Skull Logo (Headphones Edition)
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    All imported local audio files automatically receive this high-contrast cover art
                  </p>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files) handleFilesAdded(e.target.files);
                }}
                accept="audio/*,.mp3,.flac,.wav,.ogg,.m4a,.aac"
                multiple
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                    : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 border border-white/10 flex items-center justify-center text-indigo-400 mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Click to select or drag & drop audio files
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Supports MP3, FLAC, WAV, AAC, M4A & OGG. Tracks will instantly play and display the Sound Skull logo cover.
                </p>
              </div>

              {/* Pending Local Files Queue */}
              {localPendingFiles.length > 0 && (
                <div className="space-y-3 bg-black/30 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                    <span>Ready to Import ({localPendingFiles.length} {localPendingFiles.length === 1 ? 'file' : 'files'})</span>
                    <button
                      onClick={() => setLocalPendingFiles([])}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {localPendingFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 text-xs"
                      >
                        <img
                          src={SOUND_SKULL_THUMBNAIL}
                          alt="Thumbnail"
                          className="w-10 h-10 rounded-lg object-cover border border-white/15 shrink-0 bg-black"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{file.name}</p>
                          <p className="text-[11px] text-neutral-400">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB • Audio Track
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocalPendingFiles(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleFinalizeLocalImport(false)}
                      className="px-4 py-2 rounded-full glass-panel hover:bg-white/15 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Library</span>
                    </button>
                    <button
                      onClick={() => handleFinalizeLocalImport(true)}
                      className="px-5 py-2 rounded-full text-xs font-bold text-white transition-all shadow-lg flex items-center gap-1.5"
                      style={{ backgroundColor: 'var(--theme-primary, #6366f1)' }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Import & Play Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'youtube' && (
            <div className="space-y-6">
              {/* YouTube Link Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-rose-400" />
                  <span>YouTube Video or Music URL</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => {
                        setYoutubeUrl(e.target.value);
                        if (ytError) setYtError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleResolveYoutubeUrl();
                      }}
                      placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                      className="w-full h-10 pl-10 pr-4 text-xs glass-panel rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/50 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => handleResolveYoutubeUrl()}
                    disabled={isResolvingYt || !youtubeUrl.trim()}
                    className="h-10 px-4 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shrink-0"
                  >
                    {isResolvingYt ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Resolving...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Fetch Track</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Paste any video from YouTube, YouTube Music, or Shorts. ZTune Desktop extracts track audio and artwork directly.
                </p>
              </div>

              {/* Error Message */}
              {ytError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ytError}</span>
                </div>
              )}

              {/* Success Message */}
              {importSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {/* Resolved Track Preview Card */}
              {resolvedTrack && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/20 shadow-lg shrink-0 group">
                      <img
                        src={resolvedTrack.artworkUrl}
                        alt={resolvedTrack.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                        YouTube Music Verified
                      </span>
                      <h4 className="text-sm font-bold text-white truncate mt-0.5">
                        {resolvedTrack.title}
                      </h4>
                      <p className="text-xs text-neutral-400 truncate">
                        {resolvedTrack.artist}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-500 font-medium">
                        <span>Duration: {Math.floor(resolvedTrack.duration / 60)}:{(resolvedTrack.duration % 60).toString().padStart(2, '0')}</span>
                        <span>•</span>
                        <span>Video ID: {resolvedTrack.youtubeId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleFinalizeYoutubeImport(false)}
                      className="px-4 py-2 rounded-full glass-panel hover:bg-white/15 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Library</span>
                    </button>
                    <button
                      onClick={() => handleFinalizeYoutubeImport(true)}
                      className="px-5 py-2 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-lg flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Import & Play Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
