-- migration_roles_profiles_ME.sql
-- Plan Maestro v6.0 - Arquitectura ME
-- 1. Agregar preferred_lang a company_members
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS preferred_lang VARCHAR(10) DEFAULT 'es';
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS me_level VARCHAR(20) DEFAULT 'operativo';

-- 2. me_roles
CREATE TABLE IF NOT EXISTS me_roles (
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    me_level VARCHAR(20) NOT NULL, -- estrategico, tactico, operativo
    assigned_layers INT[] DEFAULT '{}',
    can_view_global BOOLEAN DEFAULT false,
    PRIMARY KEY (company_id, user_id)
);

-- 3. me_profile
CREATE TABLE IF NOT EXISTS me_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    contribution_score INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    badges JSONB DEFAULT '{}',
    total_actions INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. me_contributions
CREATE TABLE IF NOT EXISTS me_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    layer INT NOT NULL,
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. me_layer_assignments
CREATE TABLE IF NOT EXISTS me_layer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    layer INT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estructura Organizacional L1-L4

-- 6. me_processes
CREATE TABLE IF NOT EXISTS me_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layer INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. me_positions
CREATE TABLE IF NOT EXISTS me_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    process_id UUID REFERENCES me_processes(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    layer INT DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. me_org_chart
CREATE TABLE IF NOT EXISTS me_org_chart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    parent_position_id UUID REFERENCES me_positions(id) ON DELETE CASCADE,
    child_position_id UUID REFERENCES me_positions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE me_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_layer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_org_chart ENABLE ROW LEVEL SECURITY;

-- Politicas basicas (Ajustar segun requerimientos especificos de tenant)
CREATE POLICY "Users can view their own profile" ON me_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view roles based on user_id" ON me_roles FOR SELECT USING (auth.uid() = user_id);
