// src/utils/index.ts
// Utilidades reutilizables para SimplificaME

// ─────────────────────────────────────────────
// 1. FORMATO DE TEXTO
// ─────────────────────────────────────────────

/** Convierte snake_case a texto legible: "problema_central" → "Problema Central" */
export const formatLabel = (field: string): string =>
  field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Formatea números con locale colombiano: 1250.5 → "1.250,5" */
export const formatNumber = (
  value: number,
  decimals: number = 2
): string =>
  value.toLocaleString('es-CO', { maximumFractionDigits: decimals });

/** Sanitiza un string para uso como nombre de archivo */
export const sanitizeFilename = (name: string): string =>
  name
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();

/** Formatea un id numérico con ceros: 1 → "01", 10 → "10" */
export const padId = (id: number, length: number = 2): string =>
  String(id).padStart(length, '0');

// ─────────────────────────────────────────────
// 2. FECHAS
// ─────────────────────────────────────────────

/** Retorna fecha actual en ISO string para Supabase */
export const nowISO = (): string => new Date().toISOString();

/** Formatea fecha para mostrar al usuario */
export const formatDate = (date: Date | string): string =>
  new Date(date).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

// ─────────────────────────────────────────────
// 3. VALIDACIONES
// ─────────────────────────────────────────────

/** Verifica si un string no está vacío */
export const isNotEmpty = (value: unknown): boolean =>
  value !== null &&
  value !== undefined &&
  String(value).trim().length > 0;

/** Cuenta campos llenos en un Record */
export const countFilled = (fields: Record<string, unknown>): number =>
  Object.values(fields).filter(isNotEmpty).length;

/** Calcula porcentaje de completitud (0–100) */
export const calcCompletionPercent = (
  fields: Record<string, unknown>
): number => {
  const total = Object.keys(fields).length;
  if (total === 0) return 0;
  return Math.round((countFilled(fields) / total) * 100);
};

// ─────────────────────────────────────────────
// 4. GUARDS DE ENTORNO
// ─────────────────────────────────────────────

/**
 * Obtiene una variable de entorno Vite y lanza error si no está definida.
 * Úsala en lugar de import.meta.env.VITE_X directamente.
 */
export const requireEnv = (key: string): string => {
  const value = (import.meta.env as Record<string, string>)[key];
  if (!value) {
    throw new Error(`[env] Variable de entorno "${key}" no está definida en .env.local`);
  }
  return value;
};
