import React, { useState, useEffect } from 'react';
import { Clock, CloudSun, CheckCircle2, Droplets, Maximize2, Minimize2, Sparkles } from 'lucide-react';

export default function HudBar({
  pomoStats,
  activeLockedTask,
  onUnlockTask,
  zenMode,
  setZenMode,
  onOpenProductivity
}) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`fixed top-4 inset-x-8 z-40 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
        zenMode ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Left: Clock & Date Chip */}
      <div className="glass-panel px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-3 pointer-events-auto">
        <Clock className="w-3.5 h-3.5 text-purple-400" />
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="font-bold text-white tracking-wide">{timeStr}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-300 text-[11px]">{dateStr}</span>
        </div>
      </div>

      {/* Center: Locked In Task or Sanctuary Status */}
      <div className="glass-panel px-4 py-1.5 rounded-xl border border-purple-500/30 flex items-center gap-2 pointer-events-auto shadow-md">
        {activeLockedTask ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="dot-pill active" />
            <span className="font-mono text-purple-300 font-semibold">LOCKED IN:</span>
            <span className="text-neutral-100 truncate max-w-xs">{activeLockedTask.text}</span>
            <button
              onClick={onUnlockTask}
              className="ml-1 text-[10px] text-neutral-400 hover:text-white"
              title="Unlock task"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>NEXTROOM // 24/7 LIVING SANCTUARY</span>
          </div>
        )}
      </div>

      {/* Right: Pomodoro Session 🍅 & Zen Button */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onOpenProductivity}
          className="glass-panel px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs font-mono text-neutral-200 hover:border-purple-400/40 transition-colors"
          title="Open Focus & Productivity Suite"
        >
          <span>🍅 {pomoStats.todaySessions} / 8</span>
          <span className="text-neutral-500">•</span>
          <span className="text-purple-300">{pomoStats.totalMinutes}m focus</span>
        </button>

        <button
          onClick={() => setZenMode(!zenMode)}
          className="glass-panel p-2 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:border-purple-400/40 transition-colors"
          title={zenMode ? 'Exit Zen Mode (Z)' : 'Zen Mode (Z)'}
        >
          {zenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
