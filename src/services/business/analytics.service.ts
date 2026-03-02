// src/services/business/analytics.service.ts
import { LayerStatus } from '../types';

type FieldValue = string | number | boolean | null | undefined;

interface GerenciaSummary {
  nombre: string;
  progress: number;
  status: LayerStatus;
}

interface ExecutiveSummary {
  globalHealth: number;
  criticalRisks: number;
  activeAlerts: string;
}

export const AnalyticsService = {

  // ✅ Calcula salud de una capa — campos llenos vs totales
  calculateLayerHealth: (fields: Record<string, FieldValue>): number => {
    const total = Object.keys(fields).length;
    if (total === 0) return 0;

    const filled = Object.values(fields).filter(
      (v) => v !== null && v !== undefined && v.toString().trim().length > 0
    ).length;

    return Math.round((filled / total) * 100);
  },

  // ✅ Determina estatus de un KPI
  getKpiStatus: (
    current: number,
    target: number,
    inverted: boolean = false
  ): LayerStatus => {
    // ✅ Protección contra división por cero
    if (target === 0) return LayerStatus.CRITICAL;

    if (inverted) {
      if (current <= target) return LayerStatus.OK;
      if (current <= target * 1.1) return LayerStatus.ALERT;
      return LayerStatus.CRITICAL;
    }

    const performance = current / target;
    if (performance >= 0.9) return LayerStatus.OK;
    if (performance >= 0.7) return LayerStatus.ALERT;
    return LayerStatus.CRITICAL;
  },

  // ✅ Resumen ejecutivo para la Sala de Guerra
  generateExecutiveSummary: (gerencias: GerenciaSummary[]): ExecutiveSummary => {
    // ✅ Protección contra array vacío
    if (gerencias.length === 0) {
      return { globalHealth: 0, criticalRisks: 0, activeAlerts: "Sin datos disponibles." };
    }

    const totalProgress = gerencias.reduce((acc, g) => acc + g.progress, 0);
    const globalHealth = Math.round(totalProgress / gerencias.length);

    // ✅ Comparación con enum, no con string literal
    const criticalRisks = gerencias.filter(
      (g) => g.status === LayerStatus.ALERT || g.status === LayerStatus.CRITICAL
    ).length;

    return {
      globalHealth,
      criticalRisks,
      activeAlerts: criticalRisks > 0
        ? `Requiere intervención inmediata en ${criticalRisks} área(s) marcada(s).`
        : "Operación bajo parámetros estables.",
    };
  },
};