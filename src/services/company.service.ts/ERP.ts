/**
 * SIMPLIFICAME – ERP KPI Sync Service
 * Conecta AS/400 vía IWS → sincroniza KPIs en Supabase
 * Alimenta automáticamente L2, L4 y L7
 *
 * ✅ FIX: onConflict usa 'company_id,cycle_id,name' — índice único real
 * ✅ FIX: retry automático ante fallos transitorios del IWS
 * ✅ FIX: validación de payload antes de upsert
 * ✅ FIX: connection_id incluido en erp_sync_log
 */
import { supabase } from './api/supabase'; // ✅ ruta correcta

export interface ErpKpi {
  name: string;
  value: number;
  target: number;
  unit: string;
  layer_number: 2 | 4 | 7;
  source_table: string;
  inverted?: boolean;
}

// ── Calcular semáforo ──
const calcStatus = (
  value: number,
  target: number,
  inverted = false
): 'OK' | 'ALERT' | 'CRITICAL' => {
  if (target === 0 || value === 0) return 'CRITICAL';
  const ratio = inverted ? target / value : value / target;
  if (ratio >= 0.9) return 'OK';
  if (ratio >= 0.7) return 'ALERT';
  return 'CRITICAL';
};

const calcTrend = (value: number, target: number): 'up' | 'down' | 'stable' => {
  if (target === 0) return 'stable';
  const ratio = value / target;
  if (ratio >= 1.05) return 'up';
  if (ratio <= 0.95) return 'down';
  return 'stable';
};

// ── Fetch con reintentos ──
const fetchWithRetry = async (
  url: string,
  retries = 3,
  delayMs = 1000
): Promise<Response> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) return res;
      if (attempt === retries) throw new Error(`IWS HTTP ${res.status}`);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
  throw new Error('fetchWithRetry: no debería llegar aquí');
};

// ── Sincronizar KPIs desde ERP vía IWS ──
export const syncAS400Kpis = async (
  companyId: string,
  cycleId: string,
  iwsEndpoint: string,
  connectionId?: string
): Promise<{ synced: number; errors: number }> => {
  let synced = 0;
  let errors = 0;
  const startTime = Date.now();
  const errorDetails: string[] = [];

  try {
    const response = await fetchWithRetry(iwsEndpoint);
    const rawData = await response.json();

    if (!rawData || typeof rawData !== 'object') {
      throw new Error('IWS devolvió payload inválido');
    }

    const kpis: ErpKpi[] = mapAS400ToKpis(rawData);

    if (kpis.length === 0) {
      throw new Error('mapAS400ToKpis no generó KPIs — revisa los nombres de campos del ERP');
    }

    for (const kpi of kpis) {
      if (!kpi.name || isNaN(kpi.value) || isNaN(kpi.target)) {
        errorDetails.push(`KPI inválido: ${JSON.stringify(kpi)}`);
        errors++;
        continue;
      }

      const status = calcStatus(kpi.value, kpi.target, kpi.inverted);
      const trend  = calcTrend(kpi.value, kpi.target);

      const { error } = await supabase.from('kpis').upsert(
        {
          company_id:   companyId,
          cycle_id:     cycleId,
          layer_number: kpi.layer_number,
          name:         kpi.name,
          value:        kpi.value,
          target:       kpi.target,
          unit:         kpi.unit,
          trend,
          status,
          source:       'AS400',
          source_table: kpi.source_table,
          inverted:     kpi.inverted ?? false,
          synced_at:    new Date().toISOString(),
          updated_at:   new Date().toISOString(),
        },
        { onConflict: 'company_id,cycle_id,name' }
      );

      if (error) {
        errors++;
        errorDetails.push(`[${kpi.name}] ${error.message}`);
      } else {
        synced++;
      }
    }

    await supabase.from('erp_sync_log').insert({
      company_id:     companyId,
      connection_id:  connectionId ?? null,
      status:         errors === 0 ? 'success' : 'partial',
      records_synced: synced,
      kpis_updated:   synced,
      error_message:  errorDetails.length > 0 ? errorDetails.join(' | ') : null,
      duration_ms:    Date.now() - startTime,
      triggered_by:   'manual',
    });

  } catch (err: any) {
    errors++;
    await supabase.from('erp_sync_log').insert({
      company_id:     companyId,
      connection_id:  connectionId ?? null,
      status:         'error',
      records_synced: 0,
      kpis_updated:   0,
      error_message:  err.message,
      duration_ms:    Date.now() - startTime,
      triggered_by:   'manual',
    });
  }

  return { synced, errors };
};

// ── Mapeo ERP → KPIs AFSE ──
// Ajusta los nombres de campos según tu AS/400 real
const mapAS400ToKpis = (raw: Record<string, any>): ErpKpi[] => {
  const kpis: ErpKpi[] = [];

  // L2 DIAGNOSTICAR
  if (raw.VENTAS_MES !== undefined) {
    kpis.push({
      name:         'Ventas Netas del Mes',
      value:        Number(raw.VENTAS_MES),
      target:       Number(raw.META_VENTAS ?? raw.VENTAS_MES * 1.1),
      unit:         'COP',
      layer_number: 2,
      source_table: 'VENTAS',
    });
  }

  if (raw.COSTO_OPERATIVO !== undefined) {
    kpis.push({
      name:         'Costo Operativo',
      value:        Number(raw.COSTO_OPERATIVO),
      target:       Number(raw.META_COSTO ?? raw.COSTO_OPERATIVO * 0.9),
      unit:         'COP',
      layer_number: 2,
      source_table: 'CONTAB',
      inverted:     true,
    });
  }

  // L4 BSC
  if (raw.EBITDA !== undefined) {
    kpis.push({
      name:         'EBITDA',
      value:        Number(raw.EBITDA),
      target:       Number(raw.META_EBITDA ?? raw.EBITDA * 1.15),
      unit:         'COP',
      layer_number: 4,
      source_table: 'FINANZAS',
    });
  }

  if (raw.ROTACION_CARTERA !== undefined) {
    kpis.push({
      name:         'Rotación de Cartera (días)',
      value:        Number(raw.ROTACION_CARTERA),
      target:       Number(raw.META_ROTACION ?? 30),
      unit:         'días',
      layer_number: 4,
      source_table: 'CARTERA',
      inverted:     true,
    });
  }

  // L7 ACOMPAÑAR
  if (raw.CUMPL_PRESUPUESTO !== undefined) {
    kpis.push({
      name:         'Cumplimiento Presupuestal',
      value:        Number(raw.CUMPL_PRESUPUESTO),
      target:       95,
      unit:         '%',
      layer_number: 7,
      source_table: 'PRESUPUESTO',
    });
  }

  return kpis;
};

// ── Leer KPIs de una capa ──
export const getLayerKpis = async (
  companyId: string,
  layerNumber: 2 | 4 | 7,
  cycleId?: string
) => {
  let query = supabase
    .from('kpis')
    .select('*')
    .eq('company_id', companyId)
    .eq('layer_number', layerNumber)
    .order('updated_at', { ascending: false });

  if (cycleId) query = query.eq('cycle_id', cycleId);

  const { data, error } = await query;
  if (error) {
    console.error('[ERP] getLayerKpis error:', error.message);
    return [];
  }
  return data;
};
