/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track, EQSettings } from '../types';

export type RepeatMode = 'off' | 'all' | 'one';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

class AudioEngineService {
  private audio: HTMLAudioElement;
  private currentTrack: Track | null = null;
  private listeners: Set<() => void> = new Set();
  private onTrackEndedCallback: (() => void) | null = null;
  private volume = 0.85;
  private activeEngine: 'youtube' | 'html5' = 'youtube';
  private currentCandidateIndex = 0;
  private triedVideoIds = new Set<string>();

  // YouTube IFrame Player
  private ytPlayer: any = null;
  private isYtReady = false;
  private isYtScriptLoaded = false;
  private ytPlayerState = -1; // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering
  private pendingVideoId: string | null = null;
  private pendingPlay = false;
  private progressTimer: any = null;
  private playbackWatchdogTimer: any = null;

  constructor() {
    this.audio = new Audio();
    this.audio.volume = this.volume;
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('play', () => this.notifyListeners());
    this.audio.addEventListener('pause', () => this.notifyListeners());
    this.audio.addEventListener('timeupdate', () => this.notifyListeners());

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.currentTrack && this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0) {
        this.currentTrack.duration = Math.round(this.audio.duration);
      }
      this.notifyListeners();
    });

    this.audio.addEventListener('ended', () => {
      if (this.activeEngine === 'html5') {
        this.handleTrackEnded();
      }
    });

    // Start loading YouTube IFrame API script early
    this.initYouTubeScript();
  }

  private startProgressTimer(): void {
    this.stopProgressTimer();
    this.progressTimer = setInterval(() => {
      if (this.activeEngine === 'youtube' && !this.isPaused()) {
        this.notifyListeners();
      }
    }, 250);
  }

  private stopProgressTimer(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private startPlaybackWatchdog(expectedTrackId?: string): void {
    this.clearPlaybackWatchdog();
    this.playbackWatchdogTimer = setTimeout(() => {
      if (
        this.activeEngine === 'youtube' &&
        this.currentTrack &&
        (!expectedTrackId || this.currentTrack.id === expectedTrackId)
      ) {
        const currentTime = this.getCurrentTime();
        if (this.ytPlayerState !== 1 && this.ytPlayerState !== 3 && currentTime < 0.2) {
          console.warn('[ZTune Watchdog] YouTube playback restricted or unresponsive. Initiating auto-failover...');
          this.handleYouTubeError(150);
        }
      }
    }, 2500);
  }

  private clearPlaybackWatchdog(): void {
    if (this.playbackWatchdogTimer) {
      clearTimeout(this.playbackWatchdogTimer);
      this.playbackWatchdogTimer = null;
    }
  }

  private initYouTubeScript(): void {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      this.isYtScriptLoaded = true;
      this.initYouTubePlayer();
      return;
    }

    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      this.isYtScriptLoaded = true;
      this.initYouTubePlayer();
    };
  }

  public initYouTubePlayer(): void {
    if (typeof window === 'undefined' || !window.YT || !window.YT.Player) return;
    if (this.ytPlayer) return;

    const dock = document.getElementById('vitune-yt-player-dock');
    if (!dock) {
      // Retry in 100ms once DOM is ready
      setTimeout(() => this.initYouTubePlayer(), 100);
      return;
    }

    try {
      const pageOrigin = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file'))
        ? window.location.origin
        : 'http://localhost:3000';

      this.ytPlayer = new window.YT.Player('vitune-yt-player-dock', {
        height: '100%',
        width: '100%',
        host: 'https://www.youtube-nocookie.com',
        videoId: this.pendingVideoId || this.currentTrack?.youtubeId || 'JRWox-i6aAk',
        playerVars: {
          autoplay: 1,
          controls: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: pageOrigin,
          widget_referrer: pageOrigin,
          fs: 1,
          iv_load_policy: 3
        },
        events: {
          onReady: (event: any) => {
            this.isYtReady = true;
            try {
              event.target.setVolume(Math.round(this.volume * 100));
            } catch (e) {}

            if (this.pendingVideoId) {
              const vidToLoad = this.pendingVideoId;
              this.pendingVideoId = null;
              try {
                event.target.loadVideoById(vidToLoad);
              } catch (e) {}
            }

            if (this.pendingPlay) {
              try {
                event.target.playVideo();
              } catch (e) {}
              this.pendingPlay = false;
            }

            this.notifyListeners();
          },
          onStateChange: (event: any) => {
            this.ytPlayerState = event.data;
            if (event.data === 1) { // PLAYING
              this.clearPlaybackWatchdog();
              this.startProgressTimer();
            } else if (event.data === 3) { // BUFFERING
              this.clearPlaybackWatchdog();
            } else if (event.data === 2) { // PAUSED
              this.stopProgressTimer();
            } else if (event.data === 0) { // ENDED
              this.stopProgressTimer();
              this.handleTrackEnded();
            }
            this.notifyListeners();
          },
          onError: (event: any) => {
            console.warn('YouTube playback error code:', event?.data, 'Attempting auto-fallback...');
            this.stopProgressTimer();
            this.clearPlaybackWatchdog();
            this.handleYouTubeError(event?.data);
            this.notifyListeners();
          }
        }
      });
    } catch (e) {
      console.warn('Error creating YT.Player:', e);
    }
  }

  private async handleYouTubeError(errorCode: number): Promise<void> {
    if (!this.currentTrack) return;

    console.info(`[ZTune AudioEngine] Handled YouTube error ${errorCode} for: "${this.currentTrack.title}"`);

    // 1. Try alternate candidate video IDs attached to the track
    if (this.currentTrack.candidateIds && this.currentTrack.candidateIds.length > 0) {
      while (this.currentCandidateIndex < this.currentTrack.candidateIds.length - 1) {
        this.currentCandidateIndex++;
        const nextId = this.currentTrack.candidateIds[this.currentCandidateIndex];
        if (nextId && !this.triedVideoIds.has(nextId)) {
          this.triedVideoIds.add(nextId);
          this.currentTrack.youtubeId = nextId;
          console.info(`[ZTune AudioEngine] Switching to alternate candidate video: ${nextId}`);
          if (this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
            try {
              this.ytPlayer.loadVideoById(nextId);
              this.ytPlayer.playVideo();
              this.startPlaybackWatchdog(this.currentTrack.id);
              return;
            } catch (e) {}
          }
        }
      }
    }

    // 2. If candidates exhausted, query audio / lyrics / topic search on backend
    try {
      const q = encodeURIComponent(`${this.currentTrack.artist} ${this.currentTrack.title} audio lyrics`);
      const res = await fetch(`/api/youtube/find?q=${q}`);
      if (res.ok) {
        const data = await res.json();
        const candidatePool = [data.youtubeId, ...(data.candidateIds || [])].filter(Boolean);
        for (const candId of candidatePool) {
          if (candId && !this.triedVideoIds.has(candId)) {
            this.triedVideoIds.add(candId);
            this.currentTrack.youtubeId = candId;
            if (data.duration) this.currentTrack.duration = data.duration;
            console.info(`[ZTune AudioEngine] Found new fallback embed ID: ${candId}`);
            if (this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
              this.ytPlayer.loadVideoById(candId);
              try { this.ytPlayer.playVideo(); } catch (e) {}
              this.startPlaybackWatchdog(this.currentTrack.id);
              return;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Fallback resolution search failed:', err);
    }

    // 3. Ultimate seamless fallback: direct audio stream (e.g. iTunes preview / proxy)
    try {
      console.info('[ZTune AudioEngine] Engaging direct high-fidelity audio stream fallback...');
      this.clearPlaybackWatchdog();
      const matchRes = await fetch(`/api/audio/match?artist=${encodeURIComponent(this.currentTrack.artist)}&title=${encodeURIComponent(this.currentTrack.title)}`);
      if (matchRes.ok) {
        const matchData = await matchRes.json();
        if (matchData.previewUrl) {
          this.activeEngine = 'html5';
          if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
            try { this.ytPlayer.pauseVideo(); } catch (e) {}
          }
          this.audio.src = matchData.previewUrl;
          this.audio.volume = this.volume;
          await this.audio.play();
          this.notifyListeners();
          return;
        }
      }
    } catch (e) {
      console.warn('Direct stream fallback note:', e);
    }
  }

  public getAudioElement(): HTMLAudioElement {
    return this.audio;
  }

  public getActiveEngine(): 'youtube' | 'html5' {
    return this.activeEngine;
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn());
  }

  public async loadTrack(track: Track): Promise<void> {
    this.currentTrack = track;
    this.currentCandidateIndex = 0;
    this.triedVideoIds = new Set<string>(track.youtubeId ? [track.youtubeId] : []);

    // 1. Local track handler (Blob or uploaded File)
    if (track.source === 'Local' || track.isLocal || (track.audioUrl && track.audioUrl.startsWith('blob:'))) {
      this.clearPlaybackWatchdog();
      this.activeEngine = 'html5';
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        try { this.ytPlayer.pauseVideo(); } catch (e) {}
      }
      this.audio.src = track.audioUrl || '';
      this.audio.currentTime = 0;
      this.audio.volume = this.volume;
      this.audio.load();
      this.notifyListeners();
      return;
    }

    // 2. Direct preview track (for iTunes fallback search results)
    // These are browser-playable HTTPS MP4/AAC previews and do not require
    // the YouTube iframe.
    if (track.audioUrl && /^https:\/\//i.test(track.audioUrl) &&
        (track.source === 'iTunes' || track.previewUrl)) {
      this.clearPlaybackWatchdog();
      this.activeEngine = 'html5';
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        try { this.ytPlayer.pauseVideo(); } catch (e) {}
      }
      this.audio.src = track.audioUrl;
      this.audio.currentTime = 0;
      this.audio.volume = this.volume;
      this.audio.load();
      this.notifyListeners();
      return;
    }

    // 3. Full-length YouTube Track handler
    this.activeEngine = 'youtube';
    try {
      this.audio.pause();
    } catch (e) {}

    let ytId = track.youtubeId;
    if (!ytId && track.candidateIds && track.candidateIds.length > 0) {
      ytId = track.candidateIds[0];
      track.youtubeId = ytId;
    }

    if (!ytId && track.artist && track.title) {
      try {
        const q = encodeURIComponent(`${track.artist} ${track.title} audio`);
        const res = await fetch(`/api/youtube/find?q=${q}`);
        if (res.ok) {
          const data = await res.json();
          if (data.youtubeId) {
            ytId = data.youtubeId;
            track.youtubeId = data.youtubeId;
            track.candidateIds = [data.youtubeId, ...(data.candidateIds || [])];
            if (data.duration) track.duration = data.duration;
          }
        }
      } catch (e) {
        console.warn('Async YouTube lookup failed:', e);
      }
    }

    if (ytId) {
      this.triedVideoIds.add(ytId);
      if (!this.ytPlayer) {
        this.pendingVideoId = ytId;
        this.initYouTubePlayer();
      } else if (this.isYtReady && typeof this.ytPlayer.loadVideoById === 'function') {
        this.ytPlayer.loadVideoById(ytId);
        try {
          this.ytPlayer.setVolume(Math.round(this.volume * 100));
        } catch (e) {}
      } else {
        this.pendingVideoId = ytId;
      }
    }

    this.notifyListeners();
  }

  public async playTrack(track: Track): Promise<void> {
    await this.loadTrack(track);
    this.startPlaybackWatchdog(track.id);
    await this.play();
  }

  public async play(): Promise<void> {
    if (this.activeEngine === 'youtube') {
      if (this.currentTrack) {
        this.startPlaybackWatchdog(this.currentTrack.id);
      }
      if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.playVideo === 'function') {
        try {
          this.ytPlayer.playVideo();
        } catch (e) {
          console.warn('YouTube play error:', e);
        }
      } else {
        this.pendingPlay = true;
        this.initYouTubePlayer();
      }
    } else {
      this.clearPlaybackWatchdog();
      try {
        await this.audio.play();
      } catch (e) {
        console.warn('AudioEngine play error:', e);
      }
    }
    this.notifyListeners();
  }

  public pause(): void {
    this.clearPlaybackWatchdog();
    if (this.activeEngine === 'youtube') {
      if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.pauseVideo === 'function') {
        try {
          this.ytPlayer.pauseVideo();
        } catch (e) {
          console.warn('YouTube pause error:', e);
        }
      }
      this.pendingPlay = false;
    } else {
      try {
        this.audio.pause();
      } catch (e) {
        console.warn('AudioEngine pause error:', e);
      }
    }
    this.notifyListeners();
  }

  public togglePlayPause(): void {
    if (this.isPaused()) {
      this.play();
    } else {
      this.pause();
    }
  }

  public seek(seconds: number): void {
    if (!isNaN(seconds) && isFinite(seconds) && seconds >= 0) {
      if (this.activeEngine === 'youtube') {
        if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.seekTo === 'function') {
          try {
            this.ytPlayer.seekTo(seconds, true);
          } catch (e) {}
        }
      } else {
        try {
          this.audio.currentTime = seconds;
        } catch (e) {}
      }
      this.notifyListeners();
    }
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    this.audio.volume = this.volume;

    if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.setVolume === 'function') {
      try {
        this.ytPlayer.setVolume(Math.round(this.volume * 100));
        if (this.volume === 0 && typeof this.ytPlayer.mute === 'function') {
          this.ytPlayer.mute();
        } else if (typeof this.ytPlayer.unMute === 'function' && this.ytPlayer.isMuted && this.ytPlayer.isMuted()) {
          this.ytPlayer.unMute();
        }
      } catch (e) {}
    }
    this.notifyListeners();
  }

  public getVolume(): number {
    return this.volume;
  }

  public isPaused(): boolean {
    if (this.activeEngine === 'youtube') {
      if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.getPlayerState === 'function') {
        try {
          const s = this.ytPlayer.getPlayerState();
          return s !== 1 && s !== 3; // 1 is playing, 3 is buffering
        } catch (e) {}
      }
      return !this.pendingPlay;
    }
    return this.audio.paused;
  }

  public getCurrentTime(): number {
    if (this.activeEngine === 'youtube') {
      if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.getCurrentTime === 'function') {
        try {
          const t = this.ytPlayer.getCurrentTime();
          if (!isNaN(t) && t >= 0) return t;
        } catch (e) {}
      }
      return 0;
    }
    if (!isNaN(this.audio.currentTime)) {
      return this.audio.currentTime;
    }
    return 0;
  }

  public getDuration(): number {
    if (this.activeEngine === 'youtube') {
      if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.getDuration === 'function') {
        try {
          const d = this.ytPlayer.getDuration();
          if (!isNaN(d) && d > 0) {
            if (this.currentTrack && Math.round(d) > 0 && Math.round(d) !== this.currentTrack.duration) {
              this.currentTrack.duration = Math.round(d);
            }
            return Math.round(d);
          }
        } catch (e) {}
      }
      return this.currentTrack?.duration || 210;
    }

    if (this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0) {
      return Math.round(this.audio.duration);
    }
    return this.currentTrack?.duration || 210;
  }

  public getIsYoutubeActive(): boolean {
    return this.activeEngine === 'youtube';
  }

  public applyEQSettings(_eq: EQSettings): void {
    this.notifyListeners();
  }

  public setOnTrackEnded(fn: () => void): void {
    this.onTrackEndedCallback = fn;
  }

  private handleTrackEnded(): void {
    if (this.onTrackEndedCallback) {
      this.onTrackEndedCallback();
    }
  }

  public createTrackFromLocalFile(file: File): Track {
    const url = URL.createObjectURL(file);
    const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    return {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: titleWithoutExt || 'Local Track',
      artist: 'Uploaded File',
      album: 'Local Library',
      duration: 210,
      artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      audioUrl: url,
      genre: 'Personal',
      rating: 5,
      isFavorite: true,
      source: 'Local',
      bpm: '120 BPM',
      key: 'C Major',
      file
    };
  }
}

export const audioEngine = new AudioEngineService();
