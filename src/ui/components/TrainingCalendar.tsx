import React from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight, ShieldCheck } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  type: 'entrega' | 'clase' | 'examen';
  status: 'pending' | 'urgent' | 'normal'; // Added 'normal' status based on new EVENTS data
}

const EVENTS: Event[] = [
  { id: 1, title: 'Identificación Riesgos NOM-035', date: 'Mañana, 09:00', type: 'clase', status: 'urgent' },
  { id: 2, title: 'Auditoría Interna ISO 9001', date: 'Viernes, 14:00', type: 'examen', status: 'normal' },
  { id: 3, title: 'Carga de Evidencias NOM-019', date: 'Lunes, 18:00', type: 'entrega', status: 'normal' },
];

export const TrainingCalendar: React.FC = () => {
  return (
    <div className="bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 shadow-2xl relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-900 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
             <ShieldCheck size={18} />
          </div>
          Hitos de Cumplimiento
        </h5>
        <button className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest italic tracking-tighter shadow-sm">Cronograma Global</button>
      </div>

      <div className="space-y-6 relative z-10">
        {EVENTS.map(event => (
          <div key={event.id} className="group/item flex items-center gap-8 p-6 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-500 cursor-pointer active:scale-[0.98]">
            <div className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center border shadow-inner transition-all ${
              event.status === 'urgent' ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' : 'bg-black/60 border-white/10 text-emerald-900'
            }`}>
              <span className="text-[9px] font-black uppercase tracking-tighter leading-none mb-1">{event.type === 'examen' ? 'Test' : 'Norma'}</span>
              <Clock size={16} strokeWidth={2.5} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-lg font-black text-white truncate transition-colors uppercase italic tracking-tighter group-hover/item:text-emerald-400">{event.title}</p>
              <p className="text-[10px] text-emerald-900 font-black mt-1 uppercase tracking-[0.3em]">{event.date}</p>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-900 group-hover/item:border-emerald-500/40 group-hover/item:text-emerald-400 transition-all shadow-xl">
               <ChevronRight size={16} strokeWidth={3} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-10 border-t border-white/10 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.4em] text-emerald-950 mb-5">
           <span>Capacidad Técnica Auditada</span>
           <span className="text-emerald-400 italic tracking-tighter shadow-sm">Verified (60%)</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
           <div className="h-full bg-emerald-500 w-3/5 rounded-full relative overflow-hidden shadow-[0_0_20px_#10b981]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
           </div>
        </div>
      </div>
    </div>
  );
};
