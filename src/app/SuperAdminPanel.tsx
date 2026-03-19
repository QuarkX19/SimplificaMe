/**
 * ARQUITECTURA ME — Neuro Code Style
 * SuperAdminPanel.tsx
 * Panel de control maestro — solo accesible para role = 'owner'
 * calidadysostenibilidad.com SAS
 */

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/api/supabase";
import {
  Building2, Package, TrendingUp, Plus,
  BarChart3, Activity, Globe, FileText, Shield,
  Edit2, Eye, RefreshCw, Search,
  ArrowUpCircle, ArrowDownCircle, ToggleLeft, ToggleRight,
  Star, X, Check, AlertCircle
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Company {
  id: string;
  name: string;
  plan_code: string;
  country: string;
  is_pilot: boolean;
  is_active: boolean;
  logo_authorized: boolean;
  contract_signed: boolean;
  afse_score: number;
  pilot_ends_at: string | null;
  notes: string | null;
  price_usd: number;
  total_users: number;
  last_activity: string | null;
  created_at: string;
}

interface Plan {
  id: string;
  code: string;
  name: string;
  price_usd: number;
  max_users: number;
  modules: string[];
  is_active: boolean;
}

interface AdminLog {
  id: string;
  action: string;
  target_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

type AdminTab = 'dashboard' | 'companies' | 'plans' | 'logs';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PLAN_COLORS: Record<string, string> = {
  starter:    '#00ffff',
  operativo:  '#00e676',
  formacion:  '#f5a623',
  enterprise: '#9b6dff',
};

const PLAN_LABELS: Record<string, string> = {
  starter:    'Starter',
  operativo:  'Operativo',
  formacion:  'Formación',
  enterprise: 'Enterprise',
};

const MODULE_LABELS: Record<string, string> = {
  simplifica: 'SimplificaME',
  gestiona:   'GestionaME',
  capacita:   'CapacitaME',
  evalua:     'EvaluaME',
  consulta:   'ConsultaME',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function PlanBadge({ code }: { code: string }) {
  const color = PLAN_COLORS[code] ?? '#666';
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest"
      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
      {PLAN_LABELS[code] ?? code}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#28a745] animate-pulse' : 'bg-slate-700'}`} />
  );
}

function StatCard({ label, value, sub, color = '#00ffff', icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-black/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: color }} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600">{label}</p>
        <div style={{ color }}>{icon}</div>
      </div>
      <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
      {sub && <p className="text-[9px] font-bold mt-1" style={{ color }}>{sub}</p>}
    </div>
  );
}

// ─── MODAL: CREAR EMPRESA ─────────────────────────────────────────────────────
function CreateCompanyModal({ plans, onClose, onCreated }: {
  plans: Plan[]; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: '', plan_code: 'starter', country: 'CO',
    is_pilot: false, pilot_discount: 40, admin_email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.admin_email.trim()) {
      setError('Nombre y email del admin son obligatorios');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase.rpc('create_company_full', {
        p_name:           form.name.trim(),
        p_plan_code:      form.plan_code,
        p_country:        form.country,
        p_is_pilot:       form.is_pilot,
        p_pilot_discount: form.is_pilot ? form.pilot_discount : 0,
      });
      if (err) throw err;
      if (data?.company_id) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('invitations').insert({
          company_id: data.company_id,
          email:      form.admin_email.trim(),
          role:       'admin',
          me_level:   'estrategico',
          invited_by: user?.id,
        });
      }
      onCreated();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-lg bg-[#080c14] border border-white/10 rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 0 80px rgba(0,255,255,0.08)' }}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white italic tracking-tight">
              Nueva <span style={{ color: '#00ffff' }}>Empresa</span>
            </h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-0.5">Onboarding · Arquitectura ME</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={14} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Nombre de la empresa *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ej: TSI Logística SAS"
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-[12px] text-white outline-none focus:border-[#00ffff]/40 transition-colors placeholder:text-slate-700 font-mono" />
          </div>
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Email del Company Admin *</label>
            <input type="email" value={form.admin_email} onChange={e => setForm(p => ({ ...p, admin_email: e.target.value }))}
              placeholder="director@empresa.com"
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-[12px] text-white outline-none focus:border-[#00ffff]/40 transition-colors placeholder:text-slate-700 font-mono" />
          </div>
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Plan contratado</label>
            <div className="grid grid-cols-2 gap-2">
              {plans.filter(p => p.is_active).map(plan => (
                <button key={plan.code} onClick={() => setForm(p => ({ ...p, plan_code: plan.code }))}
                  className="p-3 rounded-xl border text-left transition-all"
                  style={{
                    background: form.plan_code === plan.code ? `${PLAN_COLORS[plan.code]}10` : 'rgba(255,255,255,0.02)',
                    borderColor: form.plan_code === plan.code ? `${PLAN_COLORS[plan.code]}40` : 'rgba(255,255,255,0.06)',
                  }}>
                  <p className="text-[10px] font-black" style={{ color: PLAN_COLORS[plan.code] }}>{plan.name}</p>
                  <p className="text-[8px] text-slate-600 font-mono">${plan.price_usd}/mes · {plan.max_users === -1 ? '∞' : plan.max_users} usuarios</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 block">País</label>
              <select value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-[12px] text-white outline-none font-mono">
                <option value="CO">🇨🇴 Colombia</option>
                <option value="MX">🇲🇽 México</option>
                <option value="US">🇺🇸 USA</option>
                <option value="PE">🇵🇪 Perú</option>
                <option value="CL">🇨🇱 Chile</option>
              </select>
            </div>
            <div>
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Piloto</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <button onClick={() => setForm(p => ({ ...p, is_pilot: !p.is_pilot }))}>
                  {form.is_pilot
                    ? <ToggleRight size={18} style={{ color: '#00ffff' }} />
                    : <ToggleLeft size={18} className="text-slate-600" />}
                </button>
                {form.is_pilot ? (
                  <>
                    <input type="number" min={0} max={100} value={form.pilot_discount}
                      onChange={e => setForm(p => ({ ...p, pilot_discount: Number(e.target.value) }))}
                      className="w-12 bg-transparent text-[12px] text-white outline-none font-mono" />
                    <span className="text-[10px] text-slate-500">%</span>
                  </>
                ) : <span className="text-[10px] text-slate-600">Activar</span>}
              </div>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={12} className="text-red-400" />
              <p className="text-[10px] text-red-400">{error}</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: '#00ffff', boxShadow: '0 0 20px #00ffff30' }}>
            {loading ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
            {loading ? 'Creando...' : 'Crear Empresa'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: CAMBIAR PLAN ──────────────────────────────────────────────────────
function ChangePlanModal({ company, plans, onClose, onChanged }: {
  company: Company; plans: Plan[]; onClose: () => void; onChanged: () => void;
}) {
  const [newPlan, setNewPlan] = useState(company.plan_code);
  const [reason, setReason]   = useState('');
  const [loading, setLoading] = useState(false);

  const currentPrice = plans.find(p => p.code === company.plan_code)?.price_usd ?? 0;
  const newPrice     = plans.find(p => p.code === newPlan)?.price_usd ?? 0;
  const isUpgrade    = newPrice > currentPrice;
  const isDowngrade  = newPrice < currentPrice;
  const isSame       = newPlan === company.plan_code;

  const handleChange = async () => {
    if (isSame) return;
    setLoading(true);
    try {
      await supabase.rpc('change_company_plan', {
        p_company_id: company.id,
        p_new_plan:   newPlan,
        p_reason:     reason || null,
      });
      onChanged();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-md bg-[#080c14] border border-white/10 rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 0 80px rgba(0,255,255,0.08)' }}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white italic">Cambiar Plan</h2>
            <p className="text-[9px] text-slate-600 mt-0.5 font-mono">{company.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10">
            <X size={14} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Plan actual</span>
            <PlanBadge code={company.plan_code} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {plans.filter(p => p.is_active).map(plan => (
              <button key={plan.code} onClick={() => setNewPlan(plan.code)}
                className="p-3 rounded-xl border text-left transition-all"
                style={{
                  background: newPlan === plan.code ? `${PLAN_COLORS[plan.code]}10` : 'rgba(255,255,255,0.02)',
                  borderColor: newPlan === plan.code ? `${PLAN_COLORS[plan.code]}40` : 'rgba(255,255,255,0.06)',
                  opacity: plan.code === company.plan_code ? 0.4 : 1,
                }}>
                <p className="text-[10px] font-black" style={{ color: PLAN_COLORS[plan.code] }}>{plan.name}</p>
                <p className="text-[8px] text-slate-600 font-mono">${plan.price_usd}/mes</p>
              </button>
            ))}
          </div>
          {!isSame && (
            <div className="flex items-center gap-2 p-3 rounded-xl"
              style={{
                background: isUpgrade ? 'rgba(40,167,69,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${isUpgrade ? 'rgba(40,167,69,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
              {isUpgrade
                ? <ArrowUpCircle size={14} className="text-[#28a745]" />
                : <ArrowDownCircle size={14} className="text-[#ef4444]" />}
              <div>
                <p className="text-[10px] font-black" style={{ color: isUpgrade ? '#28a745' : '#ef4444' }}>
                  {isUpgrade ? 'UPGRADE' : 'DOWNGRADE'} — ${Math.abs(newPrice - currentPrice)}/mes
                </p>
                {isDowngrade && <p className="text-[8px] text-slate-600 mt-0.5">Datos preservados 2 años</p>}
              </div>
            </div>
          )}
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Razón (opcional)</label>
            <input value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Ej: Cliente firmó contrato anual"
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-[#00ffff]/40 transition-colors placeholder:text-slate-700 font-mono" />
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300">
            Cancelar
          </button>
          <button onClick={handleChange} disabled={loading || isSame}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] disabled:opacity-40"
            style={{
              background: isSame ? '#333' : isUpgrade ? '#28a745' : '#ef4444',
              boxShadow: isSame ? 'none' : `0 0 20px ${isUpgrade ? '#28a74530' : '#ef444430'}`,
            }}>
            {loading ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SUPER ADMIN PANEL ────────────────────────────────────────────────────────
const SuperAdminPanel: React.FC = () => {
  const [tab, setTab]                     = useState<AdminTab>('dashboard');
  const [companies, setCompanies]         = useState<Company[]>([]);
  const [plans, setPlans]                 = useState<Plan[]>([]);
  const [logs, setLogs]                   = useState<AdminLog[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [showCreate, setShowCreate]       = useState(false);
  const [changePlanFor, setChangePlanFor] = useState<Company | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: cd }, { data: pd }, { data: ld }] = await Promise.all([
        supabase.from('super_admin_dashboard').select('*').order('created_at', { ascending: false }),
        supabase.from('plans').select('*').order('price_usd'),
        supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50),
      ]);
      setCompanies((cd as Company[]) ?? []);
      setPlans((pd as Plan[]) ?? []);
      setLogs((ld as AdminLog[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleActive   = async (c: Company) => { await supabase.from('companies').update({ is_active: !c.is_active }).eq('id', c.id); loadData(); };
  const toggleLogo     = async (c: Company) => { await supabase.from('companies').update({ logo_authorized: !c.logo_authorized }).eq('id', c.id); loadData(); };

  const filtered       = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.plan_code.includes(search.toLowerCase()));
  const totalMRR       = companies.filter(c => c.is_active).reduce((s, c) => s + (c.price_usd ?? 0), 0);
  const activeCount    = companies.filter(c => c.is_active).length;
  const pilotCount     = companies.filter(c => c.is_pilot).length;
  const avgScore       = companies.length > 0 ? companies.reduce((s, c) => s + (c.afse_score ?? 0), 0) / companies.length : 0;

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={13} /> },
    { id: 'companies', label: 'Empresas',  icon: <Building2 size={13} /> },
    { id: 'plans',     label: 'Planes',    icon: <Package size={13} /> },
    { id: 'logs',      label: 'Auditoría', icon: <FileText size={13} /> },
  ];

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>

      {/* SUB-NAV */}
      <div className="border-b border-white/5 px-6 py-3 flex items-center justify-between" style={{ background: 'rgba(2,4,10,0.6)' }}>
        <div className="flex items-center gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              style={{
                background: tab === t.id ? 'rgba(239,68,68,0.1)' : 'transparent',
                color: tab === t.id ? '#f87171' : 'rgba(255,255,255,0.3)',
                border: tab === t.id ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
              }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <RefreshCw size={12} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {tab === 'companies' && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02]"
              style={{ background: '#00ffff', boxShadow: '0 0 15px #00ffff30' }}>
              <Plus size={12} /> Nueva Empresa
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600 mb-1">Vista Global</p>
              <h2 className="text-3xl font-black text-white tracking-tighter italic">
                Super Admin <span style={{ color: '#f87171' }}>Dashboard</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="MRR Total"        value={`$${totalMRR.toLocaleString()}`} sub="USD / mes"              color="#00ffff"  icon={<TrendingUp size={14} />} />
              <StatCard label="Empresas Activas" value={activeCount}                     sub={`${pilotCount} en piloto`} color="#28a745" icon={<Building2  size={14} />} />
              <StatCard label="Score AFSE Avg"   value={`${avgScore.toFixed(0)}/100`}    sub="Promedio clientes"      color="#f5a623"  icon={<Activity   size={14} />} />
              <StatCard label="Total Clientes"   value={companies.length}                sub={`${companies.filter(c => !c.is_active).length} inactivos`} color="#9b6dff" icon={<Globe size={14} />} />
            </div>
            <div className="bg-black/60 border border-white/5 rounded-2xl p-5">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Distribución por Plan</p>
              <div className="grid grid-cols-4 gap-3">
                {['starter','operativo','formacion','enterprise'].map(code => {
                  const count = companies.filter(c => c.plan_code === code && c.is_active).length;
                  const color = PLAN_COLORS[code];
                  const pct   = activeCount > 0 ? Math.round((count / activeCount) * 100) : 0;
                  return (
                    <div key={code} className="text-center p-4 rounded-xl border" style={{ background: `${color}06`, borderColor: `${color}20` }}>
                      <p className="text-2xl font-black" style={{ color }}>{count}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest mt-1" style={{ color }}>{PLAN_LABELS[code]}</p>
                      <p className="text-[8px] text-slate-700 font-mono mt-1">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-black/60 border border-white/5 rounded-2xl p-5">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Clientes Recientes</p>
              <div className="space-y-2">
                {companies.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/4 hover:border-white/8 transition-all">
                    <div className="flex items-center gap-3">
                      <StatusDot active={c.is_active} />
                      <div>
                        <p className="text-[11px] font-black text-white">{c.name}</p>
                        <p className="text-[8px] text-slate-600 font-mono">{c.country} · {c.total_users} usuarios</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PlanBadge code={c.plan_code} />
                      <span className="text-[9px] font-black text-slate-500">Score: {c.afse_score?.toFixed(0) ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COMPANIES */}
        {tab === 'companies' && (
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
              <Search size={13} className="text-slate-600" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar empresa o plan..."
                className="flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-slate-700 font-mono" />
              {search && <button onClick={() => setSearch('')}><X size={12} className="text-slate-600" /></button>}
            </div>
            <div className="bg-black/60 border border-white/5 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {[['Empresa',3],['Plan',1],['País',1],['Usuarios',1],['Score',1],['Activo',1],['Piloto',1],['Logo ★',1],['Acciones',2]].map(([h, span]) => (
                  <div key={String(h)} className={`text-[7px] font-black uppercase tracking-[0.3em] text-slate-600 col-span-${span}`}>{h}</div>
                ))}
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw size={20} className="text-slate-700 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Building2 size={32} className="text-slate-800" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                    {search ? 'Sin resultados' : 'Sin empresas — crea la primera'}
                  </p>
                </div>
              ) : filtered.map((c, i) => (
                <div key={c.id}
                  className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-white/3 hover:bg-white/2 transition-all items-center"
                  style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <div className="col-span-3">
                    <p className="text-[11px] font-black text-white truncate">{c.name}</p>
                    <p className="text-[8px] text-slate-600 font-mono mt-0.5">
                      {c.last_activity ? new Date(c.last_activity).toLocaleDateString('es-CO') : 'Sin actividad'}
                    </p>
                  </div>
                  <div className="col-span-1"><PlanBadge code={c.plan_code} /></div>
                  <div className="col-span-1"><span className="text-[10px] text-slate-400 font-mono">{c.country}</span></div>
                  <div className="col-span-1"><span className="text-[11px] font-black text-white">{c.total_users ?? 0}</span></div>
                  <div className="col-span-1">
                    <span className="text-[11px] font-black"
                      style={{ color: c.afse_score >= 70 ? '#28a745' : c.afse_score >= 50 ? '#eab308' : '#ef4444' }}>
                      {c.afse_score?.toFixed(0) ?? 0}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <button onClick={() => toggleActive(c)}>
                      {c.is_active ? <ToggleRight size={18} style={{ color: '#28a745' }} /> : <ToggleLeft size={18} className="text-slate-600" />}
                    </button>
                  </div>
                  <div className="col-span-1">
                    {c.is_pilot ? <span className="text-[8px] font-black text-[#f5a623]">✓</span> : <span className="text-[8px] text-slate-700">—</span>}
                  </div>
                  <div className="col-span-1">
                    <button onClick={() => toggleLogo(c)} title="Cláusula 03★">
                      {c.logo_authorized
                        ? <Star size={14} style={{ color: '#f5a623', fill: '#f5a623' }} />
                        : <Star size={14} className="text-slate-700" />}
                    </button>
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <button onClick={() => setChangePlanFor(c)} title="Cambiar plan"
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Package size={11} className="text-slate-400" />
                    </button>
                    <button title="Ver módulos"
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Eye size={11} className="text-slate-400" />
                    </button>
                    <button title="Editar notas"
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Edit2 size={11} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-slate-700 font-mono text-right">{filtered.length} empresas · ★ = Cláusula 03 autorizada</p>
          </div>
        )}

        {/* PLANES */}
        {tab === 'plans' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600 mb-1">Catálogo de Producto</p>
              <h2 className="text-2xl font-black text-white tracking-tighter italic">Planes <span style={{ color: '#f87171' }}>ME</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map(plan => {
                const color   = PLAN_COLORS[plan.code] ?? '#666';
                const count   = companies.filter(c => c.plan_code === plan.code && c.is_active).length;
                const planMRR = count * plan.price_usd;
                return (
                  <div key={plan.id} className="bg-black/60 border rounded-2xl p-5 transition-all hover:border-white/10" style={{ borderColor: `${color}20` }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color }}>{plan.code}</p>
                        <h3 className="text-xl font-black text-white italic">{plan.name}</h3>
                        <p className="text-2xl font-black mt-1" style={{ color }}>
                          ${plan.price_usd}<span className="text-[10px] text-slate-600 font-normal">/mes</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-white">{count}</p>
                        <p className="text-[8px] text-slate-600 font-mono">clientes</p>
                        <p className="text-[9px] font-black mt-1" style={{ color }}>${planMRR.toLocaleString()} MRR</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-600 mb-2">Módulos incluidos</p>
                      {plan.modules.map(mod => (
                        <div key={mod} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                          <span className="text-[9px] text-slate-400">{MODULE_LABELS[mod] ?? mod}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[8px] text-slate-600 font-mono">
                        {plan.max_users === -1 ? 'Usuarios ilimitados' : `Hasta ${plan.max_users} usuarios`}
                      </span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{
                          background: plan.is_active ? 'rgba(40,167,69,0.1)' : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${plan.is_active ? 'rgba(40,167,69,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: plan.is_active ? '#28a745' : '#ef4444' }} />
                        <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: plan.is_active ? '#28a745' : '#ef4444' }}>
                          {plan.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LOGS */}
        {tab === 'logs' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600 mb-1">Registro de Acciones</p>
              <h2 className="text-2xl font-black text-white tracking-tighter italic">Auditoría <span style={{ color: '#f87171' }}>Admin</span></h2>
            </div>
            <div className="bg-black/60 border border-white/5 rounded-2xl overflow-hidden font-mono">
              {logs.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-[10px] text-slate-700 uppercase tracking-widest">Sin registros</p>
                </div>
              ) : logs.map((log, i) => (
                <div key={log.id}
                  className="flex items-start gap-4 px-5 py-3 border-b border-white/3 hover:bg-white/2 transition-all"
                  style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <Shield size={10} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white">{log.action}</span>
                      {log.target_type && (
                        <span className="text-[7px] px-2 py-0.5 rounded-md bg-white/5 text-slate-500 uppercase">{log.target_type}</span>
                      )}
                    </div>
                    <p className="text-[8px] text-slate-600 truncate">{JSON.stringify(log.metadata).slice(0, 80)}...</p>
                  </div>
                  <span className="text-[8px] text-slate-700 whitespace-nowrap flex-shrink-0">
                    {new Date(log.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showCreate && (
        <CreateCompanyModal plans={plans} onClose={() => setShowCreate(false)} onCreated={loadData} />
      )}
      {changePlanFor && (
        <ChangePlanModal company={changePlanFor} plans={plans} onClose={() => setChangePlanFor(null)} onChanged={loadData} />
      )}
    </div>
  );
};

export default SuperAdminPanel;
