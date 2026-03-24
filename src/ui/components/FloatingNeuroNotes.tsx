import React, { useState } from 'react';
import { FileText, Plus, Bell, Trash2, CheckSquare, Mail, MessageCircle, Monitor } from 'lucide-react';

interface Note {
  id: number;
  text: string;
  hasAlarm: boolean;
  alarmDate?: string;
  alarmTime?: string;
  alarmTriggered?: boolean;
}

export const FloatingNeuroNotes: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'notes') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: 'Revisar costos extra en Fase 3', hasAlarm: true, alarmDate: '2026-03-22', alarmTime: '10:00', alarmTriggered: true },
    { id: 2, text: 'Pedirle a Ana la matriz de roles', hasAlarm: false }
  ]);

  // Alarm Checker
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Formato local YYYY-MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;
      const currentTime = now.toTimeString().substring(0, 5); // HH:MM

      let updated = false;
      const newNotes = notes.map(note => {
        if (note.hasAlarm && note.alarmDate === currentDate && note.alarmTime === currentTime && !note.alarmTriggered) {
          // Play bell sound
          const audio = new Audio('https://actions.google.com/sounds/v1/water/droplet_1.ogg');
          audio.volume = 0.8;
          audio.play().catch(e => console.log('Audio block:', e));
          
          updated = true;
          // Auto-open widget to show the alarm note
          setIsOpen(true);
          window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'notes' }));
          
          return { ...note, alarmTriggered: true };
        }
        return note;
      });

      if (updated) {
        setNotes(newNotes);
      }
    }, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [notes]);
  const [input, setInput] = useState('');
  const [alarm, setAlarm] = useState(false);
  const [alarmDate, setAlarmDate] = useState('');
  const [alarmTime, setAlarmTime] = useState('');

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setNotes([{ id: Date.now(), text: input, hasAlarm: alarm, alarmDate, alarmTime }, ...notes]);
    setInput('');
    setAlarm(false);
    setAlarmDate('');
    setAlarmTime('');
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="relative z-50">
      
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-64 flex flex-col bg-slate-900/90 backdrop-blur-2xl border border-amber-500/20 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-2">
          
          <div className="p-4 border-b border-amber-500/10 bg-amber-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <FileText size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-amber-400">Auron Notes</p>
                <p className="text-[10px] text-slate-400 font-medium">Borrador Rápido</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-black/40 border-b border-white/5">
            <form onSubmit={addNote} className="flex flex-col gap-2">
              <textarea
                value={input} onChange={e => setInput(e.target.value)}
                placeholder="Anota una idea estratégica..."
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[11px] text-white outline-none focus:border-amber-500/50 resize-none h-16 scrollbar-none"
              />
              
              {alarm && (
                <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-2">
                    <input type="date" value={alarmDate} onChange={e => setAlarmDate(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded p-1 text-[9px] text-amber-200 outline-none focus:border-amber-500/30" />
                    <input type="time" value={alarmTime} onChange={e => setAlarmTime(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded p-1 text-[9px] text-amber-200 outline-none focus:border-amber-500/30" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mr-1">Notificar en:</span>
                    <button type="button" className="w-5 h-5 flex flex-shrink-0 items-center justify-center rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors" title="Bandeja VIP"><Mail size={10} /></button>
                    <button type="button" className="w-5 h-5 flex flex-shrink-0 items-center justify-center rounded bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors" title="WhatsApp"><MessageCircle size={10} /></button>
                    <button type="button" className="w-5 h-5 flex flex-shrink-0 items-center justify-center rounded bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/30 transition-colors" title="Teams"><Monitor size={10} /></button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-1">
                <button type="button" onClick={() => setAlarm(!alarm)} className={`px-2 py-1 rounded border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${alarm ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
                  <Bell size={10} /> Alarma
                </button>
                <button type="submit" disabled={!input.trim()} className="w-7 h-7 flex items-center justify-center bg-amber-500 hover:bg-amber-400 rounded-lg text-black disabled:opacity-50 transition-colors">
                  <Plus size={14} className="stroke-[3px]" />
                </button>
              </div>
            </form>
          </div>

          <div className="max-h-48 overflow-y-auto p-3 space-y-2 scrollbar-none">
            {notes.map(note => (
              <div key={note.id} className="group flex items-start gap-2 bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl p-2 transition-colors relative">
                {note.hasAlarm && <Bell size={10} className="text-red-400 mt-0.5 flex-shrink-0" />}
                {!note.hasAlarm && <CheckSquare size={10} className="text-slate-500 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 pr-6 flex flex-col">
                  <p className="text-[10px] text-slate-300 leading-snug">{note.text}</p>
                  {note.hasAlarm && (note.alarmDate || note.alarmTime) && (
                    <span className="text-[8px] font-black tracking-widest uppercase text-amber-500/70 mt-1">
                      {note.alarmDate} {note.alarmTime}
                    </span>
                  )}
                </div>
                
                <button onClick={() => deleteNote(note.id)} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="py-6 text-center text-slate-500 text-[10px] uppercase tracking-widest font-medium">Bandeja Vacía</div>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'notes' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        style={{ 
          background: isOpen ? '#0F172A' : '#F59E0B', 
          border: `1px solid ${isOpen ? 'rgba(245,158,11,0.3)' : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(245,158,11,0.3)'
        }}
      >
        <FileText size={20} className={isOpen ? 'text-amber-400' : 'text-black group-hover:scale-110 transition-transform'} />
      </button>

    </div>
  );
};
