/**
 * ARQUITECTURA ME — Neuro Code Style
 * App.tsx v10.0 — i18n ES/EN · Ruta B Plan Maestro v6
 * ARCHITECT: Luis Reinaldo Ruiz Sarmiento
 * COMPANY: calidadysostenibilidad.com SAS
 * CAMBIO v10.0: i18n completo con useTranslation() · LanguageSwitcher · applyPreferredLang
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { supabase } from "../services/api/supabase";
import { getAuronResponse } from "../services/api/geminiService";
import { buildChatContext } from "../core/chat/chat.context";
import { applyPreferredLang } from "../i18n";
import LanguageSwitcher from "../i18n/LanguageSwitcher";
import {
  Lock, Activity, LogOut, ShieldCheck,
  BarChart3, Cpu, TrendingUp, AlertCircle, Terminal,
  RefreshCw, Network, Eye, Target, Brain,
  Layers, GraduationCap, ClipboardCheck, MessageSquare,
  ArrowRight, Star, Settings, Mic, MicOff, Send
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";
import { MatrixRenderer } from "../ui/layers/MatrixRenderer";
import { MEModule } from "../ui/hub/hub.types";
import { ModuleSimplificaME } from "../ui/hub/ModuleSimplificaME";
import { ModuleGestionaME } from "../ui/hub/ModuleGestionaME";
import { ModuleCapacitaME } from "../ui/hub/ModuleCapacitaME";
import { ModuleEvaluaME } from "../ui/hub/ModuleEvaluaME";
import { ModuleConsultaME } from "../ui/hub/ModuleConsultaME";
import { getLayerById, getAllLayers } from "../core/methodology/methodology.engine";
import { validateLayer } from "../core/methodology/layer.validator";
import {
  getUserCompany, getActiveCycle, saveLayerProgress,
  getActivePhase, type Company, type AfseCycle,
} from "../services/company";
import { buildEnrichedAuronContext, saveAuronMessage } from "../services/auronMemory";
import SuperAdminPanel from "./SuperAdminPanel";
import SignupScreen from "./SignupScreen";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type MsgRole = 'user' | 'auron';
interface ChatMsg { role: MsgRole; text: string; ts: string; }
type ActiveView = 'hub' | 'workspace' | 'dashboard' | 'admin';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:      '#06090F',
  bg2:     '#0A0E18',
  bg3:     '#0F1420',
  border:  'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.12)',
  cyan:    '#00E5FF',
  green:   '#00E676',
  amber:   '#FFB300',
  red:     '#FF3D57',
  purple:  '#7C4DFF',
  text:    '#F1F5F9',
  textMid: '#94A3B8',
  textDim: '#475569',
};

const LAYER_COLORS = [
  '#00E5FF','#00D4F5','#00BFEB','#00A3E0',
  '#0085D6','#2D63CC','#5540C2','#7C1DB8'
];

function getAfseStatus(score: number, t: (k: string) => string) {
  if (score >= 90) return { color: '#00E676', label: t('afse:score.status.optimo')   };
  if (score >= 70) return { color: '#00E5FF', label: t('afse:score.status.estable')  };
  if (score >= 50) return { color: '#FFB300', label: t('afse:score.status.enRiesgo') };
  return               { color: '#FF3D57', label: t('afse:score.status.critico')  };
}

// ─── ME_MODULES — usa i18n (se construye dentro del componente) ───────────────
function useMEModules(t: (k: string) => string) {
  return useMemo(() => [
    { id: 'simplifica', nameKey: 'afse:modules.simplifica.name', taglineKey: 'afse:modules.simplifica.tagline', descKey: 'afse:modules.simplifica.desc', icon: <Layers size={28} />,        color: '#00E5FF', active: true,  plan: t('platform:plans.starter')    },
    { id: 'gestiona',   nameKey: 'afse:modules.gestiona.name',   taglineKey: 'afse:modules.gestiona.tagline',   descKey: 'afse:modules.gestiona.desc',   icon: <ClipboardCheck size={28} />, color: '#00E676', active: false, plan: t('platform:plans.operativo')  },
    { id: 'capacita',   nameKey: 'afse:modules.capacita.name',   taglineKey: 'afse:modules.capacita.tagline',   descKey: 'afse:modules.capacita.desc',   icon: <GraduationCap size={28} />,  color: '#FFB300', active: false, plan: t('platform:plans.formacion')  },
    { id: 'evalua',     nameKey: 'afse:modules.evalua.name',     taglineKey: 'afse:modules.evalua.tagline',     descKey: 'afse:modules.evalua.desc',     icon: <Star size={28} />,           color: '#7C4DFF', active: false, plan: t('platform:plans.formacion')  },
    { id: 'consulta',   nameKey: 'afse:modules.consulta.name',   taglineKey: 'afse:modules.consulta.tagline',   descKey: 'afse:modules.consulta.desc',   icon: <MessageSquare size={28} />,  color: '#FF6B35', active: false, plan: t('platform:plans.enterprise') },
  ], [t]);
}

// ─── BACKGROUND ───────────────────────────────────────────────────────────────
const BackgroundMesh = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.08]"
      style={{ background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)' }} />
    <div className="absolute -bottom-60 -right-60 w-[800px] h-[800px] rounded-full opacity-[0.05]"
      style={{ background: 'radial-gradient(circle, #7C4DFF 0%, transparent 70%)' }} />
    <div className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `linear-gradient(rgba(0,229,255,1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />
  </div>
);

// ─── CYS LOGO (sin cambios — sin texto, no necesita i18n) ────────────────────
const CYSLogo = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const handleClick = () => {
    const el = svgRef.current; if (!el) return;
    el.style.transform = 'scale(1.15)'; el.style.transition = 'transform 0.15s';
    setTimeout(() => { el.style.transform = 'scale(1)'; el.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)'; }, 150);
  };
  return (
    <>
      <style>{`
        .cys-circle { transition: all 0.4s; }
        .cys-logo-wrap:hover .circle-top { filter: url(#neonO) drop-shadow(0 0 12px rgba(249,115,22,0.9)); }
        .cys-logo-wrap:hover .circle-bl  { filter: url(#neonG) drop-shadow(0 0 12px rgba(16,185,129,0.9)); }
        .cys-logo-wrap:hover .circle-br  { filter: url(#neonB) drop-shadow(0 0 12px rgba(59,130,246,0.9)); }
        .cys-logo-wrap:hover { transform: scale(1.06); }
        .orbit-ring-anim { animation: orbitSpin 18s linear infinite; transform-origin: 70px 74px; }
        @keyframes orbitSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .orbit-dot-anim { animation: orbitDotMove 6s linear infinite; }
        @keyframes orbitDotMove {
          0%{transform:translate(70px,8px)} 25%{transform:translate(136px,74px)}
          50%{transform:translate(70px,140px)} 75%{transform:translate(4px,74px)} 100%{transform:translate(70px,8px)}
        }
        .antenna-dot-anim { animation: antennaBlink 2s ease-in-out infinite; }
        @keyframes antennaBlink { 0%,100%{opacity:.8} 50%{opacity:1;filter:drop-shadow(0 0 5px #00E5FF)} }
        .icon-top-anim { animation: iconPulse 3s ease-in-out infinite; }
        .icon-bl-anim  { animation: iconPulse 3s ease-in-out 1s infinite; }
        .icon-br-anim  { animation: iconPulse 3s ease-in-out 2s infinite; }
        @keyframes iconPulse { 0%,100%{opacity:1} 50%{opacity:.65} }
      `}</style>
      <div className="cys-logo-wrap relative cursor-pointer transition-transform duration-300" onClick={handleClick}>
        <svg ref={svgRef} viewBox="-20 -20 180 188" width="108" height="108">
          <defs>
            <filter id="glowO" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="glowG" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="glowB" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="glowW" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="neonO" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="blur"/><feFlood floodColor="#F97316" floodOpacity="0.7" result="color"/><feComposite in="color" in2="blur" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="neonG" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="blur"/><feFlood floodColor="#10B981" floodOpacity="0.7" result="color"/><feComposite in="color" in2="blur" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="neonB" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="blur"/><feFlood floodColor="#3B82F6" floodOpacity="0.7" result="color"/><feComposite in="color" in2="blur" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <circle cx="70" cy="74" r="66" fill="none" stroke="rgba(0,229,255,0.08)" strokeWidth="0.8" strokeDasharray="5 4" className="orbit-ring-anim"/>
          <circle className="cys-circle circle-top" cx="70" cy="36" r="46" fill="rgba(249,115,22,0.09)" stroke="#F97316" strokeWidth="1.8" filter="url(#neonO)"/>
          <g className="icon-top-anim" filter="url(#glowO)" transform="translate(70,30)">
            <circle cx="-9" cy="-10" r="5.5" fill="none" stroke="#F97316" strokeWidth="1.6"/>
            <path d="M-17,2 C-17,-5 -1,-5 -1,2" fill="rgba(249,115,22,0.14)" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="9" cy="-10" r="5.5" fill="none" stroke="#F97316" strokeWidth="1.6"/>
            <path d="M1,2 C1,-5 17,-5 17,2" fill="rgba(249,115,22,0.14)" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/>
          </g>
          <circle className="cys-circle circle-bl" cx="40" cy="88" r="46" fill="rgba(16,185,129,0.09)" stroke="#10B981" strokeWidth="1.8" filter="url(#neonG)"/>
          <g className="icon-bl-anim" filter="url(#glowG)" transform="translate(31,90)">
            <rect x="-2" y="8" width="4" height="12" rx="1.5" fill="#10B981" opacity="0.9"/>
            <polygon points="0,-14 -10,2 10,2" fill="rgba(16,185,129,0.16)" stroke="#10B981" strokeWidth="1.3"/>
            <polygon points="0,-7 -10,8 10,8"  fill="rgba(16,185,129,0.22)" stroke="#10B981" strokeWidth="1.3"/>
            <polygon points="0,0 -10,14 10,14" fill="rgba(16,185,129,0.30)" stroke="#10B981" strokeWidth="1.3"/>
          </g>
          <circle className="cys-circle circle-br" cx="100" cy="88" r="46" fill="rgba(59,130,246,0.09)" stroke="#3B82F6" strokeWidth="1.8" filter="url(#neonB)"/>
          <g className="icon-br-anim" filter="url(#glowB)" transform="translate(109,90)">
            <circle cx="0" cy="0" r="15" fill="rgba(59,130,246,0.12)" stroke="#3B82F6" strokeWidth="1.6"/>
            <text x="0" y="6" textAnchor="middle" fontFamily="Georgia,serif" fontSize="20" fontWeight="bold" fill="#3B82F6" opacity={0.95}>$</text>
          </g>
          <g filter="url(#glowW)" transform="translate(70,72)">
            <circle cx="0" cy="0" r="20" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5"/>
            <rect x="-9" y="-10" width="18" height="22" rx="0.5" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2"/>
            <rect x="-11" y="-13" width="22" height="5" rx="0.5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2"/>
            <line x1="0" y1="-13" x2="0" y2="-18" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="0" cy="-19" r="2" fill="#00E5FF" className="antenna-dot-anim"/>
            <rect x="-8"  y="-8" width="5.5" height="4" rx="0.4" fill="rgba(0,229,255,0.42)"/>
            <rect x="2.5" y="-8" width="5.5" height="4" rx="0.4" fill="rgba(0,229,255,0.42)"/>
            <rect x="-8"  y="-2" width="5.5" height="4" rx="0.4" fill="rgba(0,229,255,0.26)"/>
            <rect x="2.5" y="-2" width="5.5" height="4" rx="0.4" fill="rgba(0,229,255,0.26)"/>
            <rect x="-3.5" y="4" width="7" height="8" rx="0.8" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.40)" strokeWidth="0.8"/>
          </g>
          <circle className="orbit-dot-anim" cx="0" cy="0" r="3" fill="#00E5FF" opacity="0.9"/>
        </svg>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center"
          style={{ background: T.bg3, border: `2px solid ${T.border2}` }}>
          <div className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse" />
        </div>
      </div>
    </>
  );
};

// ─── LAYER PILL ───────────────────────────────────────────────────────────────
const LayerPill: React.FC<{
  id: number; code: string; name: string;
  isLocked: boolean; isCurrent: boolean; isCompleted: boolean;
  onClick: () => void;
}> = ({ id, code, name, isLocked, isCurrent, isCompleted, onClick }) => {
  const color = LAYER_COLORS[id - 1] ?? T.cyan;
  return (
    <button disabled={isLocked} onClick={onClick}
      className="w-full px-3 py-3 rounded-xl text-left transition-all duration-200 relative"
      style={{
        background: isCurrent ? `${color}12` : 'transparent',
        border: `1px solid ${isCurrent ? color + '40' : 'transparent'}`,
        opacity: isLocked ? 0.25 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
      }}>
      {isCurrent && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full" style={{ background: color }} />}
      <div className="flex items-center gap-3 pl-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
          style={{
            background: isCurrent ? color : isCompleted ? `${color}20` : 'rgba(255,255,255,0.05)',
            color: isCurrent ? '#000' : isCompleted ? color : T.textDim,
            fontSize: '11px',
          }}>
          {isLocked ? <Lock size={10} /> : isCompleted && !isCurrent ? '✓' : String(id).padStart(2,'0')}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: isCurrent ? color : isCompleted ? T.textMid : T.textDim }}>{code}</p>
          <p className="text-xs truncate mt-0.5" style={{ color: T.textDim, fontSize: '10px' }}>{name}</p>
        </div>
      </div>
    </button>
  );
};

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  label: string; value: string; sub?: string; color?: string; icon?: React.ReactNode;
}> = ({ label, value, sub, color = T.cyan, icon }) => (
  <div className="relative rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
    style={{ background: T.bg2, border: `1px solid ${T.border}` }}>
    <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-[0.07]" style={{ background: color }} />
    <div className="flex items-start justify-between mb-4">
      <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: T.textMid }}>{label}</p>
      {icon && <div style={{ color }} className="opacity-70">{icon}</div>}
    </div>
    <p className="text-4xl font-black tracking-tight" style={{ color: T.text }}>{value}</p>
    {sub && <p className="text-sm font-semibold mt-2" style={{ color }}>{sub}</p>}
  </div>
);

// ─── AURON MSG ────────────────────────────────────────────────────────────────
const AuronMsg: React.FC<{ msg: ChatMsg }> = ({ msg }) => (
  <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
    <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black mt-0.5"
      style={{ background: msg.role === 'auron' ? T.cyan : 'rgba(255,255,255,0.10)', color: msg.role === 'auron' ? '#000' : T.text }}>
      {msg.role === 'auron' ? 'A' : 'U'}
    </div>
    <div className="max-w-[86%]">
      {msg.role === 'auron' && <p className="text-xs font-black uppercase tracking-widest mb-2 px-1" style={{ color: T.cyan }}>AURON</p>}
      <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={{
          background: msg.role === 'auron' ? 'rgba(0,229,255,0.06)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${msg.role === 'auron' ? 'rgba(0,229,255,0.15)' : T.border}`,
          color: msg.role === 'auron' ? '#A5D8E0' : T.textMid,
        }}>
        {msg.text}
      </div>
      <p className="text-xs mt-1 px-1" style={{ color: T.textDim }}>{msg.ts}</p>
    </div>
  </div>
);

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
type Theme = 'dark' | 'light';

const DARK_T = {
  bg:'#06090F', bg2:'#0A0E18', bg3:'#0F1420',
  bgCard:'rgba(10,14,24,0.97)',
  border:'rgba(255,255,255,0.06)', border2:'rgba(255,255,255,0.12)',
  cyan:'#00E5FF', cyanGlow:'rgba(0,229,255,0.20)', cyanRing:'rgba(0,229,255,0.10)',
  green:'#00E676', text:'#F1F5F9', textMid:'#94A3B8', textDim:'#475569',
  error:'#FF3D57', shadow:'0 40px 100px rgba(0,0,0,0.60)',
  mesh1:'rgba(0,229,255,0.07)', mesh2:'rgba(124,77,255,0.05)',
  grid:'rgba(0,229,255,0.02)', ring:'rgba(0,229,255,0.04)',
};
const LIGHT_T = {
  bg:'#F0F4FA', bg2:'#FFFFFF', bg3:'#E8EEF6',
  bgCard:'rgba(255,255,255,0.98)',
  border:'rgba(0,0,0,0.07)', border2:'rgba(0,0,0,0.14)',
  cyan:'#0088BB', cyanGlow:'rgba(0,136,187,0.15)', cyanRing:'rgba(0,136,187,0.10)',
  green:'#00875A', text:'#0F172A', textMid:'#475569', textDim:'#94A3B8',
  error:'#DC2626', shadow:'0 24px 80px rgba(0,0,0,0.12)',
  mesh1:'rgba(0,136,187,0.06)', mesh2:'rgba(124,77,255,0.04)',
  grid:'rgba(0,136,187,0.03)', ring:'rgba(0,136,187,0.03)',
};

const LoginScreen: React.FC<{ email: string; setEmail: (v: string) => void }> = ({ email, setEmail }) => {
  const { t, i18n } = useTranslation();
  const [sent, setSent]       = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [theme, setTheme]     = React.useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  const C = theme === 'dark' ? DARK_T : LIGHT_T;
  const currentLang = i18n.language.slice(0, 2);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) { setError(t('auth.errorEmail')); return; }
    setError(''); setLoading(true);
    try {
      const { error: supaErr } = await supabase.auth.signInWithOtp({ email });
      if (supaErr) throw supaErr;
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? t('auth.errorGeneric'));
    } finally { setLoading(false); }
  };

  const rings = [320, 500, 680, 860];

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', background:C.bg, transition:'background 0.4s' }}>

      {/* Mesh background */}
      <div style={{ pointerEvents:'none', position:'fixed', inset:0, zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-160, left:-160, width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, ' + C.mesh1 + ' 0%, transparent 70%)' }}/>
        <div style={{ position:'absolute', bottom:-240, right:-240, width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle, ' + C.mesh2 + ' 0%, transparent 70%)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(' + C.grid + ' 1px, transparent 1px), linear-gradient(90deg, ' + C.grid + ' 1px, transparent 1px)', backgroundSize:'80px 80px' }}/>
        <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)' }}>
          {rings.map((size, i) => (
            <div key={size} style={{ position:'absolute', borderRadius:'50%', width:size, height:size, top:-size/2, left:-size/2, border:'1px solid ' + C.ring, animation:'loginSpin ' + (22+i*8) + 's linear infinite ' + (i%2===0?'':'reverse') }}/>
          ))}
        </div>
      </div>

      {/* Top-right controls */}
      <div style={{ position:'fixed', top:20, right:20, zIndex:100, display:'flex', alignItems:'center', gap:8 }}>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(th => th === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          style={{ width:40, height:40, borderRadius:12, border:'1px solid ' + C.border2, background:C.bg2, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, transition:'all 0.2s' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {/* Lang switcher */}
        <div style={{ display:'flex', alignItems:'center', gap:2, padding:4, borderRadius:12, background:C.bg2, border:'1px solid ' + C.border2 }}>
          {(['es','en']).map(lang => {
            const isActive = currentLang === lang;
            return (
              <button key={lang} onClick={() => applyPreferredLang(lang)}
                style={{ padding:'5px 11px', borderRadius:9, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, transition:'all 0.15s', background:isActive ? C.cyan : 'transparent', color:isActive ? '#000' : C.textDim }}>
                {lang.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:400, padding:'0 24px', display:'flex', flexDirection:'column', alignItems:'center', animation:'loginFadeIn 0.6s ease both' }}>

        {/* Logo */}
        <div style={{ marginBottom:24 }}>
          <CYSLogo />
        </div>

        {/* Brand */}
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.4em', textTransform:'uppercase' as const, color:C.textMid, marginBottom:12, textAlign:'center' }}>
          {t('brand.company')}
        </p>
        <h1 style={{ fontFamily:"'Syne', sans-serif", fontSize:'clamp(40px,10vw,54px)', fontWeight:900, letterSpacing:'-0.02em', lineHeight:1, textAlign:'center', margin:'0 0 8px', color:C.text }}>
          Arquitectura
          <span style={{ color:C.cyan, filter:'drop-shadow(0 0 24px ' + C.cyanGlow + ')' }}>ME</span>
          <sup style={{ fontSize:20, fontWeight:700, color:C.textDim, verticalAlign:'super' }}>™</sup>
        </h1>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.35em', textTransform:'uppercase' as const, color:C.textDim, marginBottom:32 }}>
          {t('brand.tagline')}
        </p>

        {/* Card */}
        <div style={{ width:'100%', borderRadius:24, padding:32, background:C.bgCard, border:'1px solid ' + C.border2, boxShadow:C.shadow, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>

          {/* Card header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:24 }}>
            <div style={{ height:1, flex:1, background:C.border2 }}/>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase' as const, color:C.textMid, whiteSpace:'nowrap' }}>
              {t('auth.access')}
            </p>
            <div style={{ height:1, flex:1, background:C.border2 }}/>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit}>
              {/* Floating label input */}
              <div style={{ marginBottom:16, position:'relative' }}>
                <label style={{
                  position:'absolute', left:16,
                  top: focused || email ? 10 : '50%',
                  transform: focused || email ? 'translateY(0) scale(0.75)' : 'translateY(-50%) scale(1)',
                  transformOrigin:'left',
                  fontSize:14, fontWeight:600,
                  color: focused ? C.cyan : C.textDim,
                  transition:'all 0.2s', pointerEvents:'none', zIndex:1,
                }}>
                  {t('auth.placeholder')}
                </label>
                <input
                  type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  disabled={loading}
                  style={{
                    width:'100%', borderRadius:14,
                    padding: email || focused ? '24px 16px 10px' : '17px 16px',
                    fontSize:15, outline:'none', boxSizing:'border-box' as const,
                    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    border: '1.5px solid ' + (error ? C.error : focused ? C.cyan : C.border2),
                    color:C.text, caretColor:C.cyan, transition:'all 0.2s',
                    boxShadow: focused ? '0 0 0 4px ' + C.cyanRing : 'none',
                  }}
                />
                {error && (
                  <p style={{ fontSize:12, fontWeight:600, color:C.error, marginTop:6, paddingLeft:4 }}>
                    ⚠ {error}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ width:'100%', padding:'15px 24px', borderRadius:14, fontSize:13, fontWeight:900, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#000', background:C.cyan, border:'none', cursor:loading?'not-allowed':'pointer', boxShadow:'0 6px 28px ' + C.cyanGlow, transition:'all 0.2s', opacity:loading?0.7:1 }}>
                {loading ? t('auth.sending') : t('auth.submit')}
              </button>

              {/* Security */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:18 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:C.green, animation:'lgPulse 2s ease-in-out infinite' }}/>
                <span style={{ fontSize:12, fontWeight:600, color:C.textDim }}>{t('auth.security')}</span>
              </div>
            </form>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'8px 0', textAlign:'center', animation:'loginFadeIn 0.4s ease both' }}>
              <div style={{ width:60, height:60, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, background:'rgba(0,230,118,0.10)', border:'1px solid rgba(0,230,118,0.25)' }}>✉️</div>
              <p style={{ fontSize:16, fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:C.green }}>{t('auth.sentTitle')}</p>
              <p style={{ fontSize:14, lineHeight:1.7, color:C.textMid }}>
                {t('auth.sentBody')}<br/>
                <span style={{ fontWeight:700, color:C.cyan }}>{email}</span>
              </p>
              <p style={{ fontSize:12, color:C.textDim }}>{t('auth.sentExpiry')}</p>
              <button onClick={() => { setSent(false); setEmail(''); }}
                style={{ fontSize:12, fontWeight:600, color:C.textDim, background:'none', border:'none', cursor:'pointer' }}>
                {t('auth.backButton')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign:'center', fontSize:13, fontWeight:500, marginTop:24, lineHeight:1.8, color:C.textDim }}>
          {t('brand.slogan')}<br/>
          <span style={{ color:C.cyan, fontWeight:700 }}>{t('brand.sloganAccent')}</span>
        </p>
      </div>

      <style>{`
        @keyframes loginSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes loginFadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lgPulse     { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const App = () => {
  const { t, i18n } = useTranslation();
  const ME_MODULES = useMEModules(t);

  const [sessionUser, setSessionUser]         = useState<User | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [loginEmail, setLoginEmail]           = useState('');
  const [urlPlan]                             = useState(() => new URLSearchParams(window.location.search).get('plan'));
  const [showSignup, setShowSignup]           = useState(!!urlPlan);
  const [company, setCompany]                 = useState<Company | null>(null);
  const [cycle, setCycle]                     = useState<AfseCycle | null>(null);
  const [activePhase, setActivePhase]         = useState(1);
  const [maxPhaseReached, setMaxPhaseReached] = useState(1);
  const [userData, setUserData]               = useState<Record<string, string>>({});
  const [messages, setMessages]               = useState<ChatMsg[]>([]);
  const [input, setInput]                     = useState('');
  const [auronLoading, setAuronLoading]       = useState(false);
  const [activeView, setActiveView]           = useState<ActiveView>('hub');
  const [activeModule, setActiveModule]       = useState<MEModule>(MEModule.SIMPLIFICAME);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin]       = useState(false);
  const [isListening, setIsListening]         = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentLayer = useMemo(() => getLayerById(activePhase), [activePhase]);
  const layers       = useMemo(() => getAllLayers(), []);
  const afseScore    = company?.afse_score ?? 0;
  const afseStatus   = getAfseStatus(afseScore, t);
  const sparkData    = useMemo(() => layers.map((l, i) => ({
    name: l.code, value: l.id <= maxPhaseReached ? Math.min(100, 40 + i * 12) : 0,
  })), [layers, maxPhaseReached]);
  const radialData = [{ name: 'AFSE', value: afseScore, fill: afseStatus.color }];

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
      const { data: adminCheck } = await supabase.rpc('is_super_admin');
      setIsSuperAdmin(!!adminCheck);
      const userCompany = await getUserCompany(sessionUser.id);
      if (!userCompany) return;
      setCompany(userCompany);

      // ← Aplicar idioma preferido del perfil
      const { data: member } = await supabase
        .from('company_members')
        .select('preferred_lang')
        .eq('user_id', sessionUser.id)
        .single();
      await applyPreferredLang(member?.preferred_lang);

      const activeCycle = await getActiveCycle(userCompany.id);
      if (!activeCycle) return;
      setCycle(activeCycle);
      const { activePhase: ap, maxPhase: mp } = await getActivePhase(userCompany.id, activeCycle.id);
      setActivePhase(ap); setMaxPhaseReached(mp);
      setMessages([{
        role: 'auron',
        text: t('auron:greeting', { company: userCompany.name, layer: String(ap).padStart(2,'0'), score: userCompany.afse_score?.toFixed(0) ?? '0' }),
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
    const timer = setTimeout(() => persistProgress(activePhase), 1500);
    return () => clearTimeout(timer);
  }, [userData]);

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionUser || !currentLayer) return;
    const userText = input.trim();
    const ts = new Date().toLocaleTimeString('es-CO');
    setMessages(prev => [...prev, { role: 'user', text: userText, ts }]);
    setInput(''); setAuronLoading(true);
    if (company && cycle) await saveAuronMessage(company.id, cycle.id, sessionUser.id, activePhase, 'user', userText);
    try {
      // Detectar intención de avance (ES + EN)
      const isTryingToAdvance = /siguiente|avanzar|cerrar capa|advance|next|close layer/i.test(userText);
      if (isTryingToAdvance) {
        const isValid = validateLayer(currentLayer, userData);
        if (!isValid) {
          const text = t('auron:layerNotValid', { layer: String(activePhase).padStart(2,'00'), outputs: currentLayer.outputs.join(', ').toUpperCase() });
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
        const text = t('auron:layerClosed', { layer: String(activePhase).padStart(2,'0'), next: String(nextPhase).padStart(2,'0') });
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
    } catch (err) {
      // Exponemos el error real para depuración fácil del lado del CEO
      const errorMessage = err instanceof Error ? err.message : t('auron:connectionError');
      setMessages(prev => [...prev, { 
        role: 'auron', 
        text: `⚠️ ERROR: ${errorMessage}`, 
        ts: new Date().toLocaleTimeString('es-CO') 
      }]);
    } finally { setAuronLoading(false); }
  };

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: T.bg }}>
      <BackgroundMesh />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: T.cyan, boxShadow: `0 0 60px rgba(0,229,255,0.5)` }}>
          <Activity size={36} className="text-black animate-pulse" />
        </div>
        <p className="text-lg font-bold uppercase tracking-widest" style={{ color: T.cyan }}>
          {t('status.loading')}
        </p>
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: T.cyan, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

  // ── LOGIN / SIGNUP ─────────────────────────────────────────────────────────────
  if (!sessionUser) {
    if (showSignup || urlPlan) {
      return <SignupScreen initialPlan={urlPlan || 'esencial'} onBackToLogin={() => setShowSignup(false)} />;
    }
    return <LoginScreen email={loginEmail} setEmail={setLoginEmail} />;
  }

  // ── ADMIN ────────────────────────────────────────────────────────────────────
  if (activeView === 'admin') return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg }}>
      <BackgroundMesh />
      <header className="relative z-50 h-16 border-b px-8 flex items-center justify-between"
        style={{ background: 'rgba(6,9,15,0.95)', backdropFilter: 'blur(20px)', borderColor: T.border }}>
        <button onClick={() => setActiveView('hub')} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.cyan }}>
            <ShieldCheck size={18} className="text-black" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-black" style={{ color: T.text }}>Arquitectura</span>
            <span className="text-lg font-black" style={{ color: T.cyan }}>ME</span>
            <span className="text-sm font-semibold ml-2" style={{ color: T.textDim }}>{t('nav.back')}</span>
          </div>
        </button>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
          style={{ background: 'rgba(255,61,87,0.08)', border: '1px solid rgba(255,61,87,0.20)' }}>
          <Settings size={14} className="text-red-400" />
          <span className="text-sm font-black uppercase tracking-wider text-red-400">{t('platform:admin.label')}</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher userId={sessionUser.id} />
          <button onClick={() => supabase.auth.signOut()} style={{ color: T.textDim }} className="hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <div className="flex-1 relative z-10"><SuperAdminPanel /></div>
    </div>
  );

  const completedLayers = maxPhaseReached - 1;
  const progressPct = Math.round((completedLayers / 8) * 100);

  // ── MAIN LAYOUT ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: T.bg, color: T.text }}>
      <BackgroundMesh />

      {/* TOPBAR */}
      <header className={`relative z-50 h-16 border-b flex items-center px-6 gap-4 ${activeView === 'hub' ? 'hidden' : ''}`}
        style={{ background: 'rgba(6,9,15,0.95)', backdropFilter: 'blur(20px)', borderColor: T.border }}>
        <div className="flex items-center gap-3">
          {activeView !== 'hub' && (
            <button onClick={() => setSidebarCollapsed(p => !p)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ border: `1px solid ${T.border}` }}>
              <Network size={16} style={{ color: T.textMid }} />
            </button>
          )}
          <button onClick={() => setActiveView('hub')} className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.cyan }}>
              <ShieldCheck size={16} className="text-black" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-base font-black" style={{ color: T.text }}>Arquitectura</span>
              <span className="text-base font-black" style={{ color: T.cyan }}>ME</span>
            </div>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center gap-1.5">
          {([
            { id: 'hub',       label: t('nav.hub'),       icon: <Layers   size={14} /> },
            { id: 'workspace', label: t('nav.workspace'), icon: <Target   size={14} /> },
            { id: 'dashboard', label: t('nav.dashboard'), icon: <BarChart3 size={14} /> },
          ] as const).map(v => (
            <button key={v.id} onClick={() => setActiveView(v.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all"
              style={{
                background: activeView === v.id ? `${T.cyan}12` : 'transparent',
                color: activeView === v.id ? T.cyan : T.textDim,
                border: `1px solid ${activeView === v.id ? T.cyan + '30' : 'transparent'}`,
              }}>
              {v.icon}{v.label}
            </button>
          ))}
          {isSuperAdmin && (
            <button onClick={() => setActiveView('admin')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ml-2"
              style={{ background: 'rgba(255,61,87,0.08)', color: '#f87171', border: '1px solid rgba(255,61,87,0.18)' }}>
              <Settings size={14} /> {t('nav.admin')}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher userId={sessionUser.id} />
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl"
            style={{ background: `${afseStatus.color}08`, border: `1px solid ${afseStatus.color}20` }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: afseStatus.color }} />
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: afseStatus.color }}>
              {afseScore.toFixed(0)}/100 · {afseStatus.label}
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}` }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black text-black" style={{ background: T.cyan }}>
              {sessionUser.email?.[0]?.toUpperCase() ?? 'D'}
            </div>
            <span className="text-sm hidden md:block max-w-[120px] truncate" style={{ color: T.textMid }}>
              {sessionUser.email}
            </span>
            <button onClick={() => supabase.auth.signOut()} className="ml-1 hover:text-red-400 transition-colors" style={{ color: T.textDim }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* SIDEBAR */}
        {activeView !== 'hub' && (
          <aside className="flex-shrink-0 border-r flex flex-col overflow-hidden transition-all duration-200"
            style={{ width: sidebarCollapsed ? '0px' : '220px', background: 'rgba(6,9,15,0.85)', borderColor: T.border }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 w-[220px]">
              <div className="p-4 rounded-2xl mb-2" style={{ background: `${afseStatus.color}06`, border: `1px solid ${afseStatus.color}15` }}>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="82%"
                      data={radialData} startAngle={90} endAngle={90 - (360 * afseScore / 100)}>
                      <RadialBar dataKey="value" cornerRadius={8} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-base font-black mt-1" style={{ color: afseStatus.color }}>{afseScore.toFixed(0)}/100</p>
                <p className="text-center text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: T.textDim }}>{t('afse:score.label')}</p>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest px-3 py-2" style={{ color: T.textDim }}>{t('afse:layers.title')}</p>
              {layers.map(l => (
                <LayerPill key={l.id} id={l.id} code={l.code} name={l.name}
                  isLocked={l.id > maxPhaseReached} isCurrent={l.id === activePhase} isCompleted={l.id < maxPhaseReached}
                  onClick={() => { setActivePhase(l.id); setActiveView('workspace'); }} />
              ))}
            </div>
            <div className="p-4 border-t" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.12)' }}>
                <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.textMid }}>{t('status.online')}</span>
              </div>
            </div>
          </aside>
        )}

        {/* HUB / MODULAR DASHBOARD */}
        {activeView === 'hub' && (
          <div className="flex-1 overflow-y-auto bg-[#0a0f1d] px-4 md:px-8 lg:px-12 py-10 relative z-10" style={{ background: T.bg }}>
            {/* TOP HEADER / PROFILE ME */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 gap-8 relative z-20">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 border border-[#00ffff]/20 rounded-2xl flex items-center justify-center bg-[#00ffff]/5 shadow-[0_0_15px_rgba(0,255,255,0.1)] flex-shrink-0">
                   <div className="text-2xl font-black text-[#00ffff]">{sessionUser?.email?.[0]?.toUpperCase() ?? 'D'}</div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter shadow-black drop-shadow-md leading-tight">
                    <span className="text-slate-500 text-base md:text-lg mr-2 font-normal not-italic block md:inline">{t('common.welcome')},</span>
                    {company?.name ?? t('brand.company')}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="px-3 py-1 bg-[#00ffff]/10 border border-[#00ffff]/20 rounded-full text-[#00ffff] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      {sessionUser?.email}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors cursor-pointer" onClick={() => setActiveView('admin')}>
                      {t('ui.role')}: {t('roles.estrategico')}
                    </span>
                    <button onClick={() => supabase.auth.signOut()} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors">
                      <LogOut size={12} className="inline mr-1" /> SALIR
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 md:ml-auto">
                <div className="text-right hidden sm:block">
                  <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">{t('afse:score.label')}</p>
                  <p className="text-white font-black text-sm" style={{ color: afseStatus.color }}>{afseStatus.label}</p>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-white/5" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path style={{ color: afseStatus.color }} strokeDasharray={`${afseScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm font-black text-white">{afseScore.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* MODULE NAVIGATION */}
            <div className="max-w-7xl mx-auto mb-12 flex flex-wrap gap-4 relative z-20">
              {[
                { id: MEModule.SIMPLIFICAME, label: t('modules.simplificame'), icon: Layers, activeColor: 'text-[#00ffff]', bgActive: 'bg-[#00ffff]/10 border-[#00ffff]/30 shadow-[0_0_30px_#00ffff15]' },
                { id: MEModule.GESTIONAME, label: t('modules.gestioname'), icon: Target, activeColor: 'text-emerald-400', bgActive: 'bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_30px_#34d39915]' },
                { id: MEModule.CAPACITAME, label: t('modules.capacitame'), icon: GraduationCap, activeColor: 'text-indigo-400', bgActive: 'bg-indigo-400/10 border-indigo-400/30 shadow-[0_0_30px_#818cf815]' },
                { id: MEModule.EVALUAME, label: t('modules.evaluame'), icon: ShieldCheck, activeColor: 'text-amber-400', bgActive: 'bg-amber-400/10 border-amber-400/30 shadow-[0_0_30px_#fbbf2415]' },
                { id: MEModule.CONSULTAME, label: t('modules.consultame'), icon: BarChart3, activeColor: 'text-rose-400', bgActive: 'bg-rose-400/10 border-rose-400/30 shadow-[0_0_30px_#fb718515]' },
              ].map(mod => (
                <button key={mod.id} onClick={() => setActiveModule(mod.id)}
                  className={`flex-1 min-w-[140px] md:min-w-[180px] p-4 rounded-2xl flex md:flex-row flex-col items-center justify-center gap-3 transition-all duration-300 border hover:-translate-y-1 ${
                    activeModule === mod.id ? mod.bgActive : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}>
                  <mod.icon size={20} className={activeModule === mod.id ? mod.activeColor : 'opacity-70'} />
                  <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] ${activeModule === mod.id ? 'text-white' : ''}`}>
                    {mod.label}
                  </span>
                </button>
              ))}
            </div>

            {/* ACTIVE MODULE RENDERER */}
            <div className="max-w-7xl mx-auto relative z-20">
              {activeModule === MEModule.SIMPLIFICAME && <ModuleSimplificaME onEnterWorkspace={() => setActiveView('workspace')} langToggle={() => applyPreferredLang(i18n.language === 'es' ? 'en' : 'es')} />}
              {activeModule === MEModule.GESTIONAME && <ModuleGestionaME />}
              {activeModule === MEModule.CAPACITAME && <ModuleCapacitaME />}
              {activeModule === MEModule.EVALUAME && <ModuleEvaluaME />}
              {activeModule === MEModule.CONSULTAME && <ModuleConsultaME />}
            </div>
            
            <div className="max-w-7xl mx-auto text-center py-8 mt-12 border-t" style={{ borderColor: T.border }}>
              <p className="text-base font-semibold" style={{ color: T.textDim }}>{t('brand.slogan')}</p>
              <p className="text-lg font-black uppercase tracking-widest mt-2" style={{ color: T.cyan, opacity: 0.5 }}>
                {t('brand.sloganAccent')}
              </p>
            </div>
          </div>
        )}

        {/* WORKSPACE */}
        {activeView === 'workspace' && (
          <div className="flex-1 flex overflow-hidden">
            <section className="flex-1 overflow-y-auto p-10">
              {currentLayer ? (
                <div className="max-w-2xl mx-auto">
                  <div className="mb-12">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-black"
                        style={{ background: LAYER_COLORS[activePhase-1], boxShadow: `0 0 30px ${LAYER_COLORS[activePhase-1]}50` }}>
                        {String(activePhase).padStart(2,'0')}
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: T.textMid }}>
                          {t('afse:layers.active')}
                        </p>
                        <h2 className="text-2xl font-black uppercase tracking-wide" style={{ color: LAYER_COLORS[activePhase-1] }}>
                          {currentLayer.name}
                        </h2>
                      </div>
                    </div>
                    <p className="text-base leading-relaxed" style={{ color: T.textMid }}>{currentLayer.objective}</p>
                    <div className="mt-6">
                      <div className="flex justify-between text-sm font-bold uppercase tracking-wider mb-2" style={{ color: T.textDim }}>
                        <span>{t('afse:score.progress')}</span>
                        <span style={{ color: LAYER_COLORS[activePhase-1] }}>{activePhase} / {layers.length}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: T.bg3 }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(activePhase/layers.length)*100}%`, background: `linear-gradient(90deg, ${LAYER_COLORS[0]}, ${LAYER_COLORS[activePhase-1]})` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px flex-1" style={{ background: T.border }} />
                    <span className="text-sm font-bold uppercase tracking-widest" style={{ color: T.textDim }}>{t('afse:layers.matrix')}</span>
                    <div className="h-px flex-1" style={{ background: T.border }} />
                  </div>
                  <MatrixRenderer
                    fields={currentLayer.mainMatrix.fields}
                    values={userData}
                    onChange={(field, value) => setUserData(prev => ({ ...prev, [field]: value }))}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-base font-bold uppercase tracking-widest" style={{ color: T.textDim }}>{t('errors.selectLayer')}</p>
                </div>
              )}
            </section>

            {/* AURON PANEL PREMIUM REFACTOR */}
            <aside className="w-[380px] flex-shrink-0 border-l flex flex-col relative"
              style={{ background: 'rgba(2,4,10,0.65)', backdropFilter: 'blur(20px)', borderColor: T.border }}>
              
              {/* Resplandor superior sutil */}
              <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none opacity-20"
                style={{ background: `radial-gradient(ellipse at 50% -20%, ${T.cyan}, transparent 70%)` }} />

              <div className="p-6 border-b relative z-10" style={{ borderColor: T.border2 }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                      style={{ background: T.cyan, boxShadow: `0 0 30px ${T.cyanGlow}` }}>
                      <Brain size={22} className="text-black" />
                    </div>
                    <div>
                      <p className="text-lg font-black uppercase tracking-widest leading-none mb-1" style={{ color: T.text }}>{t('auron:name')}</p>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: T.cyan }}>{t('auron:role')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-green-500/20 bg-green-500/10">
                    <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" style={{ boxShadow: '0 0 10px #00E676' }} />
                    <span className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.15em]">{t('auron:status')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" 
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}` }}>
                  <Eye size={14} style={{ color: T.cyan }} />
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: T.textMid }}>
                    {t('auron:watching', { layer: String(activePhase).padStart(2,'0'), code: currentLayer?.code ?? '...' })}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-thin">
                {messages.map((m, i) => <AuronMsg key={i} msg={m} />)}
                {auronLoading && (
                  <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-9 h-9 rounded-[14px] flex items-center justify-center text-sm font-black text-black mt-1 flex-shrink-0" 
                      style={{ background: T.cyan, boxShadow: `0 0 15px ${T.cyanGlow}` }}>
                      A
                    </div>
                    <div className="px-6 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2.5"
                      style={{ background: 'rgba(0,229,255,0.05)', border: `1px solid rgba(0,229,255,0.15)` }}>
                      {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: T.cyan, boxShadow: `0 0 8px ${T.cyan}`, animationDelay: `${i*0.15}s` }} />)}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 border-t relative z-10" style={{ borderColor: T.border2, background: 'rgba(0,0,0,0.2)' }}>
                <form onSubmit={handleConsultation}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-all focus-within:ring-2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border2}`, paddingLeft: 16 }}>
                  <button type="button" onClick={() => setIsListening(p => !p)}
                    className="flex items-center justify-center transition-all hover:scale-110"
                    style={{ color: isListening ? T.red : T.textDim }}>
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <input value={input} onChange={e => setInput(e.target.value)}
                    placeholder={t('auron:placeholder')} disabled={auronLoading}
                    className="flex-1 bg-transparent text-[13px] font-medium outline-none disabled:opacity-50 placeholder:text-slate-600"
                    style={{ color: T.text }} />
                  <button type="submit" disabled={auronLoading}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:brightness-125 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                    style={{ background: T.cyan, boxShadow: `0 4px 15px ${T.cyanGlow}` }}>
                    <Send size={16} className="text-black ml-0.5" />
                  </button>
                </form>
                <p className="text-[10px] font-black text-center mt-4 uppercase tracking-[0.2em]" style={{ color: T.textDim }}>
                  {t('auron:advance.hint')}
                </p>
              </div>
            </aside>
          </div>
        )}

        {/* DASHBOARD */}
        {activeView === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-10">
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: T.textMid }}>
                    {t('platform:dashboard.subtitle')}
                  </p>
                  <h2 className="text-4xl font-black tracking-tight">
                    <span style={{ color: T.text }}>Master </span>
                    <span style={{ color: T.cyan }}>{t('platform:dashboard.title')}</span>
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold" style={{ color: T.textMid }}>{company?.name ?? '—'}</p>
                  <p className="text-sm mt-0.5" style={{ color: T.textDim }}>Arquitectura ME · Neuro Code</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard label={t('platform:dashboard.metrics.afseScore')}   value={`${afseScore.toFixed(0)}/100`} sub={`${t('afse:score.label')}: ${afseStatus.label}`}             color={afseStatus.color}           icon={<TrendingUp size={18} />} />
                <MetricCard label={t('platform:dashboard.metrics.activeLayer')} value={`L${String(activePhase).padStart(2,'0')}`} sub={currentLayer?.code ?? '...'}                      color={LAYER_COLORS[activePhase-1]} icon={<Target    size={18} />} />
                <MetricCard label={t('platform:dashboard.metrics.completed')}   value={`${maxPhaseReached-1} / 8`}   sub={`${Math.round(((maxPhaseReached-1)/8)*100)}% ${t('afse:layers.cycleOf')}`} color="#00E676"               icon={<Activity  size={18} />} />
                <MetricCard label={t('platform:dashboard.metrics.company')}     value={company ? '✓' : '—'}          sub={company?.name ?? '—'}                                          color={T.purple}                   icon={<Cpu       size={18} />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-3xl p-7" style={{ background: T.bg2, border: `1px solid ${T.border}` }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: T.cyan }}>{t('platform:dashboard.layerProgress')}</p>
                      <p className="text-sm" style={{ color: T.textDim }}>{t('platform:dashboard.cyclePerformance')}</p>
                    </div>
                    <RefreshCw size={16} style={{ color: T.textDim }} />
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData}>
                        <defs>
                          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={T.cyan} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={T.cyan} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fill: T.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ background: T.bg3, border: `1px solid ${T.border2}`, borderRadius: 12, fontSize: 12 }}
                          labelStyle={{ color: T.cyan }} itemStyle={{ color: T.textMid }} />
                        <Area type="monotone" dataKey="value" stroke={T.cyan} fill="url(#grad1)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-3xl p-7" style={{ background: T.bg2, border: `1px solid ${T.border}` }}>
                  <div className="flex items-center gap-2.5 mb-5">
                    <AlertCircle size={16} style={{ color: T.red }} />
                    <p className="text-sm font-bold uppercase tracking-widest" style={{ color: T.textMid }}>{t('platform:dashboard.alerts')}</p>
                  </div>
                  <div className="space-y-3">
                    {afseScore < 90 && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(255,61,87,0.05)', border: '1px solid rgba(255,61,87,0.15)' }}>
                        <div className="w-2 h-2 rounded-full bg-[#FF3D57] mt-1.5 flex-shrink-0" />
                        <p className="text-sm leading-relaxed" style={{ color: T.textMid }}>{t('platform:dashboard.alertScoreLow')}</p>
                      </div>
                    )}
                    {maxPhaseReached < 4 && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(255,179,0,0.05)', border: '1px solid rgba(255,179,0,0.15)' }}>
                        <div className="w-2 h-2 rounded-full bg-[#FFB300] mt-1.5 flex-shrink-0" />
                        <p className="text-sm leading-relaxed" style={{ color: T.textMid }}>{t('platform:dashboard.alertAdvanceBSC')}</p>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.15)' }}>
                      <div className="w-2 h-2 rounded-full bg-[#00E676] mt-1.5 flex-shrink-0" />
                      <p className="text-sm leading-relaxed" style={{ color: T.textMid }}>{t('platform:dashboard.alertOnline')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl p-7" style={{ background: T.bg2, border: `1px solid ${T.border}` }}>
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 size={18} style={{ color: T.cyan }} />
                  <p className="text-base font-bold uppercase tracking-widest" style={{ color: T.text }}>{t('afse:layers.flow')}</p>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {layers.map(l => {
                    const done = l.id < maxPhaseReached;
                    const current = l.id === activePhase;
                    const locked = l.id > maxPhaseReached;
                    const color = LAYER_COLORS[l.id-1];
                    return (
                      <button key={l.id}
                        onClick={() => { if (!locked) { setActivePhase(l.id); setActiveView('workspace'); }}}
                        className="p-4 rounded-2xl border text-center transition-all hover:scale-[1.04]"
                        style={{ background: current ? `${color}12` : done ? 'rgba(0,230,118,0.05)' : T.bg3,
                          borderColor: current ? color+'50' : done ? 'rgba(0,230,118,0.20)' : T.border,
                          boxShadow: current ? `0 0 20px ${color}25` : 'none', opacity: locked ? 0.25 : 1 }}>
                        <p className="text-base font-black mb-1" style={{ color: current ? color : done ? '#00E676' : T.textDim }}>
                          {String(l.id).padStart(2,'0')}
                        </p>
                        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: current ? color : T.textDim }}>{l.code}</p>
                        <div className="mt-2.5 h-0.5 rounded-full mx-auto w-8" style={{ background: done ? '#00E676' : current ? color : T.bg3 }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl p-7" style={{ background: T.bg3, border: `1px solid ${T.border}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <Terminal size={16} style={{ color: T.cyan }} />
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: T.cyan, opacity: 0.7 }}>
                    {t('auron:terminal')}
                  </span>
                  <div className="flex-1" />
                  <div className="flex gap-1.5">
                    {[T.red, T.amber, '#00E676'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                  </div>
                </div>
                <div className="h-32 overflow-y-auto space-y-3 pr-2">
                  {messages.slice(-5).map((m, i) => (
                    <div key={i} className="flex gap-4 border-l-2 pl-4 py-1" style={{ borderColor: T.border }}>
                      <span className="text-xs whitespace-nowrap font-mono" style={{ color: `${T.cyan}50` }}>[{m.ts}]</span>
                      <p className="text-sm leading-relaxed" style={{ color: T.textDim }}>
                        <span className="font-bold mr-2" style={{ color: m.role === 'auron' ? T.cyan : T.text }}>
                          {m.role === 'auron' ? `${t('auron:name')}:` : `${t('auron:user')}:`}
                        </span>
                        {m.text.slice(0, 120)}{m.text.length > 120 ? '...' : ''}
                      </p>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-sm animate-pulse" style={{ color: T.textDim }}>{t('auron:waiting')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="relative z-50 h-8 border-t px-6 flex items-center justify-between"
        style={{ background: 'rgba(6,9,15,0.95)', borderColor: T.border }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.textDim }}>
              {t('platform:footer.operational')}
            </span>
          </div>
          <span style={{ color: T.textDim }} className="text-xs">{t('platform:footer.stack')}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: T.textDim }}>
            Arquitectura ME · {new Date().toLocaleDateString('es-CO')}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: afseStatus.color }}>● {afseStatus.label}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
