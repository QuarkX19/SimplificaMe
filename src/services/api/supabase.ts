// src/services/api/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('[supabase] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no definidas en .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Tipo explícito para los datos de la matriz
export interface LayerMatrixData {
  fields: Record<string, string>;
  completedAt?: string;
  notes?: string;
}

// ✅ Resultado tipado
interface SaveResult {
  success: boolean;
  error?: string;
}

// ✅ Guardar progreso
export const saveLayerProgress = async (
  userId: string,
  layerNum: number,
  data: LayerMatrixData
): Promise<SaveResult> => {
  const { error } = await supabase
    .from('project_layers')
    .upsert(
      {
        user_id: userId,
        layer_number: layerNum,
        matrix_data: data,
        updated_at: new Date().toISOString(), // ✅ ISO string
      },
      { onConflict: 'user_id,layer_number' }
    );

  if (error) {
    console.error('[supabase] Error en saveLayerProgress:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
};

// ✅ Leer progreso de una capa
export const getLayerProgress = async (
  userId: string,
  layerNum: number
): Promise<LayerMatrixData | null> => {
  const { data, error } = await supabase
    .from('project_layers')
    .select('matrix_data')
    .eq('user_id', userId)
    .eq('layer_number', layerNum)
    .single();

  if (error) {
    console.error('[supabase] Error en getLayerProgress:', error.message);
    return null;
  }

  return data?.matrix_data ?? null;
};

// ✅ Leer progreso de todas las capas de un usuario
export const getAllLayersProgress = async (
  userId: string
): Promise<Record<number, LayerMatrixData>> => {
  const { data, error } = await supabase
    .from('project_layers')
    .select('layer_number, matrix_data')
    .eq('user_id', userId);

  if (error) {
    console.error('[supabase] Error en getAllLayersProgress:', error.message);
    return {};
  }

  return Object.fromEntries(
    (data ?? []).map((row) => [row.layer_number, row.matrix_data])
  );
};