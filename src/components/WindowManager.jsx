import React, { useState, useEffect } from 'react';
import { X, Minus, Move } from 'lucide-react';

export function WindowFrame({
  id,
  title,
  icon: Icon,
  isOpen,
  onClose,
  initialPos = { x: 80, y: 80, w: 520, h: 480 },
  children,
  zIndex,
  onFocus
}) {
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(`nr_win_${id}`);
      return saved ? JSON.parse(saved) : initialPos;
    } catch {
      return initialPos;
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    try {
      localStorage.setItem(`nr_win_${id}`, JSON.stringify(pos));
    } catch {}
  }, [id, pos]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-control-btn')) return;
    onFocus();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      let nextX = e.clientX - dragOffset.x;
      let nextY = e.clientY - dragOffset.y;

      // Magnetic snap to screen edges (20px)
      if (nextX < 20) nextX = 20;
      if (nextY < 40) nextY = 40;
      if (nextX + pos.w > window.innerWidth - 20) nextX = window.innerWidth - pos.w - 20;
      if (nextY + pos.h > window.innerHeight - 80) nextY = window.innerHeight - pos.h - 80;

      setPos(prev => ({ ...prev, x: nextX, y: nextY }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, pos.w, pos.h]);

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={onFocus}
      className="absolute glass-panel rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-purple-500/20 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${pos.w}px`,
        height: `${pos.h}px`,
        zIndex: zIndex || 30
      }}
    >
      {/* Window Header */}
      <div
        onMouseDown={handleMouseDown}
        className="h-10 px-3.5 flex items-center justify-between border-b border-white/10 bg-white/5 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-neutral-200">
          {Icon && <Icon className="w-3.5 h-3.5 text-purple-400" />}
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-1.5 window-control-btn">
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Window"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-neutral-200 text-sm">
        {children}
      </div>
    </div>
  );
}
