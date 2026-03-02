/**
 * SIMPLIFICAME: Strategic Operating System
 * ARCHITECT: Luis Reinaldo Ruiz Sarmiento
 * STACK: React + Vite + Supabase + Tailwind + Lucide + Recharts
 * DESIGN: AFSE NeuroCode Ultra — Cyberpunk Strategic OS
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from "../services/api/supabase";
import { getAuronResponse } from "../services/api/geminiService";
import { buildChatContext } from "../core/chat/chat.context";
import {
  Lock, Activity, LogOut, ShieldCheck, ChevronRight,
  BarChart3, Cpu, TrendingUp, AlertCircle, Terminal,
  RefreshCw, Zap, Network, Eye, Target, Brain
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";
import { MatrixRenderer } from "../ui/layers/MatrixRenderer";
import { getLayerById, getAllLayers } from "../core/methodology/methodology.engine";
import { validateLayer } from "../core/methodology/layer.validator";
import {
  getUserCompany, getActiveCycle, saveLayerProgress,
  getActivePhase, type Company, type AfseCycle,
} from "../services/company";
import {
  buildEnrichedAuronContext, saveAuronMessage,
} from "../services/auronMemory";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type MsgRole = 'user' | 'auron';
interface ChatMsg { role: MsgRole; text: string; ts: string; }

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const LAYER_COLORS = ['#00ffff', '#00e5ff', '#00ccff', '#0099ff', '#0066ff', '#5533ff', '#9900ff', '#cc00ff'];
const STATUS_MAP = {
  ÓPTIMO:    { color: '#00ffff', glow: '0 0 20px #00ffff', label: 'ÓPTIMO' },
  ESTABLE:   { color: '#28a745', glow: '0 0 20px #28a745', label: 'ESTABLE' },
  EN_RIESGO: { color: '#eab308', glow: '0 0 20px #eab308', label: 'EN RIESGO' },
  CRÍTICO:   { color: '#ef4444', glow: '0 0 20px #ef4444', label: 'CRÍTICO' },
};

function getAfseStatus(score: number) {
  if (score >= 90) return STATUS_MAP.ÓPTIMO;
  if (score >= 70) return STATUS_MAP.ESTABLE;
  if (score >= 50) return STATUS_MAP.EN_RIESGO;
  return STATUS_MAP.CRÍTICO;
}

// ─── ANIMATED SCANLINE ────────────────────────────────────────────────────────
const Scanline = () => (
  <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden opacity-[0.03]"
    style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.15) 2px, rgba(0,255,255,0.15) 4px)' }} />
);

// ─── CYBER GRID BACKGROUND ────────────────────────────────────────────────────
const CyberGrid = () => (
  <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
    style={{
      backgroundImage: `
        linear-gradient(rgba(0,255,255,0.5) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,255,0.5) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px'
    }} />
);

// ─── GLITCH TEXT ──────────────────────────────────────────────────────────────
const GlitchText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
  <span className={`relative inline-block ${className}`}
    style={{ textShadow: '2px 0 #ff0055, -2px 0 #00ffff' }}>
    {text}
  </span>
);

// ─── LAYER NAV PILL ───────────────────────────────────────────────────────────
interface LayerPillProps {
  id: number; code: string; isLocked: boolean;
  isCurrent: boolean; isCompleted: boolean;
  onClick: () => void;
}
const LayerPill: React.FC<LayerPillProps> = ({ id, code, isLocked, isCurrent, isCompleted, onClick }) => {
  const color = LAYER_COLORS[id - 1] ?? '#00ffff';
  return (
    <button
      disabled={isLocked}
      onClick={onClick}
      className="w-full p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group"
      style={{
        background: isCurrent ? `${color}12` : 'rgba(0,0,0,0.4)',
        borderColor: isCurrent ? color : 'rgba(255,255,255,0.06)',
        boxShadow: isCurrent ? `0 0 30px ${color}20` : 'none',
        opacity: isLocked ? 0.25 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
      }}
    >
      {isCurrent && (
        <div className="absolute left-0 top-0 w-1 h-full rounded-l-2xl"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
      )}
      <div className="flex items-center gap-3 pl-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black transition-all"
          style={{
            background: isCurrent ? color : 'rgba(255,255,255,0.05)',
            color: isCurrent ? '#000' : 'rgba(255,255,255,0.3)',
            boxShadow: isCurrent ? `0 0 12px ${color}` : 'none',
          }}>
          {isLocked ? <Lock size={10} /> : String(id).padStart(2, '0')}
        </div>
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.25em]"
            style={{ color: isCurrent ? color : 'rgba(255,255,255,0.35)' }}>
            {code}
          </div>
          {isCompleted && !isCurrent && (
            <div className="text-[7px] font-bold tracking-widest mt-0.5" style={{ color: '#28a745' }}>
              ✓ COMPLETADA
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
interface MetricCardProps { label: string; value: string; sub?: string; color?: string; icon?: React.ReactNode; }
const MetricCard: React.FC<MetricCardProps> = ({ label, value, sub, color = '#00ffff', icon }) => (
  <div className="bg-black/60 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
      style={{ background: color }} />
    <div className="flex items-start justify-between mb-4">
      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">{label}</p>
      {icon && <div style={{ color }}>{icon}</div>}
    </div>
    <p className="text-3xl font-black text-white tracking-tighter" style={{ textShadow: `0 0 20px ${color}40` }}>
      {value}
    </p>
    {sub && <p className="text-[9px] font-bold mt-2" style={{ color }}>{sub}</p>}
  </div>
);

// ─── AURON MESSAGE ────────────────────────────────────────────────────────────
const AuronMsg: React.FC<{ msg: ChatMsg }> = ({ msg }) => (
  <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
    <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[7px] font-black mt-1"
      style={{
        background: msg.role === 'auron' ? '#00ffff' : 'rgba(255,255,255,0.1)',
        color: msg.role === 'auron' ? '#000' : '#fff',
      }}>
      {msg.role === 'auron' ? 'AI' : 'TÚ'}
    </div>
    <div className="max-w-[85%] space-y-1">
      <div className="px-5 py-4 rounded-2xl text-[11px] font-medium leading-relaxed"
        style={{
          background: msg.role === 'auron' ? 'rgba(0,255,255,0.06)' : 'rgba(255,255,255,0.04)',
          border: msg.role === 'auron' ? '1px solid rgba(0,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
          color: msg.role === 'auron' ? '#a0f0f0' : '#cbd5e1',
        }}>
        {msg.role === 'auron' && (
          <span className="text-[8px] font-black text-[#00ffff] tracking-widest block mb-2">AURON_CMD:</span>
        )}
        {msg.text}
      </div>
      <p className="text-[8px] text-slate-700 px-2">{msg.ts}</p>
    </div>
  </div>
);

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
const LoginScreen: React.FC<{ onLogin: (e: React.FormEvent) => void; email: string; setEmail: (v: string) => void }> = ({ onLogin, email, setEmail }) => (
  <div className="min-h-screen bg-[#02040a] flex items-center justify-center relative overflow-hidden">
    <CyberGrid />
    <Scanline />
    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
      <Brain size={600} className="text-[#00ffff]" />
    </div>
    <div className="relative z-10 w-full max-w-md px-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
          style={{ background: '#00ffff', boxShadow: '0 0 60px #00ffff60' }}>
          <ShieldCheck size={36} className="text-black" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white italic mb-2">
          Simplifica<span style={{ color: '#00ffff' }}>ME</span>
        </h1>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">
          AFSE NeuroCode Ultra · Sistema Estratégico
        </p>
      </div>
      <div className="bg-black/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
        style={{ boxShadow: '0 0 80px rgba(0,255,255,0.05)' }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 text-center">
          Acceso via Magic Link
        </p>
        <form onSubmit={onLogin} className="space-y-4">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="director@empresa.com"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[12px] text-white outline-none focus:border-[#00ffff]/50 transition-colors placeholder:text-slate-700 font-mono"
          />
          <button type="submit"
            className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: '#00ffff', boxShadow: '0 0 30px #00ffff40' }}>
            Solicitar Acceso
          </button>
        </form>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#28a745] animate-pulse" />
          <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
            Sistema Operacional · Cifrado E2E
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const App = () => {
  const [sessionUser, setSessionUser]           = useState<User | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [loginEmail, setLoginEmail]             = useState("");
  const [company, setCompany]                   = useState<Company | null>(null);
  const [cycle, setCycle]                       = useState<AfseCycle | null>(null);
  const [activePhase, setActivePhase]           = useState(1);
  const [maxPhaseReached, setMaxPhaseReached]   = useState(1);
  const [userData, setUserData]                 = useState<Record<string, string>>({});
  const [messages, setMessages]                 = useState<ChatMsg[]>([]);
  const [input, setInput]                       = useState("");
  const [auronLoading, setAuronLoading]         = useState(false);
  const [activeView, setActiveView]             = useState<'workspace' | 'dashboard'>('workspace');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const chatEndRef                              = useRef<HTMLDivElement>(null);

  const currentLayer  = useMemo(() => getLayerById(activePhase), [activePhase]);
  const layers        = useMemo(() => getAllLayers(), []);
  const afseScore     = company?.afse_score ?? 0;
  const afseStatus    = getAfseStatus(afseScore);

  // Sparkline data mock (replace with real data from Supabase)
  const sparkData = useMemo(() => layers.map((l, i) => ({
    name: l.code,
    value: l.id <= maxPhaseReached ? Math.min(100, 40 + i * 12) : 0,
  })), [layers, maxPhaseReached]);

  const radialData = [{ name: 'AFSE', value: afseScore, fill: afseStatus.color }];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSessionUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionUser) return;
    (async () => {
      const userCompany = await getUserCompany(sessionUser.id);
      if (!userCompany) return;
      setCompany(userCompany);
      const activeCycle = await getActiveCycle(userCompany.id);
      if (!activeCycle) return;
      setCycle(activeCycle);
      const { activePhase: ap, maxPhase: mp } = await getActivePhase(userCompany.id, activeCycle.id);
      setActivePhase(ap);
      setMaxPhaseReached(mp);
      // Mensaje de bienvenida AURON
      setMessages([{
        role: 'auron',
        text: `Sincronización completa. Empresa: ${userCompany.name}. Ciclo AFSE activo. Capa ${String(ap).padStart(2,'0')} en curso. Score actual: ${userCompany.afse_score?.toFixed(0) ?? '0'}/100. Listo para operar, Director.`,
        ts: new Date().toLocaleTimeString('es-CO'),
      }]);
    })();
  }, [sessionUser]);

  const persistProgress = useCallback(async (phase: number) => {
    if (!sessionUser || !company || !cycle || !currentLayer) return;
    await saveLayerProgress(sessionUser.id, company.id, cycle.id, phase, currentLayer.code, { fields: userData }, 0);
  }, [sessionUser, company, cycle, currentLayer, userData]);

  useEffect(() => {
    if (!sessionUser || !company || !cycle || Object.keys(userData).length === 0) return;
    const t = setTimeout(() => persistProgress(activePhase), 1500);
    return () => clearTimeout(t);
  }, [userData]);

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionUser || !currentLayer) return;
    const userText = input.trim();
    const ts = new Date().toLocaleTimeString('es-CO');
    setMessages(prev => [...prev, { role: 'user', text: userText, ts }]);
    setInput("");
    setAuronLoading(true);
    if (company && cycle) await saveAuronMessage(company.id, cycle.id, sessionUser.id, activePhase, 'user', userText);
    try {
      const isTryingToAdvance = /siguiente|avanzar|cerrar capa/i.test(userText);
      if (isTryingToAdvance) {
        const isValid = validateLayer(currentLayer, userData);
        if (!isValid) {
          const text = `Director, no puedo validar la Capa ${String(activePhase).padStart(2,'0')}. Outputs críticos pendientes: ${currentLayer.outputs.join(', ').toUpperCase()}.`;
          setMessages(prev => [...prev, { role: 'auron', text, ts: new Date().toLocaleTimeString('es-CO') }]);
          if (company && cycle) await saveAuronMessage(company.id, cycle.id, sessionUser.id, activePhase, 'auron', text);
          return;
        }
        const nextPhase = activePhase + 1;
        setActivePhase(nextPhase);
        if (nextPhase > maxPhaseReached) {
          setMaxPhaseReached(nextPhase);
          if (company && cycle) await saveLayerProgress(sessionUser.id, company.id, cycle.id, activePhase, currentLayer.code, { fields: userData, completedAt: new Date().toISOString() }, 100);
        }
        const text = `Gobernanza validada. Capa ${String(activePhase).padStart(2,'0')} cerrada con éxito. Desbloqueando Fase ${String(nextPhase).padStart(2,'0')}...`;
        setMessages(prev => [...prev, { role: 'auron', text, ts: new Date().toLocaleTimeString('es-CO') }]);
        if (company && cycle) await saveAuronMessage(company.id, cycle.id, sessionUser.id, activePhase, 'auron', text);
        return;
      }
      const systemPrompt = company && cycle
        ? await buildEnrichedAuronContext(company.id, company.name, activePhase, currentLayer.code, currentLayer.objective, cycle.id)
        : buildChatContext(currentLayer, 'DIRECTOR', sessionUser.email ?? 'Director', 'USTED');
      const response = await getAuronResponse(userText, systemPrompt);
      const auronTs = new Date().toLocaleTimeString('es-CO');
      setMessages(prev => [...prev, { role: 'auron', text: response, ts: auronTs }]);
      if (company && cycle) await saveAuronMessage(company.id, cycle.id, sessionUser.id, activePhase, 'auron', response);
    } catch {
      setMessages(prev => [...prev, { role: 'auron', text: 'Error de enlace con AURON. Reintentando...', ts: new Date().toLocaleTimeString('es-CO') }]);
    } finally {
      setAuronLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    await supabase.auth.signInWithOtp({ email: loginEmail });
    alert(`Magic link enviado a ${loginEmail}`);
  };

  if (loading) return (
    <div className="h-screen bg-[#02040a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: '#00ffff', boxShadow: '0 0 40px #00ffff' }}>
            <Activity size={28} className="text-black animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#00ffff]">
            Iniciando AFSE OS
          </p>
          <div className="flex gap-1 justify-center mt-3">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00ffff] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!sessionUser) return <LoginScreen onLogin={handleLogin} email={loginEmail} setEmail={setLoginEmail} />;

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-300 overflow-hidden flex flex-col"
      style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      <CyberGrid />
      <Scanline />

      {/* ── TOPBAR ──────────────────────────────────────────────────────────── */}
      <header className="relative z-50 h-16 border-b border-white/5 px-6 flex items-center justify-between"
        style={{ background: 'rgba(2,4,10,0.95)', backdropFilter: 'blur(20px)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarCollapsed(p => !p)}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Network size={14} className="text-slate-400" />
          </button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#00ffff', boxShadow: '0 0 20px #00ffff60' }}>
            <ShieldCheck size={16} className="text-black" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white italic">
              Simplifica<span style={{ color: '#00ffff' }}>ME</span>
            </h1>
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-600 -mt-0.5">
              {company?.name ?? 'AFSE NeuroCode Ultra'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { id: 'workspace', label: 'Workspace', icon: <Target size={12} /> },
            { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={12} /> },
          ].map(v => (
            <button key={v.id}
              onClick={() => setActiveView(v.id as 'workspace' | 'dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              style={{
                background: activeView === v.id ? 'rgba(0,255,255,0.1)' : 'transparent',
                color: activeView === v.id ? '#00ffff' : 'rgba(255,255,255,0.3)',
                border: activeView === v.id ? '1px solid rgba(0,255,255,0.2)' : '1px solid transparent',
              }}>
              {v.icon}{v.label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* AFSE Score pill */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border"
            style={{ background: `${afseStatus.color}10`, borderColor: `${afseStatus.color}30` }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: afseStatus.color }} />
            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: afseStatus.color }}>
              AFSE {afseScore.toFixed(0)}/100
            </span>
            <span className="text-[8px] font-black" style={{ color: afseStatus.color }}>
              {afseStatus.label}
            </span>
          </div>

          {/* User */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
            <div className="w-5 h-5 rounded-lg bg-[#00ffff] flex items-center justify-center text-[7px] font-black text-black">
              {sessionUser.email?.[0]?.toUpperCase() ?? 'D'}
            </div>
            <span className="text-[9px] font-bold text-slate-400 hidden md:block max-w-[120px] truncate">
              {sessionUser.email}
            </span>
            <button onClick={() => supabase.auth.signOut()}
              className="hover:text-[#ff0055] transition-colors text-slate-600 ml-1">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN BODY ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside className="flex-shrink-0 border-r border-white/5 flex flex-col overflow-hidden transition-all duration-300"
          style={{
            width: sidebarCollapsed ? '0px' : '200px',
            background: 'rgba(2,4,10,0.8)',
          }}>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 w-[200px]">
            {/* Score radial mini */}
            <div className="p-4 rounded-2xl mb-4"
              style={{ background: `${afseStatus.color}08`, border: `1px solid ${afseStatus.color}20` }}>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="80%"
                    data={radialData} startAngle={90} endAngle={90 - (360 * afseScore / 100)}>
                    <RadialBar dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-[8px] font-black uppercase tracking-[0.3em]"
                style={{ color: afseStatus.color }}>
                Score {afseScore.toFixed(0)}/100
              </p>
            </div>

            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-700 px-2 pb-1">
              Capas AFSE
            </p>
            {layers.map(l => (
              <LayerPill
                key={l.id} id={l.id} code={l.code}
                isLocked={l.id > maxPhaseReached}
                isCurrent={l.id === activePhase}
                isCompleted={l.id < maxPhaseReached}
                onClick={() => { setActivePhase(l.id); setActiveView('workspace'); }}
              />
            ))}
          </div>

          {/* System status */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#28a745] animate-pulse" />
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-600">
                System Operational
              </span>
            </div>
          </div>
        </aside>

        {/* ── WORKSPACE VIEW ──────────────────────────────────────────────── */}
        {activeView === 'workspace' && (
          <div className="flex-1 flex overflow-hidden">

            {/* Matrix workspace */}
            <section className="flex-1 overflow-y-auto p-8">
              {currentLayer ? (
                <div className="max-w-3xl mx-auto">
                  {/* Layer header */}
                  <div className="mb-10">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-black text-black"
                        style={{
                          background: LAYER_COLORS[activePhase - 1],
                          boxShadow: `0 0 20px ${LAYER_COLORS[activePhase - 1]}60`,
                        }}>
                        {String(activePhase).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600">
                          Capa Activa
                        </p>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight"
                          style={{ color: LAYER_COLORS[activePhase - 1] }}>
                          {currentLayer.name}
                        </h2>
                      </div>
                    </div>
                    <p className="text-slate-500 text-[12px] leading-relaxed pl-14">
                      {currentLayer.objective}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-6 pl-14">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-700 mb-2">
                        <span>Progreso de capa</span>
                        <span style={{ color: LAYER_COLORS[activePhase - 1] }}>
                          {activePhase}/{layers.length}
                        </span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(activePhase / layers.length) * 100}%`,
                            background: `linear-gradient(90deg, ${LAYER_COLORS[0]}, ${LAYER_COLORS[activePhase - 1]})`,
                            boxShadow: `0 0 10px ${LAYER_COLORS[activePhase - 1]}`,
                          }} />
                      </div>
                    </div>
                  </div>

                  {/* Matrix inputs */}
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-[1px] flex-1 bg-white/5" />
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-700">
                          Matriz de Inputs
                        </span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                      </div>
                      <MatrixRenderer
                        fields={currentLayer.mainMatrix.fields}
                        values={userData}
                        onChange={(field, value) => setUserData(prev => ({ ...prev, [field]: value }))}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-700 font-black uppercase tracking-widest text-[10px]">
                    Selecciona una capa para comenzar
                  </p>
                </div>
              )}
            </section>

            {/* AURON Panel */}
            <aside className="w-[340px] flex-shrink-0 border-l border-white/5 flex flex-col"
              style={{ background: 'rgba(2,4,10,0.9)' }}>

              {/* AURON Header */}
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: '#00ffff', boxShadow: '0 0 20px #00ffff60' }}>
                      <Brain size={18} className="text-black" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white uppercase tracking-widest">AURON</p>
                      <p className="text-[7px] font-bold text-[#00ffff] tracking-widest">IA ESTRATÉGICA · LIVE</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#28a745]/10 border border-[#28a745]/20 px-3 py-1.5 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#28a745] animate-pulse" />
                    <span className="text-[7px] font-black text-[#28a745] uppercase tracking-widest">Online</span>
                  </div>
                </div>
                {/* Context indicator */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
                  <Eye size={10} className="text-[#00ffff]" />
                  <span className="text-[8px] text-slate-600 font-mono">
                    Contexto: Capa {String(activePhase).padStart(2,'0')} — {currentLayer?.code ?? '...'}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {messages.map((m, i) => <AuronMsg key={i} msg={m} />)}
                {auronLoading && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#00ffff] flex items-center justify-center text-[7px] font-black text-black mt-1">AI</div>
                    <div className="px-5 py-4 rounded-2xl bg-[#00ffff]/06 border border-[#00ffff]/15 flex items-center gap-2">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00ffff] animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/5">
                <form onSubmit={handleConsultation}
                  className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Consulta al copiloto..."
                    disabled={auronLoading}
                    className="flex-1 bg-transparent text-[10px] text-white outline-none placeholder:text-slate-800 font-mono disabled:opacity-50"
                  />
                  <button type="submit" disabled={auronLoading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                    style={{ background: '#00ffff', boxShadow: '0 0 15px #00ffff60' }}>
                    <ChevronRight size={16} className="text-black" />
                  </button>
                </form>
                <p className="text-[7px] text-slate-800 font-mono text-center mt-2 uppercase tracking-widest">
                  Di "avanzar" para validar y cerrar la capa
                </p>
              </div>
            </aside>
          </div>
        )}

        {/* ── DASHBOARD VIEW ──────────────────────────────────────────────── */}
        {activeView === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto space-y-8">

              {/* Title */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600 mb-2">
                    Auditoría Predictiva
                  </p>
                  <h2 className="text-4xl font-black text-white tracking-tighter italic">
                    Master <span style={{ color: '#00ffff' }}>Dashboard</span>
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                    {company?.name ?? 'Sin empresa'}
                  </p>
                  <p className="text-[8px] font-mono text-slate-700 mt-1">
                    AFSE NeuroCode Engine v4.2
                  </p>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Score AFSE" value={`${afseScore.toFixed(0)}/100`}
                  sub={`↑ Estado: ${afseStatus.label}`} color={afseStatus.color}
                  icon={<TrendingUp size={14} />} />
                <MetricCard label="Fase Activa" value={`L${String(activePhase).padStart(2,'0')}`}
                  sub={currentLayer?.code ?? '...'} color={LAYER_COLORS[activePhase - 1]}
                  icon={<Target size={14} />} />
                <MetricCard label="Capas Completadas" value={`${maxPhaseReached - 1}/8`}
                  sub={`${Math.round(((maxPhaseReached - 1) / 8) * 100)}% del ciclo`}
                  color="#28a745" icon={<Activity size={14} />} />
                <MetricCard label="Empresa" value={company ? '✓' : '—'}
                  sub={company?.name ?? 'No asignada'} color="#9900ff"
                  icon={<Cpu size={14} />} />
              </div>

              {/* Area chart + status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-black/60 border border-white/5 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#00ffff] mb-1">
                        Progreso por Capa
                      </p>
                      <p className="text-[8px] text-slate-600 font-mono">AFSE Cycle Performance</p>
                    </div>
                    <RefreshCw size={14} className="text-slate-700" />
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData}>
                        <defs>
                          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00ffff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 8, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ background: '#02040a', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 12, fontSize: 10 }}
                          labelStyle={{ color: '#00ffff' }}
                          itemStyle={{ color: '#a0f0f0' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#00ffff" fill="url(#grad1)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Alertas */}
                <div className="bg-black/60 border border-white/5 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <AlertCircle size={14} className="text-[#ef4444]" />
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">
                      Alertas Activas
                    </p>
                  </div>
                  <div className="space-y-3">
                    {afseScore < 90 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-[#ef4444]/05 border border-[#ef4444]/15">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] mt-1.5 flex-shrink-0" />
                        <p className="text-[9px] text-slate-400 leading-relaxed">
                          Score AFSE por debajo del umbral óptimo (90)
                        </p>
                      </div>
                    )}
                    {maxPhaseReached < 4 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-[#eab308]/05 border border-[#eab308]/15">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#eab308] mt-1.5 flex-shrink-0" />
                        <p className="text-[9px] text-slate-400 leading-relaxed">
                          Ciclo AFSE en fase inicial — avanzar a BSC
                        </p>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#28a745]/05 border border-[#28a745]/15">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#28a745] mt-1.5 flex-shrink-0" />
                      <p className="text-[9px] text-slate-400 leading-relaxed">
                        Sistema operacional — AURON en línea
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layer grid */}
              <div className="bg-black/60 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 size={14} className="text-[#00ffff]" />
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white">
                    Flujo de Capas Estratégicas
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {layers.map(l => {
                    const isCompleted = l.id < maxPhaseReached;
                    const isCurrent   = l.id === activePhase;
                    const isLocked    = l.id > maxPhaseReached;
                    const color       = LAYER_COLORS[l.id - 1];
                    return (
                      <button key={l.id}
                        onClick={() => { if (!isLocked) { setActivePhase(l.id); setActiveView('workspace'); }}}
                        className="p-4 rounded-2xl border text-center transition-all hover:scale-105"
                        style={{
                          background: isCurrent ? `${color}12` : isCompleted ? 'rgba(40,167,69,0.05)' : 'rgba(0,0,0,0.4)',
                          borderColor: isCurrent ? color : isCompleted ? '#28a74530' : 'rgba(255,255,255,0.05)',
                          boxShadow: isCurrent ? `0 0 20px ${color}20` : 'none',
                          opacity: isLocked ? 0.3 : 1,
                        }}>
                        <p className="text-[9px] font-black mb-1" style={{ color: isCurrent ? color : isCompleted ? '#28a745' : '#374151' }}>
                          {String(l.id).padStart(2,'0')}
                        </p>
                        <p className="text-[7px] font-black uppercase tracking-wider" style={{ color: isCurrent ? color : '#4b5563' }}>
                          {l.code}
                        </p>
                        <div className="mt-2 h-1 rounded-full mx-auto w-8"
                          style={{
                            background: isCompleted ? '#28a745' : isCurrent ? color : '#1f2937',
                            boxShadow: isCurrent ? `0 0 8px ${color}` : isCompleted ? '0 0 8px #28a745' : 'none',
                          }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AURON Terminal */}
              <div className="bg-[#02040a] border border-white/5 rounded-3xl p-6 font-mono">
                <div className="flex items-center gap-3 mb-5">
                  <Terminal size={14} className="text-[#00ffff]" />
                  <span className="text-[9px] text-[#00ffff]/60 uppercase tracking-widest">AURON Terminal Feed</span>
                  <div className="flex-1" />
                  <div className="flex gap-1.5">
                    {['#ef4444','#eab308','#28a745'].map(c => (
                      <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <div className="h-36 overflow-y-auto space-y-3 pr-2">
                  {messages.slice(-6).map((m, i) => (
                    <div key={i} className="flex gap-3 border-l-2 border-white/5 pl-3 py-0.5">
                      <span className="text-[#00ffff]/40 text-[8px] whitespace-nowrap">[{m.ts}]</span>
                      <p className="text-[9px] leading-relaxed text-slate-500">
                        <span className="font-bold mr-2" style={{ color: m.role === 'auron' ? '#00ffff' : '#fff' }}>
                          {m.role === 'auron' ? 'AURON_CMD:' : 'USER_CMD:'}
                        </span>
                        {m.text.slice(0, 120)}{m.text.length > 120 ? '...' : ''}
                      </p>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-[9px] text-slate-800 animate-pulse">_ ESPERANDO TRANSMISIÓN...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER STATUS BAR ───────────────────────────────────────────────── */}
      <footer className="relative z-50 h-7 border-t border-white/5 px-6 flex items-center justify-between"
        style={{ background: 'rgba(2,4,10,0.95)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#28a745] animate-pulse" />
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-700">System: Operational</span>
          </div>
          <span className="text-slate-800 text-[7px]">·</span>
          <span className="text-[7px] font-mono text-slate-700 uppercase">Gemini Flash</span>
          <span className="text-slate-800 text-[7px]">·</span>
          <span className="text-[7px] font-mono text-slate-700 uppercase">Supabase RLS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[7px] font-mono text-slate-700 uppercase tracking-widest">
            AFSE v1 · {new Date().toLocaleDateString('es-CO')}
          </span>
          <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: afseStatus.color }}>
            ● {afseStatus.label}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
