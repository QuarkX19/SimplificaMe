import React from 'react';
import { User, Bell, Shield, Sliders, X, Check } from 'lucide-react';

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  active?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, label, desc, active }) => (
  <div className="flex items-center gap-5 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
    <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[11px] font-black uppercase tracking-widest text-white">{label}</p>
      <p className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-tight mt-1">{desc}</p>
    </div>
    <div className={`w-10 h-5 rounded-full p-1 transition-all ${active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
       <div className={`w-3 h-3 rounded-full bg-white transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </div>
);

export const StudentSettings: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300 font-sans">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-3 italic">Identidad Técnica</h3>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Perfil <span className="text-emerald-500 font-medium">CION</span></h2>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-2xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all border border-white/10 group shadow-lg">
            <X size={20} className="text-emerald-950 group-hover:text-inherit" />
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          <SettingItem 
            icon={<User size={18} />} 
            label="Visibilidad Corporativa" 
            desc="Reportar estatus de certificación al equipo" 
            active 
          />
          <SettingItem 
            icon={<Bell size={18} />} 
            label="Alertas de Vencimiento" 
            desc="Avisos sobre recertificaciones de normas" 
            active 
          />
          <SettingItem 
            icon={<Shield size={18} />} 
            label="Archivo Técnico" 
            desc="Privacidad en históricos de auditorías" 
          />
          <SettingItem 
            icon={<Sliders size={18} />} 
            label="Neural Hub" 
            desc="Sugerencias según brecha de cumplimiento" 
            active 
          />
        </div>

        <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-[3rem] flex items-center gap-8 relative z-10 shadow-2xl">
           <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-gray-900 to-emerald-950 border border-white/20 flex items-center justify-center p-1 shadow-lg group">
              <div className="w-full h-full rounded-[1.5rem] bg-black/80 flex items-center justify-center text-emerald-400 font-black text-xl italic group-hover:scale-110 transition-transform">
                 LR
              </div>
           </div>
           <div className="flex-1">
              <p className="text-[9px] font-black uppercase text-emerald-900 tracking-[0.3em] mb-1 italic">Rango Normativo</p>
              <p className="text-2xl font-black text-white uppercase italic tracking-tighter shadow-sm">Auditor <span className="text-emerald-400">Líder</span></p>
           </div>
           <button className="px-5 py-3 bg-white/5 border border-white/10 text-emerald-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-emerald-500/10">
              Refinar
           </button>
        </div>

        <button onClick={onClose} className="w-full mt-10 py-6 bg-white text-black font-black uppercase text-[11px] tracking-[0.4em] rounded-3xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 group/btn border border-white/20">
          <Check size={18} strokeWidth={4} /> 
          Sincronizar Nodo
          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover/btn:bg-white/20 ml-2">
             <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
          </div>
        </button>
      </div>
    </div>
  );
};
