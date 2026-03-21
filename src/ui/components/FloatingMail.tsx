import React, { useState } from 'react';
import { Mail, ArrowRight, Inbox, Lock, Globe } from 'lucide-react';

const MOCK_EMAILS = [
  { id: 1, sender: 'Ana Gómez (COO)', subject: 'URGENTE: Aprobación Presupuesto Q3', preview: 'Reinaldo, necesito tu firma en el documento AFSE...', time: '10:42 AM', unread: true },
  { id: 2, sender: 'Microsoft Teams', subject: 'Reunión iniciada: Sincronización Estratégica', preview: 'Carlos Vega te ha invitado a unirte...', time: '09:00 AM', unread: true },
  { id: 3, sender: 'Auron', subject: 'Reporte Semanal Generado', preview: 'Tu índice de madurez AFSE subió un 12%. Revisa...', time: 'Ayer', unread: false },
];

export const FloatingMail: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  React.useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'mail') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  const [emails, setEmails] = useState(MOCK_EMAILS);

  const unreadCount = emails.filter(e => e.unread).length;

  const markAsRead = (id: number) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, unread: false } : e));
  };

  return (
    <div className="relative z-50">
      
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-72 h-80 flex flex-col bg-slate-900/90 backdrop-blur-2xl border border-rose-500/20 rounded-2xl shadow-2xl shadow-rose-500/10 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-2">
          
          <div className="p-4 border-b border-rose-500/10 bg-rose-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <Inbox size={16} className="text-rose-400" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-rose-400">Bandeja VIP</p>
                <p className="text-[10px] text-slate-400 font-medium">Filtro Estratégico</p>
              </div>
            </div>
            {unreadCount > 0 && isLoggedIn && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-black text-[9px] font-black">{unreadCount} Sin leer</span>
            )}
          </div>

          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] mb-1">
                <Lock size={24} className="text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-300 uppercase tracking-widest">Office 365 / Outlook</h3>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Conecta tu cuenta corporativa para sincronizar la Bandeja VIP y las notificaciones de Teams directamente en el Neuro Dock.</p>
              </div>
              <button onClick={() => setIsLoggedIn(true)} className="w-full py-2.5 mt-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-black text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                <Globe size={14} className="stroke-[3px]" /> Conectar Cuenta
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
                {emails.map(email => (
                  <button 
                    key={email.id} 
                    onClick={() => markAsRead(email.id)}
                    className={`w-full text-left p-3 rounded-xl mb-2 transition-all border ${
                      email.unread 
                        ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20' 
                        : 'bg-black/20 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[11px] font-bold ${email.unread ? 'text-rose-200' : 'text-slate-400'}`}>{email.sender}</span>
                      <span className="text-[9px] text-slate-500">{email.time}</span>
                    </div>
                    <p className={`text-[10px] font-bold mb-1 line-clamp-1 ${email.unread ? 'text-white' : 'text-slate-300'}`}>{email.subject}</p>
                    <p className="text-[9px] text-slate-500 line-clamp-1">{email.preview}</p>
                  </button>
                ))}
              </div>
              
              <div className="p-3 border-t border-white/5 bg-black/40 flex justify-center gap-2">
                <button className="flex-1 py-1.5 rounded-lg bg-black/40 hover:bg-black border border-white/10 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1 hover:text-white transition-colors" onClick={() => window.open('https://teams.microsoft.com', '_blank')}>
                  Teams <ArrowRight size={10} />
                </button>
                <button className="flex-1 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[9px] font-bold text-[#25D366] uppercase tracking-widest flex items-center justify-center gap-1 transition-colors" onClick={() => window.open('https://web.whatsapp.com', '_blank')}>
                  WhatsApp <ArrowRight size={10} />
                </button>
              </div>
            </>
          )}
          
        </div>
      )}

      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'mail' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        style={{ 
          background: isOpen ? '#0F172A' : '#F43F5E', 
          border: `1px solid ${isOpen ? 'rgba(244,63,94,0.3)' : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(244,63,94,0.3)'
        }}
      >
        <Mail size={20} className={isOpen ? 'text-rose-400' : 'text-white group-hover:scale-110 transition-transform'} />
        {unreadCount > 0 && !isOpen && (
          <div className="absolute top-2.5 right-2 w-3 h-3 bg-white rounded-full flex items-center justify-center">
            <span className="text-[8px] font-black text-[#F43F5E] leading-none mb-px">{unreadCount}</span>
          </div>
        )}
      </button>

    </div>
  );
};
