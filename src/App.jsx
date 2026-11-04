import React, { useState, useEffect } from 'react';
import {
  Radio, Sliders, AudioWaveform, Sun, CheckSquare,
  Grid, MessageSquare, Palette, Sparkles, PlaySquare
} from 'lucide-react';
import { audioEngine } from './audio/audioEngine';
import { THEMES } from './constants/themes';
import { SCENES } from './constants/scenes';
import { FLAGSHIP_STATIONS } from './constants/flagshipStations';

import BootOverlay from './components/BootOverlay';
import HudBar from './components/HudBar';
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
import YouTubeWindow from './components/YouTubeWindow';
import CommandBar from './components/CommandBar';

export default function App() {
  const [isBooted, setIsBooted] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  // Active theme, scene, and custom wallpaper
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

  const [customWallpaperUrl, setCustomWallpaperUrl] = useState(() => {
    try {
      return localStorage.getItem('nr_custom_wallpaper') || null;
    } catch {
      return null;
    }
  });

  // Radio & Audio states — default OFF / silent on boot
  const [currentStation, setCurrentStation] = useState(FLAGSHIP_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuffled, setIsMuffled] = useState(false);

  // Physical room lighting & atmospheric optics
  const [lighting, setLighting] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_lighting');
      return saved ? JSON.parse(saved) : {
        lampActive: true,
        lampDimmer: 0.85,
        lampWarmth: 3200,
        lampX: 25,
        lampY: 65,
        midnightDimmer: 0,
        rainDensity: 0.65,
        fogDensity: 0,
        neonActive: true,
        neonColor: '#c084fc',
        neonText: 'NEXTROOM // 24/7 SANCTUARY',
        fireplaceActive: false,
        crtEffect: false,
        scanlineIntensity: 0.3
      };
    } catch {
      return {
        lampActive: true,
        lampDimmer: 0.85,
        lampWarmth: 3200,
        rainDensity: 0.65,
        neonActive: true
      };
    }
  });

  // Sticky notes on room wall
  const [stickyNotes, setStickyNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_sticky_notes');
      return saved ? JSON.parse(saved) : [
        { id: 1, title: 'Studio Focus', content: 'Explore 40,000+ stations worldwide\nDoor Muffle: 380Hz LPF\nCustom YouTube audio ready', color: '#fef08a', rotation: -2 },
        { id: 2, title: 'Deep Work Intent', content: 'NextRoom OS — clean offline synth ready\nTouch props for tactile audio', color: '#bae6fd', rotation: 3 }
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
    youtube: false,
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
    youtube: 29,
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

  // Persist settings
  useEffect(() => {
    try { localStorage.setItem('nr_lighting', JSON.stringify(lighting)); } catch {}
  }, [lighting]);

  useEffect(() => {
    try { localStorage.setItem('nr_scene', JSON.stringify(currentScene)); } catch {}
  }, [currentScene]);

  useEffect(() => {
    try {
      if (customWallpaperUrl) {
        localStorage.setItem('nr_custom_wallpaper', customWallpaperUrl);
      } else {
        localStorage.removeItem('nr_custom_wallpaper');
      }
    } catch {}
  }, [customWallpaperUrl]);

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
      if (['input', 'textarea'].includes(e.target.tagName?.toLowerCase())) return;

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

  // Boot unlock: absolute silence! No auto-playing sound.
  const handleTuneIn = () => {
    setIsBooted(true);
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
    audioEngine.toggleDoorMuffle(!isMuffled);
  };

  // Silence everything immediately
  const handleSilenceAll = () => {
    audioEngine.emergencySilenceAll();
    setIsPlaying(false);
  };

  // Theme selection: automatically syncs matching wallpaper scene, lamp warmth, and animation!
  const handleSelectTheme = (theme) => {
    setCurrentTheme(theme);
    if (theme.linkedScene) {
      const found = SCENES.find(s => s.id === theme.linkedScene);
      if (found) {
        setCurrentScene(found);
        setCustomWallpaperUrl(null);
      }
    }
    setLighting(prev => ({
      ...prev,
      lampWarmth: theme.lampWarmth || prev.lampWarmth,
      crtEffect: theme.animation === 'crt',
      fireplaceActive: theme.animation === 'fireplace'
    }));
  };

  const bringToFront = (windowId) => {
    setWindowZIndices(prev => {
      const maxZ = Math.max(...Object.values(prev));
      return { ...prev, [windowId]: maxZ + 1 };
    });
  };

  const toggleWindow = (windowId) => {
    setOpenWindows(prev => {
      const nextState = !prev[windowId];
      if (nextState) bringToFront(windowId);
      return { ...prev, [windowId]: nextState };
    });
  };

  const handleApplyVibe = (vibe) => {
    if (vibe.theme) {
      const t = THEMES.find(item => item.name === vibe.theme);
      if (t) handleSelectTheme(t);
    }
    if (vibe.scene) {
      const s = SCENES.find(item => item.name === vibe.scene);
      if (s) {
        setCurrentScene(s);
        setCustomWallpaperUrl(null);
      }
    }
    if (vibe.station) {
      handleSelectStation(vibe.station);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-black font-sans text-neutral-100">
      {/* 1. Terminal Boot Overlay */}
      {!isBooted && (
        <BootOverlay onUnlock={handleTuneIn} />
      )}

      {/* 2. Living Room OS Canvas */}
      <RoomCanvas
        scene={currentScene}
        lighting={lighting}
        setLighting={setLighting}
        stickyNotes={stickyNotes}
        setStickyNotes={setStickyNotes}
        onOpenNotes={() => toggleWindow('productivity')}
        isMuffled={isMuffled}
        customWallpaperUrl={customWallpaperUrl}
        onOpenThemes={() => toggleWindow('themes')}
      />

      {/* 3. Top Master Productivity & Network Telemetry HUD Bar */}
      <HudBar
        pomoStats={pomoStats}
        activeLockedTask={activeLockedTask}
        zenMode={zenMode}
        onSilenceAll={handleSilenceAll}
      />

      {/* 4. Draggable Floating Translucent Windows */}

      {/* Window: YouTube Custom Search & Audio Player */}
      <WindowFrame
        id="youtube"
        title="YOUTUBE AUDIO // SEARCH & CUSTOM STREAM"
        icon={PlaySquare}
        isOpen={openWindows.youtube}
        onClose={() => toggleWindow('youtube')}
        initialPos={{ x: 140, y: 80, w: 520, h: 480 }}
        zIndex={windowZIndices.youtube}
        onFocus={() => bringToFront('youtube')}
      >
        <YouTubeWindow
          onTrackPlaying={(title) => {
            setCurrentStation({ name: title, genre: 'YouTube Custom' });
            setIsPlaying(true);
          }}
        />
      </WindowFrame>

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
        title="SYNCHRONIZED STATION LOUNGE & MESH CHAT"
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

      {/* Window: Themes & Wallpapers */}
      <WindowFrame
        id="themes"
        title="24 CURATED THEMES & LO-FI WALLPAPERS"
        icon={Palette}
        isOpen={openWindows.themes}
        onClose={() => toggleWindow('themes')}
        initialPos={{ x: 180, y: 90, w: 540, h: 480 }}
        zIndex={windowZIndices.themes}
        onFocus={() => bringToFront('themes')}
      >
        <ThemesWindow
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          currentScene={currentScene}
          onSelectScene={setCurrentScene}
          customWallpaperUrl={customWallpaperUrl}
          setCustomWallpaperUrl={setCustomWallpaperUrl}
        />
      </WindowFrame>

      {/* 5. Command Bar Overlay */}
      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onSelectTheme={handleSelectTheme}
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
        onSilenceAll={handleSilenceAll}
      />
    </div>
  );
}
