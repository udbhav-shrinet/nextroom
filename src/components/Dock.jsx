import React, { useEffect, useRef, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Radio, Sliders, AudioWaveform, Sun, CheckSquare,
  Grid, MessageSquare, Palette, DoorClosed, Maximize2, Minimize2,
  Terminal, Sparkles, PlaySquare
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

export default function Dock({
  currentStation,
  isPlaying,
  isMuffled,
  onTogglePlay,
  onPrevStation,
  onNextStation,
  onToggleMuffle,
  openWindows,
  onToggleWindow,
  zenMode,
  setZenMode,
  onOpenCommandBar,
  onSilenceAll
}) {
  const [volume, setVolume] = useState(audioEngine.volume);
  const [muted, setMuted] = useState(false);
  const spectrumCanvasRef = useRef(null);

  // Live mini FFT visualizer inside the dock
  useEffect(() => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const data = audioEngine.getSpectrumData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 20;
      const barWidth = canvas.width / barCount;

      for (let i = 0; i < barCount; i++) {
        const val = data[i * 4] || 0;
        const height = (val / 255) * canvas.height;
        const x = i * barWidth;
        const y = canvas.height - height;

        ctx.fillStyle = isMuffled
          ? 'rgba(251, 146, 60, 0.75)'
          : isPlaying
          ? 'rgba(192, 132, 252, 0.85)'
          : 'rgba(255, 255, 255, 0.15)';

        ctx.fillRect(x + 1, y, barWidth - 2, height);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isMuffled]);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    if (val > 0 && muted) {
      setMuted(false);
      audioEngine.setMute(false);
    }
  };

  const handleMuteToggle = () => {
    const next = !muted;
    setMuted(next);
    audioEngine.setMute(next);
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        zenMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-3.5 text-sm shadow-2xl border border-purple-500/30">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevStation}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Previous Station"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={onNextStation}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Next Station"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Station Info & Live Mini Spectrum */}
        <div className="flex items-center gap-3 px-3 py-1 bg-black/40 rounded-xl border border-white/5 max-w-[220px]">
          <canvas
            ref={spectrumCanvasRef}
            width={48}
            height={18}
            className="w-12 h-4.5 rounded-sm"
          />

          <div className="overflow-hidden flex flex-col justify-center">
            <div className="font-mono text-xs font-semibold text-purple-200 truncate">
              {currentStation?.name || 'Sanctuary Standby'}
            </div>
            <div className="text-[10px] text-neutral-400 truncate flex items-center gap-1.5">
              <span className={`dot-pill ${isPlaying ? 'active' : 'inactive'}`} />
              <span>{isPlaying ? currentStation?.genre || 'Playing' : 'Paused / Silent'}</span>
            </div>
          </div>
        </div>

        {/* Volume Slider & Mute */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMuteToggle}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 accent-purple-400 cursor-pointer"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-white/10" />

        {/* Next Room / Door Muffle Hardware Switch */}
        <button
          onClick={onToggleMuffle}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer ${
            isMuffled
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/20'
              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
          title="Hardware Next Room Filter: 380Hz low-pass + room reverb"
        >
          <DoorClosed className="w-3.5 h-3.5 text-amber-400" />
          <span>Next Room</span>
          <span className={`dot-pill ${isMuffled ? 'active !bg-amber-400 !shadow-amber-400' : 'inactive'}`} />
        </button>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-white/10" />

        {/* Floating Windows Launchers */}
        <div className="flex items-center gap-1">
          {[
            { id: 'youtube', icon: PlaySquare, label: 'YouTube Audio Search', color: 'hover:text-red-400' },
            { id: 'radio', icon: Radio, label: 'Radio (40,000+ Stations)' },
            { id: 'equalizer', icon: Sliders, label: 'Studio EQ Rack' },
            { id: 'mixer', icon: AudioWaveform, label: '36-Stem Mixer' },
            { id: 'lighting', icon: Sun, label: 'Room Lighting & Optics' },
            { id: 'productivity', icon: CheckSquare, label: 'Focus & Wellness' },
            { id: 'sampler', icon: Grid, label: 'Lo-Fi Sampler & Looper' },
            { id: 'lounge', icon: MessageSquare, label: 'Live Mesh Lounge' },
            { id: 'themes', icon: Palette, label: 'Themes & Wallpapers' },
          ].map(tool => {
            const Icon = tool.icon;
            const isOpen = openWindows[tool.id];
            return (
              <button
                key={tool.id}
                onClick={() => onToggleWindow(tool.id)}
                className={`p-2 rounded-xl transition-all relative cursor-pointer ${
                  isOpen
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                    : `text-neutral-400 hover:text-white hover:bg-white/10 ${tool.color || ''}`
                }`}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
                {isOpen && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-white/10" />

        {/* Command Bar & Zen Mode */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenCommandBar}
            className="p-1.5 px-2 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:border-purple-400/50 font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Command Palette (: or Ctrl+K)"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>:</span>
          </button>

          <button
            onClick={() => setZenMode(!zenMode)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={zenMode ? 'Exit Zen Mode (Z)' : 'Zen Mode (Z)'}
          >
            {zenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
