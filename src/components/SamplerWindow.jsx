import React, { useState, useEffect } from 'react';
import { Grid, Play, Square, Music, Sparkles } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

const PADS = [
  { key: '1', name: 'Warm Rhodes', color: 'from-purple-600 to-indigo-600' },
  { key: '2', name: 'Lo-Fi Kick', color: 'from-rose-600 to-pink-600' },
  { key: '3', name: 'Crisp Snare', color: 'from-amber-600 to-yellow-600' },
  { key: '4', name: 'Hi-Hat Sizzle', color: 'from-cyan-600 to-blue-600' },
  { key: '5', name: 'Vinyl Rewind', color: 'from-emerald-600 to-teal-600' },
  { key: '6', name: 'Thunder Clap', color: 'from-violet-600 to-purple-800' },
  { key: '7', name: 'Singing Bowl', color: 'from-orange-600 to-amber-700' },
  { key: '8', name: 'Water Plink', color: 'from-sky-600 to-cyan-700' }
];

export default function SamplerWindow() {
  const [activePad, setActivePad] = useState(null);
  const [bpm, setBpm] = useState(84);
  const [isLooping, setIsLooping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 16-step grid for 4 tracks (Rhodes, Kick, Snare, Hi-Hat)
  const [grid, setGrid] = useState([
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // Rhodes
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], // Kick
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Snare
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Hi-Hat
  ]);

  const triggerPad = (index) => {
    setActivePad(index);
    audioEngine.playPad(index);
    setTimeout(() => setActivePad(null), 150);
  };

  // Keyboard shortcut listener (keys 1-8)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 8) {
        triggerPad(num - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 16-Step Looper Sequencer Engine
  useEffect(() => {
    if (!isLooping) return;
    const intervalMs = (60 / bpm / 4) * 1000;
    const timer = setInterval(() => {
      setCurrentStep(step => {
        const nextStep = (step + 1) % 16;
        grid.forEach((track, trackIdx) => {
          if (track[nextStep]) {
            audioEngine.playPad(trackIdx);
          }
        });
        return nextStep;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isLooping, bpm, grid]);

  const toggleGridCell = (trackIdx, stepIdx) => {
    const next = grid.map((track, t) => {
      if (t !== trackIdx) return track;
      const newTrack = [...track];
      newTrack[stepIdx] = newTrack[stepIdx] ? 0 : 1;
      return newTrack;
    });
    setGrid(next);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 8-Pad Hardware MPC Style Trigger Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {PADS.map((pad, idx) => {
          const isActive = activePad === idx;
          return (
            <button
              key={pad.key}
              onClick={() => triggerPad(idx)}
              className={`h-20 rounded-2xl p-2.5 flex flex-col justify-between items-start text-left border transition-all active:scale-95 shadow-lg bg-gradient-to-br ${
                pad.color
              } ${
                isActive
                  ? 'brightness-150 border-white scale-102 shadow-purple-500/50'
                  : 'opacity-85 hover:opacity-100 border-white/10'
              }`}
            >
              <span className="font-mono text-xs font-bold text-white/90">[{pad.key}]</span>
              <span className="text-[11px] font-medium text-white tracking-tight">{pad.name}</span>
            </button>
          );
        })}
      </div>

      {/* 16-Step Beat Looper Strip */}
      <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-xs text-neutral-200">16-Step Lo-Fi Drum Sequencer</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-neutral-400">BPM</span>
              <input
                type="number"
                min="60"
                max="160"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value) || 84)}
                className="w-14 bg-black/60 border border-white/10 rounded-lg px-2 py-0.5 text-xs font-mono text-white text-center"
              />
            </div>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
                isLooping
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isLooping ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isLooping ? 'Stop Loop' : 'Play Beat'}</span>
            </button>
          </div>
        </div>

        {/* Step Matrix */}
        <div className="flex flex-col gap-2 flex-1 justify-center">
          {['Rhodes', 'Kick', 'Snare', 'Hi-Hat'].map((label, tIdx) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-12 text-[10px] font-mono text-neutral-400">{label}</span>
              <div className="flex items-center gap-1 flex-1">
                {grid[tIdx].map((cell, sIdx) => {
                  const isCurrent = isLooping && currentStep === sIdx;
                  return (
                    <button
                      key={sIdx}
                      onClick={() => toggleGridCell(tIdx, sIdx)}
                      className={`h-7 flex-1 rounded-md transition-all ${
                        cell
                          ? isCurrent
                            ? 'bg-white shadow-md shadow-white/50 scale-105'
                            : 'bg-purple-500 border border-purple-400'
                          : isCurrent
                          ? 'bg-white/30'
                          : 'bg-white/5 border border-white/5 hover:bg-white/10'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
