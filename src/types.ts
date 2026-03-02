// src/types.ts
import { Layer } from './core/methodology/methodology.types';
export type { UserRole as Persona } from './core/chat/chat.context'; // ✅ sin duplicar

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────
export enum LayerStatus {
  OK       = 'OK',
  ALERT    = 'ALERT',
  CRITICAL = 'CRITICAL',
}

// ─────────────────────────────────────────────
// AUDITORÍA
// ─────────────────────────────────────────────
export interface AuditoriaData {
  /** Porcentaje de cumplimiento: 0 a 100 */
  cumplimiento: number;
  proyeccion: string;
  alertas: string[];
}

// ─────────────────────────────────────────────
// UI
// ─────────────────────────────────────────────
export interface LayerNodeProps {
  layerId: number;        // ✅ trazabilidad
  title: string;
  status: LayerStatus;
  value: string;
  unit?: string;          // ✅ consistente con KpiCard
}

// ─────────────────────────────────────────────
// CHAT / AURON
// ─────────────────────────────────────────────

/** Roles visibles en el chat — 'system' se excluye del render */
export type ChatRole = 'user' | 'auron';

export interface InsightMessage {
  role: ChatRole;         // ✅ sin 'system'
  text: string;
  timestamp: string;      // IS