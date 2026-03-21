import React from 'react';
import { ShieldAlert, HeartPulse, Lock, Leaf, Award, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const NomDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden flex flex-col items-center">
      {/* Círculos decorativos de fondo similares a las maquetas previas */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-500/10 dark:bg-green-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header interno */}
      <div className="w-full flex justify-between items-center mb-16 relative z-10 bg-white/50 dark:bg-black/20 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-inner shadow-blue-400">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none text-slate-800 dark:text-white">
              TSI <span className="text-blue-600 dark:text-blue-400">Logística</span>
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-[0.3em] uppercase block mt-1">
              Safety & Security System
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-widest">Sistema Holístico</p>
          <p className="text-slate-500 dark:text-slate-500 text-[10px] font-mono mt-1">v2026.1</p>
        </div>
      </div>

      {/* Indicador General */}
      <div className="text-center relative z-10 mb-20 translate-y-8">
        <h2 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Estado de Cumplimiento NOM</h2>
        <div className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter">
          98.5<span className="text-4xl text-slate-400 font-medium ml-1">%</span>
        </div>
        <div className="w-48 h-1.5 bg-slate-300 dark:bg-slate-700 mx-auto mt-4 rounded-full overflow-hidden shadow-inner">
          <div className="bg-emerald-500 h-full w-[98.5%] rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>

      {/* Arco de Subsistemas */}
      <div className="w-full flex justify-center items-end gap-4 md:gap-8 pb-10 relative z-10 perspective-1000">
        
        {/* Nodo 1: Safety */}
        <div className="group relative flex flex-col items-center cursor-pointer transition-all duration-500 hover:-translate-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-[3px] border-white dark:border-slate-800 shadow-xl bg-orange-500 group-hover:bg-orange-400 transition-colors mb-4 relative">
             <div className="absolute inset-0 rounded-full bg-orange-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />
             <div className="text-white relative z-10 text-2xl"><i className="fa-solid fa-hard-hat"></i></div>
          </div>
          <span className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center">Safety</span>
          <span className="text-[9px] text-slate-500 font-bold italic block text-center mt-1">NOM-030-STPS</span>
        </div>

        {/* Nodo 2: Health */}
        <div className="group relative flex flex-col items-center cursor-pointer transition-all duration-500 hover:-translate-y-8">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-[3px] border-white dark:border-slate-800 shadow-xl bg-red-500 group-hover:bg-red-400 transition-colors mb-4 relative">
             <div className="absolute inset-0 rounded-full bg-red-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />
             <HeartPulse className="text-white w-8 h-8 relative z-10" />
          </div>
          <span className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center">Health</span>
          <span className="text-[9px] text-slate-500 font-bold italic block text-center mt-1">NOM-035 / Salud</span>
        </div>

        {/* Nodo 3: Security (Central / Dominante) */}
        <div className="group relative flex flex-col items-center cursor-pointer transition-all duration-500 hover:-translate-y-12">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center border-[4px] border-blue-400 shadow-[0_20px_40px_rgba(59,130,246,0.3)] bg-blue-900 group-hover:bg-blue-800 transition-colors mb-4 transform scale-110 relative z-20">
             <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity -z-10" />
             <Lock className="text-white w-10 h-10 relative z-10" />
          </div>
          <span className="block text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-[0.2em] text-center mt-3">Security</span>
          <span className="text-[10px] text-blue-600 dark:text-blue-500 font-black italic block text-center mt-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/50">OEA / C-TPAT</span>
        </div>

        {/* Nodo 4: Environment */}
        <div className="group relative flex flex-col items-center cursor-pointer transition-all duration-500 hover:-translate-y-8">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-[3px] border-white dark:border-slate-800 shadow-xl bg-green-600 group-hover:bg-emerald-500 transition-colors mb-4 relative">
             <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />
             <Leaf className="text-white w-8 h-8 relative z-10" />
          </div>
          <span className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center">Environment</span>
          <span className="text-[9px] text-slate-500 font-bold italic block text-center mt-1">NOM-161 / Med. Amb.</span>
        </div>

        {/* Nodo 5: Quality */}
        <div className="group relative flex flex-col items-center cursor-pointer transition-all duration-500 hover:-translate-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-[3px] border-white dark:border-slate-800 shadow-xl bg-slate-700 group-hover:bg-slate-600 transition-colors mb-4 relative">
             <div className="absolute inset-0 rounded-full bg-slate-400 opacity-0 group-hover:opacity-50 blur-xl transition-opacity -z-10" />
             <Award className="text-white w-8 h-8 relative z-10" />
          </div>
          <span className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center">Quality</span>
          <span className="text-[9px] text-slate-500 font-bold italic block text-center mt-1">ISO 9001:2015</span>
        </div>

      </div>

      {/* Card de Alerta / Acción Prominente */}
      <div className="w-full max-w-3xl mt-12 relative z-10">
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white dark:border-slate-700 shadow-xl rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-400/50 transition-colors">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center flex-shrink-0 shadow-inner">
              <AlertCircle size={28} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-relaxed">
                Próxima Auditoría Interna: Matriz de Riesgos
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Fecha límite para actualización de evidencias: <strong className="text-amber-600 dark:text-amber-500">15 de Marzo, 2026.</strong>
              </p>
            </div>
          </div>
          <button className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_10px_20px_-10px_rgba(37,99,235,0.8)] transition-all hover:shadow-[0_15px_30px_-10px_rgba(37,99,235,0.9)] hover:-translate-y-1 focus:ring-4 focus:ring-blue-500/30 flex-shrink-0 whitespace-nowrap">
            Gestionar Nodos
          </button>
        </div>
      </div>

    </div>
  );
};
