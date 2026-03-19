/**
 * SIMPLIFICAME · Shared Utilities
 * Result monad, logger, constantes globales
 */

// ═══════════════════════════════════════════════════════════════════════════════
// RESULT MONAD — elimina try/catch en cada caller
// ═══════════════════════════════════════════════════════════════════════════════
export type Ok<T>  = { ok: true;  data: T;      error: null  };
export type Err    = { ok: false; data: null;   error: string };
export type Result<T> = Ok<T> | Err;

export function ok<T>(data: T): Ok<T>        { return { ok: true,  data, error: null  }; }
export function err(msg: string): Err         { return { ok: false, data: null, error: msg }; }

export async function safeAsync<T>(
  fn: () => Promise<T>,
  context = 'unknown'
): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error(`[${context}]`, msg);
    return err(msg);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGER — structured, silenciable en prod
// ═══════════════════════════════════════════════════════════════════════════════
const IS_DEV = import.meta.env.DEV;

export const logger = {
  info:  (...a: unknown[]) => IS_DEV && console.info( '[SM]', ...a),
  warn:  (...a: unknown[]) => IS_DEV && console.warn( '[SM]', ...a),
  error: (...a: unknown[]) =>           console.error('[SM]', ...a),
  debug: (...a: unknown[]) => IS_DEV && console.debug('[SM]', ...a),
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
export const TOTAL_LAYERS      = 8;
export const MAX_AFSE_SCORE    = 100;
export const AUTOSAVE_DELAY_MS = 1500;
export const MAX_CHAT_HISTORY  = 150;
export const MAX_CONTEXT_MSGS  = 20;
export const GEMINI_TIMEOUT_MS = 30_000;
export const GEMINI_MAX_TOKENS = 1024;
export const GEMINI_RATE_LIMIT = 30;

export const LAYER_COLORS = [
  '#00ffff', '#00e5ff', '#00ccff', '#0099ff',
  '#0066ff', '#5533ff', '#9900ff', '#cc00ff',
] as const;

export const AFSE_STATUS = {
  ÓPTIMO:    { color: '#00ffff', label: 'ÓPTIMO',    min: 90 },
  ESTABLE:   { color: '#28a745', label: 'ESTABLE',   min: 70 },
  EN_RIESGO: { color: '#eab308', label: 'EN RIESGO', min: 50 },
  CRÍTICO:   { color: '#ef4444', label: 'CRÍTICO',   min: 0  },
} as const;

export function getAfseStatus(score: number) {
  if (score >= 90) return AFSE_STATUS.ÓPTIMO;
  if (score >= 70) return AFSE_STATUS.ESTABLE;
  if (score >= 50) return AFSE_STATUS.EN_RIESGO;
  return AFSE_STATUS.CRÍTICO;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRING HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
export const pad2    = (n: number) => String(n).padStart(2, '0');
export const ts      = ()          => new Date().toLocaleTimeString('es-CO');
export const isoNow  = ()          => new Date().toISOString();
export const clamp   = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));