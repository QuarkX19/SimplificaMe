import React from 'react';
import { useTranslation } from 'react-i18next';
import { Network, Activity, ChevronRight } from 'lucide-react';
import { ProcessMap } from '../matrices/ProcessMap';
import { NomDashboard } from '../matrices/NomDashboard';
export const ModuleGestionaME: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-hub-card border border-hub-border rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-emerald-500 font-black text-xs uppercase tracking-[0.4em] mb-2">{t('ui.erp_sync')}</h3>
              <p className="text-hub-text-muted text-[10px] font-mono">{t('ui.as400_gateway')}</p>
            </div>
            <div className="flex items-center gap-3 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">{t('ui.connected')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: t('ui.sync_latency'), value: '42ms' },
              { label: t('ui.active_jobs'), value: '12' },
              { label: t('ui.last_sync'), value: '2m ago' },
            ].map((stat, i) => (
              <div key={i} className="bg-black/5 dark:bg-white/5 p-6 rounded-3xl border border-hub-border">
                <p className="text-[8px] text-hub-text-muted uppercase font-black mb-1 tracking-widest">{stat.label}</p>
                <p className="text-hub-text font-bold text-xl">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-hub-text text-[10px] font-black uppercase tracking-widest mb-4">{t('ui.tactical_queue')}</h4>
            {[
              { id: 'T-102', task: t('ui.update_inventory'), priority: t('ui.high'), status: t('ui.in_progress') },
              { id: 'T-105', task: t('ui.sync_sales'), priority: t('ui.medium'), status: t('ui.pending') },
              { id: 'T-108', task: t('ui.validate_master_data'), priority: t('ui.low'), status: t('ui.completed') },
            ].map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-hub-border hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-emerald-500">{task.id}</span>
                  <span className="text-xs text-hub-text-muted font-medium">{task.task}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${
                    task.priority === t('ui.high') ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'
                  }`}>{task.priority}</span>
                  <span className="text-[10px] text-slate-500 font-bold">{task.status}</span>
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-hub-card border border-hub-border rounded-[3rem] p-10 shadow-xl">
          <h3 className="text-hub-text font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <Network size={16} className="text-emerald-500"/> {t('ui.system_health')}
          </h3>
          <div className="space-y-8">
            <div className="relative h-40 w-full bg-black/5 dark:bg-black/40 rounded-3xl border border-hub-border p-6 flex items-center justify-center">
              <div className="text-center">
                <Activity size={48} className="text-emerald-500 mx-auto mb-4 opacity-20" />
                <p className="text-[10px] text-hub-text-muted font-bold uppercase tracking-widest">{t('ui.real_time_traffic')}</p>
                <p className="text-hub-text font-black text-2xl mt-1">98.4%</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-hub-text-muted font-bold uppercase">{t('ui.cpu_load')}</span>
                <span className="text-[10px] text-hub-text font-mono">12%</span>
              </div>
              <div className="h-1 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[12%]" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-hub-text-muted font-bold uppercase">{t('ui.memory_usage')}</span>
                <span className="text-[10px] text-hub-text font-mono">2.4GB</span>
              </div>
              <div className="h-1 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[45%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa de Procesos Transpuesto */}
      <div className="mt-8">
        <ProcessMap />
      </div>

      {/* Sistema Integrado de Gestión (NOM / ISO) */}
      <div className="mt-8">
        <NomDashboard />
      </div>
    </div>
  );
};
