import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, Volume2, Link, Sparkles, Radio, PlaySquare } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

const FEATURED_LOFI_STREAMS = [
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Girl - beats to relax/study to',
    channel: 'Lofi Girl',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg'
  },
  {
    id: '4xDzrJKXOOY',
    title: 'Lofi Girl - synthwave radio 🌌 beats to chill/game to',
    channel: 'Lofi Girl',
    thumbnail: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg'
  },
  {
    id: '5yx6BWlEVcY',
    title: 'Chillhop Radio - jazzy & lofi hip hop beats',
    channel: 'Chillhop Music',
    thumbnail: 'https://img.youtube.com/vi/5yx6BWlEVcY/hqdefault.jpg'
  },
  {
    id: 'lP26UCnoH9s',
    title: 'Coffee Shop Radio - 24/7 lofi cafe vibes',
    channel: 'STEEZYASFUCK',
    thumbnail: 'https://img.youtube.com/vi/lP26UCnoH9s/hqdefault.jpg'
  },
  {
    id: 'rUxyKA_-Mg4',
    title: 'Tokyo Night Walk - Rainy Lofi Ambient',
    channel: 'Ambient Tokyo',
    thumbnail: 'https://img.youtube.com/vi/rUxyKA_-Mg4/hqdefault.jpg'
  },
  {
    id: 'Dx5qF6HwsW4',
    title: 'Late Night Study - Cozy Bedroom Lofi',
    channel: 'Chill Music Lab',
    thumbnail: 'https://img.youtube.com/vi/Dx5qF6HwsW4/hqdefault.jpg'
  }
];

function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  if (str.length === 11 && !str.includes('/') && !str.includes('?')) {
    return str;
  }
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function YouTubeWindow({ onPlayTrack, currentYouTubeId, isMuffled }) {
  const [query, setQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [activeVideoId, setActiveVideoId] = useState(currentYouTubeId || null);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const id = extractYouTubeId(customInput);
    if (id) {
      setActiveVideoId(id);
      onPlayTrack({ id, title: 'Custom YouTube Stream', channel: 'YouTube Live' });
      setCustomInput('');
    } else {
      // If not direct URL, search via YouTube embed search query
      const searchUrlId = encodeURIComponent(customInput.trim());
      // Play first featured or set as query
      setActiveVideoId(FEATURED_LOFI_STREAMS[0].id);
      onPlayTrack({
        id: FEATURED_LOFI_STREAMS[0].id,
        title: customInput,
        channel: 'YouTube Query'
      });
    }
  };

  const handleSelectFeatured = (stream) => {
    setActiveVideoId(stream.id);
    onPlayTrack(stream);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Search & Custom URL Form */}
      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Paste YouTube URL or Video ID (e.g. youtu.be/...)"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-red-600/30"
        >
          <PlaySquare className="w-3.5 h-3.5 text-red-500" />
          <span>Play</span>
        </button>
      </form>

      {/* Embedded IFrame Player Container */}
      {activeVideoId ? (
        <div className={`relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video shadow-2xl transition-all duration-300 ${
          isMuffled ? 'filter blur-[1.5px] brightness-75' : ''
        }`}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
            title="NextRoom YouTube Audio Player"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-2 text-neutral-400">
          <PlaySquare className="w-8 h-8 text-red-500" />
          <div className="text-xs text-neutral-200 font-semibold">No YouTube Track Active</div>
          <div className="text-[11px] text-neutral-400">Paste any YouTube URL above or pick a curated 24/7 Lo-Fi live stream below.</div>
        </div>
      )}

      {/* Featured 24/7 Lo-Fi & Chill Channels */}
      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        <div className="text-xs font-mono text-neutral-300 flex items-center justify-between">
          <span>Curated 24/7 YouTube Lo-Fi Streams:</span>
          <span className="text-purple-400 text-[10px]">Instant Play</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {FEATURED_LOFI_STREAMS.map(stream => {
            const isPlaying = activeVideoId === stream.id;
            return (
              <div
                key={stream.id}
                onClick={() => handleSelectFeatured(stream)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 group ${
                  isPlaying
                    ? 'bg-purple-900/30 border-purple-500/60 shadow-md shadow-purple-900/20'
                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="relative rounded-lg overflow-hidden aspect-video bg-neutral-900">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </div>
                  {isPlaying && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-purple-600 text-[9px] font-mono text-white">
                      LIVE
                    </span>
                  )}
                </div>

                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-neutral-200 line-clamp-1">{stream.title}</div>
                  <div className="text-[10px] text-neutral-400">{stream.channel}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
