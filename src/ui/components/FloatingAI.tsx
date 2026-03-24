import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, Loader2, Maximize2, Mic, MicOff, Paperclip, X, Copy } from 'lucide-react';
import { getAuronResponse } from '../../services/api/geminiService';

interface Msg {
  id: number;
  role: 'user' | 'auron';
  text: string;
}

export const FloatingAI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const saved = localStorage.getItem('auron_universal_chat');
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return [{ id: 1, role: 'auron', text: 'Soy el Oráculo Auron. 🧠 Pregúntame lo que sea: cultura general, traducciones, redacción o cálculos. Estoy fuera de la arquitectura empresarial para servirte libremente.' }];
  });

  useEffect(() => {
    localStorage.setItem('auron_universal_chat', JSON.stringify(messages));
  }, [messages]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, content: string} | null>(null);
  const recognitionRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Inicializar Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'es-MX';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInput(prev => (prev + ' ' + transcript).trim());
            } else {
              interimTranscript += transcript;
            }
          }
          // Si quisiéramos mostrar interimTranscript lo tendríamos en otro state,
          // por ahora seteamos el input con lo final combinado
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Mic error:", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput(''); // Limpiar input antes de hablar
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'ai') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setAttachedFile({ name: file.name, content: text });
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedFile) || loading) return;

    const userText = input.trim();
    setInput('');
    
    // UI Visual Message Formulation
    const displayMsg = attachedFile 
      ? userText ? `${userText}\n\n[📎 Documento: ${attachedFile.name}]` : `[📎 Documento Analizado: ${attachedFile.name}]` 
      : userText;

    // Actual Payload for Gemini
    let finalPrompt = userText;
    if (attachedFile) {
      finalPrompt += `\n\n[DATOS ADJUNTOS DEL ARCHIVO ${attachedFile.name}]:\n${attachedFile.content}`;
    }

    const currentHistory = messages.slice(1).map(m => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.text }] as [{ text: string }]
    }));

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: displayMsg }]);
    setLoading(true);
    
    // Clean up attachment immediately after sending
    setAttachedFile(null);

    try {
      const response = await getAuronResponse(
        finalPrompt,
        {
          systemPrompt: "Eres el Oráculo Auron, un asistente ultra-inteligente, directo y amistoso. Responde libremente a cualquier consulta sin limitarte a la Arquitectura ME. No uses reglas de rapport corporativo, responde directamente la consulta del usuario. Analiza cualquier dato adjunto como un experto.",
          history: currentHistory
        }
      );
      setMessages(prev => [...prev, { id: Date.now(), role: 'auron', text: response || 'Hubo interferencia en la red...' }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'auron', text: 'Error de conexión con la CPU principal.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-50">
      
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 w-80 md:w-96 -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl border border-fuchsia-500/30 rounded-3xl shadow-[0_20px_50px_rgba(217,70,239,0.15)] flex flex-col overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-2 h-[450px]">
          
          <div className="p-4 border-b border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-600/10 to-purple-600/10 flex items-center justify-between relative shadow-inner">
            <div className="absolute top-0 left-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-900 to-fuchsia-500/30 flex items-center justify-center border border-fuchsia-400/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                <Sparkles size={18} className="text-fuchsia-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-400 drop-shadow-md">Auron Oráculo</h3>
                <p className="text-[10px] text-fuchsia-200/60 font-medium tracking-widest uppercase">Asistente Universal</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-300 transition-colors border border-transparent hover:border-fuchsia-500/30">
              <Maximize2 size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-black/20">
            {messages.map(msg => {
              const handleOptionSelect = (optionText: string) => {
                setInput(prev => {
                  const parts = prev.split(',').map(s => s.trim()).filter(Boolean);
                  if (parts.includes(optionText)) return parts.filter(p => p !== optionText).join(', ');
                  return [...parts, optionText].join(', ');
                });
              };

              const renderText = (text: string, role: string) => {
                if (role !== 'auron') return text;
                return text.split('\n').map((line, i) => {
                  const match = line.match(/^([A-Ea-e]\)|\d+\.|\-|\*)\s*(.*)$/);
                  if (match) {
                    const bullet = match[1].replace(/[)\.]/, '').trim() || '•';
                    const cleanText = match[2].replace(/[_\\]/g, '').trim();
                    if (cleanText.length > 2 && cleanText.length < 120) {
                      const isSelected = input.includes(cleanText);
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => handleOptionSelect(cleanText)}
                          className={`block w-full text-left my-2 px-3 py-2.5 rounded-xl text-[13px] transition-transform hover:-translate-y-0.5 active:scale-95 group border ${isSelected ? 'border-fuchsia-400 bg-fuchsia-500/30' : 'border-fuchsia-500/20 bg-fuchsia-900/10 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/50'} text-fuchsia-100`}
                        >
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-black mr-2 transition-colors ${isSelected ? 'bg-fuchsia-400 text-black' : 'bg-fuchsia-500/20 text-fuchsia-300 group-hover:bg-fuchsia-500 group-hover:text-black'}`}>{bullet}</span>
                          <span className="group-hover:text-white transition-colors">{cleanText}</span>
                        </button>
                      );
                    }
                  }
                  return <span key={i} className="block mb-1">{line}</span>;
                });
              };

              return (
              <div key={msg.id} className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center border shadow-inner ${msg.role === 'user' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap relative group ${msg.role === 'user' ? 'bg-indigo-600/20 text-indigo-100 rounded-tr-sm border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]' : 'bg-fuchsia-900/30 text-fuchsia-100 rounded-tl-sm border border-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.1)]'}`}>
                  {renderText(msg.text, msg.role)}
                  {msg.role === 'auron' && (
                    <button 
                      onClick={() => navigator.clipboard.writeText(msg.text)}
                      className="absolute -top-2 -right-2 p-1.5 bg-fuchsia-950 border border-fuchsia-500/50 hover:bg-fuchsia-600 hover:text-white rounded-lg text-fuchsia-300 opacity-0 group-hover:opacity-100 transition-all shadow-lg cursor-pointer flex items-center justify-center transform hover:scale-110 active:scale-95"
                      title="Copiar respuesta"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
            })}
            {loading && (
              <div className="flex gap-3 max-w-[85%] mr-auto animate-in fade-in">
                <div className="w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center border bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300">
                  <Sparkles size={14} className="animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-fuchsia-900/30 text-fuchsia-100/50 rounded-tl-sm border border-fuchsia-500/20 text-sm italic flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" /> Procesando red neuronal...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 bg-black/60 border-t border-white/5 backdrop-blur-md flex flex-col gap-2">
            
            {attachedFile && (
              <div className="flex items-center justify-between bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-200 text-xs px-3 py-1.5 rounded-lg animate-in fade-in">
                <span className="flex items-center gap-2 truncate">
                  <Paperclip size={12} className="text-fuchsia-400" /> {attachedFile.name}
                </span>
                <button onClick={() => setAttachedFile(null)} className="hover:text-fuchsia-400 transition-colors ml-2">
                  <X size={14} />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="relative flex items-center pr-24 bg-fuchsia-950/20 border border-fuchsia-500/20 rounded-xl shadow-inner focus-within:border-fuchsia-500/50 transition-all">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".txt,.csv,.json,.md,.js,.ts" 
              />
              <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)}
                placeholder={isListening ? "Escuchando..." : "Pregunta o redacta..."} 
                className="w-full bg-transparent py-3 pl-4 pr-2 text-sm text-fuchsia-100 placeholder:text-fuchsia-300/30 outline-none"
                disabled={loading}
              />
              <div className="absolute right-1.5 flex gap-1 items-center">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-transparent text-fuchsia-400 hover:bg-fuchsia-500/20 transition-all"
                  title="Adjuntar Datos (CSV, TXT)"
                >
                  <Paperclip size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={toggleListen}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-90 ${isListening ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse' : 'bg-transparent text-fuchsia-400 hover:bg-fuchsia-500/20'}`}
                  title={isListening ? "Detener micrófono" : "Dictar por voz"}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
                <button 
                  type="submit" 
                  disabled={(!input.trim() && !attachedFile) || loading}
                  className="w-7 h-7 flex items-center justify-center bg-fuchsia-500 text-black rounded-lg hover:bg-fuchsia-400 disabled:opacity-50 disabled:grayscale transition-all active:scale-90 shadow-[0_0_10px_rgba(217,70,239,0.3)]"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'ai' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        style={{ 
          background: isOpen ? '#0F172A' : '#D946EF', 
          border: `1px solid ${isOpen ? 'rgba(217,70,239,0.3)' : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(217,70,239,0.3)'
        }}
        title="Oráculo (AI Universal)"
      >
        <Sparkles size={20} className={isOpen ? 'text-fuchsia-400' : 'text-black group-hover:scale-110 transition-transform'} />
      </button>

    </div>
  );
};
