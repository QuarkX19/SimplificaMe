-- Desbloqueo de Políticas RLS para SaaS Multi-Tenant (Onboarding Autónomo)
-- Ejecuta este script en el SQL Editor de Supabase para permitir que los
-- nuevos usuarios registrados puedan crear su propia "Empresa/Entorno".

-- 1. Permitir a usuarios autenticados crear una Empresa
CREATE POLICY "Permitir crear empresas" 
ON public.companies 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 2. Permitir a usuarios autenticados autovincularse como 'owner' de su empresa
CREATE POLICY "Permitir crear vinculación" 
ON public.company_members 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Permitir inicializar el primer ciclo AFSE
CREATE POLICY "Permitir inicializar AFSE" 
ON public.afse_cycles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);
