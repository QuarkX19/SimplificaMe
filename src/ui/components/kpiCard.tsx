// src/ui/components/kpiCard.tsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LayerStatus } from '../../types';

interface KpiCardProps {
  title: string;
  value: string | number;
  target: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: LayerStatus;
}

const formatVal = (v: string | number): string =>
  typeof v === 'number'
    ? v.toLocaleString('es-CO', { maximumFractionDigits: 2 })
    : v;

export const KpiCard: React.FC<KpiCardProps> = ({
  title, value, target, unit, trend, status
}) => {
  const statusColors: Record<LayerStatus, string> = {
    [LayerStatus.OK]:       'text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    [LayerStatus.ALERT]:    'text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]',
    [LayerStatus.CRITICAL]: 'text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  };

  // ✅ Glow distingue los 3 estados
  const glowColor: Record<LayerStatus, string> = {
    [LayerStatus.OK]:       'bg-cyan-400',
    [LayerStatus.ALERT]:    'bg-yellow-500',
    [LayerStatus.CRITICAL]: 'bg-red-500',
  };

  // ✅ Labels legibles
  const statusLabel: Record<LayerStatus, string> = {
    [LayerStatus.OK]:       'SYSTEM_OPTIMAL',
    [LayerStatus.ALERT]:    'WARN_DETECTION',
    [LayerStatus.CRITICAL]: 'CRITICAL_RISK',
  };

  return (
    <div
      role="region"
      aria-label={`KPI: ${title}`}
      className="bg-black/40 border-2 border-white/5 p-8 rounded-[3rem] hover:border-[#00ffff]/50 transition-all duration-500 group relative overflow-hidden"
    >
      {/* ✅ Glow con los 3 colores */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-30 ${glowColor[status]}`} />

      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4 group-hover:text-[#00ffff] transition-colors italic">
        {title}
      </p>

      <div className="flex items-baseline gap-2">
        <h3 className="text-5xl font-black italic text-white tracking-tighter">
          {formatVal(value)} {/* ✅ formateado */}
          <span className="text-lg text-slate-500 ml-1 font-normal not-italic tracking-normal">{unit}</span>
        </h3>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          {trend === 'up'     && <TrendingUp  size={16} className="text-green-500" />}
          {trend === 'down'   && <TrendingDown size={16} className="text-red-500" />}
          {trend === 'stable' && <Minus        size={16} className="text-slate-500" />}
          <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
            Target: {formatVal(target)}{unit} {/* ✅ formateado */}
          </span>
        </div>

        <div className={`text-[10px] font-black tracking-widest uppercase ${statusColors[status]}`}>
          {statusLabel[status]}
        </div>
      </div>
    </div>
  );
};