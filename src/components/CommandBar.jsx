import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Search, X, Sparkles, Radio, Sun, Sliders } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { THEMES } from '../constants/themes';
import { SCENES } from '../constants/scenes';
import { getRandomWorldStation } from '../services/radioApi';

export default function CommandBar({
  isOpen,
  onClose,
  onSelectTheme,
  onSelectScene,
  onSelectStation,
  onToggleMuffle,
  zenMode,
  setZenMode,
  onOpenWindow
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = query.trim().toLowerCase();

    if (cmd === ':zen' || cmd === 'zen') {
      setZenMode(!zenMode);
    } else if (cmd === ':muffle' || cmd === 'muffle') {
      onToggleMuffle();
    } else if (cmd === ':lucky' || cmd === ':spin' || cmd === 'spin') {
      onSelectStation(getRandomWorldStation());
    } else if (cmd.startsWith(':vol ') || cmd.startsWith('vol ')) {
      const val = parseInt(cmd.replace(/^:?vol\s+/, ''), 10);
      if (!isNaN(val)) audioEngine.setVolume(val / 100);
    } else if (cmd.startsWith(':theme ') || cmd.startsWith('theme ')) {
      const name = cmd.replace(/^:?theme\s+/, '');
      const found = THEMES.find(t => t.name.toLowerCase().includes(name) || t.id.includes(name));
      if (found) onSelectTheme(found);
    } else if (cmd.startsWith(':scene ') || cmd.startsWith('scene ')) {
      const name = cmd.replace(/^:?scene\s+/, '');
      const found = SCENES.find(s => s.name.toLowerCase().includes(name) || s.id.includes(name));
      if (found) onSelectScene(found);
    } else if (cmd === ':radio' || cmd === 'radio') {
      onOpenWindow('radio');
    } else if (cmd === ':eq' || cmd === 'eq') {
      onOpenWindow('equalizer');
    } else if (cmd === ':mixer' || cmd === 'mixer') {
      onOpenWindow('mixer');
    }

    onClose();
  };

  const commandShortcuts = [
    { cmd: ':muffle', desc: 'Toggle Next Room door muffle DSP' },
    { cmd: ':spin', desc: 'World spin random active station' },
    { cmd: ':theme <name>', desc: 'Switch theme (e.g. :theme tokyo)' },
    { cmd: ':scene <name>', desc: 'Switch scenery (e.g. :scene cabin)' },
    { cmd: ':vol <0-100>', desc: 'Set master volume level' },
    { cmd: ':zen', desc: 'Toggle Zen focus mode' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl p-3 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 px-2 border-b border-white/10 pb-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type sanctuary command... (:muffle, :spin, :vol 80, :zen)"
            className="flex-1 bg-transparent text-sm font-mono text-white placeholder-neutral-500 focus:outline-none"
          />
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </form>

        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-2">
            Available NextRoom Commands
          </div>
          {commandShortcuts.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setQuery(item.cmd);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between text-xs cursor-pointer font-mono"
            >
              <span className="text-purple-300 font-semibold">{item.cmd}</span>
              <span className="text-neutral-400 text-[11px]">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
