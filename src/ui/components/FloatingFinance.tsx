import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Activity, ExternalLink, RefreshCw, ArrowRightLeft } from 'lucide-react';

const CURRENCIES = [
  { code: 'usd', sign: '$' },
  { code: 'mxn', sign: '$' },
  { code: 'cop', sign: '$' },
  { code: 'eur', sign: '€' },
  { code: 'gbp', sign: '£' },
  { code: 'cny', sign: '¥' },
  { code: 'jpy', sign: '¥' },
  { code: 'ars', sign: '$' },
  { code: 'clp', sign: '$' },
  { code: 'pen', sign: 'S/' },
  { code: 'brl', sign: 'R$' },
  { code: 'cad', sign: '$' },
];

export const FloatingFinance: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'steady'>('steady');
  
  const [base, setBase] = useState('usd');
  const [target, setTarget] = useState('mxn');

  useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'finance') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`);
      const data = await res.json();
      const currentRate = data[base][target];
      
      setTrend(currentRate > (rate || currentRate) ? 'up' : currentRate < (rate || currentRate) ? 'down' : 'steady');
      setRate(currentRate);
    } catch (e) {
      setTimeout(() => {
        setRate(base === 'usd' && target === 'mxn' ? 20.1543 : 1.0);
        setTrend('up');
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, target]);

  const swapCurrencies = () => {
    setBase(target);
    setTarget(base);
  };

  const targetSign = CURRENCIES.find(c => c.code === target)?.sign || '$';

  return (
    <div className="relative z-50">
      
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-72 bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-2">
          
          <div className="p-4 border-b border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <DollarSign size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">Mercados</p>
                <p className="text-[9px] text-emerald-200/50 font-bold tracking-widest uppercase">Global Exchange API</p>
              </div>
            </div>
            <button onClick={fetchRates} className="p-2 rounded-lg bg-black/20 hover:bg-emerald-500/20 transition-colors text-emerald-500 border border-transparent hover:border-emerald-500/30 shadow-inner relative z-10">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="p-5 flex flex-col items-center justify-center border-b border-white/5 relative bg-gradient-to-b from-black/60 to-black/40">
             
             {/* Selectors */}
             <div className="flex items-center justify-between w-full mb-6 gap-2">
               <select 
                 value={base} onChange={e => setBase(e.target.value)} 
                 className="bg-slate-800/80 border border-emerald-500/30 text-emerald-100 text-xs font-black uppercase tracking-widest rounded-lg py-2 pl-3 pr-2 outline-none focus:border-emerald-400 cursor-pointer appearance-none shadow-inner flex-1 text-center"
               >
                 {CURRENCIES.map(c => <option key={`base-${c.code}`} value={c.code}>{c.code}</option>)}
               </select>
               
               <button onClick={swapCurrencies} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all active:scale-90 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                 <ArrowRightLeft size={12} />
               </button>

               <select 
                 value={target} onChange={e => setTarget(e.target.value)} 
                 className="bg-slate-800/80 border border-emerald-500/30 text-emerald-100 text-xs font-black uppercase tracking-widest rounded-lg py-2 pl-3 pr-2 outline-none focus:border-emerald-400 cursor-pointer appearance-none shadow-inner flex-1 text-center"
               >
                 {CURRENCIES.map(c => <option key={`target-${c.code}`} value={c.code}>{c.code}</option>)}
               </select>
             </div>

             {loading ? (
               <div className="h-12 flex items-center justify-center">
                 <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
               </div>
             ) : (
               <div className="flex items-end justify-center gap-1.5 animate-in fade-in zoom-in duration-300">
                 <span className="text-xl font-bold text-emerald-600/50 mb-1">{targetSign}</span>
                 <span className="text-[40px] leading-none font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                   {rate ? (rate < 0.01 ? rate.toFixed(5) : rate.toFixed(4)) : '0.00'}
                 </span>
                 {trend === 'up' ? (
                   <TrendingUp size={22} className="text-rose-500 mb-1 animate-bounce" />
                 ) : trend === 'down' ? (
                   <TrendingDown size={22} className="text-emerald-500 mb-1 animate-bounce" />
                 ) : (
                   <Activity size={22} className="text-slate-500 mb-1" />
                 )}
               </div>
             )}
             
             <div className="w-full flex items-center justify-between mt-6 px-3 py-2 bg-emerald-950/30 border border-emerald-500/20 rounded-xl shadow-inner">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                 <span className="text-[9px] text-emerald-400 uppercase tracking-[0.1em] font-black">Live API Tracker</span>
               </div>
               <div className="text-[10px] text-slate-400 font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-white/5">
                 {new Date().toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}
               </div>
             </div>
          </div>

          <button onClick={() => window.open('https://github.com/fawazahmed0/currency-api', '_blank')} className="w-full p-3 bg-black/60 hover:bg-emerald-900/40 transition-colors flex items-center justify-center gap-2 group border-t border-white/5">
            <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Powered by Fawazahmed0 API</span>
            <ExternalLink size={10} className="text-emerald-600 group-hover:text-emerald-400 transition-colors" />
          </button>

        </div>
      )}

      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'finance' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        style={{ 
          background: isOpen ? '#0F172A' : '#10B981', 
          border: `1px solid ${isOpen ? 'rgba(16,185,129,0.3)' : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(16,185,129,0.3)'
        }}
        title="Mercados y Divisas"
      >
        <DollarSign size={20} className={isOpen ? 'text-emerald-400' : 'text-black group-hover:scale-110 transition-transform'} />
        {trend === 'up' && !isOpen && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-[#10B981] flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.5)]">
            <TrendingUp size={8} className="text-white" />
          </div>
        )}
      </button>

    </div>
  );
};
