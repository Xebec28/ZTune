/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Clock, User, ListMusic, Plus, Trash2 } from 'lucide-react';
import { NavigationTab, Playlist } from '../types';
import { getPlaylistCover } from '../utils/playlistUtils';

interface LeftSidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  playlists?: Playlist[];
  onSelectPlaylist?: (playlist: Playlist) => void;
  onDeletePlaylist?: (playlistId: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  setActiveTab,
  playlists = [],
  onSelectPlaylist,
  onDeletePlaylist,
}) => {
  const navItems = [
    { id: 'home' as NavigationTab, label: 'Discover', icon: Home },
    { id: 'recents' as NavigationTab, label: 'Recent', icon: Clock },
    { id: 'artists' as NavigationTab, label: 'Artists', icon: User },
    { id: 'playlists' as NavigationTab, label: 'Playlists', icon: ListMusic },
  ];

  return (
    <aside className="w-64 bg-[#0A0A0A]/90 backdrop-blur-2xl border-r border-white/5 flex flex-col justify-between shrink-0 select-none z-20">
      <div className="p-6 flex flex-col h-full">
        {/* Geometric Balance Brand Header */}
        <div className="flex items-center gap-3 mb-8 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-lg transition-all"
            style={{ 
              backgroundColor: 'var(--theme-primary, #6366f1)',
              boxShadow: '0 4px 20px var(--theme-glow, rgba(99,102,241,0.4))'
            }}
          >
            Z
          </div>
          <span className="text-xl font-normal tracking-tight text-white font-['Poppins',sans-serif]">ZTune</span>
          <span 
            className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest"
            style={{ 
              backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.2))',
              color: 'var(--theme-light-accent, #c7d2fe)'
            }}
          >
            Desktop
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'text-white font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                style={isActive ? { 
                  backgroundColor: 'var(--theme-subtle, rgba(99,102,241,0.18))',
                  borderLeft: '3px solid var(--theme-primary, #6366f1)',
                  color: '#ffffff'
                } : {}}
              >
                <Icon 
                  className="w-5 h-5 transition-colors" 
                  style={isActive ? { color: 'var(--theme-primary, #6366f1)' } : {}}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Playlists Quick Access with Delete Option */}
        <div className="mt-8 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Playlists ({playlists.length})
            </h3>
            <button
              onClick={() => setActiveTab('playlists')}
              className="text-neutral-400 hover:text-white transition-colors"
              title="Manage Playlists"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 text-sm text-neutral-400 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {playlists.length === 0 ? (
              <div className="px-2 py-4 text-xs text-neutral-600 italic">
                No playlists created yet.
              </div>
            ) : (
              playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    if (onSelectPlaylist) onSelectPlaylist(pl);
                    setActiveTab('playlists');
                  }}
                  className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] hover:text-white cursor-pointer transition-colors"
                >
                  <img
                    src={getPlaylistCover(pl)}
                    alt={pl.title}
                    className="w-6 h-6 rounded-md object-cover bg-neutral-800 shrink-0 border border-white/10"
                  />
                  <span className="truncate flex-1 text-xs font-medium text-neutral-300 group-hover:text-white">
                    {pl.title}
                  </span>

                  {onDeletePlaylist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlaylist(pl.id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
                      title={`Remove "${pl.title}"`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
