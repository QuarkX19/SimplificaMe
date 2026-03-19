import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, SupportedLang } from './index';
import { supabase } from '../services/api/supabase';

interface Props { userId?: string; style?: React.CSSProperties; }

const LS: React.FC<Props> = ({ userId, style }) => {
  const { i18n } = useTranslation();
  const current = i18n.language.slice(0, 2) as SupportedLang;

  const handleChange = async (lang: SupportedLang) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('ame_lang', lang);
    if (userId) {
      await supabase.from('company_members').update({ preferred_lang: lang }).eq('user_id', userId);
    }
  };

  return (
    <div style={{ display:'flex', gap:2, padding:4, borderRadius:12, background:'rgba(128,128,128,0.1)', border:'1px solid rgba(128,128,128,0.2)', ...style }}>
      {SUPPORTED_LANGS.map(lang => {
        const isActive = current === lang;
        return (
          <button key={lang} onClick={() => handleChange(lang)}
            style={{ padding:'4px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.15s', background:isActive?'#0088BB':'transparent', color:isActive?'#fff':'#888' }}>
            {lang.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};

export default LS;
