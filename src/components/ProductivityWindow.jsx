import React, { useState, useEffect } from 'react';
import {
  Timer, CheckSquare, FileText, Wind, Droplets, CloudSun,
  Globe, Play, Pause, RotateCcw, Plus, Trash2, Pin, Download, Sparkles
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { getLiveWeather, searchCities } from '../services/radioApi';

export default function ProductivityWindow({
  activeLockedTask,
  setActiveLockedTask,
  stickyNotes,
  setStickyNotes,
  pomoStats,
  setPomoStats
}) {
  const [activeTab, setActiveTab] = useState('pomo'); // 'pomo' | 'todo' | 'notes' | 'breathe' | 'water' | 'weather' | 'world'

  // -------------------------------------------------------------
  // 1. Pomodoro Timer State
  // -------------------------------------------------------------
  const [pomoMode, setPomoMode] = useState('focus'); // 'focus' | 'break'
  const [pomoDuration, setPomoDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPomoRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isPomoRunning && timeLeft === 0) {
      // Completed session
      audioEngine.playPad(6); // Singing bowl chime
      if (pomoMode === 'focus') {
        setPomoStats(prev => ({
          ...prev,
          todaySessions: prev.todaySessions + 1,
          totalMinutes: prev.totalMinutes + Math.round(pomoDuration / 60)
        }));
        setPomoMode('break');
        setTimeLeft(5 * 60);
        audioEngine.toggleDoorMuffle(true); // Auto-muffle on break
      } else {
        setPomoMode('focus');
        setTimeLeft(pomoDuration);
        audioEngine.toggleDoorMuffle(false);
      }
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, timeLeft, pomoMode, pomoDuration, setPomoStats]);

  const togglePomo = () => setIsPomoRunning(!isPomoRunning);
  const resetPomo = () => {
    setIsPomoRunning(false);
    setTimeLeft(pomoDuration);
  };
  const setPomoTime = (mins) => {
    setIsPomoRunning(false);
    setPomoDuration(mins * 60);
    setTimeLeft(mins * 60);
    setPomoMode('focus');
  };

  // -------------------------------------------------------------
  // 2. To-Do Tasks State
  // -------------------------------------------------------------
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_tasks');
      return saved ? JSON.parse(saved) : [
        { id: 1, text: 'Refine audio DSP equalization curve', priority: 'P1', done: false, pomos: 2 },
        { id: 2, text: 'Calibrate warm desk lamp Kelvin temperature', priority: 'P2', done: true, pomos: 1 },
        { id: 3, text: 'Explore Japanese jazz and lofi radio frequencies', priority: 'P3', done: false, pomos: 3 }
      ];
    } catch {
      return [];
    }
  });
  const [newTaskInput, setNewTaskInput] = useState('');

  useEffect(() => {
    try { localStorage.setItem('nr_tasks', JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const task = {
      id: Date.now(),
      text: newTaskInput.trim(),
      priority: newTaskInput.includes('!p1') ? 'P1' : newTaskInput.includes('!p2') ? 'P2' : 'P3',
      done: false,
      pomos: 1
    };
    setTasks([task, ...tasks]);
    setNewTaskInput('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (!t.done) audioEngine.playPad(7); // Plink chime
        return { ...t, done: !t.done };
      }
      return t;
    }));
  };

  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));

  // -------------------------------------------------------------
  // 3. Markdown Notes State
  // -------------------------------------------------------------
  const [noteContent, setNoteContent] = useState(() => {
    try {
      return localStorage.getItem('nr_notes') || '# NextRoom Sanctuary Notes\n\n- Living room art with physical desk lamp dimmer\n- 40,000+ real radio stations worldwide via Radio-Browser API\n- Studio DSP rack with Next Room door muffle switch\n- Offline procedural audio synth so it never stays silent';
    } catch {
      return '';
    }
  });

  const saveNotes = (val) => {
    setNoteContent(val);
    try { localStorage.setItem('nr_notes', val); } catch {}
  };

  const pinAsStickyNote = () => {
    const lines = noteContent.split('\n').filter(Boolean);
    const title = lines[0]?.replace(/^#+\s*/, '') || 'Sticky Note';
    const content = lines.slice(1, 4).join('\n') || 'Important sanctuary task';
    const colors = ['#fef08a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#fed7aa'];
    const newNote = {
      id: Date.now(),
      title: title.slice(0, 24),
      content: content.slice(0, 100),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.floor(Math.random() * 8) - 4
    };
    setStickyNotes([...stickyNotes, newNote]);
    audioEngine.playPad(0);
  };

  // -------------------------------------------------------------
  // 4. Breathing Pacer State
  // -------------------------------------------------------------
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [breathScale, setBreathScale] = useState(1);
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    if (!isBreathing) return;
    let timer;
    const cycle = async () => {
      // Box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold
      setBreathPhase('Inhale (4s)');
      setBreathScale(1.6);
      await new Promise(r => setTimeout(r, 4000));
      if (!isBreathing) return;

      setBreathPhase('Hold (4s)');
      await new Promise(r => setTimeout(r, 4000));
      if (!isBreathing) return;

      setBreathPhase('Exhale (4s)');
      setBreathScale(1.0);
      await new Promise(r => setTimeout(r, 4000));
      if (!isBreathing) return;

      setBreathPhase('Hold (4s)');
      await new Promise(r => setTimeout(r, 4000));
      if (isBreathing) cycle();
    };
    cycle();
    return () => clearTimeout(timer);
  }, [isBreathing]);

  // -------------------------------------------------------------
  // 5. Water Hydration Tracker State
  // -------------------------------------------------------------
  const [waterMl, setWaterMl] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_water');
      return saved ? parseInt(saved, 10) : 750;
    } catch {
      return 750;
    }
  });
  const waterGoal = 2500;

  const addWater = (amount) => {
    const next = Math.min(waterGoal + 1000, waterMl + amount);
    setWaterMl(next);
    audioEngine.playPad(7);
    try { localStorage.setItem('nr_water', String(next)); } catch {}
  };

  // -------------------------------------------------------------
  // 6. Weather State (Open-Meteo)
  // -------------------------------------------------------------
  const [weatherData, setWeatherData] = useState(null);
  const [citySearch, setCitySearch] = useState('Tokyo');

  useEffect(() => {
    getLiveWeather().then(data => setWeatherData(data));
  }, []);

  // -------------------------------------------------------------
  // 7. Pinned World Clock Cities
  // -------------------------------------------------------------
  const [worldCities] = useState([
    { name: 'Tokyo', zone: 'Asia/Tokyo', flag: '🇯🇵' },
    { name: 'Paris', zone: 'Europe/Paris', flag: '🇫🇷' },
    { name: 'London', zone: 'Europe/London', flag: '🇬🇧' },
    { name: 'New York', zone: 'America/New_York', flag: '🇺🇸' },
    { name: 'San Francisco', zone: 'America/Los_Angeles', flag: '🇺🇸' },
    { name: 'Zurich', zone: 'Europe/Zurich', flag: '🇨🇭' }
  ]);

  const formatPomoTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Nav Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/10 custom-scrollbar">
        {[
          { id: 'pomo', label: 'Pomodoro', icon: Timer },
          { id: 'todo', label: 'To-Do', icon: CheckSquare },
          { id: 'notes', label: 'Notes', icon: FileText },
          { id: 'breathe', label: 'Breathing', icon: Wind },
          { id: 'water', label: 'Water', icon: Droplets },
          { id: 'weather', label: 'Weather', icon: CloudSun },
          { id: 'world', label: 'World Clock', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-white bg-white/5 border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Pomodoro View */}
      {activeTab === 'pomo' && (
        <div className="flex flex-col items-center justify-between flex-1 py-4">
          {/* Preset Buttons */}
          <div className="flex items-center gap-2">
            {[25, 50, 90].map(mins => (
              <button
                key={mins}
                onClick={() => setPomoTime(mins)}
                className={`px-3 py-1 rounded-lg text-xs font-mono border ${
                  pomoDuration === mins * 60
                    ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                {mins}m Focus
              </button>
            ))}
          </div>

          {/* Big Circular Timer Display */}
          <div className="flex flex-col items-center justify-center my-6">
            <div className="text-6xl font-mono font-bold tracking-tight text-white mb-2">
              {formatPomoTime(timeLeft)}
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-purple-400 flex items-center gap-2">
              <span className={`dot-pill ${isPomoRunning ? 'active' : 'inactive'}`} />
              <span>{pomoMode === 'focus' ? 'Deep Focus Session' : 'Restorative Break'}</span>
            </div>
          </div>

          {/* Play/Pause & Reset */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePomo}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
            >
              {isPomoRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPomoRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={resetPomo}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Session Stats Counter */}
          <div className="w-full pt-4 border-t border-white/10 flex items-center justify-around text-xs font-mono text-neutral-400">
            <div>
              Today: <span className="text-purple-300 font-bold">{pomoStats.todaySessions} 🍅</span>
            </div>
            <div>
              Minutes: <span className="text-purple-300 font-bold">{pomoStats.totalMinutes}m</span>
            </div>
            <div>
              Goal: <span className="text-purple-300 font-bold">8 🍅</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. To-Do View */}
      {activeTab === 'todo' && (
        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          {/* New Task Input */}
          <form onSubmit={addTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              placeholder="Add task... (e.g. Master mix balance !p1)"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono transition-colors"
            >
              Add
            </button>
          </form>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {tasks.map(t => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggleTask(t.id)}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                  <span className={`text-xs ${t.done ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                    {t.text}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-purple-400 border border-purple-500/20">
                    {t.priority}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setActiveLockedTask(t)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-600/20 text-purple-300 hover:bg-purple-600/40"
                    title="Lock into top HUD"
                  >
                    Lock In
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1 text-neutral-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Notes View */}
      {activeTab === 'notes' && (
        <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400">
              {noteContent.split(/\s+/).filter(Boolean).length} words | {noteContent.length} chars
            </span>
            <button
              onClick={pinAsStickyNote}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Pin className="w-3.5 h-3.5" />
              <span>Pin to Room Wall</span>
            </button>
          </div>
          <textarea
            value={noteContent}
            onChange={(e) => saveNotes(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-xs text-neutral-200 focus:outline-none focus:border-purple-400 resize-none leading-relaxed custom-scrollbar"
            placeholder="Write your markdown thoughts or scratchpad ideas here..."
          />
        </div>
      )}

      {/* 4. Breathing View */}
      {activeTab === 'breathe' && (
        <div className="flex flex-col items-center justify-center flex-1 py-4 gap-6">
          <div className="relative flex items-center justify-center w-52 h-52">
            {/* Outer halo */}
            <div
              className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl transition-all duration-1000"
              style={{ transform: `scale(${breathScale})` }}
            />
            {/* Main breathing orb */}
            <div
              className="w-36 h-36 rounded-full border border-purple-400/50 bg-gradient-to-tr from-purple-600/40 to-cyan-500/30 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 transition-transform duration-1000 shadow-xl"
              style={{ transform: `scale(${breathScale})` }}
            >
              <span className="font-mono text-xs font-semibold text-white">
                {isBreathing ? breathPhase : 'Ready'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsBreathing(!isBreathing)}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold transition-colors"
          >
            {isBreathing ? 'Stop Exercise' : 'Begin Box Breathing'}
          </button>
        </div>
      )}

      {/* 5. Water Hydration View */}
      {activeTab === 'water' && (
        <div className="flex flex-col items-center justify-between flex-1 py-4">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-white mb-1">
              {waterMl} <span className="text-sm font-normal text-neutral-400">/ {waterGoal} ml</span>
            </div>
            <div className="text-xs font-mono text-cyan-400">
              {Math.round((waterMl / waterGoal) * 100)}% of daily hydration goal
            </div>
          </div>

          {/* Animated Water Level Bottle */}
          <div className="w-20 h-40 rounded-2xl border-2 border-cyan-400/40 bg-black/40 overflow-hidden relative flex flex-col justify-end p-1">
            <div
              className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-xl transition-all duration-500"
              style={{ height: `${Math.min(100, (waterMl / waterGoal) * 100)}%` }}
            />
          </div>

          {/* Quick-add buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => addWater(250)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 border border-cyan-500/30 text-xs font-mono"
            >
              +250 ml Glass
            </button>
            <button
              onClick={() => addWater(500)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 border border-cyan-500/30 text-xs font-mono"
            >
              +500 ml Bottle
            </button>
          </div>
        </div>
      )}

      {/* 6. Weather View */}
      {activeTab === 'weather' && (
        <div className="flex flex-col gap-4 flex-1">
          {weatherData ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {weatherData.current?.temperature_2m || 20}°C
                  </div>
                  <div className="text-xs text-neutral-400">Feels like {weatherData.current?.apparent_temperature || 19}°C</div>
                </div>
                <CloudSun className="w-10 h-10 text-amber-400" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-300 pt-2 border-t border-white/5">
                <div>Humidity: {weatherData.current?.relative_humidity_2m}%</div>
                <div>Wind: {weatherData.current?.wind_speed_10m} km/h</div>
                <div>Precipitation: {weatherData.current?.precipitation} mm</div>
                <div>Status: Optimal Focus</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-400 font-mono animate-pulse">
              Retrieving satellite telemetry...
            </div>
          )}
        </div>
      )}

      {/* 7. World Clock View */}
      {activeTab === 'world' && (
        <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {worldCities.map(city => {
            const timeStr = new Date().toLocaleTimeString('en-US', {
              timeZone: city.zone,
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            return (
              <div
                key={city.name}
                className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <span>{city.flag}</span>
                    <span>{city.name}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">{city.zone}</div>
                </div>
                <div className="font-mono text-sm font-bold text-purple-300">{timeStr}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
