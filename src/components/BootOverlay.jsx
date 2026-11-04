import React, { useState } from 'react';
import { Radio, Sparkles, Volume2, Shield } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

export default function BootOverlay({ onUnlock }) {
  const [booting, setBooting] = useState(false);

  const handleTuneIn = async () => {
    setBooting(true);
    await audioEngine.init();
    audioEngine.playPad(0); // Warm initial chord
    setTimeout(() => {
      onUnlock();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0510] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-radial-gradient from-purple-900/20 via-black to-black pointer-events-none" />

      {/* Center Console Container */}
      <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-purple-500/30 flex flex-col items-center gap-6 shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-600/30">
          <Radio className="w-8 h-8 animate-pulse" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-mono text-xl font-bold tracking-wider text-white">
            NEXTROOM // OS
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Spatial 24/7 World Radio, Studio DSP & Personal Sanctuary
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="w-full bg-black/40 rounded-2xl p-3 border border-white/5 text-left text-xs font-mono space-y-1.5 text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="dot-pill active" />
            <span>Radio-Browser API (40,000+ live stations)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="dot-pill active" />
            <span>Studio DSP Rack & Door Muffle Filter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="dot-pill active" />
            <span>36-Stem Ambient Mixer & Lo-Fi Sampler</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="dot-pill active" />
            <span>Offline Procedural Audio Fallback</span>
          </div>
        </div>

        {/* Tune In Gesture Button */}
        <button
          onClick={handleTuneIn}
          disabled={booting}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-sm font-semibold tracking-wider transition-all transform active:scale-98 shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{booting ? 'TUNING FREQUENCIES...' : '[ ◉ TUNE IN NOW ]'}</span>
        </button>

        <span className="text-[10px] font-mono text-neutral-500">
          Clicking unlocks Web Audio Context & Spatial DSP Engine
        </span>
      </div>
    </div>
  );
}
