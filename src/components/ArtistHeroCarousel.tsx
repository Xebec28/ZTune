/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles, Music2, Disc, RefreshCw } from 'lucide-react';
import { Track, NavigationTab } from '../types';
import { ALL_ARTIST_SLIDE_PRESETS, ArtistSlideData } from '../data/artistCarouselData';

// Each active batch contains 4-5 featured artist slides at a time
const BATCH_SIZE = 4;
const SCROLL_INTERVAL_MS = 10000; // 10 seconds auto-scroll per slide
const BATCH_ROTATION_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes rotate entire artist roster

interface ArtistHeroCarouselProps {
  onSelectTrack: (track: Track) => void;
  setActiveTab: (tab: NavigationTab) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  themeMode?: 'normal' | 'dynamic';
  themeColors?: {
    primary?: string;
    accent?: string;
    glow?: string;
    bgDark?: string;
  };
}

export const ArtistHeroCarousel: React.FC<ArtistHeroCarouselProps> = ({
  onSelectTrack,
  setActiveTab,
  currentTrack,
  isPlaying,
  themeMode = 'normal',
  themeColors,
}) => {
  // Batch offset to rotate artists every 10 minutes
  const [batchOffset, setBatchOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute the currently active slice of artists based on batchOffset
  const currentSlides: ArtistSlideData[] = React.useMemo(() => {
    const total = ALL_ARTIST_SLIDE_PRESETS.length;
    const slides: ArtistSlideData[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const idx = (batchOffset + i) % total;
      slides.push(ALL_ARTIST_SLIDE_PRESETS[idx]);
    }
    return slides;
  }, [batchOffset]);

  const activeSlide = currentSlides[currentIndex] || currentSlides[0] || ALL_ARTIST_SLIDE_PRESETS[0];

  // 10-Minute Timer: Change artist roster in carousel every 10 minutes
  useEffect(() => {
    batchTimerRef.current = setInterval(() => {
      setBatchOffset((prev) => (prev + BATCH_SIZE) % ALL_ARTIST_SLIDE_PRESETS.length);
      setCurrentIndex(0); // Reset index for fresh set
    }, BATCH_ROTATION_INTERVAL_MS);

    return () => {
      if (batchTimerRef.current) clearInterval(batchTimerRef.current);
    };
  }, []);

  // Manual Shuffle / Refresh artist roster on demand
  const handleShuffleRoster = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBatchOffset((prev) => (prev + BATCH_SIZE) % ALL_ARTIST_SLIDE_PRESETS.length);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % currentSlides.length);
    setProgressPercent(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + currentSlides.length) % currentSlides.length);
    setProgressPercent(0);
  };

  const handleGoTo = (index: number) => {
    setCurrentIndex(index);
    setProgressPercent(0);
  };

  // 4-Second Auto-play timer with pause on hover & smooth progress indicator
  useEffect(() => {
    if (isHovered) {
      if (scrollTimerRef.current) clearInterval(scrollTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgressPercent(0);
    const stepTime = 50; // update progress every 50ms
    const totalSteps = SCROLL_INTERVAL_MS / stepTime;
    let stepCount = 0;

    progressIntervalRef.current = setInterval(() => {
      stepCount++;
      setProgressPercent(Math.min(100, (stepCount / totalSteps) * 100));
    }, stepTime);

    scrollTimerRef.current = setInterval(() => {
      handleNext();
    }, SCROLL_INTERVAL_MS);

    return () => {
      if (scrollTimerRef.current) clearInterval(scrollTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isHovered, currentSlides.length]);

  const playSong = (slide: ArtistSlideData, hitIndex = 0) => {
    const hit = slide.topHits[hitIndex] || slide.primaryHit;
    const trackPayload: Track = {
      id: `hero-${slide.id}-${hitIndex}-${Date.now()}`,
      title: hit.title,
      artist: slide.artistName,
      album: hit.album,
      duration: hit.duration,
      artworkUrl: slide.primaryHit.artworkUrl || slide.imageUrl,
      audioUrl: '',
      genre: slide.primaryHit.genre,
      rating: 5,
      source: 'YouTube',
    };
    onSelectTrack(trackPayload);
  };

  const isCurrentSlidePlaying =
    currentTrack &&
    isPlaying &&
    (currentTrack.artist.toLowerCase().includes(activeSlide.artistName.toLowerCase().split(' ')[0]) ||
      activeSlide.topHits.some((h) => currentTrack.title.toLowerCase().includes(h.title.toLowerCase())));

  // Calculate dynamic theme gradient overlay if dynamic mode is active
  const dynamicOverlayStyle =
    themeMode === 'dynamic' && themeColors?.primary
      ? {
          background: `linear-gradient(90deg, ${themeColors.bgDark || '#09090b'}f2 0%, ${themeColors.primary}99 45%, rgba(0,0,0,0.45) 100%)`,
        }
      : undefined;

  return (
    <div
      className="relative rounded-3xl overflow-hidden group border border-white/10 shadow-2xl transition-all duration-700 select-none min-h-[320px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow:
          themeMode === 'dynamic' && themeColors?.glow
            ? `0 20px 40px -15px ${themeColors.glow}`
            : `0 20px 40px -15px ${activeSlide.gradientTheme.accentColor}33`,
      }}
    >
      {/* Background Artist Image with smooth transition & gentle hover zoom */}
      <div
        key={activeSlide.imageUrl}
        className="absolute inset-0 bg-cover bg-center transform scale-100 group-hover:scale-105 transition-all duration-1000 ease-out animate-fadeIn"
        style={{
          backgroundImage: `url("${activeSlide.imageUrl}")`,
          filter: 'brightness(0.82) contrast(1.08)',
        }}
      />

      {/* Dynamic Themed Multi-Stop Gradient Overlays */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${activeSlide.gradientTheme.from} ${activeSlide.gradientTheme.via} ${activeSlide.gradientTheme.to} z-10 transition-all duration-700`}
        style={dynamicOverlayStyle}
      />

      {/* Top & Bottom Vignette Shadow Gradients for Maximum Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 z-10 pointer-events-none" />

      {/* Top Subtle 4-Second Auto-Play Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
        <div
          className="h-full transition-all duration-75 ease-linear"
          style={{
            width: isHovered ? `${progressPercent}%` : `${progressPercent}%`,
            backgroundColor:
              themeMode === 'dynamic' && themeColors?.primary
                ? themeColors.primary
                : activeSlide.gradientTheme.accentColor,
            opacity: isHovered ? 0.4 : 0.9,
          }}
        />
      </div>

      {/* Hero Content Area */}
      <div className="relative z-20 h-full flex flex-col justify-between p-7 sm:p-9 min-h-[320px]">
        {/* Top Header Row: Category Badge + 10-Min Rotating Roster Indicator */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border backdrop-blur-md transition-all duration-500 flex items-center gap-1.5 ${activeSlide.gradientTheme.badgeBg} ${activeSlide.gradientTheme.badgeText}`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{activeSlide.categoryTag}</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-white/50 tracking-wider">
              • Anime Scenery (Pause on hover)
            </span>
          </div>

          {/* Right Header Status: Hover State & 10-min Roster Shuffle */}
          <div className="flex items-center gap-2">
            {isHovered && (
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 backdrop-blur-sm animate-pulse">
                Paused
              </span>
            )}

            {/* Quick 10-Min Roster Switcher */}
            <button
              onClick={handleShuffleRoster}
              className="px-2.5 py-1 rounded-full bg-black/40 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Rotate to Next Artist Spotlight Roster (Auto-switches every 10 min)"
            >
              <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline text-[11px]">Next Artists</span>
            </button>

            {/* Slide Index Badge */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-white/70">
              <span className="text-white">{currentIndex + 1}</span>
              <span className="text-white/40">/</span>
              <span>{currentSlides.length}</span>
            </div>
          </div>
        </div>

        {/* Middle Main Artist Info with Smooth Entry */}
        <div className="my-auto py-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
              Featured Artist • {activeSlide.artistName}
            </span>
          </div>

          <h2
            className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-xl transition-all duration-500 mb-2"
            style={{
              textShadow: '0 2px 20px rgba(0,0,0,0.8)',
            }}
          >
            {activeSlide.headline}
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl font-medium leading-relaxed drop-shadow line-clamp-2">
            {activeSlide.description}
          </p>

          {/* 1-Click Hit Song Quick Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs font-bold text-neutral-400 flex items-center gap-1 mr-1">
              <Music2 className="w-3.5 h-3.5" />
              Top Hits:
            </span>
            {activeSlide.topHits.map((hit, idx) => {
              const isThisTrackPlaying =
                currentTrack &&
                isPlaying &&
                currentTrack.title.toLowerCase().includes(hit.title.toLowerCase());

              return (
                <button
                  key={idx}
                  onClick={() => playSong(activeSlide, idx)}
                  className={`group/hit text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                    isThisTrackPlaying
                      ? 'bg-white text-black border-white shadow-lg font-bold'
                      : 'bg-black/40 hover:bg-white/20 text-white/90 border-white/15 backdrop-blur-md hover:border-white/30'
                  }`}
                  title={`Play "${hit.title}"`}
                >
                  <Play
                    className={`w-3 h-3 transition-transform group-hover/hit:scale-110 ${
                      isThisTrackPlaying ? 'fill-black text-black' : 'fill-white text-white'
                    }`}
                  />
                  <span>{hit.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Controls & Nav Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            {/* Primary Listen Button */}
            <button
              onClick={() => playSong(activeSlide, 0)}
              className="px-7 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2.5 text-black cursor-pointer bg-white"
              style={{
                boxShadow: `0 8px 25px -5px ${activeSlide.gradientTheme.accentColor}88`,
              }}
            >
              {isCurrentSlidePlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-black text-black" />
                  <span>Playing Featured Hit</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black text-black" />
                  <span>Play {activeSlide.primaryHit.title}</span>
                </>
              )}
            </button>

            {/* Explore Artists View */}
            <button
              onClick={() => setActiveTab('artists')}
              className="glass-panel px-6 py-3 rounded-full font-semibold text-sm text-white/90 hover:text-white hover:bg-white/15 transition-all flex items-center gap-2 cursor-pointer border border-white/15 backdrop-blur-md"
            >
              <Disc className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              <span>All Artists</span>
            </button>
          </div>

          {/* Carousel Arrow Controls & Indicators */}
          <div className="flex items-center gap-3">
            {/* Slide Dots */}
            <div className="flex items-center gap-1.5">
              {currentSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => handleGoTo(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  title={slide.artistName}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Previous Button */}
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-white/20 border border-white/15 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer hover:border-white/30"
              title="Previous Artist"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-white/20 border border-white/15 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer hover:border-white/30"
              title="Next Artist"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
