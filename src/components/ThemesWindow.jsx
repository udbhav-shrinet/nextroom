import React, { useState } from 'react';
import { Palette, Image, Sliders, Check } from 'lucide-react';
import { THEMES } from '../constants/themes';
import { SCENES } from '../constants/scenes';

export default function ThemesWindow({
  currentTheme,
  onSelectTheme,
  currentScene,
  onSelectScene
}) {
  const [activeTab, setActiveTab] = useState('themes'); // 'themes' | 'scenes' | 'builder'
  const [customTheme, setCustomTheme] = useState({
    id: 'custom',
    name: 'Custom Studio',
    bg: '#120a16',
    panel: 'rgba(26, 15, 32, 0.85)',
    accent: '#c084fc',
    text: '#f3e8ff',
    border: 'rgba(192, 132, 252, 0.25)'
  });

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'themes'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          24 Curated Themes
        </button>
        <button
          onClick={() => setActiveTab('scenes')}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'scenes'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          Living Room Scenery
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'builder'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          Theme Builder
        </button>
      </div>

      {/* 1. Curated Themes Grid */}
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
                    {theme.category}
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
            const isSelected = currentScene.id === scene.id;
            return (
              <div
                key={scene.id}
                onClick={() => onSelectScene(scene)}
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

      {/* 3. Custom Theme Builder */}
      {activeTab === 'builder' && (
        <div className="flex flex-col gap-3 p-2">
          <div className="text-xs text-neutral-300">Create your bespoke sanctuary palette:</div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-mono">
              <span>Background Color:</span>
              <input
                type="color"
                value={customTheme.bg}
                onChange={(e) => setCustomTheme({ ...customTheme, bg: e.target.value })}
                className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-white/10"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-mono">
              <span>Accent Glow Color:</span>
              <input
                type="color"
                value={customTheme.accent}
                onChange={(e) => setCustomTheme({ ...customTheme, accent: e.target.value })}
                className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-white/10"
              />
            </label>
          </div>

          <button
            onClick={() => onSelectTheme(customTheme)}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs transition-colors shadow-lg shadow-purple-600/30 mt-4"
          >
            Apply Custom Theme
          </button>
        </div>
      )}
    </div>
  );
}
