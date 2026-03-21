import React, { useState } from 'react';
import { Cloud, Calendar, FileText, Video, FolderGit2, Lock, Globe } from 'lucide-react';

const MOCK_MEETINGS = [
  { id: 1, title: 'Comité de Arquitectura', time: 'En 15 min', type: 'meet' },
  { id: 2, title: 'Revisión Financiera Q2', time: '04:00 PM', type: 'meet' }
];

const MOCK_FILES = [
  { id: 1, name: 'Plan Maestro AFSE v4.pdf', modified: 'Hoy 09:00 AM' },
  { id: 2, name: 'Matriz_Riesgos_NOM.gsheet', modified: 'Ayer' }
];

export const FloatingGoogleSync: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'google') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  return (
    <div className="relative z-50">
      
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-72 flex flex-col bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-2">
          
          <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Cloud size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-400">G-Workspace</p>
                <p className="text-[10px] text-slate-400 font-medium">Sincronización Cloud</p>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`} title={isLoggedIn ? 'Sincronizado' : 'Desconectado'} />
          </div>

          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-1">
                <Lock size={24} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-300 uppercase tracking-widest">Google Workspace</h3>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Autoriza el acceso a tu cuenta de Google Cloud para visualizar tu Agenda (Meet) y Documentos Recientes de Drive.</p>
              </div>
              <button onClick={() => setIsLoggedIn(true)} className="w-full py-2.5 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                <Globe size={14} className="stroke-[3px]" /> Autorizar Google
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col">
              <div className="p-3 bg-black/40 border-b border-white/5 space-y-2">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5"><Calendar size={10} /> Agenda de Hoy</h4>
                {MOCK_MEETINGS.map(meet => (
                  <div key={meet.id} className="flex flex-col gap-1 p-2 rounded-xl bg-black/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">{meet.title}</p>
                      <span className="text-[8px] font-black tracking-widest uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">{meet.time}</span>
                    </div>
                    <button className="flex items-center gap-1 w-fit text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors mt-1">
                      <Video size={10} className="text-blue-400" /> Unirse a Meet
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-black/20 space-y-2 flex-1">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5"><FolderGit2 size={10} /> Documentos Recientes</h4>
                {MOCK_FILES.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <FileText size={12} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      <p className="text-[10px] font-bold text-slate-300 line-clamp-1 truncate w-32">{file.name}</p>
                    </div>
                    <span className="text-[8px] text-slate-500">{file.modified}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}

      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'google' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        style={{ 
          background: isOpen ? '#0F172A' : '#10B981', // Emerald 500
          border: `1px solid ${isOpen ? 'rgba(16,185,129,0.3)' : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(16,185,129,0.3)'
        }}
        title="Google Workspace"
      >
        <Cloud size={20} className={isOpen ? 'text-emerald-400' : 'text-black group-hover:scale-110 transition-transform'} />
      </button>

    </div>
  );
};
