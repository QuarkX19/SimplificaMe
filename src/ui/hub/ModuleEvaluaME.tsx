import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

export const ModuleEvaluaME: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#050811] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-amber-400 font-black text-xs uppercase tracking-[0.4em] mb-2">{t('ui.risk_audit')}</h3>
              <p className="text-slate-400 text-[10px] font-mono">{t('ui.compliance_engine')}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-4">{t('ui.critical_findings')}</h4>
            {[
              { id: 'AUD-01', finding: t('ui.missing_risk_assessment'), severity: t('ui.critical'), date: '2025-03-15' },
              { id: 'AUD-02', finding: t('ui.incomplete_training'), severity: t('ui.major'), date: '2025-03-18' },
            ].map((item) => (
              <div key={item.id} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-amber-400/30 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-2 h-12 rounded-full ${item.severity === t('ui.critical') ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-[10px] font-mono text-amber-400 mb-1">{item.id}</p>
                    <p className="text-white font-bold">{item.finding}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.date}</p>
                  <button className="mt-2 text-[#00ffff] text-[10px] font-black uppercase tracking-widest hover:underline">{t('ui.view_details')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0f1d] border border-white/5 rounded-[3rem] p-10 shadow-xl">
          <h3 className="text-white font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <ShieldCheck size={16} className="text-amber-400"/> {t('ui.risk_matrix')}
          </h3>
          <div className="grid grid-cols-3 gap-2 h-64">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`rounded-xl border border-white/5 flex items-center justify-center ${
                i === 0 ? 'bg-red-500/40' : i === 1 || i === 3 ? 'bg-red-500/20' : i === 2 || i === 4 || i === 6 ? 'bg-amber-500/20' : 'bg-emerald-500/10'
              }`}>
                {i === 0 && <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />}
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 font-bold uppercase">{t('ui.high_risks')}</span>
              <span className="text-red-500 font-black">2</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 font-bold uppercase">{t('ui.medium_risks')}</span>
              <span className="text-amber-500 font-black">5</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 font-bold uppercase">{t('ui.low_risks')}</span>
              <span className="text-emerald-500 font-black">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
