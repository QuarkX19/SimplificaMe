// supabase/functions/auron-chat/index.ts
// Edge Function — Deno runtime
// Deploy: supabase functions deploy auron-chat
// Secret:  supabase secrets set GEMINI_API_KEY=<tu_key>

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

interface AuronRequest {
  prompt: string;
  history?: ChatMessage[];
  systemPrompt?: string;
  companyId?: string;
  layerNumber?: number;
  sessionId?: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> };
    finishReason: string;
  }>;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_BASE  = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_TOKENS   = 2048;
const TIMEOUT_MS   = 30_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

// Extrae el texto del primer candidato de Gemini
function extractText(data: GeminiResponse): string {
  const candidate = data?.candidates?.[0];
  if (!candidate) throw new Error("Gemini no devolvió candidatos");
  if (candidate.finishReason === "SAFETY") throw new Error("Respuesta bloqueada por filtros de seguridad");
  return candidate.content.parts.map((p) => p.text).join("") || "";
}

// ─── Handler principal ───────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return errorResponse("Método no permitido", 405);
  }

  // ── 1. Validar API key de Gemini ─────────────────────────────────────────
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    console.error("[auron-chat] GEMINI_API_KEY no configurada");
    return errorResponse("Configuración de servidor incompleta", 500);
  }

  // ── 2. Autenticar al usuario con JWT de Supabase ─────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse("No autorizado", 401);
  }

  const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase       = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return errorResponse("Token inválido o expirado", 401);
  }

  // ── 3. Parsear body ───────────────────────────────────────────────────────
  let body: AuronRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Body JSON inválido");
  }

  const { prompt, history = [], systemPrompt, companyId, layerNumber, sessionId } = body;

  if (!prompt?.trim()) {
    return errorResponse("El campo 'prompt' es requerido");
  }

  // ── 4. Validar que el usuario pertenece a la empresa ─────────────────────
  if (companyId) {
    const { data: member, error: memberError } = await supabase
      .from("company_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("company_id", companyId)
      .maybeSingle();

    if (memberError || !member) {
      return errorResponse("Sin acceso a esta empresa", 403);
    }
  }

  // ── 5. Construir payload para Gemini ─────────────────────────────────────
  const systemInstruction = systemPrompt
    ? { parts: [{ text: systemPrompt }] }
    : {
        parts: [{
          text: `Eres AURON, el asesor estratégico de la metodología AFSE NeuroCode Ultra. 
Ayudas a empresas a estructurar su estrategia a través de 8 capas: Diagnóstico, Propósito, 
Objetivos, BSC, Ejecución, Riesgos, Cultura y Gobernanza. 
Responde en español, de forma clara, directa y orientada a la acción.
${layerNumber ? `Contexto actual: Capa ${layerNumber}.` : ""}`,
        }],
      };

  // Limitar historial a últimas 20 interacciones para no exceder tokens
  const trimmedHistory = history.slice(-20);

  const geminiPayload = {
    system_instruction: systemInstruction,
    contents: [
      ...trimmedHistory,
      { role: "user", parts: [{ text: prompt }] },
    ],
    generationConfig: {
      maxOutputTokens: MAX_TOKENS,
      temperature: 0.7,
      topP: 0.95,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  // ── 6. Llamar a Gemini con timeout ───────────────────────────────────────
  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let geminiData: GeminiResponse;
  try {
    const geminiRes = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(geminiPayload),
      signal:  controller.signal,
    });

    clearTimeout(timer);

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[auron-chat] Gemini error:", geminiRes.status, errText);
      return errorResponse(`Error de Gemini: ${geminiRes.status}`, 502);
    }

    geminiData = await geminiRes.json();
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === "AbortError") {
      return errorResponse("Timeout: Gemini tardó demasiado", 504);
    }
    console.error("[auron-chat] Fetch error:", err);
    return errorResponse("Error de conexión con Gemini", 502);
  }

  // ── 7. Extraer texto de la respuesta ─────────────────────────────────────
  let responseText: string;
  try {
    responseText = extractText(geminiData);
  } catch (err) {
    return errorResponse((err as Error).message, 422);
  }

  // ── 8. Guardar en auron_messages (fire-and-forget) ───────────────────────
  if (companyId && layerNumber) {
    // No awaiteamos — no queremos que un fallo de DB bloquee la respuesta
    supabase.from("auron_messages").insert([
      {
        company_id:   companyId,
        user_id:      user.id,
        layer_number: layerNumber,
        role:         "user",
        content:      prompt,
        session_id:   sessionId ?? null,
        source:       "chat",
      },
      {
        company_id:   companyId,
        user_id:      user.id,
        layer_number: layerNumber,
        role:         "model",
        content:      responseText,
        session_id:   sessionId ?? null,
        source:       "chat",
      },
    ]).then(({ error }) => {
      if (error) console.warn("[auron-chat] No se pudo guardar mensaje:", error.message);
    });
  }

  // ── 9. Devolver respuesta al cliente ──────────────────────────────────────
  return jsonResponse({ text: responseText });
});