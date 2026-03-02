/**
 * SIMPLIFICAME: Strategic Operating System
 * ARCHITECT: Luis Reinaldo Ruiz Sarmiento
 * STACK: React + Vite + Supabase + Tailwind + Lucide
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from "./services/api/supabase";
import { getAuronResponse } from "./api/geminiService";
import { buildChatContext } from "./core/chat/chat.context";
import { Lock, Send, Activity, LogOut, ShieldCheck, ChevronRight } from "lucide-react";
import { MatrixRenderer } from "./ui/layers/MatrixRenderer";
import { getLayerById, getAllLayers } from "./core/methodology/methodology.engine";
import { validateLayer } from "./core/methodology/layer.validator";

const App = () => {
  // --- [1] ESTADOS DE IDENTIDAD & SESIÓN ---
  const [sessionUser, setSessionUser] = useState<User | null>(null); // ✅ tipo correcto
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");

  // --- [2] ESTADOS METODOLÓGICOS ---
  const [activePhase, setActivePhase] = useState(1);
  const [maxPhaseReached, setMaxPhaseReached] = useState(1);
  const [userData, setUserData] = useState<Record<string, string>>({}); // ✅ tipo más estricto

  // --- [3] ESTADOS DE COMUNICACIÓN ---
  const [messages, setMessages] = useState<{ role: 'user' | 'auron'; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [auronLoading, setAuronLoading] = useState(false);

  // ✅ Capa actual memoizada — evita 4 llamadas en cada render
  const currentLayer = useMemo(() => getLayerById(activePhase), [activePhase]);
  const layers = useMemo(() => getAllLayers(), []);

  // --- [4] ESCUCHA DE SESIÓN ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- [5] SINCRONIZACIÓN DE PROGRESO ---
  useEffect(() => {
    if (!sessionUser) return;

    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from('user_context')
        .select('*')
        .eq('user_id', sessionUser.id)
        .single();

      if (error) {
        console.warn('[App] Sin progreso previo:', error.message);
        return;
      }
      if (data) {
        setActivePhase(data.active_phase);
        setMaxPhaseReached(data.max_phase);
      }
    };

    fetchProgress();
  }, [sessionUser]);

  // --- [6] GUARDADO AUTOMÁTICO ---
  const persistProgress = useCallback(async (phase: number, max: number) => {
    if (!sessionUser) return;
    await supabase.from('user_context').upsert({
      user_id: sessionUser.id,
      active_phase: phase,
      max_phase: max,
      updated_at: new Date().toISOString(), // ✅ ISO string
    });
  }, [sessionUser]);

  // --- [7] AGENTE AURON CON GEMINI REAL ---
  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionUser || !currentLayer) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setAuronLoading(true);

    try {
      const isTryingToAdvance = /siguiente|avanzar|cerrar capa/i.test(userText);

      if (isTryingToAdvance) {
        const isValid = validateLayer(currentLayer, userData);
        if (!isValid) {
          setMessages(prev => [...prev, {
            role: 'auron',
            text: `Socio, no puedo validar la Capa ${String(activePhase).padStart(2,'0')}. Faltan outputs críticos: ${currentLayer.outputs.join(", ").toUpperCase()}.`
          }]);
          return;
        }

        const nextPhase = activePhase + 1;
        setActivePhase(nextPhase);
        if (nextPhase > maxPhaseReached) {
          setMaxPhaseReached(nextPhase);
          await persistProgress(nextPhase, nextPhase);
        }
        setMessages(prev => [...prev, {
          role: 'auron',
          text: `¡Excelente! Gobernanza validada. Desbloqueando Fase ${String(nextPhase).padStart(2,'0')}...`
        }]);
        return;
      }

      // ✅ Llamada real a Gemini
      const systemPrompt = buildChatContext(
        currentLayer,
        'DIRECTOR',
        sessionUser.email ?? 'Director',
        'USTED'
      );
      const response = await getAuronResponse(userText, systemPrompt);
      setMessages(prev => [...prev, { role: 'auron', text: response }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'auron',
        text: 'Error de enlace con Auron. Reintente en unos momentos.'
      }]);
    } finally {
      setAuronLoading(false);
    }
  };

  // --- [8] LOGIN REAL CON EMAIL ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    await supabase.auth.signInWithOtp({ email: loginEmail });
    alert(`Magic link enviado a ${loginEmail}`);
  };

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="text-[#00ffff] animate-spin" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#00ffff]">Iniciando AFSE OS...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-[#00ffff]/30 overflow-hidden flex flex-col">

      {/* HEADER */}
      <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between bg-black/60 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[#00ffff] rounded-lg shadow-[0_0_20px_#00ffff]">
            <ShieldCheck size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest text-white uppercase italic">SimplificaME</h1>
            <p className="text-[8px] text-[#00ffff] font-bold tracking-[0.3em] uppercase opacity-60">Gobernanza Estratégica Real</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {sessionUser ? (
            <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <span className="text-[9px] font-black tracking-widest text-slate-400">{sessionUser.email}</span>
              <button onClick={() => supabase.auth.signOut()} className="hover:text-[#ff0055] transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            // ✅ Formulario de login real
            <form onSubmit={handleLogin} className="flex gap-2">
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="tu@email.com"
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] text-white outline-none"
              />
              <button type="submit" className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#00ffff] transition-all">
                Acceder
              </button>
            </form>
          )}
        </div>
      </header>

      {/* BODY */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6">

        {/* NAV: CAPAS */}
        <aside className="w-80 flex flex-col gap-3 overflow-y-auto pr-2">
          {layers.map((l) => {
            const isLocked = l.id > maxPhaseReached;
            const isCurrent = l.id === activePhase;
            return (
              <button
                key={l.id}
                disabled={isLocked}
                onClick={() => setActivePhase(l.id)}
                className={`w-full p-6 rounded-[2.5rem] border-2 text-left transition-all duration-500
                  ${isCurrent ? 'bg-[#00ffff]/10 border-[#00ffff] shadow-[0_0_40px_rgba(0,255,255,0.1)]' : 'border-white/5 bg-black/40'}
                  ${isLocked ? 'opacity-20 cursor-not-allowed' : 'hover:border-white/20'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px]
                    ${isCurrent ? 'bg-[#00ffff] text-black shadow-[0_0_15px_#00ffff]' : 'bg-white/5 text-slate-600'}`}>
                    {isLocked ? <Lock size={12} /> : String(l.id).padStart(2, '0')} {/* ✅ padStart */}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                    {l.code}
                  </span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* WORKSPACE */}
        <section className="flex-1 bg-black/40 border border-white/5 rounded-[4rem] p-16 overflow-y-auto relative">
          {currentLayer && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-16 border-l-4 border-[#00ffff] pl-10">
                <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
                  {currentLayer.name}
                </h2>
                <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">
                  {currentLayer.objective}
                </p>
              </div>
              <div className="grid gap-12">
                <div>
                  <h4 className="text-[10px] font-black text-[#00ffff] uppercase tracking-[0.5em] mb-8 flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-[#00ffff]/30" />
                    Inputs Requeridos (Matriz Principal)
                  </h4>
                  {/* ✅ MatrixRenderer actualiza userData */}
                  <MatrixRenderer
                    fields={currentLayer.mainMatrix.fields}
                    values={userData}
                    onChange={(field, value) =>
                      setUserData(prev => ({ ...prev, [field]: value }))
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* AURON AI PANEL */}
        <aside className="w-[450px] flex flex-col gap-6">
          <div className="p-10 bg-[#00ffff] rounded-[3.5rem] text-black shadow-[0_0_60px_rgba(0,255,255,0.2)]">
            <div className="flex justify-between mb-8">
              <Activity size={32} className="animate-pulse" />
              <div className="text-[10px] font-black uppercase border-2 border-black px-4 py-1 rounded-full">Status: Live</div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-60 italic">Metodología AFSE</p>
            <h3 className="text-3xl font-black uppercase leading-tight italic">Sala de Guerra</h3>
          </div>

          <div className="flex-1 bg-black/80 border border-white/10 rounded-[3.5rem] flex flex-col overflow-hidden">
            <div className="flex-1 p-10 overflow-y-auto space-y-8">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-6 rounded-[2.2rem] text-[12px] font-bold leading-relaxed
                    ${m.role === 'user'
                      ? 'bg-white/5 text-white border border-white/10'
                      : 'bg-[#00ffff]/10 text-[#00ffff] border border-[#00ffff]/20'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {/* ✅ Indicador de carga de Auron */}
              {auronLoading && (
                <div className="flex justify-start">
                  <div className="p-6 rounded-[2.2rem] bg-[#00ffff]/10 border border-[#00ffff]/20">
                    <Activity size={16} className="text-[#00ffff] animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleConsultation} className="p-8 bg-white/5 border-t border-white/5 flex items-center gap-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ESCRIBIR AL COPILOTO..."
                disabled={auronLoading}
                className="flex-1 bg-transparent text-[11px] text-white font-black uppercase tracking-widest outline-none placeholder:text-slate-800 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={auronLoading}
                className="w-14 h-14 bg-[#00ffff] text-black rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_#00ffff] disabled:opacity-50"
              >
                <ChevronRight size={24} />
              </button>
            </form>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;