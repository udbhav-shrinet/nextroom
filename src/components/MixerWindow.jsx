import React, { useState } from 'react';
import { STEMS } from '../constants/stems';
import { audioEngine } from '../audio/audioEngine';
import {
  Volume2, VolumeX, Sliders, Dices, RotateCcw,
  CloudRain, Wind, Flame, Users, Radio, Keyboard, Zap, Headphones, Sparkles
} from 'lucide-react';

export default function MixerWindow() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [stemVolumes, setStemVolumes] = useState(() => {
    const vols = {};
    STEMS.forEach(s => { vols[s.id] = s.defaultVol || 0; });
    return vols;
  });
  const [stemPans, setStemPans] = useState(() => {
    const pans = {};
    STEMS.forEach(s => { pans[s.id] = s.defaultPan || 0; });
    return pans;
  });

  const categories = ['All', 'Weather', 'Fire & Earth', 'Cozy Interiors', 'City & Machines', 'Voices & Comms', 'ASMR & Brainwaves'];

  const filteredStems = activeCategory === 'All'
    ? STEMS
    : STEMS.filter(s => s.category.includes(activeCategory));

  const handleVolumeChange = (stemId, val) => {
    const next = { ...stemVolumes, [stemId]: parseFloat(val) };
    setStemVolumes(next);
    audioEngine.setStemVolume(stemId, parseFloat(val));
  };

  const handlePanChange = (stemId, val) => {
    const next = { ...stemPans, [stemId]: parseFloat(val) };
    setStemPans(next);
    audioEngine.setStemPan(stemId, parseFloat(val));
  };

  const handleSerendipityMix = () => {
    const recipes = [
      // Rainy Cafe
      { 'light-rain': 0.6, 'cafe-murmur': 0.45, 'mechanical-keyboard': 0.3, 'alpha-10hz': 0.2 },
      // Cabin Blizzard
      { 'fireplace': 0.75, 'blizzard-wind': 0.4, 'cat-purr': 0.5, 'solfeggio-432': 0.25 },
      // Space Observation
      { 'spaceship-drone': 0.5, 'nasa-apollo': 0.35, 'brown-noise': 0.3, 'theta-4hz': 0.35 },
      // Tokyo Night
      { 'light-rain': 0.5, 'tokyo-izakaya': 0.4, 'fan-hum': 0.25, 'lofi-piano': 0.4 }
    ];
    const picked = recipes[Math.floor(Math.random() * recipes.length)];

    const next = {};
    STEMS.forEach(s => {
      const v = picked[s.id] || 0;
      next[s.id] = v;
      audioEngine.setStemVolume(s.id, v);
    });
    setStemVolumes(next);
  };

  const handleSilenceAll = () => {
    const next = {};
    STEMS.forEach(s => {
      next[s.id] = 0;
      audioEngine.setStemVolume(s.id, 0);
    });
    setStemVolumes(next);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top Controls: Filter Pills & Action Buttons */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 flex-wrap">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                activeCategory === cat
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-white bg-white/5 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSerendipityMix}
            className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Random balanced ambient mix"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Serendipity</span>
          </button>

          <button
            onClick={handleSilenceAll}
            className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Mute all ambient stems instantly"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Silence All</span>
          </button>
        </div>
      </div>

      {/* Stem Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {filteredStems.map(stem => {
          const vol = stemVolumes[stem.id] || 0;
          const pan = stemPans[stem.id] || 0;
          const isActive = vol > 0;

          return (
            <div
              key={stem.id}
              className={`p-3 rounded-xl border transition-all ${
                isActive
                  ? 'bg-purple-900/20 border-purple-500/40 shadow-sm'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`dot-pill ${isActive ? 'active' : 'inactive'}`} />
                  <span className="font-semibold text-xs text-neutral-200 truncate">{stem.name}</span>
                </div>
                <span className="font-mono text-[10px] text-purple-300">
                  {Math.round(vol * 100)}%
                </span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={vol}
                  onChange={(e) => handleVolumeChange(stem.id, e.target.value)}
                  className="flex-1 accent-purple-400 cursor-pointer"
                />
              </div>

              {/* Stereo Pan Slider (L/R) */}
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-white/5">
                <span>Pan: {pan < -0.1 ? 'L' + Math.round(Math.abs(pan)*100) : pan > 0.1 ? 'R' + Math.round(pan*100) : 'Center'}</span>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={pan}
                  onChange={(e) => handlePanChange(stem.id, e.target.value)}
                  className="w-20 accent-purple-300 cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
