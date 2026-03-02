/**
 * SIMPLIFICAME – Company Service
 * Multi-tenant: gestión de empresas, miembros y progreso de capas
 *
 * ✅ FIX: getUserCompany ya no usa .single() — soporta multi-empresa
 * ✅ FIX: getUserCompanies retorna todas las empresas del usuario
 * ✅ FIX: saveLayerProgress escribe en layer_progress (tabla real) no en la VIEW
 * ✅ FIX: getLayerProgress lee de layer_progress con company_id + cycle_id
 * ✅ FIX: getActivePhase reemplaza la lectura de user_context (tabla eliminada)
 */
import { supabase } from './api/supabase'; // ✅ ruta correcta

export interface Company {
  id: string;
  name: string;
  nit?: string;
  sector?: string;
  plan: 'starter' | 'pro' | 'enterprise';
  afse_score: number;
}

export interface AfseCycle {
  id: string;
  company_id: string;
  cycle_number: number;
  status: 'active' | 'completed' | 'archived';
  score: number;
}

export interface LayerMatrixData {
  fields: Record<string, string>;
  completedAt?: string;
  notes?: string;
}

// ── Crear empresa nueva ──
export const createCompany = async (
  userId: string,
  data: Pick<Company, 'name' | 'nit' | 'sector'>
): Promise<Company | null> => {
  const { data: company, error } = await supabase
    .from('companies')
    .insert({ ...data, plan: 'starter' })
    .select()
    .single();

  if (error) {
    console.error('[Company] Error creando empresa:', error.message);
    return null;
  }

  const { error: memberError } = await supabase.from('company_members').insert({
    company_id:  company.id,
    user_id:     userId,
    role:        'owner',
    accepted_at: new Date().toISOString(),
  });
  if (memberError) console.error('[Company] Error agregando owner:', memberError.message);

  const { error: cycleError } = await supabase.from('afse_cycles').insert({
    company_id:   company.id,
    cycle_number: 1,
    status:       'active',
    created_by:   userId,
  });
  if (cycleError) console.error('[Company] Error creando ciclo:', cycleError.message);

  return company;
};

// ── Obtener TODAS las empresas del usuario ──
export const getUserCompanies = async (userId: string): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('company_members')
    .select('companies(*)')
    .eq('user_id', userId)
    .order('invited_at', { ascending: true });

  if (error || !data) {
    console.error('[Company] getUserCompanies error:', error?.message);
    return [];
  }

  return (data as any[]).map((row) => row.companies).filter(Boolean) as Company[];
};

// ── Obtener la primera empresa activa del usuario ──
// ✅ FIX: limit(1) en lugar de .single() — no rompe con multi-empresa
export const getUserCompany = async (userId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('company_members')
    .select('companies(*)')
    .eq('user_id', userId)
    .limit(1);

  if (error || !data || data.length === 0) {
    console.error('[Company] getUserCompany error:', error?.message);
    return null;
  }

  return (data[0] as any).companies as Company;
};

// ── Obtener ciclo activo ──
export const getActiveCycle = async (companyId: string): Promise<AfseCycle | null> => {
  const { data, error } = await supabase
    .from('afse_cycles')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .order('cycle_number', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('[Company] getActiveCycle error:', error.message);
    return null;
  }
  return data;
};

// ── Guardar progreso de una capa ──
// ✅ FIX CRÍTICO: escribe en layer_progress (tabla real) — NO en project_layers (VIEW)
export const saveLayerProgress = async (
  userId: string,
  companyId: string,
  cycleId: string,
  layerNumber: number,
  layerCode: string,
  matrixData: LayerMatrixData,
  completionPct?: number
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('layer_progress').upsert(
    {
      user_id:        userId,
      company_id:     companyId,
      cycle_id:       cycleId,
      layer_number:   layerNumber,
      layer_code:     layerCode,
      matrix_data:    matrixData,
      completion_pct: completionPct ?? 0,
      status:         completionPct && completionPct >= 100 ? 'completed' : 'in_progress',
      updated_at:     new Date().toISOString(),
    },
    { onConflict: 'cycle_id,layer_number' }
  );

  if (error) {
    console.error('[Company] saveLayerProgress error:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
};

// ── Leer progreso de una capa ──
export const getLayerProgress = async (
  companyId: string,
  cycleId: string,
  layerNumber: number
): Promise<LayerMatrixData | null> => {
  const { data, error } = await supabase
    .from('layer_progress')
    .select('matrix_data')
    .eq('company_id', companyId)
    .eq('cycle_id', cycleId)
    .eq('layer_number', layerNumber)
    .single();

  if (error) {
    console.error('[Company] getLayerProgress error:', error.message);
    return null;
  }
  return data?.matrix_data ?? null;
};

// ── Leer progreso de todas las capas del ciclo ──
export const getAllLayersProgress = async (
  companyId: string,
  cycleId: string
): Promise<Record<number, { data: LayerMatrixData; pct: number; status: string }>> => {
  const { data, error } = await supabase
    .from('layer_progress')
    .select('layer_number, matrix_data, completion_pct, status')
    .eq('company_id', companyId)
    .eq('cycle_id', cycleId);

  if (error) {
    console.error('[Company] getAllLayersProgress error:', error.message);
    return {};
  }

  return Object.fromEntries(
    (data ?? []).map((row) => [
      row.layer_number,
      { data: row.matrix_data, pct: row.completion_pct, status: row.status },
    ])
  );
};

// ── Score AFSE en tiempo real ──
export const getAFSEScore = async (companyId: string): Promise<{
  score: number;
  label: string;
  breakdown: Record<string, number>;
} | null> => {
  const { data, error } = await supabase
    .from('afse_scores')
    .select('score, label, breakdown')
    .eq('company_id', companyId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('[Company] getAFSEScore error:', error.message);
    return null;
  }
  return data as any;
};

// ── Obtener fase activa desde layer_progress ──
// ✅ FIX: reemplaza lectura de user_context (tabla eliminada en migración)
export const getActivePhase = async (
  companyId: string,
  cycleId: string
): Promise<{ activePhase: number; maxPhase: number }> => {
  const { data, error } = await supabase
    .from('layer_progress')
    .select('layer_number, status')
    .eq('company_id', companyId)
    .eq('cycle_id', cycleId)
    .order('layer_number', { ascending: false });

  if (error || !data || data.length === 0) {
    return { activePhase: 1, maxPhase: 1 };
  }

  const maxCompleted = data
    .filter((r) => r.status === 'completed')
    .reduce((max, r) => Math.max(max, r.layer_number), 0);

  const maxPhase    = Math.min(maxCompleted + 1, 8);
  const activePhase = data[0]?.layer_number ?? 1;

  return { activePhase, maxPhase };
};
