import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneOff, User, Clock, X, Hash, History } from 'lucide-react';

export const FloatingCall: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [number, setNumber] = useState('');
  const [ringing, setRinging] = useState(false);
  const [activeTab, setActiveTab] = useState<'dial'|'history'>('dial');

  useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'call') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  const handleDial = (digit: string) => {
    if (number.length < 15) setNumber((n: string) => n + digit);
  };

  const handleCall = () => {
    if (number.length > 0) {
      setRinging(true);
      // Simular duración de llamada saliente
      setTimeout(() => { setRinging(false); setNumber(''); }, 5000);
    }
  };

  const pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  const historyData = [
    { n: 'Enlace Logístico SAS', t: 'Hoy 10:42 AM', m: false },
    { n: '+52 55 1234 5678', t: 'Ayer 4:15 PM', m: true },
    { n: 'Aduana Frontera', t: 'Ayer 9:00 AM', m: false },
    { n: 'Soporte Técnico', t: 'Lun 2:30 PM', m: false },
  ];

  return (
    <div className="relative z-50">
      
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-72 bg-slate-900/95 backdrop-blur-2xl border border-sky-500/20 rounded-3xl shadow-2xl shadow-sky-500/10 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-2">
          
          {/* Tabs Neón */}
          <div className="flex items-center p-2 bg-black/40 border-b border-white/5 relative z-10">
            <button onClick={() => setActiveTab('dial')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 ${activeTab === 'dial' ? 'bg-sky-500 border border-sky-400/50 text-black shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
              <Hash size={12} /> Marcar
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 ${activeTab === 'history' ? 'bg-sky-500 border border-sky-400/50 text-black shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
              <History size={12} /> Recientes
            </button>
          </div>

          <div className="relative h-80 bg-gradient-to-b from-sky-900/10 to-transparent">
            
            {activeTab === 'dial' && (
              <div className="flex flex-col h-full p-5 animate-in fade-in duration-300">
                <div className="flex-1 flex flex-col items-center justify-center relative mb-2">
                  <div className="h-12 flex items-center justify-center">
                    <p className={`text-3xl font-mono tracking-widest text-center ${ringing ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-white'}`}>
                      {number || '...'}
                    </p>
                  </div>
                  {ringing && <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-2 animate-pulse flex items-center gap-1"><PhoneCall size={10}/> Conectando línea...</p>}
                </div>
                
                <div className="grid grid-cols-3 gap-y-3 gap-x-6 mb-5 px-2">
                  {pad.map(d => (
                    <button key={d} onClick={() => handleDial(d)} disabled={ringing} className="w-[52px] h-[52px] mx-auto rounded-full bg-slate-800/80 border border-white/10 hover:bg-sky-500/20 hover:border-sky-500/50 hover:text-sky-300 text-xl font-light text-slate-300 flex flex-col items-center justify-center transition-all active:scale-90 disabled:opacity-30 shadow-inner">
                      <span>{d}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-center gap-5 mt-auto">
                  {ringing ? (
                    <button onClick={() => { setRinging(false); setNumber(''); }} className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.5)] border border-rose-400 flex items-center justify-center text-white transition-all active:scale-90">
                      <PhoneOff size={22} className="stroke-[2.5px]" />
                    </button>
                  ) : (
                    <button onClick={handleCall} disabled={number.length === 0} className="w-14 h-14 rounded-full bg-[#00E676] hover:bg-[#00C853] shadow-[0_0_20px_rgba(0,230,118,0.4)] border border-[#00E676]/50 flex items-center justify-center text-black disabled:opacity-50 disabled:grayscale transition-all active:scale-90">
                      <PhoneCall size={22} className="stroke-[2.5px]" />
                    </button>
                  )}
                  {number.length > 0 && !ringing && (
                    <button onClick={() => setNumber('')} className="w-14 h-14 rounded-full bg-slate-800/80 border border-white/10 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 flex items-center justify-center text-slate-400 transition-all active:scale-90 absolute right-6">
                      <X size={18} className="stroke-[3px]" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="h-full overflow-y-auto scrollbar-thin p-2 space-y-1.5 animate-in fade-in duration-300">
                {historyData.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-black/20 hover:bg-sky-900/30 border border-transparent hover:border-sky-500/20 rounded-2xl cursor-pointer transition-all group">
                    <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center shadow-inner ${c.m ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                      {c.m ? <PhoneOff size={14} className="stroke-[2.5px]" /> : <User size={14} className="stroke-[2.5px]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${c.m ? 'text-rose-400' : 'text-slate-200'}`}>{c.n}</p>
                      <p className="text-[9px] text-slate-500 font-medium uppercase flex items-center gap-1 mt-0.5 tracking-wider"><Clock size={9}/> {c.t}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all group-hover:scale-110">
                      <Phone className="text-sky-400 stroke-[2.5px]" size={12} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'call' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        style={{ 
          background: isOpen ? '#0F172A' : '#0EA5E9', 
          border: `1px solid ${isOpen ? 'rgba(14,165,233,0.3)' : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(14,165,233,0.3)'
        }}
        title="Softphone Corporativo"
      >
        <Phone size={20} className={isOpen ? 'text-sky-400' : 'text-black group-hover:scale-110 transition-transform'} />
      </button>

    </div>
  );
};
