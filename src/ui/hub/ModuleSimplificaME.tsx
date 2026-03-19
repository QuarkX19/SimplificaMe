import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Globe, RefreshCw, TrendingUp, AlertCircle, BarChart3, BrainCircuit } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { AuditoriaData, InsightMessage, LayerStatus, LayerNodeProps } from './hub.types';

const LayerNode: React.FC<LayerNodeProps> = ({ title, status, value }) => (
  <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem] hover:border-[#00ffff]/30 transition-all group relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#00ffff22] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <p className="text-[8px] text-slate-500 uppercase font-black mb-1 tracking-widest">{title}</p>
    <p className="text-white font-bold text-lg">{value}</p>
    <div className={`mt-4 h-1 w-12 rounded-full ${
      status === LayerStatus.OK ? 'bg-[#28a745] shadow-[0_0_8px_#28a745]' : 
      status === LayerStatus.ALERT ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 
      'bg-red-500 shadow-[0_0_8px_#ef4444]'
    }`} />
  </div>
);

const NeuroConnector = () => (
  <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent -z-10" />
);

interface ModuleSimplificaMEProps {
  onEnterWorkspace: () => void;
  langToggle: () => void;
}

export const ModuleSimplificaME: React.FC<ModuleSimplificaMEProps> = ({ onEnterWorkspace, langToggle }) => {
  const { t } = useTranslation();
  
  const [auditoriaGlobal] = useState<AuditoriaData>({
    cumplimiento: 68,
    proyeccion: "RIESGO_MODERADO",
    alertas: ["Brecha en margen de contribución", "Retraso en entregable Web"]
  });

  const [insights, setInsights] = useState<InsightMessage[]>([
    { role: 'auron', text: 'Sincronización de Base de Datos AFSE completada. Analizando nodos tácticos...', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  const performanceData = [
    { name: 'S1', value: 45 }, { name: 'S2', value: 52 },
    { name: 'S3', value: 48 }, { name: 'S4', value: 61 }, { name: 'S5', value: 68 },
  ];

  const handleSync = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      setInsights(prev => [
        ...prev, 
        { role: 'auron', text: 'Auditoría Predictiva generada con éxito. Listo para Entorno Estratégico.', timestamp: new Date().toLocaleTimeString() }
      ]);
      setIsSyncing(false);
    }, 1500);
  }, []);

  useEffect(() => {
    handleSync();
  }, [handleSync]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      
      {/* BOTÓN ENTRAR AL ENTORNO ESTRATÉGICO (Punto de acceso vital) */}
      <div className="flex justify-end">
        <button onClick={onEnterWorkspace}
          className="group relative px-8 py-4 bg-[#00ffff]/10 border border-[#00ffff]/30 rounded-2xl flex items-center gap-4 hover:bg-[#00ffff]/20 hover:scale-[1.02] transition-all overflow-hidden shadow-[0_0_30px_#00ffff15]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ffff]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <BrainCircuit className="text-[#00ffff]" />
          <div className="text-left">
            <span className="block text-[#00ffff] font-black uppercase tracking-widest text-sm">INGRESAR AL ENTORNO ESTRATÉGICO</span>
            <span className="block text-slate-400 font-bold tracking-widest text-[9px] uppercase">Ejecutar Capas AFSE x Auron</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#050811] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Zap size={240} className="text-[#00ffff]" />
          </div>
          
          <div className="flex justify-between items-start mb-8 z-10 relative">
            <div>
              <h3 className="text-[#00ffff] font-black text-xs uppercase tracking-[0.4em] mb-2">{t('ui.predictive_audit')}</h3>
              <p className="text-slate-400 text-[10px] font-mono">{t('ui.neuro_engine')}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={langToggle} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors group">
                <Globe size={18} className="text-white/40 group-hover:text-white" />
              </button>
              <button onClick={handleSync} disabled={isSyncing} className="p-3 bg-white/5 rounded-full hover:bg-[#00ffff]/10 transition-colors group disabled:opacity-50">
                <RefreshCw size={18} className={`text-white/40 group-hover:text-[#00ffff] ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex items-end gap-8 mb-10 z-10 relative">
            <div>
              <p className="text-8xl font-black text-white italic tracking-tighter leading-none">
                {auditoriaGlobal.cumplimiento}<span className="text-4xl not-italic ml-1 text-[#00ffff]">%</span>
              </p>
            </div>
            <div className="pb-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('ui.current_compliance')}</p>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp size={14} className="text-[#28a745]" />
                <p className="text-[#28a745] text-xs font-black italic">{t('ui.vs_last_month')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 z-10 relative">
            <div className="space-y-6">
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-[#00ffff] shadow-[0_0_15px_#00ffff]" style={{ width: `${auditoriaGlobal.cumplimiento}%` }} />
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>{t('ui.baseline_alpha')}</span>
                <span className="text-white">{t('ui.optimum_delta')}</span>
              </div>
            </div>
            <div className="h-32 w-full">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00ffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#00ffff" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0a0f1d] to-black border border-[#00ffff]/20 rounded-[3rem] p-10 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#00ffff]/5 blur-[80px] rounded-full group-hover:bg-[#00ffff]/10 transition-all duration-700"></div>
          
          <div className="flex justify-between items-center z-10">
            <span className="text-[9px] text-[#00ffff] font-black uppercase tracking-widest bg-[#00ffff]/10 px-4 py-1.5 rounded-full border border-[#00ffff]/20">{t('ui.status_ia')}</span>
            <div className="w-2 h-2 rounded-full bg-[#00ffff] shadow-[0_0_10px_#00ffff] animate-pulse"></div>
          </div>

          <div className="mt-8 z-10">
            <p className="text-white text-2xl font-black italic uppercase leading-tight mb-4">
              {t('ui.projection')} <br/>
              <span className="text-[#ef4444] text-3xl">{t('ui.out_of_target')}</span>
            </p>
            
            <div className="space-y-3">
              {auditoriaGlobal.alertas.map((alerta, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <AlertCircle size={14} className="text-[#ef4444]" />
                  <span className="text-[10px] text-slate-300 font-medium">{alerta}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-black/40 p-4 rounded-2xl border border-white/5">
              <span className="text-[#00ffff] text-[10px] font-mono font-bold block mb-1">{t('ui.auron_log')}:</span>
              <p className="text-slate-400 text-[10px] leading-relaxed font-mono">
                {insights[insights.length - 1]?.text}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#050811] border border-white/5 rounded-[3rem] p-10 shadow-2xl relative">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-3">
            <BarChart3 size={16} className="text-[#00ffff]"/> {t('ui.strategic_flow')}
          </h3>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#28a745]"></div>
                <span className="text-[8px] text-slate-500 font-bold uppercase">{t('ui.optimal')}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-[8px] text-slate-500 font-bold uppercase">{t('ui.warning')}</span>
             </div>
          </div>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NeuroConnector />
          <LayerNode title={t('ui.layer_l1')} status={LayerStatus.OK} value={t('ui.iso_context')} />
          <LayerNode title={t('ui.layer_l2')} status={LayerStatus.ALERT} value={t('ui.gap_analysis_val')} />
          <LayerNode title={t('ui.layer_l3')} status={LayerStatus.OK} value={t('ui.mission_vision')} />
          <LayerNode title={t('ui.layer_l4')} status={LayerStatus.OK} value={t('ui.bsc_map')} />
          <LayerNode title={t('ui.layer_l5')} status={LayerStatus.ALERT} value={t('ui.cmi_risks')} />
          <LayerNode title={t('ui.layer_l6')} status={LayerStatus.OK} value={t('ui.okrs_agile')} />
          <LayerNode title={t('ui.layer_l7')} status={LayerStatus.OK} value={t('ui.real_time_sync')} />
          <LayerNode title={t('ui.layer_l8')} status={LayerStatus.OK} value={t('ui.pdca_cycle')} />
        </div>
      </div>
    </div>
  );
};
