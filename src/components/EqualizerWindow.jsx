import React, { useState, useEffect, useRef } from 'react';
import { Sliders, RotateCcw, Sparkles, Volume2, Waves, Radio, DoorClosed } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

const EQ_PRESETS = [
  { name: 'Flat Reference', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Deep Sub Bass', gains: [8, 6, 4, 1, 0, 0, 0, 0, 1, 2] },
  { name: 'Bass Boost', gains: [6, 5, 4, 2, 0, 0, 0, 0, 1, 2] },
  { name: 'Treble Boost', gains: [-1, -1, 0, 1, 2, 4, 5, 6, 7, 8] },
  { name: 'Lo-Fi Telephone', gains: [-12, -8, -4, 2, 6, 7, 5, -2, -8, -12] },
  { name: 'Warm Vinyl 70s', gains: [4, 5, 3, 2, 1, 0, -1, -2, -3, -5] },
  { name: 'Late Night Study', gains: [3, 2, 1, 0, -1, -2, -1, 0, 1, 2] },
  { name: 'Vocal Presence', gains: [-2, -1, 0, 2, 5, 6, 4, 2, 1, 0] },
  { name: 'Crisp Acoustic', gains: [2, 1, 0, 1, 2, 3, 4, 5, 6, 7] },
  { name: 'Cyberpunk Club', gains: [9, 7, 3, -1, -2, 2, 4, 6, 7, 8] },
  { name: 'AM Car Radio', gains: [-10, -5, 2, 5, 6, 4, 0, -5, -10, -12] },
  { name: 'Cassette Deck', gains: [3, 3, 2, 1, 0, -1, -2, -3, -6, -8] },
  { name: 'Cathedral Air', gains: [1, 2, 0, 0, 2, 3, 5, 6, 8, 9] },
  { name: 'Headphone Warmth', gains: [5, 4, 2, 1, 0, 0, 1, 2, 2, 1] },
  { name: 'Mellow Focus', gains: [2, 2, 1, 0, -1, -2, -2, -1, 0, 1] }
];

export default function EqualizerWindow({ isMuffled, onToggleMuffle }) {
  const [eqGains, setEqGains] = useState([...audioEngine.eqGains]);
  const [saturation, setSaturation] = useState(audioEngine.saturationAmount);
  const [reverb, setReverb] = useState(audioEngine.reverbWet);
  const [orbit, setOrbit] = useState(audioEngine.orbit8D);
  const [varispeed, setVarispeed] = useState(audioEngine.varispeed);
  const [activePreset, setActivePreset] = useState('Flat Reference');
  const spectrumCanvasRef = useRef(null);

  // Live FFT spectrum analyzer
  useEffect(() => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const data = audioEngine.getSpectrumData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const count = 48;
      const barWidth = canvas.width / count;

      // Draw response fill
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      for (let i = 0; i < count; i++) {
        const val = data[i * 2] || 0;
        const h = (val / 255) * canvas.height;
        const x = i * barWidth;
        const y = canvas.height - h;

        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
      grad.addColorStop(1, 'rgba(192, 132, 252, 0.02)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Top glowing stroke line
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const val = data[i * 2] || 0;
        const h = (val / 255) * canvas.height;
        const x = i * barWidth;
        const y = canvas.height - h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleBandChange = (idx, val) => {
    const next = [...eqGains];
    next[idx] = parseFloat(val);
    setEqGains(next);
    audioEngine.setBandGain(idx, parseFloat(val));
    setActivePreset('Custom');
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.name);
    setEqGains([...preset.gains]);
    audioEngine.setEqPreset(preset.gains);
  };

  const handleReset = () => {
    applyPreset(EQ_PRESETS[0]);
    setSaturation(0);
    audioEngine.setSaturation(0);
    setReverb(0.2);
    audioEngine.setReverbWet(0.2);
    setOrbit(false);
    audioEngine.set8DOrbit(false);
    setVarispeed(1.0);
    audioEngine.setVarispeed(1.0);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top Visualizer Canvas & Presets Bar */}
      <div className="flex flex-col gap-2">
        <div className="relative h-24 bg-black/50 rounded-xl overflow-hidden border border-white/10">
          <canvas
            ref={spectrumCanvasRef}
            width={480}
            height={96}
            className="w-full h-full"
          />
          <div className="absolute top-2 left-3 font-mono text-[10px] text-neutral-400">
            FFT 128-BIN REAL-TIME SPECTRUM
          </div>
          <div className="absolute top-2 right-3 font-mono text-[10px] text-purple-300">
            {activePreset}
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {EQ_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap border transition-all ${
                activePreset === preset.name
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-sm'
                  : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 10-Band Graphic EQ Vertical Faders */}
      <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between gap-1">
        {audioEngine.eqFrequencies.map((freq, idx) => {
          const freqLabel = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
          const gain = eqGains[idx] || 0;
          return (
            <div key={freq} className="flex flex-col items-center gap-2 flex-1">
              <span className="font-mono text-[10px] text-purple-300">
                {gain > 0 ? `+${gain}` : gain}
              </span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={gain}
                onChange={(e) => handleBandChange(idx, e.target.value)}
                className="h-28 -rotate-90 w-24 my-4 accent-purple-400 cursor-pointer"
              />
              <span className="font-mono text-[10px] text-neutral-400">{freqLabel}</span>
            </div>
          );
        })}
      </div>

      {/* Master DSP FX Strip: Next Room, Saturation, Reverb, 8D Orbit, Varispeed */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Next Room / Door Muffle */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DoorClosed className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-semibold text-neutral-200">Next Room Door Muffle</div>
              <div className="text-[10px] text-neutral-400">380Hz 24dB LPF + Reverb</div>
            </div>
          </div>
          <button
            onClick={onToggleMuffle}
            className={`px-3 py-1 rounded-lg font-mono text-xs border transition-all ${
              isMuffled
                ? 'bg-amber-500/30 border-amber-500 text-amber-200'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            {isMuffled ? 'ENGAGED' : 'OFF'}
          </button>
        </div>

        {/* 8D Auto-Orbit Panner */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-semibold text-neutral-200">8D Audio Orbit</div>
              <div className="text-[10px] text-neutral-400">Circular LFO Panner</div>
            </div>
          </div>
          <button
            onClick={() => {
              const next = !orbit;
              setOrbit(next);
              audioEngine.set8DOrbit(next);
            }}
            className={`px-3 py-1 rounded-lg font-mono text-xs border transition-all ${
              orbit
                ? 'bg-cyan-500/30 border-cyan-500 text-cyan-200'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            {orbit ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        {/* Tube Saturation Slider */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-neutral-300">Tape/Tube Saturation</span>
            <span className="text-purple-300">{Math.round(saturation * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={saturation}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setSaturation(val);
              audioEngine.setSaturation(val);
            }}
            className="w-full accent-purple-400"
          />
        </div>

        {/* Algorithmic Reverb Wet Slider */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-neutral-300">Space & Reverb</span>
            <span className="text-purple-300">{Math.round(reverb * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={reverb}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setReverb(val);
              audioEngine.setReverbWet(val);
            }}
            className="w-full accent-purple-400"
          />
        </div>
      </div>

      {/* Varispeed Pitch & Speed (Nightcore vs Slowed + Reverb) */}
      <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-2">
        <div className="flex justify-between font-mono text-[11px]">
          <span className="text-neutral-300">Varispeed Pitch & Speed</span>
          <span className="text-purple-300">
            {varispeed < 0.95 ? 'Slowed + Reverb' : varispeed > 1.05 ? 'Nightcore Speed' : 'Standard 1.0x'} ({varispeed}x)
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={varispeed}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setVarispeed(val);
            audioEngine.setVarispeed(val);
          }}
          className="w-full accent-purple-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-neutral-500">
          <span>0.5x (Slowed)</span>
          <span>1.0x (Original)</span>
          <span>1.5x (Nightcore)</span>
        </div>
      </div>

      {/* Bottom Reset Action */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Rack DSP</span>
        </button>
      </div>
    </div>
  );
}
