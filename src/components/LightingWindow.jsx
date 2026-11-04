import React from 'react';
import { Sun, Moon, CloudRain, Flame, Tv, Sparkles, Sliders } from 'lucide-react';

export default function LightingWindow({ lighting, setLighting }) {
  const update = (key, val) => {
    setLighting(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar text-xs">
      {/* Desk Lamp Dimmer & Physical Kelvin Warmth */}
      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-neutral-100">Desk Lamp Physical Lighting</span>
          </div>
          <button
            onClick={() => update('lampActive', !lighting.lampActive)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all ${
              lighting.lampActive
                ? 'bg-amber-500/30 border-amber-500 text-amber-200'
                : 'bg-white/5 border-white/10 text-neutral-400'
            }`}
          >
            {lighting.lampActive ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Dimmer */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between font-mono text-[11px] text-neutral-300">
            <span>Dimmer Brightness</span>
            <span>{Math.round((lighting.lampDimmer || 0.8) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={lighting.lampDimmer || 0.8}
            onChange={(e) => update('lampDimmer', parseFloat(e.target.value))}
            className="w-full accent-amber-400"
          />
        </div>

        {/* Kelvin Warmth */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between font-mono text-[11px] text-neutral-300">
            <span>Color Temperature</span>
            <span className="text-amber-300">{lighting.lampWarmth || 3200}K</span>
          </div>
          <input
            type="range"
            min="2400"
            max="6500"
            step="100"
            value={lighting.lampWarmth || 3200}
            onChange={(e) => update('lampWarmth', parseInt(e.target.value))}
            className="w-full accent-amber-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-neutral-500">
            <span>2400K (Candle)</span>
            <span>3200K (Warm Incandescent)</span>
            <span>6500K (Daylight)</span>
          </div>
        </div>
      </div>

      {/* Midnight Room Dimmer */}
      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-neutral-100">Midnight Room Dimmer</span>
          </div>
          <span className="font-mono text-[11px] text-purple-300">
            {Math.round((lighting.midnightDimmer || 0) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="0.9"
          step="0.05"
          value={lighting.midnightDimmer || 0}
          onChange={(e) => update('midnightDimmer', parseFloat(e.target.value))}
          className="w-full accent-purple-400"
        />
      </div>

      {/* Rain on Glass Refraction & Fog Wipe */}
      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-neutral-100">Window Rain Refraction & Condensation</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between font-mono text-[11px] text-neutral-300">
            <span>Rain Droplet Density</span>
            <span className="text-cyan-300">{Math.round((lighting.rainDensity || 0.4) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={lighting.rainDensity || 0.4}
            onChange={(e) => update('rainDensity', parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between font-mono text-[11px] text-neutral-300">
            <span>Glass Fog / Condensation</span>
            <span className="text-cyan-300">{Math.round((lighting.fogDensity || 0) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={lighting.fogDensity || 0}
            onChange={(e) => update('fogDensity', parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>

      {/* Fireplace Hearth & Neon Sign */}
      <div className="grid grid-cols-2 gap-3">
        {/* Fireplace */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-semibold text-neutral-100">Fireplace Hearth</span>
          </div>
          <button
            onClick={() => update('fireplaceActive', !lighting.fireplaceActive)}
            className={`w-full py-1.5 rounded-lg font-mono text-[11px] border transition-all ${
              lighting.fireplaceActive
                ? 'bg-orange-500/30 border-orange-500 text-orange-200'
                : 'bg-white/5 border-white/10 text-neutral-400'
            }`}
          >
            {lighting.fireplaceActive ? 'FLICKERING' : 'OFF'}
          </button>
        </div>

        {/* CRT Scanline FX */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-neutral-100">CRT Scanlines</span>
          </div>
          <button
            onClick={() => update('crtEffect', !lighting.crtEffect)}
            className={`w-full py-1.5 rounded-lg font-mono text-[11px] border transition-all ${
              lighting.crtEffect
                ? 'bg-purple-500/30 border-purple-500 text-purple-200'
                : 'bg-white/5 border-white/10 text-neutral-400'
            }`}
          >
            {lighting.crtEffect ? 'ACTIVE' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Neon Wall Sign Settings */}
      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="font-semibold text-neutral-100">Neon Sign Customization</span>
          </div>
          <button
            onClick={() => update('neonActive', !lighting.neonActive)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all ${
              lighting.neonActive
                ? 'bg-pink-500/30 border-pink-500 text-pink-200'
                : 'bg-white/5 border-white/10 text-neutral-400'
            }`}
          >
            {lighting.neonActive ? 'GLOWING' : 'OFF'}
          </button>
        </div>

        <input
          type="text"
          value={lighting.neonText || ''}
          onChange={(e) => update('neonText', e.target.value)}
          placeholder="NEXTROOM // 24/7"
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-purple-400"
        />

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400 font-mono">Neon Color:</span>
          {['#c084fc', '#00f0ff', '#ffe600', '#f43f5e', '#22c55e', '#38bdf8'].map(color => (
            <button
              key={color}
              onClick={() => update('neonColor', color)}
              className={`w-5 h-5 rounded-full border transition-transform ${
                lighting.neonColor === color ? 'scale-125 border-white' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
