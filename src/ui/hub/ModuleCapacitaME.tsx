import React from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, TrendingUp, Users, ShieldCheck } from 'lucide-react';

export const ModuleCapacitaME: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#050811] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-indigo-400 font-black text-xs uppercase tracking-[0.4em] mb-2">{t('ui.neuro_training')}</h3>
              <p className="text-slate-400 text-[10px] font-mono">{t('ui.cognitive_engine')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {[
              { title: t('ui.iso_mastery'), progress: 75, icon: ShieldCheck },
              { title: t('ui.neuro_leadership'), progress: 30, icon: Users },
            ].map((course, i) => (
              <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-400/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-indigo-400/10 rounded-2xl">
                    <course.icon size={24} className="text-indigo-400" />
                  </div>
                  <span className="text-2xl font-black text-white italic">{course.progress}%</span>
                </div>
                <h4 className="text-white font-bold text-lg mb-4">{course.title}</h4>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-400/5 border border-indigo-400/10 p-8 rounded-[2.5rem]">
            <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">{t('ui.recommended_role')}</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-400/20 rounded-xl flex items-center justify-center">
                  <GraduationCap size={24} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t('ui.strategic_decision_making')}</p>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{t('ui.advanced_module')}</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-indigo-400 text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
                {t('ui.start_now')}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0f1d] border border-white/5 rounded-[3rem] p-10 shadow-xl">
          <h3 className="text-white font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <TrendingUp size={16} className="text-indigo-400"/> {t('ui.learning_analytics')}
          </h3>
          <div className="space-y-8">
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
              <p className="text-[8px] text-slate-500 uppercase font-black mb-1 tracking-widest">{t('ui.total_study_time')}</p>
              <p className="text-white font-black text-2xl mt-1">24.5h</p>
            </div>
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
              <p className="text-[8px] text-slate-500 uppercase font-black mb-1 tracking-widest">{t('ui.certificates_earned')}</p>
              <p className="text-white font-black text-2xl mt-1">3</p>
            </div>
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
              <p className="text-[8px] text-slate-500 uppercase font-black mb-1 tracking-widest">{t('ui.skill_level')}</p>
              <p className="text-indigo-400 font-black text-2xl mt-1 italic">{t('ui.expert')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
