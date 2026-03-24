import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/api/supabase';
import { ShieldCheck, ArrowRight, Building, User as UserIcon, Mail, CheckCircle, Zap, AlertCircle } from 'lucide-react';

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
  const [legalAccepted, setLegalAccepted] = useState(false);

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
    if (!legalAccepted) { setError('Debes firmar digitalmente aceptando la Política de Privacidad y Términos.'); return; }
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
            
            <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-3 bg-cyan-900/20 py-3 px-5 rounded-2xl border border-cyan-500/20 backdrop-blur-md mx-auto w-max max-w-full hover:bg-cyan-900/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-900 to-cyan-500/20 flex flex-shrink-0 items-center justify-center border border-cyan-400/40 shadow-[0_0_20px_rgba(0,229,255,0.3)] relative">
                <div className="absolute inset-0 rounded-full border border-cyan-300/30 animate-[spin_3s_linear_infinite]" style={{ borderStyle: 'dashed' }}></div>
                <span className="text-cyan-400 font-black text-sm relative z-10">A</span>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em] leading-tight">Auron Copilot</p>
                <p className="text-[13px] text-white font-medium italic mt-0.5" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  "Construyes a la medida, pero nunca estás solo."
                </p>
              </div>
            </div>
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

                <div className="flex items-start gap-3 px-1">
                  <input type="checkbox" id="legal" checked={legalAccepted} onChange={(e) => setLegalAccepted(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-600 bg-black/50 text-cyan-500 focus:ring-cyan-500 cursor-pointer" />
                  <label htmlFor="legal" className="text-[10px] text-gray-400 leading-tight cursor-pointer">
                    Declaro que he leído y acepto los <a href="#" className="font-bold text-cyan-400 hover:text-cyan-300">Términos de Servicio (SLA)</a> empresariales y la <a href="#" className="font-bold text-cyan-400 hover:text-cyan-300">Política de Privacidad y Manejo de Datos (GDPR)</a>. Comprendo la limitación de responsabilidad respecto a la Inteligencia Artificial.
                  </label>
                </div>

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

                <div className="bg-gradient-to-b from-[#0A0E18] to-black border border-cyan-500/30 rounded-2xl p-6 text-left mb-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-900/40 flex items-center justify-center">
                      <Zap size={16} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white">Suscripción Inteligente</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Checkout Pro encriptado</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 font-medium leading-relaxed mb-6">
                    Tu plan corporativo <span className="text-white font-bold">{(plans as any)[plan]?.name}</span> requiere activación. Al ingresar tu método de pago, el entorno entrará en operación autónoma.
                  </p>

                  <button 
                    onClick={async () => {
                      // Simulación de UX / Instrucción para el CEO
                      try {
                        // 1. Aquí llamamos a la Edge Function de Supabase que conectará con Mercado Pago:
                        // const { data, error } = await supabase.functions.invoke('mercadopago-checkout', { body: { plan_id: plan, email }});
                        // 2. Si es exitoso, redireccionamos a la pantalla de Checkout:
                        // if (data?.init_point) window.location.href = data.init_point;
                        
                        // Fallback temporal para mostrar alerta:
                        alert("¡Atención Producción! 🛠️\n\nDespliega la función 'mercadopago-checkout' en tu dashboard de Supabase y configúrale tu ACCESS_TOKEN de Mercado Pago para procesar los cobros reales y automatizar la redirección.");
                      } catch (err) {
                        alert("Error de conexión con la red de pagos.");
                      }
                    }}
                    className="w-full relative overflow-hidden group/pay py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(90deg, #009EE3 0%, #0076D4 100%)' }}>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/pay:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <span className="text-white font-black uppercase tracking-widest text-sm drop-shadow-md">
                        Pagar con Mercado Pago
                      </span>
                    </div>
                  </button>
                  <p className="text-[10px] text-gray-500 text-center mt-4">Transacción procesada bajo el estándar PCI-DSS.</p>
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
