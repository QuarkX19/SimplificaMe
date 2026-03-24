import React, { useState, useRef, useEffect } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Disc, Music, Youtube, Globe } from 'lucide-react';

type Platform = 'neuro' | 'spotify' | 'youtube';

const PRESETS = [
  { id: 'lofi', name: 'LoFi Hip-Hop (Zeno)', url: 'https://stream.zeno.fm/f3wvbbqmdg8uv', type: 'stream' },
  { id: 'classical', name: 'Música Clásica (KUSC)', url: 'https://kusc.streamguys1.com/kusc-128k.mp3', type: 'stream' },
  { id: 'binaural', name: 'Binaural 40Hz (Ondas)', url: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_1e38ffc5a0.mp3', type: 'mp3' },
  { id: 'ambient', name: 'Deep Space (SomaFM)', url: 'https://ice1.somafm.com/deepspaceone-128-mp3', type: 'stream' },
];

export const FocusRadio: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>('neuro');
  const [currentStation, setCurrentStation] = useState(PRESETS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'radio') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, currentStation]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const changeStation = (station: typeof PRESETS[0]) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentStation(station);
  };

  const PLATFORM_COLORS = {
    neuro: 'cyan',
    spotify: '#1DB954',
    youtube: '#FF0000'
  };

  const getPlatformIcon = () => {
    if (platform === 'spotify') return <Globe size={20} className="text-[#1DB954]" />;
    if (platform === 'youtube') return <Youtube size={20} className="text-[#FF0000]" />;
    return <Disc size={20} className={`text-cyan-400 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />;
  };

  return (
    <div className="relative z-50">
      
      <div 
        className={`absolute origin-bottom bottom-[115%] left-1/2 -translate-x-1/2 w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 transform transition-all duration-500 ease-out ${isOpen ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none translate-y-4'}`}
        style={{ borderColor: platform === 'spotify' ? 'rgba(29,185,84,0.3)' : platform === 'youtube' ? 'rgba(255,0,0,0.3)' : 'rgba(0,229,255,0.3)' }}
      >
          
          {/* Platform Selector */}
          <div className="flex items-center gap-2 mb-4 p-1 bg-black/40 rounded-xl border border-white/5">
            <button onClick={() => setPlatform('neuro')} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${platform === 'neuro' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:bg-white/5'}`}>
              <Radio size={12} /> Neuro
            </button>
            <button onClick={() => setPlatform('spotify')} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${platform === 'spotify' ? 'bg-[#1DB954]/20 text-[#1DB954]' : 'text-slate-500 hover:bg-white/5'}`}>
              <Globe size={12} /> Spotify
            </button>
            <button onClick={() => setPlatform('youtube')} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${platform === 'youtube' ? 'bg-[#FF0000]/20 text-[#FF0000]' : 'text-slate-500 hover:bg-white/5'}`}>
              <Youtube size={12} /> YT Music
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center relative flex-shrink-0"
              style={{ background: platform === 'spotify' ? 'rgba(29,185,84,0.1)' : platform === 'youtube' ? 'rgba(255,0,0,0.1)' : 'rgba(0,229,255,0.1)'}}>
              {getPlatformIcon()}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: platform === 'spotify' ? '#1DB954' : platform === 'youtube' ? '#FF0000' : '#00E5FF'}}>
                {platform === 'neuro' ? 'Neuro-Focus' : platform === 'spotify' ? 'Spotify Connect' : 'YouTube Music'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate w-48">
                {platform === 'neuro' ? currentStation.name : 'Inicia sesión en el reproductor'}
              </p>
            </div>
          </div>

          {platform === 'neuro' && (
            <>
              <div className="mb-4">
                <label className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-2 block flex items-center gap-1.5"><Radio size={12}/> Selector de Emisoras</label>
                <div className="space-y-1.5 h-32 overflow-y-auto scrollbar-thin pr-1">
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
              </div>
              <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl border border-white/5">
                <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center text-black transition-transform active:scale-95 flex-shrink-0">
                  {isPlaying ? <Pause size={14} className="fill-black" /> : <Play size={14} className="fill-black ml-0.5" />}
                </button>
                <div className="flex items-center gap-2 flex-1">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white transition-colors flex-shrink-0">
                    {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
                </div>
              </div>
            </>
          )}

          {platform === 'spotify' && (
            <div className="w-full h-[200px] rounded-xl overflow-hidden shadow-inner bg-black/40 border border-[#1DB954]/20 animate-in fade-in duration-500">
              <iframe 
                src="https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0" 
                width="100%" height="100%" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"
              ></iframe>
            </div>
          )}

          {platform === 'youtube' && (
             <div className="w-full h-[200px] rounded-xl overflow-hidden shadow-inner bg-black/40 border border-[#FF0000]/20 animate-in fade-in duration-500 relative">
               <iframe 
                 width="100%" height="100%" 
                 src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=1" 
                 title="YouTube Music" frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
               ></iframe>
             </div>
          )}
      </div>

      {/* Hidden HTML5 Audio Element (Only for neuro) */}
      <audio ref={audioRef} src={currentStation.url} loop={currentStation.type === 'mp3'} />

      {/* Floating Toggle Button */}
      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'radio' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        style={{ 
          background: isOpen ? '#0F172A' : (platform === 'spotify' ? '#1DB954' : platform === 'youtube' ? '#FF0000' : '#00E5FF'), 
          border: `1px solid ${isOpen ? (platform === 'spotify' ? 'rgba(29,185,84,0.3)' : platform === 'youtube' ? 'rgba(255,0,0,0.3)' : 'rgba(0,229,255,0.3)') : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : `0 10px 30px ${platform === 'spotify' ? 'rgba(29,185,84,0.3)' : platform === 'youtube' ? 'rgba(255,0,0,0.3)' : 'rgba(0,229,255,0.3)'}`
        }}
      >
        <Music size={20} className={isOpen ? (platform === 'spotify' ? 'text-[#1DB954]' : platform === 'youtube' ? 'text-[#FF0000]' : 'text-cyan-400') : 'text-black group-hover:animate-pulse'} />
      </button>

    </div>
  );
};
