import React, { useState } from 'react';
import { Palette, Image, Sliders, Check, Sparkles, Link } from 'lucide-react';
import { THEMES } from '../constants/themes';
import { SCENES } from '../constants/scenes';

const LOFI_PRESET_WALLPAPERS = [
  {
    name: 'Cozy Rain Bedroom (Lo-Fi Girl)',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1920&auto=format&fit=crop'
  },
  {
    name: 'Midnight Shibuya Rain',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1920&auto=format&fit=crop'
  },
  {
    name: 'Warm A-Frame Wood Hearth',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1920&auto=format&fit=crop'
  },
  {
    name: 'Kyoto Bamboo Mist Garden',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1920&auto=format&fit=crop'
  },
  {
    name: 'Vintage 80s Cassette Horizon',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1920&auto=format&fit=crop'
  }
];

export default function ThemesWindow({
  currentTheme,
  onSelectTheme,
  currentScene,
  onSelectScene,
  customWallpaperUrl,
  setCustomWallpaperUrl
}) {
  const [activeTab, setActiveTab] = useState('themes'); // 'themes' | 'scenes' | 'wallpapers'
  const [customInput, setCustomInput] = useState('');

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setCustomWallpaperUrl(customInput.trim());
    setCustomInput('');
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2.5 flex-wrap">
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'themes'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          Themes (Syncs Wallpaper & FX)
        </button>
        <button
          onClick={() => setActiveTab('scenes')}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'scenes'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          Scenery Art
        </button>
        <button
          onClick={() => setActiveTab('wallpapers')}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'wallpapers'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          Lo-Fi Wallpapers
        </button>
      </div>

      {/* 1. Curated Themes Grid (Synchronizes Theme, Wallpaper & Room Animation) */}
      {activeTab === 'themes' && (
        <div className="grid grid-cols-2 gap-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {THEMES.map(theme => {
            const isSelected = currentTheme.id === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-400 shadow-lg shadow-purple-500/20'
                    : 'border-white/10 hover:border-white/20 hover:scale-101'
                }`}
                style={{ backgroundColor: theme.bg }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs truncate" style={{ color: theme.text }}>
                    {theme.name}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5" style={{ color: theme.accent }} />}
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: theme.accent }} />
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: theme.muted }} />
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: theme.secondary }} />
                  <span className="text-[10px] font-mono ml-auto opacity-75" style={{ color: theme.text }}>
                    {theme.animation} fx
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Living Room Scenes Grid */}
      {activeTab === 'scenes' && (
        <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {SCENES.map(scene => {
            const isSelected = currentScene.id === scene.id && !customWallpaperUrl;
            return (
              <div
                key={scene.id}
                onClick={() => {
                  setCustomWallpaperUrl(null);
                  onSelectScene(scene);
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden h-28 ${
                  isSelected
                    ? 'border-purple-400 shadow-lg shadow-purple-500/20'
                    : 'border-white/10 hover:border-white/20 hover:scale-101'
                }`}
                style={{ background: scene.bgGradient }}
              >
                <div className="flex items-center justify-between z-10">
                  <span className="font-semibold text-xs text-white drop-shadow">
                    {scene.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-purple-300 drop-shadow" />}
                </div>

                <div className="z-10">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-neutral-300 backdrop-blur-sm border border-white/10 font-mono">
                    {scene.category} • {scene.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Lo-Fi Wallpapers & Custom URL */}
      {activeTab === 'wallpapers' && (
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {/* Custom URL form */}
          <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
            <input
              type="url"
              placeholder="Paste any wallpaper image/GIF/video URL..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs transition-colors cursor-pointer"
            >
              Apply
            </button>
            {customWallpaperUrl && (
              <button
                type="button"
                onClick={() => setCustomWallpaperUrl(null)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-mono cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>

          {/* Curated Presets */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-neutral-300">Curated Lo-Fi Sanctuary Backdrops:</div>
            <div className="grid grid-cols-2 gap-2.5">
              {LOFI_PRESET_WALLPAPERS.map((wp, idx) => (
                <div
                  key={idx}
                  onClick={() => setCustomWallpaperUrl(wp.url)}
                  className={`relative rounded-xl overflow-hidden aspect-video border cursor-pointer group ${
                    customWallpaperUrl === wp.url ? 'border-purple-400 ring-2 ring-purple-400/50' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[11px] font-medium text-white truncate drop-shadow">{wp.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
