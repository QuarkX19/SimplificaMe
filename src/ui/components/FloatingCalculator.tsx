import React, { useState, useEffect } from 'react';
import { Calculator, Delete, History, X } from 'lucide-react';

export const FloatingCalculator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'calc') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  const handleInput = (val: string) => {
    if (display === '0' && val !== '.') setDisplay(val);
    else setDisplay(display + val);
  };

  const calculate = () => {
    try {
      // Basic safe eval for calculator
      const result = new Function('return ' + display)();
      const equation = `${display} = ${result}`;
      setDisplay(String(result));
      setHistory(prev => [equation, ...prev].slice(0, 10)); // keep last 10
    } catch {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1500);
    }
  };

  const handleAction = (action: string) => {
    switch(action) {
      case 'C': setDisplay('0'); break;
      case 'DEL': setDisplay(display.length > 1 ? display.slice(0, -1) : '0'); break;
      case '=': calculate(); break;
      default: handleInput(action);
    }
  };

  const buttons = [
    'C', 'DEL', '%', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '00', '.', '='
  ];

  return (
    <div className="relative z-50">
      
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-64 bg-slate-900/90 backdrop-blur-2xl border border-indigo-500/20 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-2">
          
          <div className="p-3 border-b border-indigo-500/10 bg-indigo-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Calculator size={12} className="text-indigo-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Neuro-Grid</p>
            </div>
            <button onClick={() => setShowHistory(!showHistory)} className="text-slate-400 hover:text-indigo-400 transition-colors p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <History size={12} />
            </button>
          </div>

          <div className="relative">
            {/* Display */}
            <div className="p-4 bg-black/50 text-right h-24 flex flex-col justify-end border-b border-white/5">
              <p className="text-3xl font-mono font-bold text-white tracking-wider break-all drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                {display}
              </p>
            </div>

            {/* History Overlay */}
            {showHistory && (
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-10 p-4 flex flex-col animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                  <span className="text-[10px] uppercase font-black text-indigo-400 tracking-widest">Cinta de Historial</span>
                  <button onClick={() => setShowHistory(false)}><X size={14} className="text-slate-400 hover:text-white" /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {history.map((h, i) => (
                    <div key={i} className="text-xs font-mono text-slate-300 text-right opacity-90">{h}</div>
                  ))}
                  {history.length === 0 && <p className="text-[9px] text-slate-500 text-center mt-6 uppercase tracking-widest font-bold">Historial Vacío</p>}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 grid grid-cols-4 gap-2 bg-slate-900/80">
            {buttons.map(btn => {
              const isOperator = ['/', '*', '-', '+', '=', '%'].includes(btn);
              const isAction = ['C', 'DEL'].includes(btn);
              return (
                <button
                  key={btn}
                  onClick={() => handleAction(btn === '*' ? '*' : btn)}
                  className={`h-11 rounded-xl text-sm font-mono flex items-center justify-center transition-all active:scale-95 shadow-inner
                    ${isOperator ? 'bg-indigo-500 border border-indigo-400 text-white font-black hover:bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 
                      isAction ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-[10px] font-black tracking-widest' : 
                      'bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 font-medium'}
                  `}
                >
                  {btn === 'DEL' ? <Delete size={14} /> : btn}
                </button>
              );
            })}
          </div>

        </div>
      )}

      <button 
        onClick={() => {
          if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'calc' }));
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        style={{ 
          background: isOpen ? '#0F172A' : '#6366F1', 
          border: `1px solid ${isOpen ? 'rgba(99,102,241,0.3)' : 'rgba(0,0,0,0)'}`,
          boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(99,102,241,0.3)'
        }}
        title="Calculadora Neuro-Grid"
      >
        <Calculator size={20} className={isOpen ? 'text-indigo-400' : 'text-black group-hover:scale-110 transition-transform'} />
      </button>

    </div>
  );
};
