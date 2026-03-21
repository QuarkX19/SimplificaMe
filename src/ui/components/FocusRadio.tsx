import React, { useState, useRef, useEffect } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Disc, Music } from 'lucide-react';

const PRESETS = [
  { id: 'lofi', name: 'LoFi Hip-Hop (Zeno)', url: 'https://stream.zeno.fm/f3wvbbqmdg8uv', type: 'stream' },
  { id: 'classical', name: 'Música Clásica (KUSC)', url: 'https://kusc.streamguys1.com/kusc-128k.mp3', type: 'stream' },
  { id: 'binaural', name: 'Binaural 40Hz (Ondas)', url: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_1e38ffc5a0.mp3', type: 'mp3' },
  { id: 'ambient', name: 'Deep Space (SomaFM)', url: 'https://ice1.somafm.com/deepspaceone-128-mp3', type: 'stream' },
];

export const FocusRadio: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStation, setCurrentStation] = useState(PRESETS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-close when other docks open
  useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'radio') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, currentStation]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const changeStation = (station: typeof PRESETS[0]) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentStation(station);
  };

  return (
    <div className="relative z-50">
      
      {/* Mini Player Expandable */}
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-72 bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10 p-4 transform transition-all duration-300 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center relative flex-shrink-0">
              <Disc size={20} className={`text-cyan-400 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
              <div className="absolute inset-0 rounded-full border border-cyan-500/30" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Neuro-Focus</p>
              <p className="text-[10px] text-slate-400 font-medium truncate w-40">{currentStation.name}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => changeStation(preset)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between ${
                  currentStation.id === preset.id 
                    ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30' 
                    : 'bg-black/20 text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                <span>{preset.name}</span>
                {preset.type === 'mp3' ? <Disc size={12} /> : <Radio size={12} />}
              </button>
            ))}
          </div>

          {/* Player native controls skin */}
          <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl border border-white/5">
            <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center text-black transition-transform active:scale-95 flex-shrink-0">
              {isPlaying ? <Pause size={14} className="fill-black" /> : <Play size={14} className="fill-black ml-0.5" />}
            </button>
            
            <div className="flex items-center gap-2 flex-1">
              <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white transition-colors flex-shrink-0">
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={isMuted ? 0 : volume} 
                onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden HTML5 Audio Element (Always mounted to persist playback) */}
      <audio ref={audioRef} src={currentStation.url} loop={currentStation.type === 'mp3'} />

      {/* Floating Toggle Button */}
      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'radio' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        style={{ 
          background: isOpen ? '#0F172A' : '#00E5FF', 
          border: `1px solid ${isOpen ? 'rgba(0,229,255,0.3)' : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,229,255,0.3)'
        }}
      >
        <Music size={20} className={isOpen ? 'text-cyan-400' : 'text-black group-hover:animate-pulse'} />
      </button>

    </div>
  );
};
