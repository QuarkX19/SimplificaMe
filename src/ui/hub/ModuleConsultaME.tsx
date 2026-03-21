import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { CMIDashboard } from '../matrices/CMIDashboard';

export const ModuleConsultaME: React.FC = () => {
  const { t } = useTranslation();

  const performanceData = [
    { name: 'S1', value: 45 }, { name: 'S2', value: 52 },
    { name: 'S3', value: 48 }, { name: 'S4', value: 61 }, { name: 'S5', value: 68 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#050811] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-rose-400 font-black text-xs uppercase tracking-[0.4em] mb-2">{t('ui.bi_reports')}</h3>
              <p className="text-slate-400 text-[10px] font-mono">{t('ui.insight_engine')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
              <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest">{t('ui.revenue_forecast')}</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <Area type="monotone" dataKey="value" stroke="#fb7185" fill="#fb718522" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
              <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest">{t('ui.operational_efficiency')}</h4>
              <div className="flex items-center justify-center h-48">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-white/5" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-rose-400" strokeDasharray="82, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-black text-xl italic">82%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0f1d] border border-white/5 rounded-[3rem] p-10 shadow-xl">
          <h3 className="text-white font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <BarChart3 size={16} className="text-rose-400"/> {t('ui.key_indicators')}
          </h3>
          <div className="space-y-6">
            {[
              { label: t('ui.market_share'), value: '14.2%', change: '+1.2%' },
              { label: t('ui.customer_satisfaction'), value: '4.8/5', change: '+0.1' },
              { label: t('ui.nps'), value: '72', change: '+5' },
            ].map((indicator, i) => (
              <div key={i} className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[8px] text-slate-500 uppercase font-black mb-1 tracking-widest">{indicator.label}</p>
                <div className="flex justify-between items-end">
                  <p className="text-white font-black text-xl">{indicator.value}</p>
                  <p className="text-emerald-400 text-[10px] font-bold italic">{indicator.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CMI Dashboard Transpuesto */}
      <div className="mt-8">
        <CMIDashboard />
      </div>
    </div>
  );
};
