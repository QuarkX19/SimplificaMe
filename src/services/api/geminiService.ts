// src/services/api/geminiService.ts
// v3.0 — Llamada Directa Front-End (VITE_GEMINI_API_KEY)
// Configurado temporalmente a petición del CEO para esquivar dependencias Edge/Docker.

import { supabase } from "./supabase";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

export interface AuronRequestOptions {
  prompt: string;
  history?: ChatMessage[];
  systemPrompt?: string;
  companyId?: string;
  layerNumber?: number;
  sessionId?: string;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1_000, 2_000, 4_000]; // backoff exponencial
const MAX_HISTORY_MESSAGES = 20;

// ─── Rate limiter en cliente (defensa extra) ──────────────────────────────────
class ClientRateLimiter {
  private timestamps: number[] = [];
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit = 30, windowMs = 60_000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    if (this.timestamps.length >= this.limit) return false;
    this.timestamps.push(now);
    return true;
  }

  remainingRequests(): number {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    return Math.max(0, this.limit - this.timestamps.length);
  }
}

const rateLimiter = new ClientRateLimiter(30, 60_000);

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Envía un mensaje a AURON usando la API de Gemini Directa
 */
export async function getAuronResponse(
  prompt: string,
  options: Omit<AuronRequestOptions, "prompt"> = {}
): Promise<string> {
  return _callWithRetry({ prompt, ...options });
}

/**
 * Versión con historial explícito — útil para continuar conversaciones.
 */
export async function getAuronResponseWithHistory(
  prompt: string,
  history: ChatMessage[],
  options: Omit<AuronRequestOptions, "prompt" | "history"> = {}
): Promise<string> {
  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);
  return _callWithRetry({ prompt, history: trimmedHistory, ...options });
}

// ─── Internals ────────────────────────────────────────────────────────────────

async function _callWithRetry(
  options: AuronRequestOptions,
  attempt = 0
): Promise<string> {
  if (!rateLimiter.canProceed()) {
    throw new Error("Has alcanzado el límite de mensajes por minuto. Espera un momento.");
  }

  try {
    return await _invokeDirectAPI(options);
  } catch (err) {
    const error = err as Error;

    if (
      error.message.includes("401") ||
      error.message.includes("403") ||
      error.message.includes("límite") ||
      attempt >= MAX_RETRIES - 1
    ) {
      throw error;
    }

    const delay = RETRY_DELAYS_MS[attempt] ?? 4_000;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return _callWithRetry(options, attempt + 1);
  }
}

// ─── Data Sanitizer Middleware (Legal & Compliance MVP) ───────────────────────
function sanitizePII(text: string): string {
  let sanitized = text;
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_PROTEGIDO]'); // Emails
  sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[TDC_OMITIDA]'); // Tarjetas
  sanitized = sanitized.replace(/\b\d{8,12}\b/g, '[ID_FINANCIERO_OCULTO]'); // Cuentas Bancarias/RFC/RUT
  return sanitized;
}

async function _invokeDirectAPI(options: AuronRequestOptions): Promise<string> {
  // Leemos la llave directamente de Vite en el lado cliente
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY no encontrada en tus variables de entorno .env");
  }

  const { prompt, history = [], systemPrompt, companyId, layerNumber, sessionId } = options;

  // OFUSCACIÓN DE DATOS ANTES DE TOCAR EL LLM
  const sanitizedPrompt = sanitizePII(prompt);

  const systemInstruction = systemPrompt
    ? { parts: [{ text: systemPrompt }] }
    : {
      parts: [{
        text: `Eres AURON, Mentor Estratégico en arquitectura empresarial y diseño de operaciones.
Tu misión es guiar a directores de forma progresiva, clara y sin fricción.
REGLAS ESTRICTAS:
${history.length === 0 ? "0. REGLA DE RAPPORT: Empieza saludando y pregunta su nombre y cómo prefiere el trato (tú/usted). Esta es tu ÚNICA tarea inicial." : "0. RAPPORT ESTABLECIDO: Usa su nombre y el trato elegido frecuentemente."}
1. REDUCIR CARGA: Haz máximo 3 preguntas cortas por interacción. NO te adelantes.
2. OPCIONES LIMPIAS: Ofrece siempre opciones fáciles (A, B, C). PROHIBIDO el uso de asteriscos (*) o guiones (-) en las listas.
3. TONO: Lenguaje natural, cercano, sin tecnicismos innecesarios. Avanza paso a paso.
Nunca emitas asesoría jurídica o tributaria directa.
${layerNumber ? `Contexto actual: Capa ${layerNumber}.` : ""}`,
      }],
    };

  const trimmedHistory = history.slice(-20);
  const geminiPayload = {
    systemInstruction: systemInstruction,
    contents: [
      ...trimmedHistory,
      { role: "user", parts: [{ text: sanitizedPrompt }] }, // Solo enviamos el texto sanitizado
    ],
    generationConfig: { maxOutputTokens: 2048, temperature: 0.6, topP: 0.90 },
    safetySettings: [
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
    ]
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(geminiPayload),
  });

  if (!res.ok) {
    let errorDetail = "";
    try {
      const errData = await res.json();
      errorDetail = errData.error?.message || JSON.stringify(errData);
    } catch (e) {
      errorDetail = await res.text().catch(() => "Unknown");
    }
    console.error("[AURON ERROR]", res.status, errorDetail);
    throw new Error(`Error de conexión con IA (${res.status}): ${errorDetail}`);
  }

  const data = await res.json();
  const candidate = data?.candidates?.[0];

  if (!candidate) throw new Error("Auron falló en procesar la instrucción.");
  if (candidate.finishReason === "SAFETY") throw new Error("Mensaje bloqueado por filtros de seguridad corporativa.");

  const responseText = candidate.content.parts.map((p: any) => p.text).join("") || "";

  // Guardar en Base de Datos para Historial (Fire-and-forget)
  if (companyId && layerNumber) {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      supabase.from("auron_messages").insert([
        { company_id: companyId, user_id: userData.user.id, layer_number: layerNumber, role: "user", content: prompt, session_id: sessionId ?? null, source: "chat" },
        { company_id: companyId, user_id: userData.user.id, layer_number: layerNumber, role: "model", content: responseText, session_id: sessionId ?? null, source: "chat" }
      ]).then(({ error }) => {
        if (error) console.warn("[auron-chat] No se guardó historial:", error.message);
      });
    }
  }

  return responseText;
}

// ─── Utilidades exportadas ────────────────────────────────────────────────────

export function toGeminiHistory(messages: Array<{ role: "user" | "assistant"; content: string }>): ChatMessage[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export function getRemainingRequests(): number {
  return rateLimiter.remainingRequests();
}
