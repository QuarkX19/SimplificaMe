/**
 * SIMPLIFICAME · KPI Service
 * CRUD de KPIs + integración con ERP (AS400, SAP)
 * Tabla kpis: layer_number solo en capas 2, 4, 7
 */

import { supabase } from '../api/supabase';
import { safeAsync, isoNow, type Result } from '../../lib/utils';

export interface Kpi {
  id: string;
  company_id: string;
  cycle_id: string;
  layer_number: number | null;
  name: string;
  description: string | null;
  value: number | null;
  target: number | null;
  unit: string | null;
  trend: string | null;
  status: string | null;
  source: string | null;
  source_table: string | null;
  inverted: boolean | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KpiMapping {
  id: string;
  company_id: string;
  source: string;
  source_field: string;
  afse_layer: string;
  label: string;
  unit: string | null;
  transform_fn: string | null;
  is_active: boolean;
  created_at: string;
}

export type KpiLayerNumber = 2 | 4 | 7;
export type KpiStatus = 'OK' | 'ALERT' | 'CRITICAL';
export type KpiTrend = 'up' | 'stable' | 'down';

// ═══════════════════════════════════════════════════════════════════════════════
// LECTURA
// ═══════════════════════════════════════════════════════════════════════════════

export async function getCompanyKpis(
  companyId: string,
  cycleId?: string,
  layerNumber?: KpiLayerNumber
): Promise<Kpi[]> {
  let query = supabase
    .from('kpis')
    .select('*')
    .eq('company_id', companyId)
    .order('updated_at', { ascending: false });

  if (cycleId)     query = query.eq('cycle_id', cycleId);
  if (layerNumber) query = query.eq('layer_number', layerNumber);

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getCriticalKpis(companyId: string, cycleId: string): Promise<Kpi[]> {
  const { data } = await supabase
    .from('kpis')
    .select('*')
    .eq('company_id', companyId)
    .eq('cycle_id', cycleId)
    .in('status', ['ALERT', 'CRITICAL'])
    .order('updated_at', { ascending: false });

  return data ?? [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESCRITURA
// ═══════════════════════════════════════════════════════════════════════════════

export async function upsertKpi(
  companyId: string,
  cycleId: string,
  kpi: {
    name: string;
    value?: number;
    target?: number;
    unit?: string;
    layer_number?: KpiLayerNumber;
    description?: string;
    source?: string;
  }
): Promise<Result<Kpi>> {
  return safeAsync(async () => {
    const status = computeKpiStatus(kpi.value, kpi.target);
    const trend  = computeKpiTrend(kpi.value, kpi.target);

    const { data, error } = await supabase
      .from('kpis')
      .upsert({
        company_id:   companyId,
        cycle_id:     cycleId,
        name:         kpi.name,
        value:        kpi.value ?? null,
        target:       kpi.target ?? null,
        unit:         kpi.unit ?? null,
        layer_number: kpi.layer_number ?? null,
        description:  kpi.description ?? null,
        source:       kpi.source ?? 'manual',
        status,
        trend,
        updated_at:   isoNow(),
      }, { onConflict: 'company_id,cycle_id,name' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }, 'upsertKpi');
}

export async function updateKpiValue(
  kpiId: string,
  value: number,
  target?: number
): Promise<Result<Kpi>> {
  return safeAsync(async () => {
    const status = computeKpiStatus(value, target);
    const trend  = computeKpiTrend(value, target);

    const { data, error } = await supabase
      .from('kpis')
      .update({ value, status, trend, synced_at: isoNow(), updated_at: isoNow() })
      .eq('id', kpiId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }, 'updateKpiValue');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getKpiMappings(companyId: string): Promise<KpiMapping[]> {
  const { data } = await supabase
    .from('kpi_afse_mapping')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true);

  return data ?? [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function computeKpiStatus(value?: number, target?: number): KpiStatus | null {
  if (value === undefined || value === null || !target) return null;
  const pct = (value / target) * 100;
  if (pct >= 90) return 'OK';
  if (pct >= 70) return 'ALERT';
  return 'CRITICAL';
}

function computeKpiTrend(value?: number, target?: number): KpiTrend | null {
  if (value === undefined || value === null || !target) return null;
  const pct = (value / target) * 100;
  if (pct >= 95) return 'up';
  if (pct >= 80) return 'stable';
  return 'down';
}

export function formatKpiValue(kpi: Kpi): string {
  if (kpi.value === null) return '—';
  const v = kpi.unit === '%' ? kpi.value.toFixed(1) : kpi.value.toLocaleString('es-CO');
  return `${v}${kpi.unit ? ` ${kpi.unit}` : ''}`;
}