/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sliders, X, RotateCcw, Volume2, Check } from 'lucide-react';
import { EQSettings } from '../types';
import { DEFAULT_EQ_SETTINGS } from '../data/defaultCatalog';
import { audioEngine } from '../services/audioEngine';

interface EqualizerModalProps {
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ onClose }) => {
  const [eq, setEq] = useState<EQSettings>(DEFAULT_EQ_SETTINGS);

  const presets: Record<string, number[]> = {
    'Rock': [4, 3, -1, -2, 0, 2, 4, 5, 4, 3],
    'Bass Boost': [8, 6, 4, 1, 0, 0, 0, 1, 2, 3],
    'Electronic': [5, 4, 1, 0, -2, 2, 4, 6, 5, 4],
    'Pop': [-1, 1, 3, 4, 3, 1, -1, -2, -1, 1],
    'Vocal Boost': [-2, -1, 1, 4, 6, 5, 3, 1, 0, -1],
    'Acoustic': [3, 2, 1, 1, 2, 3, 4, 3, 2, 1],
    'Classical': [4, 3, 2, 1, -1, -1, 0, 2, 3, 4],
    'Flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };

  const handleToggleEnable = () => {
    const updated = { ...eq, enabled: !eq.enabled };
    setEq(updated);
    audioEngine.applyEQSettings(updated);
  };

  const handleSelectPreset = (name: string) => {
    const gains = presets[name] || presets['Flat'];
    const updatedBands = eq.bands.map((b, idx) => ({
      ...b,
      gain: gains[idx] ?? 0
    }));
    const updated = { ...eq, preset: name, bands: updatedBands };
    setEq(updated);
    audioEngine.applyEQSettings(updated);
  };

  const handleBandChange = (index: number, newGain: number) => {
    const updatedBands = eq.bands.map((b, idx) =>
      idx === index ? { ...b, gain: newGain } : b
    );
    const updated = { ...eq, preset: 'Custom', bands: updatedBands };
    setEq(updated);
    audioEngine.applyEQSettings(updated);
  };

  const handleBassBoostChange = (val: number) => {
    const updated = { ...eq, bassBoost: val };
    setEq(updated);
    audioEngine.applyEQSettings(updated);
  };

  const handleReset = () => {
    const flat = presets['Flat'];
    const updatedBands = eq.bands.map((b, idx) => ({
      ...b,
      gain: flat[idx] ?? 0
    }));
    const updated = {
      ...eq,
      preset: 'Flat',
      bassBoost: 0,
      preamp: 0,
      bands: updatedBands
    };
    setEq(updated);
    audioEngine.applyEQSettings(updated);
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 sm:py-6 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                ZTune Pro Audio Engine
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">10-Band Equalizer & Bass Boost</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
            {/* Enable/Disable Toggle */}
            <button
              onClick={handleToggleEnable}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all ${
                eq.enabled
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'glass-panel text-neutral-400 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${eq.enabled ? 'bg-white' : 'bg-neutral-500'}`} />
              <span>{eq.enabled ? 'EQ Active' : 'EQ Bypassed'}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-panel text-xs text-neutral-400 hover:text-white transition-colors"
              title="Reset to Flat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-panel text-neutral-400 hover:text-white transition-colors"
              title="Close EQ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presets Grid */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3 block">
            Acoustic Presets
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {Object.keys(presets).map((name) => {
              const isSelected = eq.preset === name;
              return (
                <button
                  key={name}
                  onClick={() => handleSelectPreset(name)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'glass-panel text-neutral-400 hover:text-white glass-panel-hover'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bass Boost & Pre-amp Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Sub-Bass Boost
              </span>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                +{eq.bassBoost}%
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mb-4">
              Enhances deep low-shelf frequencies below 90Hz
            </p>
            <input
              type="range"
              min={0}
              max={100}
              value={eq.bassBoost}
              onChange={(e) => handleBassBoostChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Pre-amp Gain
              </span>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                {eq.preamp > 0 ? `+${eq.preamp}` : eq.preamp} dB
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mb-4">
              Overall output stage gain headroom control
            </p>
            <input
              type="range"
              min={-6}
              max={6}
              value={eq.preamp}
              onChange={(e) => setEq({ ...eq, preamp: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* 10-Band Sliders (Visual geometric vertical sliders, mobile scrollable container) */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <span className="text-xs font-bold text-white uppercase tracking-widest">
              10-Band Parametric Frequency Curve
            </span>
            <span className="text-xs font-mono text-neutral-400 text-right">
              -12 dB to +12 dB
            </span>
          </div>

          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[560px] grid grid-cols-10 gap-2 items-end pt-2">
              {eq.bands.map((band, idx) => (
                <div key={idx} className="flex flex-col items-center gap-4">
                  <span className="text-[11px] font-mono font-bold text-indigo-400">
                    {band.gain > 0 ? `+${band.gain}` : band.gain}
                  </span>

                  <div className="relative h-44 flex items-center justify-center w-full">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={band.gain}
                      onChange={(e) => handleBandChange(idx, parseInt(e.target.value))}
                      style={{
                        transform: 'rotate(-90deg)',
                        width: '150px',
                      }}
                      className="h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                    />
                  </div>

                  <span className="text-[11px] font-mono text-neutral-400 uppercase">
                    {band.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
