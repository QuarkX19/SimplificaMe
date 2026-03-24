import React, { useState, useEffect } from 'react';
import { Coffee, Play, Square, CheckCircle2, RotateCcw, Eye, Hand, MoveIcon, BellRing, BrainCircuit, Zap, BarChart2, Activity, Users } from 'lucide-react';
import { syncProductivityLog } from '../../services/productivity';

const BREAKS = [
  { id: 'eyes', title: 'Regla 20-20-20', desc: 'Mira a 20 pies (6m) por 20 segundos', duration: 20, icon: <Eye size={18} /> },
  { id: 'neck', title: 'Cuello & Hombros', desc: 'Rotación lenta e inclinación lateral', duration: 180, icon: <RotateCcw size={18} /> },
  { id: 'hands', title: 'Manos & Muñecas', desc: 'Abrir y cerrar puños, estirar palmas', duration: 120, icon: <Hand size={18} /> },
  { id: 'stretch', title: 'Espalda & Piernas', desc: 'Levántate, estira la espalda e inhala', duration: 300, icon: <MoveIcon size={18} /> },
];

export const FloatingBreaks: React.FC<{ userLevel?: string | null, companyId?: string, userId?: string }> = ({ userLevel, companyId, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pauses' | 'metrics'>('pauses');
  
  // Break Execution State
  const [activeBreak, setActiveBreak] = useState<string | null>(null);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Auto-Pilot State
  const [autoMode, setAutoMode] = useState<'pomodoro' | 'visual' | null>(null);
  const [workTimeLeft, setWorkTimeLeft] = useState(0);
  const [isWorkActive, setIsWorkActive] = useState(false);
  const [breakDue, setBreakDue] = useState(false);
  const [isStrategic, setIsStrategic] = useState(false);

  // Productivity Metrics State (Daily Session)
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('auron_productivity_stats');
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return {
      focusTimeSecs: 0,
      strategicTimeSecs: 0,
      pausesCompleted: 0,
      cyclesFinished: 0,
      workDayStart: null as string | null,
      workDayEnd: null as string | null
    };
  });

  useEffect(() => {
    localStorage.setItem('auron_productivity_stats', JSON.stringify(stats));
    
    // DB sync with debounce
    if (userId && companyId) {
      const timeout = setTimeout(async () => {
        await syncProductivityLog({
          user_id: userId,
          company_id: companyId,
          log_day: new Date().toISOString().split('T')[0],
          start_time: stats.workDayStart,
          end_time: stats.workDayEnd,
          focus_secs: stats.focusTimeSecs,
          strategic_secs: stats.strategic_secs || 0,
          pauses_count: stats.pausesCompleted,
          cycles_count: stats.cyclesFinished
        });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [stats, userId, companyId]);

  // 1. Break Execution Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreakActive && breakTimeLeft > 0) {
      interval = setInterval(() => setBreakTimeLeft(prev => prev - 1), 1000);
    } else if (breakTimeLeft === 0 && isBreakActive) {
      setIsBreakActive(false);
      setCompleted(true);
      setStats((s: any) => ({ ...s, pausesCompleted: s.pausesCompleted + 1 }));
      playChime();
      if (autoMode) {
        startWorkPhase(autoMode);
      }
    }
    return () => clearInterval(interval);
  }, [isBreakActive, breakTimeLeft, autoMode]);

  // 2. Work Phase Timer + Productivity Tracker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkActive && workTimeLeft > 0) {
      interval = setInterval(() => {
        setWorkTimeLeft((prev: number) => prev - 1);
        setStats((s: any) => ({ 
          ...s, 
          focusTimeSecs: s.focusTimeSecs + 1,
          strategicTimeSecs: isStrategic ? (s.strategicTimeSecs || 0) + 1 : (s.strategicTimeSecs || 0)
        }));
      }, 1000);
    } else if (workTimeLeft === 0 && isWorkActive) {
      setIsWorkActive(false);
      setStats((s: any) => ({ ...s, cyclesFinished: s.cyclesFinished + 1 }));
      triggerBreakDue();
    }
    return () => clearInterval(interval);
  }, [isWorkActive, workTimeLeft]);

  // Window listener for dock expansion
  useEffect(() => {
    const handleExpand = (e: any) => { if (e.detail !== 'breaks') setIsOpen(false); };
    window.addEventListener('neuro-dock-expand', handleExpand);
    return () => window.removeEventListener('neuro-dock-expand', handleExpand);
  }, []);

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.50, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 1);
        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 1.5);
      }, 300);
      
    } catch (e) {
      console.warn('Audio bloqueado o no soportado', e);
    }
  };

  const triggerBreakDue = () => {
    setActiveTab('pauses');
    setBreakDue(true);
    playChime();
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'breaks' }));
      setIsOpen(true);
    }
  };

  const startWorkPhase = (mode: 'pomodoro' | 'visual') => {
    setAutoMode(mode);
    setBreakDue(false);
    setCompleted(false);
    
    // Pomodoro = 25 mins (1500s), Visual = 20 mins (1200s)
    const time = mode === 'pomodoro' ? 1500 : 1200;
    setWorkTimeLeft(time);
    setIsWorkActive(true);
  };

  const stopAutoPilot = () => {
    setAutoMode(null);
    setIsWorkActive(false);
    setWorkTimeLeft(0);
    setBreakDue(false);
  };

  const toggleOpen = () => {
    if (!isOpen) window.dispatchEvent(new CustomEvent('neuro-dock-expand', { detail: 'breaks' }));
    setIsOpen(!isOpen);
    if (!isOpen && completed) setCompleted(false);
    if (!isOpen && breakDue) setBreakDue(false); // acknowledge the due
  };

  const startBreak = (duration: number, id: string) => {
    setActiveBreak(id);
    setBreakTimeLeft(duration);
    setIsBreakActive(true);
    setCompleted(false);
    setBreakDue(false);
  };

  const forceStopBreak = () => {
    setIsBreakActive(false);
    setBreakTimeLeft(0);
    setActiveBreak(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartWorkDay = () => {
    setStats((prev: any) => ({ 
      ...prev, 
      workDayStart: new Date().toISOString(),
      workDayEnd: null 
    }));
  };

  const handleEndWorkDay = () => {
    setStats((prev: any) => ({ 
      ...prev, 
      workDayEnd: new Date().toISOString() 
    }));
    stopAutoPilot();
  };

  const calculateWorkDayDuration = () => {
    if (!stats.workDayStart) return 0;
    const start = new Date(stats.workDayStart).getTime();
    const end = stats.workDayEnd ? new Date(stats.workDayEnd).getTime() : new Date().getTime();
    return Math.floor((end - start) / 1000);
  };

  const formatHoursMins = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const currentDef = BREAKS.find(b => b.id === activeBreak);

  return (
    <div className="relative z-50">
      {isOpen && (
        <div className="absolute bottom-[115%] left-1/2 w-80 md:w-[380px] -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 max-h-[580px] h-[550px]">
          
          <div className="p-5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 flex flex-col gap-4 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex justify-center items-center relative z-10 transition-colors ${breakDue ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse' : 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
                <Coffee size={24} />
              </div>
              <div className="relative z-10 flex-1">
                <h3 className="text-base font-black uppercase tracking-[0.1em] text-emerald-400">Pausas Activas</h3>
                <p className="text-[10px] text-emerald-200/60 font-bold tracking-widest uppercase">Motor Ergonómico</p>
              </div>
              {isWorkActive && (
                <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-black shadow-inner flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  {formatTime(workTimeLeft)}
                </div>
              )}
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex border border-emerald-500/30 rounded-xl p-1 bg-slate-950/50 relative z-10">
              <button 
                onClick={() => setActiveTab('pauses')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'pauses' ? 'bg-emerald-500/20 text-emerald-400 shadow-inner' : 'text-slate-500 hover:text-emerald-300'}`}
              >
                <Activity size={14} /> Rutinas
              </button>
              <button 
                onClick={() => setActiveTab('metrics')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'metrics' ? 'bg-cyan-500/20 text-cyan-400 shadow-inner' : 'text-slate-500 hover:text-cyan-300'}`}
              >
                <BarChart2 size={14} /> Productividad
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin flex flex-col">
            
            {activeTab === 'pauses' && (
              <div className="space-y-4 flex-1 flex flex-col">
                {/* AUTOPILOT Premium Actions */}
                {!isBreakActive && !breakDue && !completed && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in mb-2">
                    {isWorkActive ? (
                      <button onClick={stopAutoPilot} className="col-span-2 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all font-bold uppercase text-[11px] tracking-widest cursor-pointer group shadow-inner">
                        <Square size={14} className="group-hover:scale-110 transition-transform" /> Detener Ciclo
                      </button>
                    ) : (
                      <>
                        <button onClick={() => startWorkPhase('pomodoro')} className="flex flex-col items-center justify-center rounded-2xl bg-cyan-950/40 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/50 text-cyan-400 transition-all p-3 cursor-pointer group shadow-inner relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <BrainCircuit size={20} className="mb-1 group-hover:scale-110 transition-transform relative z-10" />
                          <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Pomodoro</span>
                          <span className="text-[9px] opacity-70 mt-0.5 relative z-10">Enfoque 25m</span>
                        </button>
                        <button onClick={() => startWorkPhase('visual')} className="flex flex-col items-center justify-center rounded-2xl bg-teal-950/40 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-500/50 text-teal-400 transition-all p-3 cursor-pointer group shadow-inner relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Eye size={20} className="mb-1 group-hover:scale-110 transition-transform relative z-10" />
                          <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Regla 20x20</span>
                          <span className="text-[9px] opacity-70 mt-0.5 relative z-10">Visión 20m</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* STRATEGIC MODE TOGGLE */}
                {!isBreakActive && isWorkActive && (
                  <div className={`mb-4 p-3 rounded-2xl border flex items-center justify-between animate-in fade-in slide-in-from-top-1 transition-all ${userLevel === 'estrategico' ? 'bg-indigo-500/20 border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-indigo-500/10 border-indigo-500/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isStrategic ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                        <BrainCircuit size={16} />
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${userLevel === 'estrategico' ? 'text-indigo-300' : 'text-indigo-400'}`}>
                          Modo Estratégico {userLevel === 'estrategico' && '✨'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium italic">
                          {userLevel === 'estrategico' ? 'Como Líder, mide tu tiempo de alto valor' : 'Contabilizando valor gerencial'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsStrategic(!isStrategic)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${isStrategic ? (userLevel === 'estrategico' ? 'bg-indigo-400' : 'bg-indigo-500') : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isStrategic ? 'left-7 shadow-sm' : 'left-1'}`}></div>
                    </button>
                  </div>
                )}

                {/* BREAK DUE ALERT */}
                {breakDue && !isBreakActive && (
                  <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/40 text-center animate-in zoom-in slide-in-from-bottom-2 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative overflow-hidden my-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse">
                      <BellRing size={24} className="animate-bounce" />
                    </div>
                    <h4 className="text-base font-black text-rose-400 uppercase tracking-widest mb-2">¡Tiempo de Pausa!</h4>
                    <p className="text-xs text-rose-200/80 mb-2 px-2 leading-relaxed font-medium">Tu ciclo de enfoque ha terminado. Selecciona una pausa de la lista para estirar y relajar la mente antes de continuar.</p>
                  </div>
                )}

                {/* BREAK EXECUTION */}
                {isBreakActive && currentDef ? (
                  <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 mt-4">
                    <div className="w-40 h-40 rounded-full border-[5px] border-emerald-500/20 flex items-center justify-center relative mb-8">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle 
                          cx="50%" cy="50%" r="46%" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round"
                          strokeDasharray="290" strokeDashoffset={290 - (290 * (1 - breakTimeLeft/currentDef.duration))} 
                          className="transition-all duration-1000 linear"
                        />
                      </svg>
                      <span className="text-5xl font-black text-white relative z-10 font-mono drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        {formatTime(breakTimeLeft)}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-emerald-300 mb-3 tracking-wide">{currentDef.title}</h4>
                    <p className="text-sm text-center text-slate-300 max-w-[85%] mb-10 leading-relaxed font-medium">{currentDef.desc}</p>
                    <button onClick={forceStopBreak} className="flex items-center gap-2 px-6 py-3.5 bg-red-500/10 text-red-400 border border-red-500/50 rounded-xl hover:bg-red-500/20 transition-all active:scale-95 text-xs font-black uppercase tracking-widest cursor-pointer shadow-inner hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                      <Square size={16} fill="currentColor" /> Cancelar Pausa
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in mt-2 flex-col flex">
                    <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-slate-800/50 rounded-lg w-auto self-start border border-slate-700">
                      <Zap size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ejecución Manual</span>
                    </div>
                    {BREAKS.map(b => (
                      <button key={b.id} onClick={() => startBreak(b.duration, b.id)}
                        className={`w-full p-4 rounded-2xl bg-slate-800/50 border transition-all flex items-center justify-between group text-left cursor-pointer hover:-translate-y-0.5
                          ${breakDue ? 'border-rose-500/40 hover:border-rose-400 hover:bg-rose-500/10 shadow-[0_4px_20px_rgba(244,63,94,0.15)] bg-slate-900' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_5px_15px_rgba(16,185,129,0.15)]'}
                        `}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-slate-900 border border-transparent shadow-inner flex items-center justify-center transition-colors
                            ${breakDue ? 'group-hover:bg-rose-500/20 group-hover:border-rose-500/30 group-hover:text-rose-400 text-slate-400' : 'group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 group-hover:text-emerald-400 text-slate-400'}`}>
                            {b.icon}
                          </div>
                          <div>
                            <h4 className={`text-sm font-black tracking-wide transition-colors ${breakDue ? 'text-slate-200 group-hover:text-rose-300' : 'text-slate-200 group-hover:text-emerald-300'}`}>{b.title}</h4>
                            <p className="text-xs font-semibold opacity-80 text-emerald-200/50 mt-0.5">{b.duration < 60 ? `${b.duration} seg` : `${b.duration/60} min`} recomendados</p>
                          </div>
                        </div>
                        <Play size={20} className={`transition-all transform group-hover:translate-x-1 ${breakDue ? 'text-rose-500/50 group-hover:text-rose-400' : 'text-slate-600 group-hover:text-emerald-400'}`} />
                      </button>
                    ))}
                  </div>
                )}
                
                {!isBreakActive && completed && !breakDue && (
                  <div className="mt-2 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-4 text-emerald-300 animate-in slide-in-from-bottom-2 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/40">
                      <CheckCircle2 size={24} className="text-emerald-400" />
                    </div>
                    <div className="text-sm">
                      <p className="font-black uppercase tracking-widest text-[11px] mb-1">¡Pausa Lograda!</p>
                      <p className="text-emerald-200/80 text-xs leading-relaxed font-medium">El ciclo ha sido registrado con éxito. Sigue así y cuida tu ergonomía.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="space-y-4 animate-in slide-in-from-right-2">
                <div className="p-5 rounded-3xl bg-cyan-950/20 border border-cyan-500/30 flex items-center gap-4 shadow-[0_5px_20px_rgba(6,182,212,0.1)] relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl pointer-events-none"></div>
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 shadow-inner">
                    <BrainCircuit size={28} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-cyan-400 font-mono tracking-tight">{formatHoursMins(stats.focusTimeSecs)}</h4>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-cyan-200/70">Tiempo Productivo Hoy</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col items-center justify-center text-center shadow-inner">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                      <Coffee size={16} />
                    </div>
                    <h4 className="text-xl font-black text-slate-200">{stats.pausesCompleted}</h4>
                    <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mt-1">Pausas Logradas</p>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col items-center justify-center text-center shadow-inner">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                      <Activity size={16} />
                    </div>
                    <h4 className="text-xl font-black text-slate-200">{stats.cyclesFinished}</h4>
                    <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mt-1">Ciclos de Enfoque</p>
                  </div>
                </div>

                {/* WORK DAY CONTROL */}
                <div className="p-4 rounded-2xl bg-slate-800/30 border border-dashed border-slate-700 flex flex-col gap-3">
                  {!stats.workDayStart ? (
                    <button onClick={handleStartWorkDay} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition-all shadow-[0_5px_15px_rgba(16,185,129,0.3)] cursor-pointer">
                      <Zap size={16} fill="black" /> Comenzar Jornada
                    </button>
                  ) : !stats.workDayEnd ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-2 mb-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Jornada en Curso</span>
                        <span className="text-[10px] text-emerald-400 font-mono">{new Date(stats.workDayStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <button onClick={handleEndWorkDay} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-black uppercase tracking-widest text-[11px] hover:bg-rose-500/30 transition-all cursor-pointer">
                        <Square size={14} fill="currentColor" /> Finalizar Jornada
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-2">
                      <div className="flex items-center justify-between w-full px-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Jornada Finalizada</span>
                        <span className="text-[10px] text-rose-400 font-mono">{new Date(stats.workDayEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <button onClick={handleStartWorkDay} className="text-[10px] text-slate-500 hover:text-emerald-400 underline underline-offset-4 font-bold uppercase tracking-widest mt-1 transition-colors cursor-pointer">
                        Reiniciar Jornada
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/50 mt-4">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Registro de Productividad</h4>
                  <table className="w-full text-left text-xs text-slate-300 border-separate border-spacing-y-2">
                    <thead>
                      <tr>
                        <th className="pb-1 text-slate-500 font-medium border-b border-slate-800">Métrica</th>
                        <th className="pb-1 text-slate-500 font-medium border-b border-slate-800 text-right">Valor</th>
                        <th className="pb-1 text-slate-500 font-medium border-b border-slate-800 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-slate-800/30">
                        <td className="py-2 px-2 rounded-l-lg font-bold text-[11px] tracking-wide">Foco total</td>
                        <td className="py-2 text-right font-mono text-cyan-400">{formatHoursMins(stats.focusTimeSecs)}</td>
                        <td className="py-2 px-2 rounded-r-lg text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${stats.focusTimeSecs > 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                            {stats.focusTimeSecs > 0 ? 'Activo' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-slate-800/30">
                        <td className="py-2 px-2 rounded-l-lg font-bold text-[11px] tracking-wide">Estrategia</td>
                        <td className="py-2 text-right font-mono text-indigo-400">{formatHoursMins(stats.strategicTimeSecs || 0)}</td>
                        <td className="py-2 px-2 rounded-r-lg text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${stats.strategicTimeSecs > 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                            {Math.round(((stats.strategicTimeSecs || 0) / (stats.focusTimeSecs || 1)) * 100)}%
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-slate-800/30">
                        <td className="py-2 px-2 rounded-l-lg font-bold text-[11px] tracking-wide">Relación Pausas</td>
                        <td className="py-2 text-right font-mono text-emerald-400">{stats.pausesCompleted} / {stats.cyclesFinished || 1}</td>
                        <td className="py-2 px-2 rounded-r-lg text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${stats.pausesCompleted >= stats.cyclesFinished && stats.cyclesFinished > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-500'}`}>
                            {stats.pausesCompleted >= stats.cyclesFinished && stats.cyclesFinished > 0 ? 'Saludable' : 'Riesgo'}
                          </span>
                        </td>
                      </tr>
                      {stats.workDayStart && (
                        <tr className="bg-slate-800/30">
                          <td className="py-2 px-2 rounded-l-lg font-bold text-[11px] tracking-wide">Tiempo Total Log</td>
                          <td className="py-2 text-right font-mono text-slate-300">{formatHoursMins(calculateWorkDayDuration())}</td>
                          <td className="py-2 px-2 rounded-r-lg text-right text-[10px] text-slate-500 font-mono">
                            {new Date(stats.workDayStart).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} 
                            {stats.workDayEnd ? ` - ${new Date(stats.workDayEnd).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : ' ...'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <p className="text-[10px] text-slate-500 mt-4 leading-relaxed tracking-wide text-center uppercase">
                    Datos almacenados de la sesión actual
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* THE DOCK WIDGET BUTTON - ACTION PREMIUM */}
      <button 
        onClick={toggleOpen}
        className="h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 group relative overflow-hidden"
        style={{ 
          background: breakDue ? '#E11D48' : isOpen ? '#0F172A' : (isWorkActive ? '#064E3B' : '#10B981'), 
          border: `1px solid ${isOpen ? 'rgba(16,185,129,0.3)' : breakDue ? 'rgba(244,63,94,0.5)' : (isWorkActive ? 'rgba(16,185,129,0.5)' : 'rgba(0,0,0,0)')}`,
          boxShadow: breakDue ? '0 10px 40px rgba(244,63,94,0.6)' : isOpen ? '0 10px 30px rgba(0,0,0,0.5)' : isWorkActive ? '0 5px 20px rgba(16,185,129,0.3)' : '0 10px 25px rgba(16,185,129,0.25)',
          padding: isWorkActive && !isOpen ? '0 16px' : '0 12px',
          animation: breakDue && !isOpen ? 'pulse 1.3s infinite ease-in-out' : 'none'
        }}
        title="Motor de Pausas Activas"
      >
        <div className="flex items-center gap-2">
          {breakDue && !isOpen ? (
            <div className="relative">
              <BellRing size={20} className="text-white relative z-10" />
              <div className="absolute inset-0 bg-white blur-sm rounded-full opacity-50"></div>
            </div>
          ) : (
            <Coffee size={20} className={isOpen ? 'text-emerald-400' : (isWorkActive ? 'text-emerald-400' : 'text-black')} />
          )}
          {isWorkActive && !isOpen && !breakDue && (
            <span className="text-emerald-400 font-black font-mono tracking-tight text-sm translate-y-px">
              {formatTime(workTimeLeft)}
            </span>
          )}
        </div>
      </button>

    </div>
  );
};
