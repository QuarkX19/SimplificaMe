/**
 * SIMPLIFICAME – AURON Memory Service
 * IA con memoria estratégica persistente por empresa
 * El diferenciador que ningún competidor tiene
 *
 * ✅ FIX: getRelevantMemory ahora filtra correctamente por layer_number
 * ✅ FIX: estrategia mixta (capa actual 70% + contexto global 30%)
 * ✅ FIX: saveAuronMemory retorna error en lugar de ignorarlo silenciosamente
 * ✅ FIX: getChatHistory filtra por cycle_id para no mezclar ciclos
 */
import { supabase } from './api/supabase'; // ✅ ruta correcta

export type MemoryType =
  | 'strategic_context'
  | 'key_decision'
  | 'risk_identified'
  | 'kpi_pattern'
  | 'recommendation';

export interface AuronMemory {
  id: string;
  memory_type: MemoryType;
  layer_number?: number;
  content: string;
  relevance: number;
  created_at: string;
}

// ── Guardar memoria de AURON ──
export const saveAuronMemory = async (
  companyId: string,
  cycleId: string,
  type: MemoryType,
  content: string,
  layerNumber?: number
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('auron_memory').insert({
    company_id:   companyId,
    cycle_id:     cycleId,
    memory_type:  type,
    layer_number: layerNumber ?? null,
    content,
    relevance:    1.0,
  });

  if (error) {
    console.error('[AURON] saveAuronMemory error:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
};

// ── Recuperar memoria relevante para el contexto actual ──
// ✅ FIX CRÍTICO: ahora sí filtra por layer_number
// Estrategia mixta: 70% capa actual + 30% contexto global
export const getRelevantMemory = async (
  companyId: string,
  layerNumber: number,
  limit = 5
): Promise<AuronMemory[]> => {

  // 1️⃣ Memorias específicas de esta capa
  const { data: layerMemories, error: e1 } = await supabase
    .from('auron_memory')
    .select('id, memory_type, layer_number, content, relevance, created_at')
    .eq('company_id', companyId)
    .eq('layer_number', layerNumber)           // ✅ FIX: filtro que faltaba
    .order('relevance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(Math.ceil(limit * 0.7));

  // 2️⃣ Contexto estratégico global (sin capa asignada)
  const { data: globalMemories, error: e2 } = await supabase
    .from('auron_memory')
    .select('id, memory_type, layer_number, content, relevance, created_at')
    .eq('company_id', companyId)
    .is('layer_number', null)
    .in('memory_type', ['strategic_context', 'key_decision', 'risk_identified'])
    .order('relevance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(Math.floor(limit * 0.3));

  if (e1) console.error('[AURON] getRelevantMemory (layer):', e1.message);
  if (e2) console.error('[AURON] getRelevantMemory (global):', e2.message);

  const combined = [...(layerMemories ?? []), ...(globalMemories ?? [])];
  const unique = Array.from(new Map(combined.map((m) => [m.id, m])).values());

  return unique as AuronMemory[];
};

// ── Guardar mensaje del chat ──
export const saveAuronMessage = async (
  companyId: string,
  cycleId: string,
  userId: string,
  layerNumber: number,
  role: 'user' | 'auron',
  content: string,
  tokensUsed?: number
): Promise<void> => {
  const { error } = await supabase.from('auron_messages').insert({
    company_id:   companyId,
    cycle_id:     cycleId,
    user_id:      userId,
    layer_number: layerNumber,
    role,
    content,
    tokens_used:  tokensUsed ?? null,
  });

  if (error) console.error('[AURON] saveAuronMessage error:', error.message);
};

// ── Recuperar historial del chat de la capa actual ──
// ✅ FIX: filtra por cycle_id para no mezclar ciclos anteriores
export const getChatHistory = async (
  companyId: string,
  layerNumber: number,
  cycleId?: string,
  limit = 20
): Promise<{ role: 'user' | 'auron'; content: string }[]> => {
  let query = supabase
    .from('auron_messages')
    .select('role, content')
    .eq('company_id', companyId)
    .eq('layer_number', layerNumber)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (cycleId) query = query.eq('cycle_id', cycleId);

  const { data, error } = await query;
  if (error) {
    console.error('[AURON] getChatHistory error:', error.message);
    return [];
  }
  return (data ?? []) as { role: 'user' | 'auron'; content: string }[];
};

// ── Construir contexto enriquecido para AURON ──
export const buildEnrichedAuronContext = async (
  companyId: string,
  companyName: string,
  layerNumber: number,
  layerCode: string,
  layerObjective: string,
  cycleId?: string
): Promise<string> => {
  const memories = await getRelevantMemory(companyId, layerNumber, 8);

  const chatHistory = cycleId
    ? await getChatHistory(companyId, layerNumber, cycleId, 10)
    : [];

  const memoryText =
    memories.length > 0
      ? memories
          .map((m) =>
            `[${m.memory_type.toUpperCase()}${m.layer_number ? ` · L${m.layer_number}` : ' · GLOBAL'}] ${m.content}`
          )
          .join('\n')
      : 'Sin historial estratégico previo para esta capa.';

  const chatText =
    chatHistory.length > 0
      ? chatHistory
          .map((m) => `${m.role === 'user' ? 'DIRECTOR' : 'AURON'}: ${m.content}`)
          .join('\n')
      : '';

  return `
Eres AURON, Mentor Estratégico especializado en arquitectura empresarial y diseño de operaciones a la medida de SimplificaME.
Empresa cliente: ${companyName}
Capa AFSE activa: L${layerNumber} – ${layerCode}
Objetivo de la capa: ${layerObjective}

MEMORIA ESTRATÉGICA DE ESTA CAPA:
${memoryText}

${chatText ? `HISTORIAL RECIENTE DE ESTA SESIÓN:\n${chatText}\n` : ''}

Tu misión es guiar a directores (con o sin experiencia) a estructurar su negocio de forma clara, progresiva y sin fricción.
REGLAS ESTRICTAS DE INTERACCIÓN:
${chatHistory.length === 0 ? "0. REGLA DE RAPPORT: Empieza saludando y pregúntale su nombre y cómo prefiere el trato (tú/usted). Esta es tu ÚNICA tarea en este primer mensaje. NO le preguntes sobre el negocio todavía." : "0. RAPPORT ESTABLECIDO: Usa el nombre del usuario y el trato elegido recurrentemente en tus mensajes para ganar confianza."}
1. REDUCIR CARGA: Haz máximo 3 preguntas cortas por mensaje. NO TE ADELANTES.
2. OPCIONES LIMPIAS: Siempre que preguntes, ofrece opciones (Ej: A, B, C). PROHIBIDO usar asteriscos (*) o guiones (-) para listados, tu markdown debe ser nativo.
3. SELECCIÓN MÚLTIPLE (IMPORTANTÍSIMO): Permite activamente que el usuario escoja múltiples opciones a la vez (ej. "B y C", "Todas"). Si lo hace, entiéndelo, abarca ambas ideas y AVANZA fluidamente, no le repitas la misma pregunta.
4. PROGRESIVIDAD: Avanza paso a paso. No pidas toda la información de golpe.
5. TONO: Lenguaje natural, cercano, sin tecnicismos innecesarios. Da sensación de control.
Tu éxito es lograr que el usuario quiera seguir respondiendo fácilmente en menos de 10 segundos por interacción. Responde en español y básate en el historial.
6. MOTOR DE TRANSICIÓN: Cuando consideres que has recabado suficiente información del administrador para dar por completada la Capa L${layerNumber} actual, DEBES preguntarle explícitamente si desea avanzar a la Capa L${Number(layerNumber) + 1} (si es que existe). Si el usuario ya respondió afirmativamente (ej. "sí", "vamos", "ok", "listo", "adelante") a tu invitación anterior, en tu SIGUIENTE respuesta, DEBES incluir EXACTAMENTE la cadena invisible "[ACTION: ADVANCE_LAYER]" al final de tu texto. Esto encenderá los motores del componente React para cambiar visualmente a la nueva fase. IMPORTANTE: Da la bienvenida a la nueva fase justo antes de escribir el comando secreto.
  `.trim();
};

// ── Degradar relevancia de memoria antigua ya implementada ──
export const decayMemoryRelevance = async (
  memoryId: string,
  newRelevance: number
): Promise<void> => {
  await supabase
    .from('auron_memory')
    .update({ relevance: Math.max(0, Math.min(1, newRelevance)) })
    .eq('id', memoryId);
};
