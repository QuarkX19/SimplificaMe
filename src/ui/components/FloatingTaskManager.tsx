import React, { useState } from 'react';
import { Calendar, CheckSquare, MessageCircle, Clock, Send, ChevronLeft, CalendarClock, UserCheck } from 'lucide-react';

const MOCK_TASKS = [
  { id: 1, title: 'Revisión Misión/Visión AFSE', dueDate: 'Hoy, 5:00 PM', status: 'in-progress', assignedTo: 'Ana Gómez', role: 'Operaciones', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, title: 'Costeo de Procesos NOM', dueDate: 'Mañana, 10:00 AM', status: 'pending', assignedTo: 'Luis Ruiz', role: 'Finanzas', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, title: 'KPIs Cuadro de Mando', dueDate: 'Viernes, 3:00 PM', status: 'pending', assignedTo: 'Carlos Vega', role: 'Planeación', avatar: 'https://i.pravatar.cc/150?u=3' },
];

export const FloatingTaskManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  React.useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'tasks') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  const [activeChat, setActiveChat] = useState<typeof MOCK_TASKS[0] | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<number, {text:string, sender:'me'|'them', ts:string}[]>>({
    1: [{ text: "Hola, ya casi termino el documento AFSE. Te lo envío en 1 hora.", sender: 'them', ts: "10:30 AM" }],
    2: [{ text: "Necesito las métricas del Q1 para el costeo.", sender: 'me', ts: "Ayer" }]
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChat) return;
    
    const newMsg = { text: chatInput, sender: 'me' as const, ts: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setChatMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg]
    }));
    setChatInput('');
  };

  return (
    <div className="relative z-50">
      
      {/* Mini Widget Expandable */}
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-80 h-96 flex flex-col bg-slate-900/80 backdrop-blur-2xl border border-indigo-500/20 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-2">
          
          {/* HEADER */}
          <div className="p-4 border-b border-white/5 bg-indigo-500/5 flex items-center justify-between flex-shrink-0">
            {activeChat ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-indigo-400">
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <img src={activeChat.avatar} alt="" className="w-8 h-8 rounded-full border border-indigo-500/30" />
                  <div className="leading-tight">
                    <p className="text-[11px] font-bold text-indigo-100">{activeChat.assignedTo}</p>
                    <p className="text-[9px] text-indigo-400 uppercase tracking-wider">{activeChat.role}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <CalendarClock size={16} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Team.Tasks</p>
                  <p className="text-[10px] text-slate-400 font-medium">Cronograma Activo</p>
                </div>
              </div>
            )}
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto scrollbar-none relative">
            
            {/* VIEW 1: TASK LIST */}
            {!activeChat && (
              <div className="p-3 space-y-2">
                {MOCK_TASKS.map(task => (
                  <div key={task.id} className="bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl p-3 px-4 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-bold text-slate-200 leading-tight pr-4">{task.title}</p>
                      <button 
                        onClick={() => setActiveChat(task)}
                        className="w-7 h-7 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 flex items-center justify-center text-indigo-400 hover:text-white transition-all border border-indigo-500/20"
                        title="Abrir Chat"
                      >
                        <MessageCircle size={13} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={10} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-300 transition-colors">
                          {task.assignedTo}
                        </span>
                        <img src={task.avatar} alt="" className="w-5 h-5 rounded-full border border-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 2: INTERNAL CHAT */}
            {activeChat && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  <div className="text-center mb-4">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 bg-black/20 px-2 py-1 rounded-full">
                      Chat vinculado a: {activeChat.title}
                    </span>
                  </div>
                  {(chatMessages[activeChat.id] || []).map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'me' ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/30 rounded-br-sm' 
                                          : 'bg-white/5 text-slate-300 border border-white/10 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-slate-500 mt-1 font-medium">{msg.ts}</span>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleSendMessage} className="p-3 bg-black/40 border-t border-white/5 flex gap-2">
                  <input
                    type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    placeholder="Escribir mensaje..."
                    className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 text-[11px] text-white outline-none focus:border-indigo-500/50"
                  />
                  <button type="submit" disabled={!chatInput.trim()} className="w-9 h-9 flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white disabled:opacity-50 transition-colors">
                    <Send size={14} className="ml-0.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'tasks' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        style={{ 
          background: isOpen ? '#0F172A' : '#6366F1', // Indigo
          border: `1px solid ${isOpen ? 'rgba(99,102,241,0.3)' : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(99,102,241,0.3)'
        }}
        title="Tareas & Equipo"
      >
        <CheckSquare size={20} className={isOpen ? 'text-indigo-400' : 'text-white group-hover:scale-110 transition-transform'} />
        {/* Notification dot */}
        {!isOpen && <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#6366F1] animate-pulse" />}
      </button>

    </div>
  );
};
