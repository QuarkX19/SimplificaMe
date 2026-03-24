import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, SupportedLang } from './index';
import { supabase } from '../services/api/supabase';
import { Globe } from 'lucide-react';

interface Props { userId?: string; className?: string; }

const LanguageSwitcher: React.FC<Props> = ({ userId, className }) => {
  const { i18n } = useTranslation();
  const current = i18n.language.slice(0, 2) as SupportedLang;

  const handleChange = async (lang: SupportedLang) => {
    if (current === lang) return;
    await i18n.changeLanguage(lang);
    localStorage.setItem('ame_lang', lang);
    if (userId) {
      await supabase.from('company_members').update({ preferred_lang: lang }).eq('user_id', userId);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 p-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 ${className}`}>
      <Globe size={14} className="text-white/20 ml-1.5 mr-1" />
      <div className="flex gap-1">
        {SUPPORTED_LANGS.map(lang => {
          const isActive = current === lang;
          return (
            <button 
              key={lang} 
              onClick={() => handleChange(lang)}
              className={`
                px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                ${isActive 
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              {lang}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
