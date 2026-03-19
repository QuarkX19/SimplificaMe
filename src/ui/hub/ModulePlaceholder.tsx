import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid } from 'lucide-react';

interface Props {
  name: string;
}

export const ModulePlaceholder: React.FC<Props> = ({ name }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in slide-in-from-bottom-10 duration-700">
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
        <LayoutGrid size={40} className="text-slate-500" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{name}</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          {t('ui.coming_soon')}
        </p>
      </div>
      <button className="px-8 py-3 bg-[#00ffff] text-black font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,255,255,0.4)]">
        {t('common.upgrade')}
      </button>
    </div>
  );
};
