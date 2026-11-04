import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Sparkles, Moon, Sun, CloudRain, Image as ImageIcon } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

// Kelvin to RGB conversion for physical warmth
function kelvinToRgb(kelvin) {
  const temp = kelvin / 100;
  let red, green, blue;

  if (temp <= 66) {
    red = 255;
    green = Math.min(255, Math.max(0, 99.4708025861 * Math.log(temp) - 161.1195681661));
    if (temp <= 19) {
      blue = 0;
    } else {
      blue = Math.min(255, Math.max(0, 138.5177312231 * Math.log(temp - 10) - 305.0447927307));
    }
  } else {
    red = Math.min(255, Math.max(0, 329.698727446 * Math.pow(temp - 60, -0.1332047592)));
    green = Math.min(255, Math.max(0, 288.1221695283 * Math.pow(temp - 60, -0.0755148492)));
    blue = 255;
  }

  return `rgb(${Math.round(red)}, ${Math.round(blue)})`;
}

export default function RoomCanvas({
  scene,
  lighting,
  setLighting,
  stickyNotes,
  setStickyNotes,
  onOpenNotes,
  isMuffled,
  customWallpaperUrl,
  onOpenThemes
}) {
  const rainCanvasRef = useRef(null);
  const [catPurring, setCatPurring] = useState(false);
  const [steamPuff, setSteamPuff] = useState(false);
  const [blindsClosed, setBlindsClosed] = useState(false);

  // Rain on glass canvas simulation
  useEffect(() => {
    const canvas = rainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drops = [];
    const count = Math.floor(lighting.rainDensity * 120);

    for (let i = 0; i < count; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 20 + 10,
        speed: Math.random() * 8 + 6,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (lighting.rainDensity > 0.05) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillStyle = 'rgba(200, 225, 255, 0.35)';

        drops.forEach(d => {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 1, d.y + d.len);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(d.x, d.y + d.len, d.radius, 0, Math.PI * 2);
          ctx.fill();

          d.y += d.speed;
          d.x -= 0.5;

          if (d.y > canvas.height) {
            d.y = -20;
            d.x = Math.random() * canvas.width;
          }
        });
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [lighting.rainDensity]);

  const lampRgb = kelvinToRgb(lighting.lampWarmth || 3200);

  const handleCatClick = () => {
    setCatPurring(true);
    setTimeout(() => setCatPurring(false), 2500);
  };

  const handleKettleClick = () => {
    setSteamPuff(true);
    setTimeout(() => setSteamPuff(false), 2500);
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-auto select-none transition-all duration-700 ${
        isMuffled ? 'brightness-75 contrast-90' : ''
      }`}
      style={{
        background: customWallpaperUrl ? `url(${customWallpaperUrl}) center/cover no-repeat` : scene.bgGradient
      }}
    >
      {/* Cityscape / Room Background Art Layer */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out opacity-85">
        {/* Sky glow & Horizon */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 opacity-50"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${scene.windowGlow} 0%, transparent 70%)`
          }}
        />

        {/* Procedural High-rise Skyline Silhouette */}
        {scene.elements?.skyline && !customWallpaperUrl && (
          <div className="absolute inset-x-0 bottom-24 h-64 flex items-end justify-around px-4 opacity-75">
            <div className="w-16 h-48 bg-gray-950/80 border-t border-purple-500/20 shadow-2xl relative">
              <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1.5 h-2 bg-yellow-300/40 rounded-xs animate-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                ))}
              </div>
            </div>
            <div className="w-24 h-64 bg-gray-900/80 border-t border-cyan-500/20 shadow-2xl relative">
              <div className="absolute top-4 left-3 right-3 flex flex-wrap gap-1.5">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="w-1.5 h-2 bg-cyan-300/30 rounded-xs" />
                ))}
              </div>
            </div>
            <div className="w-20 h-40 bg-gray-950/80 border-t border-purple-500/20" />
            <div className="w-32 h-56 bg-gray-900/70 border-t border-pink-500/20 relative">
              <div className="absolute top-6 left-4 right-4 flex flex-wrap gap-2">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-rose-400/40 rounded-xs" />
                ))}
              </div>
            </div>
            <div className="w-20 h-52 bg-gray-950/85" />
          </div>
        )}

        {/* Alpine Pine Trees or Forest Silhouette */}
        {scene.elements?.pines && !customWallpaperUrl && (
          <div className="absolute inset-x-0 bottom-20 h-48 flex items-end justify-between px-8 opacity-60">
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[90px] border-b-emerald-950/90"
                style={{ transform: `scale(${0.8 + (i % 5) * 0.15})` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Architectural Window Blinds & Frame */}
      <div className="absolute inset-0 pointer-events-none">
        {blindsClosed && (
          <div className="absolute inset-x-0 top-0 bottom-24 bg-black/75 flex flex-col justify-between py-2 transition-all duration-700">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="w-full h-1 bg-neutral-800/80 border-b border-black/40" />
            ))}
          </div>
        )}

        {/* Modern Window Glass Divider Lines */}
        <div className="absolute inset-y-0 left-1/3 w-[3px] bg-black/40 shadow-lg pointer-events-none" />
        <div className="absolute inset-y-0 right-1/3 w-[3px] bg-black/40 shadow-lg pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 h-[3px] bg-black/40 shadow-lg pointer-events-none" />
      </div>

      {/* Window Rain Refraction Canvas */}
      <canvas
        ref={rainCanvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ opacity: lighting.rainDensity }}
      />

      {/* Condensation / Fog finger-wipe layer */}
      {lighting.fogDensity > 0.05 && (
        <div
          className="absolute inset-0 pointer-events-none backdrop-blur-md transition-opacity duration-500 z-10"
          style={{ backgroundColor: `rgba(255, 255, 255, ${lighting.fogDensity * 0.25})` }}
        />
      )}

      {/* Next Room Spatial Door Hallway Muffle Overlay */}
      {isMuffled && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none z-15 transition-all duration-500 flex items-center justify-center">
          <div className="px-4 py-2 rounded-2xl bg-black/60 border border-amber-500/40 text-amber-300 font-mono text-xs flex items-center gap-2 shadow-2xl">
            <span className="dot-pill active !bg-amber-400 !shadow-amber-400 animate-pulse" />
            <span>BEHIND CLOSED DOOR // 380Hz LPF FILTER ACTIVE</span>
          </div>
        </div>
      )}

      {/* Physical Room Lighting: Warm Desk Lamp Light Pool */}
      {lighting.lampActive && (
        <div
          className="absolute pointer-events-none rounded-full transition-all duration-300 z-15"
          style={{
            left: `${lighting.lampX || 28}%`,
            top: `${lighting.lampY || 62}%`,
            width: `${(lighting.lampDimmer || 0.8) * 800}px`,
            height: `${(lighting.lampDimmer || 0.8) * 600}px`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${lampRgb} 0%, rgba(0,0,0,0) 70%)`,
            opacity: (lighting.lampDimmer || 0.8) * 0.7,
            mixBlendMode: 'screen',
            filter: 'blur(30px)'
          }}
        />
      )}

      {/* Fireplace Hearth Warm Flicker Glow */}
      {lighting.fireplaceActive && (
        <div
          className="absolute bottom-8 left-12 w-96 h-96 rounded-full pointer-events-none hearth-glow z-15"
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.45) 0%, rgba(234, 88, 12, 0.2) 50%, rgba(0,0,0,0) 75%)',
            filter: 'blur(40px)',
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* Neon Sign Wall Prop with Bass Pulsing */}
      {lighting.neonActive && (
        <div
          className="absolute top-16 right-16 px-6 py-2 rounded-lg border font-mono tracking-widest text-sm font-bold uppercase transition-all duration-300 z-20 cursor-pointer shadow-lg"
          style={{
            borderColor: lighting.neonColor || '#c084fc',
            color: lighting.neonColor || '#c084fc',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            boxShadow: `0 0 25px ${lighting.neonColor || '#c084fc'}, inset 0 0 10px ${lighting.neonColor || '#c084fc'}`
          }}
          onClick={() => {
            const nextColors = ['#c084fc', '#00f0ff', '#ffe600', '#f43f5e', '#22c55e'];
            const next = nextColors[(nextColors.indexOf(lighting.neonColor) + 1) % nextColors.length];
            setLighting({ ...lighting, neonColor: next });
          }}
          title="Click to cycle neon color"
        >
          {lighting.neonText || 'NEXTROOM // 24/7 SANCTUARY'}
        </div>
      )}

      {/* Sticky Notes on Wall */}
      <div className="absolute top-24 left-16 flex flex-wrap gap-4 z-20 pointer-events-auto">
        {stickyNotes.map((note) => (
          <div
            key={note.id}
            className="w-44 p-3 rounded shadow-xl font-mono text-xs text-neutral-900 relative group transition-transform hover:scale-105"
            style={{
              backgroundColor: note.color || '#fef08a',
              transform: `rotate(${note.rotation || -2}deg)`
            }}
          >
            <button
              className="absolute top-1 right-1 text-black/50 hover:text-black opacity-0 group-hover:opacity-100 font-bold px-1 cursor-pointer"
              onClick={() => setStickyNotes(stickyNotes.filter(n => n.id !== note.id))}
            >
              ×
            </button>
            <div className="font-semibold border-b border-black/10 pb-1 mb-1">{note.title}</div>
            <div className="whitespace-pre-wrap text-[11px] leading-tight text-neutral-800">{note.content}</div>
          </div>
        ))}
      </div>

      {/* Interactive Props Layer: Desk Surface, Cat, Lamp, Tea Cup */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent pointer-events-auto z-20 flex items-end justify-between px-16 pb-20">
        {/* Left Side: Warm Desk Lamp & Sleeping Cat */}
        <div className="flex items-end gap-8">
          <div
            className="cursor-pointer group flex flex-col items-center"
            onClick={() => setLighting({ ...lighting, lampActive: !lighting.lampActive })}
            title="Click to toggle Desk Lamp"
          >
            <div
              className="w-12 h-6 rounded-t-full border border-neutral-600 transition-all shadow-md"
              style={{
                backgroundColor: lighting.lampActive ? lampRgb : '#333',
                boxShadow: lighting.lampActive ? `0 0 20px ${lampRgb}` : 'none'
              }}
            />
            <div className="w-1.5 h-16 bg-neutral-700" />
            <div className="w-14 h-2 rounded bg-neutral-800" />
            <span className="text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
              {lighting.lampActive ? 'Turn Off' : 'Turn On'}
            </span>
          </div>

          <div
            className="cursor-pointer relative group flex flex-col items-center"
            onClick={handleCatClick}
            title="Click to gently pet cat"
          >
            <div className="text-3xl transition-transform transform group-hover:scale-110 active:scale-95">
              🐈
            </div>
            {catPurring && (
              <span className="absolute -top-6 px-2 py-0.5 rounded bg-purple-900/80 text-[10px] text-purple-200 border border-purple-400/40 animate-bounce">
                purrrr... 💤
              </span>
            )}
            <span className="text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Pet Cat
            </span>
          </div>

          <div
            className="cursor-pointer relative group flex flex-col items-center"
            onClick={handleKettleClick}
            title="Click to take a warm sip"
          >
            {steamPuff && (
              <div className="absolute -top-6 text-sm animate-pulse text-amber-200/80">
                ♨ ♨
              </div>
            )}
            <div className="text-2xl transition-transform group-hover:scale-110">
              ☕
            </div>
            <span className="text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Warm Sip
            </span>
          </div>
        </div>

        {/* Right Side: Quick Wallpaper Swap, Window Blinds Pull & Sticky Note */}
        <div className="flex items-end gap-4">
          <button
            onClick={onOpenThemes}
            className="px-3 py-1.5 rounded-md bg-neutral-900/80 border border-neutral-700 text-xs text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Switch Lo-Fi Wallpaper / Scenery"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Wallpaper</span>
          </button>

          <button
            onClick={() => setBlindsClosed(!blindsClosed)}
            className="px-3 py-1.5 rounded-md bg-neutral-900/80 border border-neutral-700 text-xs text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Toggle Window Blinds"
          >
            {blindsClosed ? 'Open Blinds' : 'Close Blinds'}
          </button>

          <button
            onClick={onOpenNotes}
            className="px-3 py-1.5 rounded-md bg-neutral-900/80 border border-neutral-700 text-xs text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Add sticky note to wall"
          >
            + Sticky Note
          </button>
        </div>
      </div>

      {/* Midnight Room Dimmer Overlay */}
      {lighting.midnightDimmer > 0 && (
        <div
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 z-25"
          style={{ opacity: lighting.midnightDimmer * 0.85 }}
        />
      )}

      {/* CRT Scanline & Grain Overlay */}
      {lighting.crtEffect && (
        <div
          className="crt-overlay absolute inset-0 pointer-events-none z-30"
          style={{ '--scanline-opacity': lighting.scanlineIntensity || 0.3 }}
        />
      )}
    </div>
  );
}
