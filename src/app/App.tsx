/**
 * SIMPLIFICAME: Strategic Operating System
 * ARCHITECT: Luis Reinaldo Ruiz Sarmiento
 * STACK: React + Vite + Supabase + Tailwind + Lucide
 *
 * ✅ FIX: Eliminada lectura de user_context (tabla eliminada en migración)
 * ✅ FIX: getActivePhase() lee desde layer_progress real
 * ✅ FIX: persistProgress() escribe en layer_progress via saveLayerProgress()
 * ✅ FIX: AURON usa buildEnrichedAuronContext() con memoria por capa
 * ✅ FIX: saveAuronMessage() persiste el historial del chat
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from "../services/api/supabase";
import { getAuronResponse } from "../services/api/geminiService";
import { buildChatContext } from "../core/chat/chat.context";
import { Lock, Activity, LogOut, ShieldCheck, ChevronRight } from "lucide-react";
import { MatrixRenderer } from "../ui/layers/MatrixRenderer";
import { getLayerById, getAllLayers } from "../core/methodology/methodology.engine";
import { validateLayer } from "../core/methodology/layer.validator";

// ✅ Servicios del nuevo schema
import {
  getUserCompany,
  getActiveCycle,
  saveLayerProgress,
  getActivePhase,
  type Company,
  type AfseCycle,
} from "../services/company";
import {
  buildEnrichedAuronContext,
  saveAuronMessage,
} from "../services/auronMemory";

const App = () => {
  // --- [1] ESTADOS DE IDENTIDAD & SESIÓN ---
  const [sessionUser, setSessionUser]   = useState<User | null>(null);
  const [loading, setLoading]           = useState(true);
  const [loginEmail, setLoginEmail]     = useState("");

  // --- [2] ESTADOS MULTI-TENANT ---
  const [company, setCompany]   = useState<Company | null>(null);
  const [cycle, setCycle]       = useState<AfseCycle | null>(null);

  // --- [3] ESTADOS METODOLÓGICOS ---
  const [activePhase, setActivePhase]         = useState(1);
  const [maxPhaseReached, setMaxPhaseReached] = useState(1);
  const [userData, setUserData]               = useState<Record<string, string>>({});

  // --- [4] ESTADOS DE COMUNICACIÓN ---
  const [messages, setMessages]       = useState<{ role: 'user' | 'auron'; text: string }[]>([]);
  const [input, setInput]             = useState("");
  const [auronLoading, setAuronLoading] = useState(false);

  // ✅ Capa actual memoizada
  const currentLayer = useMemo(() => getLayerById(activePhase), [activePhase]);
  const layers       = useMemo(() => getAllLayers(), []);

  // --- [5] ESCUCHA DE SESIÓN ---
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

  // --- [6] CARGAR EMPRESA Y CICLO AL INICIAR SESIÓN ---
  useEffect(() => {
    if (!sessionUser) return;

    const loadContext = async () => {
      // ✅ Empresa activa del usuario
      const userCompany = await getUserCompany(sessionUser.id);
      if (!userCompany) {
        console.warn('[App] Usuario sin empresa asignada');
        return;
      }
      setCompany(userCompany);

      // ✅ Ciclo activo
      const activeCycle = await getActiveCycle(userCompany.id);
      if (!activeCycle) {
        console.warn('[App] Sin ciclo activo');
        return;
      }
      setCycle(activeCycle);

      // ✅ FIX CRÍTICO: reemplaza lectura de user_context (tabla eliminada)
      // Ahora lee desde layer_progress real
      const { activePhase: ap, maxPhase: mp } = await getActivePhase(
        userCompany.id,
        activeCycle.id
      );
      setActivePhase(ap);
      setMaxPhaseReached(mp);
    };

    loadContext();
  }, [sessionUser]);

  // --- [7] GUARDADO AUTOMÁTICO DE PROGRESO ---
  // ✅ FIX: escribe en layer_progress (tabla real) via saveLayerProgress()
  const persistProgress = useCallback(async (phase: number) => {
    if (!sessionUser || !company || !cycle || !currentLayer) return;

    await saveLayerProgress(
      sessionUser.id,
      company.id,
      cycle.id,
      phase,
      currentLayer.code,
      { fields: userData },
      0 // completion_pct — se actualiza al completar la capa
    );
  }, [sessionUser, company, cycle, currentLayer, userData]);

  // --- [8] AGENTE AURON ---
  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionUser || !currentLayer) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setAuronLoading(true);

    // ✅ Persistir mensaje del usuario si hay contexto multi-tenant
    if (company && cycle) {
      await saveAuronMessage(
        company.id,
        cycle.id,
        sessionUser.id,
        activePhase,
        'user',
        userText
      );
    }

    try {
      const isTryingToAdvance = /siguiente|avanzar|cerrar capa/i.test(userText);

      if (isTryingToAdvance) {
        const isValid = validateLayer(currentLayer, userData);
        if (!isValid) {
          const response = `Socio, no puedo validar la Capa ${String(activePhase).padStart(2, '0')}. Faltan outputs críticos: ${currentLayer.outputs.join(", ").toUpperCase()}.`;
          setMessages(prev => [...prev, { role: 'auron', text: response }]);

          if (company && cycle) {
            await saveAuronMessage(company.id, cycle.id, sessionUser.id, activePhase, 'auron', response);
          }
          return;
        }

        const nextPhase = activePhase + 1;
        setActivePhase(nextPhase);

        if (nextPhase > maxPhaseReached) {
          setMaxPhaseReached(nextPhase);
          // ✅ Marcar capa anterior como completada (100%)
          if (company && cycle) {
            await saveLayerProgress(
              sessionUser.id,
              company.id,
              cycle.id,
              activePhase,
              currentLayer.code,
              { fields: userData, completedAt: new Date().toISOString() },
              100
            );
          }
        }

        const response = `¡Excelente! Gobernanza validada. Desbloqueando Fase ${String(nextPhase).padStart(2, '0')}...`;
        setMessages(prev => [...prev, { role: 'auron', text: response }]);

        if (company && cycle) {
          await saveAuronMessage(company.id, cycle.id, sessionUser.id, activePhase, 'auron', response);
        }
        return;
      }

      // ✅ Contexto enriquecido con memoria AURON si hay empresa activa
      let systemPrompt: string;
      if (company && cycle) {
        systemPrompt = await buildEnrichedAuronContext(
          company.id,
          company.name,
          activePhase,
          currentLayer.code,
          currentLayer.objective,
          cycle.id
        );
      } else {
        // Fallback sin multi-tenant (modo demo)
        systemPrompt = buildChatContext(
          currentLayer,
          'DIRECTOR',
          sessionUser.email ?? 'Director',
          'USTED'
        );
      }

      const response = await getAuronResponse(userText, systemPrompt);
      setMessages(prev => [...prev, { role: 'auron', text: response }]);

      // ✅ Persistir respuesta de AURON
      if (company && cycle) {
        await saveAuronMessage(company.id, cycle.id, sessionUser.id, activePhase, 'auron', response);
      }

    } catch (err) {
      const errorMsg = 'Error de enlace con Auron. Reintente en unos momentos.';
      setMessages(prev => [...prev, { role: 'auron', text: errorMsg }]);
    } finally {
      setAuronLoading(false);
    }
  };

  // ✅ Guardar progreso al cambiar userData
  useEffect(() => {
    if (!sessionUser || !company || !cycle || Object.keys(userData).length === 0) return;
    const timeout = setTimeout(() => persistProgress(activePhase), 1500); // debounce 1.5s
    return () => clearTimeout(timeout);
  }, [userData]);

  // --- [9] LOGIN CON MAGIC LINK ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    await supabase.auth.signInWithOtp({ email: loginEmail });
    alert(`Magic link enviado a ${loginEmail}`);
  };

  // --- [10] LOADING SCREEN ---
  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="text-[#00ffff] animate-spin" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#00ffff]">
          Iniciando AFSE OS...
        </span>
      </div>
    </div>
  );

  // --- [11] UI PRINCIPAL ---
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
            <p className="text-[8px] text-[#00ffff] font-bold tracking-[0.3em] uppercase opacity-60">
              {company ? company.name : 'Gobernanza Estratégica Real'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* ✅ Score AFSE en header si hay empresa */}
          {company && (
            <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest text-[#00ffff]">AFSE</span>
              <span className="text-[9px] font-black text-white">
                {company.afse_score?.toFixed(0) ?? '0'}
              </span>
            </div>
          )}

          {sessionUser ? (
            <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <span className="text-[9px] font-black tracking-widest text-slate-400">
                {sessionUser.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="hover:text-[#ff0055] transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="flex gap-2">
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="tu@email.com"
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] text-white outline-none"
              />
              <button
                type="submit"
                className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#00ffff] transition-all"
              >
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
            const isLocked  = l.id > maxPhaseReached;
            const isCurrent = l.id === activePhase;
            return (
              <button
                key={l.id}
                disabled={isLocked}
                onClick={() => setActivePhase(l.id)}
                className={`w-full p-6 rounded-[2.5rem] border-2 text-left transition-all duration-500
                  ${isCurrent
                    ? 'bg-[#00ffff]/10 border-[#00ffff] shadow-[0_0_40px_rgba(0,255,255,0.1)]'
                    : 'border-white/5 bg-black/40'}
                  ${isLocked ? 'opacity-20 cursor-not-allowed' : 'hover:border-white/20'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px]
                    ${isCurrent
                      ? 'bg-[#00ffff] text-black shadow-[0_0_15px_#00ffff]'
                      : 'bg-white/5 text-slate-600'}`}>
                    {isLocked ? <Lock size={12} /> : String(l.id).padStart(2, '0')}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest
                    ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
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
              <div className="text-[10px] font-black uppercase border-2 border-black px-4 py-1 rounded-full">
                Status: Live
              </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-60 italic">
              Metodología AFSE
            </p>
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
              {auronLoading && (
                <div className="flex justify-start">
                  <div className="p-6 rounded-[2.2rem] bg-[#00ffff]/10 border border-[#00ffff]/20">
                    <Activity size={16} className="text-[#00ffff] animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleConsultation}
              className="p-8 bg-white/5 border-t border-white/5 flex items-center gap-4"
            >
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