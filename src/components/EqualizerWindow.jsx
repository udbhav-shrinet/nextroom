import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders, RotateCcw, Sparkles, Volume2, Waves, Radio,
  DoorClosed, Disc, Radio as RadioIcon, Activity
} from 'lucide-react';
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
  const [vizSkin, setVizSkin] = useState('spectrum'); // 'spectrum' | 'waveform' | 'vu'
  const canvasRef = useRef(null);

  // Live Multi-Skin Audio Visualizer (Spectrum, Oscilloscope, VU Meters)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (vizSkin === 'spectrum') {
        const data = audioEngine.getSpectrumData();
        const count = 48;
        const barWidth = canvas.width / count;

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

      } else if (vizSkin === 'waveform') {
        // Oscilloscope Trace
        const wave = audioEngine.getWaveformData();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();

        const sliceWidth = canvas.width / wave.length;
        let x = 0;
        for (let i = 0; i < wave.length; i++) {
          const v = wave[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();

      } else if (vizSkin === 'vu') {
        // Dual Stereo VU Needles
        const data = audioEngine.getSpectrumData();
        const leftVal = (data[4] || 0) / 255;
        const rightVal = (data[8] || 0) / 255;

        // Draw Left and Right VU Meters
        const drawNeedle = (centerX, centerY, radius, value, label) => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Needle angle (-135deg to -45deg)
          const angle = Math.PI + 0.3 + value * (Math.PI - 0.6);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(angle) * (radius - 5), centerY + Math.sin(angle) * (radius - 5));
          ctx.strokeStyle = value > 0.85 ? '#ef4444' : '#c084fc';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#a3a3a3';
          ctx.font = '9px monospace';
          ctx.fillText(label, centerX - 8, centerY + 12);
        };

        drawNeedle(canvas.width * 0.3, canvas.height * 0.75, 45, leftVal, 'CH L');
        drawNeedle(canvas.width * 0.7, canvas.height * 0.75, 45, rightVal, 'CH R');
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [vizSkin]);

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
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">
      {/* Top Visualizer Canvas & Multi-Skin Selector */}
      <div className="flex flex-col gap-2">
        <div className="relative h-28 bg-black/50 rounded-2xl overflow-hidden border border-white/10">
          <canvas
            ref={canvasRef}
            width={480}
            height={112}
            className="w-full h-full"
          />
          <div className="absolute top-2 left-3 font-mono text-[10px] text-neutral-400">
            MASTER DSP MONITOR // {vizSkin.toUpperCase()}
          </div>
          <div className="absolute top-2 right-3 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
            <button
              onClick={() => setVizSkin('spectrum')}
              className={`${vizSkin === 'spectrum' ? 'text-purple-300 font-bold' : 'text-neutral-400'}`}
            >
              FFT
            </button>
            <span className="text-neutral-600">|</span>
            <button
              onClick={() => setVizSkin('waveform')}
              className={`${vizSkin === 'waveform' ? 'text-purple-300 font-bold' : 'text-neutral-400'}`}
            >
              Wave
            </button>
            <span className="text-neutral-600">|</span>
            <button
              onClick={() => setVizSkin('vu')}
              className={`${vizSkin === 'vu' ? 'text-purple-300 font-bold' : 'text-neutral-400'}`}
            >
              VU
            </button>
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

      {/* Master DSP FX Grid: Next Room, 8D Orbit, Saturation, Reverb */}
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
              <div className="text-[10px] text-neutral-400">Headphone LFO Panner</div>
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

      {/* Varispeed Pitch & Speed */}
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

      {/* Reset Action */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Master DSP</span>
        </button>
      </div>
    </div>
  );
}
