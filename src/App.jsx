import React, { useState, useEffect } from 'react';
import {
  Radio, Sliders, AudioWaveform, Sun, CheckSquare,
  Grid, MessageSquare, Palette
} from 'lucide-react';

import { THEMES } from './constants/themes';
import { SCENES } from './constants/scenes';
import { FLAGSHIP_STATIONS } from './constants/flagshipStations';
import { audioEngine } from './audio/audioEngine';

import RoomCanvas from './components/RoomCanvas';
import Dock from './components/Dock';
import { WindowFrame } from './components/WindowManager';
import RadioWindow from './components/RadioWindow';
import EqualizerWindow from './components/EqualizerWindow';
import MixerWindow from './components/MixerWindow';
import LightingWindow from './components/LightingWindow';
import ProductivityWindow from './components/ProductivityWindow';
import SamplerWindow from './components/SamplerWindow';
import LoungeWindow from './components/LoungeWindow';
import ThemesWindow from './components/ThemesWindow';
import CommandBar from './components/CommandBar';
import HudBar from './components/HudBar';
import BootOverlay from './components/BootOverlay';

export default function App() {
  const [isBooted, setIsBooted] = useState(() => {
    return false; // Always require unlock gesture once per session to satisfy audio policy
  });

  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_theme');
      return saved ? JSON.parse(saved) : THEMES[0];
    } catch {
      return THEMES[0];
    }
  });

  const [currentScene, setCurrentScene] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_scene');
      return saved ? JSON.parse(saved) : SCENES[0];
    } catch {
      return SCENES[0];
    }
  });

  const [currentStation, setCurrentStation] = useState(FLAGSHIP_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuffled, setIsMuffled] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  // Lighting state
  const [lighting, setLighting] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_lighting');
      return saved ? JSON.parse(saved) : {
        lampActive: true,
        lampDimmer: 0.85,
        lampWarmth: 3200,
        lampX: 28,
        lampY: 62,
        midnightDimmer: 0,
        rainDensity: 0.45,
        fogDensity: 0,
        fireplaceActive: false,
        neonActive: true,
        neonText: 'NEXTROOM // 24/7 SANCTUARY',
        neonColor: '#c084fc',
        crtEffect: false
      };
    } catch {
      return {
        lampActive: true,
        lampDimmer: 0.85,
        lampWarmth: 3200,
        lampX: 28,
        lampY: 62,
        midnightDimmer: 0,
        rainDensity: 0.45,
        fogDensity: 0,
        fireplaceActive: false,
        neonActive: true,
        neonText: 'NEXTROOM // 24/7 SANCTUARY',
        neonColor: '#c084fc',
        crtEffect: false
      };
    }
  });

  // Sticky notes on room wall
  const [stickyNotes, setStickyNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_sticky_notes');
      return saved ? JSON.parse(saved) : [
        { id: 1, title: 'Studio Focus', content: 'Explore 40,000+ stations worldwide\nDoor Muffle: 380Hz LPF', color: '#fef08a', rotation: -2 },
        { id: 2, title: 'Deep Work Intent', content: 'NextRoom OS — offline synth ready\nTouch props for tactile audio', color: '#bae6fd', rotation: 3 }
      ];
    } catch {
      return [];
    }
  });

  // Productivity states
  const [pomoStats, setPomoStats] = useState({ todaySessions: 3, totalMinutes: 75 });
  const [activeLockedTask, setActiveLockedTask] = useState(null);

  // Window states & z-index
  const [openWindows, setOpenWindows] = useState({
    radio: false,
    equalizer: false,
    mixer: false,
    lighting: false,
    productivity: false,
    sampler: false,
    lounge: false,
    themes: false
  });
  const [windowZIndices, setWindowZIndices] = useState({
    radio: 30,
    equalizer: 31,
    mixer: 32,
    lighting: 33,
    productivity: 34,
    sampler: 35,
    lounge: 36,
    themes: 37
  });

  // Apply CSS Variables for dynamic Theme changes
  useEffect(() => {
    if (!currentTheme) return;
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', currentTheme.bg);
    root.style.setProperty('--bg-secondary', currentTheme.secondary || currentTheme.bg);
    root.style.setProperty('--bg-panel', currentTheme.panel);
    root.style.setProperty('--accent-color', currentTheme.accent);
    root.style.setProperty('--accent-glow', currentTheme.accentGlow || 'rgba(192, 132, 252, 0.35)');
    root.style.setProperty('--border-color', currentTheme.border);
    root.style.setProperty('--text-main', currentTheme.text);
    root.style.setProperty('--text-muted', currentTheme.muted);
    try { localStorage.setItem('nr_theme', JSON.stringify(currentTheme)); } catch {}
  }, [currentTheme]);

  // Persist lighting and scene
  useEffect(() => {
    try { localStorage.setItem('nr_lighting', JSON.stringify(lighting)); } catch {}
  }, [lighting]);

  useEffect(() => {
    try { localStorage.setItem('nr_scene', JSON.stringify(currentScene)); } catch {}
  }, [currentScene]);

  useEffect(() => {
    try { localStorage.setItem('nr_sticky_notes', JSON.stringify(stickyNotes)); } catch {}
  }, [stickyNotes]);

  // Audio Engine listeners
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((event, data) => {
      if (event === 'playState') {
        setIsPlaying(data.isPlaying);
      } else if (event === 'stationChanged') {
        setCurrentStation(data);
        setIsPlaying(true);
      } else if (event === 'muffleChanged') {
        setIsMuffled(data);
      }
    });
    return unsubscribe;
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        audioEngine.togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        audioEngine.toggleDoorMuffle(!audioEngine.isMuffled);
      } else if (e.key === 'z' || e.key === 'Z') {
        setZenMode(prev => !prev);
      } else if (e.key === ':' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setCommandBarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTuneIn = () => {
    setIsBooted(true);
    audioEngine.playStation(currentStation);
  };

  const handleSelectStation = (station) => {
    setCurrentStation(station);
    audioEngine.playStation(station);
  };

  const handleTogglePlay = () => {
    audioEngine.togglePlay();
  };

  const handlePrevStation = () => {
    const idx = FLAGSHIP_STATIONS.findIndex(s => s.id === currentStation?.id);
    const prevIdx = idx <= 0 ? FLAGSHIP_STATIONS.length - 1 : idx - 1;
    handleSelectStation(FLAGSHIP_STATIONS[prevIdx]);
  };

  const handleNextStation = () => {
    const idx = FLAGSHIP_STATIONS.findIndex(s => s.id === currentStation?.id);
    const nextIdx = idx >= FLAGSHIP_STATIONS.length - 1 ? 0 : idx + 1;
    handleSelectStation(FLAGSHIP_STATIONS[nextIdx]);
  };

  const handleToggleMuffle = () => {
    audioEngine.toggleDoorMuffle(!audioEngine.isMuffled);
  };

  const toggleWindow = (id) => {
    setOpenWindows(prev => {
      const nextOpen = !prev[id];
      if (nextOpen) bringToFront(id);
      return { ...prev, [id]: nextOpen };
    });
  };

  const bringToFront = (id) => {
    setWindowZIndices(prev => {
      const highest = Math.max(...Object.values(prev), 30);
      return { ...prev, [id]: highest + 1 };
    });
  };

  const handleApplyVibe = (vibe) => {
    if (vibe.station) handleSelectStation(vibe.station);
    if (vibe.themeId) {
      const t = THEMES.find(th => th.id === vibe.themeId);
      if (t) setCurrentTheme(t);
    }
    if (vibe.sceneId) {
      const sc = SCENES.find(s => s.id === vibe.sceneId);
      if (sc) setCurrentScene(sc);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      {/* 1. Boot Gate Screen */}
      {!isBooted && <BootOverlay onUnlock={handleTuneIn} />}

      {/* 2. 95% Viewport Living Room Layer */}
      <RoomCanvas
        scene={currentScene}
        lighting={lighting}
        setLighting={setLighting}
        stickyNotes={stickyNotes}
        setStickyNotes={setStickyNotes}
        onOpenNotes={() => toggleWindow('productivity')}
      />

      {/* 3. Top Productivity HUD Bar */}
      <HudBar
        pomoStats={pomoStats}
        activeLockedTask={activeLockedTask}
        onUnlockTask={() => setActiveLockedTask(null)}
        zenMode={zenMode}
        setZenMode={setZenMode}
        onOpenProductivity={() => toggleWindow('productivity')}
      />

      {/* 4. Draggable Floating Translucent Windows */}
      {/* Window: Radio */}
      <WindowFrame
        id="radio"
        title="WORLD RADIO ENGINE // 40,000+ STATIONS"
        icon={Radio}
        isOpen={openWindows.radio}
        onClose={() => toggleWindow('radio')}
        initialPos={{ x: 60, y: 70, w: 560, h: 500 }}
        zIndex={windowZIndices.radio}
        onFocus={() => bringToFront('radio')}
      >
        <RadioWindow
          currentStation={currentStation}
          onSelectStation={handleSelectStation}
        />
      </WindowFrame>

      {/* Window: Equalizer */}
      <WindowFrame
        id="equalizer"
        title="STUDIO RACK EQUALIZER & MASTER DSP"
        icon={Sliders}
        isOpen={openWindows.equalizer}
        onClose={() => toggleWindow('equalizer')}
        initialPos={{ x: 260, y: 90, w: 580, h: 520 }}
        zIndex={windowZIndices.equalizer}
        onFocus={() => bringToFront('equalizer')}
      >
        <EqualizerWindow
          isMuffled={isMuffled}
          onToggleMuffle={handleToggleMuffle}
        />
      </WindowFrame>

      {/* Window: Mixer */}
      <WindowFrame
        id="mixer"
        title="36-STEM ENVIRONMENT, CLIMATE & VOICES MIXER"
        icon={AudioWaveform}
        isOpen={openWindows.mixer}
        onClose={() => toggleWindow('mixer')}
        initialPos={{ x: 420, y: 70, w: 580, h: 530 }}
        zIndex={windowZIndices.mixer}
        onFocus={() => bringToFront('mixer')}
      >
        <MixerWindow />
      </WindowFrame>

      {/* Window: Lighting */}
      <WindowFrame
        id="lighting"
        title="PHYSICAL ROOM LIGHTING & OPTICS"
        icon={Sun}
        isOpen={openWindows.lighting}
        onClose={() => toggleWindow('lighting')}
        initialPos={{ x: 120, y: 110, w: 460, h: 500 }}
        zIndex={windowZIndices.lighting}
        onFocus={() => bringToFront('lighting')}
      >
        <LightingWindow
          lighting={lighting}
          setLighting={setLighting}
        />
      </WindowFrame>

      {/* Window: Productivity */}
      <WindowFrame
        id="productivity"
        title="FOCUS & WELLNESS SANCTUARY SUITE"
        icon={CheckSquare}
        isOpen={openWindows.productivity}
        onClose={() => toggleWindow('productivity')}
        initialPos={{ x: 320, y: 80, w: 540, h: 520 }}
        zIndex={windowZIndices.productivity}
        onFocus={() => bringToFront('productivity')}
      >
        <ProductivityWindow
          activeLockedTask={activeLockedTask}
          setActiveLockedTask={setActiveLockedTask}
          stickyNotes={stickyNotes}
          setStickyNotes={setStickyNotes}
          pomoStats={pomoStats}
          setPomoStats={setPomoStats}
        />
      </WindowFrame>

      {/* Window: Sampler */}
      <WindowFrame
        id="sampler"
        title="8-PAD LO-FI SAMPLER & 16-STEP SEQUENCER"
        icon={Grid}
        isOpen={openWindows.sampler}
        onClose={() => toggleWindow('sampler')}
        initialPos={{ x: 200, y: 140, w: 560, h: 440 }}
        zIndex={windowZIndices.sampler}
        onFocus={() => bringToFront('sampler')}
      >
        <SamplerWindow />
      </WindowFrame>

      {/* Window: Lounge */}
      <WindowFrame
        id="lounge"
        title="SYNCHRONIZED STATION LOUNGE & VIBE SHARE"
        icon={MessageSquare}
        isOpen={openWindows.lounge}
        onClose={() => toggleWindow('lounge')}
        initialPos={{ x: 480, y: 100, w: 480, h: 480 }}
        zIndex={windowZIndices.lounge}
        onFocus={() => bringToFront('lounge')}
      >
        <LoungeWindow
          currentStation={currentStation}
          currentTheme={currentTheme}
          currentScene={currentScene}
          onApplyVibe={handleApplyVibe}
        />
      </WindowFrame>

      {/* Window: Themes */}
      <WindowFrame
        id="themes"
        title="24 CURATED THEMES & SCENERY ENGINE"
        icon={Palette}
        isOpen={openWindows.themes}
        onClose={() => toggleWindow('themes')}
        initialPos={{ x: 180, y: 90, w: 540, h: 480 }}
        zIndex={windowZIndices.themes}
        onFocus={() => bringToFront('themes')}
      >
        <ThemesWindow
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
          currentScene={currentScene}
          onSelectScene={setCurrentScene}
        />
      </WindowFrame>

      {/* 5. Command Bar Overlay */}
      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onSelectTheme={setCurrentTheme}
        onSelectScene={setCurrentScene}
        onSelectStation={handleSelectStation}
        onToggleMuffle={handleToggleMuffle}
        zenMode={zenMode}
        setZenMode={setZenMode}
        onOpenWindow={toggleWindow}
      />

      {/* 6. Floating Master Transport Bottom Dock */}
      <Dock
        currentStation={currentStation}
        isPlaying={isPlaying}
        isMuffled={isMuffled}
        onTogglePlay={handleTogglePlay}
        onPrevStation={handlePrevStation}
        onNextStation={handleNextStation}
        onToggleMuffle={handleToggleMuffle}
        openWindows={openWindows}
        onToggleWindow={toggleWindow}
        zenMode={zenMode}
        setZenMode={setZenMode}
        onOpenCommandBar={() => setCommandBarOpen(true)}
      />
    </div>
  );
}
