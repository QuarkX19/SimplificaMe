-- seed_calidad_sas.sql
-- Inyección del "Tenant Cero" para Arquitectura ME
-- Propietario: Luis Reinaldo Ruiz Sarmiento | calidadysostenibilidad.com SAS

-- ⚠️ IMPORTANTE: Reemplaza '<TU_USER_ID_AQUI>' con tu UUID real de la tabla auth.users
-- Puedes encontrar tu UUID en el panel de Supabase -> Authentication -> Users

DO $$
DECLARE
    v_user_id UUID := '<TU_USER_ID_AQUI>'; -- <-- REEMPLAZA ESTO
    v_company_id UUID;
    v_cycle_id UUID;
BEGIN
    -- 1. Crear la empresa
    INSERT INTO companies (name, nit, sector, plan, afse_score, preferred_lang)
    VALUES (
        'calidadysostenibilidad.com SAS',
        'NIT-CYS-001',
        'Consultoría Estratégica y Software',
        'enterprise',
        10, -- Score inicial para que haya progreso
        'es'
    )
    RETURNING id INTO v_company_id;

    -- 2. Asignar al CEO (Usuario) como Owner y nivel Estratégico
    INSERT INTO company_members (company_id, user_id, role, me_level, preferred_lang, accepted_at)
    VALUES (
        v_company_id,
        v_user_id,
        'owner',
        'estrategico',
        'es',
        NOW()
    );

    -- 3. Crear el Rol ME para visualización del dashboard
    INSERT INTO me_roles (company_id, user_id, me_level, can_view_global)
    VALUES (
        v_company_id,
        v_user_id,
        'estrategico',
        true
    );

    -- 4. Inicializar Perfil ME (Gamificación)
    INSERT INTO me_profile (user_id, contribution_score, streak_days, badges)
    VALUES (
        v_user_id,
        1500, -- Puntos fundacionales
        1,
        '{"founder": true, "architect": true}'::jsonb
    );

    -- 5. Crear el Primer Ciclo AFSE
    INSERT INTO afse_cycles (company_id, cycle_number, status, score, created_by)
    VALUES (
        v_company_id,
        1,
        'active',
        10,
        v_user_id
    )
    RETURNING id INTO v_cycle_id;

    -- 6. Iniciar la Capa 1 (Entender)
    INSERT INTO layer_progress (company_id, cycle_id, user_id, layer_number, layer_code, status, completion_pct, matrix_data)
    VALUES (
        v_company_id,
        v_cycle_id,
        v_user_id,
        1,
        'ENTENDER',
        'in_progress',
        15,
        '{"fields": {"contexto": "Empresa matriz de Arquitectura ME", "objetivo_inmediato": "Implementar Tenant Cero"}}'::jsonb
    );

    RAISE NOTICE '¡Tenant Cero creado exitosamente! ID Empresa: %', v_company_id;
END $$;
