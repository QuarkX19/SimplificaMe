import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Network, Activity, ChevronRight, Users, Zap, BrainCircuit, 
  Coffee, Shield, Lock, Leaf, Award, Truck, Database, FileText 
} from 'lucide-react';
import { getTeamProductivity } from '../../services/productivity';
import { supabase } from '../../services/api/supabase';
import { ProcessMap } from '../matrices/ProcessMap';
import { NomDashboard } from '../matrices/NomDashboard';
export const ModuleGestionaME: React.FC = () => {
  const { t } = useTranslation();
  const [teamStats, setTeamStats] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showWarRoom, setShowWarRoom] = React.useState(false);
  const [activeNode, setActiveNode] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('info');

  React.useEffect(() => {
    const fetchTeam = async () => {
      const companyId = localStorage.getItem('auron_current_company_id');
      if (!companyId) return;
      const stats = await getTeamProductivity(companyId);
      setTeamStats(stats);
      setLoading(false);
    };
    fetchTeam();
    const interval = setInterval(fetchTeam, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatHoursMins = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const nodes = [
    { id: 'safety', label: t('common:gestiona.safety_short') || 'SST', sub: t('common:gestiona.safety_sub') || 'Seguridad y Salud', color: '#FF6D00', icon: <Shield size={24} /> },
    { id: 'health', label: t('common:gestiona.health_short') || 'SALUD', sub: t('common:gestiona.health_sub') || 'NOM-035 / Salud', color: '#FF1744', icon: <Activity size={24} /> },
    { id: 'security', label: t('common:gestiona.security_short') || 'LOGÍSTICA', sub: t('common:gestiona.security_sub') || 'OEA / C-TPAT / ANAM', color: '#2962FF', icon: <Truck size={24} /> },
    { id: 'environment', label: t('common:gestiona.environment_short') || 'AMBIENTE', sub: t('common:gestiona.environment_sub') || 'ISO 14001 / Energía', color: '#00C853', icon: <Leaf size={24} /> },
    { id: 'quality', label: t('common:gestiona.quality_short') || 'CALIDAD', sub: t('common:gestiona.quality_sub') || 'ISO 9001:2015', color: '#607D8B', icon: <Award size={24} /> },
    { id: 'documents', label: t('common:gestiona.docs_short') || 'DOCS', sub: t('common:gestiona.docs_sub') || 'Gestión Documental', color: '#EC4899', icon: <Network size={24} /> },
    { id: 'minutes', label: t('common:gestiona.minutes_short') || 'ACTAS', sub: t('common:gestiona.minutes_sub') || 'Comités y Minutas', color: '#8B5CF6', icon: <FileText size={24} /> },
    { id: 'audit', label: t('common:gestiona.audit_short') || 'AUDIT', sub: t('common:gestiona.audit_sub') || 'Auditoría Interna', color: '#06B6D4', icon: <Activity size={24} /> },
    { id: 'pamm', label: t('common:gestiona.pamm_short') || 'PAMM', sub: t('common:gestiona.pamm_sub') || 'Mejoramiento Continua', color: '#F59E0B', icon: <Zap size={24} /> },
    { id: 'mipg', label: t('common:gestiona.mipg_short') || 'MIPG', sub: t('common:gestiona.mipg_sub') || 'Modelo Planeación', color: '#F43F5E', icon: <BrainCircuit size={24} /> },
    { id: 'oci', label: t('common:gestiona.oci_short') || 'OCI', sub: t('common:gestiona.oci_sub') || 'Control Interno', color: '#3B82F6', icon: <Lock size={24} /> },
    { id: 'strategy', label: t('common:gestiona.strategy_short') || 'PLANES', sub: t('common:gestiona.strategy_sub') || 'KPIs y Objetivos', color: '#10B981', icon: <Activity size={24} /> },
    { id: 'assets', label: t('common:gestiona.assets_short') || 'ACTIVOS', sub: t('common:gestiona.assets_sub') || 'Inventario SIGA', color: '#64748B', icon: <Database size={24} /> },
  ];

  const assetData = [
    { id: '6532', process: 'GCC', name: 'Registro Términos y Condiciones', type: 'Información', conf: 'Pública', disp: 'ALTO', int: 'BAJO', crit: 'MEDIO' },
    { id: '8855', process: 'GICL', name: 'Ficha caracterización comité', type: 'Información', conf: 'Clasificada', disp: 'MEDIO', int: 'BAJO', crit: 'ALTO' },
    { id: '8731', process: 'GICL', name: 'Profesional Normalización', type: 'Roles', conf: '-', disp: '-', int: '-', crit: 'ALTO' },
    { id: '8117', process: 'GIL', name: 'Almacenamiento oficina', type: 'Áreas Seguras', conf: 'Clasificada', disp: 'ALTO', int: 'BAJO', crit: 'MEDIO' },
    { id: '8830', process: 'GIL', name: 'Pólizas de seguros', type: 'Información', conf: 'Clasificada', disp: 'ALTO', int: 'BAJO', crit: 'ALTO' },
  ];

  const requirementData = [
    { theme: 'NORMAS GENERALES', type: 'Constitución', title: 'Derechos y Garantías', app: 'Numeral informativo', status: 'No Aplica', color: 'bg-blue-500' },
    { theme: 'HIGIENE Y SEGURIDAD', type: 'Resolución', title: 'Disposiciones Vivienda', app: 'Plan de Trabajo Anual', status: 'Cumple', color: 'bg-emerald-500' },
    { theme: 'SST', type: 'Ley', title: 'Sistema General Pensiones', app: 'Soporte pagos seguridad', status: 'Cumple', color: 'bg-emerald-500' },
    { theme: 'SST', type: 'Circular', title: 'Riesgos Profesionales', app: 'Matriz EPPs y registro', status: 'Cumple', color: 'bg-emerald-500' },
  ];

  const renderCharacterization = () => (
    <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* TABS HEADER */}
      <div className="flex gap-1 px-8 pt-4 border-b border-hub-border shrink-0">
        {[
          { id: 'info', label: 'Información General' },
          { id: 'ref', label: 'Documentos de Referencia' },
          { id: 'docs', label: 'Documentos del Proceso' },
          { id: 'forms', label: 'Formatos' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-t-xl border-t border-x ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-indigo-400 border-hub-border' 
                : 'text-hub-text-muted border-transparent hover:text-hub-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeTab === 'info' && (
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-white/5 border border-hub-border rounded-[2.5rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Caracterización del Proceso</p>
               <h3 className="text-xl font-black text-hub-text italic tracking-tighter mb-6 uppercase">Gestión de Evaluación y Certificación de Competencias Laborales</h3>
               
               <div className="grid gap-4">
                  {[
                    { label: 'Objetivo', val: 'Reconocer los aprendizajes previos de las personas, a través de la Evaluación y Certificación de Competencias Laborales.' },
                    { label: 'Responsable', val: 'Coordinador Proceso Evaluación y Certificación de Competencias Laborales - Grupo ECCL' },
                    { label: 'Alcance', val: 'Comprende la generación de lineamientos y estrategias emitidas desde la Dirección General para la ejecución del proceso.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-black/40 border border-white/5 rounded-2xl">
                       <span className="text-[9px] font-black text-hub-text-muted uppercase w-24 shrink-0 mt-1">{item.label}</span>
                       <p className="text-xs leading-relaxed text-hub-text/80">{item.val}</p>
                    </div>
                  ))}
               </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-hub-border text-[8px] font-black uppercase text-hub-text-muted tracking-widest">
                  <th className="px-4 py-3">Proveedores</th>
                  <th className="px-4 py-3">Entradas</th>
                  <th className="px-4 py-3 text-center text-indigo-400">Compliance</th>
                  <th className="px-4 py-3">Actividades</th>
                  <th className="px-4 py-3 text-right">Salidas</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hub-border/30 text-[10px] text-hub-text-muted">
                  <td className="px-4 py-4 align-top">Gobierno Nacional</td>
                  <td className="px-4 py-4 align-top">Plan Estratégico</td>
                  <td className="px-4 py-4 align-top">
                     <div className="flex gap-1 justify-center">
                        {['MIPG', 'ISO', 'SST'].map(n => <span key={n} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />)}
                     </div>
                  </td>
                  <td className="px-4 py-4 align-top text-hub-text">Planificar lineamientos de medición y análisis.</td>
                  <td className="px-4 py-4 align-top text-right font-mono italic">Manual v7.2</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ref' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[9px] font-black uppercase text-hub-text-muted tracking-[0.2em] border-b border-hub-border">
                <th className="px-4 py-4">Nombre / Referencia</th>
                <th className="px-4 py-4">Descripción</th>
                <th className="px-4 py-4">Expedición</th>
                <th className="px-4 py-4 text-right">Emisor</th>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {[1, 2, 3].map(i => (
                <tr key={i} className="border-b border-hub-border/20 hover:bg-white/5 transition-all text-hub-text">
                  <td className="px-4 py-4 font-bold text-indigo-300">Normograma Proceso G-ECCL</td>
                  <td className="px-4 py-4 text-hub-text-muted whitespace-pre-wrap leading-relaxed max-w-sm">Recopilación de normas aplicables al proceso de Certificación.</td>
                  <td className="px-4 py-4 font-mono">2023-05-10</td>
                  <td className="px-4 py-4 text-right italic text-hub-text-muted">Gestión de Evaluación</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'docs' && (
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="text-[9px] font-black uppercase text-hub-text-muted tracking-[0.2em] border-b border-hub-border">
                 <th className="px-4 py-4 w-24">Código</th>
                 <th className="px-4 py-4">Nombre del Documento</th>
                 <th className="px-4 py-4 text-center">Versión</th>
                 <th className="px-4 py-4 text-right">Estado</th>
               </tr>
             </thead>
             <tbody className="text-[10px]">
               {[
                 { id: 'GCC-AN-004', name: 'Comité de Evaluación y Certificación', v: '07' },
                 { id: 'GCC-PL-001', name: 'Plantilla Modelo de Constancia', v: '04' },
                 { id: 'GCC-I-007', name: 'Instructivo de Proyectos Nacionales', v: '03' }
               ].map((doc, i) => (
                 <tr key={i} className="border-b border-hub-border/20 hover:bg-indigo-500/5 group text-hub-text transition-all">
                   <td className="px-4 py-4 font-mono font-black text-indigo-400">{doc.id}</td>
                   <td className="px-4 py-4 font-bold">{doc.name}</td>
                   <td className="px-4 py-4 text-center font-mono">v{doc.v}</td>
                   <td className="px-4 py-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase">Formalizado</span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}

        {activeTab === 'forms' && (
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="text-[9px] font-black uppercase text-hub-text-muted tracking-[0.2em] border-b border-hub-border">
                 <th className="px-4 py-4 w-24">Código</th>
                 <th className="px-4 py-4">Nombre del Formato</th>
                 <th className="px-4 py-4 text-center">Revisión</th>
                 <th className="px-4 py-4 text-right">Acción</th>
               </tr>
             </thead>
             <tbody className="text-[10px]">
               {[
                 { id: 'GCC-F-001', name: 'Cuestionario de Evaluación tipo INSTRUMENTO', d: '2022-11-11' },
                 { id: 'GCC-F-058', name: 'Lista de chequeo verificación de proyectos', d: '2023-07-14' }
               ].map((f, i) => (
                 <tr key={i} className="border-b border-hub-border/20 hover:bg-emerald-500/5 group text-hub-text">
                   <td className="px-4 py-4 font-mono font-black text-emerald-400">{f.id}</td>
                   <td className="px-4 py-4 font-bold">{f.name}</td>
                   <td className="px-4 py-4 text-center font-mono text-hub-text-muted">{f.d}</td>
                   <td className="px-4 py-4 text-right">
                      <button className="text-emerald-500 hover:text-emerald-400 transition-colors uppercase text-[9px] font-black">Descargar</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>
    </div>
  );

  const renderRiskCycle = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <div className="flex items-center gap-12 w-full max-w-4xl">
        <div className="w-24 h-[400px] bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center hover:bg-indigo-500/20 transition-all cursor-help group relative">
          <span className="text-[10px] font-black uppercase text-indigo-400 rotate-[-90deg] whitespace-nowrap tracking-widest">Comunicación y Consulta</span>
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center hover:scale-[1.02] transition-transform">
             <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Establecer el Contexto</p>
          </div>
          <div className="flex flex-col items-center py-2"><ChevronRight className="rotate-90 text-hub-text-muted" size={16} /></div>
          
          <div className="p-8 bg-slate-900/50 border border-hub-border rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <p className="text-[10px] font-black text-hub-text-muted uppercase text-center mb-6 tracking-[0.3em]">Evaluación de Riesgos</p>
            <div className="grid gap-3">
               {['Identificación', 'Análisis', 'Evaluación'].map((step, i) => (
                 <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl text-center group-hover:border-indigo-500/30 transition-all">
                    <p className="text-[11px] font-bold text-hub-text">{step} de los Riesgos</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex flex-col items-center py-2"><ChevronRight className="rotate-90 text-hub-text-muted" size={16} /></div>
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center hover:scale-[1.02] transition-transform">
             <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Tratamiento de los Riesgos</p>
          </div>
        </div>

        <div className="w-24 h-[400px] bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center hover:bg-emerald-500/20 transition-all cursor-help group relative">
          <span className="text-[10px] font-black uppercase text-emerald-400 rotate-[90deg] whitespace-nowrap tracking-widest">Monitoreo y Revisión</span>
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
        </div>
      </div>
    </div>
  );

  const renderPHVA = () => (
    <div className="flex flex-col items-center justify-center h-full p-12">
      <div className="relative w-[500px] h-[500px] flex items-center justify-center">
        {/* CENTER BOX */}
        <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-center p-4 z-20 shadow-[0_0_50px_rgba(249,115,22,0.1)]">
           <p className="text-xs font-black text-orange-400 uppercase leading-tight tracking-widest">Mejoramiento Continuo</p>
        </div>

        {/* PHVA NODES */}
        {[
          { label: 'Planear', desc: 'Causas y Acciones', color: 'indigo', pos: 'top-0 left-1/2 -translate-x-1/2' },
          { label: 'Hacer', desc: 'Planes de Acción', color: 'emerald', pos: 'right-0 top-1/2 -translate-y-1/2' },
          { label: 'Verificar', desc: 'Seguimiento', color: 'blue', pos: 'bottom-0 left-1/2 -translate-x-1/2' },
          { label: 'Actuar', desc: 'Calificación', color: 'rose', pos: 'left-0 top-1/2 -translate-y-1/2' }
        ].map((node, i) => (
          <div key={i} className={`absolute ${node.pos} w-36 h-36 rounded-full bg-slate-900 border border-hub-border flex flex-col items-center justify-center text-center p-3 hover:border-${node.color}-500 transition-all cursor-pointer group shadow-xl`}>
            <p className={`text-[11px] font-black text-${node.color}-400 uppercase mb-1`}>{node.label}</p>
            <p className="text-[8px] text-hub-text-muted font-mono leading-tight">{node.desc}</p>
            <div className={`absolute -inset-1 border border-${node.color}-500/20 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity`} />
          </div>
        ))}

        {/* ARROWS (Simplified as SVG circles) */}
        <svg className="absolute inset-0 w-full h-full -rotate-45 opacity-20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 5" />
        </svg>
      </div>
    </div>
  );

  const renderProcessOrbe = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 relative overflow-hidden">
      <div className="relative w-[700px] h-[700px] flex items-center justify-center">
        {/* OUTER RINGS */}
        <div className="absolute inset-0 rounded-full border border-white/5 flex items-center justify-center">
           <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/10 animate-[spin_120s_linear_infinite]" />
           <p className="absolute top-4 text-[10px] font-black uppercase text-hub-text-muted tracking-[1em] italic opacity-30">Direccionamiento Estratégico | Mejora Continua</p>
        </div>

        {/* MIDDLE RINGS */}
        <div className="absolute inset-[10%] rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm flex items-center justify-center">
           <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/20 animate-[spin_60s_linear_infinite_reverse]" />
           <p className="absolute -top-4 text-[9px] font-black uppercase text-emerald-400 tracking-[0.5em] bg-black px-4">Gestión de Evaluación y Control</p>
        </div>

        {/* INNER NODES (PETALS) */}
        <div className="z-10 text-center flex flex-col items-center gap-6 bg-black/90 backdrop-blur-3xl p-16 rounded-[6rem] border border-white/20 shadow-[0_0_150px_rgba(16,185,129,0.15)] group transition-all hover:border-emerald-500/50">
           <Zap size={70} className="text-emerald-500 animate-pulse group-hover:scale-110 transition-transform" />
           
           <div className="flex flex-col items-center">
              <span className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.8em] mb-4 italic">CUMPLIMIENTO GLOBAL</span>
              <p className="text-[100px] font-black text-hub-text leading-[0.8] italic tracking-tighter shadow-emerald-500/10 transition-transform group-hover:scale-105 duration-700">98<span className="text-xl not-italic opacity-40 ml-2">%</span></p>
           </div>
           
           <p className="text-[10px] font-black text-hub-text-muted uppercase tracking-[0.6em] opacity-60 mt-4">SENA / SIGA / LMS</p>
           
           <div className="flex gap-14 mt-12">
              {['MIPG', 'SGC', 'SGA', 'SST', 'SGSI'].map((tag, i) => (
                <div key={i} className="flex flex-col items-center gap-3 group/tag">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] group-hover/tag:scale-150 transition-transform" />
                   <span className="text-[10px] font-black text-hub-text tracking-widest uppercase opacity-70 group-hover/tag:opacity-100">{tag}</span>
                </div>
              ))}
           </div>
        </div>

        {/* RADIATING LINES */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
          <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.1" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.1" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans selection:bg-indigo-500/30 pb-32 flex flex-col items-center justify-start pt-12 relative overflow-x-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* HOLISTIC CIRCULAR ARC SYSTEM */}
      <div className="relative w-full h-[750px] flex items-center justify-center z-10 scale-90 md:scale-100 mt-[-20px]">
        {/* Central Hub Compliance Monitor */}
        <div className="absolute w-[400px] h-[400px] flex flex-col items-center justify-center animate-pulse-slow">
           <div className="absolute inset-0 rounded-full border border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.15)] bg-slate-950/40 backdrop-blur-3xl" />
           <div className="text-center relative z-20 group cursor-default">
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 mb-2">{t('common:gestiona.institutionalStatus')}</p>
              <h2 className="text-[115px] font-black leading-none bg-gradient-to-b from-white to-emerald-500 bg-clip-text text-transparent tracking-tighter group-hover:scale-105 transition-transform duration-700">
                98.5<span className="text-4xl text-emerald-500/50 ml-1">%</span>
              </h2>
              <div className="h-2 w-48 mx-auto bg-emerald-500/10 rounded-full mt-4 overflow-hidden border border-emerald-500/20 transition-all group-hover:w-56 group-hover:bg-emerald-500/20">
                <div className="h-full bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.8)] transition-all duration-1000" style={{ width: '98.5%' }} />
              </div>
              <p className="text-[9px] font-black text-emerald-400 group-hover:text-emerald-300 uppercase tracking-[0.4em] mt-8 italic transition-colors">
                {t('common:gestiona.compliance')}
              </p>
           </div>
        </div>
        
        {nodes.map((node, index) => {
          const isActive = activeNode === node.id;
          const totalNodes = nodes.length;
          // Calculate angle for semi-circle/arc from 180 (left) to 360/0 (right)
          // But for a more "Compromiso" feel, we can do a full arc or scattered orbe.
          // Let's do an arc from -200deg to 20deg
          const angle = ((index / (totalNodes - 1)) * 260) - 220; 
          const radius = 320; // Radius of the arc (slightly reduced for better fit)
          
          const radian = (angle * Math.PI) / 180;
          const x = Math.cos(radian) * radius;
          const y = Math.sin(radian) * radius;

          return (
            <div 
              key={node.id} 
              className="absolute flex flex-col items-center group transition-all duration-700"
              style={{ 
                transform: `translate(${x}px, ${y}px)`,
                zIndex: isActive ? 50 : 10
              }}
            >
              <button 
                onClick={() => setActiveNode(node.id)}
                className={`
                  relative flex items-center justify-center rounded-full transition-all duration-500 cursor-pointer
                  ${isActive ? 'w-32 h-32 scale-110 shadow-[0_25px_60px_rgba(41,98,255,0.35)]' : 'w-16 h-16 hover:scale-105 shadow-xl'}
                  bg-slate-900 border border-white/10 group-hover:border-white/30
                `}
                style={{ 
                  borderColor: isActive ? node.color : 'rgba(255,255,255,0.1)',
                  boxShadow: isActive ? `0 0 40px ${node.color}44` : ''
                }}
              >
                {/* Node Core Glow */}
                <div className="absolute inset-0 rounded-full opacity-10 group-hover:opacity-30 transition-opacity" 
                     style={{ backgroundColor: node.color }} />
                
                {/* Icon Container */}
                <div className={`
                  flex items-center justify-center rounded-full border border-white/10 transition-all duration-500
                  ${isActive ? 'w-20 h-20 bg-slate-950 shadow-inner' : 'w-12 h-12 bg-slate-950'}
                `} style={{ color: node.color }}>
                  {React.cloneElement(node.icon as React.ReactElement<any>, { 
                    size: isActive ? 28 : 18,
                    className: "transition-all duration-500" 
                  })}
                </div>

                {/* Selection Halo */}
                {isActive && (
                  <div className="absolute -inset-4 border border-white/10 rounded-full animate-ping opacity-20" />
                )}
              </button>

              <div className={`
                mt-4 text-center transition-all duration-500 max-w-[120px]
                ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 group-hover:opacity-40 scale-90 translate-y-2'}
              `}>
                {isActive && node.id !== 'minutes' && (
                  <h4 className="text-[9px] font-black tracking-[0.2em] text-white transition-opacity mb-1 uppercase whitespace-nowrap">{node.label}</h4>
                )}
                {isActive && (
                  <p className="text-[7px] font-mono text-slate-500 uppercase tracking-tighter leading-tight">{node.sub}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER AUDIT ALERT - GLASSMORPHISM */}
      <div className="mt-0 max-w-4xl w-full px-6 relative z-10 animate-in slide-in-from-bottom-5 duration-700">
        <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-1000" />
          
          <div className="flex items-center gap-8 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
               <Zap size={32} className="" />
            </div>
            <div>
              <h5 className="text-[13px] font-black text-white uppercase tracking-[0.3em] mb-2 leading-tight">
                {t('common:gestiona.auditAlert')}: {activeNode ? nodes.find(n => n.id === activeNode)?.label : 'Matriz Global'}
              </h5>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                {t('common:gestiona.deadline')}: <span className="text-amber-500 font-black">15 de Marzo, 2026</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => setShowWarRoom(!showWarRoom)}
              className="px-10 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[11px] tracking-[0.2em] transition-all active:scale-95 shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.4)] cursor-pointer w-full sm:w-auto"
            >
              {t('common:gestiona.warRoom')}
            </button>
            <button className="px-6 py-5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 font-black uppercase text-[11px] tracking-[0.2em] transition-all active:scale-95 border border-white/5 cursor-pointer w-full sm:w-auto">
              {activeNode === 'assets' ? 'Ver Inventario' : 'Ver Mapa'}
            </button>
          </div>
        </div>
      </div>

      {/* WAR ROOM - MULTI-MATRIX MONITOR */}
      {showWarRoom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-hub-card border border-hub-border rounded-[3rem] p-10 shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col relative">
            <button 
              onClick={() => setShowWarRoom(false)}
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all cursor-pointer bg-white/5 p-3 rounded-full border border-white/5 hover:border-white/20 group"
            >
              <Zap size={20} className="rotate-45 group-hover:scale-110 transition-transform" />
            </button>

            <div className="flex justify-between items-center mb-10 shrink-0">
              <div>
                <h3 className="text-indigo-400 font-black text-xs uppercase tracking-[0.4em] mb-2">
                  {activeNode === 'assets' ? 'Matriz de Activos (SIGA)' : 
                   (activeNode === 'safety' || activeNode === 'health' || activeNode === 'environment') ? 'Evaluación de Requisitos Legales' : 
                   (activeNode === 'minutes') ? 'Actas de Reunión' :
                   'Sala de Guerra: Rendimiento Operativo'}
                </h3>
                <p className="text-hub-text-muted text-[10px] font-mono">
                  {activeNode === 'assets' ? 'Identificación y valoración de activos de información institucional' :
                   (activeNode === 'safety' || activeNode === 'health' || activeNode === 'environment') ? 'Seguimiento de cumplimiento normativo y legal' :
                   (activeNode === 'minutes') ? 'Registro y seguimiento de acuerdos y compromisos' :
                   'Visibilidad táctica de avance y productividad diaria'}
                </p>
              </div>
              <div className="flex items-center gap-4 bg-indigo-500/10 px-6 py-2 rounded-full border border-indigo-500/20 text-indigo-400 mr-12 hover:bg-indigo-500/20 transition-colors cursor-pointer" onClick={() => setShowWarRoom(false)}>
                <Activity size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Regresar</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
              {activeNode === 'assets' ? (
                /* ASSET MATRIX TABLE */
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-hub-text-muted sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Proceso</th>
                      <th className="px-4 py-2">Nombre Activo</th>
                      <th className="px-4 py-2">Tipo</th>
                      <th className="px-4 py-2 text-center">Confid.</th>
                      <th className="px-4 py-2 text-center">Dispon.</th>
                      <th className="px-4 py-2 text-center">Integ.</th>
                      <th className="px-4 py-2 text-center">Crit.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetData.map((asset, i) => (
                      <tr key={i} className="bg-white/5 hover:bg-white/10 transition-colors group">
                        <td className="px-4 py-3 rounded-l-xl border-l border-y border-hub-border text-[10px] font-mono text-indigo-400">{asset.id}</td>
                        <td className="px-4 py-3 border-y border-hub-border text-[9px] font-black uppercase">{asset.process}</td>
                        <td className="px-4 py-3 border-y border-hub-border text-xs font-bold">{asset.name}</td>
                        <td className="px-4 py-3 border-y border-hub-border text-[9px] text-slate-500">{asset.type}</td>
                        <td className="px-4 py-3 border-y border-hub-border text-center text-[9px] font-black">{asset.conf}</td>
                        <td className="px-4 py-3 border-y border-hub-border text-center text-[9px] font-black">{asset.disp}</td>
                        <td className="px-4 py-3 border-y border-hub-border text-center text-[9px] font-black">{asset.int}</td>
                        <td className="px-4 py-3 rounded-r-xl border-r border-y border-hub-border text-center">
                           <span className={`text-[8px] font-black px-2 py-0.5 rounded ${asset.crit === 'ALTO' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                             {asset.crit}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (activeNode === 'safety' || activeNode === 'health' || activeNode === 'environment') ? (
                /* REQUIREMENT EVALUATION TABLE */
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-hub-text-muted sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
                      <th className="px-4 py-2">Tema</th>
                      <th className="px-4 py-2">Tipo</th>
                      <th className="px-4 py-2">Título de Requisito</th>
                      <th className="px-4 py-2">Aplicación</th>
                      <th className="px-4 py-2 text-right">Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requirementData.map((req, i) => (
                      <tr key={i} className="bg-white/5 hover:bg-white/10 transition-colors group">
                        <td className="px-4 py-4 rounded-l-xl border-l border-y border-hub-border text-[9px] font-black uppercase text-indigo-300">{req.theme}</td>
                        <td className="px-4 py-4 border-y border-hub-border text-[9px] italic text-slate-500">{req.type}</td>
                        <td className="px-4 py-4 border-y border-hub-border text-xs font-bold leading-tight">{req.title}</td>
                        <td className="px-4 py-4 border-y border-hub-border text-[10px] text-slate-400">{req.app}</td>
                        <td className="px-4 py-4 rounded-r-xl border-r border-y border-hub-border text-right">
                           <span className={`px-4 py-1.5 rounded-lg text-white text-[9px] font-black uppercase tracking-wider ${req.color}`}>
                             {req.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (activeNode === 'risk' || activeNode === 'security') ? (
                renderRiskCycle()
              ) : (activeNode === 'pamm' || activeNode === 'improvement') ? (
                renderPHVA()
              ) : (activeNode === 'mipg' || activeNode === 'processes') ? (
                renderProcessOrbe()
              ) : (activeNode === 'documents' || activeNode === 'oci' || activeNode === 'audit') ? (
                renderCharacterization()
              ) : (activeNode === 'minutes') ? (
                /* MINUTES / ATTENDANCE MATRIX */
                <table className="w-full text-left border-separate border-spacing-y-4">
                   <thead>
                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-hub-text-muted py-4">
                      <th className="px-6 pb-2">Tipo Reunión</th>
                      <th className="px-6 pb-2">Asunto / Cita</th>
                      <th className="px-6 pb-2">Fecha</th>
                      <th className="px-6 pb-2 text-center">Confirmación</th>
                      <th className="px-6 pb-2 text-right">Estado</th>
                    </tr>
                   </thead>
                   <tbody>
                      {[1, 2, 3].map(i => (
                        <tr key={i} className="hover:bg-white/5 transition-all group">
                          <td className="px-6 py-5 rounded-l-[1.5rem] border-y border-l border-hub-border">
                             <span className="text-[10px] font-black uppercase text-indigo-400">Comité Técnico</span>
                          </td>
                          <td className="px-6 py-5 border-y border-hub-border">
                             <p className="text-xs font-bold text-hub-text">Auditoría de Control Interno Q{i}</p>
                             <p className="text-[9px] text-hub-text-muted font-mono">Sala Virtual 0{i}</p>
                          </td>
                          <td className="px-6 py-5 border-y border-hub-border">
                             <p className="text-[10px] font-mono font-bold text-hub-text">24/03/2026</p>
                          </td>
                          <td className="px-6 py-5 border-y border-hub-border text-center">
                             <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase border border-emerald-500/20">Confirmado</span>
                          </td>
                          <td className="px-6 py-5 rounded-r-[1.5rem] border-y border-r border-hub-border text-right">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 ml-auto" />
                          </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              ) : (
                /* DEFAULT TEAM STATS */
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-hub-text-muted sticky top-0 bg-slate-900/50 backdrop-blur-md z-10 py-4">
                      <th className="px-6 pb-2">Colaborador</th>
                      <th className="px-6 pb-2">Nivel</th>
                      <th className="px-6 pb-2 text-center">Enfoque Diario</th>
                      <th className="px-6 pb-2 text-center">Estratégico</th>
                      <th className="px-6 pb-2 text-center">Pausas</th>
                      <th className="px-6 pb-2 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStats.map((member, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-all group">
                        <td className="px-6 py-5 rounded-l-[1.5rem] border-y border-l border-hub-border">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 flex items-center justify-center border border-hub-border group-hover:border-indigo-500/30 shadow-inner">
                              <span className="text-xs font-black text-indigo-300">{(member.profiles?.full_name || 'U').charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-xs font-black text-hub-text">{member.profiles?.full_name || 'Usuario'}</p>
                              <p className="text-[9px] text-hub-text-muted font-mono uppercase">{member.members?.role || 'Miembro'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 border-y border-hub-border">
                          <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${
                            member.members?.me_level === 'estrategico' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}>
                            {member.members?.me_level || 'operativo'}
                          </span>
                        </td>
                        <td className="px-6 py-5 border-y border-hub-border text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-mono font-bold text-hub-text">{formatHoursMins(member.focus_secs)}</span>
                            <div className="w-16 h-1 bg-white/5 rounded-full mt-2 overflow-hidden border border-white/5">
                              <div className="h-full bg-emerald-500" style={{ width: `${Math.min((member.focus_secs / 28800) * 100, 100)}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 border-y border-hub-border text-center">
                          <div className="flex items-center justify-center gap-2">
                            <BrainCircuit size={14} className={member.strategic_secs > 0 ? 'text-indigo-400' : 'text-slate-600'} />
                            <span className={`text-xs font-mono font-bold ${member.strategic_secs > 0 ? 'text-indigo-400' : 'text-slate-500'}`}>
                              {Math.round((member.strategic_secs / (member.focus_secs || 1)) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 border-y border-hub-border text-center">
                          <div className="flex items-center justify-center gap-2 text-hub-text-muted">
                            <Coffee size={14} />
                            <span className="text-xs font-mono">{member.pauses_count}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 rounded-r-[1.5rem] border-y border-r border-hub-border text-right">
                          <div className="flex items-center justify-end gap-2 text-hub-text">
                             <div className={`w-1.5 h-1.5 rounded-full ${member.focus_secs > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                             <span className={`text-[9px] font-black uppercase tracking-widest ${member.focus_secs > 0 ? 'text-emerald-400' : 'text-hub-text-muted'}`}>
                               {member.focus_secs > 0 ? (t('ui.connected') || 'Activo') : 'Off'}
                             </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="mt-8 p-6 bg-slate-950 border border-hub-border rounded-3xl flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <Activity size={20} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-hub-text uppercase tracking-widest italic opacity-60">Sincronizado con Motor de Pausas Activas</span>
               </div>
               <div className="text-[9px] font-mono text-hub-text-muted">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
