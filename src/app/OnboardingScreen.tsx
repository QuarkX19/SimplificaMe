import React, { useState } from 'react';
import { ShieldCheck, Building, FileText, Briefcase, ArrowRight, Zap, AlertCircle, Globe, TrendingUp, Package } from 'lucide-react';
import { createCompany } from '../services/company';
import { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

interface Props {
  user: User;
  onComplete: () => void;
}

const T = {
  bg: '#030509',
  bg2: 'rgba(11, 15, 25, 0.7)',
  cyan: '#00E5FF',
};

export const OnboardingScreen: React.FC<Props> = ({ user, onComplete }) => {
  const { t } = useTranslation('common');
  const [name, setName] = useState('');
  const [nit, setNit] = useState('');
  const [sector, setSector] = useState('');
  const [country, setCountry] = useState('');
  const [stage, setStage] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError(t('onboarding.errName')); return; }
    
    setLoading(true); setError('');
    
    try {
      const company = await createCompany(user.id, { 
        name: name.trim(), 
        nit: nit.trim(), 
        sector: sector.trim(),
        country: country.trim(),
        stage: stage.trim(),
        portfolio: portfolio.trim()
      });
      
      if (!company) throw new Error('No se pudo crear el entorno de la empresa.');
      
      // Artificial delay para mostrar la magia a nivel UI
      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (err: any) {
      setError(err.message || t('onboarding.errGeneric'));
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" 
         style={{ background: T.bg, color: '#F1F5F9' }}>

      {/* BACKGROUND FX */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.1]" style={{
          backgroundImage: `linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}></div>
        <div className="absolute top-1/4 -right-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-20" 
             style={{ background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-[460px] p-[1px] rounded-[32px] overflow-hidden group animate-in fade-in zoom-in duration-700">
        <div className="absolute inset-[-50%] animate-[spin_5s_linear_infinite]" style={{
          background: `conic-gradient(transparent, transparent 70%, ${T.cyan}, #003087, transparent 90%)`
        }}></div>

        <div className="relative rounded-[31px] p-10 w-full backdrop-blur-3xl shadow-2xl" 
             style={{ background: T.bg2, boxShadow: `0 30px 80px -20px rgba(0,229,255,0.1)`, border: `1px solid rgba(255,255,255,0.02)` }}>

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#003087] to-cyan-500 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(0,229,255,0.3)] ring-1 ring-cyan-200/20">
              <Zap size={32} color="white" className="drop-shadow-md" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight font-['Bebas_Neue']" style={{ textShadow: '0 4px 15px rgba(0,229,255,0.4)', color: 'white' }}>
              {t('onboarding.title')} <span style={{ color: T.cyan }}>{t('onboarding.titleAccent')}</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mt-3 text-cyan-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('onboarding.subtitle') }} />
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            
            <div className="relative group/input">
              <Building className="absolute left-4 top-[14px] text-gray-500 group-focus-within/input:text-cyan-400 transition-colors duration-300" size={18} />
              <input type="text" placeholder={t('onboarding.phName')} value={name} onChange={e => setName(e.target.value)} required
                className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 pl-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 shadow-inner" />
            </div>

            <div className="relative group/input">
              <FileText className="absolute left-4 top-[14px] text-gray-500 group-focus-within/input:text-cyan-400 transition-colors duration-300" size={18} />
              <input type="text" placeholder={t('onboarding.phNit')} value={nit} onChange={e => setNit(e.target.value)}
                className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 pl-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 shadow-inner" />
            </div>

            <div className="relative group/input">
              <Briefcase className="absolute left-4 top-[14px] text-gray-500 group-focus-within/input:text-cyan-400 transition-colors duration-300" size={18} />
              <input type="text" placeholder={t('onboarding.phSector')} value={sector} onChange={e => setSector(e.target.value)} required
                className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 pl-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 shadow-inner" />
            </div>

            <div className="relative group/input">
              <Globe className="absolute left-4 top-[14px] text-gray-500 group-focus-within/input:text-cyan-400 pointer-events-none transition-colors duration-300" size={18} />
              <select value={country} onChange={e => setCountry(e.target.value)} required
                className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 pl-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer">
                <option value="" disabled className="text-gray-500">Selecciona el País de Operación</option>
                <option value="Colombia" className="bg-slate-900">Colombia</option>
                <option value="México" className="bg-slate-900">México</option>
                <option value="España" className="bg-slate-900">España</option>
                <option value="Perú" className="bg-slate-900">Perú</option>
                <option value="Chile" className="bg-slate-900">Chile</option>
                <option value="Argentina" className="bg-slate-900">Argentina</option>
                <option value="Ecuador" className="bg-slate-900">Ecuador</option>
                <option value="Otro" className="bg-slate-900">Otro</option>
              </select>
            </div>

            <div className="relative group/input">
              <TrendingUp className="absolute left-4 top-[14px] text-gray-500 group-focus-within/input:text-cyan-400 pointer-events-none transition-colors duration-300" size={18} />
              <select value={stage} onChange={e => setStage(e.target.value)} required
                className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 pl-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer">
                <option value="" disabled className="text-gray-500">¿En qué etapa de madurez o calidad están?</option>
                <option value="Idea / Startup (Desde Cero)" className="bg-slate-900">Idea / Startup (Desde Cero)</option>
                <option value="Operando (Falta orden)" className="bg-slate-900">Operando (Falta Orden y Procesos)</option>
                <option value="Fortalecimiento (Certificación)" className="bg-slate-900">Fortalecimiento / Búsqueda de Certificación</option>
                <option value="Expansión (Alta Madurez)" className="bg-slate-900">Expansión (Alta Madurez y Excelencia)</option>
              </select>
            </div>

            <div className="relative group/input h-[90px]">
              <Package className="absolute left-4 top-[14px] text-gray-500 group-focus-within/input:text-cyan-400 transition-colors duration-300" size={18} />
              <textarea placeholder="Ingresa un breve resumen del portafolio o servicios aquí..." value={portfolio} onChange={e => setPortfolio(e.target.value)} rows={3} required
                className="w-full h-full bg-black/40 border border-gray-800 rounded-xl p-3 pl-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-500 shadow-inner resize-none scrollbar-thin" />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-xs text-center flex items-center justify-center gap-2 animate-[shake_0.5s_ease-out]">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full relative overflow-hidden group/btn rounded-xl mt-4">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-[#003087] transition-transform duration-500 group-hover/btn:scale-[1.05]"></div>
              <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 skew-x-[45deg] transition-all duration-700 group-hover/btn:left-[200%]"></div>

              <div className="relative py-4 flex items-center justify-center gap-3">
                <span className="text-white font-black uppercase tracking-[0.2em] text-[13px] drop-shadow-md">
                  {loading ? t('onboarding.btnLoading') : t('onboarding.btnSubmit')}
                </span>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <ShieldCheck size={18} className="text-white group-hover/btn:scale-110 transition-transform" />
                )}
              </div>
            </button>

          </form>
        </div>
      </div>
      
    </div>
  );
};
