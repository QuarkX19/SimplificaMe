import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Play, 
  Search, 
  TrendingUp, 
  Bell, 
  ChevronRight, 
  ShieldCheck, 
  Award, 
  Scale, 
  Shield, 
  BookOpen,
  BrainCircuit,
  Calendar as CalendarIcon,
  X 
} from 'lucide-react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrainingCalendar } from '../components/TrainingCalendar';
import { StudentSettings } from '../components/StudentSettings';

interface ModuleCapacitaMEProps {
  userLevel?: string;
  companyName?: string;
}

export const ModuleCapacitaME: React.FC<ModuleCapacitaMEProps> = ({ userLevel = 'estrategico', companyName }) => {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = React.useState(false);
  
  const isDirector = userLevel === 'estrategico';

  const radarData = [
    { subject: 'Estrategia', A: 120, fullMark: 154 },
    { subject: 'Gobernanza', A: 98, fullMark: 154 },
    { subject: 'Operación', A: 86, fullMark: 154 },
    { subject: 'Sostenibilidad', A: 99, fullMark: 154 },
    { subject: 'Cultura', A: 85, fullMark: 154 },
  ];

  const lessons = [
    { 
      id: 1, 
      title: 'Interpretación de NOM-035-STPS', 
      desc: 'Identificación y prevención de factores de riesgo psicosocial en los centros de trabajo.',
      progress: 75, 
      category: 'Seguridad',
      color: '#10B981', // Emerald
      icon: Shield,
      duration: '5h 30m'
    },
    { 
      id: 2, 
      title: 'Sistema de Gestión ISO 9001:2015', 
      desc: 'Implementación y auditoría interna de sistemas de gestión de calidad técnica.',
      progress: 32, 
      category: 'Calidad',
      color: '#3B82F6', // Blue
      icon: Award,
      duration: '15h'
    },
    { 
      id: 3, 
      title: 'Integración de Comisión NOM-019', 
      desc: 'Constitución y funcionamiento de comisiones de seguridad e higiene industrial.',
      progress: 15, 
      category: 'Normativa',
      color: '#F59E0B', // Amber
      icon: Scale,
      duration: '4h 45m'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex animate-in fade-in duration-1000 font-sans selection:bg-emerald-500/30">
      
      <StudentSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* SIDEBAR NAVIGATION (Dark CION Style) */}
      <aside className="w-72 bg-black/60 backdrop-blur-3xl border-r border-white/10 flex flex-col hidden lg:flex sticky top-0 h-screen overflow-hidden">
        <div className="p-8 border-b border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="flex items-center gap-3 text-white font-black uppercase tracking-[0.4em] text-[10px] mb-2 relative z-10 italic">
             <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <ShieldCheck size={16} />
             </div>
             CapacitaME
          </div>
          <div className="text-[9px] text-emerald-500/50 font-bold uppercase tracking-widest relative z-10 ml-11">Socio Estratégico · CION</div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="px-4 py-2 text-[9px] font-black text-emerald-900 uppercase tracking-[0.3em]">Navegación Táctica</p>
          {[
            { label: 'Certificaciones', icon: Award, active: true },
            { label: 'Normativas', icon: BookOpen },
            { label: 'Cronograma', icon: CalendarIcon },
            { label: 'Auditorías', icon: ShieldCheck },
            { label: 'Analítica Hub', icon: TrendingUp },
          ].map((item, i) => (
            <button key={item.label} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 group ${
              item.active 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                : 'text-emerald-950 hover:text-emerald-400 hover:bg-white/5'
            }`}>
              <item.icon size={18} className={item.active ? 'text-emerald-500' : 'text-emerald-900 group-hover:text-emerald-400 transition-colors'} />
              {item.label}
              {item.active && <div className="ml-auto w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 pt-10">
           <div className="bg-emerald-950/20 backdrop-blur-md rounded-[2.5rem] p-6 border border-emerald-500/10 relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <p className="text-[8px] font-black text-emerald-900 uppercase tracking-widest mb-3">Asistente Auron</p>
              <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-emerald-400 hover:bg-emerald-500/10 transition-all uppercase tracking-widest">
                 Consultar IA
              </button>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]">
        
        {/* TOP BAR */}
        <div className="h-20 bg-black/60 backdrop-blur-3xl border-b border-white/10 px-10 flex items-center justify-between sticky top-0 z-40 transition-all">
          <div className="flex items-center gap-4 text-emerald-900">
             <span className="text-[10px] font-black uppercase tracking-widest">Global</span>
             <ChevronRight size={12} strokeWidth={3} />
             <span className="text-[10px] font-black text-white uppercase tracking-widest italic tracking-tighter">Normativa <span className="text-emerald-500">PRO</span></span>
          </div>

          <div className="flex items-center gap-8">
             <div className="relative group cursor-pointer">
                <Bell size={18} className="text-emerald-900 group-hover:text-emerald-500 transition-colors" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
             </div>
             <div className="h-10 w-[1px] bg-white/10" />
             <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setShowSettings(true)}>
                <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-black text-white leading-tight uppercase tracking-tight italic">LR Sarmiento</p>
                   <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">{isDirector ? 'Master Admin' : 'Auditor Líder'}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/20 flex items-center justify-center text-emerald-500 font-black text-sm shadow-2xl group-hover:border-emerald-500/60 transition-all">
                   {isDirector ? 'S' : 'E'}
                </div>
             </div>
          </div>
        </div>

        <div className="p-16 max-w-7xl mx-auto relative z-10">
          {/* HEADER SECTION (Dark CION) */}
          <div className="mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 group/header">
            <div className="max-w-2xl relative">
               <div className="absolute -left-8 top-0 bottom-0 w-1 bg-emerald-500/20 rounded-full" />
               <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tighter leading-[0.9] mb-6 uppercase">
                  Gestión de <br />
                  <span className="text-emerald-500 italic">Cumplimiento</span>
               </h1>
               <p className="text-emerald-400/50 text-xs xl:text-sm font-bold uppercase tracking-[0.2em] max-w-md">
                 Trazabilidad técnica bajo estándares NOM e ISO.
               </p>
            </div>
            
            <div className="flex-shrink-0">
               <div className="bg-black border border-white/10 rounded-3xl p-6 xl:p-8 shadow-2xl flex items-center gap-6 relative overflow-hidden group/badge">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/30 group-hover/badge:scale-110 transition-transform duration-700 shadow-lg">
                     <ShieldCheck size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-emerald-900 uppercase tracking-[0.4em] mb-1 italic">Compliance Hub</p>
                     <div className="flex items-baseline gap-1">
                        <span className="text-3xl xl:text-4xl font-black text-white italic tracking-tighter">92</span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">.8%</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* COURSE LIST (Dark CION Style) */}
           <div className="grid grid-cols-1 gap-12">
            <div className="flex items-center justify-between px-8 py-5 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
               <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
                  <h3 className="text-[11px] font-black text-emerald-500/50 uppercase tracking-[0.5em]">Estándares e Indicadores de Cumplimiento</h3>
               </div>
               <div className="flex items-center gap-4">
                  <div className="bg-black border border-white/20 rounded-2xl flex items-center px-6 py-3 gap-4 text-emerald-400 text-xs transition-all focus-within:border-emerald-500/50 shadow-inner">
                     <Search size={16} className="text-emerald-900" />
                     <input type="text" placeholder="Buscar requisito..." className="bg-transparent border-none outline-none text-white font-black uppercase tracking-widest w-64 placeholder:text-emerald-950/40" />
                  </div>
               </div>
            </div>

            {lessons.map((lesson) => (
              <div key={lesson.id} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-[3.5rem] blur opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                <div className="relative bg-black border border-white/10 rounded-[3.5rem] p-10 hover:border-emerald-500/20 transition-all duration-500 flex flex-col xl:flex-row gap-12 active:scale-[0.99] backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  <div className="w-full xl:w-96 h-60 rounded-[3rem] overflow-hidden bg-black/80 flex-shrink-0 relative border border-white/5 shadow-2xl group-hover:border-emerald-500/20 transition-all">
                      <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 overflow-hidden">
                        <lesson.icon 
                          size={140} 
                          strokeWidth={1} 
                          className="opacity-20 group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000"
                          style={{ color: lesson.color }} 
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-1000 blur-[60px]" style={{ backgroundColor: lesson.color }} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                     <div className="absolute bottom-6 left-6 px-5 py-2.5 bg-black/80 backdrop-blur-2xl rounded-2xl text-[10px] font-black uppercase text-white shadow-2xl flex items-center gap-3 border border-white/10">
                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: lesson.color, color: lesson.color }} />
                        {lesson.category}
                     </div>
                  </div>

                   <div className="flex-1 flex flex-col py-2 relative z-10 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <h4 className="text-sm xl:text-base font-black text-white hover:text-emerald-400 transition-colors cursor-pointer tracking-normal uppercase flex-1 min-w-0 break-words leading-tight">{lesson.title}</h4>
                      <div className="flex-shrink-0 px-3 py-1 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                         {lesson.duration}
                      </div>
                    </div>
                    <p className="text-lg text-emerald-400/60 font-medium leading-relaxed mb-12 max-w-2xl">{lesson.desc}</p>

                     <div className="mt-auto flex flex-col lg:flex-row items-center justify-between gap-12">
                      <div className="w-full lg:flex-1 min-w-0">
                        <div className="flex justify-between text-[8px] xl:text-[9px] font-black text-emerald-900 mb-2 uppercase tracking-[0.2em]">
                           <span className="whitespace-nowrap mr-2">Progreso de Auditoría</span>
                           <span className="text-white italic shrink-0">{lesson.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                          <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000 relative" style={{ width: `${lesson.progress}%` }}>
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                          </div>
                        </div>
                      </div>
                      <button className="w-full lg:w-auto px-6 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 group/btn">
                         {lesson.progress > 0 ? 'Reanudar' : 'Cargar'}
                         <Play size={10} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DYNAMIC COMPONENT BASED ON ROLE (Bottom) */}
          <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {isDirector ? (
               <div className="bg-black border border-white/10 rounded-[4rem] p-12 shadow-2xl backdrop-blur-md relative group">
                  <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="flex items-center gap-4 mb-12 relative z-10">
                     <TrendingUp size={24} className="text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                     <h5 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Frecuencia de Cumplimiento Táctico</h5>
                  </div>
                  <div className="h-[350px] w-full relative z-10 transition-all group-hover:scale-[1.02] min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="rgba(16,185,129,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#065F46', fontSize: 10, fontWeight: 'black' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="Compliance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            ) : (
               <TrainingCalendar />
            )}

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[4rem] p-12 text-white relative overflow-hidden flex flex-col justify-center shadow-2xl shadow-emerald-500/10 group">
               <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
               <BrainCircuit size={64} className="mb-10 opacity-30 group-hover:scale-110 transition-transform duration-700" />
               <h4 className="text-4xl font-black mb-4 italic tracking-tighter uppercase">Asistente Auron</h4>
               <p className="text-emerald-100 text-lg leading-relaxed mb-12 font-medium">
                 "He detectado una brecha crítica en el requisito 7.2 de ISO 9001. Generando ruta de corrección técnica..."
               </p>
               <button className="w-full py-6 bg-white text-emerald-950 font-black rounded-3xl text-[10px] uppercase tracking-[0.4em] transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
                  Sincronizar con Auron
               </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
