import React, { useState, useEffect } from 'react';
import { Search, Globe, Dices, Upload, Link, Radio, Play, CheckCircle2 } from 'lucide-react';
import { FLAGSHIP_STATIONS } from '../constants/flagshipStations';
import { searchStations, getRandomWorldStation } from '../services/radioApi';
import { audioEngine } from '../audio/audioEngine';

export default function RadioWindow({ currentStation, onSelectStation }) {
  const [activeTab, setActiveTab] = useState('flagship'); // 'flagship' | 'explore' | 'byoa' | 'passport'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [passportStamps, setPassportStamps] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_passport');
      return saved ? JSON.parse(saved) : ['United States', 'France', 'Japan'];
    } catch {
      return ['United States'];
    }
  });

  // Track visited countries
  useEffect(() => {
    if (currentStation?.country && !passportStamps.includes(currentStation.country)) {
      const updated = [...passportStamps, currentStation.country];
      setPassportStamps(updated);
      try {
        localStorage.setItem('nr_passport', JSON.stringify(updated));
      } catch {}
    }
  }, [currentStation, passportStamps]);

  // Debounced search
  useEffect(() => {
    if (activeTab !== 'explore') return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchStations({ query: searchQuery, tag: selectedTag, limit: 25 });
      setSearchResults(res);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTag, activeTab]);

  const handleWorldSpin = () => {
    const randomStation = getRandomWorldStation();
    onSelectStation(randomStation);
  };

  const handleCustomUrlPlay = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const station = {
      id: 'custom-' + Date.now(),
      name: 'Custom Stream',
      genre: 'Direct URL',
      country: 'Personal',
      countryCode: 'XX',
      bitrate: 'Custom',
      url: customUrl.trim()
    };
    onSelectStation(station);
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    const station = {
      id: 'local-' + Date.now(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      genre: 'Local Audio (BYOA)',
      country: 'Local Drive',
      countryCode: 'HD',
      bitrate: `${Math.round(file.size / 1024 / 1024)} MB`,
      url: objectUrl
    };
    onSelectStation(station);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Tab Switcher & Quick Actions */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('flagship')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'flagship'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Flagship (30)
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'explore'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Explore 40,000+
          </button>
          <button
            onClick={() => setActiveTab('byoa')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'byoa'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            BYOA / File
          </button>
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'passport'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Passport ({passportStamps.length})
          </button>
        </div>

        <button
          onClick={handleWorldSpin}
          className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
          title="Pick a random active station worldwide"
        >
          <Dices className="w-3.5 h-3.5" />
          <span>World Spin</span>
        </button>
      </div>

      {/* Flagships List */}
      {activeTab === 'flagship' && (
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {FLAGSHIP_STATIONS.map((station) => {
            const isCurrent = currentStation?.id === station.id;
            return (
              <div
                key={station.id}
                onClick={() => onSelectStation(station)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-purple-900/30 border-purple-500/60 shadow-md shadow-purple-900/20'
                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isCurrent ? 'bg-purple-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-neutral-100 flex items-center gap-2">
                      <span>{station.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-purple-300 border border-purple-500/20 font-mono">
                        {station.countryCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 line-clamp-1">{station.desc}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <span className="text-[10px] font-mono text-neutral-500">{station.bitrate}</span>
                  {isCurrent && <span className="dot-pill active" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Explore Search */}
      {activeTab === 'explore' && (
        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          {/* Search Inputs */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search stations, cities, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-purple-400"
            >
              <option value="">All Genres</option>
              <option value="lofi">Lo-Fi</option>
              <option value="ambient">Ambient</option>
              <option value="synthwave">Synthwave</option>
              <option value="jazz">Jazz</option>
              <option value="classical">Classical</option>
              <option value="electronic">Electronic</option>
              <option value="chillout">Chillout</option>
              <option value="news">News / Talk</option>
            </select>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isSearching ? (
              <div className="flex items-center justify-center h-32 text-xs text-purple-300 font-mono animate-pulse">
                Scanning Radio-Browser frequencies...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-xs text-neutral-400 gap-2">
                <span>No stations found. Try another search or filter.</span>
              </div>
            ) : (
              searchResults.map((station) => (
                <div
                  key={station.id}
                  onClick={() => onSelectStation(station)}
                  className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400">
                      <Radio className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-100 flex items-center gap-1.5">
                        <span>{station.name}</span>
                        <span className="text-[10px] font-mono text-purple-400">({station.country})</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">{station.genre}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">{station.bitrate}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* BYOA Local Audio & Custom Stream URL */}
      {activeTab === 'byoa' && (
        <div className="flex flex-col gap-6 p-2">
          {/* Local File Drop */}
          <div className="border-2 border-dashed border-white/15 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:border-purple-500/50 transition-colors">
            <Upload className="w-8 h-8 text-purple-400" />
            <div>
              <div className="font-semibold text-xs text-neutral-100">Drop your own audio tracks here</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">Supports .mp3, .flac, .wav, .ogg, .aac, .m4a</div>
            </div>
            <label className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-mono cursor-pointer transition-all">
              <span>Browse Local Files</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Custom Stream URL */}
          <form onSubmit={handleCustomUrlPlay} className="flex flex-col gap-2">
            <label className="text-xs font-mono text-neutral-300 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-purple-400" />
              <span>Direct Icecast / Shoutcast / HLS Stream URL:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://stream.example.com/live.mp3"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono transition-colors shadow-md"
              >
                Tune In
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Country Passport */}
      {activeTab === 'passport' && (
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
          <div className="text-xs text-neutral-300">
            Listen to global stations to collect world stamps in your sanctuary passport:
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {passportStamps.map((country, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/5 border border-purple-500/20 flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-medium text-neutral-200">{country}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
