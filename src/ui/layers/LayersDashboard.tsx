// src/ui/layers/LayersDashboard.tsx
import React from 'react';
import { KpiCard } from '../components/kpiCard';
import { AnalyticsService } from '../../services/business/analytics.service';
import { LayerStatus } from '@/types';
import { Gerencia } from '@/core/store/useStrategyStore';

interface Props {
  gerencias: Gerencia[];
}

export const WarRoom: React.FC<Props> = ({ gerencias }) => {
  // ✅ Usa métodos que existen en AnalyticsService
  const summary = AnalyticsService.generateExecutiveSummary(gerencias);

  // ✅ Calcula salud individual por gerencia
  const healthByGerencia = gerencias.map((g) => ({
    ...g,
    health: AnalyticsService.calculateLayerHealth(
      Object.fromEntries(g.kpiCritico ? [['kpi', g.kpiCritico.valor]] : [])
    ),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-[#02040a]">

      {/* KPI GLOBAL */}
      <KpiCard
        title="Eficiencia Metodológica"
        value={summary.globalHealth}
        target={90}
        unit="%"
        trend={summary.globalHealth >= 80 ? 'up' : 'down'}
        status={
          summary.globalHealth >= 80 ? LayerStatus.OK :
          summary.globalHealth >= 60 ? LayerStatus.ALERT :
          LayerStatus.CRITICAL
        }
      />

      {/* KPI ALERTAS CRÍTICAS */}
      <KpiCard
        title="Áreas en Alerta"
        value={summary.criticalRisks}
        target={0}
        unit=" áreas"
        trend={summary.criticalRisks === 0 ? 'stable' : 'up'}
        status={
          summary.criticalRisks === 0 ? LayerStatus.OK :
          summary.criticalRisks <= 2  ? LayerStatus.ALERT :
          LayerStatus.CRITICAL
        }
      />

      {/* KPI POR GERENCIA */}
      {gerencias.map((g) => (
        <KpiCard
          key={g.id}
          title={g.nombre}
          value={g.progreso}
          target={100}
          unit="%"
          trend={g.kpiCritico.tendencia === 'up' ? 'up' : 'down'}
          status={AnalyticsService.getKpiStatus(
            g.kpiCritico.valor,
            g.kpiCritico.meta
          )}
        />
      ))}

    </div>
  );
};