/**
 * SIMPLIFICAME · ERP Service
 * Conexiones y logs de sincronización
 * Soporta: AS400, SAP, Odoo, Siigo
 */

import { supabase } from '../api/supabase';
import { safeAsync, isoNow, type Result } from '../../lib/utils';

export interface ErpConnection {
  id: string;
  company_id: string;
  erp_type: 'AS400' | 'SAP' | 'Odoo' | 'Siigo';
  host: string | null;
  port: number | null;
  database_name: string | null;
  username: string | null;
  vault_secret_id: string | null;
  iws_endpoint: string | null;
  is_active: boolean;
  last_tested_at: string | null;
  created_at: string;
}

export interface ErpSyncLog {
  id: string;
  company_id: string;
  connection_id: string;
  status: 'success' | 'error' | 'partial';
  records_synced: number | null;
  kpis_updated: number | null;
  error_message: string | null;
  duration_ms: number | null;
  triggered_by: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONEXIONES
// ═══════════════════════════════════════════════════════════════════════════════

export async function getErpConnections(companyId: string): Promise<ErpConnection[]> {
  const { data } = await supabase
    .from('erp_connections')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function getActiveErpConnection(companyId: string): Promise<ErpConnection | null> {
  const { data } = await supabase
    .from('erp_connections')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .maybeSingle();

  return data ?? null;
}

export async function testErpConnection(connectionId: string): Promise<Result<boolean>> {
  return safeAsync(async () => {
    const { error } = await supabase
      .from('erp_connections')
      .update({ last_tested_at: isoNow() })
      .eq('id', connectionId);

    if (error) throw new Error(error.message);
    return true;
  }, 'testErpConnection');
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGS DE SYNC
// ═══════════════════════════════════════════════════════════════════════════════

export async function getRecentSyncLogs(
  companyId: string,
  limit = 20
): Promise<ErpSyncLog[]> {
  const { data } = await supabase
    .from('erp_sync_log')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function logSync(
  companyId: string,
  connectionId: string,
  log: {
    status: ErpSyncLog['status'];
    records_synced?: number;
    kpis_updated?: number;
    error_message?: string;
    duration_ms?: number;
    triggered_by?: string;
  }
): Promise<Result<ErpSyncLog>> {
  return safeAsync(async () => {
    const { data, error } = await supabase
      .from('erp_sync_log')
      .insert({
        company_id:     companyId,
        connection_id:  connectionId,
        status:         log.status,
        records_synced: log.records_synced ?? null,
        kpis_updated:   log.kpis_updated ?? null,
        error_message:  log.error_message ?? null,
        duration_ms:    log.duration_ms ?? null,
        triggered_by:   log.triggered_by ?? 'manual',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }, 'logSync');
}

export async function getSyncStats(companyId: string): Promise<{
  total: number;
  success: number;
  errors: number;
  lastSync: string | null;
}> {
  const { data } = await supabase
    .from('erp_sync_log')
    .select('status, created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (!data || data.length === 0) {
    return { total: 0, success: 0, errors: 0, lastSync: null };
  }

  return {
    total:    data.length,
    success:  data.filter(r => r.status === 'success').length,
    errors:   data.filter(r => r.status === 'error').length,
    lastSync: data[0].created_at,
  };
}