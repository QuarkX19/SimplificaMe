-- ============================================================
-- SimplificaME — Row Level Security Policies
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================
-- IMPORTANTE: Ejecutar en orden. Si ya tienes políticas,
-- elimínalas primero con DROP POLICY IF EXISTS.
-- ============================================================

-- ─── PASO 1: Habilitar RLS en todas las tablas ─────────────

ALTER TABLE companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE afse_cycles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE afse_scores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE layer_progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE auron_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE auron_memory      ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis              ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_afse_mapping  ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_connections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_sync_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue        ENABLE ROW LEVEL SECURITY;

-- ─── FUNCIÓN HELPER: ¿el usuario es miembro de la empresa? ─

CREATE OR REPLACE FUNCTION is_member_of(company_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id    = auth.uid()
    AND   company_id = company_uuid
  );
$$;

-- ¿El usuario tiene rol admin o owner en la empresa?
CREATE OR REPLACE FUNCTION is_admin_of(company_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id    = auth.uid()
    AND   company_id = company_uuid
    AND   role IN ('owner', 'admin')
  );
$$;

-- ─── TABLA: companies ──────────────────────────────────────

-- Un usuario puede ver las empresas donde es miembro
CREATE POLICY "companies_select"
ON companies FOR SELECT
USING (is_member_of(id));

-- Solo owner/admin puede actualizar datos de la empresa
CREATE POLICY "companies_update"
ON companies FOR UPDATE
USING (is_admin_of(id));

-- Cualquier usuario autenticado puede crear una empresa
-- (el trigger/función debe insertarlos como owner en company_members)
CREATE POLICY "companies_insert"
ON companies FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Solo el owner puede eliminar la empresa
CREATE POLICY "companies_delete"
ON companies FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id    = auth.uid()
    AND   company_id = companies.id
    AND   role = 'owner'
  )
);

-- ─── TABLA: company_members ────────────────────────────────

-- Ver miembros de empresas donde perteneces
CREATE POLICY "company_members_select"
ON company_members FOR SELECT
USING (is_member_of(company_id));

-- Solo admin/owner puede agregar miembros
CREATE POLICY "company_members_insert"
ON company_members FOR INSERT
WITH CHECK (is_admin_of(company_id));

-- Solo admin/owner puede actualizar roles
CREATE POLICY "company_members_update"
ON company_members FOR UPDATE
USING (is_admin_of(company_id));

-- Admin/owner puede eliminar miembros (no a sí mismo si es owner)
CREATE POLICY "company_members_delete"
ON company_members FOR DELETE
USING (is_admin_of(company_id));

-- ─── TABLA: afse_cycles ────────────────────────────────────

CREATE POLICY "afse_cycles_select"
ON afse_cycles FOR SELECT
USING (is_member_of(company_id));

CREATE POLICY "afse_cycles_insert"
ON afse_cycles FOR INSERT
WITH CHECK (is_member_of(company_id));

CREATE POLICY "afse_cycles_update"
ON afse_cycles FOR UPDATE
USING (is_member_of(company_id));

CREATE POLICY "afse_cycles_delete"
ON afse_cycles FOR DELETE
USING (is_admin_of(company_id));

-- ─── TABLA: afse_scores ────────────────────────────────────

CREATE POLICY "afse_scores_select"
ON afse_scores FOR SELECT
USING (is_member_of(company_id));

CREATE POLICY "afse_scores_insert"
ON afse_scores FOR INSERT
WITH CHECK (is_member_of(company_id));

CREATE POLICY "afse_scores_update"
ON afse_scores FOR UPDATE
USING (is_member_of(company_id));

-- Nadie elimina scores — son histórico
CREATE POLICY "afse_scores_no_delete"
ON afse_scores FOR DELETE
USING (false);

-- ─── TABLA: layer_progress ─────────────────────────────────

CREATE POLICY "layer_progress_select"
ON layer_progress FOR SELECT
USING (is_member_of(company_id));

CREATE POLICY "layer_progress_insert"
ON layer_progress FOR INSERT
WITH CHECK (is_member_of(company_id));

CREATE POLICY "layer_progress_update"
ON layer_progress FOR UPDATE
USING (is_member_of(company_id));

CREATE POLICY "layer_progress_delete"
ON layer_progress FOR DELETE
USING (is_admin_of(company_id));

-- ─── TABLA: auron_messages ─────────────────────────────────

-- Solo el propio usuario ve sus mensajes (privacidad de conversación)
CREATE POLICY "auron_messages_select"
ON auron_messages FOR SELECT
USING (
  user_id = auth.uid()
  AND is_member_of(company_id)
);

-- Solo la Edge Function (service_role) inserta mensajes
-- Los usuarios no insertan directamente
CREATE POLICY "auron_messages_insert"
ON auron_messages FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND is_member_of(company_id)
);

-- No se editan mensajes
CREATE POLICY "auron_messages_no_update"
ON auron_messages FOR UPDATE
USING (false);

-- Admin puede eliminar historial de su empresa
CREATE POLICY "auron_messages_delete"
ON auron_messages FOR DELETE
USING (is_admin_of(company_id));

-- ─── TABLA: auron_memory ───────────────────────────────────

CREATE POLICY "auron_memory_select"
ON auron_memory FOR SELECT
USING (is_member_of(company_id));

CREATE POLICY "auron_memory_insert"
ON auron_memory FOR INSERT
WITH CHECK (is_member_of(company_id));

CREATE POLICY "auron_memory_update"
ON auron_memory FOR UPDATE
USING (is_member_of(company_id));

CREATE POLICY "auron_memory_delete"
ON auron_memory FOR DELETE
USING (is_admin_of(company_id));

-- ─── TABLA: kpis ───────────────────────────────────────────

CREATE POLICY "kpis_select"
ON kpis FOR SELECT
USING (is_member_of(company_id));

CREATE POLICY "kpis_insert"
ON kpis FOR INSERT
WITH CHECK (is_member_of(company_id));

CREATE POLICY "kpis_update"
ON kpis FOR UPDATE
USING (is_member_of(company_id));

CREATE POLICY "kpis_delete"
ON kpis FOR DELETE
USING (is_admin_of(company_id));

-- ─── TABLA: kpi_afse_mapping ───────────────────────────────
-- Esta tabla es de configuración global — solo lectura para todos

CREATE POLICY "kpi_afse_mapping_select"
ON kpi_afse_mapping FOR SELECT
USING (true); -- tabla pública de referencia

-- Solo superadmin (service_role) inserta/modifica mappings
CREATE POLICY "kpi_afse_mapping_no_insert"
ON kpi_afse_mapping FOR INSERT
WITH CHECK (false);

CREATE POLICY "kpi_afse_mapping_no_update"
ON kpi_afse_mapping FOR UPDATE
USING (false);

-- ─── TABLA: erp_connections ────────────────────────────────

-- Solo admin/owner ve las conexiones ERP (datos sensibles)
CREATE POLICY "erp_connections_select"
ON erp_connections FOR SELECT
USING (is_admin_of(company_id));

CREATE POLICY "erp_connections_insert"
ON erp_connections FOR INSERT
WITH CHECK (is_admin_of(company_id));

CREATE POLICY "erp_connections_update"
ON erp_connections FOR UPDATE
USING (is_admin_of(company_id));

CREATE POLICY "erp_connections_delete"
ON erp_connections FOR DELETE
USING (is_admin_of(company_id));

-- ─── TABLA: erp_sync_log ───────────────────────────────────

CREATE POLICY "erp_sync_log_select"
ON erp_sync_log FOR SELECT
USING (is_member_of(company_id));

-- Solo service_role inserta logs de sync
CREATE POLICY "erp_sync_log_insert"
ON erp_sync_log FOR INSERT
WITH CHECK (is_admin_of(company_id));

CREATE POLICY "erp_sync_log_no_update"
ON erp_sync_log FOR UPDATE
USING (false); -- logs son inmutables

CREATE POLICY "erp_sync_log_delete"
ON erp_sync_log FOR DELETE
USING (is_admin_of(company_id));

-- ─── TABLA: leads ──────────────────────────────────────────

-- Leads son privados por empresa
CREATE POLICY "leads_select"
ON leads FOR SELECT
USING (is_member_of(company_id));

CREATE POLICY "leads_insert"
ON leads FOR INSERT
WITH CHECK (is_member_of(company_id));

CREATE POLICY "leads_update"
ON leads FOR UPDATE
USING (is_member_of(company_id));

CREATE POLICY "leads_delete"
ON leads FOR DELETE
USING (is_admin_of(company_id));

-- ─── TABLA: sync_queue ─────────────────────────────────────

CREATE POLICY "sync_queue_select"
ON sync_queue FOR SELECT
USING (is_member_of(company_id));

CREATE POLICY "sync_queue_insert"
ON sync_queue FOR INSERT
WITH CHECK (is_member_of(company_id));

CREATE POLICY "sync_queue_update"
ON sync_queue FOR UPDATE
USING (is_member_of(company_id));

CREATE POLICY "sync_queue_delete"
ON sync_queue FOR DELETE
USING (is_admin_of(company_id));

-- ─── TRIGGER: Auto-insertar owner en company_members ───────
-- Cuando alguien crea una empresa, se agrega como 'owner' automáticamente

CREATE OR REPLACE FUNCTION handle_new_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO company_members (company_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'owner');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_company_created ON companies;
CREATE TRIGGER on_company_created
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_company();

-- ─── VERIFICACIÓN ──────────────────────────────────────────
-- Ejecuta esto para verificar que RLS está activo:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
