import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/api/supabase';
import { ShieldCheck, ArrowRight, Building, User as UserIcon, Mail, CheckCircle, Zap } from 'lucide-react';

const DARK_T = {
  bg: '#030509',
  bg2: 'rgba(11, 15, 25, 0.7)',
  border: 'rgba(36, 61, 90, 0.6)',
  cyan: '#00E5FF',
  cyanGlow: 'rgba(0, 229, 255, 0.15)',
  text: '#F1F5F9',
  textDim: '#94A3B8'
};

const SignupScreen: React.FC<{ initialPlan: string; onBackToLogin: () => void }> = ({ initialPlan, onBackToLogin }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [plan, setPlan] = useState(initialPlan || 'esencial');
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const plans = {
    esencial: { name: 'Plan Esencial', price: 79 },
    estrategico: { name: 'Plan Estratégico', price: 179 },
    directivo: { name: 'Plan Directivo', price: 349 },
    transporte: { name: 'Plan Transporte', price: 249 }
  };

  useEffect(() => {
    setMounted(true);
    if (initialPlan && ['esencial', 'estrategico', 'directivo', 'transporte'].includes(initialPlan)) {
      setPlan(initialPlan);
    }
  }, [initialPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !company) { setError('Todos los campos son obligatorios'); return; }
    setError(''); setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { full_name: name, company_name: company, requested_plan: plan }
        }
      });
      if (signUpError) throw signUpError;

      // Delay artificial para que el usuario aprecie el estado de carga que es "visualemnete fuera de serie"
      setTimeout(() => {
        setStep('payment');
        setLoading(false);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error al procesar el registro');
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{ background: DARK_T.bg, color: DARK_T.text }}>

      {/* ─── BACKGROUND FX (Glassmorphism & Orbs) ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Grilla técnica y tecnológica */}
        <div className="absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: `linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}></div>
        {/* Orbe Flotante 1 (Estratégico) */}
        <div className="absolute top-1/4 -left-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-[flowOrb_15s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #003087 0%, transparent 70%)' }}></div>
        {/* Orbe Flotante 2 (Tech) */}
        <div className="absolute bottom-1/4 -right-[15%] w-[45vw] h-[45vw] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-[flowOrb2_20s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)' }}></div>
      </div>

      {/* ─── MAIN CARD CON BORDE NEÓN ─── */}
      <div className="relative z-10 w-full max-w-[440px] p-[1px] rounded-[32px] overflow-hidden group">
        {/* Borde Animado Rotativo */}
        <div className="absolute inset-[-50%] animate-[spin_4s_linear_infinite]" style={{
          background: `conic-gradient(transparent, transparent 60%, ${DARK_T.cyan}, #003087, transparent 80%)`
        }}></div>

        {/* Interior de la Tarjeta */}
        <div className="relative rounded-[31px] p-10 w-full backdrop-blur-3xl shadow-2xl" style={{ background: DARK_T.bg2, boxShadow: `0 30px 80px -20px rgba(0,229,255,0.15)`, border: `1px solid rgba(255,255,255,0.03)` }}>

          <div className="text-center mb-10 transform transition-transform hover:scale-105 duration-500">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#003087] to-cyan-400 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(0,229,255,0.4)] ring-1 ring-cyan-200/30">
              <ShieldCheck size={36} color="white" className="drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight font-['Bebas_Neue']" style={{ textShadow: '0 4px 20px rgba(0,229,255,0.5)' }}>
              Arquitectura <span style={{ color: DARK_T.cyan }}>ME</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] mt-2 opacity-80" style={{ color: DARK_T.cyan }}>
              Ecosistema Estratégico
            </p>
          </div>

          <div className="transition-all duration-500 relative">
            {step === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
                {/* Visual del Plan Elegido */}
                <div className="relative p-[1px] rounded-2xl overflow-hidden bg-white/5 group-hover:bg-white/10 transition-colors">
                  <div className="relative bg-black/40 rounded-2xl p-4 flex justify-between items-center backdrop-blur-md">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 mb-1">Plan Preseleccionado</p>
                      <p className="text-sm font-medium text-white">{(plans as any)[plan]?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Inversión (mes)</p>
                      <p className="text-sm font-black text-cyan-400 font-['JetBrains_Mono']">${(plans as any)[plan]?.price}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group/input">
                    <Building className="absolute left-4 top-[14px] text-gray-500 group-focus-within/input:text-cyan-400 transition-colors duration-300" size={18} />
                    <input type="text" placeholder="Nombre Oficial de tu Empresa" value={company} onChange={e => setCompany(e.target.value)} required
                      className="w-full bg-black/30 border border-gray-800 rounded-xl p-3 pl-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 shadow-inner" />
                  </div>
                  <div className="relative group/input">
                    <UserIcon className="absolute left-4 top-[14px] text-gray-500 group-focus-within/input:text-cyan-400 transition-colors duration-300" size={18} />
                    <input type="text" placeholder="Nombre del Director/CEO" value={name} onChange={e => setName(e.target.value)} required
                      className="w-full bg-black/30 border border-gray-800 rounded-xl p-3 pl-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 shadow-inner" />
                  </div>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-[14px] text-gray-500 group-focus-within/input:text-cyan-400 transition-colors duration-300" size={18} />
                    <input type="email" placeholder="Correo Electrónico Corporativo" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full bg-black/30 border border-gray-800 rounded-xl p-3 pl-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-600 shadow-inner" />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-xs text-center flex items-center justify-center gap-2 animate-[shake_0.5s_ease-out]">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full relative overflow-hidden group/btn rounded-xl">
                  {/* Fondo Btn */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-[#003087] transition-transform duration-500 group-hover/btn:scale-[1.05]"></div>
                  {/* Flash/Glow */}
                  <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 skew-x-[45deg] transition-all duration-700 group-hover/btn:left-[200%]"></div>

                  <div className="relative py-4 flex items-center justify-center gap-3">
                    <span className="text-white font-black uppercase tracking-[0.2em] text-[13px] drop-shadow-md">
                      {loading ? 'Sintetizando...' : 'Generar Mi Entorno'}
                    </span>
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <ArrowRight size={18} className="text-white group-hover/btn:translate-x-1 transition-transform" />
                    )}
                  </div>
                </button>

                <div className="pt-2 text-center">
                  <button type="button" onClick={onBackToLogin} className="text-[11px] uppercase tracking-widest font-bold text-gray-500 hover:text-cyan-400 transition-colors">
                    ¿Ya eres miembro? Iniciar Sesión →
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center animate-[fadeInUp_0.5s_ease-out] pb-2">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-900/40 border-[1.5px] border-green-500/50 flex items-center justify-center mb-8 relative shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-green-500"></div>
                  <CheckCircle size={48} className="text-green-400 drop-shadow-lg" />
                </div>

                <h2 className="text-2xl font-black uppercase tracking-wider mb-2 text-green-400 font-['Bebas_Neue']" style={{ textShadow: '0 2px 15px rgba(34,197,94,0.4)' }}>
                  Arquitectura Generada
                </h2>
                <p className="text-xs text-gray-400 mb-8 leading-relaxed font-medium">
                  Tus credenciales y entorno están listos.<br />
                  Hemos enviado la llave de acceso a:<br />
                  <span className="text-white bg-black/50 px-3 py-1 rounded-md mt-2 inline-block border border-gray-700">{email}</span>
                </p>

                <div className="bg-gradient-to-b from-[#0A0E18] to-black border border-amber-500/30 rounded-2xl p-6 text-left mb-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-amber-500" />
                    <p className="text-[11px] font-black uppercase tracking-widest text-amber-500">Sincronización de Pago</p>
                  </div>

                  <p className="text-xs text-gray-300 font-medium leading-relaxed mb-4">
                    Para desbloquear tu matriz (Plan {(plans as any)[plan]?.name}), realiza el abono correspondiente a nuestra cuenta corporativa oficial:
                  </p>

                  <div className="bg-black/60 p-4 rounded-xl border border-gray-800 font-['JetBrains_Mono'] text-xs text-cyan-500 space-y-2 mb-4 shadow-inner">
                    <div className="flex justify-between"><span className="text-gray-500">Entidad:</span> <span className="text-white">Bancolombia</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cuenta:</span> <span className="text-white">Ahorros 239-00000-11</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Titular:</span> <span className="text-white">calidadysostenibilidad SAS</span></div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-800"><span className="text-gray-500">Monto:</span> <span className="text-cyan-400 font-bold">${(plans as any)[plan]?.price} USD (o TRM)</span></div>
                  </div>

                  <p className="text-[10px] text-gray-500 italic">Al confirmar el ingreso de fondos, tu entorno se habilitará instantáneamente.</p>
                </div>

                <button onClick={onBackToLogin} className="w-full group/btn relative overflow-hidden py-3 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors">
                  <div className="absolute inset-0 bg-cyan-900/0 group-hover/btn:bg-cyan-900/20 transition-colors"></div>
                  <span className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover/btn:text-cyan-400 transition-colors">
                    Ir a la compuerta de acceso
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── KEYFRAMES PARA CUSTOM CSS ─── */}
      <style>{`
        @keyframes flowOrb { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(10vw, -10vh) scale(1.1); } }
        @keyframes flowOrb2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-10vw, 10vh) scale(1.2); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); filter: blur(5px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}</style>
    </div>
  );
};

export default SignupScreen;
