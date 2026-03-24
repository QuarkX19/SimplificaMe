import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Video, 
  MessageSquare, 
  Calendar, 
  User, 
  Search, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  Zap,
  ExternalLink,
  MoreVertical
} from 'lucide-react';

interface Consultant {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: 'online' | 'offline' | 'busy';
  avatar: string;
  nextAvailable: string;
  rating: number;
}

interface ModuleConsultaMEProps {
  userLevel?: string; // 'master' | 'consultor' | 'cliente'
}

export const ModuleConsultaME: React.FC<ModuleConsultaMEProps> = ({ userLevel = 'master' }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const consultants: Consultant[] = [
    {
      id: '1',
      name: 'Dr. Roberto Mendoza',
      role: 'Consultor Senior',
      specialty: 'Seguridad Industrial / NOM-035',
      status: 'online',
      avatar: 'https://i.pravatar.cc/150?u=roberto',
      nextAvailable: 'Hoy, 16:00',
      rating: 4.9
    },
    {
      id: '2',
      name: 'Ing. Elena García',
      role: 'Auditor Externo',
      specialty: 'Sistemas de Gestión ISO 9001',
      status: 'busy',
      avatar: 'https://i.pravatar.cc/150?u=elena',
      nextAvailable: 'Mañana, 09:00',
      rating: 5.0
    },
    {
      id: '3',
      name: 'Mtro. Carlos Slim',
      role: 'Estratega Normativo',
      specialty: 'Cumplimiento Legal y Auditorías',
      status: 'offline',
      avatar: 'https://i.pravatar.cc/150?u=carlos',
      nextAvailable: '25 Mar, 11:30',
      rating: 4.8
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 pb-20">
      {/* HEADER TÁCTICO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="max-w-2xl relative">
          <div className="absolute -left-8 top-0 bottom-0 w-1 bg-rose-500/20 rounded-full" />
          <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tighter leading-[0.9] mb-6 uppercase italic">
            {t('common:consulta.title').split(' ')[0]} <br />
            <span className="text-rose-500 not-italic">{t('common:consulta.title').split(' ')[1]}</span>
          </h1>
          <p className="text-rose-400/50 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
            {t('common:consulta.tagline')}
          </p>
        </div>

        {userLevel === 'master' && (
          <div className="flex-shrink-0 bg-black border border-white/10 rounded-3xl p-6 xl:p-8 flex items-center gap-6 shadow-2xl relative overflow-hidden group/master">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover/master:opacity-100 transition-opacity" />
            <div className="w-12 h-12 bg-rose-950/30 rounded-xl flex items-center justify-center text-rose-500 border border-rose-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-[8px] font-black text-rose-900 uppercase tracking-[0.4em] mb-1 italic">{t('common:consulta.masterControl')}</p>
              <p className="text-white font-black text-sm uppercase tracking-widest">{t('common:consulta.globalMonitor')}</p>
            </div>
          </div>
        )}
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-rose-500 transition-colors">
          <Search size={18} />
        </div>
        <input 
          type="text"
          placeholder={t('common:consulta.expertSearch')}
          className="w-full bg-black border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 transition-all shadow-2xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* GRID DE CONSULTORES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {consultants.map((consultant) => (
          <div key={consultant.id} className="group relative bg-[#050811] border border-white/5 rounded-[3rem] p-8 overflow-hidden hover:border-rose-500/20 transition-all duration-700 shadow-2xl hover:shadow-[0_20px_50px_-20px_rgba(244,63,94,0.15)]">
            {/* BG ICON GLOW */}
            <div className="absolute -top-10 -right-10 opacity-0 group-hover:opacity-10 transition-all duration-1000">
               <Zap size={200} className="text-rose-500 blur-2xl" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-2 border-white/10 group-hover:border-rose-500/30 transition-colors">
                    <img src={consultant.avatar} alt={consultant.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#050811] flex items-center justify-center ${
                    consultant.status === 'online' ? 'bg-emerald-500' : 
                    consultant.status === 'busy' ? 'bg-amber-500' : 'bg-slate-500'
                  }`}>
                    {consultant.status === 'online' && <div className="w-full h-full rounded-full animate-ping bg-emerald-500 opacity-75" />}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <span className="text-xl font-black text-white italic tracking-tighter">{consultant.rating}</span>
                    <Zap size={10} className="text-amber-500 fill-amber-500" />
                  </div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none italic">{t('common:consulta.rating')}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-rose-400 transition-colors">{consultant.name}</h3>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4 italic">{consultant.role}</p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[90%]">{consultant.specialty}</p>
              </div>

              {/* AGENDA WIDGET */}
              <div className="bg-white/5 rounded-2xl p-5 mb-8 border border-white/5 group-hover:border-rose-500/10 transition-colors">
                <div className="flex items-center gap-3 mb-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <Calendar size={12} className="text-rose-500" />
                  {t('common:consulta.agenda')}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-white tracking-tight">{consultant.nextAvailable}</span>
                  <div className="px-3 py-1 bg-rose-500/10 rounded-lg text-[8px] font-black text-rose-400 uppercase tracking-widest hover:bg-rose-500 hover:text-white cursor-pointer transition-all">
                    Agendar
                  </div>
                </div>
              </div>

              {/* ACCIONES DE CONTACTO */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all group/btn">
                  <MessageSquare size={14} />
                  {t('common:consulta.chat')}
                </button>
                <button className="flex items-center justify-center gap-3 py-4 bg-black border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-rose-500/50 hover:text-rose-400 transition-all">
                  <Video size={14} />
                  {t('common:consulta.meet')}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* CONSULTOR MOCK PARA MASTER */}
        {userLevel === 'master' && (
          <div className="group border-2 border-dashed border-white/5 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center hover:border-rose-500/20 transition-all cursor-pointer bg-white/[0.02]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6 group-hover:scale-110 group-hover:text-rose-500 transition-all">
              <User size={32} />
            </div>
            <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-2">{t('common:consulta.assign')}</h4>
            <p className="text-[10px] text-white/20 max-w-[200px]">{t('common:consulta.tagline')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
