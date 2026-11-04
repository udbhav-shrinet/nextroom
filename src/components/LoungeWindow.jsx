import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Share2, Users, Heart } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

export default function LoungeWindow({
  currentStation,
  currentTheme,
  currentScene,
  onApplyVibe
}) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_chat');
      return saved ? JSON.parse(saved) : [
        { id: 1, user: 'Sanctuary Node', text: 'Welcome to the NextRoom Live Lounge. Your presence is synchronized across local tabs.', time: '10:00' }
      ];
    } catch {
      return [];
    }
  });
  const [inputVal, setInputVal] = useState('');
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel('nextroom_lounge');
      bc.onmessage = (e) => {
        if (e.data.type === 'chat') {
          setMessages(prev => [...prev, e.data.payload]);
        }
      };
      setChannel(bc);
    } catch {}

    return () => {
      if (bc) bc.close();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg = {
      id: Date.now(),
      user: 'You',
      text: inputVal.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    if (channel) {
      channel.postMessage({ type: 'chat', payload: newMsg });
    }
    setInputVal('');
  };

  const shareMyVibe = () => {
    const vibeMsg = {
      id: Date.now(),
      user: 'You',
      isVibeCard: true,
      station: currentStation,
      themeId: currentTheme.id,
      sceneId: currentScene.id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, vibeMsg]);
    if (channel) {
      channel.postMessage({ type: 'chat', payload: vibeMsg });
    }
    audioEngine.playPad(0);
  };

  const sendReaction = (emoji) => {
    const reactMsg = {
      id: Date.now(),
      user: 'You',
      text: emoji,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, reactMsg]);
    if (channel) {
      channel.postMessage({ type: 'chat', payload: reactMsg });
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Top Banner with Vibe Share */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-mono text-neutral-300">Synchronized Sanctuary Room</span>
        </div>

        <button
          onClick={shareMyVibe}
          className="px-3 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share My Vibe</span>
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className="text-xs">
            {msg.isVibeCard ? (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-neutral-900 border border-purple-500/40 flex flex-col gap-2 my-1 shadow-lg">
                <div className="flex items-center justify-between font-mono text-[10px] text-purple-300">
                  <span>🎵 VIBE CARD SHARED BY {msg.user}</span>
                  <span>{msg.time}</span>
                </div>
                <div>
                  <div className="font-semibold text-neutral-100">{msg.station?.name || 'Sanctuary Radio'}</div>
                  <div className="text-[11px] text-neutral-400">{msg.station?.genre} • Theme & Lighting Sync</div>
                </div>
                <button
                  onClick={() => onApplyVibe(msg)}
                  className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply This Vibe</span>
                </button>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mb-0.5">
                  <span className="text-purple-300">{msg.user}</span>
                  <span>{msg.time}</span>
                </div>
                <div className="text-neutral-200">{msg.text}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reaction Bar */}
      <div className="flex items-center justify-around py-1 bg-black/40 rounded-xl border border-white/5">
        {['✨', '☕', '🔥', '🌧️', '💜', '🧠', '🌙', '🎧'].map(emoji => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            className="text-sm hover:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Send message to lounge..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
