import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, ChevronLeft, ChevronRight, Plus, MapPin, Video } from 'lucide-react';

export const FloatingAgenda: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'agenda') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    
    // Live clock
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    
    return () => {
      window.removeEventListener('neuro-dock-expand', handleExpand);
      clearInterval(timer);
    };
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonthRaw = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Adjust so Monday is 0, Sunday is 6, or just standard 0 = Sunday
  const firstDayOfMonth = firstDayOfMonthRaw;

  // Basic mock events based on date parity to make it feel alive
  const getEventsForDate = (date: Date) => {
    const day = date.getDate();
    if (day === new Date().getDate() && date.getMonth() === new Date().getMonth()) return [
      { t: '09:00 AM', title: 'Daily Standup Operations', icon: 'meet' },
      { t: '02:30 PM', title: 'Revisión Financiera Q2', icon: 'room' }
    ];
    if (day % 4 === 0) return [
      { t: '11:00 AM', title: 'Entrevista de Talento (TI)', icon: 'meet' },
    ];
    if (day % 7 === 0) return [
      { t: '10:00 AM', title: 'Comité de Arquitectura', icon: 'meet' },
      { t: '04:00 PM', title: 'Reporte a Dirección', icon: 'room' }
    ];
    return [];
  };

  const currentEvents = getEventsForDate(selectedDate);
  const isToday = (d: number) => d === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="relative z-50">
      
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-80 bg-slate-900/95 backdrop-blur-2xl border border-rose-500/30 rounded-3xl shadow-2xl shadow-rose-500/10 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-2">
          
          <div className="p-4 border-b border-rose-500/20 bg-gradient-to-r from-rose-600/10 to-rose-900/10 flex items-center justify-between relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="flex items-center gap-3 relative z-10 w-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-900 to-rose-500/30 flex flex-col items-center justify-center border border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] flex-shrink-0 relative overflow-hidden">
                {/* Micro reflection */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10"></div>
                <span className="text-[8px] font-black text-rose-200 uppercase tracking-widest leading-none mt-[2px]">Hoy</span>
                <span className="text-sm font-black text-white leading-none">{new Date().getDate()}</span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[12px] font-black uppercase tracking-[0.1em] text-rose-400 leading-tight">
                  Agenda Ejecutiva
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={10} className="text-rose-200/70" />
                  <p className="text-xs text-white font-mono font-bold drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]">
                    {currentDate.toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full bg-black/20 hover:bg-rose-500/20 flex items-center justify-center text-rose-300 border border-transparent hover:border-rose-500/30 transition-all flex-shrink-0 shadow-inner">
                <Plus size={14} className="stroke-[3px]" />
              </button>
            </div>
          </div>

          <div className="flex flex-col bg-gradient-to-b from-black/40 to-black/60 relative">
            
            {/* Calendar Controls */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 z-10 relative">
              <span className="text-xs font-black text-rose-100 uppercase tracking-widest capitalize">
                {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all active:scale-95 border border-transparent hover:border-rose-500/30"><ChevronLeft size={14}/></button>
                <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all active:scale-95 border border-transparent hover:border-rose-500/30"><ChevronRight size={14}/></button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="px-5 pb-4 z-10 relative">
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                  <div key={d} className="text-[9px] font-black text-rose-500/60 text-center py-1 uppercase">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-[2px]">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1;
                  const selected = selectedDate.getDate() === d && selectedDate.getMonth() === currentDate.getMonth();
                  const today = isToday(d);
                  const hasEvents = getEventsForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d)).length > 0;
                  
                  return (
                    <button 
                      key={d} 
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d))}
                      className={`relative h-8 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all
                        ${today ? 'bg-rose-500 border border-rose-400 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse-slow' : 
                          selected ? 'bg-rose-900/50 border border-rose-500/50 text-rose-200 shadow-inner' : 
                          'text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10'}
                      `}
                    >
                      {d}
                      {hasEvents && !today && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-rose-500/80"></div>}
                      {hasEvents && today && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Divider curve aesthetic */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent"></div>

            {/* Agenda View */}
            <div className="bg-slate-950 p-4 h-44 overflow-y-auto scrollbar-thin relative rounded-b-3xl">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500/80 mb-3 flex items-center gap-2">
                <MapPin size={10}/>
                Bitácora {selectedDate.getDate() === new Date().getDate() ? 'de Hoy' : selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </p>
              
              {currentEvents.length > 0 ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {currentEvents.map((ev, i) => (
                    <div key={i} className="flex gap-3 items-start p-2.5 rounded-xl bg-black/40 border border-rose-500/10 hover:border-rose-500/40 hover:bg-rose-900/10 transition-all group cursor-pointer shadow-inner">
                      <div className="w-12 text-right flex-shrink-0 pt-0.5">
                        <span className="text-[9px] font-black text-slate-400 group-hover:text-rose-300 transition-colors uppercase tabular-nums tracking-wider">{ev.t}</span>
                      </div>
                      <div className="flex-1 border-l-2 border-rose-500/20 group-hover:border-rose-400 pl-3 transition-colors">
                        <p className="text-[11px] font-bold text-slate-200 group-hover:text-white transition-colors">{ev.title}</p>
                        <div className="flex items-center gap-1 mt-1 text-slate-500 group-hover:text-slate-300 transition-colors">
                          {ev.icon === 'meet' ? <Video size={10} className="text-blue-400" /> : <MapPin size={10} className="text-emerald-400" />}
                          <span className="text-[9px] uppercase tracking-wider font-medium">{ev.icon === 'meet' ? 'Videollamada' : 'Sala Juntas'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40 hover:opacity-70 transition-opacity pb-6">
                  <CalendarDays size={28} className="text-rose-500 mb-3" />
                  <p className="text-[10px] text-rose-200 uppercase tracking-widest font-black">Día Despejado</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'agenda' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        style={{ 
          background: isOpen ? '#0F172A' : '#F43F5E', 
          border: `1px solid ${isOpen ? 'rgba(244,63,94,0.3)' : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(244,63,94,0.3)'
        }}
        title="Agenda Ejecutiva"
      >
        <CalendarDays size={20} className={isOpen ? 'text-rose-500' : 'text-white group-hover:scale-110 transition-transform drop-shadow-md'} />
        {!isOpen && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 rounded-lg border border-[#F43F5E]/50 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.4)]">
            <span className="text-[7px] font-black text-rose-400 leading-none">{new Date().getDate()}</span>
          </div>
        )}
      </button>

    </div>
  );
};
